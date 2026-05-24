---
title: Bricks Scan Development History
doc_id: bricks-scan-meta-development-history
doc_type: meta
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - history
---

# Development History

This document records the major engineering phases executed during the pre-launch hardening effort. It is a reference for understanding *why* the current architecture looks the way it does, particularly around external event routing, concurrency, state observation, and testing.

---

## Table of Contents

1. [Phase A — Decision Seams Extraction](#phase-a--decision-seams-extraction)
2. [Phase B — Event Flow Hardening](#phase-b--event-flow-hardening)
3. [Phase B — Observation Migration](#phase-b--observation-migration)
4. [Phase B — Regression and Smoke Pass](#phase-b--regression-and-smoke-pass)
5. [Phase C — Launch Hardening Plan](#phase-c--launch-hardening-plan)
6. [Phase C — Simulator Release Gate](#phase-c--simulator-release-gate)

---

## Phase A — Decision Seams Extraction

**Date:** 2026-03-05

### Goal

Extract pure decision functions ("seams") from view logic so they can be unit-tested in isolation without SwiftUI or SwiftData. This prevents regression of critical routing and policy decisions.

### Decision Seams Extracted

| Seam | File | Key Functions |
|------|------|--------------|
| External event routing | `Services/ContentExternalEventRouter.swift` | `route(for:)`, `action(for url:)`, `action(forSpotlightActivity:)`, `action(for notification:)` |
| Launch policy | `Services/ContentLaunchCoordinator.swift` | `shouldPresentOnboarding`, `shouldAttemptRemindersAutoSync`, `shouldOpenScannerOnLaunch`, `resolveDefaultFolder` |
| Post-save enrichment trigger | `SubViews/Views Components/ContentViewLogic.swift` | `postSaveProcessingDecision(policy:extractedText:)` |
| Folder membership selection | `SubViews/Views Components/DocumentFolderViewLogic.swift` | `documentBelongsToSelectedFolder(_:selectedFolder:)` |
| Folder operation policies | `SubViews/Views Components/DocumentFolderViewLogic.swift` | `deleteErrorTitle(isPermanentDelete:)`, `shouldManuallyRefreshAfterDelete`, `shouldPersistRecentSearch` |
| Folder empty-state visibility | `SubViews/Views Components/DocumentFolderViewLogic.swift` | `shouldShowSearchEmptyState`, `shouldShowFilterEmptyState`, `shouldShowDefaultEmptyState`, `shouldShowTrashEmptyState` |
| Document detail gesture gating | `SubViews/Views Components/DocumentViewLogic.swift` | `addPagesAlertDecision(for:)`, `canPerformGestureAction(_:...)` |
| Sheet/full-screen route updates | `ContentView`, `DocumentView`, `DocumentFolderView` | Route update helpers |

### Test Coverage

All seams verified by new unit tests in `BricksScanTests`. Full suite result on `iPhone 17 / iOS 26.2` simulator: **PASS**.

### Actor-Isolation Audit

Pure decision seams intended for test access are marked `nonisolated`. Tests accessing `@MainActor`-isolated APIs are annotated `@MainActor` at the type or method level. No additional isolation changes were required.

---

## Phase B — Event Flow Hardening

**Date:** 2026-03-05

### Goal

Make external event handling (URL scheme, Spotlight, App Intents, push notifications) deterministic and resilient across cold and warm launch timing windows.

### Changes

#### 1. External Event Source Routing Hardening (`ContentExternalEventRouter.swift`)

- Case-insensitive URL parsing for scheme, host, and query keys (`bricksscan`, `scan/document`, `id`).
- UUID parsing from App Intent notifications accepts both `UUID` and `String` payloads.
- String UUID parsing trims surrounding whitespace and newlines.
- Added deterministic notification mapping seam: `action(forNotificationName:object:)`
- Centralized source labels: `sourceLabelForURLScheme()`, `sourceLabelForSpotlight()`, `sourceLabelForAppIntent()`

#### 2. Duplicate External-Event Suppression (`ContentView.swift`, `ContentViewLogic.swift`)

Dispatch deduplication prevents duplicate events within a 0.75-second window:

- `lastExternalEventDeduplicationKey` — tracks last dispatched action key
- `lastExternalEventDate` — tracks last dispatch timestamp
- `externalEventDeduplicationKey(for:)` — normalizes key by intent, ignoring source label
- `shouldDispatchExternalEvent(action:lastDeduplicationKey:lastDispatchDate:now:deduplicationWindow:)`

#### 3. Open-Document Retry/Fallback Policy (`ContentViewLogic.swift`)

Explicit, testable seams for the "open document by ID" flow:

- `openDocumentMaxAttempts()` / `openDocumentRetryDelayNanoseconds()`
- `shouldRetryOpenDocumentLookup(attemptIndex:maxAttempts:)`
- `shouldContinueOpenDocumentLookup(isTaskCancelled:)`
- `openDocumentFolderSelectionDecision(hasAssignedFolder:hasAllDocumentsFolder:)`
- `openDocumentLookupOutcome(didFindDocument:wasCancelled:)`

#### 4. State/Update Stability Refinements

Guarded setters prevent unnecessary SwiftUI re-renders:

- `setSelectedFolderIfChanged(_:)`
- `setSelectedDocumentIfChanged(_:)`

### New Test Files

- `ContentExternalEventDispatchDecisionTests.swift` — deduplication key normalization, duplicate suppression inside/outside window
- `ContentOpenDocumentDecisionTests.swift` — retry constants, cancellation decision, folder fallback, lookup outcomes

**Regression result:** All tests PASS on `iPhone 17 / iOS 26.2`.

---

## Phase B — Observation Migration

**Date:** 2026-03-05

### Goal

Replace legacy `ObservableObject`/`@Published` stores with the Swift `@Observable` macro for more granular SwiftUI dependency tracking.

### Migrated Stores

| Store | Change |
|-------|--------|
| `AppSettingsStore` | `ObservableObject` → `@Observable` |
| `CloudSyncStatusStore` | `ObservableObject` → `@Observable` |
| `StoreKitManager` | `ObservableObject` → `@Observable` |
| `CanvasViewModel` (SignatureCanvasView) | `ObservableObject` → `@Observable` |
| `DrawingViewModel` (SignatureCanvasView) | `ObservableObject` → `@Observable` |

### Dependency Injection

App root (`Bricks_ScanApp.swift`) now injects all three stores via typed environment:

```swift
// Injected at root
.environment(appSettingsStore)
.environment(storeKitManager)
.environment(cloudSyncStatusStore)

// Consumed in views
@Environment(AppSettingsStore.self) private var appSettings
@Environment(StoreKitManager.self) private var storeKit
@Environment(CloudSyncStatusStore.self) private var cloudSync
```

Views needing bindable access use `@Bindable`:

```swift
@Environment(AppSettingsStore.self) private var appSettings
var body: some View {
    @Bindable var appSettings = appSettings
    Toggle(isOn: $appSettings.iCloudSyncEnabled) { ... }
}
```

### Remaining `ObservableObject` Usage

`SignatureCanvasView` had its internal view models migrated. No remaining `ObservableObject` usage in the migrated stores.

**Regression result:** All targeted test suites PASS on `iPhone 17 / iOS 26.2`.

---

## Phase B — Regression and Smoke Pass

**Date:** 2026-03-05

### Automated Regression

```bash
# macOS build
xcodebuild -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -configuration Debug -destination 'platform=macOS,arch=arm64' build

# iOS build
xcodebuild -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -configuration Debug -destination 'generic/platform=iOS' build

# Full test suite
xcodebuild -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.2' test
```

**Result:** All commands passed.

### Manual Smoke Checklist (at Phase B close)

| Flow | Status |
|------|--------|
| Camera scan (1-page) | Verified |
| Camera scan (multi-page) | Verified |
| Photos import | Verified |
| Files import | Verified |
| Settings toggle + relaunch | Verified |
| Quality/export settings | Verified |
| iCloud sync toggle | Verified |
| Sync status transitions | Verified |
| Paywall / product loading | Verified |
| Restore purchases | Verified |
| Premium gating | Verified |

---

## Phase C — Launch Hardening Plan

**Date:** 2026-03-05

### Purpose

Convert architecture work into launch-ready confidence by expanding automated coverage and hardening high-risk user flows.

### Slices

| Slice | Scope | Acceptance |
|-------|-------|-----------|
| C1 | UI smoke automation (`BricksScanUITests` target) — sidebar, documents, settings, store | Deterministic on iPhone 17 iOS 26.2, no flaky retries |
| C2 | Scan/import reliability — page-limit messaging, import failure fallbacks | Consistent document state from camera/photos/files |
| C3 | iCloud/sync resilience — enable/disable, offline transitions, reconciliation messaging | No stale sync indicators; accurate conflict messages |
| C4 | StoreKit/premium gating hardening — restore, entitlement refresh | Entitlement state reflected without app relaunch |
| C5 | Accessibility audit + release gate command bundle | All Phase C checks green in one run |

### Quality Gate (Definition of Done)

- iOS Debug build passes
- macOS Debug build passes
- Full `BricksScanTests` passes
- `BricksScanUITests` smoke suite passes (when created)
- High-risk flows validated by automation + manual spot-check
- No known P0/P1 issues open

> **Note:** The `BricksScanUITests` UI test target was excluded from the Phase C deliverable by product decision. Manual smoke verification was used instead. See [Phase C Simulator Release Gate](#phase-c--simulator-release-gate).

---

## Phase C — Simulator Release Gate

**Date:** 2026-03-05

### Completed Engineering Work

#### C3 Finalize — Sync Reconciliation Deduplication (`CloudSyncStatusStore`)

Added deterministic seam `shouldRecordConflictResolutionUpdate(previousReport:incomingReport:)`. `recordConflictResolution(_:)` now suppresses duplicate conflict/recovery reports. Contract tests verify:

- Duplicate change reports are ignored
- Change → recovery is recorded once
- Repeated no-change is ignored
- Duplicate error messages are ignored
- Distinct errors are recorded

#### C4 Finalize — Entitlement Refresh/Restore Transitions (`StoreKitManager`)

Added deterministic seams:

- `restoreCompletionMessage(isPremium:)`
- `entitlementTransition(previousState:nextState:hasSubscriptionBillingIssue:)`

`restorePurchases()` uses `restoreCompletionMessage`. `applyAccessState` applies `entitlementTransition`, making status-message behavior explicit and testable.

`ValidationRulesLimitTests` expanded with premium flip coverage: upgrade prompts clear immediately after an entitlement change without requiring an app relaunch.

### Regression Command Bundle

```bash
xcodebuild -quiet -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.2' test

xcodebuild -quiet -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -configuration Debug -destination 'generic/platform=iOS' build

xcodebuild -quiet -project 'Bricks Scan.xcodeproj' -scheme 'Bricks Scan' \
  -configuration Debug -destination 'platform=macOS,arch=arm64' build
```

> **Note:** Running the iOS and macOS builds in parallel may cause a transient `build.db` lock. Run sequentially to avoid.

### Results (2026-03-05)

| Check | Result |
|-------|--------|
| `CloudSyncStatusStoreTests` | PASS |
| `StoreKitEntitlementDecisionTests` | PASS |
| `ValidationRulesLimitTests` | PASS |
| Full `BricksScanTests` (iPhone 17 / iOS 26.2) | PASS |
| iOS Debug build | PASS |
| macOS Debug build | PASS |

### Manual Smoke Checklist (Phase C close)

| Flow | Status |
|------|--------|
| Scan/import from camera, photos, files | PENDING — requires device/simulator interaction |
| Settings persistence across relaunch | PENDING |
| iCloud toggle/sync status transitions | PENDING |
| Paywall, purchase, restore | PENDING |
| Entitlement gating entry points | PENDING |
