# Upstream Update Report — 2026-10-17

## Source pins
- Previous discovery pin: e7a53760a7e4b15e0ee631533655d99dde657599 (tree 27059315bc16155f0064dc136aae94cd5097cb02)
- Captured upstream pin: 35067fc2876d50980f1a8a3b8ea72b5467b69f60 (tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17)
- Upstream: https://github.com/maathimself/mailflow

## Tree delta
- Entries: 1462 → 1497
- Blobs: 1319 → 1350
- Added blobs: 31
- Changed blobs: 116
- Unchanged blobs: 1203
- Removed blobs: 0

## Exact snapshot
- Snapshot: `extraction/snapshots/35067fc2876d50980f1a8a3b8ea72b5467b69f60/source`
- Captured and SHA-checked blobs: 1,350
- Blob hash failures: 0
- Gitlinks/submodules in captured tree: 0
- GitHub Actions verifier: PASS — inventory consistency and exact copied source blob/file-set checks passed.

## Still open
- 1350 source paths remain UNCLASSIFIED.
- 1350 paths remain license/provenance UNREVIEWED.
- 1350 paths remain closure UNMAPPED.
- All 16 architecture capability areas remain candidates; no capability closure PASS is claimed.
- AGPL-3.0, the separate commercial-license path, CLA, third-party asset provenance and redistribution conditions need review before reuse.

## Next
1. Trace each capability end-to-end through callers, data/schema/migrations, runtime/config, auth/permissions, retries/recovery, tests and UI states.
2. Review the 116 changed and 31 added blobs first, then trace unchanged dependency closure.
3. Record per-path license/provenance and third-party assets; preserve upstream notices.
4. Re-run the verifier after each manifest update. Do not integrate the snapshot into a host application until closure and license gates pass.
