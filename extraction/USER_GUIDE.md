# MailFlow Extraction Workspace — User Guide

This repository owns the MailFlow-specific extraction plan, evidence, memory, sessions, source pin, manifests, licensing/provenance review, project-control state and verification records. The reusable framework is available locally at `source-extraction-agent/`.

## Start a new AI session

Copy/paste:

```text
Work in Rilan-Dev/mailflow. First read extraction/README.md and source-extraction-agent/AGENTS.md, EXTRACTION_RULES.md, EXTRACTION_AGENT_SPEC.md, MEMORY_AND_CONTINUITY.md, and source-extraction-agent/project-control/NEXT_ACTION.md.

Then recover extraction/project-control/CHAT_CONTINUITY.md, CURRENT_PHASE.md, NEXT_ACTION.md, VERIFICATION_STATE.md, WORKLOG.md, DECISIONS.md, ISSUES.md and RISKS.md. Read extraction/memory/AGENT_MEMORY.md and the latest relevant record in extraction/sessions/.

Reconcile all claims with live Git refs and actual evidence. Continue the next safe authorized MailFlow discovery/closure action. Do not copy source, advance the source pin, or claim PASS until license/provenance review, complete dependency closure, independent reconciliation, explicit authorization and actual machine verification pass. Append durable findings to extraction/memory/AGENT_MEMORY.md, record session details under extraction/sessions/, and update project-control state/worklog.
```

## What belongs where

- Generic extraction prompts, rules, skills, schemas, templates, workflows and tools: `source-extraction-agent/` at repository root.
- MailFlow pin, manifests, capability maps, license/provenance notes, source-specific evidence, memory, sessions, blockers and worklog: `extraction/`.
- Global cross-project framework source and catalog: `Rilan-Dev/ai-reusable-libraries`.
- Immutable MailFlow source: only a later explicitly authorized, versioned snapshot; none has been copied by this workspace migration.

## Continue work

Use `source-extraction-agent/prompts/11-upstream-update-review.md` for a detected upstream change. For capability discovery, dependency closure, exact copy, second-pass audit and integrity verification, use the corresponding canonical prompts listed in `source-extraction-agent/README.md`.

## Current blockers

All 1,319 MailFlow source paths are still unclassified. The AGPL-3.0/commercial-license/CLA and third-party asset terms need review. The initial source pin is a proposed discovery baseline, not copy authorization. The local inventory verifier has not been executed in a real checkout.
