---
title: Bricks Design System
doc_id: shared-brand-design-system
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
  - design-system
---

# Bricks Design System
**Version 1.0 · March 2026**

> **Scope — engineers.** This document defines *how to implement* the Bricks design system in code: Swift tokens, CSS variables, SwiftUI component patterns, and cross-platform consistency rules. It is the reference for building and auditing production UI.
>
> For the *intent* behind these rules — brand principles, visual identity rationale, voice guidelines — see [`brand-system.md`](./brand-system.md).

Extracted from: Bricks Scan, Bricks Calc, Bricks Leads (SwiftUI · iOS · macOS) and Bricks Page (HTML/CSS · Web).

---

## 1. Brand Identity

The Bricks product family shares a single design philosophy: **native-first, system-aware, and monochromatic at heart.** Native apps defer to Apple's system colors and materials to feel at home on each platform. The website uses a cool neutral palette with a single teal accent to feel clean, premium, and focused.

### Design Principles

**System-native.** Swift apps use Apple system colors (systemBlue, systemGreen, etc.) rather than fixed hex values, ensuring automatic light/dark mode adaptation and native accessibility support across iOS and macOS.

**Monochromatic with intent.** The web design system is intentionally monochrome — off-white backgrounds, cool grays, near-black text — with teal (`#00A6A1`) as the single chromatic accent. This restraint signals confidence and quality.

**SF Pro everywhere.** Both apps and website use the SF Pro typeface family, creating a seamless, cohesive experience for Apple users across all touchpoints.

**Bas-relief depth.** The website uses a soft neumorphic shadow system (emboss/deboss) rather than traditional drop shadows, giving surfaces physical weight without adding color noise.

---

## 2. Color System

### 2.1 Swift Apps (iOS · macOS)

Swift apps use Apple system colors. These adapt automatically to light mode, dark mode, high-contrast mode, and platform differences (iOS vs macOS). **Do not hardcode hex values in Swift apps.**

| Token | System Color | Usage |
|---|---|---|
| `Colors.accent` | `systemBlue` | Primary interactive: buttons, links, active states |
| `Colors.accentSecondary` | `systemGreen` | Success, positive feedback, secondary actions |
| `Colors.accentTertiary` | `systemOrange` | Warnings, chart tertiary, caution indicators |
| `Colors.accentQuaternary` | `systemGray` | Toolbar buttons, info states, muted UI |
| `Colors.accentPro` | `systemPurple` | Pro/premium features, upgrade prompts |
| `Colors.backgroundPrimary` | `systemBackground` / `windowBackgroundColor` | Base view background |
| `Colors.backgroundSecondary` | `secondarySystemBackground` / `quinaryLabel` | Cards, panels, sidebars |
| `Colors.backgroundInput` | `secondarySystemBackground @ 0.6` | Input field backgrounds |
| `Colors.text` | `label` / `labelColor` | Primary text |
| `Colors.textSecondary` | `secondaryLabel` / `secondaryLabelColor` | Captions, metadata, helper text |
| `Colors.textAccent` | `white` | Text on colored/filled surfaces |
| `Colors.success` | `systemGreen` | Positive states, completed actions |
| `Colors.warning` | `systemOrange` | Caution, limit warnings |
| `Colors.error` | `systemRed` | Errors, destructive actions |
| `Colors.info` | `systemGray` | Neutral info states |

#### Per-App Accent Colors

Each app has its own accent color defined in its Asset Catalog:

| App | Accent Color |
|---|---|
| Bricks Scan | `systemMint` |
| Bricks Calc | `systemBlue` |
| Bricks Leads | `systemBlue` |

#### Gradients

**accentGradient** — Used for immersive hero/store backgrounds.
```swift
LinearGradient(
    colors: [.black, .blue.opacity(0.6), .black, .black, .black],
    startPoint: .topLeading, endPoint: .bottomTrailing
)
```

**appleIntelligenceGradient** — Used for AI feature indicators.
```swift
LinearGradient(
    colors: [.blue, .purple, .pink, .red, .orange],
    startPoint: .bottomLeading, endPoint: .topTrailing
)
```

#### Opacity Scale

