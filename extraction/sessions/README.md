# MailFlow Extraction Sessions

Store dated, append-only session records here. Each record should capture:
- starting commit/ref and the control files read;
- actions and files changed;
- evidence gathered, commands run, and exact results;
- decisions, unresolved questions, and blockers;
- the next concrete action and handoff owner.

Update `extraction/project-control/CHAT_CONTINUITY.md`, `NEXT_ACTION.md`,
`VERIFICATION_STATE.md`, and `WORKLOG.md` when session work changes durable state.
Do not treat a session note as proof of verification unless it records reproducible evidence.
