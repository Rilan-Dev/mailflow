# Next Action — MailFlow Extraction

## Completed checkpoint
The full upstream Git tree at commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60 is stored at extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source. The source pin and commit-specific manifests are updated. GitHub Actions verified 1,350 source blobs, exact snapshot file-set/mode/symlink identity, and reconstructed the root tree SHA a2a82b50b8a1ac24a273e55dc0f9418aefdfed17 plus all 147 nested tree SHAs. Workflow: https://github.com/Rilan-Dev/mailflow/actions/runs/39030338698

## Immediate next work
1. Continue the first security closure slice against the immutable snapshot: backend/src/routes/auth.js, backend/src/routes/oauth.js, backend/src/routes/oidc.js, backend/src/middleware/auth.js, backend/src/services/authLimiter.js, backend/src/services/hostValidation.js, backend/src/services/safeFetch.js, backend/src/services/imageProxy.js and backend/src/services/emailSanitizer.js.
2. Trace all callers/importers, environment variables, route mounting, session/Redis behavior, database tables/migrations, redirects/state/nonces, permission checks, SSRF/DNS rebinding controls, sanitizer behavior, error paths, tests and user-visible states. Record source blob SHAs and direct evidence.
3. Audit the 116 changed blobs and 31 new blobs first. The old October 14 candidate map is historical; use architecture-map-2026-10-17-35067fc.json and capability-closure-2026-10-17-35067fc.json.
4. Update the closure tracker with actual edges and test coverage; do not mark a capability closed merely because referenced paths exist.
5. Start per-path provenance/license classification, including LICENSE, LICENSE-COMMERCIAL, CLA, dependency lockfiles, fonts/icons/images, generated/native assets and any LFS/submodule evidence.
6. After the security slice, close IMAP/account lifecycle, database/migrations, parser/rendering, plugins, frontend, CardDAV, rules/spam, AI, realtime, Electron, Android and release/deployment capabilities.
7. Re-run node extraction/tools/verify-inventory.mjs after manifest updates. Keep upstream snapshot updates scheduled and direct to main, but never use source in a host app until dependency closure and license gates pass.

## Guardrails
- Keep prior snapshots immutable; new upstream commits receive new snapshot directories.
- Changed/new paths reset to UNCLASSIFIED unless their SHA and mode are identical to an already assessed path.
- Source snapshot integrity is PASS; capability closure, per-path license clearance, redistribution clearance, host-integration readiness and extraction PASS remain open.
