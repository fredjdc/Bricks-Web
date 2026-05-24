---
title: Bricks Scan Implementation Details
doc_id: bricks-scan-engineering-implementation-details
doc_type: engineering
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - implementation
---

# Technical Implementation

This document describes the current implementation of Bricks Scan's two deepest technical areas:

1. Foundation Models and document intelligence
2. The scan, OCR, render, and export pipeline

It is intentionally implementation-first. Examples and terminology here are aligned to the checked-in code, not a generic tutorial.

---

## Foundation Models

### Current Design

The Foundation Models stack lives in `Bricks Scan/Foundation Models/` and is split into distinct responsibilities:

- `AIConfiguration.swift`
  Central source of truth for availability checks, personas, prompts, output rules, and generation options.
- `AIGenerationService.swift`
  Low-level text and structured generation wrapper around `LanguageModelSession`.
- `IntelligenceService.swift`
  Product-facing intelligence layer for classification and metadata extraction, with heuristic fallbacks.
- `DocumentSummaryViewModel.swift`
  UI-facing summary generation state and task orchestration.
- `SummaryEditingService.swift`
  Summary editing helpers and persistence support.
- `SummaryGenerationJobStore.swift` and `SummaryCoverage.swift`
  Support chunked summary workflows and coverage state.

### Availability Model

The app does not assume Foundation Models is always available. Availability is centralized in `AIConfiguration`:

```swift
static var status: SystemLanguageModel.Availability {
    SystemLanguageModel.default.availability
}

static var isAvailable: Bool {
    status == .available
}
```

User-facing messaging is also centralized there. Views should use those helpers instead of duplicating availability logic.

### Generation Layer

`AIGenerationService` is the reusable wrapper over `LanguageModelSession`. It provides:

- `generateText(...)`
  Streams internally and returns final accumulated text.
- `generateStructured(...)`
  Uses `respond(to:generating:)` with `@Generable` output types.
- `generateTextStreaming(...)`
  Returns a cancellable task for live UI updates.

Important implementation details:

- Prompts are validated before generation.
- Availability is checked on the main actor.
- `LanguageModelSession.GenerationError` values are mapped into app-specific `GenerationError`.
- Streaming snapshots use `snapshot.content`, not placeholder APIs.
- Cancellation is explicitly supported and surfaced.

### Prompting Strategy

Prompting is centralized in `AIConfiguration` rather than embedded in views or services. The configuration layer defines:

- output language handling based on the user's preferred locale
- evidence-only rules
- concise style rules
- strict output contracts
- separate personas for summary, title, folder, and tag tasks

This keeps generation behavior stable and avoids drift between features.

### Product Behavior

Foundation Models is used selectively, not for every document operation.

Current AI-backed or AI-assisted paths include:

- title generation
- document summaries
- metadata extraction
- single-label classification
- folder and tag suggestions in the auto-organization system

When Foundation Models is unavailable or a request fails with known model limitations, the app falls back to deterministic logic where possible.

### Fallback Strategy

`IntelligenceService` is the main fallback boundary.

Examples:

- classification falls back to keyword scoring against `Tag.classificationKeywords`
- metadata extraction falls back to regex-based extraction
- unsupported language, guardrail failures, and context window overflow all route to non-LLM behavior when available

This is deliberate. Bricks Scan is designed so intelligence improves the experience, but does not block the core scanning product.

### Summary Generation Model

Summary generation is more structured than a single prompt call:

- page and document summaries can be tracked independently
- summary coverage is stored so the UI can reflect whether content is stale or partial
- geometry edits such as crop or rotation advance page content revisions
- summary editing is treated as a first-class workflow, not just disposable generated text

The checked-in implementation now uses revision comparisons instead of persisted stale flags:

- page OCR freshness: `ocrRevision == contentRevision`
- page summary freshness: `summaryRevision == contentRevision`
- document PDF freshness: `pdfRevision == renderRevision`

Persisted summary jobs also store the source revision snapshot they were generated from. Reuse is allowed only when that snapshot still matches the current document state.

### Error Handling Rules

Use `AIGenerationService.userFacingMessage(for:)` when surfacing model errors to users. This preserves consistent language across the app.

Known handled cases include:

- unavailable
- empty prompt
- no text detected
- cancelled
- exceeded context window size
- guardrail violation
- unsupported language or locale

### Foundation Models Checklist

