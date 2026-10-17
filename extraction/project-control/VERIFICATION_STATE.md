# Verification State — MailFlow Extraction

## Current source snapshot verification — 2026-10-17

- Workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39030338698
- Workflow result: success.
- Source commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Current manifest: extraction/manifests/source-tree-2026-10-17-35067fc.json
- Current dispositions: extraction/manifests/path-dispositions-2026-10-17-35067fc.json
- Snapshot: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source
- Inventory: 1,497 entries; 1,350 blobs; 147 nested trees; 0 gitlinks.
- Capture manifest reports 1,350 blob checks and 0 failures.
- Exact verifier output: PASS: inventory consistency checks passed. Reconstructed snapshot root tree SHA equals the pinned tree; all 147 nested tree SHA values were verified. The verifier also checked snapshot file-set equality, blob SHA, symlink status and executable bits.
- Source delta from historical baseline: 31 added blobs; 116 changed blobs; 1,203 unchanged blobs; 0 removed blobs.
- The 2026-10-14 capability map and candidate map are explicitly treated as historical evidence. A current-pin architecture map and closure tracker now exist.

## Still NOT verified / NOT PASS
- Transitive dependency and capability closure.
- Per-path license/provenance and third-party attribution review.
- Redistribution/use rights for AGPL-3.0 versus commercial license path.
- Runtime behavior, full backend/frontend/native test suites for the copied snapshot.
- Git LFS external object completeness (the Git tree has zero gitlinks; LFS status still needs explicit scan).
- Independent second-pass reconciliation by another reviewer.
- Host integration readiness or overall extraction PASS.

Do not confuse exact source snapshot integrity with reusable capability completeness.
