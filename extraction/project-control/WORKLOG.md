# Worklog — Append-only

## 001 — 2026-10-14 — Initial MailFlow baseline
- Resolved main to commit e7a53760a7e4b15e0ee631533655d99dde657599.
- Captured root tree 27059315bc16155f0064dc136aae94cd5097cb02; recursive response complete with 1462 entries (1319 blobs, 143 directories).
- Saved full path/mode/type/object-SHA/size inventory in `extraction/manifests/source-tree-2026-10-14.json`.
- Inspected README, AGPL license, commercial license, CLA, contributing guidance and CI workflow.
- Identified dual-license notice and CLA; per-path license review remains pending.
- Added user guide, extraction/update prompts and project-control records.
- No application source copied; no extraction PASS claimed.
- Next: full capability discovery, path disposition, dependency closure, license/provenance review and independent reconciliation.

## 002 — 2026-10-14 — Add preliminary capability map and update watcher
- Added a preliminary capability candidate index from the complete source tree and an all-1,319-blob path-disposition register. Every path remains UNCLASSIFIED, license UNREVIEWED and closure UNMAPPED; these are explicit gaps, not a gate pass.
- Added a scheduled/manual GitHub Actions watcher to detect changes to upstream main and create or update a tracking issue with old/new commit/tree pins and a compare URL.
- Added the end-to-end user guide, initial extraction and update-review prompts, and source update playbook.
- The watcher has not been run end-to-end and must not be assumed to watch this repository's pin until it can read external-repository state safely.
- Application source remains uncopied; no extraction PASS claimed.

## 003 — 2026-10-14 — Trace first architecture candidates
- Inspected pinned backend/frontend manifests, backend entry point, plugin boundary guide, IMAP manager, message service, image proxy, email sanitizer, AI route, frontend shell, Electron security, Android security, Docker compose and CI workflow.
- Added a 16-capability initial architecture map with source blob SHAs and test candidates; validated that every referenced path exists at the pinned tree.
- Corrected the spam pipeline candidate to the actual path and rechecked blob identity.
- All capabilities remain CANDIDATE_NOT_CLOSED; this is not dependency closure. All source paths remain unclassified and no application source has been copied.

## 004 — 2026-10-14 — Add and cross-check inventory verifier
- Added `extraction/tools/verify-inventory.mjs` to check the pin, full-tree manifest, all-file disposition register, candidate areas and architecture path/blob identities.
- Independently ran equivalent consistency checks against the stored JSON and live pinned tree using the GitHub connector: PASS; 1,462 tree entries, 1,319 blobs, zero missing/duplicate paths or SHA/mode mismatches in the register, and zero missing architecture candidate paths.
- The Node verifier script itself has not been executed in a local runtime. CI execution is pending workflow availability on the default branch.
- All 1,319 dispositions remain UNCLASSIFIED; this does not pass capability closure or authorize copying.

## 005 — 2026-10-14 — Make MailFlow extraction workspace self-contained
- Copied the 63-file shared `source-extraction-agent/` framework from canonical `ai-reusable-libraries` commit `1e6ba9588e715e698722949e1c592b08f4ea7a00`; every transferred framework blob retained the same Git SHA.
- Migrated 21 MailFlow-specific records from the reusable-libraries workstream into `extraction/`; transferred source-record blob identities match the original SHA values.
- Added `source-extraction-agent/UPSTREAM_PIN.json`, local-copy policy, `extraction/README.md`, durable extraction memory and session conventions.
- Opened https://github.com/Rilan-Dev/mailflow/pull/1. The PR is open and unmerged at the time of this entry.
- This is a documentation/control-workspace migration only. No MailFlow application source was copied, the proposed source pin was not promoted, and source-copy authorization remains false.
- Next: update the central catalog and remove duplicate MailFlow working records from `ai-reusable-libraries` in a separate PR; keep monitoring disabled until the watcher supports external-repository pins.


## 006 — 2026-10-14 — Remove duplicate MailFlow workstream from global library
- Opened https://github.com/Rilan-Dev/ai-reusable-libraries/pull/6 to remove the migrated 21-file MailFlow workstream from the reusable-libraries repository, update the global catalog to point to this repository, and disable the watcher until external pin retrieval is supported.
- PR #6 remains open and unmerged at the time of this note. The canonical generic framework and cross-source catalog remain in `ai-reusable-libraries`.

