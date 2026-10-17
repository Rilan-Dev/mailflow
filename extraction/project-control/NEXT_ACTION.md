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

---

## Historical checkpoint preserved (pre-snapshot-verification state)

The following is retained for continuity. The current authoritative state is described above; historical action items below may be completed or superseded.

# Next Action — MailFlow Source Extraction

## Immediate work
1. Check the run of .github/workflows/mailflow-source-snapshot.yml triggered by its addition on main. If no run started, manually dispatch it from GitHub Actions.
2. Review the generated PR from branch automation/mailflow-upstream-snapshot. Confirm the pin points to the live maathimself/mailflow main commit and root tree, the snapshot is under extraction/snapshots/<commit>/source, and every blob SHA was checked.
3. Run node extraction/tools/verify-inventory.mjs in a real checkout after the snapshot PR is available; fix every actual failure and record the exact output. Do not infer success from workflow YAML or a PR existing.
4. Merge the source snapshot PR only after the exact-copy verification and license notices are retained. Keep the snapshot commit immutable.
5. Continue the 1,300+ path review: classify all paths, review third-party provenance, AGPL/commercial license terms, CLA, LFS/submodules, and map transitive first-party dependency closure.
6. Trace full capabilities through source, callers, schemas/migrations, runtime/config, permissions, retries, recovery, tests, UI states, Electron and Android.
7. Keep each upstream update as a new commit-addressed snapshot. The watcher may create/update a reviewable PR; never overwrite a prior snapshot or silently merge new upstream code into a host application.

## Guardrails
- Current upstream observed during the 2026-10-17 review: https://github.com/maathimself/mailflow, main commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60, root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. The workflow must resolve live main at execution time; do not assume this pin remains current.
- PR #1 (self-contained workspace) is merged. PRs #2 and #3 were closed as superseded after PR #1; their useful memory/source-identity changes are being retained on main.
- Source snapshot capture is authorized by the user, but license clearance, capability closure, host-integration readiness and extraction PASS are not established.
- The reusable framework remains in source-extraction-agent/; MailFlow-specific evidence stays under extraction/.
