# MailFlow Extraction Agent Memory

Append durable facts and decisions here. Keep transient turn-by-turn details in extraction/sessions/; keep current execution instructions in extraction/project-control/NEXT_ACTION.md.

## Repository ownership
- Working repository: https://github.com/Rilan-Dev/mailflow
- Canonical upstream source: https://github.com/maathimself/mailflow
- Generic extraction framework: versioned local copy at source-extraction-agent/; canonical framework at https://github.com/Rilan-Dev/ai-reusable-libraries/tree/main/source-extraction-agent
- MailFlow-specific manifests, sessions, source pins, immutable snapshots, licensing/provenance evidence, project control and worklogs live under extraction/.

## Non-negotiable operating rules
- Preserve source bytes, blob IDs, file modes, symlinks, root tree identity, upstream commit identity, attribution and license notices.
- Treat each upstream commit as a separate immutable snapshot. Never overwrite an existing snapshot path.
- If a path changes SHA or mode, reset its prior classification and closure assessment to UNCLASSIFIED / UNDECIDED / UNREVIEWED / UNMAPPED.
- Inventory completeness is not capability closure, license clearance, or extraction PASS.
- Never integrate extracted code into a host project until dependency closure, license/provenance and exact-copy gates have evidence-backed PASS.
- The user authorized beginning the full source snapshot and wants ongoing upstream changes captured. Automated updates should create/update a reviewable PR; they must not silently overwrite an existing snapshot or merge unreviewed source into host applications.
- Preserve every session/worklog checkpoint. Do not delete earlier evidence.

## Current extraction goals
1. Capture the entire upstream Git tree as a byte-exact snapshot under extraction/snapshots/<commit>/source.
2. Generate tree and path-disposition manifests from Git objects, and verify all copied blob hashes/modes.
3. Continue full capability and transitive first-party dependency closure, including backend, frontend, migrations, runtime/config, security, tests, Electron/Android and UI behavior.
4. Audit AGPL-3.0, commercial-license notices, CLA, third-party code/assets, submodules and Git LFS before reuse/redistribution.
5. Watch upstream main and propose new immutable snapshots when upstream changes; retain prior snapshots and provenance.

## Known historical baseline
- Initial discovery commit: e7a53760a7e4b15e0ee631533655d99dde657599
- Initial root tree: 27059315bc16155f0064dc136aae94cd5097cb02
- Initial inventory: 1,462 entries, 1,319 blobs, 143 tree entries; all source paths initially unclassified.
- The first discovery inventory was captured in October 2026. Reconcile it with the current live upstream before treating it as current.

## Recovery order
Read extraction/project-control/CHAT_CONTINUITY.md, CURRENT_PHASE.md, NEXT_ACTION.md, VERIFICATION_STATE.md, ISSUES.md, RISKS.md, DECISIONS.md, WORKLOG.md, then inspect extraction/source-pins/current.json and the exact manifests referenced by that pin. Read the newest session record before continuing.
