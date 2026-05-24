---
title: Bricks Leads Architecture
doc_id: bricks-leads-engineering-architecture
doc_type: engineering
role: canonical
app_scope: bricks-leads
owner: Freddy
status: needs-review
last_reviewed: 2026-04-06
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - leads
  - architecture
---

# Bricks Leads — Architecture

## System Overview

Bricks Leads is a SwiftUI app backed by a single shared SwiftData `ModelContainer`. The runtime schema currently includes `Client`, `Property`, `ClientPropertyLink`, `UserProfile`, and `Appointment`. `LeadsApp` first attempts to create that container with CloudKit enabled and falls back to a local-only store if the CloudKit-backed container cannot be created, which keeps the app launchable before or without working sync configuration.

The architecture is view-driven rather than `AppState`-driven. `ContentView` owns the high-level category selection plus modal state. Entity screens and forms query SwiftData directly through `@Query`, mutate model instances in place, and call `modelContext.save()` from the view layer. On macOS the root UI uses `NavigationSplitView`; on iPhone and iPad it uses a tab-based `TabView` with nested `NavigationStack`s for the schedule, clients, properties, and recent/search flows.

The codebase leans on reusable UI and helper components instead of a repository or service-heavy architecture. Shared pieces handle filters, calendar UI, metrics, toasts, tips, localization, address search, and form layouts. That keeps the code relatively direct, but it also means persistence boundaries and mutation rules are distributed across screens rather than concentrated in one orchestration layer.

## Major Layers and Modules

| Layer or module | Responsibility | Key files or types |
|---|---|---|
| App entry and persistence | Creates the SwiftData schema and model container, prefers CloudKit, falls back to local persistence, configures TipKit | `LeadsApp.swift` |
| Root navigation and sheet orchestration | Manages top-level category selection, modal flows, and adaptive layout across iPhone, iPad, and Mac | `ContentView.swift` |
| Domain models | Defines persisted entities, enums, timestamps, link behavior, and helper methods on the models themselves | `Model/Models.swift` |
| Schedule flow | Implements the calendar-oriented appointment list, appointment detail, and booking/edit form | `Views/ScheduleListView.swift`, `Views/ScheduleDetailView.swift`, `Views/ScheduleFormView.swift`, `Components/ScheduleListComponents.swift` |
| Client and property flows | Implements list, detail, and form screens for the two primary record types | `Views/Client*`, `Views/Property*`, `Layouts/ClientFormLayout.swift`, `Layouts/PropertyFormLayout.swift` |
| Search and relationship flows | Handles recent/search lookup and debounced client-property linking | `Views/RecentView.swift`, `Views/RelationshipView.swift`, `Model/SearchViewModel.swift` |
| Shared UI components | Supplies reusable filters, charts, toasts, tips, photo picking, animations, and toolbar pieces | `Components/` |
| Address and localization support | Handles Peru-specific address lookup, optional current-location matching, and app-managed localization | `Components/AddressDataManager.swift`, `Components/LocalizationManager.swift`, `Views/SearchAddressView.swift` |
| Settings and profile | Manages the single in-app user profile, profile photo, language selection, and destructive data reset | `Views/SettingsView.swift` |

## Core Models and Entities

- `Client`: stores contact information, lead source, client role, lead/client level, notes, timestamps, pin state, tasks, appointments, and linked properties.
- `Property`: stores property identity, location, status, operation type, currency, pricing, broker-fee fields, document flags, media links, timestamps, tasks, appointments, and linked clients.
- `Appointment`: stores appointment title, date/time, location, notes, appointment type, status, linked clients, linked properties, and tasks.
- `ClientPropertyLink`: represents the many-to-many client/property relationship and carries role plus relationship metadata.
- `UserProfile`: stores the app user profile and profile picture.

`TodoTask` is defined in `Model/Models.swift`, but it is not part of the schema created in `LeadsApp.swift` and is not surfaced as a current user-facing workflow. It should be treated as groundwork, not current architecture truth.

## State Ownership

- App-level state: `ContentView` owns category selection, selected records, active sheets, and alert presentation state through `ContentSelection` and `SheetState`.
- View-level state: search text, filter state, calendar selection, selected metrics month, and temporary form interactions live in the relevant view or helper object such as `FilterManager`, `RelationshipSearchState`, or the form-local `@State` fields.
- Mutation path: forms either create new models and insert them into `ModelContext` or update existing models in place, while detail screens also perform inline mutations such as pinning, date edits, relationship edits, and document-flag updates.
- Save/update boundary: there is no centralized mutation service. Save boundaries are view-driven and `modelContext.save()` is called directly from forms, detail screens, settings, and bulk-delete actions.

## Persistence and Sync

- Storage model: SwiftData models defined in `Model/Models.swift`.
- Sync model: the app initializes a CloudKit-backed `ModelConfiguration` with `.automatic`, then falls back to a local non-CloudKit configuration if container creation fails.
- Conflict handling: the current code relies on SwiftData and CloudKit behavior plus explicit inverse relationships and optional relationships for compatibility; there is no custom merge or conflict-resolution layer.
- Failure behavior: if the CloudKit-backed container cannot be created, the app still launches with a local store instead of crashing. Per-view saves generally log or silently absorb errors rather than route them through a shared recovery mechanism.

## Integration Points

- SwiftData and CloudKit: persistence, relationships, and optional sync through the shared model container.
- TipKit: contextual tips configured at app startup.
- Swift Charts: metrics visualizations in `MetricsView` and `DonutChart`.
- CoreLocation and MapKit on iOS: current-location lookup and reverse-geocoding support for Peru address selection.
- PhotosUI: profile photo selection in `SettingsView`.
- UserDefaults and NotificationCenter: app-managed language selection and restart signaling in `LocalizationManager`.
- `openURL`: calling, messaging, mail, website, and map handoff from detail and settings screens.

## Constraints and Tradeoffs

- The current architecture favors direct SwiftUI and SwiftData integration over a deeper service or repository layer, which keeps the code simple but makes save/update flows less centralized.
- Peru-specific address search is a product advantage for the target market, but it tightly couples the address workflow to the bundled UBIGEO dataset.
- Localization is app-managed rather than purely system-driven, which gives explicit language control but currently requires restart-aware behavior.
- The model file includes some future-facing groundwork such as `TodoTask`, but the live schema and visible UI only cover the entities included by `LeadsApp`.
- Several save paths handle errors locally with `print`, `try?`, or toast feedback, so persistence failures are not normalized through one policy surface.

## Extension Guidance

- Preferred extension points: add new shared UI patterns in `Components/`, keep entity-specific screens grouped under `Views/`, and extend model behavior with helper methods on the SwiftData models when the behavior is truly model-adjacent.
- Patterns to reuse: `SearchAddressView` for address entry, `ToastCenter` for transient feedback, `DonutChart` and metrics components for visual summaries, and the existing list/detail/form screen structure for new entity flows.
- Anti-patterns to avoid: creating duplicate address pickers, adding hardcoded user-facing strings, introducing new relationship models when `ClientPropertyLink` can represent the association, or documenting `TodoTask` as a shipped workflow before the runtime schema and UI actually adopt it.

## Related Docs

- Overview: [../product/overview.md](../product/overview.md)
- Dev guide: [./dev-guide.md](./dev-guide.md)
- Testing: [./testing-strategy.md](./testing-strategy.md)
- ADRs: [../decisions/README.md](../decisions/README.md)
