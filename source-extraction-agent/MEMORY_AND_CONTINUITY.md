# Memory and Continuity Protocol

Authority order: Git objects and raw verifier evidence; target repository's existing project-control/plans/sessions/manifests/worklogs; current checkpoint documents; chat/model memory (index only).

At session start inspect branch, HEAD, working state, source pin, latest worklog, next action, prior handoff and raw verification. For MailFlow, the authoritative workspace is `../extraction/`, durable memory is `../extraction/memory/AGENT_MEMORY.md`, and session records are under `../extraction/sessions/`.

At session end append a dated worklog entry, update next action and verification state, preserve historical plans, record exact commands/exit codes/artifact paths/commit SHAs/limitations, and write concise resume instructions. Never store secrets. If PASS evidence is stale, absent or for another source pin, mark current status unverified and explain why; preserve the historical record.
