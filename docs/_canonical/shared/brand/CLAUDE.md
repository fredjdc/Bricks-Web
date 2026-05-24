---
title: Shared Brand Documentation — Claude Context
doc_id: shared-brand-claude-context
doc_type: ai
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-24
review_cycle: weekly
replacement_path:
derived_from:
source_links:
tags:
  - ai
  - claude
  - brand
---

# Shared Brand — Claude Context

This folder is the single canonical location for all Bricks brand and design system content. Everything that defines how Bricks looks, sounds, and feels lives here.

## Read These First

1. [`README.md`](./README.md) — full index of all files in this folder
2. [`brand-voice-guide.md`](./brand-voice-guide.md) — enforceable copy rules for every Bricks writing task
3. [`brand-foundation.md`](./brand-foundation.md) — brand story, personality, voice, and positioning
4. [`brand-system.md`](./brand-system.md) — visual identity, accent rules, surface standards (designer/writer audience)
5. [`design-system.md`](./design-system.md) — Swift and CSS implementation rules, token usage (engineer audience)

## What Lives Here

| File / Folder | Purpose |
|---|---|
| `brand-foundation.md` | Story, personality, voice, strategic positioning |
| `brand-voice-guide.md` | Shared copy rulebook for writers and agents across all Bricks apps |
| `brand-system.md` | Visual identity, color, type, surfaces — intent and rules |
| `design-system.md` | Engineering implementation: Swift tokens, CSS vars, component patterns |
| `design-system-gap-report.md` | Adoption audit — where each app stands vs. the system |
| `tokens.json` | Machine-readable design tokens (colors, type, spacing, radii, shadows) |
| `colors_and_type.css` | CSS design tokens for all web/HTML surfaces |
| `images_and_illustrations.md` | AI image generation guide for brand-aligned assets |
| `SKILL.md` | Agent-invocable skill definition for brand design work |
| `assets/` | Logos, feature icons, utility SVGs |
| `fonts/` | SF Pro Display OTF files for web use |
| `preview/` | HTML previews of design tokens and UI components |
| `ui_kits/` | Per-product UI kits: website, scan, calc, leads |

## Purpose and Routing

- **Brand voice, identity, color, type, surfaces** → this folder
- **Implementation in Swift / SwiftUI** → `design-system.md` + `tokens.json`
- **Implementation in HTML/CSS** → `colors_and_type.css` + `ui_kits/`
- **App-specific engineering standards** → `shared/engineering/`
- **Per-app product details** → `apps/<app-name>/`

## Do Not

- Do not add app-specific design decisions here — those belong in the app's own docs.
- Do not create new token files outside `tokens.json` and `colors_and_type.css`.
- Do not add assets to `assets/` without updating the `README.md` manifest table.
- Do not hardcode hex values anywhere in Swift — always reference `AppTheme`.
- Do not move a file to `active` status. Only Freddy approves `active`.

## Writing Rules

- Start from the closest template in `docs-governance/templates/`.
- Update frontmatter before writing body content.
- Update `README.md` and `docs-manifest.yaml` if you add or rename a file.
- If a doc is only partial, keep it `draft` or move it to `needs-review`.
- When in doubt about scope, check whether the content applies to all four products. If yes, it belongs here. If it applies to one app, it belongs in `apps/<app-name>/`.
