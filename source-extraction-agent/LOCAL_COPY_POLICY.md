# Local Framework Copy Policy

MailFlow carries a versioned copy of the canonical framework from
`Rilan-Dev/ai-reusable-libraries/source-extraction-agent/` so extraction work can
resume from a MailFlow checkout alone.

- The canonical framework remains upstream; this copy is not a second authority for
  cross-project policy.
- MailFlow-specific source facts, pins, manifests, memories, sessions, and project
  progress belong under `extraction/`.
- Do not fork generic prompts into MailFlow-specific prompt variants. Add a generic
  rule upstream when it should benefit all sources; add source-specific evidence under
  `extraction/`.
- Refresh only after reviewing the upstream diff. Record the exact upstream commit in
  `UPSTREAM_PIN.json` and the refresh in `extraction/project-control/WORKLOG.md`.
- Do not overwrite source-specific records during a framework refresh.
- A framework refresh is not source-copy authorization and does not change any
  extraction gate or source pin.
