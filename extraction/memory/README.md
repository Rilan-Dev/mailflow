# MailFlow Extraction Memory

This folder contains durable, reviewed facts that future sessions need to preserve. It is not a replacement for the append-only worklog or raw session records.

## Rules

- Store stable project facts, decisions, source identity, important constraints, and validated findings.
- Record the evidence or source path for each non-obvious fact.
- Keep hypotheses explicitly labeled as hypotheses; do not convert them into facts without evidence.
- Never store credentials, tokens, secrets, private email contents, or unrelated personal data.
- Do not silently delete or rewrite earlier conclusions. Add dated corrections and explain the evidence.
- Keep task-by-task chronology in `extraction/sessions/` and append progress to `extraction/project-control/WORKLOG.md`.
- On session start, read `extraction/project-control/CHAT_CONTINUITY.md`, `NEXT_ACTION.md`, `VERIFICATION_STATE.md`, this memory index, and the latest session record.