| Token | Value | Usage |
|---|---|---|
| `Opacity.subtle` | 0.1 | Very light overlays |
| `Opacity.light` | 0.2 | Subtle highlights |
| `Opacity.medium` | 0.5 | Background tints |
| `Opacity.high` | 0.8 | Near-opaque overlays |

---

### 2.2 Web (Bricks Page)

The website is intentionally **monochromatic** — only one chromatic color exists in the entire palette.

| CSS Variable | Hex Value | Usage |
|---|---|---|
| `--bg-primary` | `#F6F7F8` | Page background (off-white base) |
| `--bg-white` | `#FFFFFF` | Surfaces, cards, containers |
| `--surface-shadow` | `#E7ECEF` | Cool gray — shadow anchor for emboss |
| `--depth-plane` | `#C9D3DA` | Cool gray — depth and border definition |
| `--edge-def` | `#9AA7B2` | Edge/seam color |
| `--text-primary` | `#0B0F14` | Near-black — all headings and UI text |
| `--text-secondary` | `#55626E` | Secondary text, descriptions, labels |
| `--accent-color` | `#000000` | Interactive black — buttons, links |
| `--accent-hover` | `#333333` | Hover state for black interactive elements |
| `--accent-teal` | `#00A6A1` | **The only chromatic accent.** Use sparingly. |
| `--success-color` | `#34c85a` | Success states, confirmations |

---

## 3. Typography

All platforms share the **SF Pro** typeface family. On web, this is requested via the system font stack.

### Font Stack

**Swift:** `.system(size:, weight:, design:)` — defaults to SF Pro.

**Web:**
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
```

### Font Designs (Swift only)

| Token | Value | Usage |
|---|---|---|
| `Typography.defaultDesign` | `.default` | All standard text |
| `Typography.roundedDesign` | `.rounded` | Buttons, numeric displays, friendly UI |

### Type Scale

| Role | Swift Size (pt) | Web Size (px) | Weight | Notes |
|---|---|---|---|---|
| Large Title | 34 | — | — | Rarely used; empty state headlines |
| Hero Title | — | 56px | 900 | Web only |
| Title | 28 | — | bold | Screen/page titles |
| Section Title | — | 36px | 900 | Web section headings |
| Title 2 | 24 | — | bold | Section headings |
| Title 3 | 20 | — | semibold | Subsection headings |
| Subheading | — | 22px | 600 | Web card headings |
| Headline | 17 | — | semibold | List headers, data labels |
| Body | 16 | 18px | regular | Main content |
| Subheadline | 15 | — | regular | Supporting labels |
| Caption | 14 | 14px | regular | Timestamps, metadata |
| Footnote | 13 | — | regular | Disclaimers, supplementary |
| Small | 12 | — | regular | Fine print, legal |

### Text Style Extensions (Swift)

Pre-built `Text` modifiers for consistent application. Always prefer these over manual `.font()` + `.foregroundColor()` calls.

```swift
Text("Hello").titleStyle()             // 28pt bold, primary color
Text("Section").title2Style()          // 24pt bold, primary color
Text("Subsection").title3Style()       // 20pt semibold, primary color
Text("Label").headlineStyle()          // 17pt semibold, primary color
Text("Content").bodyStyle()            // 16pt regular, primary color
Text("Support").subheadlineStyle()     // 15pt regular, primary color
Text("Muted").secondarySubheadlineStyle() // 15pt regular, secondary color
Text("Tag").captionStyle()             // 14pt regular, primary color
Text("Meta").secondaryCaptionStyle()   // 14pt regular, secondary color
Text("Note").footnoteStyle()           // 13pt regular, primary color
Text("Fine").secondaryFootnoteStyle()  // 13pt regular, secondary color
Text("Field Label").inputLabelStyle()  // 14pt regular, secondary color
```

### Input & Button Typography (Swift)

| Usage | Font |
|---|---|
| Input field label | `caption` size, `regular` weight |
| Input field value | `body` size, `regular` weight |
| Button | `headline` size, `semibold` weight |

### Web Typography Refinements

| Style | Letter Spacing |
|---|---|
| Hero title, section title | `-0.03em` |
| Default headings | `-0.02em` |
| Labels, badges, metadata | `+0.05em` |

Web body text line height: **1.6** (relaxed). Default line height: **1.5**.

---

## 4. Spacing

### 4.1 Swift Spacing Scale

Defined in `AppTheme.Spacing`. Always use these tokens — do not use magic numbers.

| Token | Value (pt) |
|---|---|
| `Spacing.none` | 0 |
| `Spacing.tiny` | 4 |
| `Spacing.small` | 8 |
| `Spacing.medium` | 16 |
| `Spacing.large` | 24 |
| `Spacing.extraLarge` | 32 |

### Standard Edge Insets (Swift)

| Token | Top | Leading | Bottom | Trailing |
|---|---|---|---|---|
| `Spacing.listItemPadding` | 4 | 0 | 4 | 0 |
| `Spacing.sectionHeaderPadding` | 16 | 16 | 8 | 16 |
| `Spacing.contentPadding` | 20 | 20 | 20 | 20 |

### 4.2 Web Spacing Scale

| Variable | Value | Usage |
|---|---|---|
| `--space-sm` | 32px | Inner section padding |
| `--space-md` | 64px | Section vertical rhythm |
| `--space-lg` | 96px | Large section separation |
| Container padding | 24px | Horizontal page gutter |

---

## 5. Border Radius

| Token | Swift (pt) | Web (px) | Usage |
|---|---|---|---|
| Icon container | 12 | 12 | Icon backgrounds, avatar containers |
| Small detail | — | 12 (`--r1-small`) | Chips, badges, small UI details |
| Inner cutout | — | 24 (`--r2-inner`) | Card inner radius, nested elements |
| Primary silhouette | — | 48 (`--r3-primary`) | Main card/panel outer shape |
| Default | — | 8 (`--radius`) | General-purpose fallback |

---

## 6. Shadow System (Web)

The website uses a **Soft Emboss / Bas-Relief** shadow language. Surfaces appear physically pressed into or raised from the background. This requires the background and surface to share the same base color family.

| Token | CSS Value | Usage |
|---|---|---|
| `--shadow-soft` | `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)` | Card resting state |
| `--shadow-hover` | `0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | Card hover/focus lift |
| `--emboss-raised` | `12px 12px 24px #E7ECEF, -12px -12px 24px #FFFFFF` | Raised surface (neumorphic) |
| `--emboss-raised-hover` | `16px 16px 32px #E7ECEF, -16px -16px 32px #FFFFFF` | Raised surface on hover |
| `--emboss-recessed` | `inset 6px 6px 12px #E7ECEF, inset -6px -6px 12px #FFFFFF` | Pressed/recessed surface |
| `--micro-seam` | `inset 0 1px 2px #C9D3DA` | Subtle inner top-edge seam |

