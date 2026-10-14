# Next Action — MailFlow Extraction

1. Recover the latest state from this directory, `../memory/AGENT_MEMORY.md`, and the newest session in `../sessions/`.
2. Reconfirm canonical upstream `https://github.com/maathimself/mailflow` main commit/tree against `../source-pins/current.json`; stop and record changes if either differs.
3. In a real checkout, run `node extraction/tools/verify-inventory.mjs` and `npm --prefix source-extraction-agent run check`; record actual output and exit codes in `VERIFICATION_STATE.md`.
4. Continue architecture/capability tracing across backend entry/config, auth/OAuth/OIDC, IMAP synchronization/move semantics, message parsing/sanitization, image proxy/safe fetch, migrations, plugin boundaries, frontend, Electron/Android security, CI and tests.
5. Expand capability closure through imports/callers, schemas/migrations, configuration, permissions, runtime dependencies and tests.
6. Classify every source path for disposition, license and provenance; independently reconcile candidates and architecture maps.
7. Only after evidence-backed gate PASS and explicit owner authorization, plan any immutable source copy. Copy authorization remains false.

## Current blockers
- 1,319 source blobs remain UNCLASSIFIED / license UNREVIEWED / closure UNMAPPED.
- The updated Node verifier and framework checker have not been run in a real checkout.
- License/provenance review, dependency closure and independent reconciliation remain incomplete.
- No extraction PASS is claimed.

Continue safe, independent discovery; do not fabricate verification, bypass license/closure gates or alter pinned upstream source.
