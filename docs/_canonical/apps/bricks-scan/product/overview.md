---
title: Bricks Scan Overview
doc_id: bricks-scan-product-overview
doc_type: product
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
  - product
---

# Bricks Scan — Overview

Bricks Scan is a native Apple-platform document scanning and organization app for iPhone, iPad, and Mac. It goes beyond capture: documents become searchable, clearly named, and automatically organized with an Apple-native document workflow.

Core scanning, OCR, enrichment, export, and document management are built on Apple frameworks. The current app also includes Firebase-backed analytics instrumentation in release-capable builds, so the product should be described as Apple-native and privacy-conscious rather than strictly dependency-free.

---

## Target Platforms

| Platform | Minimum OS | Notes |
|---|---|---|
| iPhone | iOS 26.1+ | Primary platform. Camera scanning, photo import, haptics, Live Activity support |
| iPad | iPadOS 26.1+ | Shared app target with adaptive layouts |
| Mac | macOS 26.1+ | Continuity Camera, file import, inspector-style document details |
| Widget extension | iOS 26.1+ / macOS 26.1+ | Home screen widget plus scan progress Live Activity |

The app uses a shared codebase across iOS and macOS, with platform-specific code isolated to `#if os(iOS)` / `#if os(macOS)` blocks and the `PlatformTypes.swift` abstraction layer.

---

## Core Features

### Document Scanning
- Camera-based scanning via `VNDocumentCameraViewController` (iOS) and Continuity Camera (macOS)
- Photo library and file import paths
- Multi-page document support
- Automatic edge detection and perspective correction

### Image Processing
- On-device OCR via the Vision framework — no data leaves the device
- Auto-crop and perspective transform services
- Image enhancement and downsampling with configurable quality settings
- Rotation with automatic thumbnail cache invalidation

### Document Organization
- Organize documents into user-created `DocumentFolder` folders
- System smart lists: All Documents, Past Week, Trash
- `Tag` classification with heuristic and Foundation Models-assisted enrichment
- Configurable auto-organization modes: off, suggest only, or auto-apply
- Search across title, OCR text, notes, summaries, and tags

### AI Features (Apple Intelligence)
- Automatic document title generation using on-device Foundation Models
- Document summarization with editable output and coverage tracking
- Metadata extraction (amounts, dates, vendor names, addresses)
- Heuristic fallback paths when Foundation Models is unavailable

### PDF & Export
- Searchable PDF generation with embedded OCR text
- Export as PDF, JPEG, text, or HTML
- Configurable scan resolution and export quality
- Share sheet and `ShareLink` integration

### Signatures & Annotations
- Draw and save signatures
- Place signatures on document pages
- Page annotation and markup support

### Reminders & Calendar
- Set date-based reminders per document or per folder
- Create calendar events tied to documents
- Apple Reminders integration plus `UNUserNotificationCenter`

### System Integrations
- Spotlight indexing for document search from the home screen
- Siri Shortcuts and Spotlight actions via App Intents
- Live Activity during scanning/processing via WidgetKit
- App Store review prompts via StoreKit

---

## App Limits (Free Tier)

| Limit | Value | Constant |
|---|---|---|
| Max documents | 40 | `Document.maxDocumentsLimit` |
| Max pages per document | 300 | `Document.maxPagesPerDocument` |
| Max tags | 20 | `Tag.maxTagsLimit` |
| Max folders | 20 | `DocumentFolder.maxFoldersLimit` |
| Max saved signatures | 2 | `Signature.maxSignaturesLimit` |

Exceeding these limits prompts an upgrade flow via StoreKit.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | SwiftUI |
| Data persistence | SwiftData + custom opt-in CloudKit replication |
| OCR | Vision (`VNRecognizeTextRequest`) |
| Document scanning | VisionKit (`VNDocumentCameraViewController`) |
| PDF generation | PDFKit |
| AI / on-device ML | Foundation Models (Apple Intelligence) |
| Purchases | StoreKit 2 |
| Notifications | UserNotifications |
| Calendar | EventKit |
| Spotlight | CoreSpotlight |
| Widgets | WidgetKit |
| Siri Shortcuts | AppIntents |
| Concurrency | Swift Concurrency (async/await, actors, `Task`) |

---

## Key Design Decisions

**Apple-native core workflow.** Scanning, OCR, PDF generation, local storage, Apple Intelligence features, widgets, Spotlight, reminders, and calendar integrations are built on Apple frameworks. The current app also includes Firebase analytics support, so this should not be described as a zero-dependency product.

**On-device-first document processing.** OCR, AI summarization, metadata extraction, rendering, and export happen on device. The app also contains analytics instrumentation, so privacy claims should stay specific to document processing and content handling rather than implying that no telemetry exists at all.

**Shared codebase, native feel.** Rather than using a cross-platform abstraction layer, the app uses SwiftUI's adaptive components and targeted `#if os()` blocks to deliver a native feel on each platform while sharing the vast majority of code.

**Service-oriented architecture.** Business logic lives in focused services, mutation services, and coordinators, keeping views from owning persistence, sync orchestration, or invalidation rules.

**SwiftData as the single source of truth.** All persistent state flows through SwiftData models first. iCloud sync is an opt-in custom CloudKit replication layer on top of the local store, not a separate CloudKit-backed SwiftData store.

**Revision-based consistency.** OCR, summaries, and PDF freshness are driven by canonical revision fields instead of manual stale flags, which keeps page edits, export, and AI workflows aligned.

---

## Related Docs

| Doc | Location |
|---|---|
| Positioning & messaging | [positioning.md](./positioning.md) |
| App Store copy | [app-store-copy.md](./app-store-copy.md) |
| Roadmap | [roadmap.md](./roadmap.md) |
| Content strategy | [content-strategy.md](./content-strategy.md) |
| Support runbook | [../operations/support-runbook.md](../operations/support-runbook.md) |
| Architecture (engineering) | [../engineering/architecture.md](../engineering/architecture.md) |
| Dev guide (engineering) | [../engineering/dev-guide.md](../engineering/dev-guide.md) |
| AI source docs | [../ai/README.md](../ai/README.md) |
| Brand voice and identity | [shared/brand/brand-foundation.md](../../../shared/brand/brand-foundation.md) |
| Visual system | [shared/brand/brand-system.md](../../../shared/brand/brand-system.md) |
