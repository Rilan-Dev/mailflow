# Session — Extraction Workspace Ownership Migration

Date: 2026-10-14

## Goal

Make MailFlow self-contained for its source-specific extraction records and provide a
versioned local copy of the shared extraction framework.

## Planned migration

- Copy the canonical `source-extraction-agent/` tree from
  `Rilan-Dev/ai-reusable-libraries` at commit
  `1e6ba9588e715e698722949e1c592b08f4ea7a00`.
- Place MailFlow-specific baseline manifests, project-control, source pin, and
  inventory verifier under `extraction/`.
- Keep global framework/catalog ownership in `ai-reusable-libraries`; stop treating
  `mailflow-source-library/` there as the working home.
- Add durable memory and session conventions.

## Safety state preserved

No MailFlow application source was copied. The proposed discovery pin remains
`e7a53760a7e4b15e0ee631533655d99dde657599`; all 1,319 source blobs remain
unclassified, and source-copy authorization remains false. Inventory verifier and
upstream watcher have not been validated end-to-end as part of this workspace migration.

## Follow-up

- Open a PR in MailFlow and record its URL/commit in
  `extraction/project-control/WORKLOG.md`.
- Update the central catalog so MailFlow points to its own repository and its watcher
  does not assume its pin file lives inside `ai-reusable-libraries`.
- Remove the migrated MailFlow-specific records from the reusable-libraries repository
  in a separate PR, retaining the global catalog and reusable framework.
- Run the inventory verifier in a real checkout; do not wait on unrelated CI/deploy
  gates to continue extraction analysis.


## Cross-repository follow-up

- Opened https://github.com/Rilan-Dev/ai-reusable-libraries/pull/6 to remove duplicate MailFlow-specific records from the global framework repository and update the central catalog. PR #6 is open and unmerged at the time of this note.
- Both PRs are intentionally left open; neither has been merged by this migration workflow.
