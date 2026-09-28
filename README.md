# Voice and website bots
Working repository name: AI Visibility Tracker.

**Status: a generic local prototype exists. The active goal is a hosted website and telephone bot, with a tailored demo built from public research about one potential customer.**

## Direction
Develop repeatable voice and website bots that help businesses answer useful questions, capture enquiries and hand them to the right person. The intended outcome is a first paying customer.

Public research identified one potential customer whose website can guide a tailored demonstration. This is a research lead only: there has been no contact and no confirmed interest. The plan is to build around publicly available information and show what the service could do. The business identity and identifying details are kept out of this repository.

## What needs validating
- Which businesses have a recurring enquiry problem their existing tools do not solve?
- Does a voice bot, website bot or combination fit their actual customers and workflow?
- Can a narrow service deliver enough measurable value to support a paid pilot?

Public website evidence can guide a relevant demo; it cannot prove demand or willingness to pay. The project deadline is October 24, 2026. The intended first demo covers a website widget and a telephone bot; the actual customer's needs and interest remain unverified.

## Current prototype
The generic bot-factory preview uses sample facts for chat and optional browser speech. Its source is a local artifact and is not included in this repository. It has no hosted backend, live provider integration, booking connection or message storage. It is not the tailored demo and has not been run or user-tested.

## Planned approach
Build a hosted service around reviewed public information for the research lead, then demonstrate it to the potential customer if an authorized opportunity arises. The recommended stack is Node.js with TypeScript and Fastify, OpenRouter for Jev decisions and conversational replies, Twilio ConversationRelay for telephone speech, and Render for hosting. These are recommendations; accounts and integrations are not confirmed ready.

Both voice and website bots are product directions. A combined first build is not required. Live booking integrations, payments and emergency support are outside the initial proposed demo.

## Current work
The generic scaffold is the first implementation artifact. Hosted implementation is next. No tailored build, customer contact, external API call or deployment is represented as completed.

## Follow the work
- [Roadmap](ROADMAP.md)
- [Progress log](PROGRESS.md)
- [Historical tourism discovery](DISCOVERY-2026-09-27.md)
- [Feedback guidance](CONTRIBUTING.md)

Useful feedback: which enquiries take time, what happens outside staffed hours, and what existing booking or communication tools already handle. Share only public examples, not customer information or credentials.