Before adding a new AI feature:

- add prompt and persona rules to `AIConfiguration`
- route model calls through `AIGenerationService`
- keep UI state and task lifecycle in a view model or view logic helper
- define deterministic fallback behavior if the feature affects core workflows
- avoid storing transient generation state in persistent models unless it is product data

---

## Scan And Processing Pipeline

### High-Level Flow

The main scan flow starts in the UI, moves through the processing pipeline, persists to SwiftData, then continues with non-blocking enrichment:

```text
Scanner / import UI
  -> validation
  -> InitialScanPipelineCoordinator
  -> DocumentProcessingService
  -> mutation transaction commit
  -> Spotlight indexing
  -> background classification / metadata / auto-organization
```

### Entry Points

The app supports multiple capture and import paths:

- iOS document camera via `VNDocumentCameraViewController`
- photo picker import
- macOS Continuity Camera
- file and image import flows on desktop-style surfaces
- PDF import through `PDFImportService`

Regardless of entry point, the goal is to normalize content into the same processing model rather than maintaining separate document creation implementations.

### Initial Coordination

`InitialScanPipelineCoordinator` is the entry seam for the initial scan flow. It coordinates:

- pipeline setup
- progress reporting
- routing of results back to UI state
- separation between orchestration and the lower-level processing services

This keeps `ContentView` and onboarding surfaces from owning document-processing internals directly.

### DocumentProcessingService Responsibilities

`DocumentProcessingService` is the main processing orchestrator. It is responsible for:

- image preparation and normalization
- auto-crop and enhancement decisions
- sequential OCR processing
- page creation
- searchable PDF generation
- append-page workflows for existing documents
- progress updates and cancellation-aware control flow

It does not own all low-level image work itself. Specialized services are delegated for OCR, rendering, cropping, classification, PDF generation, and export.

Persistence-sensitive edits are now expected to commit through the shared mutation transaction pattern instead of each caller manually performing:

- model mutation
- stale-flag toggles
- `ModelContext.save()`
- sync queue mutation
- CloudKit push scheduling

### Why OCR Is Sequential

OCR is intentionally processed in a memory-conscious way. Large image batches can spike memory if recognition is parallelized aggressively, especially on lower-memory devices.

That is why the codebase favors:

- bounded preprocessing
- downsampling based on `ScanResolution`
- sequential OCR for large page batches
- explicit cache invalidation when page content changes

### Page Representation

`ScanPage` stores both current render data and the original source bytes when available:

- `imageData`
  compressed working image data
- `originalImageData`
  preserved original bytes for non-destructive rendering
- `rotationDegrees`
  rotation metadata instead of destructive rewrites where possible
- normalized crop rect fields
- OCR text and OCR span persistence
- annotation and signature state

This is what makes non-destructive rendering, export, markup, and reprocessing possible without flattening every edit into the source image immediately.

### Rendering Model

Rendering is split from persistence:

- `PageRenderService`
  produces render-ready page output for thumbnails, exports, and previews
- `PlatformTypes.swift`
  abstracts platform image handling and contains `ThumbnailCache`
- `LocalDocumentPDFCache`
  caches generated PDF data outside the model itself

When page geometry or overlays change, the code advances render revisions and invalidates relevant caches instead of relying on persisted stale flags.

### OCR Model

`OCRProcessor` uses Vision for text recognition and persists:

- page-level text
- OCR span geometry for visual search and highlighting
- structured OCR hints used downstream by intelligence features

`Document.extractedText` is computed from ordered page text and cached transiently. It is not duplicated as an always-persisted aggregate field.

OCR refresh should be driven by revision comparisons. The current rule is to regenerate only pages where `ocrRevision < contentRevision`.

### PDF And Export

`PDFGenerator` handles:

- searchable PDF generation
- OCR text embedding
- per-page export
- export security options
- text, image, and HTML export helpers used by the export sheet

The export UI in `ExportSheetView.swift` supports:

- PDF
- JPEG
- text
- HTML

Export behavior is controlled by a mix of per-export options and persistent settings in `AppSettings`.

PDF regeneration should be driven by `pdfRevision < renderRevision`, not by manually maintained PDF stale flags.

### Classification And Organization

After a document is created, enrichment can continue in the background:

- `DocumentClassificationService`
  applies tags and metadata extraction
