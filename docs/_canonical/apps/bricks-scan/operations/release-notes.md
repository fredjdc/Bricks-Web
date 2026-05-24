---
title: Bricks Scan Release Notes
doc_id: bricks-scan-operations-release-notes
doc_type: operations
role: canonical
app_scope: bricks-scan
owner: Freddy
status: needs-review
last_reviewed: 2026-04-06
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - releases
---

# Bricks Scan Release Notes

## Release

- Version: 1.0.1 draft notes
- Date: 2026-04-06 codebase snapshot
- Platforms: iPhone, iPad, and Mac

## User-Visible Changes

- Added a user-facing analytics preference so release-capable builds can explicitly enable or disable anonymous analytics collection.
- Improved the purchase and settings surface around privacy and support by keeping support email, support page, privacy, and terms links aligned with the current app UI.
- Kept export behavior stable while preserving PDF, image, and text share flows after analytics instrumentation changes.

## Fixes

- Hardened cloud sync startup and account-change handling so builds with cloud sync runtime disabled stay local-only instead of attempting CloudKit work.
- Improved sync status handling so disabled-runtime builds report a disabled state cleanly instead of presenting misleading CloudKit status checks.
- Disabled Firebase automatic screen reporting and kept analytics event logging on the app-controlled path.

## Known Limitations

- These notes reflect the current implemented `1.0.1` codebase state, not a confirmed App Store release date.
- Password-protected PDFs still are not supported for import.
- Apple Intelligence features still depend on device eligibility, Apple Intelligence availability, and supported document locale.
- The iCloud sync Settings section is currently compiled only for debug builds, so release-user sync guidance must be revalidated before publication.

## Internal Notes

- Evidence for this draft came from the current project version settings plus the most recent implementation commits touching `AppAnalytics`, `SettingsViewSections`, `SyncModeCoordinator`, `CloudSyncStatusStore`, `Bricks_ScanApp`, `Info.plist`, and `ExportSheetView`.

## Minimum Complete Content Checklist

- [x] Release identifier exists
- [x] User-visible changes are clear
- [x] Fixes are concrete
- [x] Limitations are honest
- [x] No roadmap promises appear as shipped facts
