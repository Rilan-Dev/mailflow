# MailFlow Security, Transport and Database Trace — 2026-10-17

## Source pin and scope

- Upstream: `maathimself/mailflow`
- Commit: `35067fc2876d50980f1a8a3b8ea72b5467b69f60`
- Root tree: `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`
- Immutable audit root: `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source/`
- This is a static trace against pinned source. It does not change upstream files or close license/redistribution gates.

## 1. Authentication, OAuth/OIDC, sessions and SSRF

### Auth/session call path

- `backend/src/index.js` creates/connects the shared Redis client before installing Express session middleware; session storage is `connect-redis`. Startup fails closed for missing/short `SESSION_SECRET`, missing `DB_PASSWORD`, invalid `ENCRYPTION_KEY`, invalid `TRUST_PROXY_HOPS`, and missing production `APP_URL`.
- `buildSessionOptions` is called via `backend/src/utils/sessionConfig.js`; the current security test run exercised auth middleware and session-adjacent endpoints, but did not prove every WebSocket/Redis invalidation path.
- `/api` mutation requests require `X-Requested-With` except safe methods. OAuth and CardDAV are mounted outside this CSRF gate and use their own flow-specific protections.
- `backend/src/routes/auth.js` imports bcrypt, PostgreSQL transactions, encryption, auth rate limiter/events, Redis replay protection, session destruction, mailer and IMAP startup. Registration serializes first-user/admin and invite-token checks inside a transaction; successful registration and password login regenerate the session before setting authenticated state. Login performs a dummy bcrypt comparison for unknown/SSO-only users. MFA includes TOTP and email OTP branches; TOTP has a Redis replay guard and per-user/IP throttling. Trusted-device raw tokens are cookie-only and their SHA-256 hashes are stored in `trusted_devices`.
- Account authentication is not a single-file capability: closure must include `middleware/auth.js`, `utils/sessionConfig.js`, `services/{authLimiter,authEvents,rateLimiter,userSessions,lastSeen,redis,db,encryption}.js`, relevant migrations, WebSocket authentication and UI lock/MFA states.

### OAuth/OIDC

- `backend/src/routes/oauth.js` stores Microsoft OAuth state nonce in the session before redirecting; callback checks state before token requests and consumes it. Microsoft ID tokens are verified with provider JWKS and issuer/tenant checks. Access/refresh tokens are encrypted before account persistence. Microsoft refresh calls are coalesced per account to avoid racing refresh-token rotation. Google and device-code branches need equivalent end-to-end closure.
- `backend/src/routes/oidc.js` has a browser authorization/callback flow that generates state, nonce and PKCE verifier/challenge, saves session state before redirect, checks state, clears pending state before asynchronous token work, and validates ID token issuer/audience. Provider discovery/JWKS and end-session redirect generation are separate paths; private/insecure issuer opt-in needs to be reviewed at each network call and at execution time.
- Do not infer that all OAuth network calls are SSRF-protected: `safeFetch` is used for attacker-influenced/user-configured URLs, but OAuth token endpoints and provider-specific fetch paths may use native `fetch` or an explicit insecure-fetch branch. Finish caller-by-caller classification, especially OIDC discovery, JWKS, token exchange, end-session and OAuth token refresh.

### Host validation and safe fetch

- `services/hostValidation.js` checks literal IPv4/IPv6 (including mapped/embedded forms), IDNA/reserved host forms, DNS A/AAAA and system resolver answers. `resolveForConnection` returns a pinned lookup to prevent validation/connection DNS rebinding for IMAP/SMTP.
- `services/safeFetch.js` restricts schemes to HTTP(S); public targets require HTTPS by default. Its Undici connector checks literal IPs or resolves/validates hostname addresses and connects to a checked IP. The same dispatcher is used for requests and redirects, so each connection hop is validated. Redirect and caller policy still need test evidence for every call site, including explicit `allowPrivate` / `requireHttps` combinations.
- `routes/accounts.js` calls `getConnectionPolicy`, `validateHost`, and port policy at account create/update. `imapManager.js` re-reads policy and uses `resolveForConnection` at connect time. Confirm SMTP transport follows the same execution-time resolution path and that all OAuth/private-issuer opt-ins are deliberate.
- Specific remaining checks: redirects to public HTTP, mixed public/private DNS answers, redirect loops/limits, empty DNS results, IPv4 retry and TLS SNI/certificate behavior; IMAP/SMTP validation-to-connect races; all `safeFetch` call sites; private-host policy mutation between account save and connect.

