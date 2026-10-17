# Extraction Progress — 2026-10-17

## Current source library
- Upstream: https://github.com/maathimself/mailflow
- Commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Snapshot: `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source`
- Integrity: PASS — 1,350 blobs, 147 nested trees, 0 gitlinks, 0 Git LFS pointers. Root and all nested tree hashes reconstructed and verified.
- Snapshot evidence: https://github.com/Rilan-Dev/mailflow/actions/runs/39030794029

## Work started after snapshot capture
- **Path dispositions:** 182 of 1,350 paths classified by role; 1,168 remain UNCLASSIFIED. Newly classified transport and migration paths still have UNREVIEWED licenses and partial closure. Classification of a path does not mean it is license-cleared or reusable.
- **Capability map:** 16 capability candidates; 3 have partial static security traces; 0 are closed.
- **Security slice:** auth/session, OAuth/OIDC, host validation, safe fetch, image proxy and email sanitization. Selected test execution now PASS: 15 files / 379 tests, 0 failures; see `extraction/manifests/security-test-results-2026-10-17-35067fc.json`. Static caller/threat-model closure remains partial.
- **Dependencies:** 1,124 locked package entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. 0 third-party package licenses have been cleared.
- **Upstream updates:** six-hour scheduled/manual capture workflow resolves live upstream main, creates a new immutable snapshot for each new commit, verifies it, and opens/updates a reviewable PR. Source updates are not auto-merged and require provenance/license review.

## Remaining gates
- Complete transitive first-party dependency and behavior closure across all 16 capabilities.
- Classify all remaining source paths and review path-level provenance, third-party assets and package licenses.
- Run test suites against the pinned source and record exact outputs.
- Reconcile native build/runtime tools, Docker, environment contracts, migrations, Electron and Android.
- Keep AGPL-3.0/commercial-license/CLA obligations intact; no blanket redistribution or host-integration clearance is implied.

**Status:** full source snapshot is captured and verified. The application is not yet fully extracted into independently reusable capabilities; extraction PASS is not claimed.


## Update — 2026-10-17 — Security test slice and upstream review safety

- Selected pinned-snapshot security tests passed: backend 14 files / 375 tests and frontend image proxy 1 file / 4 tests. Total 15 files / 379 tests; zero failures.
- Run evidence: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550
- Machine-readable evidence: `extraction/manifests/security-test-results-2026-10-17-35067fc.json`.
- Updated `.github/workflows/mailflow-source-snapshot.yml` so scheduled/manual upstream captures create or update `automation/mailflow-upstream-snapshot` as a reviewable pull request after verification, instead of pushing newly captured upstream code directly to main. This preserves immutable snapshots while preventing unreviewed upstream changes from being silently merged.
- Remaining status is unchanged for overall extraction: 1,311 blobs unclassified, third-party license/provenance review open, capability/dependency closure open, redistribution and host integration not cleared.


## Update — 2026-10-17 — Security/transport/schema tracing
- Trace: `extraction/manifests/security-transport-database-trace-2026-10-17.md`.
- Schema map: `extraction/manifests/postgres-schema-runtime-map-2026-10-17.md`; 66 SQL migrations are indexed with key relationships and runtime capability linkage, but column-level DDL and exhaustive SQL consumer closure remain open.
- Path register: 112 paths classified by role; 1,238 remain unclassified. Classification is not reuse permission; new paths remain license-unreviewed.
- Account/API trace covers encrypted credentials, user ownership checks, connection policy, asynchronous disconnect after delete, IMAP cooldown/concurrency, SMTP connect-time DNS pinning/TLS policy, and send/draft recovery paths.
- Remaining gates: complete security caller/sink closure, full migration object/runtime map and PostgreSQL upgrade tests, all capability closures, third-party license/provenance and redistribution clearance, and full backend/frontend/native verification.


## Update — 2026-10-17 — OIDC and frontend HTML sink trace
- Added explicit OIDC network-boundary finding: discovery validates issuer/endpoints but uses native fetch rather than the pinned safeFetch connector; DNS rebinding and redirect-to-private behavior remain unclosed. The allow-insecure provider branch bypasses host validation and disables TLS verification and must remain a high-risk opt-in pending authorization/policy review.
- Traced frontend body rendering through sandboxed email iframe/CSP, optional div-render `prepared.html`, plain-text `linkifyText` sink, composer DOMPurify/app-origin image policy and signature editor innerHTML paths. Preparation/escaping/caller closure remains pending.
- Role classification advanced to 124 paths; 1,226 remain unclassified. License/provenance remains unreviewed for these paths.
- Transport workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282 (queued at last check). Frontend email-render security job added to security workflow; results pending.


