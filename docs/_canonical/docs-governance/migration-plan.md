---
title: Bricks Documentation Migration Plan
doc_id: docs-governance-migration-plan
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-04
review_cycle: weekly
replacement_path:
derived_from:
source_links:
tags:
  - migration
  - documentation
---

# Bricks Documentation Migration Plan

This file maps the current documentation layout to the target structure.

## Migration Strategy

1. Create governance, manifest, templates, and target app folders in `Bricks-Docs`.
2. Migrate one app at a time, starting with Bricks Scan.
3. Convert duplicated app-repo docs into either:
   - canonical docs moved into `Bricks-Docs`
   - short local reference docs
   - archived files
4. Update `CLAUDE.md` and agent files only after canonical docs are stable.
5. Add validation after the migration shape is approved.

## Current Problem Areas

### Duplicate system docs

- `CODEBASE_PRINCIPLES.md`
- `architecture/codebase-principles.md`
- `bricks-design-system/DESIGN-SYSTEM.md`
- `architecture/design-system.md`
- `bricks-design-system/tokens.json`
- `architecture/tokens.json`

### Duplicate per-app engineering docs

- `Bricks-Calc/docs/*`
- `Bricks-Calc/Documentation/*`

### Parallel AI source files

- `bricks-scan-support-agent/KNOWLEDGE_BASE.md`
- `bricks-scan/support-agent-kb.md`
- `bricks-scan-support-agent/SYSTEM_PROMPT.md`
- `bricks-scan/support-agent-prompt.md`

## Target Shared Moves

| Current path | Target path | Action |
|---|---|---|
| `brand/brand-foundation.md` | `shared/brand/brand-foundation.md` | Move |
| `brand/brand-system.md` | `shared/brand/brand-system.md` | Move |
| `architecture/codebase-principles.md` | `shared/engineering/codebase-principles.md` | Move |
| `architecture/design-system.md` | `shared/brand/design-system.md` | Move |
| `architecture/design-system-gap-report.md` | `shared/brand/design-system-gap-report.md` | Move |
| `architecture/tokens.json` | `shared/brand/tokens.json` | Move |
| `CODEBASE_PRINCIPLES.md` | `archive/legacy/CODEBASE_PRINCIPLES.md` or delete | Deprecate after comparison |
| `bricks-design-system/DESIGN-SYSTEM.md` | `archive/legacy/bricks-design-system-DESIGN-SYSTEM.md` or merge then delete | Deprecate after comparison |
| `bricks-design-system/CONSOLIDATION-GAP-REPORT.md` | `archive/legacy/bricks-design-system-CONSOLIDATION-GAP-REPORT.md` | Archive if still useful |
| `bricks-design-system/tokens.json` | `archive/legacy/bricks-design-system-tokens.json` or delete | Deprecate after comparison |

## Target App Moves

### Bricks Scan

| Current path | Target path | Role |
|---|---|---|
| `bricks-scan/overview.md` | `apps/bricks-scan/product/overview.md` | Canonical |
| `bricks-scan/positioning.md` | `apps/bricks-scan/product/positioning.md` | Canonical |
| `bricks-scan/app-store-copy.md` | `apps/bricks-scan/product/app-store-copy.md` | Canonical |
| `bricks-scan/roadmap.md` | `apps/bricks-scan/product/roadmap.md` | Canonical |
| `bricks-scan/content-strategy.md` | `apps/bricks-scan/product/content-strategy.md` | Canonical |
| `bricks-scan/support-agent-kb.md` | `apps/bricks-scan/operations/support-runbook.md` or `apps/bricks-scan/ai/support-knowledge-base.md` | Choose one authoritative purpose |
| `bricks-scan/support-agent-prompt.md` | `apps/bricks-scan/ai/support-agent-prompt.md` | Derived or canonical AI source |
| `bricks-scan-support-agent/KNOWLEDGE_BASE.md` | `archive/legacy/bricks-scan-support-agent-knowledge-base.md` | Archive after merge |
| `bricks-scan-support-agent/SYSTEM_PROMPT.md` | `archive/legacy/bricks-scan-support-agent-system-prompt.md` | Archive after merge |
| `Bricks-Scan/docs/architecture.md` | `apps/bricks-scan/engineering/architecture.md` | Canonical |
| `Bricks-Scan/docs/dev-guide.md` | `apps/bricks-scan/engineering/dev-guide.md` | Canonical |
| `Bricks-Scan/docs/quick-reference.md` | `apps/bricks-scan/engineering/quick-reference.md` | Canonical |
| `Bricks-Scan/docs/implementation.md` | `apps/bricks-scan/engineering/implementation-details.md` or split | Canonical if still needed |
| `Bricks-Scan/docs/performance.md` | `apps/bricks-scan/engineering/performance.md` | Canonical |
| `Bricks-Scan/docs/dev-history.md` | `apps/bricks-scan/decisions/` and `apps/bricks-scan/meta/` | Split into ADRs and history summary |
| `Bricks-Scan/docs/changelog.md` | `apps/bricks-scan/operations/release-notes.md` | Canonical |
| `Bricks-Scan/docs/release-checklist.md` | keep local and optionally mirror summary in canonical operations | Local reference |
| `Bricks-Scan/docs/contributing.md` | `Bricks-Scan/docs/CONTRIBUTING.md` | Local reference |
| `Bricks-Scan/docs/README.md` | `Bricks-Scan/docs/README.md` | Local reference |

### Bricks Calc

