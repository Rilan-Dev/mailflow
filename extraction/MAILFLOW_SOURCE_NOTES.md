# MailFlow Source Workstream Notes

This file is source-specific context for the shared extraction framework. Generic prompts, terminology, rules, templates, schemas, skills and workflows remain canonical in source-extraction-agent/ and are versioned locally in this repository.

## Current source pin
- Upstream: https://github.com/maathimself/mailflow
- Ref: main
- Current commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Snapshot: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source
- Inventory: 1,497 entries, 1,350 blobs, 147 tree entries, 0 gitlinks.
- Exact snapshot integrity: verified in GitHub Actions; see extraction/project-control/VERIFICATION_STATE.md and snapshot-manifest.json.
- Source delta from initial discovery: 31 added blobs, 116 changed blobs, 1,203 unchanged blobs, 0 removed blobs.

## Current blockers
- All 1,350 current source blobs remain UNCLASSIFIED, license/provenance UNREVIEWED, and closure UNMAPPED.
- Sixteen architecture areas are candidates only; use architecture-map-2026-10-17-35067fc.json and capability-closure-2026-10-17-35067fc.json.
- AGPL-3.0, a separate commercial-license path and CLA are present. Review third-party dependencies/assets, path provenance and redistribution rights before reuse.
- Exact snapshot integrity does not establish capability completeness or permission to integrate source into another project.

## Resume order
1. Read extraction/project-control/CHAT_CONTINUITY.md, CURRENT_PHASE.md, NEXT_ACTION.md and VERIFICATION_STATE.md.
2. Read extraction/memory/AGENT_MEMORY.md and the latest dated record under extraction/sessions/.
3. Inspect extraction/source-pins/current.json and the exact manifests referenced by it.
4. Trace auth/OAuth/OIDC, host validation, safe remote fetch, image proxy and email sanitization first, then IMAP/account lifecycle and database migrations.
5. Preserve immutable snapshots and append evidence to project-control, memory and session records.
