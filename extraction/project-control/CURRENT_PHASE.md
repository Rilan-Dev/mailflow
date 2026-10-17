# Current Phase — MailFlow Extraction

## PHASE 3 — CAPABILITY CLOSURE AND LICENSE/PROVENANCE REVIEW

Phase 2 source snapshot capture and exact tree verification are complete for the current pinned upstream commit.

- Current upstream: maathimself/mailflow main
- Commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Snapshot: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source
- Inventory: 1,497 entries; 1,350 blobs; 147 nested trees; 0 gitlinks.
- Verification: exact 1,350 blob hashes checked during capture; verifier PASS; reconstructed root tree SHA and all 147 nested tree SHAs match the upstream tree.

The extraction is NOT complete. All 1,350 current source blobs remain UNCLASSIFIED / license UNREVIEWED / closure UNMAPPED. The 16 capability areas are candidates only. AGPL-3.0, the separate commercial license path, CLA and third-party provenance require review. No host integration or extraction PASS is claimed.

Priority order: auth/OAuth/MFA and session security; safe remote fetch/image proxy/email sanitization; IMAP/SMTP and account lifecycle; PostgreSQL schema/migrations/encryption; plugin isolation; then message/UI, contacts, rules/spam, AI, notifications, native clients and deployment.
