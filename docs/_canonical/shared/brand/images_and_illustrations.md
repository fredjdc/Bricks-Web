---
title: Bricks Image & Illustration Guide
doc_id: shared-brand-images-and-illustrations
doc_type: product
role: canonical
app_scope: shared
owner: Freddy
status: active
last_reviewed: 2026-04-25
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - brand
  - images
  - illustrations
---

# Bricks Image & Illustration Guide

This guide defines how to create non-product artwork for Bricks surfaces while staying aligned with the shared brand system and design system.

Use it for survey covers, feedback boards, changelog art, roadmap images, empty states, thank-you screens, and small editorial illustrations.

Do not use it for app UI, logos, icons inside native apps, product screenshots, or App Store screenshots. Those are governed by [`brand-system.md`](./brand-system.md), [`design-system.md`](./design-system.md), [`tokens.json`](./tokens.json), and app-specific documentation.

---

## Source Of Truth

Use these files in this order:

1. [`brand-system.md`](./brand-system.md) — visual identity, accent rules, surface standards.
2. [`design-system.md`](./design-system.md) — implementation tokens, radii, typography, shadow system.
3. [`colors_and_type.css`](./colors_and_type.css) — canonical web tokens.
4. [`tokens.json`](./tokens.json) — machine-readable token values.
5. [`brand-voice-guide.md`](./brand-voice-guide.md) — copy rules that accompany imagery.

This file adds generation guidance only. It does not create new tokens.

---

## Design Position

Bricks imagery is quiet, useful, and system-aware. It should feel like the visual extension of the product interface, not a separate illustration style.

The canonical style is:

**Soft-Emboss — monochrome bas-relief on a cool-neutral surface.**

Core rules:

- The base surface is cool off-white: `#F6F7F8`.
- The asset uses one continuous material language.
- Depth comes from paired emboss shadows, not from drop shadows.
- The product accent appears once, as a small inlay or highlight.
- Typography, logos, UI chrome, and rendered text are excluded from generated artwork.
- Utility leads. Polish supports.

---

## Surface Routing

| Surface | Use generated artwork? | Direction |
|---|---:|---|
| Native app UI | No | Use SwiftUI, SF Symbols, semantic system colors, and app tokens. |
| Native empty states | Sometimes | Prefer SF Symbols and native layout first. Use generated artwork only for onboarding or branded editorial moments. |
| Website / marketing | Yes | Use Soft-Emboss art with one product accent. |
| Typeform surveys | Yes | Use a single quiet subject on `#F6F7F8`. |
| UserJot boards | Yes | Use horizontal Soft-Emboss headers and simple empty-state art. |
| App Store screenshots | No | Use real product UI and screenshot standards. |
| Social / release graphics | Yes | Use the same Soft-Emboss system. No alternate campaign style. |

Generated artwork is the fallback after existing assets. Reuse `assets/feature-icon-01.svg` through `feature-icon-07.svg` when they fit.

---

## Accent Rules

Only the accent slot changes by product.

| Product | Accent | Hex | Use |
|---|---|---|---|
| Bricks umbrella | Dark | `#0B0F14` | Cross-product, brand-level, general feedback |
| Bricks Scan | Teal | `#00A6A1` | Scan marketing, surveys, feedback boards |
| Bricks Calc | Blue | `#007AFF` | Calc marketing, surveys, feedback boards |
| Bricks Leads | Orange | `#FF9500` | Leads marketing, surveys, feedback boards |

Rules:

- Use exactly one accent per asset.
- Keep the accent below roughly 10% of the image area.
- Use the accent as a thin inlay, recessed well, small chip, or single status mark.
- Do not use the accent as a background, object fill, gradient endpoint, or repeated decoration.
- Do not mix product accents.
- Do not use `#00C7B2` for generated artwork. It is a web hover/vivid token, not the Scan illustration accent.

Native Swift apps do not use these hex values directly. They use semantic/system colors and per-app `.accentColor`.

---

## Soft-Emboss Material

Every generated image should include these material attributes:

- Off-white cool-neutral canvas: `#F6F7F8`.
- White highlight: `#FFFFFF`, upper-left.
- Cool-gray shadow: `#E7ECEF`, lower-right.
- Optional depth edge: `#C9D3DA`, used only as a subtle recess definition.
- Shapes appear raised from or pressed into the same surface.
- No outlines, strokes, linework, sketch marks, or contour drawing.
- No object gradients, glow, neon, texture, grain, paper, vignette, or warm beige cast.
- No clay, plasticine, toy, glass, metallic, or generic 3D render style.

Use the design-system radius family:

| Role | Radius |
|---|---:|
| Small detail | 12 px |
| Inner cutout | 24 px |
| Primary silhouette | 48 px |

---

## Composition

