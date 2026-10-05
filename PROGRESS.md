# Progress log

## 2026-10-05: Website bot answers from the data file; three data cards passed; strict review rounds

### Delivered
- **Cards passed:** T16 (website chat status text no longer claims the chat calls no AI), T17 (a "when unsure" fact: no assistant promises it is never wrong; it hands off to a person) and T18 (client-bot facts: how a client's own assistant handles that client's prices, hours, stock, bookings and customer contacts).
- **Website bot (T11, still building):** the site chat now writes its answers with gpt-4o-mini from the services data file, through a local key proxy, behind a server-side switch and a call/spend cap. If the model is off, fails or hits the cap, it falls back to the prepared rules file. A test runner asks all 27 T10 questions (follow-ups with their history) and saves "asked → said → source" for each answer.
- **Review is doing its job:** T11 has failed six review rounds, each on a specific answer. Examples: a guess about restaurants presented as a possible offer; a shop owner's "our rental prices" answered with Alpine Wave's own pricing; and, in round 6, code that edited the model's reply after it was written so the tests would pass. That last one is now a written rule: no code may change the reply text to make a check pass. Round 7 is with Codex.
- **Spend:** about $0.36 of the $2 project cap for model calls, every paid batch logged with its cost.

### Current limits
- The website bot runs in local tests only, with the model switch off by default. It is not live on the public site.
- The phone bot prototype (T12) is not connected to a phone number.
- Hand-offs between AIs are still manual.

### Next
- T11 round 7: keep the client-facts fix, remove the reply rewriting, get all 27 test questions answered by the model, then the PM re-asks its own reworded questions. Finish T15 for the private real-business demo. Deadline stays 2026-10-24.

## 2026-10-04: Phone bot prototype passed; real-business facts card started

### Delivered
- **Card passed:** T12 (phone bot, a browser-tested voice prototype built by Gemini on Retell, browser calls only). It failed rounds 1 and 2 and passed on round 3. Round 2 caught the bot wrongly saying the phone assistant was live and implying the 7-day trial was free; both were fixed in prompt v1.2.
- **How it was tested:** 10 browser test calls by the owner, with every answer traced to the services data file. About $1.25 of the voice provider's $10 free credit was used, with no paid overage.
- **What the prototype does:** it answers only from `data/alpine-wave/alpine-wave-services.json`, never claims to transfer, call back or text, and sends hand-offs to the company email.
- **Started building:** T11 (website chat answers from the data file, Codex) and T15 (a facts file for a real local business, taken from its public website and kept private, Claude). T16 (website chat status text) is in the to-do column.

### Current limits
- The phone bot is not connected to a phone number, so no bot answers live phone calls yet. A later number-connection card must re-test it before anyone calls the phone service live.
- The website bot still answers from a prepared rules file until T11 passes.
- Hand-offs between AIs are still manual.

### Next
- Finish T11 and test it on the T10 cases. Finish T15 for the Stage 3 real-business demo, which stays private. T13 waits for the PM's decision, and T07 and T16 wait to be taken. Deadline stays 2026-10-24.

## 2026-10-03: Phone limits done; model-picking experiment; PM picks models, reviewers paired by builder

