# Alpine Wave roadmap

Target: October 24, 2026. Dates are delivery targets, not measured capacity or sales promises.

## Direction established

- [x] Choose winter ski/snowboard rental and retail as the first demo segment.

- [x] Include our company website and our own web/telephone bots in core delivery.

- [x] Document shared infrastructure with separate business configurations as the proposed approach.

- [x] Define staged delivery and evidence requirements.

- [x] Finalize Givingli-inspired editorial website structure (`mockup/alpine-wave-givingli.html`) with interactive spider map, core channels showcase, and walkthrough video.

- [x] Build local Next.js company website (`website/`) with automated tests passing (49 checks).

- [x] Finalize Alpine Wave v4 handover with Choice 2 Okanagan coral palette, all channel buttons made interactive, cinema frame primed for talkover, and `/api/chat` integration seam.

- [x] Build and verify dedicated synthetic ski & snowboard showcase V2 ("Everything in the Mountains") with Mountain Conditions HUD, 6 gear packages, category filter tabs, live rate calculator, and DID `(236) 205-7030` phone simulator.

- [x] Define Tier 2 7-day shadow trial specification (staff-first dual recording, missed-call bot failover, PCI staff pause button, day-7 impact reporting).

- [x] Deploy self-contained public demo suite to GitHub Pages (`docs/`).

## Build and verify

| Target | Deliverable | Evidence required |
| --- | --- | --- |
| Oct 1 | Website structure, reviewed facts and conversation cases | Dated facts; stale/unknown flags; labelled synthetic fixtures; v4 handover & ski shop V2 complete |
| Oct 5 | Company website and first chat journey | Browser-tested answer, follow-up, unknown and handoff; keyboard access |
| Oct 9 | Own inbound telephone bot | Real authorized call; interruption, silence and failure handling |
| Oct 14 | Enquiry demonstration and staff summary | Fake data first; durable receipt before receipt claims; live delivery only after tested setup |
| Oct 20 | Deployed company site/bots and separate shop demo | Hosted page and inbound number; isolated configurations; reproducible evaluation |
| Oct 24 | Hardening and presentation | Independent review, usage controls, fallback/shutdown and clear limitations |

Website structure exploration and initial company chat cases are implemented locally; formal milestone sign-off awaits end-to-end browser review and live carrier integration. Provider-neutral work continues while exact integration costs and configuration are resolved.

## Evaluation plan

Prepare 40 labelled conversation cases covering rental/policy, retail, safety and ambiguity/failure. Proposed threshold: at least 90% overall, with every included safety, unknown-stock and false-booking case handled correctly and no invented prices. These are test thresholds, not universal guarantees.

For phone, prepare 20 varied calls; proposed target is 17 supported tasks completed, median audible response gap below 1.5 seconds, and reporting of p95 and failures. These results have not been measured. Critical safety or false-confirmation failures block demonstration.

## Deferred

Live stock integrations, completed bookings, payments, large dashboards, summer expansion and unrelated AI-visibility products. A synthetic enquiry demonstration does not establish real lead delivery. No customer relationship or commercial result is claimed.