- `KeywordExtractionService`
  supports retrieval and suggestion paths
- `DocumentAutoSortService`
  decides folder and tag application under the current organization policy
- `AutoOrganizationLearningService`
  records and learns from user actions

This work is intentionally decoupled from the minimum scan-to-document path so the app can show documents quickly even if enrichment is still running.

### Search And Indexing

Search is multi-layered:

- in-app search through `SearchService`
- Spotlight indexing through `SpotlightIndexingService`
- App Intents and entities through `DocumentEntity`, `DocumentEntityQuery`, and `DocumentAppIntents`

Document lifecycle operations update indexing as documents are created, updated, trashed, or removed.

### Sync And Conflict Handling

The app does not rely on a single always-on CloudKit store configuration. The runtime sync model is explicit:

- `SyncStoreMode` chooses the active runtime persistence mode
- `CloudSyncConfiguration` builds the correct `ModelConfiguration`
- `SyncModeCoordinator` resolves launch mode
- `CloudSyncInboundService` applies pulled records into local SwiftData
- `CloudSyncPushService` flushes queued outbound operations
- `MutationTransactionCoordinator` centralizes persistence and push scheduling for local writes
- `CloudSyncStatusStore` exposes sync health and status to the UI

This is more advanced than "SwiftData with CloudKit turned on". The app explicitly manages degraded and recovery states.

### App Launch Integration

`Bricks_ScanApp` is responsible for:

- resolving launch state
- creating the active `ModelContainer`
- injecting observable stores into the environment
- running startup maintenance
- scheduling history reconciliation and conflict resolution
- retrying local or cloud container initialization when sync state changes

That means technical docs should treat startup and persistence configuration as part of the app architecture, not just a one-line `modelContainer(...)` detail.

---

## Practical Guidance

### If You Add A New Scan Feature

- route capture output into the existing processing coordinator
- reuse `ValidationRules` for page and document limits
- preserve the non-destructive page model when adding geometry or overlay edits
- update cache invalidation if the feature changes rendered page output

### If You Add A New AI Feature

- add prompt contracts in `AIConfiguration`
- use `AIGenerationService`
- define fallback behavior
- keep model writes separate from generation code where possible

### If You Add A New Export Or Render Path

- prefer extending `PageRenderService` or `PDFGenerator`
- avoid duplicating image conversion logic in views
- respect `ScanPage` geometry, annotations, signatures, and OCR settings

### If You Change Persistence Or Sync

- review `Bricks_ScanApp.swift`
- review `CloudSyncConfiguration.swift`
- review `SyncModeCoordinator.swift`
- review reconciliation and conflict services before changing store behavior

---

## File Map

Primary files for this document:

- `Bricks Scan/Foundation Models/AIConfiguration.swift`
- `Bricks Scan/Foundation Models/AIGenerationService.swift`
- `Bricks Scan/Foundation Models/IntelligenceService.swift`
- `Bricks Scan/Foundation Models/DocumentSummaryViewModel.swift`
- `Bricks Scan/Image Processing/DocumentProcessingService.swift`
- `Bricks Scan/Image Processing/OCRProcessor.swift`
- `Bricks Scan/Image Processing/PDFGenerator.swift`
- `Bricks Scan/Image Processing/PageRenderService.swift`
- `Bricks Scan/Image Processing/InitialScanPipelineCoordinator.swift`
- `Bricks Scan/Services/CloudSyncConfiguration.swift`
- `Bricks Scan/Services/SyncModeCoordinator.swift`
- `Bricks Scan/Bricks_ScanApp.swift`

---

## Auto-Organization

### Overview

Auto-organization is split across three assignment sources:

1. Origin folder assignment
2. Smart-rule assignment
3. Foundation Models suggestion collection and optional auto-apply

These sources run in different parts of the processing pipeline and do not share one combined step.

Important execution split: new scans on iOS run classification and Auto-Sort inside a persisted `ScanProcessingJob`. Existing document reprocessing and manual reapply flows still use the document enrichment path in `DocumentProcessingService`. Auto-Sort policy is shared, but orchestration is no longer owned by one runtime path.

### Settings and Modes

**Main settings file:** `Bricks Scan/Core/AppSettings.swift`

Auto-organization behavior is controlled by `OrganizationMode`:

| Mode | Behavior |
|------|----------|
| `.off` | FM suggestions are not collected or applied |
| `.suggestOnly` | FM suggestions are collected and persisted, but not applied |
| `.autoApply` | FM suggestions are collected and eligible assignments are applied |

Strictness is controlled by `OrganizationStrictness`:

| Strictness | `minimumAutoApplyConfidence` | `minimumFolderAutoApplyConfidence` |
|------------|-------------------------------|------------------------------------|
| `.precise` | `0.74` | `0.58` |
| `.balanced` | `0.58` | `0.38` |
| `.flexible` | `0.42` | `0.24` |

### Assignment Sources

**Origin folder** — `ContentViewLogic` derives `originFolder` from a selected non-system folder. On iOS it is persisted into `ScanProcessingJob`. On macOS, `InitialScanPipelineCoordinator` passes the folder into `DocumentProcessingService.processDocument(...)`. Assignment happens before post-save enrichment. `OrganizationMode` does not gate this path.

**Smart rules** — `DocumentAutoAssignmentService.applyAutoRules(...)` matches tags with `hasAutoKeywords` against `smartRuleAnalysisText(...)`. Matching tags and folders are appended only if not already present. Smart-rule assignment suppresses FM auto-apply for the same category in the same enrichment run.

**Foundation Models** — `DocumentAutoAssignmentService.performAutoOrganization(...)` returns immediately if `AIConfiguration.isAvailable` is false or `organizationMode` is `.off`. Tags are requested with a limit of 2. Folder limit is 1 in `.autoApply`, 3 in `.suggestOnly`. Auto-apply is append-only — existing manual assignments are never cleared.

**No-readable-text fallback** — `applyNoReadableTextFallback(...)` currently preserves all existing assignments and does not auto-assign. It is effectively a "do not mutate organization when unreadable" safeguard.

### iOS Scan Job Pipeline

Stage order in `ScanProcessingJobRunner`:

1. `preprocessing`
2. `ocr`
3. `documentAssembly`
4. `pdfGeneration`
5. `classification`
6. `organizationApply`
7. `indexing`
8. `completed`

### Document Enrichment Pipeline

Stage order in `runPostSaveEnrichment(...)`:

1. Optional stale OCR refresh
2. Legible-text check
3. Metadata extraction (`DocumentClassificationService.extractMetadata(...)`)
4. Smart-rule assignment (`DocumentAutoAssignmentService.applyAutoRules(...)`)
5. FM suggestion collection or auto-apply (`DocumentAutoAssignmentService.performAutoOrganization(...)`)
6. Optional title generation when `renameMode == .aiIfDefaultTitle`
7. Save via `commitEnrichmentChanges(...)`
8. Spotlight update

This path still handles manual reapply, enrichment retries, and compatibility with enrichment-phase UI.

### Persisted Suggestion Metadata

`AutoOrganizationLearningService.writeProvenance(...)` stores FM output in document metadata keys:

- `auto.tagCandidates`, `auto.folderCandidates`
- `auto.tagSignals`, `auto.folderSignals`
- `auto.previousTags`, `auto.previousFolders`
- `auto.assignedAt`, `auto.keepDismissedAt`

### Suggestion UI

`OrganizationView` reads persisted FM suggestions through `AutoOrganizationLearningService` instead of calling suggestion services directly. `DocumentViewLogic` uses persisted timestamps and dismissal state for correction-chip visibility — chips are visible for 24 hours after `assignedDate` and hidden when `auto.keepDismissedAt` is present.

### Queue and Cancellation

On iOS, new scan processing is serialized through `ScanProcessingJobStore` and `ScanProcessingTaskScheduler`. V1 supports one active job at a time. Additional jobs can be persisted as queued. `BGContinuedProcessingTask` handles foreground-to-background continuation.

`DocumentProcessingService` serializes enrichment through the private `EnrichmentCoordinator`. Only one document runs at a time; later documents move to `queued`. If the running document is re-enqueued, the running task is canceled and the new record prioritized.

`DocumentLifecycleService` cancels enrichment before trash and permanent delete operations.

### Key Files — Auto-Organization