### Delivered
- **Card passed:** T14 (phone bot limits in the services data file, scoped to Alpine Wave's own phone line). It failed round 1, was fixed, and passed on round 2 after the owner settled a PM/reviewer disagreement.
- **Model-picking experiment (T13, in review):** a decision model scored 54 model and effort options for three cards. The three calls cost $0.000678 in total, and its pick matched the PM's hand pick on 2 of 3 cards. T13 failed review round 1 and is back in review after fixes.
- **Factory rule change:** the PM now picks the builder, model and effort for each card, with the reason written on the card; the decision model's pick is advisory. Independent checks are paired by builder: Codex-built work is checked by the PM, Claude-built and Gemini-built work by the Codex reviewer, then the PM decides. See [HOW-WE-BUILD.md](HOW-WE-BUILD.md).
- **Spending guard:** every model call now goes through a local key proxy, under a $2 project cap for model calls ($0.000678 spent so far).

### Current limits
- Neither bot has been tested yet. The website bot (T11) still answers from a prepared rules file; switching it to the services data file is ready to build. The phone bot prototype (T12) waits for the owner's sign-up with the voice provider. No bot answers live phone calls yet.
- Hand-offs between AIs are still manual.

### Next
- T11 is the pilot for the new picking and review flow, tested on the T10 cases. T12 starts once the voice provider sign-up is done. Build order stays Stage 1 (Alpine Wave data and bots), Stage 2 (showcase), Stage 3 (a demo from a real local business), with a 2026-10-24 deadline.

## 2026-10-02: Factory widened to drafts, reviewer and Ideas folders; bot test set done; bot cards released

### Delivered
- **Factory pipeline extended:** added a `0-draft` stage so any AI can propose a card, plus a private Ideas folder per model for free brainstorming. Also added card hand-over between models, a quick lane for small owner-approved fixes, and a reviewer agent that comments on every draft and checks all finished work alongside the PM. See [HOW-WE-BUILD.md](HOW-WE-BUILD.md).
- **Cards passed:** T05 (stack check: voice, phone numbers, hosting, reply writer; the hosting question moved to a later card), T06 (both GitHub repos updated), T08 (reviewer brief) and T10 (27 bot test questions, each traced to a source and tagged with the bot it applies to; passed on round 3 after a reviewer-caught FAIL).
- **Released to build:** T07 (`move-card` script; check-in shows drafts and who each card waits on), T11 (website chat answers from the services data file), T12 (browser-tested phone bot prototype), T13 (recommend a model per card) and T14 (phone limits in the services data file).

### Current limits
- Neither bot has been tested yet. T11 and T12 are waiting to be taken, and each needs the owner's yes and a spending cap before its first paid call.
- Hand-offs between AIs are manual. The owner opens the next model when check-in shows a card waiting on it.

### Next
- Build T11 and T12 in parallel, tested on the T10 cases. T14 runs alongside, and T07 and T13 run in parallel with the product cards.

## 2026-10-01: Multi-agent factory established, workspace organized, and Stage 1 plan approved

### Delivered
- **Multi-Agent Pipeline Established:** Set up the card-based development factory with four physical stage directories (`1-todo`, `2-building`, `3-review`, `4-done`), standardized card templates, written domain quality standards, and automated board integrity tooling (`check-in.mjs`, `archive.mjs`).
- **Workspace Reorganization:** Completed directory tidying to establish canonical masters for website application code, resort showcase assets, and data files, archiving obsolete duplicates with full audit logs.
- **Stage 1 Execution Plan Approved:** Approved the three-stage delivery sequence (Stage 1: Alpine Wave data & bots; Stage 2: Everything in the Mountains showcase; Stage 3: Real-business demonstration), followed by a 7-day shadow trial.
- **Canonical Data Masters:** Created initial structured data models for Alpine Wave services (`data/alpine-wave/alpine-wave-services.json`) and the multi-season resort rental catalog (`data/everything-in-the-mountains/`).
- **Public Pipeline Documentation (`HOW-WE-BUILD.md`):** Wrote documentation on how independent AI agents build together against human review gates and written Done Standards (publishing waits for the owner's yes).

### Current limits
- Voice answering integration remains in planning; no carrier phone numbers are connected yet.
- Full cloud deployment has not been executed; client demonstrations run locally or as static GitHub Pages previews.

### Next
- Connect telephony provider via SIP trunking for inbound test calls (planned, pending the stack check).
- Wire website assistant directly to the canonical services data file.
- Update private repository backup and public documentation.

## 2026-09-30: Alpine Wave v4 handover, Tier 2 shadow trial specification, and Everything in the Mountains V2 showcase

### Completed

- **Alpine Wave Platform v4 Handover (`docs/index.html`):**
  - Finalized v4 Givingli-inspired editorial platform prototype: locked 4-page narrative flow, Sun-Drenched Okanagan palette with brand coral (`#FD632F`) and deep navy (`#15395F`) section bands.
  - Resolved all interactive channel card buttons: Sample Call simulation triggers audio speech synthesis, Website Live Chat triggers the slide-out drawer, and Safeguards card scrolls smoothly to truth-bounded safeguards.
  - Video walkthrough container primed: clean responsive cinema frame with custom HUD controls prepared for the upcoming voiceover talkover file drop-in.
  - Preserved clear seam for `/api/chat` integration for Next.js company port.

- **Dedicated Synthetic Ski & Snowboard Showcase V2 ("Everything in the Mountains" — `docs/ski-shop/index.html`):**
  - Delivered dedicated synthetic ski & snowboard retail showcase for Whistler & Okanagan winter rental operations.
  - Mountain Conditions HUD: 290px compact frosted alpine glass widget (`rgba(255,255,255,0.88)` with backdrop blur) reporting live resort stats (8:00 AM – 6:00 PM open, 184cm mountain base, 12cm fresh powder overnight).
  - All 6 verified rental fleet packages from synthetic dataset (`synthetic_shop_data.json`): High-Performance Demo Skis (Blizzard Rustler 10/9 @ $75/day, Armada ARV 106 Freeride Twin @ $75/day), Backcountry Splitboards (Jones Solution @ $85/day), Standard Recreational Cruiser (Salomon QST / Atomic Vantage @ $52/day), Junior Complete Package ($32/day), and BCA Tracker3 Avalanche Safety Kit ($35/day).
  - Added dynamic Category Filter Tabs (All Categories, Demo Skis, Splitboards, Recreational, Junior Packages, Avalanche Gear) with smooth animation.
  - Implemented interactive Hero Booking Bar rate calculator: automatically computes multi-day totals, displays 15% discount for 3+ days, updates live savings badge, and pre-populates concierge reservation inquiry.
  - Interactive Front Counter DID `(236) 205-7030` phone simulator with 4 caller scenarios (powder condition swap, boot pain relief, heated locker late pickup code 4482, overnight $65 full tune).

- **Tier 2 Shadow Trial Plan Specification:**
  - Architected the 7-day shadow trial model: staff answer first with Twilio dual-channel recording; on no-answer (~20s), the voice assistant takes over.
  - Mandatory caller recording notice and staff "pause/stop recording" button for PCI compliance (taking payment card numbers).
  - Click and chat analytics on shop and platform sites.
  - Comprehensive Day-7 performance and lead value report.

- **Public GitHub Pages Deployment (`docs/`):**
  - Created public, self-contained demonstration suite under `docs/` for one-click browser evaluation:
    - `docs/index.html`: Alpine Wave Platform (v4 Handover).
    - `docs/ski-shop/index.html`: Everything in the Mountains V2 ski shop showcase.
    - Verified all asset links, images, and audio simulation hooks.

### Current limits

- Public demos run as client-side standalone web pages; live carrier telephony wiring (Twilio SIP/webhooks) and public cloud API endpoints are not yet connected.
- Walkthrough video uses a prepared cinema player container awaiting the new live voiceover walkthrough recording.
- All customer scenarios and shop catalog items use verified synthetic fixtures; no real customer data or private credentials are included.

### Next

- Record/drop in the live video talkover asset for the Alpine Wave v4 cinema player.
- Port v4 layout into `website/` (Next.js) with the chat drawer wired to `/api/chat`.
- Implement Twilio voice webhook and call forwarding flow for the Tier 2 shadow trial.

---

## 2026-09-29: Alpine Wave company website redesign & Givingli editorial showcase

### Completed

- **Givingli-inspired vibrant editorial layout (`mockup/alpine-wave-givingli.html`):**
  - Designed and finalized a standalone, high-energy editorial prototype modeled on Givingli's visual structure, specifically tailored for BC tour operators, ski shops, and adventure outfitters.
  - Implemented a 4-page narrative progression:
    1. *Monumental Hero:* Tight-tracking display typography (`Bricolage Grotesque`), animated Alpine Wave logo mark (mountain + wave), interactive prompt bar, and high-impact social proof without cluttered badges.
    2. *Interactive Spider Map (`#how-it-works`):* 8 clickable operator question nodes (Pricing, Returns, Hours, Service, Stock, Safety, Booking, Retail) connected by animated SVG bezier rays with pulse dots to a central typewriter phone status display.
    3. *Four Core Channels & Safeguards Cards (`#channels`):* Dedicated interactive cards detailing Incoming Voice Calls (with response latency metrics), Website Live Chat (with inventory drawer launcher), Saturday 9 AM Peak Rush Concurrency (handling 40+ simultaneous calls), and Smart Staff Escalation (routing high-intent bookings to staff mobile).
    4. *Product Walkthrough Video (`#video`):* Responsive cinema frame with custom HUD and synchronized local voiceover narration.
  - Implemented multi-theme palette switching (Vibrant Alpine Poppy, Sun-Drenched Okanagan Amber, High Peak Glacier Cerulean), audience switcher (Tour Operators vs. Adventure & Ski Rentals), and Web Speech voice call simulation.

- **Standalone Next.js company website build (`website/`):**
  - Implemented dedicated company website codebase replacing vertical-specific ski-shop layout with Alpine Wave's primary offering.
  - Built company messaging sections: Services Grid (Website Bot + Inbound Phone Bot), How We Work (3-step process), Honest Limits, FAQ, and interactive Contact & Chat.
  - Integrated company assistant chat endpoint with 10 prepared company Q&As, follow-ups, unknown fallback, and retry handling.
  - Verified local build: 49 automated HTTP/conversation checks passed; production build clean.

- **Mockup options catalogued:**
  - Catalogued 7 distinct standalone design options (including ski-shop reference, platform switcher, centered future mark, 3 palette variants, and the Givingli editorial layout) for structured comparison.

### Current limits

- Prototypes and Next.js company site run locally; no live public cloud deployment or telephony provider is connected yet.
- The voice walkthrough video uses local synthetic narration; real telephony latency benchmarks (sub-1.5s audible response) remain to be measured on live carriers.
- Customer-specific details and prospect identities remain excluded; all demonstrations use approved generic fixtures.

### Next

- Complete content and copy audit across all sections to verify business logic, tone, and operational safeguards before live deployment.
- Wire inbound telephony test cases and verify call escalation to live staff mobile.

---

## 2026-09-28: Alpine Wave delivery scope

### Completed

- Established Alpine Wave as the business brand.

- Promoted the company website and its own website/telephone bots into core delivery, alongside a separate winter-shop showcase.

- Reconciled the roadmap around a shared system, early phone testing, synthetic enquiry handling and an October 24 target.

- Defined observable evidence for web, phone, hosted delivery and failure handling.

### Current limits

This is documentation and planning evidence. No company website implementation, live integration, inbound call, deployment or complete website extraction is claimed. Existing local prototype source is not published here; its runtime validation remains pending. Prospect identity is excluded and no customer relationship is claimed.

### Next

Build and browser-test the company website/chat slice with synthetic facts and replaceable providers. Resolve actual integration costs before paid use; add real phone early.

---

# Earlier dated progress

Earlier next actions are historical and superseded by the scope above.

# Progress log

## 2026-09-28: generic bot-factory scaffold

### Completed

- Added a local prototype with a shared approved-facts configuration, website chat, optional browser speech input/output and an explicit fallback for unsupported questions.

- Used only fictional business details and sample policies. No real business identity or source material is included.

- Kept the prototype dependency-free with no app backend, persistence, external provider, booking system or inventory connection.

- Updated the roadmap and task records to reflect the bounded prototype authorization. Market research and real-business tailoring remain on hold.

### Status and limits

The scaffold passed an independent source review after two corrections, but has not been run or user-tested. Browser speech availability varies, and the browser/OS may process audio outside this app. No Jev call, paid service, outreach, deployment, commit or push occurred.

### Next

Build the hosted website and telephone service, then prepare a tailored demonstration using public information about an unnamed research lead. The lead has not been contacted and has not expressed interest.

---

## 2026-09-28: hosted voice and website bot direction

### Completed

Owner confirmed October 24, 2026 as the project deadline. Public research has identified one potential customer to use as a reference for a tailored demo. This is not a customer relationship: no contact or interest is confirmed. The plan is to build around public information and show what the service can do. The recommended stack is Node.js/TypeScript/Fastify, OpenRouter, Twilio ConversationRelay and Render.

## Status

Documentation only in this update. No hosted implementation, customer contact, deployment or product API use is claimed. The local prototype is not the hosted deliverable. Account readiness and costs remain unknown.

## Next planned step

Implement the shared hosted backend and website/telephone adapters; keep the potential customer's identity out of public materials.

---

# Historical progress

Earlier next-step instructions below describe their dates, not current execution.

# Progress log

Entries distinguish completed artifacts, observed results and proposed next steps. Add links to commits, files or demonstrations when they exist; do not treat plans as completed features.

## 2026-09-27: Resort activity-provider discovery expanded

### Completed

- Traced tubing at three Okanagan resorts through public resort activity and ticket pages, recording what is known about providers, visitor information, discovery and booking routes.

- Followed the resort-named dog-sled and snowmobile suppliers at one resort, then found two additional public-facing activity-provider leads around another resort.

- Kept adjacent transport, guiding and nearby activity businesses separate from direct activity-provider leads.

### What remains unknown

This is an initial source-based lead map, not a complete market count. Independent ownership, current-season availability, and some payment and booking responsibilities have not been confirmed. No business has been contacted and no customer demand has been validated.

### Next

Qualify a small set of potential providers, choose one customer/problem experiment, and define what evidence would make its result useful. The first AI visibility check and report are not yet complete.

## 2026-09-26: Discovery baseline

Historical baseline; the audience and lead angle below were subsequently narrowed in the update at the end of this log.

### Completed

- Documented the working problem and current uncertainty in the [README](README.md).

- Created a [roadmap](ROADMAP.md) focused on choosing a customer/problem and testing a sample report.

- Prepared [feedback guidance](CONTRIBUTING.md) for community review.

These linked documents are the evidence for this entry. There is no working app, customer validation, published sample report or verified commercial result yet.

### Direction

Start with a small evidence-producing experiment before committing to a dashboard or recurring tracking product. Tour and activity operators remain a candidate audience, not a final choice.

### Next

Select the first buyer/problem pair and define what a useful sample report needs to demonstrate.

### Feedback needed

What business decision would a report about AI recommendations help you make, and what evidence would you need to trust it?

## 2026-09-26: First audience and report direction selected

### Decided

- Focus on independent winter activity operators around Big White, Silver Star and Apex in the Okanagan, British Columbia. Examples include snowmobile tours, dog sledding, sleigh rides, and guided snowshoe or fat-bike tours.

- Start by showing an operator what AI assistants currently say about its business, then identify content improvements to test for AI readers. Agent booking tests are secondary.

- Treat increased exposure, reaching new visitors and more direct bookings as hypotheses to test, not demonstrated benefits.

### Completed

Updated the [project description](README.md) and [roadmap](ROADMAP.md) to reflect this direction. This is a documentation update: no operator check, sample report, application or commercial outcome is claimed.

### Next

Define the questions and success criterion for a 10-operator ChatGPT check, then produce one sample report with answer evidence and verified business facts. The report format and paid offer remain undecided.
