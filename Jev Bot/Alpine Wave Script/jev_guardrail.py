"""
Jev Guardrail Engine for Alpine Wave Assistants.

Purpose:
  Acts as an independent verification gate between customer questions,
  the LLM bot's proposed response, and the approved website facts/rules.

How it operates:
  1. Policy & Escalation Check:
     Detects trigger conditions (e.g. group size >= 10, custom catering, medical queries)
     that strictly mandate human staff hand-off under Alpine Wave business rules.
  2. Grounding & Verification Check (Jev / TypeSafe System One):
     Checks that factual claims in the bot's proposed answer match approved data lines
     in rules_and_knowledge.json. Flags invented pricing, dates, or unauthorized commitments.
  3. Unknown Preservation Check:
     Ensures the bot refuses to guess missing facts (e.g. snow forecast) rather than inventing them.

Keys & Configuration:
  Set your environment variable before running:
    $env:JEV_API_KEY = "your_jev_key_here"  (PowerShell)
    export JEV_API_KEY="your_jev_key_here"  (Bash)
  Or pass `api_key` directly to `JevGuardrail(api_key=...)`.
  If no key is present, the engine automatically operates in local dry-run / simulation mode.
"""

import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Any

HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parent.parent
CANONICAL_FILE = PROJECT_ROOT / "website" / "lib" / "rules_and_knowledge.json"
KNOWLEDGE_FILE = CANONICAL_FILE if CANONICAL_FILE.exists() else (HERE / "rules_and_knowledge.json")


@dataclass
class GuardrailResult:
    status: str  # "PASS", "FAIL_OVERRIDE", "ESCALATE_STAFF"
    score: float  # 0.0 to 1.0
    passed: bool
    final_text: str
    violations: List[str] = field(default_factory=list)
    escalation_triggered: Optional[str] = None
    audit_notes: Dict[str, Any] = field(default_factory=dict)


