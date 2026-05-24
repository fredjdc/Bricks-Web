---
title: Bricks Scan Architecture
doc_id: bricks-scan-engineering-architecture
doc_type: engineering
role: canonical
app_scope: bricks-scan
owner: Freddy
status: needs-review
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - architecture
---

# Bricks Scan — Architecture

## Overview

Bricks Scan uses a layered SwiftUI and SwiftData architecture with thin views, explicit service boundaries, a runtime-selectable persistence mode, and a persisted iOS scan-processing pipeline for long-running scan work.

```text
SwiftUI views and view logic
  -> domain mutation services, services, and coordinators
  -> SwiftData models and stores
  -> Apple frameworks and system integrations
```

The important constraint is that the app is not just "views over models". It also has a substantial orchestration layer for scanning, persisted scan jobs, enrichment, export, notifications, indexing, widgets, analytics hooks, and sync recovery.

---

## Architecture Layers

### UI Layer

The UI layer is primarily:

- `Views/`
- `SubViews/`
- `Components/`
- `SubViews/Views Components/`

Views are expected to own presentation state and user interaction only. Heavy logic is pushed into:

- mutation services
- service types
- view logic helper files
- model helpers
- dedicated observable stores

Views must not directly own:

- `ModelContext.save()`
- CloudKit queue mutation
- push scheduling
- multi-step invalidation rules for document or page edits

Current scan-progress presentation on iOS follows the same separation:

- the persisted scan job is owned by `ContentViewLogic`, `ScanProcessingJobStore`, and `ScanProcessingJobRunner`
- the main in-app progress surface is a compact inline card rendered inside `DocumentFolderView`
- the same compact progress component is reused by onboarding and document enrichment UIs
- views do not own a separate long-running scan task just to keep progress alive

### Service And Coordinator Layer

The service layer contains most product behavior:

- scan and OCR orchestration
- persisted scan-job execution and resume
- export generation
- classification and metadata extraction
- reminders and calendar integration
- Spotlight indexing
- analytics event tracking
- conflict reconciliation
- app initialization and maintenance

This layer spans both `Image Processing/` and `Services/`.

The write path is now centered around:

- `MutationTransactionCoordinator`
- `PageMutationService`
- `DocumentMutationService`
- supporting mutation helpers such as catalog and signature services

On iOS, the scan write path also includes:

- `ScanProcessingJobStore`
- `ScanProcessingJobRunner`
- `ScanProcessingTaskScheduler`

These types own persisted scan-job creation, stage progression, resume, and `BGContinuedProcessingTask` integration. Views observe scan-job state instead of owning the long-running task directly.

### Persistence Layer

Persistent state is stored in SwiftData models under `Core/Models/`.

The key product models are:

- `Document`
- `ScanPage`
- `DocumentFolder`
- `Tag`
- `Signature`
- `SignatureStamp`
- `ScanProcessingJob`
- `ScanProcessingJobPage`
- summary and job-support models included in the shared schema

Correctness-critical generated content now uses a revision-based freshness model instead of persisted stale flags.

### Platform Integration Layer

Apple frameworks are used directly, with minimal abstraction where needed:

- Vision and VisionKit
- Foundation Models
- PDFKit
- WidgetKit and ActivityKit
- AppIntents and CoreSpotlight
- EventKit and UserNotifications
- StoreKit 2
- CloudKit through runtime-selected SwiftData model configuration
- FirebaseCore and FirebaseAnalytics for app telemetry in supported builds

---

## Current Folder Structure

