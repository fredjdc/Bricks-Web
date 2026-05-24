---
title: Design System Gap Report
doc_id: shared-brand-design-system-gap-report
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
  - audit
---

# Bricks Design System — Consolidation Gap Report
**Audit Date:** March 2026
**Scope:** Bricks Scan, Bricks Calc, Bricks Leads

---

## Executive Summary

You were right. The three apps do **not** share the same design system. Only **Bricks Calc** has an `AppTheme` and actively uses it (184 references). **Bricks Scan and Bricks Leads have zero `AppTheme` usage** — both apps use entirely inline, ad-hoc styling with hardcoded values scattered across every file.

The result is a fragmented visual language: different corner radius scales per app, hardcoded color literals that break dark mode in Bricks Leads, raw spacing numbers with no shared constants, and no reusable typography system outside of Bricks Calc.

---

## Gap 1 — Design Token Adoption

This is the most critical gap. `AppTheme.swift` exists only in Bricks Calc and is completely absent from the other two apps.

| App | AppTheme References | Raw Color Literals |
|---|---|---|
| Bricks Calc | **184** | 25 (residual `.primary`/`.secondary`) |
| Bricks Scan | **0** | 50 |
| Bricks Leads | **0** | 74 |

**What this means in practice:** If you ever want to change the accent color family, rebrand a semantic color (e.g. success green), or add a new background tier, you'd have to make that change in Bricks Calc in one place — and then hunt through ~124 scattered raw calls across Bricks Scan and Bricks Leads.

**Fix:** Copy `AppTheme.swift` (from Bricks Calc) into Bricks Scan and Bricks Leads as a shared starting point, then systematically replace all raw color/font/spacing literals.

---

## Gap 2 — Color: Hardcoded vs. System-Adaptive

Bricks Leads uses `Color.blue` and `Color.green` directly — **not** `UIColor.systemBlue` / `UIColor.systemGreen`. This is a significant bug. SwiftUI's static `Color.blue` and `Color.green` are fixed values that **do not adapt to dark mode or accessibility settings**. They'll look wrong in dark mode and fail high-contrast accessibility checks.

**Evidence from `LayoutComponents.swift` (Bricks Leads):**
```swift
// ❌ Wrong — static color, breaks dark mode
.fill(Color.blue.opacity(0.2))
.background(client.isPinned ? Color.blue.opacity(0.08) : ...)
.stroke(Color.blue, lineWidth: 1)
.background(property.isPinned ? Color.green.opacity(0.08) : ...)
.background(Color.blue)   // button backgrounds in SearchClientView, SearchPropertyView
```

**What it should be (using AppTheme):**
```swift
// ✅ Correct — adaptive, dark-mode safe
.fill(AppTheme.Colors.accent.opacity(AppTheme.Opacity.light))
.background(client.isPinned ? AppTheme.Colors.accent.opacity(AppTheme.Opacity.subtle) : ...)
.stroke(AppTheme.Colors.accent, lineWidth: 1)
.background(property.isPinned ? AppTheme.Colors.accentSecondary.opacity(AppTheme.Opacity.subtle) : ...)
```

**Bricks Scan** is mostly safer — it uses `.accentColor`, `.primary`, and `.secondary` which are system-adaptive — but it still doesn't go through `AppTheme`, meaning no centralized override point.

**Additional issue in Bricks Leads:** A one-off `Color.scheduleToolbarColor` extension (adaptive yellow/orange) was defined locally in `LayoutComponents.swift`. This is not part of any shared system.

```swift
// ❌ In Bricks Leads only — not in design system
static var scheduleToolbarColor: Color { ... } // yellow light / orange dark
```

This color has no equivalent in `AppTheme` and no documentation. It should either be promoted to `AppTheme.Colors.calendarAccent` or replaced with `accentTertiary` (systemOrange).

---

## Gap 3 — Corner Radius: Three Different Scales

Each app has developed its own de facto corner radius scale, and they don't match.

| Value | Bricks Scan (uses) | Bricks Leads (uses) | Bricks Calc (uses) |
|---|---|---|---|
| **4pt** | — | — | 6 |
| **8pt** | — | 3 | 4 |
| **10pt** | 6 | 2 | — |
| **12pt** | **16** | 13 | — |
| **16pt** | 14 | **36** | 1 |
| **18pt** | — | — | 9 |
| **24pt** | 3 | 12 | **16** |
| Other | scattered | scattered | scattered |

**The core conflict:** Bricks Leads uses `16pt` as its dominant card shape. Bricks Calc uses `24pt`. Bricks Scan uses `12pt` and `16pt` roughly equally. When users move between apps, the visual rhythm feels immediately different.

**No app has a named corner radius token.** Every value is a raw `CGFloat` literal.

`AppTheme` currently has no `CornerRadius` enum. One needs to be added and adopted.

**Proposed consolidated scale to add to AppTheme:**
```swift
enum CornerRadius {
    static let small: CGFloat = 8      // chips, tags, inline elements
    static let medium: CGFloat = 12    // icon containers, thumbnails
    static let large: CGFloat = 16     // list row cards
    static let extraLarge: CGFloat = 24 // modal sheets, feature cards
}
```

---

## Gap 4 — Typography: Only Bricks Calc Uses the System

Bricks Scan and Bricks Leads both call `.font()` with raw SwiftUI modifiers inline throughout every view. They do not use `AppTheme.Typography.*`.

**Bricks Scan examples (inline, no tokens):**
```swift
.font(.system(size: 44, weight: .semibold))   // magic number
.font(.title3.weight(.semibold))
.font(.caption)
.font(.body)
.font(.headline)
```

