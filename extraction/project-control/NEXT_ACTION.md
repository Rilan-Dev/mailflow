# Next Action — MailFlow Extraction

## Completed checkpoint
The full upstream Git tree at commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60 is stored at extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source. The source pin and commit-specific manifests are updated. GitHub Actions verified 1,350 source blobs, exact file-set/mode/symlink identity, reconstructed the root tree SHA a2a82b50b8a1ac24a273e55dc0f9418aefdfed17 and all 147 nested tree SHAs; it detected 0 Git LFS pointer files and 0 gitlinks. Latest full verifier evidence: https://github.com/Rilan-Dev/mailflow/actions/runs/39030794029

## Immediate next work
1. Continue the security closure slice against the immutable snapshot: auth.js, oauth.js, oidc.js, auth middleware/session config, authLimiter, hostValidation, safeFetch, imageProxy and emailSanitizer. Trace callers, route mounting, session/Redis behavior, provider state/nonce/PKCE, private-host policy, DNS rebinding, redirect hops, sanitization sinks, error paths and user-visible states.
2. Run the identified auth/OAuth/OIDC, hostValidation/safeFetch, imageProxy and sanitizer tests in a real checkout. Static trace did not execute tests. Record exact commands and outcomes.
3. Close the dependency graph using extraction/manifests/dependency-inventory-2026-10-17-35067fc.json: 1,124 lockfile package entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. Map imports/runtime/native build usage; review each third-party license/provenance before marking eligible.
4. Review the 116 changed and 31 new upstream blobs first. The October 14 candidate/architecture maps are historical; use architecture-map-2026-10-17-35067fc.json, capability-closure-2026-10-17-35067fc.json and security-closure-2026-10-17-35067fc.json.
5. Continue path-level classification. Thirty-nine source paths have initial classifications; 1,311 source blobs remain UNCLASSIFIED. The six license/dependency metadata paths are narrowly reviewed; security paths are only role-classified and remain license-unreviewed. Keep source license/provenance and dependency closure statuses evidence-backed.
6. Close remaining capabilities in dependency order: IMAP/account lifecycle; PostgreSQL schema and all migrations; message parsing/rendering; plugins; compose/drafts/attachments; unified inbox/search; CardDAV; rules/categories/spam; AI; notifications; Electron; Android; deployment/release.
7. Re-run node extraction/tools/verify-inventory.mjs after tree/disposition/closure manifest updates. Keep upstream snapshot automation scheduled and direct to main; never use extracted code in a host app until dependency closure and license gates pass.

## Guardrails
- Keep prior snapshots immutable; new upstream commits receive new snapshot directories.
- Changed/new paths reset to UNCLASSIFIED unless both SHA and mode exactly match an already assessed path.
- Source snapshot integrity is PASS. Capability closure, third-party/license clearance, redistribution clearance, runtime validation and extraction PASS remain open.
- Upstream declares AGPL-3.0, a separate commercial-license path and CLA. Preserve notices and do not infer blanket reuse rights.


---

## Historical checkpoint preserved (pre-snapshot-verification state)

The following is retained for continuity. The current authoritative state is described above; historical action items below may be completed or superseded.

# Next Action — MailFlow Source Extraction

## Immediate work
1. Check the run of .github/workflows/mailflow-source-snapshot.yml triggered by its addition on main. If no run started, manually dispatch it from GitHub Actions.
2. Review the generated PR from branch automation/mailflow-upstream-snapshot. Confirm the pin points to the live maathimself/mailflow main commit and root tree, the snapshot is under extraction/snapshots/<commit>/source, and every blob SHA was checked.
3. Run node extraction/tools/verify-inventory.mjs in a real checkout after the snapshot PR is available; fix every actual failure and record the exact output. Do not infer success from workflow YAML or a PR existing.
4. Merge the source snapshot PR only after the exact-copy verification and license notices are retained. Keep the snapshot commit immutable.
5. Continue the 1,300+ path review: classify all paths, review third-party provenance, AGPL/commercial license terms, CLA, LFS/submodules, and map transitive first-party dependency closure.
6. Trace full capabilities through source, callers, schemas/migrations, runtime/config, permissions, retries, recovery, tests, UI states, Electron and Android.
7. Keep each upstream update as a new commit-addressed snapshot. The watcher may create/update a reviewable PR; never overwrite a prior snapshot or silently merge new upstream code into a host application.

