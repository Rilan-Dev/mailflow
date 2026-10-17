# Chat Continuity — MailFlow Extraction Workspace

Resume in `Rilan-Dev/mailflow`. Read `extraction/README.md`, then the root `source-extraction-agent/AGENTS.md`, `EXTRACTION_RULES.md`, `EXTRACTION_AGENT_SPEC.md`, and `source-extraction-agent/project-control/NEXT_ACTION.md`. For MailFlow-specific state, read the files in `extraction/project-control/` and `extraction/memory/AGENT_MEMORY.md`.

Initial source pin: commit e7a53760a7e4b15e0ee631533655d99dde657599; root tree 27059315bc16155f0064dc136aae94cd5097cb02; captured 2026-10-14. Full tree inventory: `extraction/manifests/source-tree-2026-10-14.json` (1,462 entries; complete response). Inspected README, LICENSE, LICENSE-COMMERCIAL, CLA, CONTRIBUTING and CI.

Current phase: Phase 1 inventory/capability discovery. No source files copied. Exact-copy Phase 2 blocked pending capability closure, all-path disposition, license/provenance classification, independent reconciliation and authorization.

Preserve history and append updates. The user requires future upstream commits to be detected and reviewed by AI-assisted workflows. Generic framework updates should be reviewed against the canonical copy in `Rilan-Dev/ai-reusable-libraries/source-extraction-agent/`; never blind-sync it into this repository.

## Discovery status — 2026-10-14

A preliminary capability map and a path-disposition register for all 1,319 source blobs are present. Every path remains unclassified. A scheduled/manual watcher was authored in the reusable-libraries repository but has not been validated end-to-end; it must not be assumed to monitor this repository's external pin.

A 16-capability initial architecture map has been added and its referenced paths were verified against the pinned tree. No capability is closure-complete yet. Continue tracing imports/callers, data, configuration, tests and host/platform dependencies, starting with security/auth, IMAP synchronization, plugin isolation and migrations.

A connector-based check verified consistency across the pinned tree, complete tree manifest, all-file register, candidate map and architecture candidate blob SHAs: zero mismatches. The Node verifier has not been run in a local checkout. All 1,319 source paths remain unclassified and exact copy remains blocked.

## Workspace migration — 2026-10-14

A PR was opened to make this repository self-contained for extraction work. The shared framework is copied to the repository root at `source-extraction-agent/`; MailFlow-specific records are under `extraction/`. The framework copy is pinned to canonical `ai-reusable-libraries` commit `1e6ba9588e715e698722949e1c592b08f4ea7a00`. PR: https://github.com/Rilan-Dev/mailflow/pull/1. It is open and not merged at the time of this note.

No application source was copied, source-copy authorization remains false, and no extraction PASS is claimed.

## Continuity update — 2026-10-17
The MailFlow workspace migration PR #1 is merged. The old parallel PRs #2 and #3 were closed as superseded because they conflict with the merged workspace; their useful intent is recorded in durable memory and current project-control. In ai-reusable-libraries, PR #8 is merged and duplicate cleanup PRs #6/#7 are closed.

The user explicitly requested beginning full source extraction and ongoing updates from upstream maathimself/mailflow. Current upstream observed at review time: commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60, root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. The exact snapshot capture script and scheduled/manual workflow have been added to main. First inspect workflow runs and the generated automation/mailflow-upstream-snapshot PR. Do not claim the snapshot was copied until actual run output and verifier evidence are present.

Resume from NEXT_ACTION.md, then inspect source-pins/current.json and the exact manifest paths recorded there. Preserve immutable snapshots; do not merge automated source updates without checking exact blob verification and license/provenance state.

## Snapshot captured — 2026-10-17
The full source snapshot has now been captured and verified. Current pin is maathimself/mailflow commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60, root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. Snapshot path: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source. Inventory: 1,497 entries, 1,350 blobs, 147 nested trees, 0 gitlinks. GitHub Actions verification passed at https://github.com/Rilan-Dev/mailflow/actions/runs/39030338698, including all 1,350 blob hashes, file-set/mode/symlink checks, root tree SHA reconstruction and all 147 nested tree SHAs.

The initial source update was 31 new blobs and 116 changed blobs against the October 14 baseline. The old architecture/candidate maps remain historical; current-pin architecture and closure trackers have been added. All 1,350 current source blobs remain unclassified, license/provenance unreviewed and dependency closure unmapped. Continue security-sensitive capability closure and license/provenance work; do not claim extraction PASS or host integration.

## Security closure checkpoint — 2026-10-17
The snapshot is verified (1,350 blobs, 147 nested trees, root tree SHA matches, 0 gitlinks, 0 Git LFS pointer files). Six source paths have initial evidence-backed classifications (license notices and direct dependency manifests); 1,344 remain unclassified. Current security closure evidence is in extraction/manifests/security-closure-2026-10-17-35067fc.json, with source SHAs and 15 candidate test references. The trace is static only; tests were not executed and no capability is closed. Continue auth/OAuth/OIDC/session security and outbound host validation/safeFetch/image proxy/email sanitizer caller tracing, then close IMAP/account lifecycle and migrations. Keep license/provenance and redistribution review open.

