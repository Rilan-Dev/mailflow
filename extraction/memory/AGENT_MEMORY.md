# MailFlow Extraction Agent Memory

Append durable facts and decisions here. Keep transient turn-by-turn details in
`extraction/sessions/`; keep current execution instructions in
`extraction/project-control/NEXT_ACTION.md`.

## Durable constraints

- MailFlow-specific extraction documentation and history live in this repository under `extraction/`.
- Generic extraction prompts, skills, schemas, rules, and workflows live in the versioned `source-extraction-agent/` copy at repository root.
- The canonical framework source is `Rilan-Dev/ai-reusable-libraries`; local updates require a deliberate reviewed refresh.
- The source project is `https://github.com/maathimself/mailflow`, branch `main`.
- Proposed discovery pin: commit `e7a53760a7e4b15e0ee631533655d99dde657599`, root tree `27059315bc16155f0064dc136aae94cd5097cb02`.
- The captured tree has 1,462 entries and 1,319 blobs. All blob dispositions remain unclassified.
- MailFlow is dual-licensed under AGPL-3.0 or a commercial license path; CLA and path-level license/provenance review remain necessary.
- No application source copy is authorized. Preserve exact bytes and verify blob/tree identities before any extraction copy.
- Never promote a proposed pin, overwrite a baseline, or claim extraction PASS without explicit authorization and recorded verification evidence.

## Workspace migration

On 2026-10-14, the framework and MailFlow-specific discovery records were being consolidated into this repository. The reusable-libraries repository should retain the global framework/catalog, not a parallel working copy of MailFlow's extraction records.
