# Session — Self-contained MailFlow extraction workspace

**Date:** 2026-10-14  
**Purpose:** Make MailFlow extraction records and generic extraction tooling available inside `Rilan-Dev/mailflow`.

## Source baseline

- MailFlow upstream discovery pin: `e7a53760a7e4b15e0ee631533655d99dde657599`
- MailFlow root tree: `27059315bc16155f0064dc136aae94cd5097cb02`
- Proposed pin only; source-copy authorization remains false.
- 1,319 source blobs remain unclassified. No upstream application source was copied.

## Workspace changes proposed

- Vendored the 63-file generic `source-extraction-agent/` framework from `Rilan-Dev/ai-reusable-libraries` at commit `1e6ba9588e715e698722949e1c592b08f4ea7a00`.
- Added MailFlow-specific pin, inventories, architecture/capability maps, source-specific notes, verifier and project-control records under `extraction/`.
- Added framework version pin and boundary documentation.
- Added durable-memory and session-record guidance.
- Linked the workspace from the root README and made key session recovery instructions repository-local.

## GitHub handoff

- Branch: `chore/add-self-contained-source-extraction-framework`
- Pull request: https://github.com/Rilan-Dev/mailflow/pull/2
- Latest observed head at session note creation: `2c2d0dd078811ee294da72d3fc97678497cd1d2a`
- PR is open and not merged.

## Verification status

- Git tree API reports the PR head tree is complete (not truncated).
- 63 framework files plus one MailFlow boundary document are present under `source-extraction-agent/`.
- MailFlow-specific records and framework pin are present under `extraction/`.
- This was a structural GitHub API check only. The local inventory verifier and extraction tests have not been run in a checkout.
- No extraction PASS, license clearance, source-copy authorization, or baseline promotion is implied.

## Next action

Review PR #2 and merge only when explicitly authorized. Then run `node extraction/tools/verify-inventory.mjs` in a real checkout, reconcile the full source inventory, and continue licensing/provenance plus capability/dependency closure. Keep future MailFlow memory, sessions, state and evidence in this repository.