### HTML sanitizer and image proxy

- `services/emailSanitizer.js` combines `sanitize-html` and `parse5`, strips the email head while preserving style blocks, normalizes unsafe href schemes, rewrites cached anchor hrefs at serve time, handles CSS URL rewriting, and bounds/guards expensive HTML parsing paths. `sanitizeEmail` permits a deliberately limited email-content tag/attribute set; draft signature preservation is a separate option.
- `services/imageProxy.js` uses `safeFetch`, with recorded controls for a 10 MiB response ceiling, 15 s overall timeout, 8 s header timeout, per-user concurrency cap 6, signature sniffing and private response caching.
- `routes/mail.js` is a major serving sink and calls image proxy, safe fetch, body helpers and sanitizer. Still enumerate every frontend `dangerouslySetInnerHTML`/iframe/srcdoc sink, compose/signature insertion path, cached-body rewrite path, CID/inline image handling, attachments and sanitizer bypass/fallback behavior. Sanitizer tests passed in the selected suite, but that is not a sink-closure proof.

### Selected test evidence already executed

Workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550

- Backend: 14 selected Vitest files, 375 tests passed.
- Frontend image-proxy utility: 1 Node test file, 4 tests passed.
- Aggregate: 15 files / 379 tests passed, zero failures.
- This validates the selected test files only; it does not close the security capability tree or replace full backend/frontend/native checks.

## 2. IMAP/SMTP and account lifecycle — initial trace

### Account API and persistence

- `backend/src/routes/accounts.js` mounts `requireAuth`; list queries are scoped by `user_id`. `SAFE_FIELDS` deliberately excludes credentials/tokens. Account create validates required fields, control characters, host/port policy and stores IMAP password, SMTP password and OAuth tokens encrypted. New IMAP accounts trigger `imapManager.connectAccount`.
- Update first verifies `id + user_id`, applies host/port policy and an allowlist of account fields, encrypts changed secrets, and queues disconnect/reconnect when relevant settings change. A keyed serializer prevents overlapping reconnect chains for a single account.
- Delete verifies ownership, deletes `email_accounts` first (comments state this cascades to messages/folders), then disconnects the live IMAP account asynchronously. This means DB cascade and connection teardown are distinct side effects; closure must inspect plugin/account-config/alias/contacts and external caches for cascade or orphan risk.
- Explicit reconnect clears cooldown and calls `connectAccount`; reconnect is not synchronous proof of successful connection.

### IMAP connection/sync manager

- `backend/src/services/imapManager.js` imports `imapflow`, PostgreSQL, parser/body storage, sanitizer/CID helpers, plugins, OAuth refresh helpers, encryption, push notifications, inbox rules, spam pipeline, folder status and host validation. This is a broad orchestration root, not a standalone transport utility.
- Host resolution uses the current connection policy and pinned address lookup. The manager includes bounded connection timeouts, a timeout-triggered IPv4 retry path, per-host/per-account concurrency controls, persistent-IDLE account caps, error streaks and exponential cooldowns. Auth failures use a longer backoff ladder (5 minutes up to 6 hours); transient refusals use a shorter capped ladder. Last successful sync is written to `email_accounts.last_sync`.
- Message sync closure still needs exact entry points and call graph for folder discovery, UIDVALIDITY/modseq checkpoints, missing-UID reconciliation, backfill/poll-only paths, flags/move/delete, retry/recovery and UI diagnostics. Follow imports recursively rather than extracting `imapManager.js` alone.

