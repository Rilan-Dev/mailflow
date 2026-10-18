# Reusable Capability Runtime Trace — 2026-10-17

## Snapshot and evidence boundary

- Upstream snapshot: `maathimself/mailflow@35067fc2876d50980f1a8a3b8ea72b5467b69f60`
- Tree: `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`
- Source remains immutable under `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source/`.
- This is an implementation/call-graph trace, not license clearance. Full backend/frontend lint/tests/build/audit and PostgreSQL clean migration tests passed in run https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662. Android Gradle did not start in that run because `gradlew` lacked executable mode; corrected run is pending.

## Search and unified inbox

- `backend/src/routes/search.js` uses `requireAuth`, `db.query`, and `resolveAccountScope` from `services/unifiedInbox.js`. It has structured operator parsing, folder-scope resolution, explicit Trash exclusion, full-text/LIKE predicates and separate contact/sender autocomplete.
- `services/unifiedInbox.js` exposes a small pure `resolveAccountScope(accounts, requestedAccountId)` helper. `services/messageService.js` uses it to scope inbox list/count/unread calculations and combines `messages`, `email_accounts`, `folders`, `contacts`, and `snoozed_messages`. Threaded queries use a paged-thread CTE and aggregate thread totals; drafts/replies must not accidentally be folded into a conversation.
- Scope closure: account selection is shared by search and message service, but still verify each endpoint passes the authenticated user's account set and that requested account IDs cannot escape it. Confirm trash/snoozed behavior, disabled/unified-inbox flags, contacts autocomplete visibility, query planner/index usage and UI empty/error states.
- Tests present: `routes/search.test.js`, `routes/search.unifiedInbox.test.js`, `services/unifiedInbox.test.js`, `services/messageService.test.js`, and PostgreSQL-specific message-service tests. The full backend test suite passed; DB-specific tests may be skipped when no test DB is configured, so the clean migration test does not prove these query integration tests ran.

## Contacts and CardDAV

- `routes/contacts.js` is authenticated and scopes contact operations through user-owned `address_books`; contacts in source `carddav` address books are read-only to normal CRUD routes. The default address book is created on demand. Contact updates/deletes bump address-book sync tokens. Photos are served from MailFlow origin and Gravatar retrieval is server-side to avoid exposing the user's IP directly.
- `routes/carddav.js` implements CardDAV authentication and policy/rate-limit checks, validates book ownership, and implements collection discovery/listing plus GET/PUT/DELETE semantics. It parses and emits vCards and advances sync tokens after changes.
- `services/carddavClient.js` uses both `validateHost` and `safeFetch` for remote DAV requests, parses XML and follows principal/address-book discovery and multiget paths. `services/carddavSync.js` loads credentials from user-scoped `user_integrations`, decrypts them, discovers books, upserts contacts on `(address_book_id, uid)`, preserves user-edited fields where appropriate, removes remote contacts no longer present and stops/schedules per-user sync loops.
- Schema linkage: migrations 0015–0018 create/migrate address books/contacts and search indexes; 0027 adds CardDAV external source metadata. `user_integrations` and address-book/contact FKs must be included in account/user deletion and credential cleanup analysis.
- Open: remote server redirects/credential forwarding policy, full DAV method matrix/ETag and sync-token semantics, scheduler overlap/cancellation, conflict merge modes, private-host policy at every request, photos/inline vCard data limits and user deletion cleanup.

## Rules, categories and spam

- `routes/rules.js` validates rule conditions/actions, verifies account ownership, scopes all CRUD to the current user, manages priorities, and applies selected rules in a sweep. Actions can update message categories and interact with folders/messages; rule forwards live in the child table from migration 0039.
- `services/inboxRules.js` is the execution engine used by the IMAP manager and rule routes; closure must include dangerous-regex bounds, provider operations, retry/idempotency and whether rules are re-run for newly arrived/backfilled messages.
- `services/categorizer.js` reads user preference and `category_list_sources`, can invoke `completeText` from `aiProvider.js`, writes `messages.category`, and backfills categories. Thus AI config/network/secret handling is a transitive dependency of categorization, not merely an optional UI feature.
- `services/spamPipeline.js` joins message/account/user context, reads training/model/rule data and may auto-move messages through IMAP while updating local rows. Migrations 0021, 0052–0056 add spam verdict/features/models/training/tombstones and trusted Authentication-Results authority; migration 0055 preserves some training rows with SET NULL when accounts are removed.
- Tests present: rules route/run/sender category, inboxRules, categorizer, spamPipeline and spamRules. Full backend tests passed; PostgreSQL-specific message-service tests require separate configured DB coverage.

