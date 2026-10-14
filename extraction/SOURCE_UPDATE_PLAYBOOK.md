# MailFlow Upstream Update Playbook

This playbook contains source-specific context only. Generic update-review rules are provided by the locally versioned framework:

- Prompt: [Prompt 11 — Upstream update review](../source-extraction-agent/prompts/11-upstream-update-review.md)
- Workflow: [Upstream update capture](../source-extraction-agent/workflows/upstream-update-capture.md)
- Report template: [Upstream update report](../source-extraction-agent/templates/upstream-update-report.md)

## Upstream

- Canonical repository: https://github.com/maathimself/mailflow
- Tracked ref: `main`
- Current proposed discovery baseline: `e7a53760a7e4b15e0ee631533655d99dde657599`
- Proposed root tree: `27059315bc16155f0064dc136aae94cd5097cb02`

## Procedure

1. Detect a new upstream commit and record the old/new commit and root tree SHAs.
2. Generate a compare summary and inventory affected paths; do not fetch/copy changed application files into an immutable snapshot.
3. Reassess impacted capabilities, call paths, dependencies, tests, runtime/configuration and license/provenance.
4. Update manifests and append evidence to this workspace's worklog/session records.
5. Keep the proposed pin unchanged until independent review and explicit authorization. Upstream change detection is not copy permission.
6. Re-run the local inventory verifier when its inputs change and record exact command/output/exit status. It is only a manifest-consistency check.