## 005 — 2026-10-17 — Start full source snapshot extraction
- Confirmed MailFlow workspace PR #1 merged to main at 7987a4eff2a340d732365340840221609a7f446c. Closed stale conflicting PRs #2 and #3 as superseded rather than merging duplicate changes; retained their useful memory/source-identity intent on main.
- Confirmed the canonical upstream maathimself/mailflow main was at 35067fc2876d50980f1a8a3b8ea72b5467b69f60 with root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17 at review time.
- Added extraction/tools/capture-upstream-snapshot.mjs. It captures Git blobs directly, preserves file modes and symlinks, writes an immutable commit-addressed source tree, generates commit-specific manifests, carries forward path assessments only when blob SHA and mode are unchanged, and checks exact blob SHA during capture.
- Updated extraction/tools/verify-inventory.mjs to resolve manifests through the pin and verify snapshot blob identity, file set, symlinks and executable bits.
- Added .github/workflows/mailflow-source-snapshot.yml to capture upstream main on dispatch, every six hours, and on workflow/tool introduction. It opens or updates a reviewable PR rather than silently merging source changes.
- Refreshed NEXT_ACTION.md, PROJECT_STATE.md and durable agent memory. Source capture has been authorized by the user; capability closure, per-path licensing/provenance, redistribution clearance and host integration remain unverified.
- Snapshot workflow run and generated PR are not yet evidenced in this worklog. Do not claim a source snapshot is captured until its actual output is reviewed.

## 006 — 2026-10-17 — Full upstream snapshot captured and tree verified
- The first capture workflow run created the snapshot, but its initial PR-creation step failed because repository Actions settings prohibit the GITHUB_TOKEN from creating PRs. The first attempt's temporary automation branch contained an unintended upstream-source gitlink and was not merged.
- Corrected the workflow to clone upstream outside the target working tree and publish the verified snapshot directly to main, matching the user's explicit main-branch instruction. Removed PR-creation dependency.
- Captured upstream maathimself/mailflow commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60, tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17.
- Snapshot path: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source. Snapshot manifest records 1,350 copied blobs, 0 blob hash failures, 147 tree entries and 0 gitlinks.
- GitHub Actions verifier run https://github.com/Rilan-Dev/mailflow/actions/runs/39030338698 completed successfully. Exact log: PASS: inventory consistency checks passed; tree entries 1497, blobs 1350, trees 147; reconstructed root tree SHA a2a82b50b8a1ac24a273e55dc0f9418aefdfed17; all 147 nested tree SHA values verified. Snapshot file set, blob hashes, symlinks and executable bits passed.
- Compared initial discovery inventory to current upstream: 31 added blobs, 116 changed blobs, 1,203 unchanged blobs, 0 removed blobs. All 1,350 current paths remain UNCLASSIFIED / license UNREVIEWED / closure UNMAPPED.
- Added current-pin architecture map, upstream delta report, capability closure tracker and direct import/route scan across 16 files (78 first-party import lines and 57 route signatures). These are partial evidence only, not transitive closure.
- Next: security closure (auth/OAuth/OIDC, host validation, safeFetch/image proxy, sanitizer), then IMAP/account lifecycle, DB/migrations, and remaining capability families. Licensing/provenance review remains mandatory.

## 007 — 2026-10-17 — Begin security and licensing closure
- Added machine-readable current-pin capability closure tracker, partial direct import/route scan, and a five-capability security closure slice with source blob SHAs and 15 test references.
- Reviewed current snapshot's LICENSE, LICENSE-COMMERCIAL, CLA.md, README.md, backend/package.json and frontend/package.json. Updated six path dispositions with narrow evidence-backed classifications. License and redistribution clearance remains pending; package manifests are only partially mapped.
- Updated closure tracker: three capabilities now marked PARTIAL_STATIC_TRACE_NOT_CLOSED (auth/identity, image proxy/privacy, message ingestion/rendering). All other capability areas remain candidates/not started; no capability is closed.
- Enhanced verifier to scan Git LFS pointer files; the successful run found 0 LFS pointers and 0 gitlinks. Root tree and all 147 nested tree SHA checks passed.
- Current counts: 1,350 source blobs; six initial path records classified; 1,344 remain UNCLASSIFIED. License/provenance and transitive dependency closure remain open.
- Next: continue detailed auth/OAuth/OIDC, hostValidation/safeFetch/imageProxy/emailSanitizer caller and policy tracing, then IMAP/account lifecycle and DB migrations. Run listed tests in a real checkout; do not represent static code inspection as test PASS.