**Bricks Leads examples (inline, no tokens):**
```swift
.font(.headline)
.font(.caption)
.font(.title)
.font(.title2)
.font(.title3)
```

Bricks Leads uses `.font(.title)` (28pt bold) in places where Bricks Calc and Bricks Scan use `.font(.headline)` (17pt semibold) for similar UI contexts — meaning equivalent UI elements are sized differently across apps.

**Bricks Calc (correct):**
```swift
Text("Label").headlineStyle()    // uses AppTheme.Typography.headline()
Text("Value").bodyStyle()        // uses AppTheme.Typography.body()
```

**Fix:** Add `import` of the shared `AppTheme` to both apps, then replace raw `.font()` calls with the `Text` extension methods: `.headlineStyle()`, `.bodyStyle()`, `.captionStyle()`, etc.

---

## Gap 5 — Spacing: No Shared Constants Outside Bricks Calc

`AppTheme.Spacing` (none/tiny/small/medium/large/extraLarge) is only used in Bricks Calc. The other apps use raw integer literals everywhere.

**Bricks Scan — raw spacing:**
```swift
.padding(.horizontal, 8)
.padding(.top, 4)
.padding(24)
.padding(.horizontal, 40)
.padding(.bottom, 24)
```

**Bricks Leads — raw spacing:**
```swift
.padding(.horizontal, 16)
.padding(.vertical, 12)
.padding(.leading, 8)
.padding(16)
```

**Bricks Calc (correct):**
```swift
.padding(AppTheme.Spacing.medium)       // 16pt
.padding(AppTheme.Spacing.large)        // 24pt
```

The raw values in Bricks Scan and Bricks Leads often match the `AppTheme.Spacing` constants (8, 16, 24 are all represented), but because they're written as literals, there's no connection — changing the spacing system in `AppTheme` has zero effect on those apps.

---

## Gap 6 — Unique Components With No Cross-App Equivalent

Several UI components were built independently in each app and have no shared version:

| Component | Where It Exists | Status |
|---|---|---|
| `ToastCenter.swift` | Bricks Scan ✅, Bricks Leads ✅, Bricks Calc ❓ | Likely duplicated — needs consolidation |
| `TipCenter.swift` | Bricks Scan ✅, Bricks Leads ✅, Bricks Calc ❓ | Likely duplicated — needs consolidation |
| `MeshGradientBackground` | Bricks Leads only | Not available in other apps |
| `AppTheme.Colors.accentGradient` | Bricks Calc only | Not available in other apps |
| `scheduleToolbarColor` | Bricks Leads only | Undocumented one-off |
| `FolderCustomization` color palette | Bricks Scan only | 9-color user-selectable palette |

`ToastCenter.swift` and `TipCenter.swift` exist in both Bricks Scan and Bricks Leads — almost certainly duplicated code. These should become shared components.

---

## Consolidation Roadmap

Here is the recommended sequence to consolidate all three apps into the shared design system.

### Phase 1 — Foundation (highest impact, do first)

1. **Add `AppTheme.swift` to Bricks Scan and Bricks Leads.** Either share it via a Swift Package or copy the file into each project. This unlocks all subsequent fixes.

2. **Add `CornerRadius` enum to `AppTheme`.** Agree on the 4-value scale (8/12/16/24) and add it as `AppTheme.CornerRadius.*`.

3. **Fix dark-mode color bugs in Bricks Leads.** Replace all `Color.blue` and `Color.green` literals with `AppTheme.Colors.accent` and `AppTheme.Colors.accentSecondary`. This is a correctness fix, not just a style fix.

### Phase 2 — Style Consistency

4. **Replace raw corner radius literals.** In all three apps, replace raw `CGFloat` values with `AppTheme.CornerRadius.*` tokens. Focus on card shapes and icon containers first.

5. **Replace raw `.font()` calls in Bricks Scan and Bricks Leads.** Use the `Text` extension methods (`.headlineStyle()`, `.bodyStyle()`, etc.) from `AppTheme.Typography`.

6. **Replace raw `.padding()` literals** with `AppTheme.Spacing.*` constants in Bricks Scan and Bricks Leads.

7. **Promote `scheduleToolbarColor` to `AppTheme`.** Either add it as `AppTheme.Colors.calendarAccent` or replace it with the existing `accentTertiary` (systemOrange).

### Phase 3 — Component Sharing

8. **Audit `ToastCenter.swift` and `TipCenter.swift`** for duplicate implementations and unify into one canonical version.

9. **Add `MeshGradientBackground`** (from Bricks Leads) to the shared `AppTheme` components so it's available across all apps.

---

## Summary Table

| Issue | Severity | Bricks Scan | Bricks Leads | Bricks Calc |
|---|---|---|---|---|
| No AppTheme adoption | 🔴 Critical | ❌ 0 uses | ❌ 0 uses | ✅ 184 uses |
| Dark-mode color bugs | 🔴 Critical | ⚠️ Minimal | ❌ Color.blue/green | ✅ Clean |
| No corner radius tokens | 🟡 High | ❌ | ❌ | ❌ |
| Raw typography calls | 🟡 High | ❌ | ❌ | ✅ |
| Raw spacing literals | 🟡 High | ❌ | ❌ | ✅ |
| Duplicate components | 🟠 Medium | Toast, Tip | Toast, Tip | — |
| One-off color extensions | 🟠 Medium | — | scheduleToolbarColor | — |

---

*Bricks Design System Gap Report · March 2026*