- Use one primary subject.
- Keep 60-70% of the canvas visually quiet.
- Place the subject centered or slightly off-center with clear margins.
- Keep the subject around 40-60% of the short edge.
- Use simple geometry: circles, rounded rectangles, pills, document cards, wells, panels, and soft-cornered blocks.
- Use real-estate objects only when they clarify the surface: documents, keys, floor plans, calculators, houses, maps, cards, receipts, doors, signs.
- Avoid people, faces, hands, mascots, characters, scenes, rooms, landscapes, vehicles, and decorative props.
- Avoid rendered UI unless the task is specifically a product screenshot. Generated artwork should not fake an app screen.

The image should still make sense if the accent is removed.

---

## Typeform Guidance

Typeform background should be `#F6F7F8`. Export PNGs with transparency when possible.

| Screen | Purpose | Illustration brief |
|---|---|---|
| Welcome cover | Sets context before questions | One product-relevant object. Example: document stack for Scan, calculator key for Calc, client card for Leads. |
| Section divider | Separates question groups | Two or three simple rounded shapes. One small accent inlay. |
| Question state | Adds rhythm without adding message load | Small recessed well, pill, or object fragment. No text. |
| Thank-you | Confirms completion | Recessed checkmark well or open-door shape. Accent appears once. |
| Error / skipped | Indicates a problem calmly | Empty recessed well or muted object. Use destructive red only when the platform requires it. |

Do not make Typeform art do the work of the copy. The copy states the task. The image supports it.

---

## UserJot Guidance

| Surface | Purpose | Illustration brief |
|---|---|---|
| Board header hero | Sets product context | Horizontal arrangement around the product metaphor. 16:9 or 21:9. Accent once. |
| Empty state | Indicates no posts yet | One quiet object, such as an empty well, envelope, or rounded card. |
| Category thumbnail | Helps scanning | Reuse existing feature icons first. Generate only when none fit. |
| Changelog hero | Frames release notes | Two or three shapes tied to the release theme. Editorial, not celebratory. |
| Roadmap state icon | Shows status | Small recessed wells: empty circle, half-filled well, filled dot. Accent only on shipped/complete. |

Avoid confetti, sparkles, badges, countdowns, progress gimmicks, and launch-style decoration.

---

## Prompt Template

Use this structure. Keep prompts short and specific.

```text
A Soft-Emboss monochrome bas-relief illustration of {SUBJECT}.
Off-white cool-neutral canvas, hex #F6F7F8. Flat surface, no texture or grain.
The subject appears {raised from | pressed into} the same continuous material.
Soft paired shadows: cool-gray #E7ECEF down-right and white #FFFFFF up-left.
Rounded geometry only, using 12 px, 24 px, and 48 px radii.
A single {PRODUCT} accent, {ACCENT_HEX}, appears once as {ACCENT_TREATMENT}.
The accent covers less than 10% of the image area.
No text, logos, UI chrome, people, faces, hands, mascots, or characters.
No outlines, strokes, linework, object gradients, glow, neon, texture, or drop shadows.
Minimal composition with generous empty space.
{ASPECT_RATIO}, transparent PNG.
```

Variables:

| Variable | Options |
|---|---|
| `{SUBJECT}` | One object or one small arrangement |
| `{raised from \| pressed into}` | Pick one |
| `{PRODUCT}` | Bricks, Bricks Scan, Bricks Calc, or Bricks Leads |
| `{ACCENT_HEX}` | `#0B0F14`, `#00A6A1`, `#007AFF`, or `#FF9500` |
| `{ACCENT_TREATMENT}` | Thin inlay line, small recessed well, small filled chip, single status mark |
| `{ASPECT_RATIO}` | `1:1`, `4:3`, `16:9`, or `21:9` |

Negative prompt, when supported:

```text
no text, no typography, no letters, no numbers, no logos,
no people, no faces, no hands, no mascots, no characters,
no app UI, no browser UI, no fake screenshot,
no outlines, no strokes, no linework, no sketch,
no gradient background, no object gradients, no glow, no neon,
no sparkles, no confetti, no motion blur,
no grain, no paper texture, no vignette,
no photorealism, no stock-photo look,
no clay, no plasticine, no toy render, no glass, no metal,
no warm beige, no sepia, no brown, no pastel,
no drop shadow behind the object
```

---

## Example Prompts

### Bricks Scan — Typeform Welcome

```text
A Soft-Emboss monochrome bas-relief illustration of three rounded document cards.
Off-white cool-neutral canvas, hex #F6F7F8. Flat surface, no texture or grain.
The cards appear raised from the same continuous material.
Soft paired shadows: cool-gray #E7ECEF down-right and white #FFFFFF up-left.
Rounded geometry only, using 24 px radii on the cards.
A single Bricks Scan accent, #00A6A1, appears once as a thin inlay line on the top card.
The accent covers less than 10% of the image area.
No text, logos, UI chrome, people, faces, hands, mascots, or characters.
No outlines, strokes, linework, object gradients, glow, neon, texture, or drop shadows.
Minimal composition with generous empty space.
4:3, transparent PNG.
```

### Bricks Calc — UserJot Header

