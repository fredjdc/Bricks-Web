---
title: Bricks Documentation Hub
doc_id: docs-root-readme
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - documentation
  - index
---

# Bricks Documentation Hub

Canonical documentation for Bricks Apps.

This repository is the durable source of truth for shared standards, app documentation, documentation governance, and AI source context. App repositories should keep only minimal local documents needed for repo-specific development workflows.

## Structure

```text
Bricks-Docs/
  docs-governance/   Rules, taxonomy, frontmatter, lifecycle, migration
  manifest/          Machine-readable catalog of managed docs
  shared/            Cross-app brand, engineering, AI, and product docs
  apps/              Canonical documentation for each Bricks app
  agents/            Agent workflows that operate on canonical docs
  archive/           Deprecated and legacy docs kept for history
```

## Start Here

| Area | Purpose |
|---|---|
| [docs-governance/](docs-governance) | Rules for what belongs where and how docs are maintained |
| [manifest/](manifest) | Machine-readable docs catalog |
| [shared/](shared) | Cross-app standards and shared context |
| [apps/](apps) | App-specific canonical docs |
| [agents/](agents) | Agent prompts and maintenance workflows |
| [archive/](archive) | Legacy material retained for traceability |

## Routing Rules

| Content type | Canonical location |
|---|---|
| Brand voice and visual system | `shared/brand/` |
| Cross-app engineering standards | `shared/engineering/` |
| Shared AI rules and generation policy | `shared/ai/` |
| Shared product principles | `shared/product/` |
| App-specific product docs | `apps/<app>/product/` |
| App-specific engineering docs | `apps/<app>/engineering/` |
| App-specific AI source docs | `apps/<app>/ai/` |
| App-specific operations docs | `apps/<app>/operations/` |
| App and shared ADRs | `apps/<app>/decisions/` and `shared/engineering/decisions/` |
| Repo-specific workflow docs | local app repo root `CLAUDE.md` and `CODEX.md`, plus allowed `docs/` files only |

## In Scope For Local App Repos

Only keep local documents that are:

- repo-specific
- workflow-specific
- non-duplicative
- short where possible
- linked back to canonical docs here

## Current Migration State

Phase 2 is complete.

- Shared canonical docs have moved into `shared/`
- Shared legacy duplicates were verified against canonical files and removed
- Empty pre-migration source folders were removed
- App and local-repo migration work continues through the later phases

See [documentation-system-spec.md](docs-governance/documentation-system-spec.md) and [migration-plan.md](docs-governance/migration-plan.md).