### Send/drafts

- `routes/send.js` uses Nodemailer, account-specific SMTP transport, recipient/header validation, compose sanitization, send-hold/cancel/status for undo-window sends, and a delayed sent-folder metadata upsert with retries at 3/10/20 seconds. The manager provides provider profiles and sent-message lookup/upsert.
- `routes/draft.js` is authenticated and builds reply contexts by joining messages to owned/enabled accounts. It resolves drafts folders using account folder mappings/server folder metadata, persists a local message row, and deletes the replaced server draft only after the new draft is stored; deletion checks expected Message-ID to avoid deleting the wrong server message. Draft closure must include reply graph helpers, parser, body store, inline images, SMTP/IMAP operations, UI draft state and migration columns.
- Still open: provider-specific SMTP TLS/auth and OAuth refresh; send retry/idempotency and failure states; process shutdown flushing of held sends; attachment upload/download/content-disposition safety; cross-account unified-inbox boundaries; account removal behavior for OAuth identities and plugin-owned data.

## 3. PostgreSQL migration runner and schema map — inventory-level findings

- The source tree contains `backend/migrations/0001_baseline.sql` through `0066_email_accounts_icon.sql` (66 ordered SQL migrations), plus `backend/src/services/migrations.js`.
- The runner sorts files matching `NNNN_name.sql`, uses `schema_migrations(version, applied_at)`, holds a session-level PostgreSQL advisory lock across the run, disables statement timeout for migration work, applies normal migrations in transactions, and supports explicit `-- no-transaction` migrations by executing statements separately (for operations such as concurrent index creation). Each migration is recorded only after SQL succeeds.
- Next schema pass must extract every table/column/constraint/index/trigger/backfill from all 66 SQL files, then map runtime consumers and transaction assumptions. Inventory path names indicate coverage for message threading/search indexes, rules, OIDC/MFA/reset tokens, account private-host policy, contacts/CardDAV, folder modseq/status, unified inbox, separate SMTP auth, plugin data/config, spam model/training, delivery/BCC addresses, account settings and auth-event audit fields. Names alone do not prove schema semantics.
- `schema_migrations` is runtime-created by the migration runner and must be included in the schema inventory even if absent from the baseline SQL.

## 4. Evidence gaps and next actions

1. Finish auth/OAuth/OIDC/session closure: route mounts, state/nonce/PKCE/audience/issuer checks, redirect targets, token persistence, logout/session invalidation, WebSocket auth, lock/MFA states, all outbound HTTP callers.
2. Complete safeFetch and SMTP/IMAP SSRF/redirect policy trace and enumerate every sanitizer render sink.
3. Trace IMAP lifecycle methods and all account-related cascade/cleanup paths, including UI states and plugin account config.
4. Produce a structured schema map from all 66 migrations, then connect each table/index/constraint to runtime SQL consumers and tests.
5. Expand capability closure for plugins, drafts, attachments, unified inbox, search, contacts, rules, AI, notifications, Electron and Android.
6. Recompute source path classifications and dependency inventory; license/provenance clearance remains pending for the majority of source files and all third-party packages.
7. Run full backend/frontend suites, native Android/Electron build checks and exact inventory verifier; selected security tests are not the full verification gate.

## Status

- Snapshot integrity: PASS for the pinned tree, as recorded in `VERIFICATION_STATE.md`.
- Selected security tests: PASS (379 tests across 15 files).
- Security/capability closure: PARTIAL / NOT CLOSED.
- IMAP/SMTP and account lifecycle: INITIAL TRACE / NOT CLOSED.
- Database: migration runner and 66-file inventory mapped; detailed schema/runtime map NOT CLOSED.
- License/provenance, third-party dependency clearance, redistribution clearance, and overall extraction PASS: OPEN.


## Follow-up — IMAP manager entry points, mailbox API and SMTP connect-time policy