> **Rule:** Never use drop shadows and emboss shadows on the same element. Choose one language per component and stay consistent.

---

## 7. Animation (Web)

| Token | Curve | Usage |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Panels, drawers, page transitions |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.15)` | Bouncy micro-interactions |
| `--ease-reveal` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Content reveal on scroll |
| `--animation-timing` | `0.3s ease` | Default transition duration |

Swift apps use SwiftUI's built-in `.spring()`, `.easeInOut()`, and `.interactiveSpring()` — no custom curves needed.

---

## 8. Layout (Web)

| Token | Value | Usage |
|---|---|---|
| `--max-width` | 1100px | Primary content container |
| `--reading-width` | 720px | Long-form text columns |
| `.grid-2` | 2 columns, 64px gap | Feature comparisons, two-up layouts |
| `.grid-3` | auto-fit, min 300px, 48px gap | Feature grids, card collections |

**macOS Window Constraints (Swift):**

| App | Min Width | Min Height |
|---|---|---|
| Bricks Scan | 800pt | 700pt |
| Bricks Scan (panel) | 520pt | 420pt |
| Bricks Scan (metadata) | 400pt | 480pt |

---

## 9. Iconography

All platforms use **Apple SF Symbols** exclusively. Icons scale automatically with Dynamic Type and support multicolor, hierarchical, and palette rendering modes.

### Core Symbol Vocabulary

These symbols appear across 2 or more apps and form the brand's visual vocabulary:

| Category | Symbols |
|---|---|
| Navigation | `chevron.left`, `chevron.right`, `chevron.down`, `chevron.up`, `arrow.clockwise` |
| Documents | `doc.text`, `doc.on.doc`, `photo`, `arrow.up.forward` |
| Actions | `plus`, `pencil`, `trash`, `xmark`, `checkmark`, `square.and.arrow.up` |
| Status | `checkmark.circle.fill`, `xmark.circle.fill`, `exclamationmark.triangle.fill`, `info.circle` |
| User | `person.crop.circle`, `person.crop.circle.fill` |
| Time | `calendar`, `clock`, `calendar.badge.plus`, `calendar.badge.clock` |
| Premium | `crown.fill`, `star.fill` |
| Settings | `gearshape`, `gear` |
| Data | `chart.pie`, `dollarsign.circle`, `receipt` |

### App-Specific Symbols

**Bricks Scan:** `camera.viewfinder`, `doc.text.viewfinder`, `crop`, `arrow.up.to.line`, `arrow.down.to.line`, `bell`, `bell.badge`

**Bricks Calc:** `chart.xyaxis.line`, `percent`, `building.columns`, `receipt.fill`, `equal.circle.fill`, `hand.draw.fill`

**Bricks Leads:** `building`, `mappin.and.ellipse`, `phone`, `envelope`, `bed.double`, `car`, `person.badge.plus`, `location`, `map`

---

## 10. Component Patterns

### 10.1 Swift App Components

**AppTheme** (`Bricks-Calc/Components/AppTheme.swift`) — The single source of truth for all design tokens in Swift. All apps should converge on this file or maintain their own equivalent.

**View Extensions:**
```swift
// Apply accent color
someView.accentColor()          // → foregroundColor(AppTheme.Colors.accent)
someView.secondaryTextColor()   // → foregroundColor(AppTheme.Colors.textSecondary)
```

**Icon Containers:** Icon backgrounds use `RoundedRectangle(cornerRadius: 12)` with size `48×48pt`.

**Chart Colors:** Always use `AppTheme.Colors.chartPrimary`, `chartSecondary`, `chartTertiary` for consistent multi-series charts.

### 10.2 Web Components

**Bas-Relief Card (raised):**
```css
background: var(--bg-primary);
box-shadow: var(--emboss-raised);
border-radius: var(--r3-primary);
```

**Bas-Relief Card (hover state):**
```css
box-shadow: var(--emboss-raised-hover);
```

**CTA Button:**
```css
background: var(--accent-color);  /* #000000 */
color: white;
border-radius: var(--r1-small);   /* 12px */
```

**Typography hierarchy on web:**
```css
/* Hero */
font-size: 56px; font-weight: 900; letter-spacing: -0.03em;

