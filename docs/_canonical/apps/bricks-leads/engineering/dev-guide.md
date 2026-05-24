---
title: Bricks Leads Development Guide
doc_id: bricks-leads-engineering-dev-guide
doc_type: engineering
role: canonical
app_scope: bricks-leads
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - leads
  - development
---

# Bricks Leads — Development Guide

## Purpose

This guide explains how to write code that fits the current Bricks Leads codebase.

Use this with:

- [architecture.md](./architecture.md)
- [shared/brand/design-system.md](../../../shared/brand/design-system.md) — Swift tokens, CSS variables, SwiftUI component patterns
- [shared/brand/tokens.json](../../../shared/brand/tokens.json) — shared design tokens
- [shared/engineering/codebase-principles.md](../../../shared/engineering/codebase-principles.md) — cross-app architecture patterns

---

## Environment Setup

| Tool | Version |
|------|---------|
| Xcode | 16.0+ |
| macOS | 15.0+ |
| Deployment target | iOS 18+ / macOS 15+ |

---

## Core Patterns

### Localization — No Hardcoded Strings

All user-facing strings must be localized. Never hardcode text in views.

```swift
// ✅ Correct
Text("content_welcome".localized)

// ❌ Wrong
Text("Welcome")
```

Add new strings and translations to `Localizable.xcstrings`. Spanish (`es`) is the source language; English (`en`) must be kept translated. Follow the naming pattern `viewname_description`.

### Address Search

Use `SearchAddressView` for any address input field. Do not build custom address pickers.

```swift
SearchAddressView(selectedAddress: $selectedAddress)
    .onChange(of: selectedAddress) { _, newAddress in
        if let address = newAddress {
            address.updateClient(client)     // or updateProperty(property)
        }
    }
```

`AddressDataManager.shared` manages CSV loading and caching. It loads on first use and should not be initialized manually in views.

### Toast Notifications

Use `ToastCenter` for non-blocking user feedback (success, warning, info messages).

### Tips

Use `TipCenter` for contextual in-app guidance. Do not embed tip text inline in views.

### Reusable Components

Before building new UI, check `Components/`:
- `FilterComponents` — for list filter controls
- `ScheduleListComponents` — for schedule-specific list items
- `DonutChart` — for any percentage or breakdown visualization
- `AnimationComponents` — for loading states and transitions

---

## Adding a New Entity Type

If you add a new entity type beyond Client, Property, and Schedule:

1. Add the model to `Model/Models.swift`
2. Create `[Entity]ListView.swift`, `[Entity]DetailView.swift`, `[Entity]FormView.swift` in `Views/`
3. Add navigation routes in `ContentView.swift`
4. Add localization keys for all user-facing strings
5. Update `MetricsView` if the entity should appear in analytics

---

## Localization

### Adding New Strings

1. Add the key to `Localizable.xcstrings`
2. Add the Spanish source value and English translation
3. Use the `.localized` extension in views

### Switching Language (in-app)

Language switching is handled by `LocalizationManager`:

```swift
LocalizationManager.switchLanguage(to: .spanish)
let current = LocalizationManager.currentLanguage
```

Language preference is saved in `UserDefaults` with key `selected_language`. App restart is required for full language change.

---

## Testing Localization

1. Change simulator/device language to Spanish
2. Verify all strings display correctly in Spanish
3. Use the language picker in Settings to switch languages
4. Restart the app to confirm the change persists
5. Verify no untranslated English strings remain visible
