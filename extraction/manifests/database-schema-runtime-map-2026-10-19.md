# PostgreSQL Schema, Migration and Runtime Consumer Map — 2026-10-19

## Scope and evidence

- Source pin: `maathimself/mailflow@c1c446914dc031feb331993c9da339cc524809d5`; root tree `c3c54d9440f25c204368a0bafbbee836e05deb5f`.
- Exact inventory: 66 ordered SQL migrations at `backend/migrations/0001_baseline.sql` through `0066_email_accounts_icon.sql`.
- Runtime runner: `backend/src/services/migrations.js`; DB pool/transaction/credential migration: `backend/src/services/db.js`.
- Verification evidence: workflow run https://github.com/Rilan-Dev/mailflow/actions/runs/39207353893 reports the clean PostgreSQL install, 66 migrations and idempotent rerun job as **success**. The same workflow's overall verifier job failed on the *historical 35067fc snapshot's* tailwind blob mismatch; that unrelated failure does not invalidate the PostgreSQL job result.
- This is a static schema/runtime-consumer map plus migration execution evidence. It is not a complete SQL-query-to-object proof. All table, index, FK/constraint, retention, tenant-scope and deletion-cascade consumers still need automated reconciliation before the capability is closed.

## Migration runner behavior and operational requirements

`migrations.js` reads `backend/migrations`, sorts filenames matching `NNNN_name.sql`, and records applied versions in `schema_migrations`. It obtains session-level advisory lock `7418291834` for the entire run, sets migration-client `statement_timeout = 0`, applies ordinary migrations transactionally, and supports `-- no-transaction` migrations for operations such as `CREATE INDEX CONCURRENTLY`. Non-transaction migrations are split into statements and must remain idempotent because a crash can happen before the version row is inserted. The baseline runner has no migration checksum table: it tracks version, not content hash, so edits to already-applied migration files are not automatically detected.

`db.js` creates a PostgreSQL pool (max 20, 5-second connection timeout, 30-second statement timeout) and provides `query()` plus `withTransaction()`. Startup credential migration encrypts plaintext `email_accounts.auth_pass`, `oauth_access_token`, `oauth_refresh_token` and `oidc_providers.client_secret` when `ENCRYPTION_KEY` is configured; if it is missing, the function warns and returns without encrypting. This is a significant deployment/security dependency: config validation and the no-key production policy must be traced alongside schema closure.

## Table and runtime-consumer map

