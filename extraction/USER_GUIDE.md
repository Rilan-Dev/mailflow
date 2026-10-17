# MailFlow Extraction Workspace — User Guide

This repository owns MailFlow-specific extraction plans, evidence, memory, sessions, source pins, immutable source snapshots, manifests, licensing/provenance review, project-control state and verification. The reusable framework is available locally at source-extraction-agent/.

## Start a new AI session

Copy/paste:

```text
Work in Rilan-Dev/mailflow. First read extraction/README.md and source-extraction-agent/AGENTS.md, EXTRACTION_RULES.md, EXTRACTION_AGENT_SPEC.md, MEMORY_AND_CONTINUITY.md, and source-extraction-agent/project-control/NEXT_ACTION.md.

Then recover extraction/project-control/CHAT_CONTINUITY.md, CURRENT_PHASE.md, NEXT_ACTION.md, VERIFICATION_STATE.md, WORKLOG.md, DECISIONS.md, ISSUES.md and RISKS.md. Read extraction/memory/AGENT_MEMORY.md and the newest relevant record in extraction/sessions/.

Reconcile the current source pin with live https://github.com/maathimself/mailflow main. The user has authorized a complete commit-addressed source snapshot and ongoing update capture. Inspect the snapshot workflow and exact blob verification output; never overwrite a prior snapshot. Continue full capability/dependency closure and per-path licensing/provenance review. Do not claim extraction PASS or integrate source into another application until all applicable gates pass. Append durable findings to extraction/memory/AGENT_MEMORY.md, record session details under extraction/sessions/, and update project-control state/worklog.
```

## What belongs where
- Generic extraction prompts, terminology, rules, skills, schemas, templates, workflows and tools: source-extraction-agent/ at repository root.
- MailFlow source pin, full snapshots, manifests, capability maps, license/provenance notes, memory, sessions, blockers and worklog: extraction/.
- Global reusable framework source and cross-project catalog: Rilan-Dev/ai-reusable-libraries.
- Exact source snapshots are stored separately by upstream commit. Do not edit files inside a snapshot or use them in a host application before dependency and license gates pass.

## Current automation
- Workflow: .github/workflows/mailflow-source-snapshot.yml
- Capture tool: extraction/tools/capture-upstream-snapshot.mjs
- Verifier: extraction/tools/verify-inventory.mjs
- Workflow is designed to open/update a reviewable PR on upstream changes; it does not silently merge new code.
- Actual workflow run, generated snapshot PR, and verifier output must be recorded as evidence. A workflow definition is not proof it ran.

## Current blockers
Per-path license/provenance, third-party asset terms, transitive dependency closure, LFS/submodule status, independent reconciliation and actual snapshot verification must be completed. AGPL-3.0 and the separate commercial-license/CLA notices mean no blanket reuse or redistribution clearance is implied.
