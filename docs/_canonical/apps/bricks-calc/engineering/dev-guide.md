---
title: Bricks Calc Development Guide
doc_id: bricks-calc-engineering-dev-guide
doc_type: engineering
role: canonical
app_scope: bricks-calc
owner: Freddy
status: active
last_reviewed: 2026-04-23
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - development
---

# Bricks Calc — Development Guide

## Purpose

This guide explains how to write code that fits the current Bricks Calc codebase, and how to configure the development environment.

Use this with:

- [architecture.md](./architecture.md)
- [testing-strategy.md](./testing-strategy.md)

---

## Environment Setup

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Xcode | 16.0+ | Required for Swift 6 and current SDKs |
| macOS | 15.6+ | Matches current deployment target |
| Apple Developer account | Any | Free sufficient for simulator; paid required for device + CloudKit |

### Clone and Open

```bash
git clone <repo-url>
cd "Bricks Calc"
open "Bricks Calc.xcodeproj"
```

### Signing and Capabilities

The app uses:
- **CloudKit / iCloud container** — `NSPersistentCloudKitContainer`
- **App Group** — `group.com.bricks.calc` (shared with widget)
- **Background Modes** — Remote notifications (for CloudKit push)

When running on a personal team, CloudKit sync will not be available. The app functions locally without it.

### Deployment Targets

| Platform | Minimum |
|----------|---------|
| iOS / iPadOS | 18.6+ |
| macOS | 15.6+ |
| visionOS | 2.6+ |

---

## Core Patterns

### Views Must Not Save Directly

Views interact with data through `@EnvironmentObject var appState`. Never inject `modelContext` into views and never call `modelContext.save()` from a view.

```swift
// ✅ Correct
appState.saveCurrentCalculation()

// ❌ Wrong
modelContext.save()
```

### All Saves Go Through AppState

The only valid save paths are the explicit intent methods on `AppState`:
- `saveCurrentCalculation()`
- `updateCurrentCalculation()`
- `deleteCalculation(_:)`

While `AppState` exposes these methods to views, it internally delegates the actual lifecycle orchestration to the `CalculationLifecycleCoordinator`, which then calls `CalculationRepository` and `CalculationSideEffects`.

### In-Memory First

Always update `appState.currentCalculation` properties directly for instant UI feedback. Let SwiftUI react. Only call persist methods in response to a definitive user action (Save button, explicit confirm).

```swift
// ✅ Instant UI feedback
appState.currentCalculation.interestRate = newValue

// ✅ Save on explicit user action
appState.saveCurrentCalculation()
```

### Safe Math — Always Use DataValidator

For all floating-point math involving user input or percentages, use `DataValidator`:

```swift
DataValidator.safeDouble(value)
DataValidator.safeDivide(numerator, denominator)
```

This prevents `NaN` or `Infinity` crashes in the amortization engine.

### Widget Reloads

After any save, update, or delete that affects displayed calculation data, call:

```swift
WidgetCenter.shared.reloadAllTimelines()
```

This is already handled inside `CalculationSideEffects` — do not add additional calls outside of the side effects layer.

### Demo Data Generation

When building UI or writing tests, you may need realistic calculation data without manually typing inputs.

Use `DemoDataGenerator.swift` to generate fully populated `MortgageData` instances with representative home prices, prepayments, and rental income. This is the same generator used by the `OnboardingContainerView` for mock interfaces.

---

## App Intents Setup (Siri & Shortcuts)

Bricks Calc integrates with App Intents for Siri and Spotlight search.

### Intent Files

Ensure these files are present in the project and included in the **Bricks Calc** target:

- `Bricks Calc/Intents/CalculateMortgageIntent.swift`
- `Bricks Calc/Intents/ShowSavedCalculationIntent.swift`
- `Bricks Calc/Intents/BricksIntentsProvider.swift`
- `Bricks Calc/Core/SpotlightManager.swift`

### Required App Files

- `BricksCalcApp.swift` — must include `import CoreSpotlight` and `.onContinueUserActivity(CSSearchableItemActionType)`
- `AppState.swift` — must include `SpotlightManager.shared` and Spotlight indexing calls in save/update/delete methods

### Verification

1. Clean Build Folder (`⌘⇧K`)
2. Build (`⌘B`)
3. Run — Spotlight search should show saved calculations and "Calculate Mortgage" shortcut

**Common failures:**
- `"Cannot find 'AppIntent' in scope"` — check deployment target is iOS 18.6+ / macOS 15.6+
- `"Duplicate symbol"` — a file was added twice; remove the duplicate from target
- Files appear grayed out — check Target Membership in File Inspector

