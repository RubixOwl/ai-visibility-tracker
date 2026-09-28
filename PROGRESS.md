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
