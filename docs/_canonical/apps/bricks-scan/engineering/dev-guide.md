---
title: Bricks Scan Development Guide
doc_id: bricks-scan-engineering-dev-guide
doc_type: engineering
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - development
---

# Bricks Scan Development Guide

## Purpose

This guide explains how to write code that fits the current Bricks Scan codebase.

It is not a generic Swift style guide. It focuses on the patterns that matter in this repo:

- thin SwiftUI views
- service-oriented product logic
- centralized mutation ownership
- SwiftData-backed models
- non-destructive document editing
- Foundation Models with deterministic fallbacks
- sync-aware persistence

Use this with:

- [architecture.md](./architecture.md)
- [quick-reference.md](./quick-reference.md)
- [shared/brand/design-system.md](../../../shared/brand/design-system.md) — Swift tokens, CSS variables, SwiftUI component patterns
- [shared/brand/tokens.json](../../../shared/brand/tokens.json) — shared design tokens
- [shared/engineering/codebase-principles.md](../../../shared/engineering/codebase-principles.md) — cross-app architecture patterns

---

## Environment Setup

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Xcode | 26.1+ | Required for the current project deployment targets and SDKs |
| macOS | 26.1+ | Matches the current project deployment target |
| Apple Developer account | Any | Free account is sufficient for simulator; paid required for device |
| iPhone or iPad (optional) | iOS 26.1+ | Needed for camera-based scanning and device-only integrations |

The project has zero external Swift package dependencies.

> **Note on Firebase:** Firebase Analytics is present via Swift Package Manager. If you see package resolution warnings, ensure your network can reach GitHub.

### Clone and Open

```bash
git clone <repo-url>
cd "Bricks Scan"
open "Bricks Scan.xcodeproj"
```

### Signing and Capabilities

The checked-in entitlements configure:

- **CloudKit / iCloud container** — `iCloud.bricks.Bricks-Scan`
- **App Group** — `group.bricks.Bricks-Scan`
- **Push environment** — `aps-environment`

The app also uses notifications, widgets, and App Intents. Your Apple Developer configuration must support those capabilities for device testing.

When running on a personal team, CloudKit sync will not be available. To disable it for local development, open `Bricks_ScanApp.swift` and comment out the CloudKit store description to use a local-only container.

### Bundle Identifiers

| Target | Bundle ID |
|--------|-----------|
| Main app | `bricks.Bricks-Scan` |
| Widget extension | `bricks.Bricks-Scan.BricksScanWidgets` |
| Tests | `bricks.BricksScanTests` |

Update these to match your team in Signing settings if needed.

### Running the App

**Simulator** — Select the `Bricks Scan` scheme, pick an iPhone or iPad simulator, press ⌘R. The device camera is not available in simulator; use the photo picker or file import instead. OCR works. Foundation Models availability depends on host OS and Apple Intelligence.

**Device** — Connect an iPhone or iPad meeting the current deployment target, select it as the run destination, press ⌘R. Trust the developer certificate on device if prompted.

**macOS** — Select `Bricks Scan` scheme, choose My Mac, press ⌘R. Uses Continuity Camera and file/photo import instead of the iOS document camera.

**Widget** — Build the project, run the app, add the widget from the system widget gallery. Start a scan to exercise the Live Activity path.

### Environment Notes

**Apple Intelligence / Foundation Models** — AI features require Apple Intelligence-capable hardware, Apple Intelligence enabled in Settings → Apple Intelligence & Siri, and a supported OS runtime. When unavailable, the app falls back to keyword-based classification and heuristic extraction.

**StoreKit testing** — The repo includes `Bricks Scan/BricksScanStoreKit.storekit`. The shared scheme already points to it. Swap in the scheme editor or use Sandbox testing on device if needed.

**CloudKit development** — Use separate iCloud accounts on different devices to verify sync. Inspect the container via Xcode → CloudKit Console. Container identifier is `iCloud.bricks.Bricks-Scan` — centralized in `Services/CloudSyncConfiguration.swift`.

