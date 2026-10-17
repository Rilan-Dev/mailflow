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

---

## Historical checkpoint preserved (pre-snapshot-verification state)

The following is retained for continuity. The current authoritative state is described above; historical action items below may be completed or superseded.

# Project State — MailFlow Extraction Workspace

- Working repository: https://github.com/Rilan-Dev/mailflow
- Canonical upstream source: https://github.com/maathimself/mailflow (branch main)
- Shared extraction framework: versioned local copy at source-extraction-agent/; canonical framework at https://github.com/Rilan-Dev/ai-reusable-libraries/tree/main/source-extraction-agent
- MailFlow-specific extraction records: extraction/ (source pins, manifests, memory, sessions, snapshots, project-control and tools)
- Current phase: full-source snapshot capture and verification, followed by capability closure and licensing/provenance review.
- User authorization: begin full source snapshot extraction and ongoing upstream change capture.
- Latest upstream identity observed 2026-10-17: commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60; root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. The automated capture workflow must resolve the live ref at run time.
- Initial historical discovery baseline: e7a53760a7e4b15e0ee631533655d99dde657599 / 27059315bc16155f0064dc136aae94cd5097cb02; 1,462 entries and 1,319 blobs.
- Source snapshot automation: .github/workflows/mailflow-source-snapshot.yml; capture tool: extraction/tools/capture-upstream-snapshot.mjs; verifier: extraction/tools/verify-inventory.mjs.
- Existing framework/workspace PR #1 is merged. Stale duplicate PRs #2 and #3 are closed; the global catalog cleanup PR #8 is merged and duplicate PRs #6/#7 are closed.
- License signals: AGPL-3.0, separate commercial license path and CLA. Per-path provenance, third-party licensing and redistribution review remain open.
- Exact source snapshot: automation is configured to create/update a reviewable PR. A completed capture and passing exact-blob verification must be evidenced before stating the snapshot is complete.
- Capability/dependency closure: incomplete. Extraction PASS: not claimed. Host integration: not authorized by current verification state.
