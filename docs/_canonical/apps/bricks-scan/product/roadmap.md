---
title: Bricks Scan Roadmap
doc_id: bricks-scan-product-roadmap
doc_type: product
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
  - roadmap
---

# Bricks Scan — Roadmap

In-progress and planned work. Does not include shipped features.

---

## Vision & OCR

- **PLANNING:** Evaluate benefits and implementation path for `VNRecognizedDocumentRequest`. Research transition from `VNRecognizeTextRequest` (currently in `OCRProcessor.swift`) to the modern Vision framework API for improved text and layout accuracy with tables, lists, and code blocks.

---

## Backend & Analytics

- **BACKEND: Consolidate AppStorage across codebase in AppSettings.swift** — ✅ COMPLETED. Centralize all `@AppStorage` keys and logic into `AppSettings.swift`.
- **BACKEND: Implement Firebase for event analytics** — Initialize Firebase and set up custom event tracking (scan completion, AI generation). Pass user persona as parameter with every analytics event.
- **FEATURE: Implement iCloud** — Verify `ModelContainer` configuration in `Bricks_ScanApp.swift` to ensure seamless CloudKit sync of all folder and document data.

---

## Core Features

- **FEATURE: Implement Import PDF** — Add `UIDocumentPickerViewController` support. Treat imported PDFs as multi-page documents and perform OCR automatically via `DocumentProcessingService`.
- **FEATURE: Implement Crop Page Image** — Inline manual cropping and perspective adjustment tool within `DocumentDetailView` for individual `ScanPage` instances.
- **FEATURE: Implement Share Folder** — Package all documents in a `DocumentFolder` into a single multi-page PDF via `PDFGenerator` and share via `UIActivityViewController`.
- **FEATURE: Implement Delete Folder (not documents inside)** — ✅ COMPLETED. Folder deletion removes only the association with `Document` objects, leaving them in "All Scans."

---

## AI & Intelligence

- **FEATURE: Visual Intelligence Integration** — Leverage multimodal AI in `IntelligenceService` for automatic document type identification.
- **FEATURE: Create Study Questions with AI** — Specialized AI prompt in `AIGenerationService` for the Academic & Student persona. Question count scaled by document length.
- **FEATURE: Create Executive Summary with AI** — High-level AI-driven summary for Mobile Professional and Corporate Traveler personas.
- **FEATURE: Create Bullet Point Summary with AI** — Quick-glance summary extracting key highlights into a concise bulleted list.
- **FEATURE: Create Expenses Report with AI** — Extraction tool identifying Date, Vendor, Total, and Currency from receipts.

---

## Bug Fixes

- **BUG: When one page has no text, AI Summary doesn't work** — ✅ COMPLETED
