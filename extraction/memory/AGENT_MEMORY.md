# MailFlow Extraction — Durable Agent Memory

## Repository ownership
- This repository (`Rilan-Dev/mailflow`) owns the MailFlow-specific extraction workspace at `extraction/`, including source pins, manifests, memories, sessions and project-control records.
- The complete reusable framework is versioned in `source-extraction-agent/` in this same repository. Use its prompts, rules, templates, schemas, skills and workflows locally; do not require a checkout of `ai-reusable-libraries` to resume work.
- The canonical reusable framework remains maintained in `Rilan-Dev/ai-reusable-libraries`; this local copy is self-contained and may be updated deliberately from that source.

## Safety and evidence
- The tracked upstream is `https://github.com/maathimself/mailflow`, not this target repository.
- Proposed discovery pin: commit `e7a53760a7e4b15e0ee631533655d99dde657599`; tree `27059315bc16155f0064dc136aae94cd5097cb02`.
- No upstream application source has been copied or authorized for copy.
- All 1,319 upstream blobs remain unclassified; license/provenance, dependency closure and independent reconciliation are blockers.
- Inventory consistency is not extraction PASS. Never claim verification unless the command actually ran and its raw result was recorded.
- Preserve source bytes and Git object identity; do not modify immutable upstream source.
- Do not store secrets, tokens, passwords or private user data here.

## Session discipline
At start, inspect Git state, source pin, project-control next action, verification state, latest worklog and latest session. At handoff, append to worklog and session history, update continuity/next action/verification, list changed files and exact checks, and leave one actionable next step.
