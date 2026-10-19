# Snapshot Integrity Incident — 2026-10-19

## Summary

A full verification run on the previous workspace failed for the historical snapshot pinned to upstream commit `35067fc2876d50980f1a8a3b8ea72b5467b69f60`.

- Verifier run: https://github.com/Rilan-Dev/mailflow/actions/runs/39207353893
- Affected relative path: `frontend/tailwind.config.js`
- Expected upstream blob SHA from the original commit tree and manifest: `268170402e354267054a0d31dd420aa885ce55ee`
- Blob SHA currently stored at the old snapshot path: `ce8681f8ac50c0ecc9eab6a9edfcbabe8d7d1500`
- Upstream tree query for the pinned commit independently returns the expected blob SHA `26817040...`; therefore the old stored snapshot is not an exact copy at this path.

## Containment

- Do not describe the old snapshot as verified.
- Do not edit the old snapshot path in place. Preserve its bytes and the failed evidence as an immutable incident record.
- The newer upstream commit `c1c446914dc031feb331993c9da339cc524809d5` has its own snapshot directory and manifest. Its capture reported 1,354 blobs copied and SHA-checked, 147 nested trees and reconstructed root tree `c3c54d9440f25c204368a0bafbbee836e05deb5f`. This capture evidence is not a substitute for running the full verifier against that current pin.
- Workspace recovery PR: https://github.com/Rilan-Dev/mailflow/pull/4. It restores only `extraction/`, `source-extraction-agent/`, and extraction-specific workflows on top of current `main`; no app-source files are changed by the recovery commit.

## Required follow-up

1. Run the exact inventory verifier on the recovery branch with current pin `c1c4469`; confirm it validates the new snapshot directory rather than the historical one.
2. Inspect the capture script and manifest path resolution so a future snapshot cannot silently make the verifier compare a manifest from one commit to another commit's snapshot.
3. If the old snapshot needs repair for archival use, create a separately identified repair/reconstruction directory from the original Git object tree and document the relationship. Never silently rewrite the existing snapshot.
4. Review workflow permissions. The source-snapshot action failed to open its PR because repository Actions settings prohibit GitHub Actions from creating pull requests. Until that setting is changed by an authorized maintainer, the action cannot open its own PR; use the connected GitHub PR action or a manually authorized workflow path.
5. Keep AGPL-3.0/commercial-license/CLA, per-path license/provenance, capability closure and redistribution clearance gates open.

## Current disposition

- Historical `35067fc` snapshot integrity: **FAIL — one confirmed blob mismatch**.
- Current `c1c4469` capture integrity: **blob-copy checks passed during capture; full inventory verification pending**.
- Host integration and redistribution: **not authorized by current evidence**.