> **Critical:** The app uses a custom CloudKit replication layer, not a CloudKit-backed SwiftData store. Schema changes require importing the updated `.ckdb` file into the CloudKit container (see [`implementation-details.md`](./implementation-details.md) CloudSync section for the import process). Do **not** use Xcode → Editor → Push CloudKit Schema — that path applies to SwiftData-managed CloudKit stores.

### Common Build Issues

**SDK or deployment target mismatch** — Ensure Xcode 26.1+ with matching platform runtime.

**"Module not found" for Foundation Models** — Verify the active SDK supports Foundation Models and you are not building against an older platform SDK.

**Widget won't update** — Widgets use a shared App Group container. Ensure the App Group entitlement is configured identically in both main app and widget extension targets.

**CloudKit schema mismatch** — Check [`implementation-details.md`](./implementation-details.md) → CloudSync → Production Schema Requirement. The symptom is `Cannot create new type Tag in production schema` in diagnostics.

---

## Core Principles

### DRY

If the same logic appears twice, it probably belongs in:

- a service
- a view logic helper
- `ValidationRules`
- a model helper
- a reusable component

Current examples:

- validation is centralized in `Components/ValidationRules.swift`
- many screen behaviors are extracted into `SubViews/Views Components/`
- scan/export logic is centralized in `Image Processing/`

Avoid duplicating:

- input validation
- page limit checks
- title normalization
- export preparation
- sync or lifecycle cleanup
- revision bump or freshness rules

### SOLID

Apply SOLID pragmatically, not ceremonially.

Good current examples:

- `DocumentProcessingService` orchestrates processing without owning every low-level implementation
- `OCRProcessor` focuses on OCR
- `PDFGenerator` focuses on export and PDF generation
- `IntelligenceService` owns AI-assisted classification and metadata fallback logic
- `CloudSyncConfiguration` owns store configuration decisions

Bad pattern:

```swift
final class DocumentService {
    func process() {}
    func export() {}
    func classify() {}
    func sync() {}
    func delete() {}
}
```

Prefer smaller, focused units with obvious names.

### KISS

Prefer the simplest structure that fits the existing architecture.

In this repo, "simple" usually means:

- use an existing service instead of introducing a new abstraction
- extract local view logic before inventing a generic framework
- use stable product terms already in the models
- favor explicit control flow over clever indirection

---

## Repo Patterns

## Thin Views

SwiftUI views should mostly do three things:

1. render UI
2. hold transient UI state
3. call services or extracted logic

If a view starts owning:

- validation branching
- policy decisions
- search logic
- scan orchestration
- sync decisions

that logic likely belongs elsewhere.

If a view starts calling `ModelContext.save()` or `CloudSyncPushService.schedulePushIfNeeded(...)` directly, that is almost always the wrong boundary.

Common destinations:

- mutation services
- `Services/`
- `Image Processing/`
- `Foundation Models/`
- `SubViews/Views Components/`

For user-facing writes, prefer:

- `DocumentMutationService`
- `PageMutationService`
- `CatalogMutationService`
- `SignatureMutationService`

For infrastructure commits, prefer `MutationTransactionCoordinator`.

## Reusable UI

Before building a new component, inspect:

- `Bricks Scan/Components/`
- `Bricks Scan/SubViews/Views Components/`

Examples of existing reusable UI and shared behavior:

- `TagBadgeView`
- `DocumentRowView`
- `FolderRowView`
- shared rename / delete / validation alert modifiers
- thumbnail and processing UI

Do not assume every reusable piece must go into `CommonViews.swift`. New standalone files in `Components/` are fine when they improve clarity.

## Validation

Validation is centralized. Use it.

Examples:

```swift
ValidationRules.validateDocumentTitle(title)
ValidationRules.validateFolderName(name, existingNames: names)
ValidationRules.validateDocumentTypeName(name, existingNames: names) // tag and document-type names share this path
ValidationRules.validateSignatureName(name, existingNames: names)
ValidationRules.validateNotes(notes)
ValidationRules.validateScanImages(imageCount: count, currentDocumentCount: currentCount)
```

Important constants:

