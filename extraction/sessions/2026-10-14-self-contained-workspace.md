# Session Handoff — 2026-10-14

## Goal
Move the MailFlow-specific extraction records into the MailFlow repository and vendor a complete local copy of the reusable source-extraction framework so future sessions can work without depending on documentation in another repository.

## Decisions
- Keep generic prompts, terminology, rules, templates, schemas, skills and workflows under `source-extraction-agent/`.
- Keep MailFlow-specific source pins, inventory manifests, licensing/provenance notes, memory, sessions and project-control under `extraction/`.
- Preserve the canonical reusable framework in `Rilan-Dev/ai-reusable-libraries`; this is a deliberate local copy, not a move/delete from the canonical repository.
- The correct upstream project is `maathimself/mailflow`; `Rilan-Dev/mailflow` is the target repository and must not be treated as its own upstream.
- Do not copy upstream application source or promote the proposed source pin.

## Baseline
- Proposed upstream commit: `e7a53760a7e4b15e0ee631533655d99dde657599`
- Proposed upstream tree: `27059315bc16155f0064dc136aae94cd5097cb02`
- Inventory: 1,462 entries, 1,319 blobs, 143 tree entries.
- All 1,319 paths remain unclassified; licensing/provenance, dependency closure and independent reconciliation remain open.

## Next action
Finish the self-contained workspace on a dedicated branch, open a pull request, then in a real checkout run `node extraction/tools/verify-inventory.mjs` and the framework's documented checks. Record actual output; do not infer a PASS from the committed files.
