---
title: Bricks Brand System
doc_id: shared-brand-system
doc_type: product
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
  - brand
  - design-system
---

# Bricks Brand System

> **Scope — designers, writers, and product.** This document defines the *intent* of the Bricks visual and verbal identity: what the brand is, what the rules are, and why they exist. It is the reference for making design and copy decisions.
>
> For *engineering implementation* — Swift tokens, CSS variables, SwiftUI component patterns — see [`design-system.md`](./design-system.md).

The single source of truth for how Bricks looks, sounds, and feels — across every product, platform, and surface.

One brand. One system. Four accent colors.

---

## Products & Accent Colors

| Product | Accent | Hex | Surfaces |
|---|---|---|---|
| Bricks (umbrella) | Dark Gray / Black | `#0B0F14` | Main website, marketing, umbrella assets |
| Bricks Scan | Teal | `#00A6A1` | App, product page, App Store, social |
| Bricks Calc | Blue | `#007AFF` | App, product page, App Store, social |
| Bricks Leads | Orange | `#FF9500` | App, product page, App Store, social |

**The rule:** Everything else — visual language, typography, spacing, shadow system, voice, and tone — is identical across all products. Only the accent slot changes.

---

## System Structure

- **Brand Foundation** — Story, personality, archetypes, and core design principles → [brand-foundation.md](./brand-foundation.md)
- **Color System** — Two-layer color model: brand accents + native app system colors
- **Typography** — SF Pro across all surfaces; unified type scale
- **Visual Identity — Soft-Emboss** — The canonical visual language: material, lighting, shape, shadow, teal/accent placement
- **Surface Standards** — Rules per surface: native apps, website, App Store, social media, email
- **Per-App Identity** — Brand story, messaging, and visual notes for Scan, Calc, and Leads

---

## Color System

### Swift Apps (iOS / macOS)

Swift apps use Apple system colors. These adapt automatically to light mode, dark mode, high-contrast mode, and platform differences. **Never hardcode hex values in Swift.**

| Token | System Color | Usage |
|---|---|---|
| Primary text | `.primary` | Main content text |
| Secondary text | `.secondary` | Supporting text, captions |
| Accent / interactive | `.accentColor` | Buttons, links, active states — resolved per app |
| Background | `.background` | Main app background |
| Secondary background | `.secondarySystemBackground` | Cards, sheets, grouped rows |
| Separator | `.separator` | Dividers, borders |
| Destructive | `.red` (system) | Delete, destructive actions |

**Native interaction layer:** Apple system colors (systemBlue, systemOrange, systemMint) are the native interaction layer — distinct from the fixed brand accent hex values. The brand hex is for marketing surfaces. The system color is for in-app interactive elements.

### Web / Marketing

Web uses a fixed palette: cool neutrals as base, single accent per product.

| Token | Value | Usage |
|---|---|---|
| Background | `#FFFFFF` / `#F5F5F5` | Page background, card backgrounds |
| Surface | `#ECECEC` | Section fills |
| Text primary | `#0B0F14` | Headings, body |
| Text secondary | `#6B7280` | Supporting text |
| Bricks accent (umbrella) | `#0B0F14` | Main site CTAs, nav |
| Scan accent | `#00A6A1` | Scan product page, Scan social |
| Calc accent | `#007AFF` | Calc product page |
| Leads accent | `#FF9500` | Leads product page |

---

## Typography

SF Pro is used across all surfaces — apps and web.

- **Apps:** System font stack. SwiftUI `.font(.body)`, `.font(.title)`, etc. Scale with Dynamic Type. Never hardcode point sizes except for fixed UI elements.
- **Web:** `font-family: -apple-system, SF Pro, BlinkMacSystemFont, sans-serif`

| Role | Style |
|---|---|
| Display / Hero | SF Pro Display, Bold or Heavy |
| Heading | SF Pro Text, Semibold |
| Body | SF Pro Text, Regular |
| Caption / Label | SF Pro Text, Regular or Medium, reduced size |
| Code | SF Mono |

---

## Visual Identity — Soft-Emboss

The canonical visual language for all Bricks surfaces.

**Core principles:**
- No gradients on objects
- No glow
- No neon
- No warm grays, no beige — shadows are always cool-neutral
- The accent appears **once per asset**, as a recessed inlay — never as a dominant fill
- Typography is always SF Pro. No decorative or display typefaces
- Visual hierarchy must be clear on the first read
- Utility leads. Polish supports.

**Shadow system:** Soft neumorphic (emboss/deboss) rather than traditional drop shadows. Surfaces have physical weight without adding color noise.

**Accent placement:** One accent color per asset, used as a subtle inlay or highlight — not a fill, not a gradient endpoint.

---

## Surface Standards

### Native Apps

- System colors only — no hardcoded hex
- Material: `.background`, `.secondarySystemBackground`, grouped list style
- Accent: resolved via `.accentColor` — set per app in asset catalog
- Spacing: 8pt grid. Prefer SwiftUI spacing constants
- Corner radius: follow system defaults; use `RoundedRectangle(cornerRadius: 12)` as primary card radius

### Website

- Monochromatic base + single product accent
- Soft-Emboss shadow system
- SF Pro via system font stack
- CTA uses accent fill — one per section

### App Store

- Screenshots follow app visual language
- Headline copy follows brand voice formula
- No gradient overlays, no excessive feature badges

### Social Media

The purple→teal gradient from previous Social Media Standards is retired. All surfaces now follow the Soft-Emboss monochrome system. Per-app accent colors are used as a single inlay element.

### Email

SF Pro or system font. Monochromatic layout. Accent used sparingly for primary CTA only.

---

## Non-Negotiables

- No gradients on objects. No glow. No neon.
- No warm grays, no beige. Shadows are always cool-neutral.
- The accent appears **once per asset**, as a recessed inlay — never as a dominant fill.
- Typography is always SF Pro (system font). No decorative or display typefaces.
- Visual hierarchy must be clear on the first read.
- Utility leads. Polish supports.
- If an asset feels louder, trendier, or more decorative than the product itself — simplify it.

---

## Engineering Tokens

Design tokens live in: [`shared/brand/tokens.json`](./tokens.json)

Swift and CSS token specs: [`shared/brand/design-system.md`](./design-system.md)

Token adoption audit: [`shared/brand/design-system-gap-report.md`](./design-system-gap-report.md)
