# MailFlow Dependency Runtime and License Triage — 2026-10-17

## Scope and evidence boundary

- Immutable upstream pin: `maathimself/mailflow@35067fc2876d50980f1a8a3b8ea72b5467b69f60`, root tree `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`.
- Inventory source: `dependency-inventory-2026-10-17-35067fc.json`; lockfile package entries: 445 backend + 679 frontend = 1,124. Package manifests identify 50 direct dependencies and 16 direct development dependencies.
- This document maps high-impact direct dependency usage from imports and runtime call sites. The license strings below come from lockfile metadata only; no package tarball, upstream LICENSE/NOTICE, source provenance or transitive license was independently verified. Every package remains `UNREVIEWED`; nothing is approved for vendoring or redistribution by this triage.

## Backend runtime dependency map

| Package | Observed first-party call sites / capability | Runtime role and closure still required |
|---|---|---|
| `imapflow` | `backend/src/services/imapManager.js` | IMAP sessions, sync, folder/message mutations, body/attachment fetch, reconnect/recovery. Requires provider integration and error/retry semantics. Lockfile metadata: MIT. |
| `nodemailer` | `services/smtpTransport.js`, `routes/send.js`, `routes/draft.js` | SMTP delivery and some outbound mail; trace credential refresh, transport options, recipient partial failures and delivery-vs-Sent-copy errors. Metadata: MIT-0. |
| `pg` | `services/db.js` and all SQL routes/services | PostgreSQL pool/transactions/migrations/schema consumers. Full pinned migration job passed (66 migrations, idempotent rerun); per-object consumer/index mapping remains incomplete. Metadata: MIT. |
| `redis`, `connect-redis`, `express-session` | `services/redis.js`, `index.js`, `utils/sessionConfig.js`, `services/userSessions.js` | Session persistence, rate/replay limiting, cache and user-session destruction. Requires outage, invalidation, expiry, socket and concurrency closure. Metadata: MIT. |
| `jose` | `routes/oauth.js`, `routes/oidc.js`, Codex auth helpers | JWT verification and remote JWKS. Must trace issuer/audience/nonce and each JWKS network request, especially native-fetch redirects/private-host behavior. Metadata: MIT. |
| `undici` | `services/safeFetch.js` | Custom connector for outbound SSRF guard, redirect-hop connection checks and IP pinning. Must not assume callers using native fetch receive this protection. Metadata: MIT. |
| `sanitize-html`, `parse5`, `htmlparser2` | `services/emailSanitizer.js`, parsing helpers | HTML5 parsing/sanitization, CSS/URL rewriting and received/compose/signature rendering. Need sink-by-sink browser/CSP validation. Metadata: MIT. |
| `sharp` | Image processing/shrink services | Native image conversion/metadata and installation/runtime platform closure. Metadata: Apache-2.0; verify bundled libvips/native artifacts and target OS/architecture. |
| `archiver` | Backup/export routes | Archive creation and stream/error handling; check path traversal, limits, native/runtime constraints and license notice. Metadata: MIT. |
| `fast-xml-parser` | CardDAV XML discovery/response handling | Remote DAV XML parsing; ensure parser configuration, size limits, entity handling and XML interoperability. Metadata: MIT. |
| `web-push` | `services/pushNotifications.js` | VAPID web push and stale endpoint removal. Metadata: MPL-2.0; review file-level copyleft obligations and shipped bundle/package notice. |
| `bcryptjs`, `otplib`, `qrcode` | `routes/auth.js`, MFA setup/login | Password hashing, TOTP and QR enrollment; trace throttling/replay protection and recovery. Metadata: MIT. |
| `dotenv` | `backend/src/index.js` | Environment loading; startup secret validation and production config are first-party boundaries. Metadata: BSD-2-Clause. |
| `ws` | WebSocket setup and realtime service | Authenticated socket transport, origin/session revalidation and event isolation. Metadata: MIT. |

## Frontend and native direct dependency map

