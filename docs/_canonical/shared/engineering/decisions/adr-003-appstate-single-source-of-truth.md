---
title: ADR-003 AppState Single Source of Truth
doc_id: shared-engineering-adr-003-appstate-single-source-of-truth
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
  - appstate
  - architecture
---

# ADR-003 AppState Single Source of Truth

## Status

`needs-review`

## Context

Bricks apps use Apple-native architecture and need a predictable high-level state model that keeps views decoupled from persistence.

## Decision

Bricks uses a high-level single-source-of-truth rule for app state.

The preferred implementation is a dedicated app-level state owner such as `AppState` when the product has a central mutable domain, as in Bricks Calc.

When a single `AppState` type is not the right fit, the app must still expose an explicit, bounded app-level state surface through a small set of named stores and coordinators, as in Bricks Scan. In either case:

- views may own presentation state
- views must not own persistence orchestration
- write paths must go through explicit mutation services, coordinators, or app-level state methods
- state ownership must be discoverable in architecture docs and root AI entrypoints

## Consequences

- Positive:
  - State flow is easier to reason about and review.
  - Persistence boundaries stay explicit.
  - UI code remains thinner and more predictable.
- Negative:
  - Central state owners can become overloaded if responsibilities are not kept narrow.
  - Apps without a single `AppState` type require more discipline to keep store boundaries clear.
- Neutral:
  - The exact type shape may differ per app as long as the ownership model remains explicit.

## Alternatives Considered

1. Inject persistence directly into views
2. Use feature-local state without a shared high-level model
3. Force every app to implement the exact same `AppState` type shape

## Related Docs

- [Codebase Principles and Patterns](../codebase-principles.md)
- [Bricks Calc Architecture](../../../apps/bricks-calc/engineering/architecture.md)
- [Bricks Scan Architecture](../../../apps/bricks-scan/engineering/architecture.md)