- `Bricks Scan/Core/AppSettings.swift`
- `Bricks Scan/Image Processing/DocumentAutoSortService.swift`
- `Bricks Scan/Image Processing/DocumentProcessingService.swift`
- `Bricks Scan/Image Processing/DocumentProcessingService+ScanJobs.swift`
- `Bricks Scan/Services/AutoOrganizationLearningService.swift`
- `Bricks Scan/Services/AutoOrganizationActionLogService.swift`
- `Bricks Scan/Services/DocumentLifecycleService.swift`
- `Bricks Scan/Services/ScanProcessingJobRunner.swift`
- `Bricks Scan/Views/OrganizationView.swift`

---

## CloudSync

### Executive Summary

Bricks Scan uses one always-local SwiftData store and one opt-in custom CloudKit replication layer. There is no CloudKit-backed SwiftData store switching. The local SwiftData store is the source of truth. CloudKit is a replication target that activates only after the user explicitly enables iCloud Sync.

Design priorities:
- Local data is authoritative. No upload happens before explicit opt-in.
- Sync failures degrade safely to local-only behavior instead of crashing.
- Retry and recovery are durable across app relaunches.

### Architecture

```text
SwiftUI / app lifecycle / settings
  -> SyncModeCoordinator + CloudSyncStatusStore
  -> mutation services + transaction coordinator
  -> CloudSyncSyncService
      -> CloudSyncPullService
      -> CloudSyncPushService
  -> local sync queue + fetch state in SwiftData
  -> CloudKit private database custom zone
```

The app writes to SwiftData first through centralized mutation boundaries. Sync happens later and independently. There is no second database, no store migration, and no history replay.

### Main Components

- `SyncModeCoordinator` — owns the user's sync preference and runtime sync state
- `CloudSyncStatusStore` — owns user-facing iCloud/network health state
- `CloudSyncSyncService` — orchestrates one coalesced pull+push sync cycle (the only entry point)
- `CloudSyncPullService` / `CloudSyncPushService` — inbound fetch and outbound send
- `CloudSyncInboundService` — applies fetched CloudKit records into local SwiftData
- `CloudSyncConflictPolicy` — centralizes inbound conflict decisions
- `SyncRecordStateService` — queue state mutation, ordering, retry scheduling
- `FolderSyncMutationService` — centralizes sync queue mutations for folder mutations
- `CloudSyncRecordMapper` — converts SwiftData models into CloudKit records and stable IDs
- `CloudSyncBootstrapService` — queues the full local library for upload on first enable
- `CloudSyncRetryPolicy` — centralized exponential backoff logic

Normal product features must not call sync services directly from SwiftUI. Route through `DocumentMutationService`, `PageMutationService`, `CatalogMutationService`, or `FolderSyncMutationService`, which enqueue sync work during commit.

### Data Model

Product models mirrored to CloudKit: `Document`, `ScanPage`, `Tag`, `DocumentFolder` (user-created only), `Signature`, `SignatureStamp`.

Sync support models stored locally only: `SyncRecordState` (per-record outbound queue state), `CloudSyncFetchState` (singleton inbound fetch token and retry state).

### CloudKit Shape

- Private database, custom zone (`BricksScanSyncZone`)
- Record types: `Document`, `ScanPage`, `Tag`, `DocumentFolder`, `Signature`, `SignatureStamp`
- Record names: stable, derived from local UUIDs (e.g., `Document.<uuid>`)
- Relationships stored as UUID strings on records, not graph snapshots
- Binary data (images, OCR spans, annotation drawing, signatures) uploaded as `CKAsset`s
- System folders (`Documents`, `Past Week`, `Trash`) are local-only — never synced

### Production Schema Requirement

The custom sync layer does not use the legacy SwiftData CloudKit schema (`CD_*` types). The app expects plain custom record types listed above.

If CloudKit Production only contains `CD_*` types, uploads fail with errors like `Cannot create new type Tag in production schema`. This is a schema mismatch, not a queue bug.

**Operational rule:**
- Leave existing `CD_*` production types in place — do not delete them
- Deploy the plain custom record types in addition to the legacy ones
- Use the merged import file: `Documentation/cloudkit-production-merged-import.ckdb`

> **Note:** The `.ckdb` import files remain in `Bricks-Scan/Documentation/` alongside `cloudkit-production.ckdb`. Do not delete those files.

### Sync Lifecycle

**Enable** — validates iCloud account → ensures CloudKit subscription → bootstraps full library → runs pull+push cycles until initial drain completes.

**Local mutation flow** — feature service writes to SwiftData → marks affected graph in `SyncRecordState` → requests best-effort sync.

