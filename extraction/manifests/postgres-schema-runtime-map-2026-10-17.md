# PostgreSQL Schema and Runtime Consumer Map — MailFlow pinned snapshot

## Pin and completeness statement

- Source: `maathimself/mailflow@35067fc2876d50980f1a8a3b8ea72b5467b69f60`
- Tree: `a2a82b50b8a1ac24a273e55dc0f9418aefdfed17`
- Audit source root: `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source/`
- Migration inventory: 66 files, `backend/migrations/0001_baseline.sql` through `0066_email_accounts_icon.sql`, plus `backend/src/services/migrations.js`.
- Status: INITIAL SCHEMA MAP / NOT CLOSED. This map is based on static SQL and targeted runtime source inspection. It is not a claim that every SQL consumer, index selectivity, constraint or UI dependency has been exhaustively reviewed.

## Migration execution semantics

`backend/src/services/migrations.js` reads only files matching `^\d{4}_.+\.sql$`, sorts lexically, creates `schema_migrations(version, applied_at)`, and obtains session-level advisory lock `7418291834`. It sets statement_timeout to zero for the migration client. Normal migrations execute inside BEGIN/COMMIT with rollback on failure. Files marked `-- no-transaction` are split into statements and executed one by one (required for CREATE/DROP INDEX CONCURRENTLY); the version row is written after the SQL succeeds. A failed no-transaction migration may have partially applied statements, so these files must be idempotent and crash-retry safe.

## Baseline tables and principal relationships

| Table | Primary purpose / key relationships | Runtime consumers identified |
|---|---|---|
| `users` | Authentication identity, preferences, admin/MFA/profile; parent of user-scoped rows | `routes/auth.js`, `middleware/auth.js`, OIDC, admin/settings, plugin activation, last-seen |
| `email_accounts` | IMAP/SMTP/provider credentials, host/TLS, enabled/sync state, per-account settings; FK to users with ON DELETE CASCADE | `routes/accounts.js`, `services/imapManager.js`, OAuth routes, SMTP transport, send/draft/mail routes, plugins |
| `messages` | Per-account, per-folder UID cache; unique `(account_id, uid, folder)`; FK to email_accounts CASCADE | `services/imapManager.js`, `routes/mail.js`, send/draft/search/rules/categories/spam/AI, MessagePane |
| `folders` | Per-account folder metadata and sync state; unique `(account_id, path)`; FK to email_accounts CASCADE | `imapManager.js`, folder status/sync services, account/mail routes, draft folder resolution |
| `integration_config` | Provider-level integration configuration, optionally user-owned | `routes/integrations.js`, startup `loadIntegrationConfigs` |
| `system_settings` | Global configuration/settings key-value store | auth limiter, registration/MFA/connection policy, admin/settings, migrations |
| `invites` | Registration invitations; created_by cascades with user, used_by becomes null on user delete | `routes/auth.js`, admin/invite management |
| `account_aliases` | Account sender identities/signatures; cascades with account | `routes/accounts.js`, send/draft |
| `oidc_providers` | OIDC issuer/client/policy configuration | `routes/oidc.js`, admin/provider configuration |
| `user_identities` | User↔OIDC provider issuer/subject identity, unique `(issuer, subject)`; cascades from user/provider | OIDC callback/link/unlink paths |
| `push_subscriptions` | Web Push endpoints and credentials; unique `(user_id, endpoint)`; cascades with user | `services/pushNotifications.js`, notification settings |
| `snoozed_messages` | Snooze lifecycle per user/account/message header and folders; cascades from user/account | `imapManager.js` snooze watcher, mail routes/UI |

Baseline `messages` initially stores message headers/body, JSON recipient/attachment/flag arrays, read/star/deleted flags, sync time and threading fields. Migrations later add search vector, categories, unsubscribe state, spam fields, sender/delivery/BCC metadata, plugin annotations, snippet attempts, forwarded-from metadata and additional threading support. Verify current table definition by applying baseline plus migrations in order; baseline alone is not current schema.

## Migration-by-migration scope inventory