## 008 — 2026-10-17 — Inventory external dependency closure
- Parsed the current pinned backend/frontend package manifests and lockfiles from the immutable snapshot.
- Added extraction/manifests/dependency-inventory-2026-10-17-35067fc.json with 445 backend and 679 frontend lockfile package entries (1,124 total), including resolved versions, lockfile integrity/resolution metadata, direct/transitive status, dev/optional/peer flags and any license metadata present.
- Added extraction/manifests/DEPENDENCY_CLOSURE_2026-10-17.md. Current direct dependencies: 50; direct dev dependencies: 16. No external package license or provenance is cleared by this inventory; dependencies are inventoried, not vendored.
- Confirmed live upstream main still resolves to 35067fc2876d50980f1a8a3b8ea72b5467b69f60 / a2a82b50b8a1ac24a273e55dc0f9418aefdfed17 at the latest check.
- Next: map imported packages and runtime/native build usage, audit package licenses/provenance, and continue security + IMAP/account/database closure. Snapshot integrity remains PASS; full extraction remains open.

## 009 — 2026-10-17 — Expand path classification and security closure evidence
- Classified 33 additional security source/test paths as DEPENDENCY_CLOSURE candidates based on the static trace. Source modules remain CANDIDATE_REQUIRES_CLOSURE; test files are TEST_EVIDENCE_CANDIDATE / TESTS_IDENTIFIED_NOT_RUN. None are license-cleared or reusable-approved.
- Current path register: 39 paths have initial classifications; 1,311 remain UNCLASSIFIED. The 1,350-blob inventory is still complete and unchanged.
- Added extraction/manifests/extraction-progress-2026-10-17.json and EXTRACTION_PROGRESS_2026-10-17.md to consolidate snapshot verification, path counts, capability state, dependency inventory and open legal/reuse gates.
- The dependency inventory records 1,124 locked packages, 50 direct dependencies and 16 direct dev dependencies. All third-party license/provenance review remains open.
- Verifier hardening now fails on unexpected executable bits and any Git LFS pointer that would require uncaptured external objects. The latest successful run before this path-register expansion detected 0 LFS pointers; workflow reruns on current manifest updates.


## 008 — 2026-10-17 — Security, transport and database trace advanced
- Read the current project-control checkpoint, source pin, current-pin architecture/capability/security manifests and immutable snapshot source. Confirmed the pinned source identity remains commit `35067fc2876d50980f1a8a3b8ea72b5467b69f60` / tree `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`.
- Added `extraction/manifests/security-transport-database-trace-2026-10-17.md` with source-grounded call-path evidence for authentication/session, OAuth/OIDC, host validation/safeFetch, sanitizer/image proxy, account CRUD, IMAP connection controls, send/draft handling, and migration-runner semantics.
- Static observations include session regeneration and MFA replay controls; state/nonce/PKCE; redirect-hop connection validation in safeFetch; IMAP/SMTP host validation at account create/update and IMAP connect; encrypted account secrets; account delete followed by asynchronous disconnect; connection/auth cooldowns; send-hold and sent-metadata retries; and 66 ordered migrations.
- Confirmed that `safeFetch` redirect-hop protections do not prove every OAuth/network caller uses that helper. Native fetch and explicit insecure-fetch branches remain caller-by-caller review targets. SMTP connect-time policy and all sanitizer/rendering sinks also remain open.
- No immutable upstream source files changed. No extraction PASS or reuse clearance claimed. Snapshot integrity remains PASS; selected security tests remain 379/379 passing in run https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550.
- Next: finish security call-site/sink closure, produce a complete 66-migration schema/runtime-consumer map, trace IMAP sync/recovery and account-owned cleanup, then expand dependency/license classification and verification.


