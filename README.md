# Alpine Wave

Website and telephone assistants for tourism, rental, and activity businesses that operate all year round.

Repository name `ai-visibility-tracker` is retained from earlier project discovery.

---

## What Alpine Wave Is

Alpine Wave builds grounded AI assistants for independent tourism businesses—such as ski & snowboard rental shops, tour operators, and outdoor outfitters. 

Tourism businesses face heavy inquiry spikes during morning gear pickups, weather changes, and seasonal transitions. Alpine Wave provides:
1. **Website Chat Assistant:** Answers visitor questions on pricing, gear selection, packages, and seasonal hours directly from structured business data.
2. **Inbound Phone Assistant:** Answers voice calls, assists with common inquiries, routes complex booking requests to staff, and takes messages when staff are busy on the counter.

Design goal: assistants answer only from canonical business facts, so they never make inaccurate commitments or invent prices. The phone bot prototype (T12) passed its check on 2026-10-04 in browser test calls. The website bot (T11) is being built and will be tested on the 27 cases from T10.

---

## How We Build

Several AI models (Claude, Gemini, Codex) build this project together through a card factory. Each model brainstorms freely in its own private Ideas folder. The real product changes only through a task card with an explicit file list, re-runnable proof, and a check by the PM agent and a reviewer agent against a written Done Standard.

```
0-draft → 1-todo → 2-building → 3-review → 4-done
```

As of 2026-10-04: **10 cards done** (T01–T06, T08, T10, T12, T14), **1 in review** (T13), **2 building** (T11, T15), **2 to do** (T07, T16), 3 in draft (T09 and two unnumbered proposals).

Since 2026-10-03 the PM agent picks the builder, model and effort setting for each card and writes the reason on the card. Each finished card gets an independent check before the PM decides, and checks do fail: T13 and T14 each failed a round and were fixed.

See **[How We Build (HOW-WE-BUILD.md)](HOW-WE-BUILD.md)** for:
* The board, the card format, and the quick lane for small fixes.
* Roles: human owner, PM agent, reviewer agent, builders, helper agent, and who checks whose work.
* The model-picking experiment: a decision model ranking models for each card.
* The eight Done Standards and the two factory scripts (`check-in.mjs`, `archive.mjs`).
* The current board, with every card, its builder and its status.

---

## Current Status (October 2026)

### What Works Locally
* **Alpine Wave Company Website (`website/`):** Next.js application with company messaging, interactive assistant drawer, and structured service offerings.
* **Resort Shop Showcase ("Everything in the Mountains" — `shop-showcase/`):** Standalone web showcase demonstrating multi-season inventory (winter ski/snowboard rentals, summer tours, year-round retail), dynamic rate estimation, and inquiry flows.
* **Structured Data Masters (`data/`):** Canonical data masters for business facts (`data/alpine-wave/alpine-wave-services.json`) and resort gear catalogs (`data/everything-in-the-mountains/`).
* **Assistant Guidance:** Local prompt rules drafted to send unknown availability or unlisted services to a staff contact handoff. Not yet tested against live visitor traffic.
* **Bot Test Set (T10):** 27 written test questions for the Alpine Wave bots, each traced to a source line and tagged with the bot it applies to (21 both, 6 website only).
* **Phone Limits in the Data File (T14):** the services data file now says what Alpine Wave's own phone line can't do (book, take payments, arrange callbacks, transfer calls), so the phone bot tests can cite a source.
* **Phone Bot Prototype (T12):** a browser-tested voice prototype, passed on 2026-10-04 (round 3). It answers only from the services data file, never claims to transfer, call back or text, and sends hand-offs to the company email. Tested in 10 browser calls by the owner, with every answer traced to the data file. It is not connected to a phone number, so no bot answers live phone calls yet.
* **Factory Tooling:** `check-in.mjs` (board and problem report) and `archive.mjs` (moves superseded files to the archive with a manifest; never deletes).

### What Is Not Built Yet
* **Website Bot on the Data File (T11):** the site chat still answers from a prepared rules file. Switching it to answer from the services data file is being built.
* **Live Carrier Telephony:** Connecting live phone numbers via SIP trunking to our voice runtime is in research and planning; no live carrier phone numbers are answering live calls yet. A later number-connection card must re-test the phone bot before anyone calls the phone service live.
* **Cloud Hosting:** Core applications currently run in local development or static previews; live cloud hosting with backend API execution is not yet deployed.
* **External Systems:** Direct integration with live merchant POS inventory, credit card payment processing, and third-party calendar booking engines are outside the current milestone.

### Not Checked / Untested
* **Live Carrier Latency:** Real-world audible latency across cellular networks under high concurrency has not been measured on live phone lines.
* **End-to-End Voice Handoff:** Automated call transfer from the voice assistant to live mobile handsets has not been tested over public carriers.

---

## Live Previews (GitHub Pages)

Static, client-side demonstration previews are available via GitHub Pages:

* **[Alpine Wave Platform Preview](https://rubixowl.github.io/ai-visibility-tracker/)**: Platform overview and editorial demonstration layout.
* **[Everything in the Mountains Showcase Preview](https://rubixowl.github.io/ai-visibility-tracker/ski-shop/)**: Showcase demonstrating retail and rental catalog browsing. *(Note: the preview still shows Alpine Wave's phone number `(236) 205-7030`. It moves to its own number once one is provisioned).*

---

## What Is in This Repository

The `.gitignore` is an allow-list, so only the files below are public. The application code, data masters, task cards and each model's Ideas folder stay in the private working copy and a private backup repository.

| Path | What it is |
|---|---|
| `README.md` | This page |
| `HOW-WE-BUILD.md` | The multi-agent card factory |
| `ROADMAP.md` | Target milestones and acceptance criteria |
| `PROGRESS.md` | Dated progress log |
| `CONTRIBUTING.md` | Feedback guidance |
| `DISCOVERY-2026-09-27.md` | Earlier niche discovery (historical) |
| `docs/` | Static GitHub Pages previews: platform page, ski shop showcase, walkthrough video |

---

## Documentation and Records

* **[How We Build](HOW-WE-BUILD.md)**: The multi-agent development factory and pipeline rules.
* **[Roadmap and Acceptance Criteria](ROADMAP.md)**: Target milestones and delivery plan.
* **[Progress Log](PROGRESS.md)**: Chronological record of milestones, work delivered, and updates.
* **[Feedback Guidance](CONTRIBUTING.md)**: Guidelines for reviews and community feedback.
* **[Historical Discovery](DISCOVERY-2026-09-27.md)**: Earlier niche exploration records.