/* Section title */
font-size: 36px; font-weight: 900; letter-spacing: -0.03em;

/* Card heading */
font-size: 22px; font-weight: 600;

/* Body */
font-size: 18px; font-weight: 400; line-height: 1.6; color: var(--text-secondary);

/* Metadata/badge */
font-size: 14px; letter-spacing: 0.05em;
```

---

## 11. Cross-Platform Consistency Rules

1. **Font family is always SF Pro.** Web uses the system font stack that resolves to SF Pro on Apple devices.
2. **Never hardcode hex values in Swift.** Use `AppTheme.Colors.*` tokens that wrap system semantic colors.
3. **Teal (`#00A6A1`) is web-only.** It has no Swift equivalent. Do not introduce it into native apps without a deliberate design decision.
4. **Bricks Scan uses Mint; Calc and Leads use Blue.** Per-app accent colors are set in the Asset Catalog and should not be overridden inline.
5. **All icons are SF Symbols.** Do not use custom icon assets when a suitable SF Symbol exists.
6. **Corner radius 12pt is the standard icon container size** across both platforms.
7. **Spacing tokens must come from `AppTheme.Spacing`** in Swift. Do not use raw integer literals for layout values.
8. **The `AppTheme` enum in Bricks-Calc is the canonical design token file.** Bricks Scan and Bricks Leads should adopt or mirror it.

---

## 12. Files

| File | Description |
|---|---|
| `DESIGN-SYSTEM.md` | This document — the human-readable style guide |
| `tokens.json` | Machine-readable token file — all values in one structured JSON |
| `Bricks-Calc/Bricks Calc/Components/AppTheme.swift` | Swift source of truth for all design tokens |
| `Bricks-Page/styles.css` | Web CSS — all custom properties in `:root` |

---

*Bricks Design System · Extracted by design audit · March 2026*