## 009 — 2026-10-17 — PostgreSQL migration inventory and consumer map
- Enumerated the immutable snapshot's 66 ordered SQL migrations (0001–0066) and inspected all migration files for table/column/index/constraint changes, data backfills, drops/renames and no-transaction index operations.
- Read `backend/src/services/migrations.js` and recorded its lexical ordering, session-level advisory lock, schema_migrations ledger, statement-timeout behavior, transactional migrations and individual-statement execution for `-- no-transaction` migrations.
- Added `extraction/manifests/postgres-schema-runtime-map-2026-10-17.md`: baseline core table relationships, migration-by-migration capability linkage, account/user cascade observations and high-risk data migrations (contacts v2 and plugin data/config moves).
- Cross-checked account API and runtime entry points: account secrets are encrypted; ownership checks scope list/update/delete; account delete removes DB state before async live disconnect; IMAP manager has pinned connection resolution and backoff/concurrency controls.
- The schema artifact is intentionally marked INITIAL / NOT CLOSED: it is a human-readable migration index, not yet a full machine-readable column/constraint inventory, a live database migration test, or exhaustive SQL-consumer map. No extraction PASS or license clearance claimed.
- Next: generate column-level DDL inventory, map runtime consumers and verify migration upgrades in PostgreSQL; continue IMAP sync/recovery, security caller/sink closure and third-party license/provenance review.


## 010 — 2026-10-17 — Broader IMAP/SMTP/account test workflow added
- Inspected `imapManager.connectAccount`, `disconnectAccount`, `syncFolders`, `syncMessages`, and `connectAllForUser` call paths. Observed duplicate-connect guard, cooldowns, bounded connection handshake, policy-based host pinning, initial sync, optional separate backfill, pool prewarm, sync/plugin timers, folder pruning, UIDVALIDITY purge and re-backfill, UID-keyed idempotent message upsert, read/star grace windows and thread propagation.
- Inspected `smtpTransport.js`: it re-resolves/pins the SMTP host at send time, refreshes OAuth tokens near expiry, decrypts account credentials, fails closed on plaintext SMTP unless the administrator allows insecure TLS, and tries alternate validated addresses only on pre-delivery connection errors within a bounded budget.
- Added `.github/workflows/mailflow-transport-closure.yml` to run 43 targeted IMAP/SMTP/account/draft/mailbox/send tests against the immutable snapshot with Node 22. Initial run https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282 was queued at the last check; no pass/fail claim is made yet.
- Source pin remains unchanged. Snapshot capture/inventory verification after manifest changes passed at https://github.com/Rilan-Dev/mailflow/actions/runs/39034359461. CI on recent documentation commits remains in progress/queued; independent trace work continues.


## 011 — 2026-10-17 — OIDC boundary and frontend HTML sink trace
- Inspected OIDC discovery implementation: non-insecure flow validates issuer and advertised endpoint hostnames, but actual discovery/token fetches use native fetch rather than the guarded safeFetch connector. Host validation is not tied to the socket's resolved address, and native redirects do not inherit the per-hop connector policy. The explicit `allow_insecure` branch skips host validation/HTTPS-only enforcement and sets `rejectUnauthorized: false`; documented this as a high-priority unresolved security closure item, not a blanket exploitability claim.
- Traced frontend HTML sinks: sandboxed `MessageBodyView` iframe and CSP, `MessagePane` optional `prepared.html` div renderer and `linkifyText(body.text)` fallback, `ComposeModal` DOMPurify/app-origin sanitizer, and `SignatureEditor` innerHTML initialization/source-edit path.
- Added explicit security follow-ups in `extraction/manifests/security-transport-database-trace-2026-10-17.md`, `extraction/project-control/ISSUES.md` and `RISKS.md`.
- Classified 12 frontend source/test paths by role in the path-disposition register. Current total: 124 role-classified paths, 1,226 unclassified. Newly classified paths remain license-unreviewed and are not cleared for reuse.
- Expanded `.github/workflows/mailflow-security-closure.yml` with frontend HTML/render/image-policy tests; added broader transport tests in `.github/workflows/mailflow-transport-closure.yml`. Transport run https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282 was queued at the last check. No test result is claimed yet for either newly expanded suite.
- Next: trace and test OIDC redirects/private-host policy; inspect div-render preparation and linkifier escaping; close signatures/attachments; finish SQL consumer and migration test mapping; continue provenance/licensing.