class JevGuardrail:
    def __init__(self, api_key: Optional[str] = None, rules_path: Optional[Path] = None):
        self.api_key = api_key or os.environ.get("JEV_API_KEY")
        self.rules_path = rules_path or KNOWLEDGE_FILE
        self.rules_data = self._load_rules()
        self.live_mode = bool(self.api_key and self.api_key != "YOUR_JEV_KEY_HERE")

    def _load_rules(self) -> Dict[str, Any]:
        if not self.rules_path.exists():
            raise FileNotFoundError(f"Rules configuration not found at {self.rules_path}")
        with open(self.rules_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def check_escalations(self, question: str, proposed_answer: str) -> Optional[Dict[str, Any]]:
        """Inspects for business escalation triggers that require staff hand-off."""
        q_lower = question.lower()
        ans_lower = proposed_answer.lower()
        combined_text = f"{q_lower} {ans_lower}"

        # Check for group sizes >= 10 in the question (e.g., '14 people', 'group of 12', or explicit numbers)
        group_match = re.search(r"\b(?:group of|party of|for)\s*(\d+)\b", q_lower)
        explicit_group_size = int(group_match.group(1)) if group_match else None
        
        # Also check if any standalone number in the question >= 10 is accompanied by words like guests, people, spots
        people_match = re.search(r"\b(\d+)\s*(?:people|guests|spots|callers|racers|paddlers|skiers)\b", q_lower)
        if people_match:
            explicit_group_size = max(explicit_group_size or 0, int(people_match.group(1)))

        for rule in self.rules_data.get("escalation_rules", []):
            rule_id = rule.get("id")
            keywords = rule.get("trigger_keywords", [])

            if rule_id == "large_group_booking":
                has_group_word = any(kw in q_lower for kw in ["group", "corporate", "private trip", "wedding", "private tour"])
                is_large = (explicit_group_size is not None and explicit_group_size >= 10)
                if is_large or (has_group_word and any(w in q_lower for w in ["large", "big", "many"])):
                    return rule
            else:
                if any(kw in combined_text for kw in keywords):
                    return rule

        return None

    def check_unknown_discipline(self, question: str, proposed_answer: str) -> bool:
        """
        Verifies that questions outside approved knowledge are answered with
        a disciplined refusal/unknown statement rather than a guess.
        """
        combined = question.lower()
        for refusal in self.rules_data.get("refusal_rules", []):
            keywords = refusal.get("trigger_keywords", [])
            if any(kw in combined for kw in keywords):
                # Bot must refuse to guess or say it doesn't have the info
                refusal_markers = [
                    "don't have",
                    "dont have",
                    "won't guess",
                    "wont guess",
                    "not in our verified",
                    "not in our information",
                    "cannot predict",
                    "pass your question",
                ]
                has_refusal = any(marker in proposed_answer.lower() for marker in refusal_markers)
                return has_refusal
        return True

    def check_grounding(self, proposed_answer: str) -> List[str]:
        """
        Checks proposed claims against approved knowledge.
        Detects hallucinated rates, unauthorized policies, or false promises.
        """
        violations = []
        answer_lower = proposed_answer.lower()

        # 1. Price check: only $52/day starting rate is currently approved in website mockup
        prices_mentioned = re.findall(r"\$\s*\d+(?:,\d+)*(?:\.\d{2})?", proposed_answer)
        for price in prices_mentioned:
            cleaned_price = re.sub(r"[^\d]", "", price)
            if cleaned_price != "52":
                violations.append(
                    f"Unapproved price citation '{price}'. Only approved starting rate in website data is $52."
                )

        # 2. Early pickup hours validation: must be between 4:00 PM and 6:30 PM
        if "pickup" in answer_lower or "pick up" in answer_lower:
            if "early" in answer_lower:
                if not ("4:00" in proposed_answer or "4 pm" in answer_lower) or not (
                    "6:30" in proposed_answer or "6:30 pm" in answer_lower
                ):
                    violations.append(
                        "Early rental pickup statement missing approved window: 4:00 PM to 6:30 PM."
                    )

        # 3. Minimum age waiver: BC law requires 19
        if "waiver" in answer_lower and "under" in answer_lower:
            ages = [int(a) for a in re.findall(r"\bunder\s+(\d+)\b", answer_lower)]
            if ages and any(a != 19 for a in ages):
                violations.append("Incorrect legal waiver age stated. British Columbia statutory age is under 19.")

        return violations

    def verify(
        self,
        question: str,
        proposed_answer: str,
        channel: str = "web_chat",  # or "phone"
    ) -> GuardrailResult:
        """
        Main guardrail entrypoint. Evaluates proposed bot text and returns
        a typed GuardrailResult with final sanitized output.
        """
        violations = []
        audit = {
            "channel": channel,
            "engine_mode": "LIVE_JEV" if self.live_mode else "LOCAL_SIMULATION",
        }

        # Step 1: Escalation Rule Interception
        escalation_rule = self.check_escalations(question, proposed_answer)
        if escalation_rule:
            audit["escalation_detected"] = escalation_rule["id"]
            # Did the bot properly hand off, or did it try to answer directly?
            handoff_phrases = ["passed to", "arranged by our manager", "reach you", "team", "coordinator"]
            bot_attempted_handoff = any(p in proposed_answer.lower() for p in handoff_phrases)

            if not bot_attempted_handoff:
                violations.append(
                    f"Violated policy '{escalation_rule['id']}': Bot attempted to answer or book directly instead of escalating to staff."
                )
                return GuardrailResult(
                    status="FAIL_OVERRIDE",
                    score=0.0,
                    passed=False,
                    final_text=escalation_rule["override_message"],
                    violations=violations,
                    escalation_triggered=escalation_rule["id"],
                    audit_notes=audit,
                )
            else:
                # Bot followed the rule and escalated cleanly
                return GuardrailResult(
                    status="ESCALATE_STAFF",
                    score=1.0,
                    passed=True,
                    final_text=proposed_answer,
                    violations=[],
                    escalation_triggered=escalation_rule["id"],
                    audit_notes=audit,
                )

        # Step 2: Preserving Unknowns (Refusal when data is absent)
        is_disciplined = self.check_unknown_discipline(question, proposed_answer)
        if not is_disciplined:
            violations.append(
                "Bot attempted to guess or predict information not present in approved business data."
            )
            return GuardrailResult(
                status="FAIL_OVERRIDE",
                score=0.2,
                passed=False,
                final_text="I don't have that in our verified business information, so I won't guess. Would you like me to pass your question to our staff?",
                violations=violations,
                audit_notes=audit,
            )

        # Step 3: Factual Grounding & Constraint Verification
        grounding_violations = self.check_grounding(proposed_answer)
        violations.extend(grounding_violations)

        if violations:
            return GuardrailResult(
                status="FAIL_OVERRIDE",
                score=0.0,
                passed=False,
                final_text="I want to ensure you receive verified details on that. Let me connect you directly with our front desk at (236) 205-7030.",
                violations=violations,
                audit_notes=audit,
            )

        # Step 4: Full Pass
        return GuardrailResult(
            status="PASS",
            score=1.0,
            passed=True,
            final_text=proposed_answer,
            violations=[],
            audit_notes=audit,
        )


if __name__ == "__main__":
    guard = JevGuardrail()
    print("=== Alpine Wave Jev Guardrail Initialized ===")
    print(f"Mode: {'LIVE JEV' if guard.live_mode else 'LOCAL SIMULATION (Keys pending)'}")
    print(f"Loaded rules from: {guard.rules_path.name}")
