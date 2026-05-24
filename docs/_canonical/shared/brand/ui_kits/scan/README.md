---
title: Bricks Scan UI Kit
doc_id: shared-brand-ui-kit-scan
doc_type: engineering
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - brand
  - ui-kit
  - scan
---

# Bricks Scan — iOS UI Kit

Recreation of the Bricks Scan app. Source: `fredjdc/Bricks-Scan` (SwiftUI, iOS/iPadOS/macOS). Accent = teal `#00A6A1`.

Core screens:
- **DocumentsList** — grouped folder list with scan count + "Scan" FAB
- **ScanDetail** — preview of a single scanned PDF with extracted metadata
- **Search** — full-text search across scans with highlighted matches

Real components present in the Swift codebase: `DocumentListView`, `ScanView`, `SearchView`, `FolderView`, `PDFPreview`.
