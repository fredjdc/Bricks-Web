---
title: ADR-004 Persistence and Sync Policy
doc_id: shared-engineering-adr-004-persistence-and-sync-policy
doc_type: decisions
role: canonical
app_scope: shared
owner: Freddy
status: needs-review
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - adr
  - persistence
  - sync
---

# ADR-004 Persistence and Sync Policy

## Status

`needs-review`

## Context

Bricks apps do not all use the same sync model. Documentation needs a shared policy that explains common principles and app-specific deviations.

## Decision

Bricks apps follow a local-first persistence policy.

The shared rules are:

- each app must remain usable with local persistence even when cloud features are unavailable
- write paths must be explicit and reviewable
- sync is layered on top of local persistence, not a replacement for it
- app-specific sync implementations are allowed when they fit the product, but they must be documented canonically

Current allowed implementations:

- Bricks Scan: runtime-selectable local or cloud store with custom recovery and sync coordination layered over SwiftData
- Bricks Calc: SwiftData plus CloudKit-backed sync for calculations (`cloudKitDatabase: .automatic`), with device-local `UserDefaults` for settings (no iCloud sync for settings)
- Bricks Leads: SwiftData with a CloudKit-capable container and local fallback when CloudKit container creation fails

## Consequences

- Positive:
  - Apps stay reliable when cloud services are unavailable.
  - Sync complexity can differ per product without breaking shared principles.
  - Persistence decisions stay explicit in docs and code.
- Negative:
  - Cross-app architecture is less uniform at the implementation level.
  - Shared docs must describe exceptions carefully to avoid overgeneralization.
- Neutral:
  - Some apps may continue to use multiple persistence mechanisms for different data classes, such as settings versus documents.

## Alternatives Considered

1. One mandatory sync architecture for all apps
2. App-specific sync choices with no shared policy
3. Cloud-first architecture that assumes remote availability

## Related Docs

- [Codebase Principles and Patterns](../codebase-principles.md)
- [Bricks Scan Architecture](../../../apps/bricks-scan/engineering/architecture.md)
- [Bricks Calc Architecture](../../../apps/bricks-calc/engineering/architecture.md)
