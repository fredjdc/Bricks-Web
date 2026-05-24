---
title: Bricks Leads Testing Strategy
doc_id: bricks-leads-engineering-testing-strategy
doc_type: engineering
role: canonical
app_scope: bricks-leads
owner: Freddy
status: draft
last_reviewed: 2026-04-05
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - leads
  - engineering
  - testing
---

# Bricks Leads Testing Strategy

This document defines the canonical testing expectations for Bricks Leads. It describes what should be protected, which test layers matter most, and what release checks are required before changes ship.

The local repo file at `Bricks-Leads/docs/testing.md` remains the workflow-oriented command reference for contributors working inside the app repo. This canonical doc owns the durable testing strategy.

## Test Scope

Testing should protect the core CRM workflows that matter to the current product: creating and editing clients, properties, appointments, and follow-up relationships; preserving SwiftData-backed state correctly; and ensuring localization and container startup behavior do not break the app at launch.

The current testing surface is still light. This strategy establishes the baseline expectations and the release gates that future automation and test additions should follow.

## Test Layers

- Unit: model helpers, derived formatting, search/filter helpers, and any pure business logic extracted from views.
- Integration: SwiftData container startup, relationship persistence, appointment/task linking, and search behavior across real model changes.
- UI: smoke coverage for primary navigation, creation flows, and key detail/edit screens.
- Manual verification: localization switching, Peru address search, adaptive layout, and CloudKit-backed startup/fallback behavior.

## Critical Flows To Protect

1. Create, edit, and relate clients and properties without breaking persisted links.
2. Create and update appointments and follow-up tasks while preserving relationships and dates.
3. Search, recents, and relationship views continue to return stable results after entity changes and app relaunch.

## Commands and Execution

The current baseline build verification command is:

```bash
xcodebuild -project "Leads App.xcodeproj" -scheme "Leads App" -configuration Debug -destination "platform=macOS,arch=arm64" build
```

For local execution details and repo-specific workflow notes, use `Bricks-Leads/docs/testing.md`.

## Test Data and Helpers

- Fixtures: currently lightweight and mostly implicit through model setup in previews and runtime flows.
- Factories: not yet standardized; future test additions should prefer small explicit factory helpers for `Client`, `Property`, `Appointment`, and `TodoTask`.
- Mocks/stubs: keep them minimal and use real SwiftData containers where persistence behavior is under test.

## Release Gates

- The app must build successfully with the main local validation command.
- Core create/edit flows for clients, properties, and appointments must be manually verified after meaningful model or navigation changes.
- Search and relationship views must be checked after schema, query, or linking changes.
- Localization-sensitive changes must be reviewed in both supported languages before release.

## Known Gaps

- There is not yet a strong automated test suite covering model persistence and relationship integrity.
- Release validation still depends heavily on manual verification for localization, address workflows, and adaptive navigation behavior.

## Minimum Complete Content Checklist

- [x] Scope is explicit
- [x] Test layers are defined
- [x] Critical flows are listed
- [x] Commands are runnable
- [x] Release gates are stated
- [x] Known gaps are honest
