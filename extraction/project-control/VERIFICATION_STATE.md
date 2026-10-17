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

---

## Historical checkpoint preserved (pre-snapshot-verification state)

The following is retained for continuity. The current authoritative state is described above; historical action items below may be completed or superseded.

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

## 2026-10-17 — Post-snapshot classification and security trace checkpoint
- Latest verifier run: https://github.com/Rilan-Dev/mailflow/actions/runs/39030515872 (success).
- Exact log: inventory consistency PASS; 1,497 entries, 1,350 blobs, 147 trees; reconstructed root tree SHA a2a82b50b8a1ac24a273e55dc0f9418aefdfed17; 147 nested tree SHA checks passed; 0 Git LFS pointer files detected; 0 gitlinks.
- Machine-readable report: extraction/manifests/source-verification-2026-10-17-35067fc.json.
- Initial path classification started for LICENSE, LICENSE-COMMERCIAL, CLA.md, README.md, backend/package.json and frontend/package.json. Six paths classified; 1,344 remain UNCLASSIFIED. This is a small first slice, not complete path-level provenance.
- Security static trace created at extraction/manifests/security-closure-2026-10-17-35067fc.json. It covers auth/session, OAuth/OIDC, host validation/safeFetch, image proxy and email sanitizer, with 15 test references identified. No tests were executed by the static trace; these capabilities remain PARTIAL_STATIC_TRACE_NOT_CLOSED.
- The source snapshot remains integrity-verified; dependency closure, license/provenance clearance, independent second-pass review and host-integration readiness remain pending.

## Dependency inventory checkpoint — 2026-10-17
- Current snapshot package manifests and lockfiles were parsed without modifying snapshot content.
- Backend: 23 direct dependencies, 4 direct dev dependencies, 445 locked package entries; manifest/lockfile blob SHAs recorded in extraction/manifests/dependency-inventory-2026-10-17-35067fc.json.
- Frontend: 27 direct dependencies, 12 direct dev dependencies, 679 locked package entries.
- Total: 1,124 lockfile package entries; 50 direct dependencies and 16 direct dev dependencies.
- This is an inventory pass only. Zero third-party packages have been license/provenance-cleared; runtime/native import closure and package source provenance remain pending.

## 2026-10-17 — Current classification and dependency inventory
- Progress report: extraction/manifests/EXTRACTION_PROGRESS_2026-10-17.md and extraction/manifests/extraction-progress-2026-10-17.json.
- Current disposition register: 39 paths initially classified; 1,311 remain UNCLASSIFIED. Security-source roles are marked DEPENDENCY_CLOSURE / CANDIDATE_REQUIRES_CLOSURE; test candidates are identified but not run.
- Dependency inventory: 1,124 package-lock entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. No third-party licenses are cleared.
- The exact snapshot/tree verification remains PASS; path classification, transitive closure, runtime/test execution, license/provenance and redistribution remain pending.

## 2026-10-17 — Selected security test execution

- Workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550 — completed successfully.
- Immutable source pin under test: maathimself/mailflow commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60; root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17.
- Backend: `npm ci`, then selected Vitest auth, OAuth/OIDC, hostValidation, safeFetch, imageProxy and emailSanitizer suite. 14 test files passed, 375 tests passed, 0 failed.
- Frontend: `npm ci`, then `node --test src/utils/imageProxy.test.js`. 1 test file passed, 4 tests passed, 0 failed.
- Aggregate: 15 test files, 379 tests passed, 0 failed. Machine-readable evidence: `extraction/manifests/security-test-results-2026-10-17-35067fc.json`.
- The first attempt failed due to an incorrect snapshot working-directory path in the new workflow. The path was corrected; the successful run above is authoritative.
- This closes only the selected test-execution task, not the five security capabilities. Caller/sink/redirect/DNS-rebinding/session/provider-state tracing, complete test coverage, dependency closure and UI behavior mapping remain open. License/provenance and overall extraction PASS remain open.


## 2026-10-17 — Static trace continuation

- Trace artifact: `extraction/manifests/security-transport-database-trace-2026-10-17.md`.
- Reviewed immutable source for auth/session, OAuth/OIDC, hostValidation/safeFetch, email sanitizer/image proxy, accounts CRUD, IMAP manager, send/draft routes and migration runner.
- New confirmed implementation observations: Redis-backed sessions and CSRF guard on mutating `/api` routes; session regeneration and MFA replay protection; OAuth/OIDC state and PKCE flow; safeFetch validates the network connection target on each redirect hop; IMAP/SMTP host validation during account creation/update; IMAP address pinning again at connect time; account secrets encrypted at persistence; backoff/concurrency controls; account delete cascades database rows before asynchronous live disconnect; and send/draft recovery paths.
- Database tree contains 66 ordered SQL migrations (`0001`–`0066`) plus a runner with advisory lock and transaction-aware migration application. The detailed table/index/constraint/runtime-consumer map is still open.
- This is static trace evidence only. OIDC/OAuth outbound callers, SMTP connect-time policy, all sanitizer/render sinks, full IMAP recovery graph, all 66 migration semantics, third-party provenance and redistribution clearance remain unverified.
- Existing selected security test evidence remains 379 passed / 0 failed across 15 files. Full backend/frontend/native checks have not been established by this trace.


## 2026-10-17 — PostgreSQL schema trace

- Added `extraction/manifests/postgres-schema-runtime-map-2026-10-17.md`.
- Enumerated migrations `0001_baseline.sql` through `0066_email_accounts_icon.sql` (66 files) and inspected DDL/data operations. The runner uses a session-level advisory lock, records applied versions in `schema_migrations`, runs normal migrations transactionally and handles `-- no-transaction` files statement-by-statement for concurrent index operations.
- Initial FK/cascade map identifies core users/accounts/messages/folders/aliases/snooze relations and later plugin configuration, unfetchable UID and spam-training relations. Account deletion's DB cascades do not prove cleanup of in-memory connections, caches, files or plugin-owned external state.
- Remaining: machine-readable column/index/constraint inventory, SQL-consumer mapping, real PostgreSQL migration tests from clean and upgrade states, and partial-failure/idempotency tests for no-transaction migrations. This is not a schema closure or extraction PASS.