## Guardrails
- Current upstream observed during the 2026-10-17 review: https://github.com/maathimself/mailflow, main commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60, root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. The workflow must resolve live main at execution time; do not assume this pin remains current.
- PR #1 (self-contained workspace) is merged. PRs #2 and #3 were closed as superseded after PR #1; their useful memory/source-identity changes are being retained on main.
- Source snapshot capture is authorized by the user, but license clearance, capability closure, host-integration readiness and extraction PASS are not established.
- The reusable framework remains in source-extraction-agent/; MailFlow-specific evidence stays under extraction/.

## Update — 2026-10-17 — Security test execution

The new workflow `.github/workflows/mailflow-security-closure.yml` now executes the selected tests against the immutable snapshot at `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source`. Successful run: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550. Backend selected security suite: 14 files / 375 tests passed; frontend image proxy: 1 file / 4 tests passed; total 15 files / 379 tests passed, 0 failures. Exact evidence is in `extraction/manifests/security-test-results-2026-10-17-35067fc.json`.

### Next work, in order
1. Continue security caller/sink tracing and record what tests actually cover, especially OAuth/OIDC state/nonce/PKCE and redirect matching, session/Redis invalidation, DNS rebinding/private-host restrictions on every redirect, image-proxy response limits/headers, and sanitizer coverage at every render sink.
2. Trace IMAP/SMTP and account lifecycle from routes through providers, sync jobs, persistence, secrets/encryption, retries/recovery and UI states; map every first-party dependency.
3. Trace PostgreSQL schema and migrations 0001–0066, foreign keys/indexes/triggers/data backfills and runtime consumers.
4. Continue classifying all 1,350 source blobs and review third-party provenance/licenses; keep AGPL-3.0/commercial path/CLA review explicit. The 39 classified paths are not reuse clearance.
5. Expand the selected test workflow capability-by-capability, then run complete backend/frontend suites and native build/runtime checks when the relevant closure is mapped.
6. Keep snapshots immutable and use a new commit-addressed directory for every upstream change. Current snapshot automation must remain reviewable and must never imply that newly captured source is automatically cleared for reuse.

Guardrail: selected security tests PASS does not mean capability closure, licensing, redistribution clearance, host-integration readiness or overall extraction PASS.


## Update — 2026-10-17 — Security/transport/schema trace advanced

Detailed static trace recorded at `extraction/manifests/security-transport-database-trace-2026-10-17.md`.

- Authentication: traced Express route mounts, Redis-backed session setup, CSRF boundary, session regeneration, MFA/TOTP replay protection, trusted-device token hashing, and account-scoped authorization. OAuth/OIDC state/nonce/PKCE and token refresh paths are partially traced; all provider network callers, logout/session/WebSocket paths and UI states remain open.
- SSRF: confirmed `safeFetch` uses an Undici connector for each connection/redirect hop, validates IPs, and pins host connections; account create/update validates IMAP/SMTP hosts and `imapManager` resolves/pins again at connect time. Every caller/policy combination and SMTP execution path still needs closure.
- Sanitizer: traced `emailSanitizer`, `imageProxy` and `mail.js` as major paths. Enumerating every rendering sink, CID/attachment and compose/signature path remains open.
- IMAP/account lifecycle: traced authenticated account list/create/update/delete/reconnect, secret encryption, ownership checks, asynchronous disconnect after database delete, and manager backoff/concurrency behavior. Full sync/checkpoint/recovery call graph and all account-owned cleanup paths remain open.
- Database: identified 66 ordered SQL migrations (`0001`–`0066`) and the migration runner's advisory lock, transaction/no-transaction handling and schema_migrations ledger. Per-object schema/runtime-consumer map is not yet complete.
- Selected tests remain 379/379 passed from run 39031942550. No full suite/native build or capability PASS is implied.

### Next execution slice
1. Trace OIDC discovery/JWKS/token/end-session fetches and all private-host opt-in branches; enumerate every sanitizer sink and frontend iframe/srcdoc use.
2. Read and reconcile all 66 migrations into a table/column/index/constraint/backfill inventory and connect those objects to runtime SQL.
3. Continue IMAP method call graph: sync entry points, folder status/modseq/UIDVALIDITY, message body/attachment storage, retry/recovery, flags/moves/delete, sent/draft operations and UI state.
4. Expand path dispositions and third-party license/provenance review; do not treat static trace as permission to reuse.
5. Run full backend/frontend and native build checks after the capability dependency graph is mapped, and run the exact verifier again after manifest changes.