## Current path/dependency checkpoint — 2026-10-17
The current progress report is extraction/manifests/EXTRACTION_PROGRESS_2026-10-17.md. The full snapshot is exact and verified. Current register has 39 initially classified paths and 1,311 unclassified paths. A partial security trace covers auth/session, OAuth/OIDC, host validation, safeFetch, image proxy and email sanitization; tests were identified but not executed. Dependency inventory contains 1,124 locked package entries and no third-party licenses cleared. Continue security caller/redirect/policy tracing, run the listed tests in a real checkout, then map IMAP/account lifecycle and migrations. Do not call this extraction PASS or reuse-cleared.

## Security test execution update — 2026-10-17

A dedicated selected-security test workflow was added on main: `.github/workflows/mailflow-security-closure.yml`. Successful run: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550. It ran against the pinned source snapshot and passed 14 backend test files / 375 tests plus 1 frontend test file / 4 tests (15 files, 379 tests, zero failures). Exact machine-readable results: `extraction/manifests/security-test-results-2026-10-17-35067fc.json`. The initial workflow run failed due to a mistyped working-directory path; it was corrected and the subsequent run passed.

Continue capability closure, starting with deeper auth/OAuth/OIDC and outbound-fetch threat-model tracing, then IMAP/account lifecycle and migrations. No capability closure or overall extraction PASS is implied. The 1,311 unclassified source blobs and all third-party license/provenance review remain open.


## Continuity update — 2026-10-17 — Security/transport/schema trace

Read current extraction project-control, pinned manifests and source files. Added `extraction/manifests/security-transport-database-trace-2026-10-17.md`. Findings: auth/session and OAuth/OIDC have meaningful safeguards but remain partially closed; `safeFetch` uses a guarded connector for redirects, while all call sites still need auditing; IMAP/SMTP host checks exist on account create/update, and IMAP re-resolves/pins at connection time; account secrets are encrypted; account deletion removes DB rows before asynchronous disconnect; `imapManager` has bounded connection/backoff controls; send/draft routes have delayed sent-metadata retry and safe draft replacement behavior; 66 SQL migrations are executed by a locked, transaction-aware runner. Next: close OIDC network call sites and HTML render sinks, fully map all migrations and runtime SQL consumers, then trace IMAP sync/recovery and dependency/licensing closure. Selected security tests remain 379/379 passed, but no capability closure or overall extraction PASS is claimed.


## Continuity update — 2026-10-17 — PostgreSQL migration map

Inspected all 66 pinned SQL migration files and the migration runner; added `extraction/manifests/postgres-schema-runtime-map-2026-10-17.md`. The map captures baseline core tables/foreign-key cascades, migration-by-migration changes, runtime capability linkage, and risk points in contacts/plugin migrations and concurrent-index migrations. It remains an initial human-readable map, not a complete DDL/constraint artifact or a live PostgreSQL migration test. Next: generate the machine-readable schema object inventory, map SQL consumers, test migrations in clean/upgrade DBs, and continue IMAP sync/recovery plus security/license closure.


## Continuity update — 2026-10-17 — IMAP/SMTP test expansion

Traced IMAP connect/disconnect, folder sync, message sync, account auto-connect, UIDVALIDITY purge/re-backfill, UID-keyed message upserts and thread propagation. SMTP transport re-checks connection policy and pins resolved addresses at send time; auth credentials are decrypted only for transport, OAuth refresh is handled, and plaintext SMTP is denied unless insecure TLS is explicitly enabled by admin policy. Added `.github/workflows/mailflow-transport-closure.yml` with 43 targeted snapshot tests. Run 39034389282 is queued; no result yet. Snapshot verifier run 39034359461 passed after manifest updates. Continue UI states, attachment and account cleanup closure, then verify the test run and expand the schema/dependency/license map.


## Continuity update — 2026-10-17 — OIDC and frontend sink risk

OIDC inspection found a closure gap: `getDiscovery` validates issuer/advertised endpoint hostnames in the normal path but uses native fetch for discovery/token requests, without carrying the safeFetch pinned connector or redirect-hop checks into those connections. `allow_insecure` bypasses host validation/HTTPS-only checks and disables TLS certificate verification; treat as a high-priority opt-in review, not as proof of universal exploitability. Frontend trace identified sandboxed iframe/CSP, optional `prepared.html` div sink, `linkifyText(body.text)` HTML sink, DOMPurify/app-origin composer sanitizer, and signature-editor innerHTML path. Evidence and issues are recorded in the security trace, ISSUES and RISKS. Role classification now 124/1,350 with 1,226 unclassified. Frontend security render tests were added; transport run 39034389282 was queued at last check. Continue independent closure work; do not report pending tests as passed.
