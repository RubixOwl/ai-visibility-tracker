# Alpine Wave

Website and telephone assistants for tourism, rental, and activity businesses that operate all year round.

Repository name `ai-visibility-tracker` is retained from earlier project discovery.

---

## What Alpine Wave Is

Alpine Wave builds grounded AI assistants for independent tourism businesses—such as ski & snowboard rental shops, tour operators, and outdoor outfitters. 

Tourism businesses face heavy inquiry spikes during morning gear pickups, weather changes, and seasonal transitions. Alpine Wave provides:
1. **Website Chat Assistant:** Answers visitor questions on pricing, gear selection, packages, and seasonal hours directly from structured business data.
2. **Inbound Phone Assistant:** Answers voice calls, assists with common inquiries, routes complex booking requests to staff, and takes messages when staff are busy on the counter.

Design goal: assistants should be strictly bounded by canonical business facts to prevent inaccurate commitments or invented pricing. (Evaluation against the written Bot Replies quality standard has not been checked yet).

---

## How We Build

All development follows an asynchronous multi-agent pipeline governed by task cards, strict file boundaries, re-runnable proof, and written standards.

See **[How We Build (HOW-WE-BUILD.md)](HOW-WE-BUILD.md)** for details on:
* The 4-stage board (`1-todo → 2-building → 3-review → 4-done`).
* The division between human owner authority, the checking agent, and independent AI builder agents.
* Verification standards and automated pipeline checks.

---

## Current Status (October 2026)

### What Works Locally
* **Alpine Wave Company Website (`website/`):** Next.js application with company messaging, interactive assistant drawer, and structured service offerings.
* **Resort Shop Showcase ("Everything in the Mountains" — `shop-showcase/`):** Standalone web showcase demonstrating multi-season inventory (winter ski/snowboard rentals, summer tours, year-round retail), dynamic rate estimation, and inquiry flows.
* **Structured Data Masters (`data/`):** Canonical data masters for business facts (`data/alpine-wave/alpine-wave-services.json`) and resort gear catalogs (`data/everything-in-the-mountains/`).
* **Assistant Guidance:** Local prompt rules drafted to guide unknown availability or unlisted services toward staff contact handoffs; not yet tested against live visitor traffic.

### What Is Not Built Yet
* **Live Carrier Telephony:** Connecting live phone numbers via SIP trunking to our voice runtime is in research and planning; no live carrier phone numbers are answering live calls yet.
* **Cloud Hosting:** Core applications currently run in local development or static previews; live cloud hosting with backend API execution is not yet deployed.
* **External Systems:** Direct integration with live merchant POS inventory, credit card payment processing, and third-party calendar booking engines are outside the current milestone.

### Not Checked / Untested
* **Live Carrier Latency:** Real-world audible latency across cellular networks under high concurrency has not been measured on live phone lines.
* **End-to-End Voice Handoff:** Automated call transfer from the voice assistant to live mobile handsets has not been tested over public carriers.

---

## Live Previews (GitHub Pages)

Static, client-side demonstration previews are available via GitHub Pages:

* **[Alpine Wave Platform Preview](https://rubixowl.github.io/ai-visibility-tracker/)**: Platform overview and editorial demonstration layout.
* **[Everything in the Mountains Showcase Preview](https://rubixowl.github.io/ai-visibility-tracker/ski-shop/)**: Showcase demonstrating retail and rental catalog browsing. *(Note: the preview currently still displays Alpine Wave's phone number `(236) 205-7030`; it is scheduled to move to its own separate number once provisioned).*

---

## Documentation and Records

* **[How We Build](HOW-WE-BUILD.md)**: The multi-agent development factory and pipeline rules.
* **[Roadmap and Acceptance Criteria](ROADMAP.md)**: Target milestones and delivery plan.
* **[Progress Log](PROGRESS.md)**: Chronological record of milestones, work delivered, and updates.
* **[Feedback Guidance](CONTRIBUTING.md)**: Guidelines for reviews and community feedback.
* **[Historical Discovery](DISCOVERY-2026-09-27.md)**: Earlier niche exploration records.