## Update — 2026-10-17 — PostgreSQL migration inventory advanced

Added `extraction/manifests/postgres-schema-runtime-map-2026-10-17.md`. It covers the baseline table relationships, migration runner semantics and the intent/runtime linkage of all 66 migrations (0001–0066). This is a migration-level map, not yet a complete machine-readable column/constraint map or exhaustive runtime SQL-consumer closure.

Immediate continuation:
1. Generate the full DDL/object inventory from all migration SQL (columns, types, defaults, unique/FK/check constraints, indexes, backfills, dropped/renamed objects), then verify it against a real PostgreSQL migration run.
2. Map runtime SQL callers to each table and key index; focus on accounts/messages/folders, auth/OIDC/MFA, contacts/CardDAV, plugins, spam, rules and AI.
3. Continue the IMAP sync call graph and account deletion cleanup, including body/attachment storage, cache and plugin lifecycle.
4. Finish OIDC/outbound fetch and HTML render sink tracing; do not treat safeFetch's guarded connector as proof that every outbound call site is safe.
5. Continue path classifications and dependency license/provenance clearance. Full backend/frontend/native checks remain a later verification item, not a reason to pause independent trace work.


## Update — 2026-10-17 — Transport regression suite queued

Added `.github/workflows/mailflow-transport-closure.yml` to execute a broader pinned-snapshot test slice across IMAP manager sync/draft/snooze behavior, move fallback, SMTP transport, account settings, draft handling, mailbox mutations, unified inbox scope, attachment ZIPs, and send/reliability/undo paths. Run: https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282 (queued at last check; no result claimed).

Do not wait for that run before continuing independent trace work. When convenient, inspect its final result and update the evidence manifest with the actual test-file/test counts and failures. Full backend/frontend/native build checks remain a later gate.


## Update — 2026-10-17 — OIDC and frontend sink follow-up
- High-priority open item: OIDC discovery/token network requests use native fetch after host validation rather than safeFetch's per-hop pinned connector; the explicit allow-insecure path bypasses host validation and disables TLS certificate checks. Trace redirects, DNS rebinding, admin-only control, response bounds and every JWKS/token/end-session call before closure.
- Frontend sink inventory now includes the sandboxed iframe/CSP, optional div-render `prepared.html`, `linkifyText(body.text)`, DOMPurify/app-origin quoted HTML, and signature-editor innerHTML. Trace source preparation, CSS scoping, text escaping and saved signature read/write boundaries.
- New frontend render-security tests are included in `.github/workflows/mailflow-security-closure.yml`; transport suite is queued at https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282. Continue independently; don't claim tests passed until actual outputs arrive.
- Current path role classification: 124/1,350; 1,226 remain unclassified. Newly classified files remain license-unreviewed and closure partial.


## Update — 2026-10-17 — Expanded targeted test evidence is green

- Security workflow https://github.com/Rilan-Dev/mailflow/actions/runs/39034509010 succeeded: 14 backend files / 375 tests; frontend image proxy 1 file / 4 tests; frontend email HTML/render security 6 files / 121 tests. Aggregate security/render slice: 21 files, 500 tests passed, 0 failures.
- Transport workflow https://github.com/Rilan-Dev/mailflow/actions/runs/39034548854 succeeded: 42 test files passed, 1 skipped; 777 tests passed, 10 skipped, 0 failures.
- Combined targeted evidence: 64 file-runs, 1,277 passed tests, 10 skipped tests, 0 failures. Machine-readable record: `extraction/manifests/closure-test-results-2026-10-17-35067fc.json`.
- Snapshot/inventory verifier succeeded after path and capability manifest updates: https://github.com/Rilan-Dev/mailflow/actions/runs/39034548818. This is exact-copy/manifests integrity only; it is not overall extraction PASS.
- Keep proceeding without waiting on root CI. Next: close the OIDC native-fetch/redirect/DNS pinning risk, complete sanitizer sink proof (div renderer and linkifier), generate column-level schema object inventory and SQL-consumer mapping, and continue dependency/license/provenance review. Full backend/frontend suites and native builds are still not established by these selected runs.


