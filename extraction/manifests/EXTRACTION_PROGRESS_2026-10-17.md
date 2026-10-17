# Extraction Progress — 2026-10-17

## Current source library
- Upstream: https://github.com/maathimself/mailflow
- Commit: 35067fc2876d50980f1a8a3b8ea72b5467b69f60
- Root tree: a2a82b50b8a1ac24a273e55dc0f9418aefdfed17
- Snapshot: `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source`
- Integrity: PASS — 1,350 blobs, 147 nested trees, 0 gitlinks, 0 Git LFS pointers. Root and all nested tree hashes reconstructed and verified.
- Snapshot evidence: https://github.com/Rilan-Dev/mailflow/actions/runs/39030794029

## Work started after snapshot capture
- **Path dispositions:** 39 of 1,350 paths classified; 1311 remain UNCLASSIFIED. Classification of a path does not mean it is license-cleared or reusable.
- **Capability map:** 16 capability candidates; 3 have partial static security traces; 0 are closed.
- **Security slice:** auth/session, OAuth/OIDC, host validation, safe fetch, image proxy and email sanitization. Selected test execution now PASS: 15 files / 379 tests, 0 failures; see `extraction/manifests/security-test-results-2026-10-17-35067fc.json`. Static caller/threat-model closure remains partial.
- **Dependencies:** 1,124 locked package entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. 0 third-party package licenses have been cleared.
- **Upstream updates:** six-hour scheduled/manual capture workflow resolves live upstream main, creates a new immutable snapshot for each new commit, verifies it, and opens/updates a reviewable PR. Source updates are not auto-merged and require provenance/license review.

## Remaining gates
- Complete transitive first-party dependency and behavior closure across all 16 capabilities.
- Classify all remaining source paths and review path-level provenance, third-party assets and package licenses.
- Run test suites against the pinned source and record exact outputs.
- Reconcile native build/runtime tools, Docker, environment contracts, migrations, Electron and Android.
- Keep AGPL-3.0/commercial-license/CLA obligations intact; no blanket redistribution or host-integration clearance is implied.

**Status:** full source snapshot is captured and verified. The application is not yet fully extracted into independently reusable capabilities; extraction PASS is not claimed.


## Update — 2026-10-17 — Security test slice and upstream review safety

- Selected pinned-snapshot security tests passed: backend 14 files / 375 tests and frontend image proxy 1 file / 4 tests. Total 15 files / 379 tests; zero failures.
- Run evidence: https://github.com/Rilan-Dev/mailflow/actions/runs/39031942550
- Machine-readable evidence: `extraction/manifests/security-test-results-2026-10-17-35067fc.json`.
- Updated `.github/workflows/mailflow-source-snapshot.yml` so scheduled/manual upstream captures create or update `automation/mailflow-upstream-snapshot` as a reviewable pull request after verification, instead of pushing newly captured upstream code directly to main. This preserves immutable snapshots while preventing unreviewed upstream changes from being silently merged.
- Remaining status is unchanged for overall extraction: 1,311 blobs unclassified, third-party license/provenance review open, capability/dependency closure open, redistribution and host integration not cleared.
