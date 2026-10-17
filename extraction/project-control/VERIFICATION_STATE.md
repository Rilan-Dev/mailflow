# Verification State

## Verified baseline evidence
- GitHub Git Data API resolved main to commit e7a53760a7e4b15e0ee631533655d99dde657599.
- Commit root tree is 27059315bc16155f0064dc136aae94cd5097cb02.
- Recursive tree returned 1462 entries with truncated=false.
- Full path/mode/object-SHA inventory is stored in manifests/source-tree-2026-10-14.json.

## Not yet verified
- Per-path license/provenance.
- Capability/dependency closure.
- Independent reconciliation.
- Immutable source copy and copied blob/tree equality.
- Source watcher end-to-end issue creation.
- Any extraction PASS.

This is baseline identity/inventory evidence only, not full extraction verification.


## Additional artifacts — 2026-10-14
- Preliminary candidate map: manifests/capability-candidates-2026-10-14.json and CAPABILITY_CANDIDATES.md.
- Complete initial per-file disposition register: manifests/path-dispositions-2026-10-14.json; all 1,319 blob entries intentionally remain UNCLASSIFIED / UNREVIEWED / UNMAPPED.
- Change watcher: .github/workflows/mailflow-source-watch.yml authored. No end-to-end workflow run confirmed. Scheduled triggers require this workflow to be merged into the repository default branch; the current work is on extraction/mailflow-source-library.
- No immutable application source copy, path-level license pass, dependency closure pass or extraction PASS.


## Architecture candidate verification
- Initial architecture map contains 16 capability candidates and references existing paths at the pinned source tree.
- All referenced paths were checked against the complete tree inventory; missing path count is zero.
- This only verifies candidate path existence and recorded blob identity, not behavior, dependency closure or eligibility.


## Manifest consistency check — 2026-10-14
- API/connector validation against the stored manifests: PASS. Source pin and tree manifest agree; 1,462 unique tree entries; all 1,319 blobs have a matching disposition record with identical SHA/mode; all candidate paths and all 16 capability source/test references exist with matching blob SHAs; zero inconsistencies found.
- The authored Node script tools/verify-inventory.mjs has not yet been executed directly. The GitHub Actions workflow has not been run end-to-end.
- Discovery remains incomplete: 1,319 paths unclassified, licensing unreviewed, closure unmapped. No source copy or extraction PASS.

## 2026-10-17 — Snapshot automation authored; execution pending
- MailFlow PR #1 is merged; the self-contained framework and source-specific workspace now exist on main.
- Current upstream identity observed during review: maathimself/mailflow main at 35067fc2876d50980f1a8a3b8ea72b5467b69f60; root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. Workflow execution must resolve the live branch again.
- Added exact Git-object capture tool and a scheduled/manual GitHub Actions workflow. The tool writes commit-addressed snapshots, tree/path manifests, preserves unchanged path assessments only on exact SHA+mode match, and resets changed/new files to unclassified.
- Updated verifier to check exact Git blob hashes, snapshot file-set equality, symlink status and executable bits when a snapshot exists.
- NOT YET VERIFIED: workflow execution, generated snapshot PR, current live upstream inventory, local verifier output, snapshot exactness in a real checkout, per-path license/provenance, dependency closure, independent reconciliation, LFS/submodule completeness, or extraction PASS.
- Licensing notice: upstream declares AGPL-3.0 and a separate commercial license route; preserve notices and do not assume arbitrary reuse/redistribution rights.
