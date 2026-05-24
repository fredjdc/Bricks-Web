---
title: Big Project Docs Cleanup Plan (2026-05-24)
doc_id: docs-governance-big-project-docs-cleanup-plan-2026-05-24
doc_type: meta
role: reference
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-05-24
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - plan
  - documentation
  - governance
  - bricks-calc
  - bricks-website
---

# Big Project Docs Cleanup Plan (2026-05-24)

This plan is written to be executable in small, reviewable batches while keeping `Bricks-Docs/scripts/validate_docs.py` passing.

Status (as of 2026-05-24): Batch 1 complete. Batch 2 and Batch 3 partially implemented. Batch 4 remaining.

## Batch 2 — Dedupe Canonical Topics

- Convert `Bricks-Web/docs/brand-voice-guide.md` into a **local adapter** that links to `docs/_canonical/shared/brand/brand-voice-guide.md`.
- Convert `Bricks-Web/docs/DESIGN.md` into a **local adapter** that links to:
  - `docs/_canonical/shared/brand/brand-system.md`
  - `docs/_canonical/shared/brand/design-system.md`
  - `docs/_canonical/shared/brand/tokens.json`
- Remove canonical claims (and any shared `doc_id` collisions) from adapters.

## Batch 3 — Move Product/Marketing Docs Into Canonical Locations

### Bricks Calc

- Replace the TODO canonical content in `docs/_canonical/apps/bricks-calc/product/app-store-copy.md` with the real copy currently in `Bricks-Calc/docs/app-store-copy.md`.
- Add a new canonical doc `docs/_canonical/apps/bricks-calc/product/screenshot-copy.md` seeded from `Bricks-Calc/docs/screenshot-copy.md`.
- Convert `Bricks-Calc/docs/app-store-copy.md` and `Bricks-Calc/docs/screenshot-copy.md` into adapters that link to canonical docs.

### Shared / Portfolio

- Move `Bricks-Web/docs/social-media-playbook.md` into `docs/_canonical/shared/brand/social-media-playbook.md` with normalized frontmatter.
- Convert `Bricks-Web/docs/social-media-playbook.md` into an adapter or remove it once the canonical file is in place.

### Content Agent Specs

- Move `Bricks-Web/docs/content-agent-base.md` into `docs/_canonical/shared/ai/content-agent-base.md` (canonical shared AI doc).
- Move per-app agent specs into `Bricks-Docs/apps/<app>/ai/`:
  - `bricks-calc-content-agent-spec.md`
  - `bricks-scan-content-agent-spec.md`
  - `bricks-leads-content-agent-spec.md`

## Batch 4 — Validation + Polish

- Ensure `Bricks-Docs/scripts/validate_docs.py` passes.
- Ensure no `Bricks-Docs` docs contain absolute filesystem links.
- Re-run the repo-local broken-relative-link scan for:
  - `Bricks-Calc/docs/`
  - `Bricks-Web/docs/`
  - `Bricks-Docs/`
- Spot-check Bricks voice consistency against `docs/_canonical/shared/brand/brand-voice-guide.md`.

## Acceptance Criteria

- One canonical doc per topic in `Bricks-Docs/`.
- `Bricks-Calc/docs/` and `Bricks-Web/docs/` contain only repo-proximate workflow docs plus small adapters.
- Canonical docs hold authoritative App Store and screenshot copy for Bricks Calc.
- Brand voice and design system live canonically only in `Bricks-Docs/shared/brand/`.
- Validator passes.
