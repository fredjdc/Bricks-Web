---
title: Bricks Scan Engineering Docs
doc_id: bricks-scan-engineering-readme
doc_type: meta
role: canonical
app_scope: bricks-scan
owner: Freddy
status: draft
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - engineering
---

# Bricks Scan Engineering Docs

Use this folder for Bricks Scan architecture, state management, implementation, and testing guidance.

## Files

| File | Purpose |
|---|---|
| [architecture.md](architecture.md) | Layers, data flow, persistence, runtime behavior |
| [dev-guide.md](dev-guide.md) | Repo-specific engineering rules and setup guidance |
| [quick-reference.md](quick-reference.md) | Short implementation and API reference |
| [implementation-details.md](implementation-details.md) | Deep technical implementation notes |
| [performance.md](performance.md) | Performance guidance and audits |

## Shared References

| Doc | Purpose |
|---|---|
| [shared/engineering/codebase-principles.md](../../../shared/engineering/codebase-principles.md) | Cross-app architecture patterns (AppState, save flows, validation) |
| [shared/brand/design-system.md](../../../shared/brand/design-system.md) | Design system implementation rules (Swift tokens, component patterns) |
| [shared/brand/tokens.json](../../../shared/brand/tokens.json) | Shared design tokens |
