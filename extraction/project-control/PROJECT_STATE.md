# Project State — MailFlow Extraction

- Working repository: https://github.com/Rilan-Dev/mailflow
- Canonical upstream: https://github.com/maathimself/mailflow, branch main
- Canonical shared framework: https://github.com/Rilan-Dev/ai-reusable-libraries/tree/main/source-extraction-agent
- Local framework copy: source-extraction-agent/
- MailFlow-specific extraction records: extraction/
- Current source pin: commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60; root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17.
- Immutable source snapshot: extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source
- Current inventory: 1,497 entries; 1,350 blobs; 147 tree entries; zero gitlinks.
- Snapshot integrity: exact 1,350 blob hashes checked; verifier PASS; reconstructed root and all 147 nested tree SHA values match the upstream tree.
- Current delta from initial discovery baseline: 31 added blobs, 116 changed blobs, 1,203 unchanged blobs, 0 removed blobs.
- Path dispositions: 1,350 UNCLASSIFIED; license/provenance UNREVIEWED; closure UNMAPPED.
- Capability map: 16 candidates rebased to the current pin; no capability closed. Partial direct import/route scan recorded for 16 high-value files, not transitive closure.
- Automation: .github/workflows/mailflow-source-snapshot.yml; scheduled every six hours and manually dispatchable. New upstream commits are captured as new immutable snapshots and verified before direct commit to main. The workflow does not integrate source into host applications.
- License signals: AGPL-3.0, separate commercial-license path and CLA. Per-path third-party provenance and redistribution review remain open.
- Phase: capability closure and license/provenance review.
- Extraction PASS: not claimed. Host integration: not cleared.
