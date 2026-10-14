# Chat Continuity — MailFlow Source Library

Resume in `Rilan-Dev/mailflow`: read `extraction/README.md`, then this file and the MailFlow-specific project-control records under `extraction/project-control/`. Generic prompts, skills, templates, schemas and workflows are available locally under `source-extraction-agent/`.

Initial source pin: commit e7a53760a7e4b15e0ee631533655d99dde657599; root tree 27059315bc16155f0064dc136aae94cd5097cb02; captured 2026-10-14. Full tree inventory: manifests/source-tree-2026-10-14.json (1462 entries; complete response). Inspected README, LICENSE, LICENSE-COMMERCIAL, CLA, CONTRIBUTING and CI.

Current phase: Phase 1 inventory/capability discovery. No source files copied. Exact-copy Phase 2 blocked pending capability closure, all-path disposition, license/provenance classification, independent reconciliation and authorization.

Before resuming, inspect live refs, then CURRENT_PHASE, NEXT_ACTION, VERIFICATION_STATE, ISSUES, RISKS, DECISIONS and WORKLOG. Preserve history and append updates. The user requires future upstream commits to be detected and reviewed by AI-assisted workflows.


## Update 2026-10-14
Added a preliminary capability map and a path-disposition register for all 1,319 source blobs. Every path is explicitly still unclassified. Added a scheduled/manual source watcher workflow and an end-to-end update playbook. The workflow is not yet validated and scheduling only becomes active once the workflow lands on the default branch. Continue by reading central architecture and security paths and tracing dependency closure; do not start exact-copy phase prematurely.


## Architecture update — 2026-10-14
A 16-capability initial architecture map has been added and its referenced paths verified against the pinned tree. No capability is closure-complete yet. Continue tracing actual imports/callers, data, configuration, tests and host/platform dependencies, starting with security/auth, IMAP synchronization, plugin isolation and migrations.


## Inventory validation update — 2026-10-14
A connector-based check verified consistency across the pinned tree, complete tree manifest, all-file register, candidate map and architecture candidate blob SHAs: zero mismatches. The Node verifier was added but not executed directly. All 1,319 source paths remain unclassified and exact copy remains blocked.


## Self-contained workspace import — 2026-10-14
The MailFlow extraction workspace and all 63 generic framework files have been copied into this repository on branch `chore/add-self-contained-source-extraction-framework`. The canonical framework remains `Rilan-Dev/ai-reusable-libraries/source-extraction-agent/`; this repository holds a versioned local copy. MailFlow-specific inventory, pin, and state live under `extraction/`. This copy does not authorize upstream source copying or baseline promotion.
