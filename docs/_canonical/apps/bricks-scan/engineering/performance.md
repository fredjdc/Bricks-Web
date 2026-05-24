---
title: Bricks Scan Performance
doc_id: bricks-scan-engineering-performance
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
  - performance
---

# Performance Analysis — Scan → Document View Pipeline

> **Scope:** Scanning / importing through to Document View display  
> **Excluded:** Auto-Sort, classification enrichment  
> **Date:** 2026-03-08  
> **Status:** Reference document — verified against codebase

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Non-Destructive Editing Architecture](#2-non-destructive-editing-architecture)
3. [Findings — High Impact](#3-findings--high-impact)
4. [Findings — Medium Impact](#4-findings--medium-impact)
5. [Findings — Low Impact](#5-findings--low-impact)
6. [Retracted Findings](#6-retracted-findings)
7. [Summary Table](#7-summary-table)
8. [Implementation Priority Order](#8-implementation-priority-order)

---

## 1. Pipeline Overview

```
ScannerView (VNDocumentCameraViewController)
  └─ extractImages() → [UIImage]                         ← all pages extracted before handoff
       └─ ContentViewLogic.processScannedImages()
            └─ InitialScanPipelineCoordinator.run()
                 │
                 ├─ DocumentProcessingService.prepareImagesForPipeline()   ← SEQUENTIAL
                 │     └─ per image (one at a time):
                 │           ImageEnhancementService.enhanceImageWithAutoCropSuggestion()
                 │             ├─ Auto-level / contrast / shadow removal (CoreImage)
                 │             ├─ Vision rectangle detection (1400px downsampled)
                 │             └─ Vision saliency crop (1200px downsampled)
                 │           JPEG encode × 2 → storedImageData + originalImageData  ← SAME BYTES
                 │
                 ├─ DocumentProcessingService.processImagesWithProgress()  ← SEQUENTIAL OCR
                 │     └─ per page (one at a time):
                 │           OCRProcessor.processCGImage()
                 │             ├─ VNRecognizeTextRequest (accurate)
                 │             └─ RecognizeDocumentsRequest (fast engine)
                 │
                 ├─ PDFGenerator.generatePDF(cgImages: preparedPages.map(\.ocrCGImage))
                 │     └─ All CGImages materialized simultaneously ← peak memory risk
                 │
                 ├─ ModelContext.save()                           ← persists doubled image data
                 │
                 └─ SpotlightIndexingService (fire-and-forget Task)
                       ↓
              DocumentView
                   └─ PageThumbnailView → ThumbnailCache.image()   ← cache HIT (already implemented)
                         └─ on miss: PageRenderService.renderCGImage()
                               (decode → enhance → rotate → crop → sigatures → markup → downsample)
```

**Key architectural facts:**
- Enhancement and OCR are both **sequential** by deliberate design for memory safety on 4 GB devices.
- The non-destructive render pipeline (`PageRenderService`) never modifies source image bytes.
- `ThumbnailCache` already provides an `NSCache`-backed thumbnail layer with full invalidation hooks.

---

## 2. Non-Destructive Editing Architecture

All editing operations (crop, rotate, enhance, markup, signature) are **non-destructive**. Source image bytes in `ScanPage.imageData` are never modified after initial save. Edits are stored as metadata only.

### Render Source Chain

```swift
// ScanPage.swift L151
var renderSourceImageData: Data {
    originalImageData ?? imageData   // always the original, unmodified bytes
}
```

Every render consumer goes through this property or passes both `imageData` + `originalImageData` to `PageRenderService`, which applies the same `originalImageData ?? imageData` fallback at L84.

### Per-Feature Status

| Feature | How edit is stored | Render source | Cache invalidation |
|---------|-------------------|--------------|-------------------|
| Enhancement toggle | `isEnhancementEnabled: Bool` on `ScanPage` | `renderSourceImageData` | `ThumbnailCache.invalidateCache(forPageID:)` in `toggleAutoEnhancement` |
| Enhancement preset | `enhancementPresetRawValue: String` on `ScanPage` | `renderSourceImageData` | Same as above |
| Crop | `cropRectNormalized: CGRect?` on `ScanPage` (normalized, lossless) | `renderSourceImageData` | `ThumbnailCache.invalidateCache` in `applyCrop` |
| Rotation | `rotationDegrees: Int` on `ScanPage` (metadata only) | `renderSourceImageData` | `ThumbnailCache.invalidateCache` in `rotateImage` |
| Markup (PencilKit) | `annotationDrawingData: Data?`, coords normalized to [0,1] | composited at render time | `annotationRevision` bumped; ThumbnailCache key includes revision |
| Signatures | `SignatureStamp` objects with normalized positions | composited at render time | `signatureRevision` bumped; ThumbnailCache key includes revision |
| Export / PDF | reads `renderSourceImageData` fresh every time | N/A (not cached) | — |

### ThumbnailCache Key Format

```swift
// PlatformTypes.swift L543
"\(pageID)-\(rotationDegrees)-\(cropKey)-\(enhancementEnabled)-\(preset)-\(amount)-sig-\(signatureRevision)-anno-\(annotationRevision)-\(includesMarkup)"
```

The cache is keyed on every non-destructive dimension, so stale renders are impossible as long as `invalidateCache` is called correctly — which it is in all current code paths.

---

## 3. Findings — High Impact

### Finding #1 — Enhancement Pipeline is Sequential (Should Use TaskGroup)

**Files:** `DocumentProcessingService.swift` L1095–1148, `ImageEnhancementService.swift` L172  
**Estimated gain:** ~40–60% reduction in preparation time for multi-page scans

#### Problem

`prepareImagesForPipeline` iterates images in a plain `for` loop, `await`-ing each full enhancement pass before starting the next. Each pass involves:
- A CoreImage filter chain (auto-level, contrast, shadow removal)
- Vision rectangle detection on a 1400 px `CGImage`
- Vision saliency detection on a 1200 px `CGImage`
- A JPEG encode pass

On a 5-page scan this means 5 sequential enhancement passes even though the work is CPU-bound and can safely run on multiple cores.

#### Why it's safe to parallelize

- `ImageEnhancementService` methods are `nonisolated static` — no shared mutable state.
- The shared `CIContext` is a thread-safe static: `let ciContext = CIContext(options: [.useSoftwareRenderer: false])`.
- Each page produces an independent `PreparedPageData` value type before it yields.
- Memory impact: each page's JPEG is encoded and the `CGImage` released before the next group task starts.

#### Recommendation

```swift
// DocumentProcessingService.prepareImagesForPipeline
var preparedPages = [PreparedPageData?](repeating: nil, count: images.count)

let maxConcurrency = min(images.count, ProcessInfo.processInfo.activeProcessorCount)
await withTaskGroup(of: (Int, PreparedPageData?).self) { group in
    var index = 0
    var inFlight = 0

    func addNextTask() {
        guard index < images.count else { return }
        let i = index
        let image = images[i]
        index += 1
        inFlight += 1
        group.addTask {
            let result = await ImageEnhancementService.enhanceImageWithAutoCropSuggestion(image, ...)
            return (i, buildPreparedPageData(from: result, image: image))
        }
    }

    // Prime the group up to maxConcurrency
    for _ in 0..<maxConcurrency { addNextTask() }

    // Collect results and refill
    for await (i, data) in group {
        preparedPages[i] = data
        inFlight -= 1
        addNextTask()
    }
}
```

> **Non-destructive edit impact:** None. `prepareImagesForPipeline` only runs during initial scan/import, not during any editing operation.

---

### Finding #2 — OCR is Sequential (Adaptive Concurrency on Modern Devices)

**File:** `DocumentProcessingService.swift` L499–544  
**Comment in code:** `"Sequential processing for memory efficiency"`  
**Estimated gain:** 20–35% reduction in OCR time on A16+ devices

#### Problem

`processImagesWithProgress` runs `OCRProcessor.processCGImage` one page at a time. The comment correctly notes that this was chosen for 4 GB RAM safety, but A16+ devices have 6–8 GB and can handle concurrent Vision requests.

#### Options (low to high risk)

**Option A — Pipeline overlap (lowest risk, any device):**  
Start OCR on page N as soon as its `CGImage` is enhanced, rather than waiting for all N pages to be enhanced first. This is a scheduling change, not raw concurrency — the number of OCR operations running simultaneously stays at 1.

**Option B — Adaptive concurrency (medium risk, worth the gain):**  
Check `ProcessInfo.processInfo.physicalMemory` at scan start. Allow up to 3 concurrent OCR tasks when ≥ 6 GB RAM, 2 tasks when ≥ 5 GB, otherwise sequential.

```swift
let physicalGB = Double(ProcessInfo.processInfo.physicalMemory) / 1_073_741_824
let maxOCRConcurrency: Int
switch physicalGB {
case 6...: maxOCRConcurrency = 3
case 5...: maxOCRConcurrency = 2
default:   maxOCRConcurrency = 1
}
```

> **Non-destructive edit impact:** None. OCR only runs during initial scan or manual "Refresh OCR" — never during crop/rotate/markup/signature operations.

---

### Finding #3 — Identical JPEG Bytes Stored in Two SwiftData Columns

**File:** `DocumentProcessingService.swift` L1136–1141  
**Estimated gain:** ~50% reduction in per-page storage, ~30% faster `ModelContext.save()` on multi-page scans

#### Problem

```swift
// DocumentProcessingService.swift L1136-1138
PreparedPageData(
    storedImageData: originalImageData,   // ← same Data value
    originalImageData: originalImageData, // ← same Data value
    ...
)
```

Both `ScanPage.imageData` and `ScanPage.originalImageData` are `@Attribute` SwiftData columns. SQLite stores them as **two separate BLOBs** regardless of Swift's copy-on-write sharing. On a 10-page document at 0.8 JPEG quality, this can mean 15–25 MB of redundant storage per document.

#### Why `originalImageData` exists

The field is designed so `imageData` can later diverge (e.g., if a destructive edit ever overwrites `imageData` while `originalImageData` preserves the original). Currently, **no destructive edit path exists** — all edits are stored as metadata and applied at render time.

#### Safe fix

Set `originalImageData = nil` on new scans. Every rendering and export path uses:
```swift
let sourceData = request.originalImageData ?? request.imageData
```
…and every caller passes `page.originalImageData` which will be `nil`, safely falling through to `page.imageData`.

Verified callers that correctly handle `nil originalImageData`:
- `PageRenderService.renderCGImage` (L84) ✅
- `ThumbnailCache.image` (L601) ✅  
- `FullScreenImageView.renderDisplayImage` (L1036) ✅
- `MarkupView` (L176) ✅
- `SignaturePlacementView` (L307) ✅
- `PageOrganizerView` (L472) ✅
- `ExportSheetView` (L72) ✅
- `PDFGenerator` (L346, 459, 659, 714, 869) ✅
- `SearchService` (L290) ✅
- `DocumentSigningService` (L126) ✅
- `CommonViews` (L884) ✅
- `OnboardingFirstScanScreen` (L273) ✅

> **Non-destructive edit impact:** None, if and only if no code path writes destructively to `ScanPage.imageData` post-scan. Verify with: `grep -rn "\.imageData\s*=" "Bricks Scan/"` — should only show page creation sites.

> **Warning:** If a destructive edit path is introduced in the future, `originalImageData` must be populated at that point (copy from `imageData` before overwriting it). Document this invariant clearly.

---

## 4. Findings — Medium Impact

### Finding #4 — Vision Detection Renders Intermediate CGImage Unnecessarily

**File:** `ImageEnhancementService.swift` L401–453 (rectangle), L478–507 (saliency)  
**Estimated gain:** ~10–15% faster geometry detection, less peak memory per page

#### Problem

Both `detectBestQuadCandidate` and `detectSaliencyCropCandidate` downsample to 1400 px / 1200 px using `ciContext.createCGImage(visionSmall, from: extent)` — rasterizing the full CoreImage pipeline into a bitmap — before handing the result to `VNImageRequestHandler`. Vision can accept a `CIImage` directly, skipping the intermediate bitmap.

#### Recommendation

```swift
// Current
let visionSmall = downsampled(ciUp, maxDimension: 1400)
let extent = visionSmall.extent.integral
guard let visionCG = ciContext.createCGImage(visionSmall, from: extent) else { return nil }
let handler = VNImageRequestHandler(cgImage: visionCG, options: [:])

// Improved
let visionSmall = downsampled(ciUp, maxDimension: 1400)
let handler = VNImageRequestHandler(ciImage: visionSmall, options: [:])
```

This removes 2 bitmap allocations per page (one for rectangle detection, one for saliency) and lets the Vision framework schedule the CoreImage pipeline evaluation internally.

> **Non-destructive edit impact:** None. This runs only during image preparation, not during any editing flow.

---

### Finding #6 — ScannerView Batches All Pages Before Handing Off

**File:** `Views/ScannerView.swift` L81–112  
**Estimated gain:** Reduces time-to-first-page-processed by ~(N-1) × extraction_time

#### Problem

`extractImages(from:)` extracts all pages from `VNDocumentCameraScan` synchronously before setting `scannedImages` and dismissing the scanner. Enhancement and OCR cannot begin until every page is in memory.

#### Recommendation

Use an `AsyncStream` to yield pages one at a time as they are extracted. The pipeline can start enhancement on page 1 while pages 2–N are still being copied from the scan object:

```swift
func streamImages(from scan: VNDocumentCameraScan) -> AsyncStream<UIImage> {
    AsyncStream { continuation in
        for i in 0..<scan.pageCount {
            continuation.yield(scan.imageAtIndex(i))
        }
        continuation.finish()
    }
}
```

The processing pipeline then consumes the stream and starts a `prepareImage` task for each page as it arrives rather than waiting for the full array.

> **Non-destructive edit impact:** None. This only affects the initial capture flow.

---

## 5. Findings — Low Impact

### Finding #7 — UserDefaults Re-Read Inside Async Pipeline Tasks

**File:** `DocumentProcessingService.swift` L864, L1049

```swift
let isAutoEnhanceEnabled = UserDefaults.standard.object(forKey: AppSettings.autoEnhanceKey) as? Bool ?? true
let isAutoCropEnabled    = UserDefaults.standard.object(forKey: AppSettings.autoCropKey)    as? Bool ?? false
```

These are called inside `Task.detached` closures. `UserDefaults` reads are thread-safe but are repeated across multiple code paths when the values could be captured once at the call site through the existing `AppSettings` struct. Minor, but easy cleanup.

**Recommendation:** Pass `isAutoEnhanceEnabled` and `isAutoCropEnabled` as arguments to `prepareImagesForPipeline` from the `@MainActor` call site where `appSettings` is already available.

---

### Finding #8 — PDF Generation Materializes All CGImages Simultaneously

**File:** `DocumentProcessingService.swift` L207–212

```swift
let cgImages = preparedPages.map(\.ocrCGImage)  // all pages in memory at once
await PDFGenerator.generatePDF(cgImages: cgImages, ...)
```

For a 15-page document at 3000×4000 px, the materialized array can peak at ~500 MB+. If `PDFGenerator` processes pages serially into `CGPDFContext` (which is streaming), passing a fully materialized array holds every `CGImage` alive longer than necessary.

**Recommendation:** Verify `PDFGenerator` page loop structure. If serial, switch to passing an `IndexingCollection` or closure-based iterator so ARC can release each `CGImage` after its PDF page is written.

---

### Finding #9 — 300ms Hardcoded Navigation Delay

**File:** `SubViews/Views Components/ContentViewLogic.swift` L318

```swift
try await Task.sleep(nanoseconds: 300_000_000) // wait for fullScreenCover dismissal
```

This delay exists to let the scanner sheet's dismiss animation complete before navigating to `DocumentView`. On slow devices it may still be insufficient; on fast devices it's unnecessarily long.

**Recommendation:** Replace with an `onChange(of: showingScanner)` sink that waits for `false`, or use a `withAnimation(.easeOut(duration: 0.28)) {}` completion block. This makes the delay device-adaptive instead of fixed.

---

### Finding #10 — Spotlight Indexing Competes With Enrichment on First Open

**File:** `Image Processing/InitialScanPipelineCoordinator.swift` L89–92

```swift
Task {
    await SpotlightIndexingService.shared.indexDocument(document)
}
```

This is fire-and-forget immediately after `modelContext.save()`. If enrichment (classification, naming) also starts simultaneously, both compete for CPU. Spotlight indexing is lower priority than enrichment because the document won't have its final title/tags until enrichment completes.

**Recommendation:** Add a short delay before indexing (`Task.sleep(for: .seconds(3))`) to let enrichment run with full CPU first. Alternatively, trigger Spotlight indexing from within the enrichment completion callback so it indexes the already-enriched document.

---

## 6. Retracted Findings

### ~~Finding #5 — PageRenderService Has No Render Cache~~

**Retracted** after reading `Image Processing/PlatformTypes.swift` L496–689.

`ThumbnailCache` already exists and is fully implemented:

- **Storage:** `NSCache<NSString, AnyObject>` with 50 MB and 100-item limits.
- **Cache key** includes: `pageID`, `rotationDegrees`, `cropRect`, `isEnhancementEnabled`, `enhancementPreset`, `enhancementAmount`, `signatureRevision`, `annotationRevision`, `includesMarkup`.
- **Invalidation** is correctly called after:
  - Rotation: `FullScreenImageView.rotateImage` → `ThumbnailCache.invalidateCache`
  - Crop: `FullScreenImageView.applyCrop` → `ThumbnailCache.invalidateCache`
  - Enhancement: `FullScreenImageView.toggleAutoEnhancement` → `ThumbnailCache.invalidateCache`
  - Markup: `DocumentMarkupService` → `ThumbnailCache.invalidateCache`
  - Signature: `DocumentSigningService` → `ThumbnailCache.invalidateCache`
- **Consumers:** `PageThumbnailView`, `PageOrganizerView`, `SearchUIComponents`, `PDFGenerator` thumbnail preview, `CommonViews` folder.

The full-screen `ZoomablePageImageView` in `FullScreenImageView` does not use `ThumbnailCache` (it renders up to 4200 px for zoom fidelity) but only re-renders when `imageTaskKey` changes — which encodes all the same non-destructive parameters.

**No action needed.**

---

## 7. Summary Table

| # | Finding | File | Impact | Status |
|---|---------|------|--------|--------|
| 1 | Enhancement pipeline runs sequentially — switch to TaskGroup | `DocumentProcessingService.swift:1095` | 🔴 High | Open |
| 2 | OCR runs sequentially — adaptive concurrency for A16+ devices | `DocumentProcessingService.swift:521` | 🔴 High | Open |
| 3 | Same JPEG bytes stored twice in SwiftData (imageData + originalImageData) | `DocumentProcessingService.swift:1136` | 🔴 High | Open |
| 4 | Vision detection unnecessarily rasterizes CGImage before hand-off | `ImageEnhancementService.swift:402` | 🟡 Medium | Open |
| 5 | ~~No render cache for PageRenderService~~ | `PlatformTypes.swift:496` | — | ✅ Retracted |
| 6 | ScannerView batches all pages before pipeline start — stream instead | `ScannerView.swift:81` | 🟡 Medium | Open |
| 7 | UserDefaults re-read inside async pipeline tasks | `DocumentProcessingService.swift:864` | 🟢 Low | Open |
| 8 | PDF generation holds all CGImages in memory simultaneously | `DocumentProcessingService.swift:207` | 🟢 Low | Open |
| 9 | 300ms hardcoded navigation delay after scan dismissal | `ContentViewLogic.swift:318` | 🟢 Low | Open |
| 10 | Spotlight indexing starts immediately, competing with enrichment | `InitialScanPipelineCoordinator.swift:89` | 🟢 Low | Open |

---

## 8. Implementation Priority Order

Recommended order to maximize impact while minimising risk:

1. **Finding #3** — Double storage (storage bug, zero feature risk, easy one-liner)
2. **Finding #1** — Parallel image enhancement (biggest speed win, no memory risk at page-level granularity)
3. **Finding #4** — Vision CIImage pass-through (small, isolated change in ImageEnhancementService)
4. **Finding #2** — Adaptive OCR concurrency (measurable win on new devices, test carefully on low-RAM)
5. **Finding #6** — Stream pages from scanner (improves perceived responsiveness, requires pipeline refactor)
6. **Finding #9** — Remove hardcoded nav delay (UX polish)
7. **Findings #7, #8, #10** — Low impact housekeeping, do when touching those areas anyway
