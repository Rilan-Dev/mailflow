# Issues

- Open: detailed capability inventory and dependency closure not yet produced.
- Open: path-level license/provenance classification required, including fonts, icons, assets, third-party code and generated outputs.
- Open: immutable snapshot copy and verifier have not been implemented.
- Open: scheduled source watcher needs end-to-end validation.
- Open: decide between full-tree snapshots and selected capability snapshots; default proposal is versioned immutable snapshots plus a separate capability index.

## 2026-10-17 additions
- ISSUE: Execute and inspect the new snapshot workflow; it has not yet been proven to run successfully on GitHub Actions.
- ISSUE: Confirm live upstream inventory count/tree at capture time and inspect any gitlinks or Git LFS pointers.
- ISSUE: 1,319 paths in the initial discovery inventory were unclassified; changed/new paths must be reclassified against the current snapshot.
- ISSUE: Complete dependency/capability closure and per-path third-party/license provenance before using extracted code in a host application.