| Table / object family | Schema introduced or evolved | Observed first-party runtime consumers | Closure concerns |
|---|---|---|---|
| `users` | 0001; 0020 recovery email; 0034 lock PIN; 0063 last-seen | `routes/auth.js`, auth middleware, session helpers, user/account APIs | Password/MFA/lock lifecycle, deletion, FK behavior, sessions, last-seen writes |
| `email_accounts` | 0001 baseline; 0003 sender name; 0014 host-policy settings; 0023 category settings; 0029 OAuth public client; 0030/0036 account feature columns; 0040 SMTP credentials; 0045 plugin config separate table; 0054 antispam; 0056 trusted authserv; 0062 auto recipients; 0065 signature toggle; 0066 icon | `routes/accounts.js`, `services/imapManager.js`, `services/smtpTransport.js`, OAuth token refresh, unified inbox, spam pipeline, compose/send | credential encryption/rotation, account delete cascades, nullable provider fields, reconnect races, account ownership scopes |
| `messages` | 0001 baseline; 0002/0006/0007/0009/0011 threading and dedup; 0008 search vectors/trigram; 0016 bulk; 0021 spam; 0023 categories; 0024 unsubscribe headers; 0025 unsubscribe state; 0031 GTD gist; 0037 delivery addresses; 0044 plugin annotations; 0048 snippet retry; 0057 thread split/backfill; 0059 forwarded-from; 0060 thread index; 0061 BCC addresses | `routes/mail.js`, `routes/send.js`, `routes/draft.js`, `services/messageService.js`, `services/imapManager.js`, search, rules, spam, AI and plugin services | backfill correctness, thread key invariants, message-ID uniqueness/scope, deleted rows, attachment/body consistency, idempotent sync, retention |
| `folders` | 0001 baseline; 0028 highest MODSEQ; 0047 no-select; 0051 server status | `services/imapManager.js`, `services/folderStatus.js`, mail/folder routes | UIDVALIDITY/MODSEQ reconciliation, special-use/no-select folders, counts, rename/delete recovery |
| `snoozed_messages` | 0001 baseline | mail snooze route, `services/messageService.js`, IMAP wake-up paths | uniqueness and message identity, folder rename, wake idempotency and account deletion |
| `account_aliases` | 0001 baseline | account alias routes and send identity validation | tenant ownership, default alias semantics, deletion and SMTP sender authorization |
| `oidc_providers`, `user_identities` | 0001 baseline; 0004/0005 auth settings/events; 0012 insecure override; 0026 group claims; 0029 public client; 0035 RP-initiated logout; 0049 login-match claim | `routes/oidc.js`, `routes/oauth.js`, auth/session services | issuer/JWKS URL network policy, state/nonce, claim matching, client secret encryption, logout redirects, insecure opt-out |
| `auth_events` | 0005; 0064 actor username | `services/authEvents.js`, auth routes and middleware | actor attribution, retention, sensitive event content, write failures and FK/delete behavior |
| `system_settings`, `invites` | 0001 baseline; 0004 auth toggle; 0005 defaults; 0014 private-host/TLS/port policy; 0020 MFA settings | auth/admin/settings routes and host connection policy | admin-only writes, safe defaults, configuration cache invalidation and migration seeds |
| `push_subscriptions` | 0001 baseline | `services/pushNotifications.js` | stale endpoint cleanup, VAPID key rotation, user deletion |
| `inbox_rules`, `inbox_rule_forwards` | 0010 rules; 0039 forwarding recipients | `services/inboxRules.js`, `services/ruleForwarder.js`, rules routes and IMAP ingestion | regex ReDoS validation, ordering, forwarding idempotency, retry state and ownership |
| `block_list` | 0013 | block-list routes and incoming message/spam policy | per-user scoping, case normalization, consistency with spam/rules |
| `contacts`, `address_books` | 0015 initial contacts; 0017 rebuild to vCard/address-book model; 0018 search indexes; 0027 CardDAV source/URL and per-book unique index | `routes/contacts.js`, `routes/carddav.js`, `routes/carddavAccount.js`, `services/carddavClient.js`, `services/carddavSync.js` | migration data preservation, per-book uniqueness, remote URL policy, sync conflicts/ETags, user deletion |
| `user_integrations`, `integration_config` | 0001 integration config; 0019 user integrations | integrations routes, plugin registry and provider setup | secret storage, per-user/provider uniqueness, revocation, permissions |
| `trusted_devices`, `email_otp_tokens`, `password_reset_tokens` | 0020 MFA trust; 0022 password reset | auth routes, mailer, MFA/recovery helpers | one-time consumption, expiry cleanup, token hashing, brute-force limits |
| `category_list_sources` and message category fields | 0023/0024 | category/rules routes, mail list and spam pipeline | category ownership, migration defaults and list-unsubscribe parsing |
| `ai_codex_credentials`, `ai_codex_device_flows` | 0038 | `services/openaiCodexAuth.js`, `routes/ai.js`, AI provider services | encrypted credentials, state/expiry, single-use device flow, account/user cleanup |
| `plugin_data`, `plugin_account_config`, message `plugin_annotations` | 0041, 0044, 0045 | plugin runtime, plugin routes, message enrichment | plugin ID authorization, blob size/MIME, account-scoped config, data migration and deletion |
| `spam_training_log`, `spam_models`, `spam_training_deletions` | 0021, 0052, 0053, 0055 | `services/spamModel.js`, `services/spamModelStore.js`, `services/spamPipeline.js`, spam routes/scheduler | tenant separation, model serialization, training-data deletion, user opt-out and retention |
| `unfetchable_uids` | 0058 | IMAP sync/recovery paths | UIDVALIDITY changes, expiry/cleanup, preventing permanent omission after transient fetch failures |
| `gtd_pets` / legacy GTD columns | 0030–0033, removed by 0043 and 0046 | historical GTD plugin migration; current message enrichment uses plugin annotations | confirm no live consumer remains; do not extract legacy tables/columns as active capability |
| `schema_migrations` | created by runner | `services/migrations.js` | version uniqueness and concurrent runner lock; no content checksum |

