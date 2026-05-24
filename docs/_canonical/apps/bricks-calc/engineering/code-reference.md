---
title: Bricks Calc Code Reference
doc_id: bricks-calc-engineering-code-reference
doc_type: engineering
role: canonical
app_scope: bricks-calc
owner: Freddy
status: active
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - reference
---

# Bricks Calc — Code Reference

> Curated reference for the most important types in Bricks Calc. A fuller machine-readable reference can be produced by running `Bricks-Calc/scripts/generate_code_reference.py`; that script's output is not committed.

For architecture context and usage patterns, see [architecture.md](./architecture.md) and [dev-guide.md](./dev-guide.md).

---

## Key Types

### AppState

The single source of truth for all app state. Injected as `@EnvironmentObject` into the view hierarchy.

**Save methods:**
- `saveCurrentCalculation()` — persists current calculation, updates Spotlight, reloads widgets
- `updateCurrentCalculation()` — updates an existing saved calculation
- `deleteCalculation(_ calculation: MortgageData)` — deletes a saved calculation

### MortgageData

Primary document model. Stores all calculation inputs and results.

Key fields: `homePrice`, `downPayment`, `interestRate`, `loanTermMonths`, `prepayments`, `expenses`

### AppSettings

User preferences stored in `UserDefaults`. Managed by `SettingsManager`. Provides sub-millisecond access.

Key fields: `currency`, `language`, `defaultInterestRate`

### DataValidator

Static helpers for safe floating-point math.

- `safeDouble(_ value: Any?) -> Double`
- `safeDivide(_ numerator: Double, _ denominator: Double) -> Double`

### SpotlightManager

Manages CoreSpotlight indexing for saved calculations. Singleton: `SpotlightManager.shared`.

Called in `AppState` save/update/delete methods — do not call directly from views.

---

## Intent Files

- `CalculateMortgageIntent` — Siri intent for natural language mortgage calculation
- `ShowSavedCalculationIntent` — Siri intent for opening a saved calculation
- `BricksIntentsProvider` — App Intents provider registration

## Widget Files

- `Bricks_Calc_Widget` — primary widget view
- `Bricks_Calc_WidgetBundle` — widget bundle registration
- `WidgetDataProvider` — reads shared AppGroup data for widget display
