# Next Action

1. Read `extraction/README.md`, root `source-extraction-agent/AGENTS.md`, `EXTRACTION_RULES.md`, `EXTRACTION_AGENT_SPEC.md`, and the MailFlow files in `extraction/project-control/`.
2. Reconfirm live upstream `main` commit/tree against `extraction/source-pins/current.json`; stop discovery claims if either differs.
3. Audit architecture and build/test surfaces from README, CLA, licenses, CI, package manifests, Docker/config, migrations, backend/frontend and platform packages.
4. Expand all-path dispositions and capability/dependency manifests. Trace end-to-end flows and high-risk security/privacy/auth/data paths.
5. Run closure scan and independent reconciliation; resolve unknown paths and missing dependency edges.
6. Only after gate PASS, plan versioned immutable copy and exact blob/tree verification.
7. Reconcile central update-watcher behavior: the shared watcher must explicitly support reading the source pin from this external repository before MailFlow monitoring is enabled.
8. Append evidence and precise next action; never delete completed history.

## Update — 2026-10-14

The complete tree inventory and preliminary candidate index are present under `extraction/manifests/`. All 1,319 file paths are registered but remain UNCLASSIFIED. The watcher workflow is authored in `ai-reusable-libraries` but has not been verified on a default-branch run and currently must not be treated as watching this repository's pin.

Immediate next action: inspect high-risk and central architecture paths (backend entry/config, package manifests, IMAP manager, message service/parser, auth/OIDC/OAuth, image proxy/sanitizer, migrations, plugin boundary, frontend app, Electron/Android security and CI); map callers and tests; update the per-path disposition register with evidence. Do not copy source until closure and license gates pass.

## Architecture map update

The initial map includes 16 candidate capability areas with pinned blob identities and test candidates. Expand each candidate through actual imports/callers, schema/migrations, configuration, permissions, runtime and tests, then use evidence to classify paths. High-risk priority: auth/OAuth, safeFetch/image proxy/email sanitizer, IMAP move/sync, plugin isolation, migrations, native Electron/Android security and update watcher permissions.

## Verification update

Stored-manifest consistency was checked against the pinned tree and passed with zero mismatches. The Node verifier at `extraction/tools/verify-inventory.mjs` has not been executed in a local checkout. Run it when a checkout is available, then continue actual content/call-chain discovery and path classification. Do not confuse manifest consistency with extraction closure.

## Workspace migration update

MailFlow-specific project-control, manifests, source pin and verifier now live under `extraction/`; generic prompts, skills, schemas, rules and workflows live under the versioned root `source-extraction-agent/` copy. Review https://github.com/Rilan-Dev/mailflow/pull/1 for the migration. Keep source-copy authorization false.
