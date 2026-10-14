# MailFlow Workspace Boundary

The generic framework in this directory is versioned from the canonical `source-extraction-agent/` in `Rilan-Dev/ai-reusable-libraries`. This repository copy exists so MailFlow extraction can run self-contained.

- **Generic framework:** prompts, skills, schemas, templates, verifier tools, generic workflows, and generic project-control templates.
- **MailFlow-specific records:** `extraction/` including source pins, manifests, capability/architecture maps, license/provenance findings, project state, sessions, memory, verification evidence, and worklogs.
- **Upstream application source:** remains the upstream MailFlow repository and is not copied into this workspace during discovery.

Never store MailFlow-only evidence in the generic framework folder. Never replace MailFlow-specific project-control with generic starter templates. Framework upgrades must be reviewed and recorded in `extraction/FRAMEWORK_PIN.md`.
