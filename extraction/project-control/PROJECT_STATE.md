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