| Migration | Observed schema/data change | Runtime/capability linkage |
|---|---|---|
| 0001 baseline | Core users/accounts/messages/folders/integration/settings/invites/aliases/OIDC identities/push/snooze tables; initial indexes, unique keys and FK cascades | auth, accounts, IMAP, inbox, identity, notifications |
| 0002 subject threading | Normalized-subject generated column, index, backfill/thread updates | message threading and search |
| 0003 sender name | Account sender-name column | accounts, compose/send |
| 0004 internal auth setting | Seeds internal-auth setting | auth/SSO policy |
| 0005 auth events | Auth audit table and created-at index; seeds settings | auth events, admin audit |
| 0006 threaded query indexes | Concurrent indexes for thread/dedup/count query paths | unified inbox/threading |
| 0007 thread paging | Concurrent thread/date index | inbox paging |
| 0008 search indexes | Search vector, concurrent full-text and trigram indexes | message search |
| 0009 thread key | Thread-key column and concurrent index replacements/lookups | thread grouping |
| 0010 inbox rules | Rule table, user/account ownership, priority/enabled indexes | rules/automation |
| 0011 message ID dedup | Concurrent account/message-id index | sync deduplication |
| 0012 OIDC insecure option | `oidc_providers.allow_insecure` | private/self-hosted OIDC |
| 0013 block list | User-owned block list and lookup index | spam/rules |
| 0014 connection policy | Seeds private-host, insecure-TLS and nonstandard-port defaults | host policy/admin settings |
| 0015 contacts | Initial contacts table | contacts/CardDAV |
| 0016 bulk flag | Message bulk classification column | spam/category UI |
| 0017 contacts v2 | Migrates legacy contacts to address books + contacts, computes ETags, adds email/name indexes, drops legacy table | CardDAV/contact migration |
| 0018 contacts search | Trigram indexes for contact name/email/organization | contacts search |
| 0019 user integrations | User-scoped integrations table | integrations/OAuth |
| 0020 MFA/device trust | Recovery email, trusted devices/token index, email OTP rows/index, MFA settings | auth/MFA |
| 0021 spam training | Message spam score/verdict/features, checks/index, spam training log and indexes | spam pipeline/training |
| 0022 reset tokens | Password-reset token table and token/user indexes | password recovery |
| 0023 categories | Message category/index, account categorization toggle, category-list source table | categorization/rules |
| 0024 category improvements | List-Unsubscribe headers | unsubscribe capability |
| 0025 unsubscribe state | Unsubscribed timestamp | unsubscribe tracking |
| 0026 OIDC admin group | Admin group claim/value fields | OIDC role mapping |
| 0027 CardDAV client | Address-book source/external URL, revised contact email indexes | remote CardDAV sync |
| 0028 folder modseq | Folder highest-modseq watermark | incremental IMAP sync |
| 0029 OAuth public client | Account public-client flag | OAuth device flow/refresh |
| 0030 GTD | Legacy account GTD columns | historical plugin, later migrated |
| 0031 GTD gist | Message GTD gist field | historical GTD plugin |
| 0032 GTD pets | GTD plugin table | legacy plugin |
| 0033 GTD pets custom | Custom flag and backfill | legacy plugin |
| 0034 lock PIN | User lock PIN hash | screen lock |
| 0035 RP logout | OIDC RP-initiated logout toggle | OIDC logout |
| 0036 unified inbox | Account include-in-unified-inbox flag | inbox scoping/UI |
| 0037 delivery addresses | Message delivery-address JSON | alias/recipient resolution |
| 0038 AI Codex OAuth | AI Codex credential/device-flow tables and indexes | AI provider auth |
| 0039 inbox forwards | Rule forwarding child table/index | rule actions/send |
| 0040 SMTP separate auth | Separate SMTP auth user/password columns | SMTP transport |
| 0041 plugin data | Plugin-owned key/value/blob data, owner FK and legacy data transfer | plugin runtime/storage |
| 0042 GTD plugin migration | Adds legacy users to enabledPlugins preference | plugin activation |
| 0043 drop GTD pets | Drops obsolete GTD table | plugin migration |
| 0044 message plugin annotations | JSONB plugin annotations, migrates legacy gist, drops old gist column | plugin message annotations |
| 0045 plugin account config | Per-account plugin configuration with account cascade and data transfer | plugin settings |
| 0046 drop legacy GTD columns | Drops GTD columns after config migration | plugin migration |
| 0047 folder no-select | Folder non-selectable marker | folder traversal/sync |
| 0048 snippet attempt | Message snippet-attempt timestamp | body/snippet recovery |
| 0049 OIDC login matching | Login-match claim policy | OIDC identity mapping |
| 0050 message sender | Sender email/name columns | parsed message/UI/search |
| 0051 folder server status | Server totals/unread/UIDNEXT/UIDVALIDITY/modseq plus status attempt/sync/error fields | folder status monitor |
| 0052 spam features | Spam training body/features/domain/attachment types and created-time index | ML spam model |
| 0053 spam models | User spam model rows and training indexes | spam model training |
| 0054 account antispam | Account antispam toggle and index | spam pipeline |
| 0055 spam training deletions | Deletion/tombstone records with account SET NULL behavior | training deletion/recovery |
| 0056 trusted authserv-id | Account trusted Authentication-Results authority | spam/authentication analysis |
| 0057 split subject threads | Rewrites subject-merged thread IDs and drops helper functions | thread correctness/backfill |
| 0058 unfetchable UIDs | Per-account unfetchable UID records/index; account cascade | sync gap/recovery |
| 0059 forwarded-from metadata | Forwarded sender identity fields | forwarding/thread metadata |
| 0060 thread index repair | Concurrent index replacement to cover deleted rows in thread propagation | sync/thread query plan |
| 0061 BCC addresses | Message BCC JSON | send/recipient metadata |
| 0062 automatic recipients | Account auto-CC/auto-BCC arrays | compose/send |
| 0063 user last seen | Last-seen timestamp plus backfill | auth/last-seen |
| 0064 auth event actor | Auth-event actor username | audit |
| 0065 signature enabled | Account signature toggle | compose/signature UI |
| 0066 account icon | Account icon field | account list UI |

