---
title: Codebase Principles and Patterns
doc_id: shared-engineering-codebase-principles
doc_type: engineering
role: canonical
app_scope: shared
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - engineering
  - architecture
---

# Codebase Principles & Patterns

**Category:** Explanation

This document outlines the architectural patterns, structural principles, and UI conventions used across the codebase. It ensures consistency, maintainability, and high-quality local-first execution across all supported Apple platforms (iOS, macOS, visionOS).

## 1. Local-First Architecture (SwiftData + AppState)

### The Single Source of Truth
The core principle is that all mutable state representing the user's data passes through `AppState`.

*   **`AppState.swift`**: This `@MainActor` singleton handles high-level data orchestration.
*   **Decoupling Views from Persistence**: Views interact with the data layer via `@EnvironmentObject var appState: AppState`. Passing `@ModelContext` directly into views is explicitly avoided. This prevents unintended saves and keeps the data lifecycle tightly controlled.
*   **Explicit Saving**: Modifications remain in memory (`currentCalculation`) until the user explicitly saves or updates them.
*   **Performance Cache**: Components like `MortgageData` employ lazy caching for complex operations (Amortization Schedule generation). Cache invalidation is triggered manually when parameters change.

## 2. View Composition and Platform Adaptability

To keep view files maintainable while supporting different platforms, complex view logic is split into platform-specific subviews, orchestrated by a single entry point.

### The PlatformView Pattern
Instead of cluttering a single view with numerous `#if os(...)` conditional branches, logic is split:
1.  **Entry Point (e.g., `FilesView`)**: A simple struct that routes to the appropriate child view based on runtime/compile-time platform.
2.  **Compact Layouts (e.g., `iPhoneFilesView`)**: Tailored for iOS, utilizing `List` or standard vertical stacks.
3.  **Expansive Layouts (e.g., `iPadMacVisionFilesView`)**: Tailored for larger layouts using `NavigationSplitView` and sidebars.

This pattern handles complex views that behave significantly differently across Apple ecosystems.

## 3. Toolbar Organization

Toolbars follow a consistent pattern to ensure code reuse and clean view definitions.

### SharedToolbarButtons
Toolbar buttons are defined in a shared namespace (e.g., `SharedToolbarButtons`).
*   **Why**: It ensures identical styling (icons, labels, colors) and consistent behavior across different views.
*   **How**: Instead of declaring the `Button` directly inside `.toolbar { ... }`, views call `SharedToolbarButtons.newCalculationButton(...)`.

### ToolbarContent Components
Within a view, toolbar items are grouped using `@ToolbarContentBuilder`.

```swift
@ToolbarContentBuilder
private var toolbarContent: some ToolbarContent {
    ToolbarItemGroup(placement: .automatic) {
        // Items...
    }
}
```
Platform-specific items are isolated into separate computed properties (e.g., `macOSToolbarItems`, `iosToolbarItems`) and composed within the `.toolbar` modifier.

## 4. Input Validation & Form Safety

Input validation is strictly handled by central utilities.

### `DataValidator` and `InputValidator`
*   **`DataValidator`**: Used strictly for safe mathematical operations (e.g., `safeDivide`, `safeDouble`) to prevent NaN, Infinity, and divide-by-zero crashes.
*   **`InputValidator`**: Responsible for clamping user inputs and returning structured `ValidationError` arrays used by the UI to highlight problematic fields.

### Form Field Pattern
Complex forms bind intermediate text states to `Double` or `Int` fields gracefully. We typically use `.keyboardType(.decimalPad)` on iOS and handle focus changes explicitly to trigger validation.

## 5. Settings Management

Settings and user preferences bypass `SwiftData` entirely for speed.

### `SettingsManager` + `UserDefaults`
*   `SettingsManager.shared` manages a lightweight `AppSettings` struct.
*   This struct is persisted as JSON within `UserDefaults`.
*   This ensures near-instant read/write speeds (< 1ms), critical for app launch and immediate UI updates.

## 6. Testing Conventions

The codebase utilizes `XCTest` for all testing. Tests are grouped by component.

*   **Setup/Teardown**: Because the app relies heavily on Singletons (`AppState.shared`, `SettingsManager.shared`), tests explicitly save the initial state in `setUp()` and restore it in `tearDown()` to prevent test pollution.
*   **Isolation**: `@MainActor` should be applied to test classes that interact with `AppState` to ensure thread safety during assertions.