```text
A Soft-Emboss monochrome bas-relief illustration of a rounded calculator key beside a small house block.
Off-white cool-neutral canvas, hex #F6F7F8. Flat surface, no texture or grain.
The shapes appear pressed into the same continuous material.
Soft paired shadows: cool-gray #E7ECEF down-right and white #FFFFFF up-left.
Rounded geometry only, using 12 px and 24 px radii.
A single Bricks Calc accent, #007AFF, appears once as a small recessed well on one calculator key.
The accent covers less than 10% of the image area.
No text, logos, UI chrome, people, faces, hands, mascots, or characters.
No outlines, strokes, linework, object gradients, glow, neon, texture, or drop shadows.
Minimal horizontal composition with generous empty space.
21:9, transparent PNG.
```

### Bricks Leads — Thank-You Screen

```text
A Soft-Emboss monochrome bas-relief illustration of a recessed circular well with a small checkmark inlay.
Off-white cool-neutral canvas, hex #F6F7F8. Flat surface, no texture or grain.
The well appears pressed into the same continuous material.
Soft paired shadows: cool-gray #E7ECEF down-right and white #FFFFFF up-left.
Rounded geometry only, using a circular well and 12 px detail radius.
A single Bricks Leads accent, #FF9500, appears once on the checkmark.
The accent covers less than 10% of the image area.
No text, logos, UI chrome, people, faces, hands, mascots, or characters.
No outlines, strokes, linework, object gradients, glow, neon, texture, or drop shadows.
Minimal centered composition with generous empty space.
1:1, transparent PNG.
```

### Bricks Umbrella — Cross-Product Survey

```text
A Soft-Emboss monochrome bas-relief illustration of three rounded pill shapes arranged in a calm stack.
Off-white cool-neutral canvas, hex #F6F7F8. Flat surface, no texture or grain.
The pills appear raised from the same continuous material.
Soft paired shadows: cool-gray #E7ECEF down-right and white #FFFFFF up-left.
Rounded geometry only, using 48 px radii.
A single Bricks umbrella accent, #0B0F14, appears once as a thin inlay line on the top pill.
The accent covers less than 10% of the image area.
No text, logos, UI chrome, people, faces, hands, mascots, or characters.
No outlines, strokes, linework, object gradients, glow, neon, texture, or drop shadows.
Minimal centered composition with generous empty space.
4:3, transparent PNG.
```

---

## Review Checklist

Run this before publishing or uploading any asset.

- [ ] The asset uses `#F6F7F8` as the base surface.
- [ ] Shadows are paired: cool-gray lower-right and white upper-left.
- [ ] The object appears made from the same material as the canvas.
- [ ] The asset uses rounded geometry only.
- [ ] No outlines, strokes, linework, rendered text, numerals, logos, or UI chrome are present.
- [ ] Exactly one product accent is present.
- [ ] Accent use stays below roughly 10% of the image area.
- [ ] No people, faces, hands, mascots, or characters are present.
- [ ] No gradients, glow, neon, grain, paper texture, vignette, or warm color cast are present.
- [ ] The composition has one clear subject and generous empty space.
- [ ] The image sits comfortably next to existing `feature-icon-0X.svg` assets.
- [ ] The asset does not introduce a new visual language.

One failed check means revise the prompt and regenerate.

---

## Do And Do Not

| Do | Do not |
|---|---|
| Reuse existing SVG assets when they fit. | Generate new art when an existing asset already solves the need. |
| Use one product accent once. | Mix accent colors or repeat accent marks across the image. |
| Keep the image quiet and object-focused. | Build a busy scene. |
| Use cool-neutral bas-relief depth. | Use warm beige, sepia, clay, glass, or glossy 3D styling. |
| Export transparent PNGs for platform placement. | Bake in mismatched backgrounds. |
| Let copy carry the message. | Put text, icons, logos, or fake UI inside generated artwork. |

---

## Technical Specs

| Platform | Aspect ratio | Minimum resolution | Format | Background |
|---|---:|---:|---|---|
| Typeform welcome cover | 4:3 | 1600 x 1200 | PNG, transparent preferred | Platform set to `#F6F7F8` |
| Typeform question accent | 1:1 | 1200 x 1200 | PNG, transparent preferred | Platform set to `#F6F7F8` |
| Typeform thank-you | 1:1 | 1600 x 1600 | PNG, transparent preferred | Platform set to `#F6F7F8` |
| UserJot board header | 21:9 | 2400 x 1028 | PNG or JPG | `#F6F7F8` |
| UserJot changelog hero | 16:9 | 1920 x 1080 | PNG or JPG | `#F6F7F8` |
| UserJot tag thumbnail | 1:1 | 512 x 512 | PNG, transparent preferred | Platform set to `#F6F7F8` |
| Social / release graphic | 1:1 or 4:5 | 1600 x 1600 | PNG | `#F6F7F8` |

Export at 2x the displayed size where possible. Keep uploaded files under 500 KB when the platform compresses images.

---

## Copy With Imagery

Use sentence case. Keep text short. State what it does, then why it matters, then stop.

Example Typeform welcome copy:

```text
A few quick questions
About how you use Bricks Scan
Under two minutes
```

Avoid hype, emoji, decorative punctuation, and claims the product cannot prove.