- `backend/src/services/smtpTransport.js` independently re-reads `getConnectionPolicy()` and calls `resolveForConnection(account.smtp_host, { allowPrivate })` immediately before constructing Nodemailer transport. It iterates only validated resolved addresses on pre-delivery connection errors, with a 10 s per-attempt cap and 45 s overall failover budget. OAuth refresh is attempted when token expiry is within five minutes; credentials are decrypted at use time. Plaintext SMTP and TLS certificate-verification relaxation require the administrator's insecure-TLS policy. This confirms SMTP execution-time host-policy recheck; it still needs tests for all TLS and multi-address failure branches.
- `backend/src/routes/mail.js` mounts authenticated message/body/header/BCC/raw-EML/attachment/image endpoints and mutations for read/star/bulk read/star/delete/move/archive, folder CRUD, manual sync and folder sync. The body endpoint has cache-rewrite and sanitization branches, remote-image blocking and provider-refusal/pool-exhaustion/timeout-specific error paths. Attachment ZIP handling checks aggregate size and per-attachment size; detailed content-disposition, ZIP limits, account ownership checks and response states need per-endpoint review.
- `imapManager.js` is 7,562 lines and includes pooled/fresh clients, folder resolution, move/expunge fallback, MIME structure walking, body/attachment parsing, threading, OAuth refresh, modseq planning, folder status, sync/backfill and account connection lifecycle. It imports plugin registry/facade, inbox rules, spam pipeline, push notifications, message parser, sanitizer, body storage, CID settlement, encryption, folder status, unfetchable-UID tracking and connection-policy helpers. Its direct extraction closure must include these first-party modules and their schemas/tests; treating it as a reusable standalone transport would be incomplete.
- Explicit pure/testable helpers include `planModseqSync`, `planIntegrityFlagScan`, `folderSyncDue`, `isConnectionRefusal`, `isAuthFailure`, `connectCooldownMs`, `authCooldownMs`, persistent connection cap selection, move classification and MIME structure/body fallbacks. These are useful test anchors, not a substitute for tracing the stateful caller graph.
- Account delete in `routes/accounts.js` issues SQL DELETE after owner check and then asynchronously calls `disconnectAccount(id)`. Core FK cascades are not enough to prove external state cleanup: verify WebSocket subscriptions/broadcasts, pools, timers, plugin config/hooks, local body/attachment storage and any caches keyed by account.


## Follow-up — OIDC network boundary and frontend HTML sinks

### OIDC boundary finding requiring explicit disposition

Inspection of `backend/src/routes/oidc.js` found an important closure gap to resolve before treating the OIDC capability as reusable:

- `getDiscovery()` rechecks issuer hostname with `validateHost` before using the five-minute cache when `allowInsecure === false`; it also validates advertised authorization/token/JWKS endpoint schemes and hostnames.
- The actual discovery request is then made with native `fetch(wellKnown)`, not `safeFetch`. The token exchange path also uses native fetch. Because host validation and the eventual socket connection are separate operations, DNS pinning is not carried from validation into the request. Native fetch redirect handling also does not reuse MailFlow's guarded per-hop connector. This means the static checks alone do not prove resistance to DNS rebinding or a redirect to a disallowed target.
- When provider `allow_insecure` is true, discovery intentionally bypasses both HTTPS-only enforcement and the `validateHost` checks, and uses a custom HTTP(S) request with `rejectUnauthorized: false`. This must remain a clearly documented high-risk, explicit opt-in; inspect admin-only controls, endpoint reachability, redirect handling, response size and timeout/cancellation at every discovery/JWKS/token/end-session call site.
- This is recorded as an unresolved source security risk, not a claim that the existing implementation is exploitable in every deployment. Keep the source immutable; any adapter/host policy must wrap these boundaries rather than silently modifying the snapshot.

### Frontend HTML sink trace

