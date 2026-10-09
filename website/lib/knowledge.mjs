// Curated company facts & Jev guardrail knowledge.
// Loaded from the unified single source of truth: rules_and_knowledge.json
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('./rules_and_knowledge.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);

export const company = data.company_profile;
export const questions = data.company_faq;
export const extraAnswers = data.company_extra_answers;
export const businessInfo = data.business_info;
export const escalationRules = data.escalation_rules;
export const refusalRules = data.refusal_rules;

export const byId = Object.fromEntries(questions.map(q => [q.id, q]));
