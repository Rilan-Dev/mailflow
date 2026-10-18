# Dependency Closure Inventory — 2026-10-17

Source pin: 35067fc2876d50980f1a8a3b8ea72b5467b69f60

## Lockfile coverage
- Backend: 23 direct dependencies, 4 direct dev dependencies, 445 locked package entries.
- Frontend: 27 direct dependencies, 12 direct dev dependencies, 679 locked package entries.
- Total locked package entries: 1124.
- Backend runtime constraint: Node >=22 <23.
- Manifest and lockfile Git blob SHAs are pinned in dependency-inventory-2026-10-17-35067fc.json.

## Current state
This inventory records resolved package versions, lockfile integrity/resolution metadata, direct/transitive status, dev/optional/peer flags and any license field present in the lockfile. It does not vendor external package source.

- License review: 0 packages cleared.
- Provenance review: 0 packages cleared.
- Dependency closure: inventory started, runtime/import closure and license compatibility remain open.

## Next
1. Map imports and dynamic imports to locked packages, including native platform/build tools and optional dependencies.
2. Review each package's actual published license and source provenance; do not infer a license from package name or absence of lockfile metadata.
3. Reconcile npm dependency graphs against backend/frontend code, Electron and Android builds, Dockerfiles and CI workflows.
4. Capture SBOM/provenance and test outputs from the exact pinned snapshot before reuse.