- `MessageBodyView.jsx` renders the body through `buildFrameDoc()` into a sandboxed iframe (`allow-same-origin`, without `allow-scripts`) with a CSP forbidding scripts, objects, frames and forms. Remote image loads are controlled by `remoteImagePolicy.js` and lazy proxying. `emailFrameDoc.js` also forces links to open with `rel="noopener noreferrer"` and rejects dark CSS containing a closing style tag.
- `MessagePane.jsx` has a separate optional div-render path using `dangerouslySetInnerHTML` on `prepared.html`; that path must be traced through its HTML preparation/CSS scoping pipeline and test gates. Its plain-text fallback uses `linkifyText(body.text)` as HTML and requires the linkifier's escaping guarantees to be tested.
- `ComposeModal.jsx` sanitizes signatures with DOMPurify and quoted reply/forward HTML with `sanitizeEmailForApp`, which applies DOMPurify plus browser-parsed URL/CSS checks to keep only same-origin, data, blob and CID image loads. This is important because composer HTML is in the app origin, not the sandboxed email iframe.
- `SignatureEditor.jsx` initializes and writes `innerHTML` from its `value`/source editor. Caller-side sanitization and the saved-signature API boundary need to be traced end to end; do not classify the component in isolation.
- Existing CSP/render tests include `MessageBodyView.csp.test.js`, `MessageBodyView.render.test.js`, `ComposeModal.imageProxy.render.test.js`, `MessagePane.render.test.js`, and `appEmailHtml.test.js`. They need to be added to a frontend security render suite after mapping their full setup and coverage.

### Updated high-priority follow-ups

1. Audit/fix or explicitly boundary-wrap OIDC discovery/token/JWKS network requests so private-host and redirect policy is enforced at connection time; inspect allow-insecure admin authorization and make the opt-in warning explicit.
2. Trace `prepared.html` to the source sanitizer and CSS scope function; determine whether `USE_DIV_RENDER` can be enabled and test all content paths under both renderer modes.
3. Prove `linkifyText` escapes all HTML metacharacters before the plain-text sink.
4. Trace signature editor values from account settings/API to render/save and verify sanitize-on-write and sanitize-on-read.

## Security closure second pass — source-level details

### Runtime wiring and session boundaries
- backend/src/index.js mounts /api/auth, /api/auth/oidc, browser /auth/oidc, and /oauth after Redis-backed Express session middleware. /api mutating methods require X-Requested-With; OAuth and CardDAV are outside that gate and must rely on their own CSRF/state controls. buildSessionOptions sets rolling=true, a 7-day idle max age, HttpOnly, SameSite=Lax and secure=auto. requireAuth checks the session user against PostgreSQL, destroys stale sessions and touches last-seen state.
- Auth routes regenerate session IDs before promoting registration/login/MFA challenge to a full session. MFA and recovery endpoints have separate expiry/limiter branches. Remaining: reset-token consume-once schema, MFA recovery lifecycle, Redis failure modes, user deletion and WebSocket session revalidation/invalidation.

### OIDC redirect/network finding
- backend/src/routes/oidc.js:getDiscovery checks HTTPS and validates issuer host under current allowPrivateHosts policy before cache lookup. It checks discovered authorization/token/JWKS URL syntax, HTTPS and host policy. State, nonce and PKCE S256 verifier/challenge are session-stored before redirect; callback checks expiry/state/code, clears pending state before async token work, sends the verifier, validates ID-token issuer/audience and checks email/domain policy.
- Important unresolved network gap: standard discovery and token exchange use native fetch after DNS validation rather than the connection-pinned safeFetch dispatcher. The hostname can re-resolve between validation and connect; native redirect behavior can reach a new target unless redirects are rejected or validated. allow_insecure uses a custom HTTP(S) fetch branch and bypasses host validation/HTTPS enforcement; it is an explicit private/self-signed provider escape hatch, not proof of safe default behavior. Discovered JWKS uses jose's default fetch unless insecure mode supplies custom fetch. Reusable status remains blocked until policy is proved or upstream corrected and a new pin reviewed.
- backend/src/routes/oauth.js Microsoft state is session-bound and checked before token exchange; Microsoft token/device endpoints use native fetch and JWKS verification uses jose remote JWKS. Google and device-code branches need their own end-to-end state, redirect, token and refresh review. Selected OAuth/OIDC tests do not prove all outbound provider requests are connection-pinned.

