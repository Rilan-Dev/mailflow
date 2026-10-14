# MailFlow Source Extraction Workspace

This directory is the canonical home for MailFlow-specific extraction records, evidence, and progress. The reusable framework lives in `source-extraction-agent/` and is vendored from the canonical framework in [Rilan-Dev/ai-reusable-libraries](https://github.com/Rilan-Dev/ai-reusable-libraries/tree/main/source-extraction-agent).

## Contents

- `project-control/`: MailFlow extraction state, continuity, current phase, next action, decisions, issues, risks, verification, and worklog.
- `source-pins/current.json`: proposed discovery pin; it is not authorization to copy or promote source.
- `manifests/`: upstream tree inventory, path dispositions, architecture map, and capability candidates.
- `tools/verify-inventory.mjs`: inventory consistency verifier.
- `SOURCE_UPDATE_PLAYBOOK.md` and `USER_GUIDE.md`: MailFlow-specific workflow notes.
- `../source-extraction-agent/`: self-contained prompts, skills, schemas, templates, verification tools, and generic workflows.

## Safety status

The current pin is a proposed discovery baseline only. No upstream application source is copied here. All 1,319 source blobs remain unclassified; licensing/provenance, capability/dependency closure, independent reconciliation, and explicit copy authorization remain blockers. Do not promote the pin or claim extraction PASS until required evidence and gates are satisfied.

## Session startup

1. Read `project-control/CHAT_CONTINUITY.md`.
2. Read `project-control/PROJECT_STATE.md`, `CURRENT_PHASE.md`, `NEXT_ACTION.md`, and `VERIFICATION_STATE.md`.
3. Review `ISSUES.md`, `RISKS.md`, `DECISIONS.md`, and `WORKLOG.md`.
4. Use prompts and skills under `../source-extraction-agent/`; keep MailFlow-specific facts and evidence in `extraction/`.
5. Append updates to MailFlow worklog and handoff records; never silently replace prior evidence.
