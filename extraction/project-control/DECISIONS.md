# Decisions

## 001 — 2026-10-14 — Pin before discovery
Use MailFlow main commit e7a53760a7e4b15e0ee631533655d99dde657599 and root tree 27059315bc16155f0064dc136aae94cd5097cb02 as the initial source baseline. Never advance the pin silently.

## 002 — 2026-10-14 — Immutable versioned snapshots
Each approved snapshot is immutable and keyed by upstream commit/tree. Updates create a new revision and preserve older snapshots/evidence.

## 003 — 2026-10-14 — AI review, not blind sync
A scheduled watcher detects new commits and opens a tracking issue. AI agents classify and trace impact; reviewed PRs advance the pin.

## 004 — 2026-10-14 — Licensing is a gate
README declares AGPL-3.0 and a separate commercial license; CLA is present. Classify path-level provenance and third-party terms before reuse.

## 2026-10-17 — Source snapshot and update policy
- The user authorized beginning a full MailFlow upstream source snapshot and capturing future upstream changes.
- Each snapshot is immutable and keyed by the exact upstream commit SHA. Existing snapshots are never overwritten.
- Upstream changes are proposed through a reviewable PR that updates the pin and manifests; no automatic merge or host integration is performed.
- Existing path classifications carry forward only when both blob SHA and file mode match exactly. Changed/new paths reset to unclassified and require review.
- The extraction workspace remains in Rilan-Dev/mailflow; ai-reusable-libraries remains the canonical generic framework and cross-project catalog.