| Current path | Target path | Role |
|---|---|---|
| `bricks-calc/overview.md` | `apps/bricks-calc/product/overview.md` | Canonical |
| `bricks-calc/positioning.md` | `apps/bricks-calc/product/positioning.md` | Canonical |
| `bricks-calc/app-store-copy.md` | `apps/bricks-calc/product/app-store-copy.md` | Canonical |
| `Bricks-Calc/docs/architecture.md` | `apps/bricks-calc/engineering/architecture.md` | Canonical |
| `Bricks-Calc/docs/dev-guide.md` | `apps/bricks-calc/engineering/dev-guide.md` | Canonical |
| `Bricks-Calc/docs/testing.md` | `apps/bricks-calc/engineering/testing-strategy.md` | Canonical |
| `Bricks-Calc/docs/changelog.md` | `apps/bricks-calc/operations/release-notes.md` | Canonical |
| `Bricks-Calc/docs/code-reference.md` | `apps/bricks-calc/engineering/code-reference.md` | Canonical or generated artifact |
| `Bricks-Calc/Documentation/APP_STORE_CHANGELOG.md` | `archive/legacy/bricks-calc-app-store-changelog.md` | Archive after merge |
| `Bricks-Calc/Documentation/CODE_REFERENCE.md` | `archive/legacy/bricks-calc-code-reference.md` | Archive after merge |
| `Bricks-Calc/Documentation/IMPLEMENTATION_DETAILS.md` | `apps/bricks-calc/engineering/implementation-details.md` if unique, else archive | Review required |
| `Bricks-Calc/Documentation/SETUP.md` | keep local as `Bricks-Calc/docs/local-setup.md` | Local reference |
| `Bricks-Calc/Documentation/TESTING.md` | merge into canonical `apps/bricks-calc/engineering/testing-strategy.md` and keep local `docs/testing.md` short | Split |
| `Bricks-Calc/Documentation/README.md` | archive | Archive after migration |
| `Bricks-Calc/Documentation/generate_code_reference.py` | code/tooling, not docs | Move or keep with tooling |

### Bricks Leads

| Current path | Target path | Role |
|---|---|---|
| `bricks-leads/overview.md` | `apps/bricks-leads/product/overview.md` | Canonical |
| `Bricks-Leads/docs/architecture.md` | `apps/bricks-leads/engineering/architecture.md` | Canonical |
| `Bricks-Leads/docs/dev-guide.md` | `apps/bricks-leads/engineering/dev-guide.md` | Canonical |
| `Bricks-Leads/docs/README.md` | `Bricks-Leads/docs/README.md` | Local reference |

### Bricks Website

| Current path | Target path | Role |
|---|---|---|
| `website/overview.md` | `apps/bricks-website/product/overview.md` | Canonical |
| `Bricks-Page/docs/dev-guide.md` | `apps/bricks-website/engineering/dev-guide.md` | Canonical |
| `Bricks-Page/docs/README.md` | `Bricks-Page/docs/README.md` | Local reference |

## Local App Repo End State

Each app repo keeps only:

```text
CLAUDE.md
CODEX.md
docs/
  README.md
  CONTRIBUTING.md
  local-setup.md
  testing.md
  release-checklist.md
  troubleshooting.md
  repo-map.md
```

Each local file should be short and link back to canonical docs in `Bricks-Docs`.

## Local Files To Add Or Normalize

| Repo | File | Action |
|---|---|---|
| `Bricks-Scan` | `docs/CONTRIBUTING.md` | Move content from `docs/contributing.md` |
| `Bricks-Scan` | `docs/repo-map.md` | Add |
| `Bricks-Scan` | `docs/local-setup.md` | Add if setup details exist |
| `Bricks-Calc` | `docs/CONTRIBUTING.md` | Add if needed |
| `Bricks-Calc` | `docs/local-setup.md` | Normalize from `Documentation/SETUP.md` |
| `Bricks-Calc` | `docs/release-checklist.md` | Add if release workflow is repo-specific |
| `Bricks-Calc` | `docs/troubleshooting.md` | Add if needed |
| `Bricks-Leads` | `docs/CONTRIBUTING.md` | Add if needed |
| `Bricks-Leads` | `docs/local-setup.md` | Add if needed |
| `Bricks-Page` | `docs/CONTRIBUTING.md` | Add if needed |
| `Bricks-Page` | `docs/repo-map.md` | Add if needed |

## Migration Order

### Phase 1

- Approve target structure
- Approve naming rules
- Approve local docs policy

### Phase 2

- Create target folders and README indexes
- Move shared docs first
- Resolve duplicate shared docs

Status: completed on 2026-04-05.

Completion notes:

- Shared canonical docs were verified in `shared/brand/` and `shared/engineering/`.
- Verified shared legacy duplicates were removed instead of being retained indefinitely.
- Empty pre-migration source folders were removed so the repo now routes directly through the new structure.
- 2026-04-24: All brand and design system content consolidated into `shared/brand/` as the single canonical location. This includes design-system.md, design-system-gap-report.md, tokens.json, colors_and_type.css, assets/, fonts/, preview/, ui_kits/, SKILL.md, and images_and_illustrations.md. The `shared/Bricks Apps Design System/` folder was deleted. The three design system files were removed from `shared/engineering/`.

### Phase 3

- Migrate Bricks Scan
- Migrate Bricks Calc
- Migrate Bricks Leads
- Migrate Bricks Website

### Phase 4

- Reduce app-local docs to minimal reference set
- Update `CLAUDE.md` files to point at new canonical paths
- Archive superseded docs

### Phase 5

- Add validation and manifest completeness checks

## Open Decisions

1. Whether `quick-reference.md` stays canonical or becomes a local reference doc
2. Whether support knowledge belongs under `operations/` or `ai/`
3. Whether generated code reference files belong in docs or tooling output
4. Whether historical changelogs stay canonical in the docs repo or become release artifacts only