---

## Widget Setup

### App Group (Required)

Both the main app target and widget target must share the same App Group: `group.com.bricks.calc`

Configure under **Signing & Capabilities → App Groups** for both targets.

The shared SwiftData container is used by iOS, macOS, and visionOS. `WidgetDataProvider` prepares the App Group `Library/Application Support` directory before creating the `ModelContainer`; do not add separate visionOS persistence branches unless the platform capability changes.

### Shared Files

The widget target needs access to these files (check Target Membership in File Inspector):

- `MortgageData.swift`
- `AppTheme.swift`
- `DataValidator.swift`
- `WidgetDataProvider.swift`

### Widget Files

- `Bricks_Calc_Widget.swift`
- `Bricks_Calc_WidgetBundle.swift`
- `AppIntent.swift`

Ensure these have Target Membership set to **only** `Bricks Calc Widget`.

### Verification

Build and run the `Bricks Calc Widget` scheme to a simulator. Add the widget to the Home Screen. Save a calculation in the main app — the widget should update.

For visionOS builds, the widget uses a visionOS-safe container background and the app reloads WidgetKit timelines through the same `WidgetDataProvider.reloadWidgets()` path as iOS and macOS.

**Common failures:**
- `"Cannot find 'AppTheme' in scope"` — `AppTheme.swift` not checked for Widget target
- Widget shows placeholder data — App Group not configured correctly or shared SwiftData container failing to load; verify `group.com.bricks.calc`
- Widget doesn't update — `WidgetCenter.shared.reloadAllTimelines()` not being called in `AppState` through `WidgetDataProvider.reloadWidgets()`

### visionOS StoreKit

Use the shared store UI and `StoreKitManager` purchase contract on visionOS. Do not call `Product.purchase(options:)` directly for visionOS; SwiftUI passes `PurchaseAction` from the store view and the manager uses that platform-supported path.

---

## Design System Conformance

The Bricks Calc UI follows the [Bricks Brand Design System](../../../shared/brand/README.md) (Soft-Emboss identity, blue `#007AFF` accent). Implementation rules are in [`shared/brand/design-system.md`](../../../shared/brand/design-system.md). Design tokens are in [`shared/brand/tokens.json`](../../../shared/brand/tokens.json). When building or refactoring screens:

- **Tokens live in `AppTheme.swift`.** New surface tokens (canvas, emboss highlight/shadow, primary ink) and a `Shadow` enum (raised / soft / primaryDark recipes) sit alongside the existing color, spacing, and corner-radius tokens. Do not hard-code hex values or shadow tuples in views.
- **Surface modifiers live in `Components/SoftEmboss.swift`.** Use `.softEmbossRaised(radius:)` for hero cards, `.softEmbossSoft(radius:)` for chips/secondary cards, and `.softEmbossRecessed(radius:)` for input wells (sliders, text fields). Default radii follow the design system's three-tier family (12 / 24 / 48).
- **Primary CTA = `BricksPrimaryButtonStyle`.** Dark ink fill on canvas, traditional drop shadow, emboss-flip on press. There is at most **one** primary CTA per screen — every other action is a plain text button or an icon button.
- **Accent rule.** Blue is used as a thin inlay or single highlight per screen, never as a dominant fill. Charts use the accent for one segment and a cool-neutral tonal scale (`AppTheme.Colors.text.opacity(...)`) for the rest.
- **Copy.** Sentence case for everything (headings, buttons, labels). Follow the *what → why → stop* formula. Avoid the design system's banned word list (transform, unlock, supercharge, seamless, powerful, etc.).
- **Motion.** Subtle by default — opacity + small Y-offset reveals, ease-out 0.45–0.55 s, staggered 0.08 s between elements. Press feedback is a 0.97 scale, never a bounce. Always respect `accessibilityReduceMotion`.

The onboarding flow (`Views/Onboarding/`) is the canonical reference implementation of all of the above — copy patterns from there when building new screens.

---

## Naming Conventions

Use current model terms:

- `MortgageData` — the primary calculation document
- `PrepaymentData` — a prepayment record
- `ExpenseData` — an additional expense record
- `AppState` — the single observable state container
- `AppSettings` — user preferences stored in UserDefaults

---

## Common Build Issues

**SwiftData schema mismatch** — if you add or rename model properties, SwiftData may fail to load the existing store. During development, delete the app and reinstall to reset the store.

**Firebase package resolution warning** — ensure your network can reach GitHub. Firebase is included via Swift Package Manager.

**CloudKit not syncing on simulator** — CloudKit requires a real iCloud account. Use a device with a signed-in iCloud account for sync testing.
