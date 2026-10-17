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