## Cross-cutting cascade / lifecycle observations

- The baseline has account cascade FKs for messages, folders, aliases and snoozed messages. Later migrations add account-owned plugin config and unfetchable UID rows with cascade. Spam training rows reference account with SET NULL in relevant tables, preserving training records while detaching deleted accounts. Inbox rules can be account-scoped and have account cascade; forwarding children cascade from rules.
- Account route deletes the account row before asynchronous IMAP disconnect. Verify remaining account-keyed tables, Redis/in-memory caches, plugin hooks, push events, scheduled jobs, and filesystem/body/attachment storage; database FK cascades alone do not establish full cleanup.
- `integration_config` allows nullable user ownership and has a unique provider index. Review provider/global scope semantics and tenant boundaries before reuse.
- Contacts migration 0017 renames legacy table, copies/backfills rows and then drops the legacy table. Migration 0041/0045 copy legacy plugin data/config before 0043/0046 remove obsolete GTD storage; these are irreversible data-shape transitions and deserve explicit fixture/upgrade tests.
- `-- no-transaction` migrations include concurrent index operations. Verify each is idempotent after partial failure, especially the index-replacement migrations 0009 and 0060.

## Remaining work

1. Extract every full DDL statement and constraint into a machine-readable schema artifact; this prose table is an index, not the full column-level schema.
2. Enumerate SQL consumers (queries, joins, dynamic SQL) and transaction/locking assumptions for each table; connect each to routes/services/tests.
3. Test migrations from an empty DB and from representative prior schema versions, including partial failure on no-transaction migrations and data-preserving upgrades.
4. Trace runtime schema additions not directly represented by a migration file (notably `schema_migrations`) and inspect seeds/config defaults.
5. Continue per-path classification, dependency closure and license/provenance review. No database capability or overall extraction PASS is claimed.
