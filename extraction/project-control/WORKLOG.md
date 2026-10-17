# Worklog — Append-only

## 001 — 2026-10-14 — Initial MailFlow baseline
- Resolved main to commit e7a53760a7e4b15e0ee631533655d99dde657599.
- Captured root tree 27059315bc16155f0064dc136aae94cd5097cb02; recursive response complete with 1462 entries (1319 blobs, 143 directories).
- Saved full path/mode/type/object-SHA/size inventory in `extraction/manifests/source-tree-2026-10-14.json`.
- Inspected README, AGPL license, commercial license, CLA, contributing guidance and CI workflow.
- Identified dual-license notice and CLA; per-path license review remains pending.
- Added user guide, extraction/update prompts and project-control records.
- No application source copied; no extraction PASS claimed.
- Next: full capability discovery, path disposition, dependency closure, license/provenance review and independent reconciliation.

## 002 — 2026-10-14 — Add preliminary capability map and update watcher
- Added a preliminary capability candidate index from the complete source tree and an all-1,319-blob path-disposition register. Every path remains UNCLASSIFIED, license UNREVIEWED and closure UNMAPPED; these are explicit gaps, not a gate pass.
- Added a scheduled/manual GitHub Actions watcher to detect changes to upstream main and create or update a tracking issue with old/new commit/tree pins and a compare URL.
- Added the end-to-end user guide, initial extraction and update-review prompts, and source update playbook.
- The watcher has not been run end-to-end and must not be assumed to watch this repository's pin until it can read external-repository state safely.
- Application source remains uncopied; no extraction PASS claimed.

## 003 — 2026-10-14 — Trace first architecture candidates
- Inspected pinned backend/frontend manifests, backend entry point, plugin boundary guide, IMAP manager, message service, image proxy, email sanitizer, AI route, frontend shell, Electron security, Android security, Docker compose and CI workflow.
- Added a 16-capability initial architecture map with source blob SHAs and test candidates; validated that every referenced path exists at the pinned tree.
- Corrected the spam pipeline candidate to the actual path and rechecked blob identity.
- All capabilities remain CANDIDATE_NOT_CLOSED; this is not dependency closure. All source paths remain unclassified and no application source has been copied.

## 004 — 2026-10-14 — Add and cross-check inventory verifier
- Added `extraction/tools/verify-inventory.mjs` to check the pin, full-tree manifest, all-file disposition register, candidate areas and architecture path/blob identities.
- Independently ran equivalent consistency checks against the stored JSON and live pinned tree using the GitHub connector: PASS; 1,462 tree entries, 1,319 blobs, zero missing/duplicate paths or SHA/mode mismatches in the register, and zero missing architecture candidate paths.
- The Node verifier script itself has not been executed in a local runtime. CI execution is pending workflow availability on the default branch.
- All 1,319 dispositions remain UNCLASSIFIED; this does not pass capability closure or authorize copying.

## 005 — 2026-10-14 — Make MailFlow extraction workspace self-contained
- Copied the 63-file shared `source-extraction-agent/` framework from canonical `ai-reusable-libraries` commit `1e6ba9588e715e698722949e1c592b08f4ea7a00`; every transferred framework blob retained the same Git SHA.
- Migrated 21 MailFlow-specific records from the reusable-libraries workstream into `extraction/`; transferred source-record blob identities match the original SHA values.
- Added `source-extraction-agent/UPSTREAM_PIN.json`, local-copy policy, `extraction/README.md`, durable extraction memory and session conventions.
- Opened https://github.com/Rilan-Dev/mailflow/pull/1. The PR is open and unmerged at the time of this entry.
- This is a documentation/control-workspace migration only. No MailFlow application source was copied, the proposed source pin was not promoted, and source-copy authorization remains false.
- Next: update the central catalog and remove duplicate MailFlow working records from `ai-reusable-libraries` in a separate PR; keep monitoring disabled until the watcher supports external-repository pins.


## 006 — 2026-10-14 — Remove duplicate MailFlow workstream from global library
- Opened https://github.com/Rilan-Dev/ai-reusable-libraries/pull/6 to remove the migrated 21-file MailFlow workstream from the reusable-libraries repository, update the global catalog to point to this repository, and disable the watcher until external pin retrieval is supported.
- PR #6 remains open and unmerged at the time of this note. The canonical generic framework and cross-source catalog remain in `ai-reusable-libraries`.

## 005 — 2026-10-17 — Start full source snapshot extraction
- Confirmed MailFlow workspace PR #1 merged to main at 7987a4eff2a340d732365340840221609a7f446c. Closed stale conflicting PRs #2 and #3 as superseded rather than merging duplicate changes; retained their useful memory/source-identity intent on main.
- Confirmed the canonical upstream maathimself/mailflow main was at 35067fc2876d50980f1a8a3b8ea72b5467b69f60 with root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17 at review time.
- Added extraction/tools/capture-upstream-snapshot.mjs. It captures Git blobs directly, preserves file modes and symlinks, writes an immutable commit-addressed source tree, generates commit-specific manifests, carries forward path assessments only when blob SHA and mode are unchanged, and checks exact blob SHA during capture.
- Updated extraction/tools/verify-inventory.mjs to resolve manifests through the pin and verify snapshot blob identity, file set, symlinks and executable bits.
- Added .github/workflows/mailflow-source-snapshot.yml to capture upstream main on dispatch, every six hours, and on workflow/tool introduction. It opens or updates a reviewable PR rather than silently merging source changes.
- Refreshed NEXT_ACTION.md, PROJECT_STATE.md and durable agent memory. Source capture has been authorized by the user; capability closure, per-path licensing/provenance, redistribution clearance and host integration remain unverified.
- Snapshot workflow run and generated PR are not yet evidenced in this worklog. Do not claim a source snapshot is captured until its actual output is reviewed.
