#!/usr/bin/env node
/** Structural checker for this agent package; it does not verify an upstream extraction. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "README.md", "AGENTS.md", "EXTRACTION_RULES.md", "EXTRACTION_AGENT_SPEC.md", "COPY_TO_ANY_PROJECT.md",
  "prompts/00-session-recovery.md", "prompts/01-repository-onboarding.md",
  "prompts/02-full-architecture-audit.md", "prompts/03-capability-hunting.md",
  "prompts/04-business-logic-discovery.md", "prompts/05-ui-and-interaction-discovery.md",
  "prompts/06-dependency-closure.md", "prompts/07-exact-source-extraction.md",
  "prompts/08-second-pass-audit.md", "prompts/09-integrity-verification.md", "prompts/10-session-handoff.md",
  "skills/extraction-orchestrator/SKILL.md", "skills/repository-intelligence/SKILL.md",
  "skills/capability-discovery/SKILL.md", "skills/business-logic-tracing/SKILL.md",
  "skills/ui-capability-mapping/SKILL.md", "skills/dependency-closure/SKILL.md",
  "skills/exact-source-copy/SKILL.md", "skills/database-and-runtime-audit/SKILL.md",
  "skills/host-boundary-classification/SKILL.md", "skills/extraction-verification/SKILL.md",
  "skills/gap-reconciliation/SKILL.md", "skills/session-continuity/SKILL.md",
  "tools/verify-extraction.mjs", "tools/check-agent-package.mjs",
  "../extraction/project-control/PROJECT_STATE.md", "../extraction/project-control/CURRENT_PHASE.md",
  "../extraction/project-control/NEXT_ACTION.md", "../extraction/project-control/CHAT_CONTINUITY.md",
  "../extraction/project-control/VERIFICATION_STATE.md", "../extraction/project-control/DECISIONS.md",
  "../extraction/project-control/ISSUES.md", "../extraction/project-control/RISKS.md",
  "../extraction/project-control/WORKLOG.md", "../extraction/memory/AGENT_MEMORY.md"
];
const errors = [];
for (const rel of required) if (!fs.existsSync(path.resolve(root, rel))) errors.push(`Missing required file: ${rel}`);

const schemaDir = path.join(root, "schemas");
if (fs.existsSync(schemaDir)) {
  for (const name of fs.readdirSync(schemaDir).filter(name => name.endsWith(".json"))) {
    try { JSON.parse(fs.readFileSync(path.join(schemaDir, name), "utf8")); }
    catch (error) { errors.push(`Invalid JSON schema file ${name}: ${error.message}`); }
  }
}
const markdownFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.isFile() && entry.name.endsWith(".md")) markdownFiles.push(full);
  }
}
collect(root);
for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(linkPattern)) {
    const href = match[1].trim().split("#")[0];
    if (!href || /^[a-z]+:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("#")) continue;
    const target = path.resolve(path.dirname(file), decodeURIComponent(href));
    if (!target.startsWith(root + path.sep) && target !== root) continue;
    if (!fs.existsSync(target)) errors.push(`Broken local Markdown link in ${path.relative(root, file)}: ${href}`);
  }
}
if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  console.error(`Agent package check failed: ${errors.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${required.length} required paths present; JSON schemas parse; local Markdown links resolve (${markdownFiles.length} Markdown files scanned).`);
}