## 012 — 2026-10-17 — Selected security/render and IMAP/SMTP test suites passed
- Inspected completed Actions jobs and logs rather than inferring results from workflow configuration.
- Security workflow https://github.com/Rilan-Dev/mailflow/actions/runs/39034509010: backend 14 files / 375 passed; frontend image proxy 1 file / 4 passed; frontend email HTML/render suite 6 files / 121 passed. Total 21 files, 500 tests passed, zero failures.
- Transport workflow https://github.com/Rilan-Dev/mailflow/actions/runs/39034548854: 42 test files passed, one skipped; 777 tests passed, 10 skipped, zero failures. The logs include mocked failure-path warnings but the workflow/job concluded success.
- Aggregate selected test evidence: 64 file-runs, 1,277 passed, 10 skipped, zero failures. Machine-readable artifact: `extraction/manifests/closure-test-results-2026-10-17-35067fc.json`.
- Exact snapshot/inventory verifier after manifest changes: https://github.com/Rilan-Dev/mailflow/actions/runs/39034548818 — success. Source identity remains commit `35067fc2876d50980f1a8a3b8ea72b5467b69f60` / tree `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`.
- No full backend/frontend suite, native Android/Electron build, capability closure, license/provenance clearance or extraction PASS is inferred from the selected suites.
- Continue OIDC network policy, div-render/linkifier sink proof, full migration object/runtime map, IMAP account-cleanup graph and third-party license/provenance review.


## 013 — 2026-10-17 — Full pinned-snapshot verification workflow launched
- Added `.github/workflows/mailflow-full-snapshot-verification.yml` to run exact snapshot inventory verification, full backend lint/plugin boundary/syntax/test/audit, full frontend lint/test/build/audit, and Android sync/unit-test/debug APK build. Frontend's Node test suite includes Electron test files.
- Run https://github.com/Rilan-Dev/mailflow/actions/runs/39034814909 was queued at the last check; no result is claimed. It runs against the pinned immutable snapshot, unlike root CI.
- Existing targeted suites passed: security/render 500 tests; transport/account 777 passed and 10 skipped; aggregate 1,277 passed, 10 skipped, zero failures.
- Open security item remains OIDC discovery/token native fetch without safeFetch connection pin/redirect policy, especially explicit insecure issuer mode. HTML div-render/linkifier/signature paths need end-to-end proof. Path classifications are 124/1,350, with 1,226 unclassified; license/provenance remains open.


## 014 — 2026-10-17 — Clean PostgreSQL migration verification added
- Extended `.github/workflows/mailflow-full-snapshot-verification.yml` with PostgreSQL 17 service job. It runs the pinned migration runner twice against a clean database, asserts all 66 migration versions were recorded, and sanity-checks public table/index/constraint counts.
- This covers clean-install and idempotent second-run behavior only. Upgrade fixtures from prior versions and crash/partial-failure simulation for no-transaction migrations remain open.
- Workflow commit: `3aabe903e75196956c49e77b3499467496578c12`; wait for the new run's actual result before recording a database migration PASS.


## 015 — 2026-10-17 — Full suite and PostgreSQL checks passed; Android wrapper command fixed
- Inspected full verification run https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662. Exact snapshot verifier, full backend lint/plugin boundary/syntax/test/audit, full frontend lint/test/build/audit, and PostgreSQL 17 clean migration install/rerun all passed.
- PostgreSQL job recorded 66 migration ledger rows and passed table/index/constraint sanity checks after applying all migrations twice.
- Android web build and Capacitor sync passed; Gradle invocation failed with exit 126 because the upstream pinned `gradlew` file is not executable in the snapshot (permission denied before Gradle ran). This is a workflow invocation issue, not evidence of Android source compilation failure.
- Preserved immutable snapshot mode and fixed workflow command to `bash ./gradlew testDebugUnitTest assembleDebug --no-daemon`, commit `981a7fbaec746ca765424c9e24572101716cca96`. New run must confirm Android compilation and unit tests.
- Until the corrected Android job succeeds, overall full verification remains PARTIAL. Licensing/provenance and capability closure remain open regardless of CI.