## Update — 2026-10-17 — Selected test expansion passed
- Security/render workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39034509010 — 21 file-runs, 500 tests passed, 0 failures (backend auth/OAuth/OIDC/host validation/safeFetch/image proxy/sanitizer; frontend image proxy and email HTML/render sinks).
- IMAP/SMTP/account workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39034692849 — 42 test files passed, 1 skipped; 777 passed, 10 skipped, 0 failures.
- Aggregate selected evidence: 64 file-runs, 1,277 passed tests, 10 skipped, 0 failures. Machine-readable: `extraction/manifests/closure-test-results-2026-10-17-35067fc.json`.
- Snapshot/inventory verifier after the updated path and capability manifests: https://github.com/Rilan-Dev/mailflow/actions/runs/39034692855 — success.
- This is selected suite evidence, not full backend/frontend/native verification or extraction PASS. OIDC native-fetch redirect/DNS pinning, complete sink closure, full migration object/consumer mapping and licensing/provenance remain open.


## Update — 2026-10-17 — Renderer dependency classification
- Added role-level classifications for CSS scoping/style registry, remote-image CSP/lazy-loading helpers, message body tests, and compose signature/reply-draft tests. Current register: 131 classified, 1,219 unclassified.
- Capability closure references now include the new renderer and image-policy dependencies. These are partial role classifications only; licensing remains unreviewed.
- Latest security/render suite passed 500 tests and transport suite passed 777 with 10 skipped; full pinned-snapshot workflow (including PostgreSQL migration clean install/rerun and Android debug build) remains pending at https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662. That run predates the newest closure-manifest edit; the run triggered by the latest closure update should be used for final verifier result.


## Update — 2026-10-17 — Reusable capability runtime trace
- Added `extraction/manifests/reusable-capability-runtime-trace-2026-10-17.md` covering search/unified inbox, contacts/CardDAV, rules/categorization/spam, plugin registry/activation/API, AI provider/HTTP, and WebSocket/push notifications.
- Capability register now records 14 partial traces and 2 not-started capabilities (frontend shell and deployment/release); zero capabilities are closed. Path register: 182 role-classified / 1,168 unclassified. Role classification is not license clearance.
- Full backend lint/plugin boundary/tests/production audit, full frontend lint/tests/build/production audit and PostgreSQL 17 clean install + 66 migrations + idempotent rerun passed in run https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662. Android web build/Capacitor sync passed; Gradle did not start because the wrapper lacked executable mode. Workflow now explicitly invokes `bash ./gradlew`; run https://github.com/Rilan-Dev/mailflow/actions/runs/39035662163 is pending.
- High-priority unresolved security item remains OIDC discovery/token native fetch without safeFetch connection pin/redirect policy, especially explicit insecure issuer mode. License/provenance and redistribution clearance remain open.


## Update — 2026-10-17 — Full suite verification evidence
- Backend full suite: 2,804 passed, 41 skipped, 0 failed (166 files passed, 6 skipped); lint, plugin boundary lint, syntax and production dependency audit passed.
- Frontend full suite: 3,142 passed, 0 skipped, 0 failed; lint, production build and production dependency audit passed. Electron Node tests ran as part of the frontend suite.
- PostgreSQL 17: 66 migrations applied, idempotent rerun, 32 tables, 97 indexes, 282 constraints. Snapshot verifier passed in run https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662.
- Android web build and Capacitor sync passed; Gradle has not yet started successfully due the immutable wrapper's non-executable mode. Workflow now explicitly uses `bash ./gradlew`; current run https://github.com/Rilan-Dev/mailflow/actions/runs/39035810908 is pending.
- Reusable capability runtime trace: `extraction/manifests/reusable-capability-runtime-trace-2026-10-17.md`. Current path register: 182 classified, 1,168 unclassified. Capability closure: 14 partial, 2 not started, 0 closed. Licensing/provenance remains open.


## Update — 2026-10-17 — Security and mail lifecycle evidence
- Security static trace expanded; identified unresolved OIDC native-fetch DNS rebinding/redirect-policy gap. Security tests: 379 passed in run 39031942550.
- IMAP/SMTP account lifecycle test slice: 42 files / 777 passed / 10 skipped in run 39037515886; no live provider integration. Draft-ingest tests were skipped.
- Path register: 183 classified / 1,167 unclassified; security classifications remain license-unreviewed. Capability closure is still partial; full verifier re-run is queued after latest manifest changes.


## Update — 2026-10-17 — Dependency triage
- Direct dependency runtime map added at `extraction/manifests/dependency-runtime-license-triage-2026-10-17.md`. Package license/provenance review remains 0/1,124 cleared; lockfile metadata is not proof of license compliance.
- The source pin's current path summary is refreshed to 183 classified / 1,167 unclassified; a new verifier run is queued after manifest changes.
