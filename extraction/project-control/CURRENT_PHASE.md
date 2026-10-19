# Current Phase — MailFlow Extraction

## PHASE 3 — CAPABILITY CLOSURE AND LICENSE/PROVENANCE REVIEW

Phase 2 source snapshot capture and exact tree verification are complete for the current pinned upstream commit.

- Current upstream: maathimself/mailflow main
- Commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Snapshot: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source
- Inventory: 1,497 entries; 1,350 blobs; 147 nested trees; 0 gitlinks; 0 Git LFS pointer files detected.
- Verification: exact 1,350 blob hashes checked; verifier PASS; reconstructed root tree SHA and all 147 nested tree SHAs match the upstream tree.
- Initial classification: 39 paths classified by role; 1,311 source blobs remain UNCLASSIFIED. Most licenses/provenance remain unreviewed; classifications are not reuse clearance.
- Security static trace: started for auth/OAuth/OIDC, outbound host validation, safe fetch, image proxy and email sanitizer. Three capabilities have PARTIAL_STATIC_TRACE_NOT_CLOSED; tests were identified but not run in this static trace.

The extraction is NOT complete. License/provenance, dependency closure, and host-integration readiness remain open. AGPL-3.0, separate commercial-license terms, CLA and third-party provenance require review. No host integration or extraction PASS is claimed.

Priority order: auth/OAuth/MFA and session security; safe remote fetch/image proxy/email sanitization; IMAP/SMTP and account lifecycle; PostgreSQL schema/migrations/encryption; plugin isolation; then message/UI, contacts, rules/spam, AI, notifications, native clients and deployment.

---

## Historical checkpoint preserved (pre-snapshot-verification state)

The following is retained for continuity. The current authoritative state is described above; historical action items below may be completed or superseded.

# Current Phase

PHASE 1 — REPOSITORY INVENTORY AND CAPABILITY DISCOVERY.

Completed: source commit/tree pinned; full recursive tree inventory captured; README, AGPL license, commercial license, CLA, contribution guidance and CI inspected.

Pending: architecture and capability tracing; all-path disposition; dependency closure; per-path license/provenance audit; independent reconciliation; copy plan and verifier design.

Exact-copy Phase 2 is BLOCKED until discovery/closure has evidence-backed PASS and independent reconciliation/controller authorization. Never edit upstream or an immutable snapshot.


## Evidence update — 2026-10-14
A preliminary path-based candidate map and complete file register now exist. This does not close discovery: all file dispositions, licenses and dependency edges remain pending. The change watcher is authored but unverified. Phase remains 1 and exact copy remains blocked.

## Phase update — 2026-10-17
Current phase: PHASE 2 — IMMUTABLE SOURCE SNAPSHOT AND VERIFICATION (automation authored; capture execution pending). The user has authorized beginning the full upstream snapshot and ongoing upstream change capture. Phase completion requires a real snapshot run, matching root tree/manifest, exact blob verification, complete file-set verification, and explicit handling of gitlinks/LFS. Capability closure and per-path licensing/provenance remain subsequent open work; no extraction PASS is claimed.
