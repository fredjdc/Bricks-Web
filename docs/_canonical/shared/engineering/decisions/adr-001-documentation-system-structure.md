---
title: ADR-001 Documentation System Structure
doc_id: shared-engineering-adr-001-documentation-system-structure
doc_type: decisions
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
  - adr
  - documentation
  - structure
---

# ADR-001 Documentation System Structure

## Status

`needs-review`

## Context

Bricks documentation was previously spread across app repos, legacy folders, and parallel structures. This created duplication, stale facts, unclear routing, and multiple conflicting copies of the same product and engineering truth.

## Decision

Bricks will use `Bricks-Docs` as the canonical documentation repository.

The canonical structure is:

- `shared/brand/` for brand voice, identity, and visual rules
- `shared/engineering/` for cross-app engineering standards and ADRs
- `shared/ai/` for shared AI-source rules and generation policy
- `shared/product/` for portfolio-level product principles
- `apps/<app>/product/` for what each app is
- `apps/<app>/engineering/` for how each app is built
- `apps/<app>/ai/` for app-specific AI source docs
- `apps/<app>/operations/` for support and release documentation
- `apps/<app>/decisions/` for app-specific ADRs
- `apps/<app>/meta/` for document indexes and migration notes
- `archive/` for deprecated but historically useful documentation

Each canonical folder must route through a `README.md`.

Legacy duplicate docs should be removed aggressively when they are no longer needed. If they still have historical value, they move into `archive/legacy/` with an explicit paper trail in git history.

## Consequences

- Positive:
  - There is one review surface for canonical documentation.
  - Shared and app-specific concerns are separated cleanly.
  - Agents can reason about routing rules without guessing where truth lives.
- Negative:
  - Canonical docs are further from the app codebases, so local workflow docs must stay intentionally small and well-linked.
  - Migration requires ongoing cleanup whenever legacy files are discovered.
- Neutral:
  - App repos still keep narrow local docs for developer workflow and root agent entrypoints.

## Alternatives Considered

1. Keep full docs in each app repo
2. Split canonical truth between GitHub and external tools

Both alternatives were rejected because they reintroduce drift and make review harder.

## Related Docs

- [Documentation System Spec](../../../docs-governance/documentation-system-spec.md)
- [Migration Plan](../../../docs-governance/migration-plan.md)
