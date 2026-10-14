# MailFlow Extraction — Local User Guide

The complete extraction framework is versioned in this repository at [`../source-extraction-agent/`](../source-extraction-agent/README.md). Use its terminology, role rules, prompts, skills, schemas, templates and workflows. Do not create a MailFlow-specific duplicate of generic rules.

## Resume a session

Start with this workspace's `project-control/CHAT_CONTINUITY.md`, `NEXT_ACTION.md`, `VERIFICATION_STATE.md` and latest `WORKLOG.md`; then read `memory/AGENT_MEMORY.md` and the latest session note in `sessions/`. Check the current branch and source pin before relying on previous claims.

## Current work stages

1. Confirm canonical upstream identity, commit and root tree.
2. Map architecture, capabilities, user-visible behavior, data flows and business logic.
3. Classify every upstream path and trace static/dynamic/runtime/test/configuration dependencies.
4. Review license, provenance, third-party assets and redistribution constraints.
5. Perform independent reconciliation and preserve raw evidence.
6. Copy only explicitly authorized capabilities after all required gates pass.
7. Run actual Git-object and package verification; append results to the worklog and handoff.

## Roles and evidence

Investigator discovers and documents. Implementer executes only authorized work. Independent verifier checks identity and closure. Controller alone declares PASS after reviewing evidence. Every handoff must state completed work, pending work, blockers, awaited evidence, changed files and one next action.

Never claim a command ran unless it did. An inventory check is not an extraction PASS. Do not store credentials or secrets in memory/session files.