## Migration sequence inventory (all 66)

| Range | Migration names and primary schema intent |
|---|---|
| 0001–0005 | Baseline users/accounts/messages/folders/settings/invites/aliases/OIDC/identities/push/snooze; subject threading; sender name; internal auth setting; auth events |
| 0006–0011 | Thread/dedup/paging/search indexes, generated normalized subject, GIN/trigram search and thread key |
| 0012–0014 | OIDC insecure opt-in, per-user block list, host-policy system defaults |
| 0015–0019 | Contacts v1→v2/address books, contact search, user integrations |
| 0020–0022 | Trusted-device/MFA/email OTP, spam training schema/constraints, password-reset tokens |
| 0023–0029 | Message categories/list-unsubscribe, OIDC admin-group claim, CardDAV metadata/uniqueness, folder MODSEQ, OAuth public client |
| 0030–0037 | GTD legacy fields/pets and gist; lock PIN; OIDC RP logout; unified inbox account option; message delivery-address metadata |
| 0038–0040 | AI Codex credentials/device flow; inbox-rule forwarding; separate SMTP authentication |
| 0041–0046 | Plugin data/config/annotations and legacy GTD cleanup |
| 0047–0051 | Folder no-select/snippet retry metadata/OIDC login match/message sender/folder server status |
| 0052–0056 | Spam feature data/model/deletion ledger and account antispam/trusted authserv settings |
| 0057–0060 | Subject/thread split backfill; unfetchable UID recovery table; forwarded-from fields; concurrent thread index replacement |
| 0061–0066 | BCC delivery addresses; auto-CC/BCC; user last-seen; auth actor; account signature-enabled toggle; account icon |

## Index, constraint and migration hazards

- `pg_trgm` is installed by migration 0008 and 0018; deployment must permit extension creation.
- Search uses GIN/search-vector plus trigram indexes on message sender/subject and contacts. Verify actual query plans and extension availability in the target Postgres image.
- Multiple migrations use `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY`; the runner's `-- no-transaction` branch must remain aligned with those files. Re-running a partially applied no-transaction migration depends on idempotent DDL and statement ordering.
- Threading migrations 0002, 0009 and 0057 perform generated-column/backfill/index transitions. Validate row counts, duplicate Message-ID behavior, thread root identity and concurrent sync writes against realistic data.
- Contacts 0017 replaces the legacy table with address books and rebuilds rows; migration rollback/data recovery is not established. 0027 changes unique-email semantics from per-user to per-address-book.
- 0043 and 0046 explicitly remove GTD legacy storage. Confirm no plugin or UI path still writes those columns.
- 0057's data rewrite updates message thread IDs; 0060 drops/recreates indexes concurrently. These deserve large-dataset and interrupted-migration tests.
- Schema foreign keys/cascades and cleanup behavior are not fully reconciled with application-level account/user deletion. The map intentionally flags this rather than inferring cascade guarantees from route code.

## Verification and next work

- PostgreSQL workflow job: clean database, all 66 migrations, idempotent rerun = **PASS** in run https://github.com/Rilan-Dev/mailflow/actions/runs/39207353893.
- Current c1 snapshot identity: GitHub Git-object API comparison = **PASS**, 1,501/1,501 entries, no missing/extra/type/mode/SHA mismatches; root tree matches. Local Node verifier still pending because the execution environment could not resolve `github.com`.
- Schema capability status remains **PARTIAL**. Next: enumerate every SQL table/index/constraint reference in backend routes/services, map FK and cascade behavior to user/account deletion paths, test migration interruption/retry and real-data backfills, then update per-capability closure only when evidence supports it.
