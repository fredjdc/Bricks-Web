---
name: bricks-design
description: Use this skill to generate well-branded interfaces and assets for Bricks Apps (umbrella + Bricks Scan, Bricks Calc, Bricks Leads), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
title: Bricks Design Skill
doc_id: shared-brand-skill
doc_type: ai
role: canonical
app_scope: shared
owner: Freddy
status: active
last_reviewed: 2026-04-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - brand
  - skill
  - ai
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Fast reference

- **Products:** 4 surfaces sharing one language. Bricks umbrella (dark `#0B0F14`) · Bricks Scan (teal `#00A6A1`) · Bricks Calc (blue `#007AFF`) · Bricks Leads (orange `#FF9500`). Only the accent slot changes per product.
- **Identity:** "Soft-Emboss" — monochrome bas-relief on cool-neutral `#F6F7F8`. Shadows are directional pairs (cool-gray down-right, white up-left). Active state flips the emboss inside-out.
- **Type:** SF Pro system stack only. Inter is the acceptable free substitute — flag it.
- **Accent rule:** one accent per asset, used as a thin inlay or highlight — never a dominant fill. No gradients on objects. No glow. No emoji.
- **Voice:** clear, calm, useful. Copy formula: *state what it does → why it matters → stop.* Short stacks (one line per action). Sentence case. Avoid "unlock", "transform", "seamless", "powerful".
- **Tokens:** everything is in `colors_and_type.css`. Start there.

## When building something new

1. Pull in `colors_and_type.css` — don't re-invent tokens.
2. Copy logos and icons you need from `assets/`. Don't draw new SVG unless absolutely required.
3. Pick the product accent once. Scope it with `.accent-scan` / `.accent-calc` / `.accent-leads` / `.accent-umbrella`.
4. For UI surfaces, reference the appropriate kit in `ui_kits/`.
5. Read the README's *Content Fundamentals* before writing any copy.
