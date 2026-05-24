---
title: Bricks Scan Quick Reference
doc_id: bricks-scan-engineering-quick-reference
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
  - reference
---

# Quick Reference Card

## Before You Start Coding

1. Search the codebase for an existing pattern before adding a new one.
2. Check `Components/` and `SubViews/Views Components/` for reusable UI.
3. Check `Components/ValidationRules.swift` before adding new validation.
4. Keep business logic in services or view logic helpers, not in SwiftUI bodies.
5. Prefer the current model names `DocumentFolder` and `Tag`.
6. Route document and page writes through mutation services, not direct `save()` calls in views.

## Where to Put Code

| Type of Code | Location |
|--------------|----------|
| Reusable SwiftUI view | `Bricks Scan/Components/` |
| Shared view modifiers / screen-specific logic | `Bricks Scan/SubViews/Views Components/` |
| Validation logic | `Bricks Scan/Components/ValidationRules.swift` |
| App settings / feature flags / user defaults | `Bricks Scan/Core/AppSettings.swift` |
| SwiftData models | `Bricks Scan/Core/Models/` |
| App Intents / Spotlight entities / Siri shortcuts | `Bricks Scan/Core/` |
| OCR / image / PDF pipeline | `Bricks Scan/Image Processing/` |
| Cross-screen services | `Bricks Scan/Services/` |
| Top-level screens | `Bricks Scan/Views/` |
| Supporting sheets and detail views | `Bricks Scan/SubViews/` |

## Common Tasks

### Validation
```swift
// Document title
ValidationRules.validateDocumentTitle(title)

// Folder name
ValidationRules.validateFolderName(name, existingNames: names)

// Tag / document type name
ValidationRules.validateTagName(name, existingNames: names)

// Notes
ValidationRules.validateNotes(notes)

// Page limit
ValidationRules.validatePageLimit(currentPageCount: count, pagesToAdd: new)
```

### UI Components
```swift
// Tag badge
TagBadgeView(tagName: name, tag: tag, style: .compact)

// Document row
DocumentRowView(document: document)

// Folder row
FolderRowView(folder: folder, documentCount: count)

// Full screen image view (with rotate and delete)
FullScreenImageView(page: page, document: document)

// Processing progress view (with cancellation)
ProcessingProgressView(
    progress: ProcessingProgress(step: .ocr, progress: 0.5, message: "Processing..."),
    onCancel: { /* Cancel handler */ }
)
```

### View Modifiers
```swift
// Rename alert
.renameAlert(isPresented: $show, editingTitle: $text, ...)

// Delete confirmation
.deleteConfirmationAlert(isPresented: $show, title: "...", message: "...", onConfirm: { })

// Validation error
.validationErrorAlert(isPresented: $show, errorMessage: error)
```

### Model Helpers
```swift
// Sorted pages
document.pagesSortedByNumber

// First page
document.firstPage

// Remaining capacity
document.remainingPageCapacity

// Add pages
document.appendPages(fromImageData: [data])

// Remove pages
document.removePages(withIDs: Set<UUID>())

// Freshness
page.requiresOCRRefresh
page.requiresSummaryRefresh
document.isPDFCacheStale
```

### Constants
```swift
Document.maxDocumentsLimit        // 40
Document.maxPagesPerDocument      // 300
Tag.maxTagsLimit                  // 20
DocumentFolder.maxFoldersLimit    // 20
Signature.maxSignaturesLimit      // 2
ValidationConstants.maxTitleLength    // 200
ValidationConstants.maxNameLength     // 100
ValidationConstants.maxNotesLength    // 10000
```

### Services
```swift
// Rename document through centralized write path
DocumentMutationService.renameDocument(document, title: title, modelContext: context)

// Update page notes through centralized write path
PageMutationService.updatePageNotes(page, notes: notes, modelContext: context)

// Save document summary through centralized write path
DocumentMutationService.saveDocumentSummary(document, summary: summary, modelContext: context)

// Process document with progress updates
let (document, pages) = try await DocumentProcessingService.processDocument(
    images: images,
    title: title,
    folder: folder,
    tags: tags,
    progressHandler: { progress in
        // Update UI with progress
    }
)

// Append pages to existing document with progress updates
let result = await DocumentProcessingService.appendPagesToDocument(
    images: images,
    document: document,
    modelContext: context,
    progressHandler: { progress in
        // Update UI with progress
    }
)

// Delete document
DocumentProcessingService.deleteDocument(document, modelContext: context)

// Process OCR
let result = try await OCRProcessor.processImage(image)

// Generate PDF
let pdfData = try PDFGenerator.generatePDF(images: images, ocrResults: results, title: title)

// Classify document and extract metadata
let classified = await DocumentClassificationService.classifyAndEnrich(
    document,
    extractedText: text,
    tags: tags
)

// Run auto-organization
DocumentAutoSortService.performAutoOrganization(document, modelContext: context)
```

### Mutation Pattern
```swift
let result = MutationTransactionCoordinator.perform(
    in: modelContext,
    mutation: {
        document.markMetadataChanged()
    },
    sync: {
        try SyncQueueMutationService.markDocumentGraphForUpload(document, in: modelContext)
    }
)
```

