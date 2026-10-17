# MailFlow PostgreSQL Schema and Runtime Consumer Map — 2026-10-17

## Pin and verification boundary

- Snapshot: `maathimself/mailflow@35067fc2876d50980f1a8a3b8ea72b5467b69f60`; root tree `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`.
- Ordered migrations: `backend/migrations/0001_baseline.sql` through `0066_email_accounts_icon.sql` (66 files).
- PostgreSQL verification: run [39034971662](https://github.com/Rilan-Dev/mailflow/actions/runs/39034971662) used PostgreSQL 17, applied all 66 migrations, ran them again idempotently, and reported 32 tables, 97 indexes and 282 constraints. This verifies the clean install/idempotent rerun path, not every query plan, data upgrade from every historic production schema, or every application workflow.
- Migration runner trace (from the security/transport/database trace): ordered SQL migrations use a schema ledger and advisory lock; migrations requiring CREATE INDEX CONCURRENTLY must run outside a transaction. Runtime database object/column closure remains partial.

## Schema domains and migration map

| Domain | Migration span / key additions | Principal runtime consumers and invariants |
|---|---|---|
| Core identity and mail storage | 0001 baseline; 0002–0003 threading/sender; 0009 thread key; 0011 message-ID dedup; 0016 bulk flag; 0028 MODSEQ; 0037 delivery addresses; 0050 sender; 0057 merged-thread split; 0059 forwarded-from; 0060 thread index; 0061 Bcc; 0063 last seen; 0065 signature-enabled; 0066 account icon | `services/db.js`, `routes/accounts.js`, `services/imapManager.js`, `services/messageParser.js`, `services/messageService.js`, `routes/mail.js`, `routes/send.js`, `routes/draft.js`. Messages are account-owned; account delete cascades messages/folders; user/account scope must be present on read/update. Thread key, Message-ID dedup, UIDVALIDITY/MODSEQ and checkpoint logic affect sync correctness. |
| Search and threaded paging | 0006–0008, 0009, 0018, 0060 | `services/messageService.js`, `services/unifiedInbox.js`, `routes/search.js`, `routes/mail.js`, `routes/contacts.js`. GIN full-text, trigram and partial/thread indexes are tied to exact query shapes; query-plan checks are still required. |
| Auth, sessions, audit and MFA | 0004–0005, 0020, 0022, 0034, 0064 | `routes/auth.js`, `middleware/auth.js`, `services/authEvents.js`, `services/authLimiter.js`, `services/rateLimiter.js`, `services/userSessions.js`, `utils/sessionConfig.js`. Reset tokens are stored as hashes and must be single-use/expired; trusted device tokens are hashed; user deletion should cascade credentials/tokens while audit history has SET NULL behavior. |
| OAuth/OIDC and AI credentials | 0001 baseline; 0012, 0019, 0026, 0029, 0035, 0038, 0049 | `routes/oauth.js`, `routes/oidc.js`, `services/aiProvider.js`, Codex auth helpers, `services/encryption.js`. Provider flags and claims affect network trust, account matching, logout and admin mapping; secret fields need encryption/rotation and corrupt-secret recovery. |
| Connection policy and account security | 0014, 0040, 0054, 0056, 0062, 0065–0066 | `services/connectionPolicy.js`, `services/hostValidation.js`, `services/imapManager.js`, `services/smtpTransport.js`, `routes/accounts.js`. Global private-host/TLS/port policy, separate SMTP auth, antispam, trusted Authentication-Results and account UI settings must be rechecked at connection time. |
| Contacts, address books and CardDAV | 0015, 0017–0019, 0027 | `routes/contacts.js`, `routes/carddav.js`, `services/carddavClient.js`, `services/carddavSync.js`, `utils/vcard.js`. Migration 0017 copies legacy contacts into per-user address books and drops the legacy table; 0027 introduces external/CardDAV metadata and changes uniqueness from user-email to book-email. Verify conflict merges, sync-token semantics and user/integration deletion. |
| Rules, categories, unsubscribe | 0010, 0023–0025, 0039 | `routes/rules.js`, `services/inboxRules.js`, `services/categorizer.js`, `services/spamPipeline.js`, `routes/mail.js`. Account-scoped rules and forward-child rows must be cleaned together; category-list sources are user-owned; unsubscribe state is message-level. Rule action retry/idempotency and category backfills require tests. |
| Spam training/model state | 0021, 0052–0056 | `services/spamPipeline.js`, `services/spamRules.js`, parser/authserv-ID helpers and account settings routes. Check constraints encode verdict/override values. Migrations add training features/models and a deletion tombstone; account deletion uses SET NULL for some training rows, which must be intentional and privacy-reviewed. |
| Unified inbox, snooze and folders | 0001 baseline; 0036, 0047–0048, 0051, 0058 | `services/unifiedInbox.js`, `services/messageService.js`, `services/imapManager.js`, `routes/mail.js`, `routes/accounts.js`. Include enabled/unified-inbox flags, no-select folders, server status and attempted snippet fields in sync/recovery behavior. Unfetchable UIDs are account-owned and should cascade. |
| Plugin data and account config | 0041–0046 | `plugins/registry.js`, `plugins/activation.js`, `plugins/api.js`, `services/imapManager.js`. Plugin data owner may be user-scoped; account config cascades on account delete. Migration 0042 moves activation into JSONB preferences; 0043/0046 drop legacy GTD data/columns after migration. Need rollback/recovery and bundled plugin provenance. |
| GTD/task-specific data | 0030–0033, 0042–0046 | GTD UI/plugin services and message annotations. Migrations move from legacy columns/tables into plugin-owned data and later drop legacy structures; classify as product-specific unless a reusable contract is explicitly scoped. |
| Push/realtime | 0001 baseline, auth/session migrations | `services/pushNotifications.js`, `services/websocket.js`, frontend push/socket hooks. Push subscription FK cascades on user deletion; socket connections are not a relational object and need explicit session revocation/event-isolation tests. |
| OIDC provider identity | 0001 baseline, 0012, 0026, 0035, 0049 | `routes/oidc.js`, `user_identities` and `oidc_providers`. Provider deletion cascades linked identities; user deletion cascades identities. Unique issuer+subject identity and provider matching claims are auth invariants. |
| Auxiliary data / integration configuration | 0001, 0019, 0038, 0041, 0045 | `integration_config`, `user_integrations`, AI Codex credentials/device flows, `plugin_data`, `plugin_account_config`. Verify encryption, owner/admin authorization, expiry cleanup, uniqueness and orphan handling. |

## Important FK/index/data migration observations

- Baseline ownership uses cascading FKs from users to many user-owned rows and from email_accounts to messages/folders/aliases/snoozes. Some rows intentionally survive account deletion with `account_id SET NULL` (spam training/history); confirm retention policy and privacy intent.
- Contact schema evolved from a legacy user-owned table to address_books plus contacts. The migration copies data and drops the legacy table; test migration on representative old data and uniqueness collisions, not only an empty database.
- Search/thread indexes include concurrent index creation/rebuilds (0006–0009, 0011, 0018, 0060). The runner must preserve non-transactional migration metadata and recover safely from interrupted/invalid concurrent indexes.
- Thread split/backfill migration 0057 mutates existing message rows; migration 0060 rebuilds indexes to cover deleted-message query behavior. Validate row counts, query plans and rollback/repair instructions on a production-like copy.
- Password reset tokens, TOTP/email OTP/trusted-device state and OIDC credentials have distinct secret lifecycles. Schema existence alone does not prove one-time consumption, expiry enforcement, encryption or user-facing recovery.
- The successful migration job reports 32 tables, 97 indexes and 282 constraints. The runtime SQL trace is not yet exhaustive: every SELECT/INSERT/UPDATE/DELETE, dynamic SQL fragment, transaction boundary, backfill and query-plan dependency still needs a manifest row before database capability closure.

## Remaining database work

1. Build a normalized inventory for each table/column/index/constraint/FK/trigger/sequence with the creating/altering migration and exact blob SHA.
2. Search all first-party SQL callers and bind them to object rows, including dynamic SQL in accounts/mail/rules/plugins and helper-generated query fragments.
3. Map indexes to actual query predicates/order/grouping and run EXPLAIN on representative datasets; include partial-index predicate compatibility and migration 0006–0009/0060 rebuild recovery.
4. Test migration from representative pre-0017 contact schema, pre-plugin GTD data, older spam-training shape and older thread layout; the clean install/idempotent run does not cover these upgrade states.
5. Reconcile account/user deletion with non-FK caches, Redis sessions, IMAP connections, plugin data, OAuth/device flows, push subscriptions, CardDAV credentials and external vector/cache state.
6. Keep database capability `PARTIAL_STATIC_TRACE_NOT_CLOSED`; do not treat migration CI as complete SQL/runtime closure.

## Migration-by-migration index (66/66 files inspected for DDL/data-change signatures)

| Migration | Observed change / primary domain |
|---|---|
| 0001_baseline.sql | Core users, email_accounts, messages, folders, integrations, settings, invites, aliases, OIDC identities/providers, push subscriptions, snoozes and baseline indexes/FKs |
| 0002_subject_threading.sql | Thread columns and normalized-subject generated column/index |
| 0003_sender_name.sql | Account sender-name field |
| 0004_internal_auth_setting.sql | Internal auth-related system setting |
| 0005_auth_events.sql | Auth audit event table/index and initial settings |
| 0006_threaded_query_indexes.sql | Concurrent thread dedup/count indexes; non-transactional migration requirement |
| 0007_thread_paging_index.sql | Concurrent thread/date paging index |
| 0008_search_indexes.sql | Search vector plus concurrent full-text/trigram indexes |
| 0009_thread_key_column.sql | Thread-key column and rebuild of thread indexes |
| 0010_inbox_rules.sql | User/account-scoped inbox rules and indexes |
| 0011_message_id_dedup_index.sql | Account/message-ID dedup index |
| 0012_oidc_allow_insecure.sql | OIDC provider insecure-mode flag |
| 0013_block_list.sql | User-owned block list and index |
| 0014_account_allow_private_host.sql | Global private-host, insecure-TLS and nonstandard-port policy defaults |
| 0015_contacts.sql | Initial user-owned contacts table |
| 0016_is_bulk.sql | Message bulk classification field |
| 0017_contacts_v2.sql | Migrates legacy contacts into address_books/new contacts schema, backfills ETags, then drops legacy table |
| 0018_contacts_search_indexes.sql | Contact display-name/email/organization trigram indexes |
| 0019_user_integrations.sql | User-scoped external integration credentials/config table |
| 0020_mfa_device_trust.sql | Recovery email, trusted-device hashes, email OTP tokens and auth settings |
| 0021_spam_training.sql | Message spam verdict/override checks and spam training log/indexes |
| 0022_password_reset_tokens.sql | User-owned hashed password-reset tokens and indexes |
| 0023_message_categories.sql | Message category, category index, account antispam/category settings and user category sources |
| 0024_category_improvements.sql | List-Unsubscribe and List-Unsubscribe-Post message fields |
| 0025_unsubscribe_state.sql | Message unsubscribe timestamp |
| 0026_oidc_admin_group_claim.sql | OIDC admin group claim/value configuration |
| 0027_carddav_client.sql | Address-book external/CardDAV source fields and revised per-book email uniqueness/indexes |
| 0028_folder_highestmodseq.sql | IMAP folder highest MODSEQ checkpoint |
| 0029_oauth_public_client.sql | OAuth public-client account field |
| 0030_gtd.sql | Legacy GTD account fields |
| 0031_gtd_gist.sql | Legacy GTD message gist field |
| 0032_gtd_pets.sql | Legacy GTD task/pet lookup table |
| 0033_gtd_pets_custom.sql | GTD custom-item flag and data backfill |
| 0034_lock_pin.sql | User screen-lock PIN hash |
| 0035_oidc_rp_initiated_logout.sql | OIDC RP-initiated logout setting |
| 0036_unified_inbox_accounts.sql | Account unified-inbox participation flag |
| 0037_message_delivery_addresses.sql | Message delivery-address fields |
| 0038_ai_codex_oauth.sql | Codex credentials and device-flow state/expiry tables/indexes |
| 0039_inbox_rule_forwards.sql | Rule forward-child table with cascading rule FK and status index |
| 0040_smtp_separate_auth.sql | Separate SMTP auth username/password fields |
| 0041_plugin_data.sql | Plugin-owned data/blob/MIME/visibility table plus legacy data migration |
| 0042_grandfather_gtd_plugin.sql | Moves GTD activation to users.preferences.enabledPlugins |
| 0043_drop_gtd_pets.sql | Drops legacy GTD pets table after migration |
| 0044_message_plugin_annotations.sql | Message plugin annotation JSONB and drops legacy GTD gist |
| 0045_plugin_account_config.sql | Per-account plugin configuration and legacy config migration |
| 0046_drop_legacy_gtd_columns.sql | Drops legacy GTD account columns after migration |
| 0047_folder_no_select.sql | IMAP folder no-select flag |
| 0048_snippet_attempted_at.sql | Snippet attempt timestamp for recovery/backoff |
| 0049_oidc_login_match_claim.sql | OIDC login identity matching claim configuration |
| 0050_message_sender.sql | Message sender email/name fields |
| 0051_folder_server_status.sql | Server-reported folder status/checkpoint fields |
| 0052_spam_training_features.sql | Spam training feature schema and user/time index |
| 0053_spam_models.sql | Per-user spam model/training record table and indexes |
| 0054_email_accounts_antispam_enabled.sql | Per-account antispam toggle and index |
| 0055_spam_training_deletions.sql | Spam training deletion tombstones; account FK SET NULL for retained records |
| 0056_email_accounts_trusted_authserv_id.sql | Trusted Authentication-Results authority per account |
| 0057_split_subject_merged_threads.sql | Data backfill splitting legacy subject-merged threads where explicit references exist |
| 0058_unfetchable_uids.sql | Account-owned unfetchable UID records and lookup index |
| 0059_message_forwarded_from.sql | Forwarded-from email/name/via metadata |
| 0060_thread_id_index_covers_deleted.sql | Concurrent rebuild of account/thread index to cover deleted rows and replace old indexes |
| 0061_message_bcc_addresses.sql | Message Bcc address metadata |
| 0062_email_accounts_auto_recipients.sql | Per-account auto-recipient collection setting |
| 0063_user_last_seen.sql | User last-seen timestamp |
| 0064_auth_events_actor.sql | Actor username in auth audit records |
| 0065_email_accounts_signature_enabled.sql | Per-account signature enablement flag |
| 0066_email_accounts_icon.sql | Per-account icon/branding metadata |

Index caveat: this is a first-pass migration-level change map. It does not yet enumerate every column definition, index expression/predicate, constraint name, trigger/sequence or every SQL caller. Exact source SHA/mode remains in source-tree manifest; all 66 migration paths are dependency-closure candidates and license-unreviewed.
