# MailFlow Extraction Workspace

This directory is the authoritative home for MailFlow-specific extraction records in this repository. The complete reusable extraction framework is versioned locally at [`../source-extraction-agent/`](../source-extraction-agent/README.md), so prompts, terminology, rules, templates, schemas, skills, verification procedures and workflows are available without another repository checkout.

## Source identity and current status

- Canonical upstream: https://github.com/maathimself/mailflow
- Upstream ref: `main`
- Proposed discovery commit: `e7a53760a7e4b15e0ee631533655d99dde657599`
- Root tree SHA: `27059315bc16155f0064dc136aae94cd5097cb02`
- Inventory: 1,462 entries, including 1,319 file blobs and 143 directory entries; recursive response complete.
- State: discovery, capability tracing, dependency closure and license review pending.
- No upstream application source has been copied. The recorded pin is a proposed discovery baseline, not an approved immutable snapshot.
- All 1,319 source paths remain unclassified for disposition and license/provenance.

## Resume order

1. Read `project-control/CHAT_CONTINUITY.md`, `CURRENT_PHASE.md`, `NEXT_ACTION.md`, `VERIFICATION_STATE.md`, `ISSUES.md`, `RISKS.md`, `DECISIONS.md`, and `WORKLOG.md`.
2. Read `memory/AGENT_MEMORY.md` and the newest entry under `sessions/`.
3. Inspect `source-pins/current.json` and `manifests/source-tree-2026-10-14.json`.
4. Use the locally versioned framework in `../source-extraction-agent/`; do not depend on files in `ai-reusable-libraries` to resume this work.
5. Continue behavior/capability tracing, dependency closure, path-level license/provenance classification and independent reconciliation.
6. Do not copy or promote upstream application source until required gates have evidence-backed PASS and the owner explicitly authorizes the copy.

## Workspace map

- `source-pins/`: proposed upstream identity and authorization state.
- `manifests/`: tree inventory, capability candidates, architecture map and path dispositions.
- `project-control/`: MailFlow-specific state, next action, decisions, issues, risks, verification and chronological worklog.
- `memory/`: durable agent memory and decisions-to-remember for future sessions.
- `sessions/`: append-only session checkpoints and handoffs.
- `tools/verify-inventory.mjs`: local consistency verifier for discovery manifests.
- `SOURCE_UPDATE_PLAYBOOK.md`: MailFlow-specific update notes; use the local Prompt 11 and update-capture workflow for review.

## Licensing and provenance

The upstream project documents AGPL-3.0, a separate commercial licensing path, and a CLA. Review the actual upstream notices, path-level provenance, third-party assets and redistribution rights before any source copy or publication. Uncertainty is a blocker, not permission.

## Verification boundary

A passing inventory-consistency check only proves the manifests agree with one another. It does not prove dependency closure, licensing clearance, extraction completeness or exact-copy integrity.
