# Alpine Wave services data

Master data file for Alpine Wave company facts, service descriptions, customer offer tiers, operational status, boundaries, and handoff rules.

## Master file

- `alpine-wave-services.json`: The single master data file for Alpine Wave services and company facts.

## Who reads it

- **Current state:** Built in Stage 1 as the approved data master. The website currently reads `website/lib/rules_and_knowledge.json`.
- **Planned consumers:** A later card will switch the Alpine Wave website chat, Jev (TypeSafe model), and the telephone assistant over to read `alpine-wave-services.json` directly as their sole source of truth for company facts.

## Next steps

- Test questions card (Stage 1).
- Card to wire website chat and Jev to this master file.
