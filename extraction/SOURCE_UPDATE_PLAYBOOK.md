# MailFlow Upstream Update Notes

This file is specific to MailFlow's baseline and known risks. The global procedure is maintained once at:

- `../source-extraction-agent/prompts/11-upstream-update-review.md`
- `../source-extraction-agent/workflows/upstream-update-capture.md`
- `../source-extraction-agent/templates/upstream-update-report.md`

For every upstream update, record baseline/latest commit and tree, changed path identities, capability/dependency impact, license/provenance review, verification evidence and an explicit promotion decision. Preserve the previous pin/snapshot. Never blind-sync, overwrite or auto-promote.

MailFlow-specific checks:
- Review AGPL-3.0 and the separate commercial licensing path and CLA.
- Re-evaluate notices, icons, fonts, third-party assets and per-path provenance.
- Reconcile all changes against the current path-disposition register and capability/dependency evidence.
- An update issue is only a review trigger; it does not authorize source copying or PASS.

## Current automation policy (2026-10-17)
- The user authorized full source snapshot capture and ongoing updates.
- .github/workflows/mailflow-source-snapshot.yml runs on manual dispatch and every six hours. When upstream main changes, it captures the new Git commit into a new immutable extraction/snapshots/<commit>/source path, regenerates pin/tree/disposition manifests, verifies the copied blob IDs and reconstructed Git tree, and commits the source-library snapshot to this repository's main branch.
- This direct main update is raw source-library capture only. It is not a capability PASS, license clearance, or host-application integration approval.
- The snapshot is never overwritten. Changed/new paths reset to UNCLASSIFIED; unchanged assessments carry forward only if blob SHA and mode match exactly.
- If the capture or exact verifier fails, do not use the snapshot. Inspect the Actions logs and preserve the failure evidence in project-control.