```swift
ValidationConstants.maxTitleLength
ValidationConstants.maxNameLength
ValidationConstants.maxNotesLength
ValidationConstants.maxKeywordsLength
ValidationConstants.maxKeywordLength
```

Do not recreate these rules inline in views or sheet handlers.

## Current Naming

Use current model terms:

- `DocumentFolder`
- `Tag`
- `Document`
- `ScanPage`

Do not reintroduce old naming such as:

- `DocumentList`
- `DocumentType`
- `List`
- `Type` when the actual model is `Tag`

---

## Shared Logic Placement

### `Core/`

Use `Core/` for:

- app settings
- app intents and Spotlight entities
- notification and calendar integrations that are core product infrastructure
- model definitions in `Core/Models/`

### `Services/`

Use `Services/` for cross-cutting application behavior that is not image-pipeline specific.

Examples:

- startup and maintenance
- search
- Spotlight indexing
- sync configuration and status
- document lifecycle
- reminders-folder sync
- markup and signing orchestration
- transaction coordination and mutation ownership

### `Image Processing/`

Use `Image Processing/` for:

- OCR
- document processing
- crop and enhancement
- page rendering
- PDF generation
- import and page-preparation flows

### `Foundation Models/`

Use `Foundation Models/` for:

- prompt construction
- generation wrappers
- summary workflows
- AI-assisted extraction and fallback orchestration

Do not spread prompt logic across unrelated views.

### `SubViews/Views Components/`

Use these files when a screen becomes too large but the logic is still screen-specific.

This is the preferred place for:

- toolbar actions
- route / presentation decisions
- screen-specific modifiers
- UI state transitions tied to one feature surface

---

## Data Model Patterns

## `Document`

`Document` is the central model. It stores persistent user-facing document state plus transient caches and processing state.

Important usage patterns:

- use `pagesSortedByNumber` rather than resorting pages in multiple places
- use `firstPage` when you need the canonical preview page
- use `remainingPageCapacity` before append flows
- let mutation services advance structure and render revisions when page ordering or rendered content changes

Do not assume full document text is an always-persisted raw field. `extractedText` is computed from page text and cached transiently.

Important persisted revision fields:

- `structureRevision`
- `renderRevision`
- `pdfRevision`

## `ScanPage`

`ScanPage` is not just image bytes. It also carries:

- original source data
- OCR text and span geometry
- crop metadata
- rotation metadata
- markup
- signatures
- revision fields for OCR and summary freshness

Current freshness rules:

- OCR is fresh when `ocrRevision == contentRevision`
- page summary is fresh when `summaryRevision == contentRevision`

If you change page editing behavior, review revision bumps and export/render effects.

## `DocumentFolder`

`DocumentFolder` supports both user folders and built-in system folders.

Current built-in folder kinds are:

- all documents
- past week
- trash

Identity is based on stable IDs, not only localized names.

## `Tag`

`Tag` supports system defaults plus user customization.

Classification and suggestion logic depends on:

- `classificationKeywords`
- stable system-default identity
- display order

---

## Service Design

### Orchestrators vs Specialists

Prefer the current split:

- orchestrator service coordinates work
- specialist services do focused tasks

Example:

- `DocumentProcessingService` orchestrates
- `OCRProcessor` recognizes text
- `PDFGenerator` builds exports
- `DocumentClassificationService` enriches

This keeps code easier to test and easier to change independently.

### Decision Seams

When logic becomes branch-heavy, extract a decision seam that can be tested without UI.

Good candidates:

- route selection
- feature gating
- export decisions
- organization policy decisions
- sync behavior decisions

The repo already uses this pattern widely in tests. Follow it instead of hiding business rules inside SwiftUI event closures.

### Side Effects

Be careful with side effects in this product. A "simple" action may affect:

- SwiftData persistence
- Spotlight indexing
- widget state
- local notifications
- calendar events
- sync conflict state
- PDF caches

Before changing delete, move, restore, rename, or export flows, find the existing service boundary and extend it instead of bypassing it.

The standard write-path contract is:

