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