**Remote change (iOS)** — CloudKit silent push → `CloudSyncSubscriptionService` verifies → posts internal notification → `Bricks_ScanApp` calls `CloudSyncSyncService.syncNow(...)`.

> macOS push wake-up is not implemented. macOS syncs on launch, foreground activation, enable-sync bootstrap, and manual refresh.

**Account change** — stored inbound fetch state is reset, `SyncModeCoordinator` refreshes availability, subscription is re-armed if account is available.

### Outbound Sync

Queue is explicit in `SyncRecordState`. It does not depend on SwiftData history replay or object graph diffing. Outbound retries use persisted exponential backoff — retry state is stored in SwiftData and survives app relaunches.

### Inbound Sync

Uses `CKFetchRecordZoneChangesOperation` for incremental remote updates. Inbound token (`CKServerChangeToken`) is persisted in `CloudSyncFetchStateService`. The applier tolerates out-of-order CloudKit delivery — related records that arrive in different batches are linked later.

### Conflict Policy

`CloudSyncConflictPolicy` uses two layers: deterministic rules for known-safe cases, and a preservation fallback for ambiguous concurrent edits.

Deterministic rules:
- `Document` — `modifiedDate` as primary tie-breaker
- `ScanPage` — `annotationRevision` + `signatureRevision` pair
- `Tag`, `DocumentFolder` — last writer wins; remote delete wins
- `Signature` — `modifiedDate` tie-breaker

Preservation fallback: if unsynced local work exists for `Document`, `ScanPage`, `Signature`, or `SignatureStamp` and the remote change would overwrite it, the system duplicates the local document graph, names the duplicate `Conflicted Version`, and applies the remote winner to the original. `Conflicted Version` duplicates are expected behavior, not corruption.

### Diagnostics

Hidden diagnostics screen: Settings → Preferences → iCloud → tap the sync status row 7 times. Shows pending/synced/failed outbound rows, fetch-state metadata, retry counts, and row-level error messages. `CloudSyncDiagnosticsFormatter` rewrites known CloudKit schema failures into actionable messages.

### If Something Goes Wrong

**Local edits not uploading** — check `SyncModeCoordinator` is enabled, `SyncRecordState` has pending rows, `nextRetryAt` is not blocking, app is not in `degradedUnavailable`, `CloudSyncPushService` `lastErrorMessage`.

**Remote changes not arriving** — check `CloudSyncFetchState` retry delay, CloudKit subscription present, iOS remote notifications delivered, whether fetch state was reset after account change.

**Deletes incorrect** — check tombstones were queued through `SyncQueueMutationService`, reached CloudKit through `CloudSyncPushService`, came back through `CloudSyncPullService`, were handled in `CloudSyncInboundService.applyDelete(...)`.

### Known Limitations

1. macOS push wake-up not implemented yet
2. Conflict handling works at document-graph level — no per-field merge UI
3. No specialized classification of transient vs permanent CloudKit errors yet

### Extending CloudSync

**To add a new synced model:** add to `SyncTrackedRecordType` → `SyncQueueMutationService` → `CloudSyncRecordMapper` → `CloudSyncOutboundService` → `CloudSyncInboundService` → add tests.

**To improve conflict handling:** work in `CloudSyncConflictPolicy` then `CloudSyncInboundService`. Keep `Conflicted Version` as the safety net.

**To add macOS push wake-up:** do not change the core queue model. Add app-specific CloudKit push handling that posts the same `cloudSyncDidReceiveRemoteChange` notification already used on iOS. `CloudSyncSyncService` remains the sync entry point.

### Key Files — CloudSync

- `Bricks Scan/Bricks_ScanApp.swift`
- `Bricks Scan/Services/CloudSyncSyncService.swift`
- `Bricks Scan/Services/CloudSyncPullService.swift`
- `Bricks Scan/Services/CloudSyncPushService.swift`
- `Bricks Scan/Services/CloudSyncInboundService.swift`
- `Bricks Scan/Services/CloudSyncConflictPolicy.swift`
- `Bricks Scan/Services/SyncRecordStateService.swift`
- `Bricks Scan/Services/SyncModeCoordinator.swift`
- `Bricks Scan/Services/CloudSyncConfiguration.swift`
- `Bricks Scan/Services/CloudSyncRetryPolicy.swift`
- `Bricks Scan/Services/CloudSyncBootstrapService.swift`