```text
mutate model state
  -> bump revisions
  -> invalidate caches
  -> save once
  -> enqueue sync once
  -> optionally schedule push
```

---

## Foundation Models Guidance

Use the current layering:

- `AIConfiguration` for prompts, personas, options, and availability messaging
- `AIGenerationService` for session and generation APIs
- `IntelligenceService` for product-facing AI plus fallback behavior

Do not:

- construct long ad hoc prompts directly in views
- assume Foundation Models is always available
- assume failures should surface raw model errors to users
- add AI features without deterministic fallback when the feature is product-critical

When a feature is only additive, graceful degradation is acceptable. When it affects scanning, classification, or organization, fallback logic should be explicit.

---

## SwiftUI Guidance

### Environment Stores

The app uses `@Observable` environment stores heavily. Follow the current pattern:

- inject shared stores through environment
- use `@Bindable` in views that need bindings to those stores
- do not introduce `ObservableObject` / `@StateObject` unless there is a clear architectural reason and it matches the surrounding code

### View Extraction

Extract view code when:

- the body becomes hard to scan
- a section has its own state or action cluster
- a toolbar or modifier block becomes noisy
- the logic is screen-specific but too large to leave inline

Not every extraction needs to be a globally reusable component.

### User Preferences

For app-wide persisted preferences, prefer the centralized settings model and store patterns already present in `AppSettings.swift` and the settings store. Do not introduce scattered `@AppStorage` usage as a default pattern unless the nearby code already uses it for that exact setting.

---

## Platform Guidance

The app shares one codebase across iPhone, iPad, and macOS.

Rules:

- keep `#if os(...)` blocks narrow
- prefer shared abstractions like `PlatformImage`
- use platform-specific bridges only where needed
- avoid forking entire features by platform unless the UX truly diverges

Examples of legitimate platform differences:

- iOS document camera vs macOS Continuity Camera and file import
- macOS inspector-style layouts
- platform-specific keyboard shortcuts and responder behavior

Do not let platform-specific code leak into unrelated shared logic.

---

## Performance Guidance

Performance matters in this app because large images, OCR, PDF generation, and page rendering are expensive.

Current repo patterns to preserve:

- sequential OCR for memory stability
- downsampling based on `ScanResolution`
- transient caches for sorted pages and extracted text
- `ThumbnailCache` for page thumbnails
- explicit invalidation when page geometry or overlays change

If a new feature touches images, rendering, or export, evaluate:

- memory usage
- cache invalidation
- whether work must happen on the main actor
- whether the result should be persisted or derived

---

## Testing Guidance

When writing logic, ask whether it can be tested without UI.

Prefer:

- pure helpers
- deterministic service methods
- extracted decision seams
- state transformations with explicit inputs

Use existing test files when possible instead of creating overlapping new ones.

If a change is hard to test, that is usually a sign the logic is in the wrong place.

---

## Practical Examples

### Good: Use Existing Validation

```swift
let result = ValidationRules.validateFolderName(name, existingNames: existingNames)
guard result.isValid else {
    errorMessage = result.errorMessage
    return
}
```

### Good: Keep Model Mutation On Main Actor

```swift
Task.detached(priority: .userInitiated) {
    let text = try await OCRProcessor.processImage(image)
    await MainActor.run {
        page.pageText = text.text
        document.invalidateExtractedTextCache()
        try? modelContext.save()
    }
}
```

### Good: Extend A Service Instead Of A View

If a screen needs a new export decision, prefer extending export or processing services instead of embedding branching logic in button handlers.

### Good: Use Current Constants

```swift
if documents.count >= Document.maxDocumentsLimit {
    showPaywall = true
}
```

---

## Contributor Checklist

Before finalizing a change:

- confirm naming uses current product terms
- confirm the logic lives in the correct layer
- confirm validation is centralized
- confirm limits are not hardcoded
- confirm sync, search, export, widget, and reminder side effects were considered if relevant
- confirm cache invalidation is correct when changing page output
- confirm tests were updated when logic changed

If you skip tests or builds, say so explicitly in your handoff.
