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
- **Security slice:** auth/session, OAuth/OIDC, host validation, safe fetch, image proxy and email sanitization; test references identified but not executed in this static trace.
- **Dependencies:** 1,124 locked package entries (445 backend, 679 frontend), 50 direct dependencies and 16 direct dev dependencies. 0 third-party package licenses have been cleared.
- **Upstream updates:** six-hour scheduled/manual capture workflow resolves live upstream main, creates a new immutable snapshot for each new commit, verifies it, and commits the raw snapshot to this repository's main branch.

## Remaining gates
- Complete transitive first-party dependency and behavior closure across all 16 capabilities.
- Classify all remaining source paths and review path-level provenance, third-party assets and package licenses.
- Run test suites against the pinned source and record exact outputs.
- Reconcile native build/runtime tools, Docker, environment contracts, migrations, Electron and Android.
- Keep AGPL-3.0/commercial-license/CLA obligations intact; no blanket redistribution or host-integration clearance is implied.

**Status:** full source snapshot is captured and verified. The application is not yet fully extracted into independently reusable capabilities; extraction PASS is not claimed.
