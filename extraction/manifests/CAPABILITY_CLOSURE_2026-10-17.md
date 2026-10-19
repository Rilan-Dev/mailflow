# Capability Closure Tracker — 2026-10-17

Source pin: 35067fc2876d50980f1a8a3b8ea72b5467b69f60 / a2a82b50b8a1ac24a273e55dc0f9418aefdfed17

This tracker starts full closure work against the current immutable snapshot. It does not declare any capability complete.

## Priority order
1. Security-sensitive identity/authentication, OAuth/OIDC/MFA, remote fetch/SSRF and HTML sanitization.
2. IMAP/SMTP transport, account lifecycle, database/schema migrations and encryption.
3. Message parsing/rendering, plugin boundaries, unified inbox/search and compose/drafts.
4. Contacts/CardDAV, rules/categories/spam, AI assistant, notifications, Electron/Android and deployment/release.

## First observed architecture edges
- `backend/src/index.js` is the backend composition root: Express/session/Redis, route mounting, plugin registry and server lifecycle.
- `backend/src/services/imapManager.js` is a high-fan-in synchronization engine importing IMAP transport, parser/sanitizer, categorization, plugins, OAuth token refresh, host validation, connection policy, inbox rules, spam, push, encryption, diagnostics and folder state.
- `backend/src/routes/accounts.js` owns account CRUD/reconnect/folder/reindex endpoints and calls auth, DB, encryption, host validation, connection policy, plugins and IMAP lifecycle.
- `backend/src/routes/mail.js` owns message/body/header/attachment/image/raw-message routes and depends on IMAP manager, body storage, parser/sanitizer, safe fetch, image proxy/cache/shrink, plugin registry, spam and unified inbox.
- `backend/src/routes/oauth.js` owns Microsoft and Google OAuth/device flows, state/nonce handling, token refresh and encrypted credential persistence.
- `backend/src/services/db.js` is the PostgreSQL boundary and imports encryption and performance metrics.
- `backend/src/plugins/registry.js` is the plugin registry abstraction; plugin API, activation, load ordering and boundary lint/tests must be closed together.
- `frontend/src/main.jsx` registers frontend plugins before first paint and wraps the application in React/router/error boundary/i18n.
- `docker-compose.yml` defines frontend, backend, PostgreSQL, Redis and optional Caddy; runtime configuration and volumes must be traced with both Dockerfiles and .env.example.

## Evidence limits
The machine-readable import scan is in `initial-import-trace-2026-10-17-35067fc.json`. It captures direct relative imports/routes for selected root files only. It is not a transitive dependency graph, test pass, runtime validation, license clearance or extraction PASS.

Next: close auth/OAuth + host-validation/safe-fetch first, then IMAP/account lifecycle and database migrations. Every path must retain exact source blob identity and license/provenance evidence.