## Update — 2026-10-17 — Full pinned-snapshot verification launched

Added `.github/workflows/mailflow-full-snapshot-verification.yml` with three independent jobs against the immutable snapshot:
- exact inventory/path-register verifier,
- full backend lint/plugin-boundary/syntax/tests/production audit,
- full frontend lint/tests/build/production audit plus Android sync, Android unit tests and debug APK build (Electron Node tests run through frontend `npm test`).

Run: https://github.com/Rilan-Dev/mailflow/actions/runs/39034814909 — queued at last check. Do not report it as passed until completed. This verification workflow is independent of the ongoing static tracing and should not block further work.


### Database verification add-on — 2026-10-17
The full pinned-snapshot workflow now includes a PostgreSQL 17 service job that applies all 66 migrations to a clean database, reruns the migration runner to test idempotency, and checks the resulting migration ledger/table/index/constraint counts. Latest workflow definition commit: `3aabe903e75196956c49e77b3499467496578c12`. The prior workflow run was queued before this job was added; use the run triggered by this commit for the database result. Clean install plus rerun is not an upgrade-from-old-version or partial-failure test.


## Update — 2026-10-17 — Full-suite result and Android wrapper correction

Full pinned-snapshot run https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662 completed with:
- Exact snapshot verifier: PASS.
- Full backend lint, plugin boundary, syntax, tests and production audit: PASS.
- Full frontend lint, tests, production build and production audit: PASS.
- PostgreSQL 17 clean install, all 66 migrations, second-run idempotency and schema object sanity checks: PASS.
- Android sync: PASS; Gradle build step initially failed before Gradle started because the pinned `gradlew` file lacks the executable bit (`Permission denied`, exit 126).

Do not change the immutable snapshot mode. Corrected the verification workflow to invoke the wrapper as `bash ./gradlew testDebugUnitTest assembleDebug --no-daemon` in commit `981a7fbaec746ca765424c9e24572101716cca96`. The workflow run triggered by that correction is the one to inspect for Android unit/build results. Full verification is not yet PASS until that job completes.


## Update — 2026-10-17 — Reusable capabilities traced
Added `extraction/manifests/reusable-capability-runtime-trace-2026-10-17.md`. Initial runtime call graphs now cover search/unified inbox, contacts/CardDAV, rules/categories/spam, plugin registry/activation/API, AI provider HTTP, and WebSocket/push notifications. The capability manifest records 14 partial traces, 2 not started, and 0 closed; path classification is 182/1,350 (1,168 unclassified). All new classifications remain license-unreviewed.

Full backend and frontend suites, lint/build and production dependency audits passed, and the PostgreSQL 17 job applied all 66 migrations twice successfully in run 39034971662. Android web build/Capacitor sync passed, but the Gradle step failed before starting because the snapshot wrapper is non-executable. Workflow now explicitly uses `bash ./gradlew`; run 39035662163 is pending. Next: close OIDC network policy, account/user deletion cleanup and per-capability error/recovery/UI dependencies; map SQL consumers/index plans; continue provenance/license clearance. Do not report overall extraction PASS.


## Update — 2026-10-17 — Full suite counts and current native run

The full pinned-snapshot run 39034971662 provides these verified results:
- Backend: 166 test files passed, 6 skipped; 2,804 tests passed, 41 skipped, zero failures. Backend lint, plugin-boundary lint, syntax check and production dependency audit passed.
- Frontend: 3,142 tests passed, zero skipped/failures; frontend lint, production build and production dependency audit passed. Electron Node tests are included in this frontend suite.
- PostgreSQL 17: all 66 migrations applied to a clean DB and second run was idempotent; resulting public schema has 32 tables, 97 indexes and 282 constraints.
- Snapshot verifier: passed.
- Android web bundle and Capacitor sync passed; Gradle has not yet been shown to start successfully. Several pending runs were cancelled by subsequent manifest-evidence commits while queued. Current full verification run: https://github.com/Rilan-Dev/mailflow/actions/runs/39035810908 — pending and triggered after the workflow now explicitly invokes `bash ./gradlew`. Do not update watched manifests until this run has started/completed; continue independent work in project-control docs if needed.
- Current path classification is 182/1,350 (1,168 unclassified); 14 capabilities have partial traces, 2 remain not started and none are closed. License/provenance and redistribution clearance remain open.