| Package(s) | Observed first-party call sites / capability | Runtime role and closure still required |
|---|---|---|
| `react`, `react-dom`, `react-router-dom`, `zustand` | Frontend app, routes, shared store | Core SPA and account/session state; map route-level auth, lock, loading/empty/error states and stale request cleanup. Metadata: MIT. |
| `@tiptap/*` | `frontend/src/components/ComposeModal.jsx` and editor helpers | Rich-text composition, tables, links, images, signatures and quoted HTML; map every extension and sanitization boundary. Metadata: MIT. |
| `dompurify` | Compose and HTML rendering helpers | Client-side sanitization in addition to server sanitizer; metadata is dual `MPL-2.0 OR Apache-2.0`, requiring chosen license/notice review. |
| `marked` | Markdown/text rendering paths | Markdown-to-HTML output; verify every generated HTML sink is sanitized and options are safe. Metadata: MIT. |
| `pdfjs-dist` | PDF attachment preview | Worker, fonts/cmaps/wasm and shipped assets; Apache-2.0 notices and native/browser packaging need review. |
| `date-fns`, `i18next`, `react-i18next` | Dates and localization UI | Formatting/localization capability and locale asset closure. Metadata: MIT. |
| `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` | `frontend/packages/android` | Android bridge/native build and plugin configuration; metadata: MIT. Android web build/Capacitor sync passed, but Gradle unit tests/debug APK are still unverified because the last corrected run was cancelled before jobs started. |
| `electron`, `electron-builder` | `frontend/packages/electron` and build scripts | Desktop runtime, native modules, packaging/resources/updater. Metadata: MIT; Electron packaging has not been run. |
| `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, ESLint and Vitest | Build/test/lint configuration | Development tooling, generated CSS/bundles and tests; not production runtime but still license/provenance and supply-chain dependencies. Metadata mostly MIT. |

## License/provenance triage

- Lockfile metadata is a useful filter, not a license conclusion. Current manifest counts zero reviewed licenses and zero reviewed provenance.
- Higher-priority manual review: `web-push` (MPL-2.0), `dompurify` (MPL-2.0 OR Apache-2.0), `sharp` (Apache-2.0 plus native libvips/runtime assets), `pdfjs-dist` (Apache-2.0 plus bundled worker/asset files), `nodemailer` (MIT-0), and every package with install scripts, native binaries, bundled WASM/fonts/cmaps, optional platform packages, or non-registry/Git URL provenance.
- Next review must reconcile all 1,124 entries, not only direct dependencies: package name/version/resolved URL/integrity, installed path, license field vs actual LICENSE/NOTICE, upstream repository/tag, install script/native payload, direct/transitive/dev/optional/peer role, and runtime consumers. Detect duplicate versions and license disagreements.
- Do not set `license_status=REVIEWED` from the lockfile alone. Do not mark any package eligible for redistribution until actual package/source license and required notices are inspected and AGPL-3.0/commercial-license/CLA implications for the first-party MailFlow code are reviewed.

## Current disposition

- Direct runtime consumers are mapped for major backend mail/security/data capabilities and frontend compose/render/native surfaces.
- All 1,124 lockfile entries remain `UNREVIEWED` for license and provenance; no third-party source is vendored.
- This does not close dependency closure: native packages, dynamic imports, build assets, migration/schema callers, runtime environment, and package-level notices still require reconciliation.


## Packaging version drift found during delta review
- Pinned backend/package.json declares 4.0.1 while unchanged backend/package-lock.json root metadata declares 3.9.0.
- Pinned frontend/package.json declares 4.0.1 while unchanged frontend/package-lock.json root metadata declares 3.8.2.
- npm may still install dependencies despite this mismatch, but build metadata/release provenance can disagree. The immutable upstream snapshot is not modified here; verify intended release version and ask upstream to reconcile package and lockfile metadata in a future reviewed snapshot.
- One added binary test asset, frontend/packages/android/app/src/androidTest/assets/untrusted-provider.p12, remains unreviewed at byte level. It is referenced only as an untrusted-provider TLS fixture by the Android OIDC instrumentation test, but certificate fingerprint/validity and generation provenance must be checked before classification/reuse.