### Safe fetch, image proxy and HTML sinks
- backend/src/services/safeFetch.js installs a custom Undici connector; each socket connect checks literal IPs or resolves/validates DNS answers, blocks private/reserved destinations by default, pins the socket to a checked address, preserves TLS servername, restricts schemes to HTTP(S) and requires HTTPS by default. This does not protect callers that use native fetch. Verify redirect chains and mixed-answer behavior with integration tests.
- backend/src/services/imageProxy.js uses safeFetch, limits bodies to 10 MiB, applies 15-second overall and 8-second header timeouts, per-user concurrency cap 6, sniffs image signatures instead of trusting remote Content-Type and uses a private response cache. Remaining: response headers/cache keying and invalidation, timeout abort propagation, CID and attachment behavior.
- backend/src/services/emailSanitizer.js separates received email, compose body and signature sanitization, rewrites anchor schemes and CSS URL content, bounds HTML5 parsing, blocks remote image/CSS fetches and rewrites allowed remote images to the authenticated image proxy; tracking pixels become a fixed transparent image. ComposeModal uses DOMPurify before signature/quoted HTML innerHTML insertion. Remaining: enumerate every dangerouslySetInnerHTML, iframe/srcdoc, email preview/print, compose/signature, CID and attachment sink; confirm CSP/headers and error/fallback behavior on each route.

### Executed test evidence and limits
- Selected pinned security run 39031942550: 14 backend Vitest files / 375 tests passed; frontend image proxy 1 Node test file / 4 tests passed (379 total, zero failures).
- Full pinned-source run 39034971662: backend 2,804 passed / 41 skipped across 166 passing files plus 6 skipped files; frontend 3,142 passed; PostgreSQL 17 applied 66 migrations and idempotent rerun passed. Android Gradle failed before Gradle launched because pinned gradlew is non-executable. Attempt 39035662163 was cancelled before jobs ran, so corrected Android verification is still pending.
- No source behavior was changed. Security, capability, license/provenance and redistribution gates remain open.
## IMAP/SMTP/account lifecycle second pass — source and test evidence

- Account API: backend/src/routes/accounts.js mounts requireAuth, validates IMAP/SMTP hosts under the configured private-host policy, encrypts credentials before persistence, enforces account ownership on read/update/delete/reconnect, and serializes reconnect triggers per account. Disable/update schedules disconnect/reconnect work; delete removes the database row before asynchronous disconnect, so FK cleanup and in-flight operation cancellation must be verified together.
- IMAP runtime: backend/src/services/imapManager.js imports ImapFlow, parser/body/sanitizer, categorizer, plugin hooks, OAuth token refresh, attachment/CID helpers, push notifications and pinned host resolution. The central connect path resolves/pins host addresses under the current connection policy, applies timeout handling and IPv4 retry for selected stalls, and uses refusal/auth-aware exponential backoff. The 7,562-line manager also contains sync locks, per-host scheduling, folder/status checkpoints, attachment structure parsing and recovery paths; these need a method-by-method state map, not a blanket 'IMAP complete' label.
- SMTP runtime: backend/src/services/smtpTransport.js decrypts OAuth/password credentials, refreshes provider tokens and uses resolveForConnection before transport creation. It includes retry to another validated address after selected connection errors. backend/src/routes/send.js scopes account/alias/message access by authenticated user, validates attachment counts/size and forwarded attachment ownership, uses a send idempotency reservation and distinguishes SMTP delivery from later Sent-folder APPEND failure (which must not cause duplicate delivery).
- Draft and rendering: backend/src/routes/draft.js uses account-scoped reply-draft graph/UID checks, verifies a candidate before opening and routes draft bodies through sanitizer/image-proxy storage. backend/src/routes/mail.js is the broad inbox/body/attachment/image/flag/move/delete surface; many operations fan out to IMAP and local DB with different retry semantics. Account lifecycle, mail route and compose/send therefore share dependencies and must not be extracted as isolated files.
- Executed test run: https://github.com/Rilan-Dev/mailflow/actions/runs/39037515886. Job 'IMAP SMTP account lifecycle, inbox mutations, drafts and attachments' ran against the immutable pinned snapshot and passed 42 test files / 777 tests; 1 test file / 10 tests skipped; zero failures. Included coverage seen in logs includes SMTP transport (22 tests), draft lookup (24), send undo window (22), mail remote images (18), send reliability (10), account aliases, unified inbox, new-mail-during-sync, snooze wake, folder/move/delete/recovery and attachment/CID routes. The IMAP draft-ingest suite was skipped (10 tests), so its behavior is not verified by this run. This is mocked/unit test evidence, not live provider interoperability.
- Open: account deletion/user deletion FK and non-FK cleanup, credential rotation and corrupted-secret behavior, live reconnect cancellation, sync checkpoint/UIDVALIDITY recovery, rate-limit backoff, all folder mutations and idempotency, draft persistence per provider, and live IMAP/SMTP integration.


