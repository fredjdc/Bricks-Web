---
title: Bricks Calc Testing Strategy
doc_id: bricks-calc-engineering-testing-strategy
doc_type: engineering
role: canonical
app_scope: bricks-calc
owner: Freddy
status: needs-review
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - testing
---

# Bricks Calc — Testing Strategy

## Test Scope

Bricks Calc protects its deterministic mortgage math, validation rules, saved-calculation write path, and Apple-platform integrations with a mix of XCTest coverage, a small accessibility-focused UI suite, and targeted manual verification.

The automated suite primarily covers:

- mortgage calculation behavior in `MortgageCalculator` and `MortgageData`
- validation and formatting helpers
- `AppState`, settings, reminders, Spotlight, widget data access, and CloudKit sync state
- platform-conditional behavior that should stay consistent across iPhone, iPad, Mac, and visionOS
- AI snapshot prompt generation, without relying on live Foundation Models output

The suite does not fully automate end-to-end behavior for CloudKit replication, widget rendering, StoreKit purchase flows, Spotlight handoff, or Foundation Models availability. Those remain manual release checks.

## Test Layers

- Unit: `Bricks Calc Tests/` covers calculation logic (`MortgageCalculatorTests`, `RefinanceCalculatorTests`), input validation, model behavior (`MortgageDataModelTests`, `MortgageDataCopyNormalizationTests`), presentation formatting (`MortgagePresentationTests`, `CurrencyAndFormattingTests`), settings persistence, reminder scheduling, Spotlight indexing, widget data access, CloudSyncManager state transitions, and AI snapshot generation.
- Integration: `AppStateTests`, `FinancialWorkflowServiceTests`, `CalculationLifecycleCoordinatorTests`, `CalculationRepositoryTests`, `SpotlightManagerTests`, `WidgetDataProviderTests`, `CloudSyncManagerTests`, and reminder-related tests exercise multi-component flows without requiring a full UI session.
- UI: `Bricks Calc UI Tests/BricksCalcAccessibilityUITests.swift` verifies three seeded scenarios: empty files state, opening a saved calculation into results, and launching the calculator at an accessibility content size.
- Manual verification: widgets, App Intents and Spotlight launch paths, StoreKit purchase and restore behavior, CloudKit sync across devices, and Foundation Models availability/fallback behavior.

## Critical Flows To Protect

1. A user can enter a mortgage scenario, calculate results, and get stable monthly payment, total-cost, and amortization outputs.
2. Saved calculations persist only through `AppState` save and update flows, then remain visible to files, widgets, and Spotlight.
3. Financial adjustments such as prepayments, property tax, home insurance, and recurring expenses change totals without corrupting the amortization schedule.
4. Reminder state, settings, and shared widget data remain consistent after edits, deletes, and app relaunches.
5. The app stays usable when optional systems are unavailable, including iCloud sync, Firebase Analytics, and Apple Intelligence features.

## Commands and Execution

Run from `Bricks-Calc/` (repo root).

```bash
xcodebuild -project "Bricks Calc.xcodeproj" -scheme "Bricks Calc" -destination "platform=iOS Simulator,name=iPhone 17,OS=latest" -only-testing:"Bricks Calc Tests" test
xcodebuild -project "Bricks Calc.xcodeproj" -scheme "Bricks Calc" -destination "platform=iOS Simulator,name=iPhone 17,OS=latest" -only-testing:"Bricks Calc UI Tests" test
xcodebuild -project "Bricks Calc.xcodeproj" -scheme "Bricks Calc WidgetExtension" -destination "platform=iOS Simulator,name=iPhone 17,OS=latest" build
```

The unit-test command above was run on 2026-04-06 and succeeded.

## Test Data and Helpers

- Fixtures: `MortgageCalculatorTests` and related suites build realistic `MortgageData` inputs with explicit home price, down payment, insurance, expense, and prepayment values.
- Factories: `AppState.makeUITestCalculation(...)` in `Core/UITestSupport.swift` seeds stable UI-test scenarios for empty, saved, and editable calculation states.
- Mocks/stubs: most tests rely on real in-process app types and controlled `UserDefaults` or shared-container behavior rather than a dedicated mock layer.

## Release Gates

- Unit tests for `Bricks Calc Tests` pass on the primary iPhone simulator destination.
- Accessibility UI tests pass for the seeded files, results, and calculator scenarios.
- Manual widget verification confirms a saved calculation appears in the widget and widget deep links reopen the expected result.
- Manual system integration checks confirm Spotlight result handoff, App Intents discovery, and reminder scheduling still work after save, update, and delete flows.
- Manual product checks confirm premium purchase and restore paths, plus Apple Intelligence availability and fallback messaging, still behave correctly on supported and unsupported environments.

## Known Gaps

- There is no automated end-to-end test for real CloudKit synchronization between separate devices or Apple accounts.
- Widget tests cover data-provider behavior but not full rendered widget snapshots across families.
- StoreKit coverage is indirect; purchase UI, transaction recovery, and restore flows still depend on manual validation.
- Foundation Models behavior is only tested around snapshot preparation and availability boundaries, not live model responses.
- The UI suite is intentionally small and does not yet cover comparison mode, sharing, settings, or reminder menus.
