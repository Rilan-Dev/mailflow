# MailFlow Workspace Boundary

The generic framework in this directory is versioned from the canonical source-extraction-agent/ in Rilan-Dev/ai-reusable-libraries. This repository copy exists so MailFlow extraction can run self-contained.

- Generic framework: prompts, terminology, rules, skills, schemas, templates, verifier tools, tests, generic workflows and generic project-control templates.
- MailFlow-specific records: extraction/ including source pins, immutable snapshots, manifests, capability/architecture maps, license/provenance findings, project state, sessions, memory, verification evidence and worklogs.
- Upstream application source: maathimself/mailflow. Full commit-addressed snapshots are stored under extraction/snapshots/ with the original upstream notices and Git identity.

Never store MailFlow-only evidence in the generic framework folder. Never replace MailFlow-specific project-control with generic starter templates. Framework upgrades must be reviewed and recorded in extraction/FRAMEWORK_PIN.md.