### Image Processing Utilities
```swift
// Rotate image 90 degrees clockwise
let rotatedImage = PlatformImage.rotateImageClockwise(image)

// Rotate image data 90 degrees clockwise (returns compressed JPEG data)
let rotatedData = PlatformImage.rotateImageDataClockwise(imageData)

// Convert image data to platform image
let image = PlatformImage.image(from: imageData)

// Convert platform image to JPEG data with optional downsampling
let jpegData = PlatformImage.convertToJPEGData(image, compressionQuality: 0.8, maxDimension: 2048)

// Downsample image to reduce memory usage
let downsampled = PlatformImage.downsampleImage(image, maxDimension: 1024)

// Invalidate thumbnail cache for a page
ThumbnailCache.invalidateCache(forPageID: page.id)

// Get scan resolution settings
let resolution = ScanResolution.currentFromUserDefaults()
let quality = resolution.compressionQuality
let maxDimension = resolution.maxImageDimension
```

## ⚠️ Common Mistakes to Avoid

### Don't Do This
```swift
// Saving directly from a view action
try modelContext.save()

// Scheduling CloudKit push from a screen
CloudSyncPushService.schedulePushIfNeeded(in: modelContext)

// Hardcoding limits
if count > 300 { }

// Duplicating validation
if name.isEmpty { error = "Name cannot be empty" }

// Duplicating sorting
let sorted = pages.sorted { $0.pageNumber < $1.pageNumber }

// Copy-pasting UI code
HStack { Image(...); Text(...) }  // Use TagBadgeView instead
```

### Do This Instead
```swift
// Use a mutation service
DocumentMutationService.renameDocument(document, title: title, modelContext: modelContext)

// Or commit once through the shared transaction coordinator
let result = MutationTransactionCoordinator.perform(...)

// Use constants
if count > Document.maxPagesPerDocument { }

// Use ValidationRules
let result = ValidationRules.validateFolderName(name)

// Use model extension
let sorted = document.pagesSortedByNumber

// Use reusable component
TagBadgeView(...)
```

## 🎨 View Composition Pattern

```swift
struct MyView: View {
    var body: some View {
        VStack {
            headerSection
            contentSection
            footerSection
        }
    }
    
    private var headerSection: some View {
        // Use reusable components
        TagBadgeView(...)
    }
    
    private var contentSection: some View {
        // Compose from smaller views
        DocumentRowView(document: document)
    }
}
```

## Code Review Checklist

- [ ] Did I check for existing similar code?
- [ ] Am I using reusable components?
- [ ] Am I using validation rules instead of duplicating logic?
- [ ] Am I using constants instead of hardcoded values?
- [ ] Is my code in the right folder?
- [ ] Does my service have a single responsibility?
- [ ] Did I add helpful comments?
- [ ] Is my code simple and clear?
- [ ] Am I using autoreleasepool for image processing loops?
- [ ] Did I consider memory usage for low-RAM devices?

## Memory Optimization Guidelines

### Use `autoreleasepool` for Tight Synchronous Image Loops
```swift
// ✅ Good: Process images one at a time with autoreleasepool
for image in images {
    autoreleasepool {
        let data = PlatformImage.convertToJPEGData(image)
        processedData.append(data)
    }
}

// ❌ Bad: Process all images without releasing memory
let data = images.map { PlatformImage.convertToJPEGData($0) }

// ⚠️ Note: autoreleasepool doesn't work with async/await
// For async operations, use sequential processing instead
for image in images {
    let result = try await processAsync(image)  // Sequential = memory efficient
}
```

### Downsample Before Heavy Processing
```swift
// ✅ Good: Downsample large images
let resolution = ScanResolution.currentFromUserDefaults()
let data = PlatformImage.convertToJPEGData(image, 
    compressionQuality: resolution.compressionQuality,
    maxDimension: resolution.maxImageDimension)

// ❌ Bad: Use full-resolution images
let data = image.jpegData(compressionQuality: 0.9)
```

### Prefer Sequential Work for Large Images
```swift
// ✅ Good: Sequential for low-RAM devices (iPhone 13: 4GB)
for image in images {
    let result = try await OCRProcessor.processImage(image)
    results.append(result)
}

// ❌ Bad: Parallel processing causes memory spikes
try await withThrowingTaskGroup { group in
    for image in images {
        group.addTask { try await OCRProcessor.processImage(image) }
    }
}
```

### Clear Buffers Early
```swift
// ✅ Good: Clear images immediately after processing starts
scannedImages = []
let result = await process(images)

// ❌ Bad: Hold images until processing completes
let result = await process(scannedImages)
scannedImages = []
```

## Product-Specific Reminders

- Free-tier limits are `40` documents and `300` pages per document.
- Export supports PDF, JPEG, text, and HTML from the export sheet.
- Search covers titles, OCR text, notes, tags, and summaries.
- Spotlight, App Intents, widgets, CloudKit sync, and Apple Reminders all have existing code paths. Extend those instead of creating parallel systems.

## Full Documentation

- [`dev-guide.md`](./dev-guide.md) for the full engineering guide
