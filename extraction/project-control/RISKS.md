# Risks

- License risk: AGPL-3.0 and a commercial license are both declared; reuse requires a deliberate license decision.
- Closure risk: capabilities may depend on migrations, callers, UI, tests, configs, plugins or platform packages outside obvious directories.
- Staleness risk: main can advance during discovery; reconfirm the pin at every phase.
- Integrity risk: summaries are not byte-level proof; use Git object SHAs and verifier output.
- Update risk: overwriting snapshots destroys auditability; version snapshots and append worklogs.
- Security risk: mail parsing, auth, SSRF/image proxy, cookies/CSRF, OAuth, IMAP/SMTP and notifications need explicit boundary review.
- Automation risk: polling can be delayed; manual dispatch is available. Do not promise instant alerts without source-side dispatch.

## 2026-10-17 additions
- RISK: AGPL-3.0/commercial-license/CLA and third-party terms may restrict reuse, distribution or hosted use. Retain all upstream notices; no blanket reuse clearance is implied.
- RISK: Automated source updates can introduce regressions or malicious upstream changes. The workflow opens/updates a reviewable PR and does not auto-merge.
- RISK: Exact Git blob capture does not prove runtime completeness; submodules, Git LFS, generated assets, external packages, dynamic imports and deployment contracts need separate evidence.
- RISK: Never rewrite a prior commit-addressed snapshot; new upstream commits must create new snapshot paths.
