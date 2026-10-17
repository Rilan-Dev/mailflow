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


## 2026-10-17 additions — active security and closure findings

- HIGH-PRIORITY SECURITY CLOSURE: `backend/src/routes/oidc.js:getDiscovery` validates issuer and advertised endpoint hostnames when `allow_insecure=false`, but then uses native `fetch` for discovery/token calls rather than the pinned `safeFetch` connector. Revalidation and socket connection are separate, and native redirect handling does not reuse the guarded per-hop connector. Audit DNS rebinding, redirects to private/reserved targets, endpoint/JWKS fetch behavior and execution-time host policy. The explicit `allow_insecure=true` path bypasses host validation/HTTPS-only enforcement and disables TLS certificate verification; verify admin-only authorization and document this as a high-risk opt-in. Do not edit immutable upstream source; resolve through extraction evidence and future host boundary design.
- HTML sink closure: `MessageBodyView` uses a sandboxed iframe/CSP; `MessagePane` has a `dangerouslySetInnerHTML` path for `prepared.html` and a `linkifyText(body.text)` sink; `ComposeModal` uses DOMPurify/app-origin sanitization; `SignatureEditor` writes `innerHTML` from its value/source path. Trace preparation, escaping and all save/read paths before closure.
- Broader IMAP/SMTP test workflow queued: https://github.com/Rilan-Dev/mailflow/actions/runs/39034389282. Result must be recorded only after the run completes.
- Frontend render-security tests added to `.github/workflows/mailflow-security-closure.yml`; execution is pending. No new frontend test result claimed.
- Classification advanced to 124 role-classified paths and 1,226 unclassified blobs; all recently classified source remains license/provenance unreviewed. Capability closure and reuse clearance remain open.