## Frontend HTML sink inventory — follow-up

Repository code search identified three React dangerouslySetInnerHTML sinks in the current snapshot:
- frontend/src/components/AiResultBox.jsx: renderMarkdown calls marked then DOMPurify, adds a temporary link-hardening hook and removes it in finally. Sink appears sanitized; verify allowlist and hook isolation across concurrent sanitizes.
- frontend/src/components/MessagePane.jsx: prepared HTML is built by scopeEmailCss.prepareEmailHtml, which scopes CSS and calls sanitizeEmailForApp; plain-text fallback passes through linkifyText, which HTML-escapes ampersand/angle brackets and only linkifies http/https URLs excluding quotes. The email body is also rendered in sandboxed MessageBodyView iframe with CSP; verify detached/print modes and error fallbacks.
- frontend/src/components/ComposeModal.jsx: quoted body insertion uses sanitizeEmailForApp; signature values are DOMPurify-sanitized before assigned to the contentEditable signature. The raw innerHTML is later read back into compose/draft state, so trace every hydration/reopen/save path to ensure stored untrusted signature content is sanitized before each injection.
- frontend/src/components/SignatureEditor.jsx: directly assigns value and sourceVal to innerHTML; safe only when all parent callers uphold the sanitizer invariant. This is a transitive sink, not independently safe.
- frontend/src/utils/printMessage.js: print body HTML is DOMPurify-sanitized before a print document is built. Verify print window CSP and remote image policy, as print documents are a separate render context.
- frontend/src/utils/appEmailHtml.js: afterSanitizeAttributes uses the browser URL parser for image URLs/srcset and CSSOM parsing for inline CSS, retaining only the app origin/image proxy plus data/blob/cid schemes; hook is removed after sanitize. Browser-engine CSS escape tests should be run in actual Chromium/Firefox/WebKit, not inferred from jsdom.

## Security status reaffirmed
- OIDC discovery/token exchange still use native fetch after hostname validation; default fetch follows redirects and does not use the pinned safeFetch dispatcher. This leaves a DNS-rebinding/redirect-target closure gap in the reusable security story. Microsoft OAuth requests use fixed Microsoft host constants but native fetch; tenant validation, redirect handling and JWKS URL construction need separate review.
- AI provider API-key requests now set redirect=manual and reject 3xx, confirmed by aiProvider tests. Do not conflate this protection with OIDC or Microsoft OAuth.
- No source behavior was changed. Keep auth/security capability partial until these network paths, signature hydration, all sinks, session invalidation and negative cases are closed.