## Update — 2026-10-17 — Security closure second pass
- Expanded `security-transport-database-trace-2026-10-17.md` with runtime route/session wiring, OIDC state/nonce/PKCE callback behavior, safeFetch connector guarantees, image proxy bounds and sanitizer/compose sink tracing.
- Explicit unresolved risk: OIDC discovery/token exchange and Microsoft OAuth provider requests use native fetch after DNS validation, not the connection-pinned safeFetch dispatcher. DNS rebinding/redirect target controls remain open. OIDC `allow_insecure` is a deliberate bypass of HTTPS and host validation and requires policy/UX/permission review.
- Path dispositions now record 183 classified / 1,167 unclassified. Security path classifications remain dependency-closure candidates and license-unreviewed.
- Selected security tests remain PASS (run 39031942550: 379 tests). Full backend/frontend/PostgreSQL evidence remains PASS in run 39034971662. Android Gradle remains unverified: run 39035662163 was cancelled before jobs started despite the corrected bash wrapper command. Do not claim native Android build PASS.
- Next: inspect every outbound OAuth/OIDC fetch and every HTML render sink, then trace account lifecycle/IMAP/SMTP and all 66 migration consumers. Re-run the exact inventory verifier after manifest changes; keep license/redistribution gates open.


## Update — 2026-10-17 — IMAP/SMTP account lifecycle test slice
- Run https://github.com/Rilan-Dev/mailflow/actions/runs/39037515886 passed 42 test files / 777 tests, with 1 file / 10 tests skipped. It covers account routes, SMTP transport, IMAP sync/recovery, inbox mutations, draft lookup, send idempotency/reliability, attachments, remote images and related paths. The IMAP draft-ingest suite was skipped and no live IMAP/SMTP server was exercised.
- Extended capability closure for mail-transport-sync, message-ingestion-rendering and compose-and-send with source/caller/test references. All remain PARTIAL; provider interoperability, account deletion cleanup, UIDVALIDITY/checkpoint recovery, and end-to-end error/retry closure remain open.
- The previous exact inventory verifier passed in run 39037551680, before the latest capability manifest update. A fresh full verification is queued as run 39037683681. Do not treat that prior pass as verification of the newer manifest.


## Update — 2026-10-17 — Dependency runtime/license triage
- Added `extraction/manifests/dependency-runtime-license-triage-2026-10-17.md`, mapping major backend mail/auth/database/SSRF/sanitizer dependencies and frontend compose/render/native dependencies to observed source call sites.
- The lockfile inventory remains 1,124 package entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. No third-party license or provenance is marked reviewed; the direct package license strings are metadata-only. Prioritize web-push (MPL-2.0), DOMPurify (MPL-2.0 OR Apache-2.0), sharp/native libvips, pdfjs-dist bundled assets and every package with install scripts/native payloads.
- Current path register is 183 classified / 1,167 unclassified. Capability closure and redistribution remain open. Full verifier run 39037683681 was queued after capability/path manifest updates; do not rely on earlier verifier evidence for the newest manifests.
- Next: continue caller-by-caller OAuth network policy and frontend HTML sink closure; review changed/new upstream blobs against the pinned source history; map all 66 migration objects to SQL consumers and account/user cleanup; continue path-level classification and actual package LICENSE/NOTICE/provenance review.


## Update — 2026-10-17 — PostgreSQL migration inventory
- Added `extraction/manifests/postgresql-schema-runtime-map-2026-10-17.md` with all 66 ordered migrations, schema domains, major FK/index/backfill behavior and principal runtime consumers. All migration paths remain dependency-closure candidates, not license-cleared. The DB capability is still partial until each column/index/constraint and SQL caller is mapped and legacy upgrade/recovery paths are tested.
- PostgreSQL 17 clean install and idempotent rerun passed in run 39034971662 (66 migrations, 32 tables, 97 indexes, 282 constraints). This does not prove representative legacy upgrades or every SQL runtime query plan.
- Path register remains 183 classified / 1,167 unclassified. Capability manifest reconciled to these counts. Full verification run 39038119553 is pending for the latest manifest updates; no current-manifest verifier PASS is claimed yet.
