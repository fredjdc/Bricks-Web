---
title: Shared AI Documentation
doc_id: shared-ai-readme
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: needs-review
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - ai
  - index
---

# Shared AI Documentation

Shared AI documentation is reserved for agent behavior, generation policy, and cross-app AI constraints that apply to more than one Bricks product.

## What Belongs Here

- shared rules for how agents should write canonical docs
- cross-app AI context generation policy
- constraints that apply to both `CLAUDE.md` and `CODEX.md`
- shared rules for derived AI files and sync behavior

## What Does Not Belong Here

- app-specific product descriptions
- app-specific architecture truth
- long copies of content that already exists under `shared/engineering/` or `apps/<app>/`

## Current Canonical Dependencies

- [Documentation System Spec](../../docs-governance/documentation-system-spec.md)
- [Documentation Backlog](../../docs-governance/documentation-backlog.md)
- [Documentation Templates](../../docs-governance/templates/README.md)
- [ADR-006 AI Context Generation Policy](../engineering/decisions/adr-006-ai-context-generation-policy.md)

App-specific AI source docs live under `apps/<app>/ai/`.
