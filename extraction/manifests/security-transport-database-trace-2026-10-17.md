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