```text
Bricks Scan/
  Bricks_ScanApp.swift
  ContentView.swift

  Core/
    AppSettings.swift
    AppleRemindersService.swift
    BricksScanSchema.swift
    BricksScanShortcuts.swift
    CalendarService.swift
    DocumentAppIntents.swift
    DocumentEntity.swift
    DocumentEntityQuery.swift
    NotificationService.swift
    PDFImportOrigin.swift
    RecentSearchStore.swift
    Models/

  Foundation Models/
    AIConfiguration.swift
    AIGenerationService.swift
    DocumentSummaryMutationService.swift
    DocumentSummaryViewModel.swift
    DocumentSummaryViewModel+JobLifecycle.swift
    FoundationModelDiagnostics.swift
    IntelligenceService.swift
    SummaryCoverage.swift
    SummaryEditingService.swift
    SummaryGenerationJobStore.swift

  Image Processing/
    DocumentAutoCropService.swift
    DocumentAutoSortService.swift
    DocumentClassificationService.swift
    DocumentProcessingService.swift
    DocumentProcessingService+Persistence.swift
    DocumentProcessingService+ScanJobs.swift
    ImageEnhancementService.swift
    ImageProcessingService.swift
    OCRProcessor.swift
    PDFGenerator.swift
    PageRenderService.swift
    PerspectiveTransformService.swift
    PlatformTypes.swift
    InitialScanPipelineCoordinator.swift
    SignatureExtractionService.swift

  Managers/
    StoreKitManager.swift

  Services/
    AppInitializationService.swift
    CloudSyncConfiguration.swift
    MutationTransactionCoordinator.swift
    ScanProcessingJobStore.swift
    ScanProcessingJobRunner.swift
    ScanProcessingTaskScheduler.swift
    CloudSyncInboundService.swift
    CloudSyncPushService.swift
    CloudSyncStatusStore.swift
    SyncModeCoordinator.swift
    SpotlightIndexingService.swift
    SearchService.swift
    DocumentLifecycleService.swift
    DocumentMarkupService.swift
    DocumentSigningService.swift
    LocalDocumentPDFCache.swift
    ScanLiveActivityService.swift
    plus supporting stores and helpers

  Components/
  Views/
  SubViews/

BricksScanWidgets/
  BricksScanWidgets.swift
  BricksScanLiveActivity.swift
  AppIntent.swift
  BricksScanWidgetsBundle.swift

BricksScanTests/
  unit tests and test support
```

This is the current high-level structure in the repository. Older docs that mention files such as `AlertService.swift`, `DocumentMetadataView.swift`, `PageNavigatorView.swift`, or `ReorderPagesView.swift` are stale.

---

## Runtime Data Flow

### Scan To Document

The main user flow is:

```text
Capture or import pages
  -> validate limits
  -> create persisted ScanProcessingJob and source page artifacts
  -> preprocess pages
  -> OCR with per-page checkpoints
  -> create Document and ScanPage records
  -> generate searchable PDF
  -> run classification and Auto-Sort for the new document
  -> update Spotlight and widget state
  -> mark the scan job complete
```

On iOS, this flow is resumable. The job is persisted before heavy processing begins, each page stage checkpoints its output, and `BGContinuedProcessingTask` can resume the active job when the app moves out of the foreground.

Current iPhone navigation behavior:

- starting a new scan or import from the sidebar toolbar routes back to the document-list column first
- this keeps the user on `DocumentFolderView`, where the active scan job card is visible
- the app no longer relies on a blocking overlay to expose scan progress for persisted iOS scan jobs

On macOS, scan orchestration remains foreground-only and continues to use the existing coordinator-led flow.

### Query And Presentation

Views observe SwiftData and environment stores. They do not manually synchronize most UI after model writes.

Common pattern:

- fetch via `@Query`
- hold local transient UI state in `@State`
- use `@Environment` for shared stores such as settings, sync status, StoreKit, and workspace state
- delegate non-trivial logic to helper files or services

Current progress surfaces for scans:

- system continued-processing UI from `BGContinuedProcessingTask`
- Live Activity owned by `ScanProcessingJobRunner`
- compact inline card in `DocumentFolderView`

The old full-screen processing overlay still exists for some foreground-only flows such as document-detail page mutation, but it is not the primary UI for persisted iOS scan jobs.

### State Ownership

There is no single `AppState` type in Bricks Scan. Instead, app-level state is split across bounded observable stores and coordinators:

- `AppSettingsStore` for settings-backed preferences
- `SyncModeCoordinator` and `CloudSyncStatusStore` for sync availability and runtime mode
- `DocumentWorkspaceStateStore` for workspace state
- `ToastStore` for transient feedback
- focused screen logic such as `ContentViewLogic` and `DocumentViewLogic` for view-specific orchestration

Persistence writes are still expected to flow through mutation services and coordinators rather than directly from views.