## Plugins

- `plugins/registry.js` implements a hook registry: registration validates/records manifests, resolves hook handlers, checks active handlers and runs/collects hooks. `plugins/activation.js` stores enabled plugin IDs in `users.preferences`, caches activation and checks account ownership before account-scoped activation. `plugins/api.js` is a capability facade exposing selected mail engine, labels and archive functions instead of direct unrestricted backend access.
- The backend imports the plugin registry, bundled plugin loader and mail engine from `index.js`; IMAP sync, spam/rules and message ingestion are hook call sites. Plugin data/config/annotation tables arrive in migrations 0041, 0044 and 0045; the legacy GTD data moves in 0041–0046. Plugin data migration and activation semantics therefore depend on both schema and user preference formats.
- `eslint.plugins-boundary.js` and `lint:plugins` enforce import boundaries; the full backend workflow's plugin boundary lint and tests passed. Tests present: `plugins/activation.test.js`, `plugins/registry.test.js`.
- Open: enumerate every hook call site, execution context/capability passed to plugins, exception/timeout behavior, plugin version/install trust, lifecycle on account/user delete, bundled third-party licenses and data migration rollback/recovery. Do not expose the plugin system as a reusable capability until those edges are closed.

## AI assistant and provider network

- `routes/ai.js` is authenticated and has admin-only configuration endpoints; `aiProvider.js` stores config in `system_settings`, encrypts/redacts secrets, normalizes base URLs, creates bounded request signals, reads response streams with limits and routes Codex OAuth through separate helpers.
- `aiProvider.js` imports `hostValidation.js` and `connectionPolicy.js`, and uses `aiHttp.js` for timeout, response-size, SSE/JSON and text sanitization. This needs a per-provider URL policy review just like OIDC: identify which caller uses pinned host validation versus a fetch adapter, redirects, secret header redaction, response limits, and failure mapping.
- `categorizer.js` invokes AI completion as an internal consumer, so AI provider failure/latency can affect message categorization. UI dependencies include `aiActions.js`, `aiResults.js`, `useAiActions.js` and assistant UI state.
- Tests present: `routes/ai.test.js`, `frontend/src/aiActions.test.js`, and `frontend/src/hooks/useAiActions.test.js`. Full backend/frontend suites passed. Open: provider-level SSRF/redirect closure, config/credential isolation, cancellation, token accounting, privacy/data flow and provider-specific test coverage.

## Notifications and realtime

- `services/websocket.js` creates the WebSocket server and receives the session middleware from the app bootstrap, then integrates with `imapManager` to push mailbox state. Verify session revalidation and lock/logout/user-session invalidation for established sockets, not just HTTP middleware.
- `services/pushNotifications.js` reads `push_subscriptions` by user ID, sends through `web-push`, and removes stale endpoints. Baseline FK cascades subscriptions on user delete. Frontend hooks `useWebSocket.js` and `usePushNotifications.js` manage connection/reconnect/counts/notification behavior.
- Tests present: `services/websocket.test.js`, `hooks/useWebSocket.backoff.test.js`, `hooks/useWebSocket.counts.test.js`, `hooks/useWebSocket.notify.test.js`. Full backend/frontend test suites passed. Open: cross-user socket event isolation, reconnect storms, socket auth revocation, push payload privacy, VAPID configuration/rotation, stale subscription races and native notification action handling.

## Current status and next work

- Static call paths have been mapped for search/unified inbox, contacts/CardDAV, rules/categories/spam, plugins, AI provider and realtime notifications. The capability register should reflect PARTIAL rather than NOT_STARTED for the areas now traced.
- No capability is closed: each still needs transitive caller/schema/config/UI/error/recovery/license closure. Third-party package and source provenance remain separate gates.
- Immediate next: normalize the capability manifest to include these paths and their tests; inspect current full-verification workflow run after the Gradle wrapper fix; then deepen per-provider outbound network policy, schema SQL-consumer mapping, account/user deletion cleanup and dependency/license review.
