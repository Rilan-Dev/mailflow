# MailFlow Extraction Workspace

This directory is the canonical home for **MailFlow-specific extraction work** in the MailFlow repository. Keep inventories, source pins, architecture and capability maps, licensing/provenance reviews, memories, sessions, progress, and verification evidence here—not in `ai-reusable-libraries`.

## Layout

- `source-extraction-agent/` at repository root is a versioned, self-contained copy of the reusable extraction framework. Its upstream pin and copy policy are recorded alongside it.
- `extraction/source-pins/` records the proposed upstream baseline. A proposed pin is not an authorization to copy source.
- `extraction/manifests/` contains the source tree, path dispositions, capability candidates, and architecture maps.
- `extraction/project-control/` is the MailFlow-specific continuity and execution record: phase, next action, state, decisions, issues, risks, verification, and worklog.
- `extraction/memory/` holds durable MailFlow extraction facts and constraints.
- `extraction/sessions/` holds dated session records and handoffs.
- `extraction/tools/` holds MailFlow-specific inventory and reconciliation tooling.
- `extraction/SOURCE_UPDATE_PLAYBOOK.md` and `extraction/USER_GUIDE.md` explain how to use the workspace.

## Ownership and synchronization

The canonical reusable framework remains in `Rilan-Dev/ai-reusable-libraries/source-extraction-agent/`. This copy is intentionally committed into MailFlow so an agent can work from a MailFlow checkout without depending on another repository's local files. It is a versioned snapshot, not an automatic live link. Review framework changes upstream, then deliberately update this copy and its upstream pin.

Keep generic prompts, skills, schemas, rules, and workflows in `source-extraction-agent/`; keep MailFlow-specific findings and history in `extraction/`. Do not create another MailFlow-only copy of generic prompts under `extraction/`.

## Current safety state

- Proposed upstream repository: `https://github.com/maathimself/mailflow`
- Proposed baseline commit: `e7a53760a7e4b15e0ee631533655d99dde657599`
- Proposed root tree: `27059315bc16155f0064dc136aae94cd5097cb02`
- Inventory: 1,462 entries, including 1,319 blobs.
- All source-file dispositions remain unclassified; licensing/provenance and dependency closure are incomplete.
- `source-pins/current.json` keeps `source_copy_authorized: false`.

No application source is copied by this workspace migration. Do not promote the pin, copy source files, or declare extraction PASS until the defined review and integrity gates are satisfied.
