# Alpine Wave website

Company homepage built from the approved visual reference, with the supplied logo and ten curated company questions. Next.js App Router serves the page and `/api/chat` endpoint. The reference file is not modified.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install --package-lock=false --ignore-scripts --no-audit --no-fund
npm run dev
```

Open http://127.0.0.1:3000. The server binds to loopback. For a production-mode local preview, run `npm run build`, then `npm start`.

## Check behavior

```sh
npm run verify
node scripts/verify.mjs --http
```

The HTTP checks need the local server running on port 3000. They use synthetic input and do not call external AI services.

## Chat scope

`lib/rules_and_knowledge.json` is the unified single source of truth shared directly with the Jev Guardrail (`Jev Bot/Alpine Wave Script/`). `lib/knowledge.mjs` re-exports from this file to power both the FAQ and chat endpoints. `lib/conversation.mjs` selects prepared answers and supports bounded follow-ups. This is a working curated FAQ chat, not a connected generative AI assistant. It does not understand arbitrary multi-part conversations; unsupported questions receive an explicit fallback. The engine is isolated so a reviewed provider can replace it later without changing the chat interface.

Context stays in browser memory; the latest 16 messages accompany a question to the endpoint. There is no database, transcript persistence, account, analytics, external model call, staff message delivery or enquiry form. Refreshing clears the conversation. Fonts are requested from Google Fonts; the logo is served locally. The browser can read the explicitly scripted phone sample aloud.

Pending: phone connection, provider choice and paid-use authority, confirmed pricing, contact delivery destination, hosting/privacy arrangements and separately authorized deployment. No live phone, booking, callback, integration or customer-result claims are made. Search indexing is disabled while this is a preview.

No publication was performed. Company contact details are present by owner instruction for the site; any repository publication must separately pass project content and history review. Dependencies are installed without lockfile creation to respect local machine policy; reproducible dependency locking remains a deployment consideration.