### External Events

External events are routed rather than handled ad hoc:

- App Intents and Spotlight actions map into notifications or routed actions
- `ContentExternalEventRouter` and `ContentLaunchCoordinator` decide how the app responds
- Spotlight indexing is updated by lifecycle services

---

## Concurrency Model

### Main Rules

- SwiftUI view updates happen on the main actor.
- SwiftData mutations are treated as main-actor work.
- OCR, rendering, and some reconciliation work happen asynchronously off the main actor.
- Long-running user tasks are cancellation-aware when possible.

For iOS scan processing specifically:

- scan work is represented as one persisted `ScanProcessingJob`
- V1 supports one active scan-processing job at a time
- stage transitions are persisted so work can resume after expiration or relaunch
- `BGContinuedProcessingTask` is preferred for continued user-initiated scan processing
- `UIApplication.beginBackgroundTask` remains a short-window fallback, not the primary execution model

### Actor And Store Boundaries

The codebase uses a mix of:

- Swift actors for isolated processing services such as OCR and PDF work
- `@Observable` stores for app-wide mutable state
- explicit `Task` and `Task.detached` usage for background work

Key observable stores include:

- `AppSettingsStore`
- `StoreKitManager`
- `CloudSyncStatusStore`
- `SyncModeCoordinator`
- `DocumentWorkspaceStateStore`
- `ToastStore`

### Derived Data, Revisions, And Caching

The app relies on transient caches to avoid repeated heavy recomputation:

- `Document.pagesSortedByNumber`
- `Document.extractedText`
- `ThumbnailCache`
- `LocalDocumentPDFCache`

Canonical persisted revisions:

- `ScanPage.contentRevision`
- `ScanPage.ocrRevision`
- `ScanPage.summaryRevision`
- `Document.structureRevision`
- `Document.renderRevision`
- `Document.pdfRevision`

Freshness is defined by revision comparison:

- OCR is fresh when `ocrRevision == contentRevision`
- page summary is fresh when `summaryRevision == contentRevision`
- cached PDF is fresh when `pdfRevision == renderRevision`

Mutation callers should bump source revisions through the mutation services rather than manually toggling stale booleans or ad hoc cache flags.

---

## Persistence Model

## SwiftData Configuration

The app does not use a single hardcoded persistence configuration. It supports runtime local or cloud-backed modes.

Important files:

- `Bricks Scan/Bricks_ScanApp.swift`
- `Bricks Scan/Services/CloudSyncConfiguration.swift`
- `Bricks Scan/Services/SyncModeCoordinator.swift`

`CloudSyncConfiguration` centralizes:

- CloudKit container identifier
- App Group identifier
- local and cloud store filenames
- model configuration building
- store URL construction

`SyncModeCoordinator` resolves whether the app should launch with:

- local storage only
- cloud-backed storage
- recovery or degraded sync states

---

## Write-Path Architecture

### Mutation Boundary

The app now treats document and page mutations as application-layer operations, not view concerns.

Main write-path services:

- `Bricks Scan/Services/PageMutationService.swift`
- `Bricks Scan/Services/DocumentMutationService.swift`
- `Bricks Scan/Services/CatalogMutationService.swift`
- `Bricks Scan/Services/SignatureMutationService.swift`
- `Bricks Scan/Services/MutationTransactionCoordinator.swift`

The standard mutation contract is:

```text
validate/load target
  -> mutate model state
  -> bump canonical revisions
  -> invalidate derived caches
  -> save once
  -> mark sync queue once
  -> optionally schedule CloudKit push
```

### Scan Job Boundary

New scans on iOS now cross an additional application-layer boundary before document creation.

The scan-job contract is:

```text
persist source artifacts
  -> run resumable stage executors
  -> checkpoint progress after each meaningful boundary
  -> assemble Document and ScanPage records once prerequisites exist
  -> run best-effort PDF generation
  -> run classification and Auto-Sort for the new document only
  -> update Spotlight and widget state
  -> publish completion or warnings
```

This keeps scan truth out of `ContentView` state and makes continued processing resumable and testable.

### Revision Rules

Source revision rules used by the checked-in code:

- bump `ScanPage.contentRevision` for page-content changes that affect OCR or page-summary meaning
- bump `Document.structureRevision` for add, remove, or reorder page operations

---

## Related Docs

- Overview: [../product/overview.md](../product/overview.md)
- Development guide: [./dev-guide.md](./dev-guide.md)
- Quick reference: [./quick-reference.md](./quick-reference.md)
- Support runbook: [../operations/support-runbook.md](../operations/support-runbook.md)
- bump `Document.renderRevision` for any change that affects rendered/exported output
- set `ScanPage.ocrRevision` only after OCR completes for the current page content
- set `ScanPage.summaryRevision` only after summary output is current for the page
- set `Document.pdfRevision` only after PDF output is regenerated for the current render state

### Summary Job Freshness

`SummaryGenerationJob` now persists the source revision snapshot it was built from. Persisted summary jobs are reusable only when that stored revision snapshot still matches the current document state.

### Scan Job Freshness And Resume

`ScanProcessingJob` persists stage and progress state separately from `Document`.

Important scan-job guarantees in the checked-in code:

- source page files are persisted before long-running work begins
- prepared page output is checkpointed per page
- OCR output is checkpointed per page and can resume without restarting the whole job
- document assembly is idempotent once `documentID` exists
- searchable PDF generation is best-effort and can complete with warnings
- classification and Auto-Sort run only for the newly scanned document

### Cloud Behavior

Cloud sync is not documented accurately as "SwiftData handles everything automatically". SwiftData provides the persistence transport, but the app also has explicit logic for:

- availability checks
- local-vs-cloud mode transitions
- history reconciliation
- duplicate resolution
- sync health reporting
- conflict review UI

This matters when changing schema, store configuration, or launch behavior.

---

## Core Models

## `Document`

`Document` is the central model.

Current persisted responsibilities include:

- title
- created and modified dates
- many-to-many folder relationship
- many-to-many tag relationship
- one-to-many page relationship
- metadata dictionary
- AI summary
- pinning and trash state
- widget update support

Important transient responsibilities include:

- cached extracted text
- cached sorted pages
- structured OCR context
- in-flight enrichment state

Important constants:

```swift
Document.maxDocumentsLimit   // 40
Document.maxPagesPerDocument // 300
```

Important helpers:

- `pagesSortedByNumber`
- `firstPage`
- `remainingPageCapacity`
- `appendPages(...)`
- `invalidatePageOrderingCaches()`
- `invalidateExtractedTextCache()`
- `combinedPageNotes`

## `ScanPage`

`ScanPage` represents one page in a document and carries both persisted content and render metadata.

Key fields include:

- `pageNumber`
- `imageData`
- `originalImageData`
- `pageText`
- `ocrTextSpansData`
- `pageNotes`
- `rotationDegrees`
- crop and suggested crop rect storage
- `aiSummary`
- `contentRevision`
- `ocrRevision`
- `summaryRevision`
- annotation drawing data and revision counters
- signature relationship

Important transient helpers include:

- `ocrTextSpans`
- `renderSourceImageData`
- `signatureStampRenderData`
- `cropRectNormalized`
- `suggestedCropRectNormalized`

This model is what enables non-destructive editing, render-time composition, and searchable highlighting.

## `ScanProcessingJob`

`ScanProcessingJob` is the persisted orchestration record for iOS scan processing.

Current persisted responsibilities include:

- job identity and timestamps
- source type and iOS scope
- current state and stage
- progress counts and status message
- `documentID` once assembly completes
- requested title, imported filename, and origin folder context
- policy snapshot for classification and Auto-Sort behavior
- failure message and warning messages
- attempt and resume metadata

Current state cases:

- `queued`
- `running`
- `paused`
- `completed`
- `completedWithWarnings`
- `failed`
- `cancelled`

Current stage cases:

- `captured`
- `preprocessing`
- `ocr`
- `documentAssembly`
- `pdfGeneration`
- `classification`
- `organizationApply`
- `indexing`
- `completed`

## `ScanProcessingJobPage`

`ScanProcessingJobPage` stores persisted page inputs and per-page progress for a `ScanProcessingJob`.

Key fields include:

- `pageNumber`
- original source file URL
- prepared image file URL
- OCR text
- OCR span payload data
- semantic hints payload
- crop decision
- page stage markers used for resume

This model is what lets the app continue a scan without depending on transient in-memory `PlatformImage` state.

## `DocumentFolder`

`DocumentFolder` is used for both user-created folders and built-in smart folders.

Current built-in system folders are:

- `allDocuments`
- `pastWeek`
- `trash`

System-folder identity is stabilized through `systemFolderID`, not only by localized names.

Important fields include:

- `name`
- `createdDate`
- `documents`
- `icon`
- `colorName`
- `isSystemList`
- `systemFolderID`
- `autoAddTags`
- `isPinned`

Important behaviors:

- `createDefaultSystemFolders(in:)`
- `createDefaultUserFolders(in:)`
- `filteredDocuments(from:)`

Older references to system folders such as `Today` or `Starred` are stale for the current codebase.

## `Tag`

`Tag` models classification labels.

Built-in stable defaults are:

- invoice
- receipt
- contract
- idPassport
- medical
- others

Important fields include:

- `name`
- `classificationKeywords`
- `displayOrder`
- `isSystemDefault`
- `systemDefaultID`
- `icon`
- `colorName`
- inverse `documents`

Important behaviors:

- `createDefaultTags(in:)`
- `markDefaultAsDeleted(_:)`
- `isSmartTag`

Important constant:

```swift
Tag.maxTagsLimit // 20
```

---

## Relationships

Current primary relationships:

| Relationship | Cardinality | Delete Rule |
|---|---|---|
| `Document -> ScanPage` | one-to-many | cascade |
| `Document <-> DocumentFolder` | many-to-many | nullify |
| `Document <-> Tag` | many-to-many | nullify |
| `ScanPage -> SignatureStamp` | one-to-many | cascade |

The delete rules are important because lifecycle services depend on them for predictable cleanup.

---

## Initialization And Seeding

`AppInitializationService.initializeApp(modelContext:)` is responsible for idempotent startup seeding and maintenance.

Current startup concerns include:

- ensuring default system folders exist
- ensuring default user folders exist when appropriate
- ensuring default tags exist
- startup recovery and maintenance work for Spotlight and cleanup paths

Do not duplicate startup seeding logic inside views.

---

## Validation And Limits

All user-entered names and most write operations should route through `ValidationRules`.

Important current limits:

```swift
ValidationConstants.maxTitleLength     // 200
ValidationConstants.maxNameLength      // 100
ValidationConstants.maxNotesLength     // 10000
ValidationConstants.maxKeywordsLength  // 500
ValidationConstants.maxKeywordLength   // 50

Document.maxDocumentsLimit             // 40
Document.maxPagesPerDocument           // 300
Tag.maxTagsLimit                       // 20
DocumentFolder.maxFoldersLimit         // 20
Signature.maxSignaturesLimit           // 2
```

Validation examples:

```swift
ValidationRules.validateDocumentTitle(title)
ValidationRules.validateFolderName(name, existingNames: names)
ValidationRules.validateDocumentTypeName(name, existingNames: names) // used for tag and document-type names
ValidationRules.validateNotes(notes)
ValidationRules.validateScanImages(imageCount: count, currentDocumentCount: currentCount)
```

---

## Design Rules For Contributors

When changing architecture or models:

- keep views thin
- add shared logic to services or view logic helpers
- prefer stable IDs over localized-name identity for built-in records
- preserve non-destructive page editing semantics
- update cache invalidation when rendered page state changes
- review sync and launch behavior before changing persistence assumptions

---

## Key Files

- `Bricks Scan/Bricks_ScanApp.swift`
- `Bricks Scan/Core/Models/Document.swift`
- `Bricks Scan/Core/Models/ScanPage.swift`
- `Bricks Scan/Core/Models/DocumentFolder.swift`
- `Bricks Scan/Core/Models/Tag.swift`
- `Bricks Scan/Services/CloudSyncConfiguration.swift`
- `Bricks Scan/Services/SyncModeCoordinator.swift`
- `Bricks Scan/Services/AppInitializationService.swift`
- `Bricks Scan/Image Processing/DocumentProcessingService.swift`
