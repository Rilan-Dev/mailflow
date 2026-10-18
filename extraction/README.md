# MailFlow Extraction Workspace

This directory is the canonical home for MailFlow-specific extraction work. Keep source pins, commit-addressed snapshots, inventories, architecture/capability maps, licensing/provenance reviews, memory, sessions, progress and verification evidence here.

## Layout
- source-extraction-agent/ at repository root: versioned, self-contained reusable framework copy (prompts, terminology, rules, skills, schemas, templates, tools, tests and workflows).
- extraction/source-pins/: exact upstream repository/ref/commit/tree and snapshot authorization/state.
- extraction/snapshots/<commit>/source/: immutable byte-exact Git blob snapshot for one upstream commit; never overwrite an existing snapshot.
- extraction/snapshots/<commit>/snapshot-manifest.json: snapshot identity, blob verification counts and license review status.
- extraction/manifests/: tree inventories, path dispositions, capability candidates and architecture maps.
- extraction/project-control/: continuity, current phase, next action, decisions, issues, risks, verification and worklog.
- extraction/memory/ and extraction/sessions/: durable memory and append-only session checkpoints.
- extraction/tools/: inventory verifier and exact upstream snapshot capture tooling.

## Ownership and synchronization
The canonical reusable framework remains in Rilan-Dev/ai-reusable-libraries/source-extraction-agent/. This repository carries a versioned local copy so sessions can work without a cross-repository dependency. MailFlow-specific findings and history remain under extraction/.

The GitHub Actions workflow .github/workflows/mailflow-source-snapshot.yml watches upstream main on a schedule and by manual dispatch. When the upstream commit changes, it creates or updates a reviewable PR containing a new immutable snapshot and regenerated pin/manifests. It does not overwrite prior snapshots, auto-merge upstream source, or integrate source into a host project.

## Extraction state and safety
- Canonical upstream: https://github.com/maathimself/mailflow
- Latest upstream identity observed on 2026-10-17: commit 35067fc2876d50980f1a8a3b8ea72b5467b69f60; root tree a2a82b50b8a1ac24a273e55dc0f9418aefdfed17. The workflow resolves live main at runtime; this observation is not a guarantee that upstream has not advanced.
- Historical discovery baseline: e7a53760a7e4b15e0ee631533655d99dde657599 / 27059315bc16155f0064dc136aae94cd5097cb02; 1,462 entries, including 1,319 blobs.
- The user has authorized beginning full source snapshot capture. The first automated capture run and resulting PR still need actual evidence.
- Upstream declares AGPL-3.0 and a separate commercial-license path, and has a CLA. Preserve upstream notices and review third-party assets, provenance and redistribution rights.
- Snapshot integrity is separate from capability closure, licensing clearance, dependency closure, host-integration readiness and extraction PASS. Do not use extracted code in another application until those gates have evidence-backed PASS.
