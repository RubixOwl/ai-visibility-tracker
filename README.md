# Alpine Wave

Website and telephone bots for businesses. Repository name retained from the earlier AI Visibility Tracker exploration.

**Status: Alpine Wave v4 handover finalized (Givingli editorial layout, Sun-Drenched Okanagan coral palette, cinema frame prepared for talkover/walkthrough, and seam for `/api/chat` assistant connection). Dedicated synthetic ski & snowboard showcase 'Everything in the Mountains' V2 built with Mountain Conditions HUD, complete 6-item rental fleet, interactive category filter tabs, real-time rate calculator, and front counter phone simulator (`(236) 205-7030`). Live clickable previews published via GitHub Pages. Target: October 24, 2026.**

## Live Clickable Previews (GitHub Pages)

- **[Alpine Wave Platform (v4 Handover)](https://rubixowl.github.io/ai-visibility-tracker/)**: Editorial platform showcase with interactive spider map, core channels, interactive question filters, audio sample simulation, and prepared video cinema player.
- **[Everything in the Mountains (Ski Shop Showcase V2)](https://rubixowl.github.io/ai-visibility-tracker/ski-shop/)**: Dedicated retail & rental shop demo with Mountain Conditions HUD, interactive category filter tabs, live rental rate calculator, and front-counter DID `(236) 205-7030` phone simulator.

## What we are building

- Our own business website with a website assistant and a real inbound telephone assistant.

- A separate demonstration for winter ski/snowboard rental and retail enquiries.

- Shared bot infrastructure with separate business facts and instructions.

The proposed showcase covers rental, retail and servicing questions, follow-up conversations, booking guidance and a synthetic enquiry with a useful staff summary. Unknown availability stays unknown; an enquiry is not a confirmed booking.

## Work completed

The delivery scope, sequence and acceptance criteria are documented in the [roadmap](ROADMAP.md). Today's work delivered:
1. **Alpine Wave v4 Handover:** Fully clickable editorial platform mockup with Choice 2 Sun-Drenched Okanagan coral palette, verified sample conversation cards, interactive question routing, and video walkthrough cinema frame primed for live voiceover.
2. **Everything in the Mountains V2:** Complete dedicated synthetic ski & snowboard retail showcase featuring 6 verified gear packages, interactive category filter tabs, real-time rental rate calculator (15% savings on 3+ days), and DID `(236) 205-7030` phone simulator.
3. **Tier 2 Shadow Trial Plan:** Architected the 7-day shadow trial model (staff-first answering, automated after-hours/missed-call bot failover, PCI pause recording controls, click/chat logging, and Day-7 executive report).
4. **Public GitHub Pages Suite (`docs/`):** Self-contained, sanitized web demos enabling instant browser review without local setup.

This update records local implementation, architecture, and design progress. It does not demonstrate live telephony carrier integrations or public cloud deployment. A potential demo prospect is not a customer; its identity and source details are excluded.

## Build approach

Start with the company website and a working chat slice, then add inbound phone and the separate shop showcase. Keep provider interfaces replaceable and reuse one core system. The custom backend is a starting proposal; final hosting, voice/model configuration and costs remain unresolved. Low cost is a design goal, not a measured result.

Live inventory, completed bookings, payments and a large dashboard are outside the first planned delivery. Both website and telephone channels remain required.

## Evidence and feedback

- [Roadmap and acceptance criteria](ROADMAP.md)

- [Dated progress log](PROGRESS.md)

- [Historical discovery](DISCOVERY-2026-09-27.md)

- [Feedback guidance](CONTRIBUTING.md)

Next evidence milestone: a browser-tested company website/chat journey, followed by a verified inbound call. Share only public examples; never post customer information or credentials.
