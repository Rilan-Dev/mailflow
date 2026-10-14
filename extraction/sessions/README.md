# MailFlow Extraction Sessions

Store dated session handoffs and work records here. Each session record should include:

1. Start commit/ref and relevant source pin.
2. Documents and paths reviewed.
3. Changes made and their exact commits.
4. Evidence produced, with verification method and result.
5. Unresolved issues, risks, and decisions required.
6. Next action and the exact resume point.

Session records are append-only historical evidence. Update current status in `extraction/project-control/` and keep durable facts in `extraction/memory/`. Do not record credentials, secrets, or private email content.

Start each new session from `extraction/project-control/CHAT_CONTINUITY.md` and `extraction/project-control/NEXT_ACTION.md`.
