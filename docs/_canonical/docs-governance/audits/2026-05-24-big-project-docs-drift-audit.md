---
title: Big Project Docs Drift Audit (2026-05-24)
doc_id: docs-governance-big-project-docs-drift-audit-2026-05-24
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
  - audit
  - documentation
  - governance
  - bricks-calc
  - bricks-website
---

# Big Project Docs Drift Audit (2026-05-24)

This audit covers the "Big Project" documentation surfaces:

- `Bricks-Docs/` (canonical docs repo)
- `Bricks-Calc/docs/` (local app repo docs)
- `Bricks-Web/docs/` (local website repo docs)

Excluded from audit scope: `AppStoreManager/`, `Crunchy-Track/`, `Bricks-Scan/`, `Bricks-Leads/` (code repos).

## Summary

Key drift classes found:

- **Repository rename drift:** many docs referenced `Bricks-Documentation` (no longer present) instead of `Bricks-Docs`.
- **Link portability drift:** canonical docs included absolute `/Users/...` links (non-portable).
- **Canonical duplication:** `Bricks-Web/docs/brand-voice-guide.md` duplicated the canonical shared brand voice guide in `docs/_canonical/shared/brand/brand-voice-guide.md` (including `doc_id` collision).
- **Canonical staleness:** canonical App Store copy in `docs/_canonical/apps/bricks-calc/product/app-store-copy.md` was a TODO while real copy lived in `Bricks-Calc/docs/app-store-copy.md`.
- **Local-doc scope creep:** `Bricks-Web/docs/` contains many app-marketing and content strategy documents that are not website-repo-proximate and should live in `Bricks-Docs/` under shared/app scopes.

## What Was Fixed Immediately (Batch 1)

- Replaced `Bricks-Documentation` references with `Bricks-Docs` in the in-scope repos.
- Fixed broken relative links from `Bricks-Calc/docs/` and `Bricks-Web/docs/` to canonical docs.
- Converted absolute `/Users/...` links inside `Bricks-Docs/` to repo-relative links where the target was within `Bricks-Docs/`.
- Removed remaining absolute cross-repo filesystem links in canonical docs (kept as inline code paths instead).
- Kept `Bricks-Docs/scripts/validate_docs.py` passing after changes.

## What Was Implemented Next (Batches 2–3, Partial)

- Removed canonical duplication in `Bricks-Web/docs/brand-voice-guide.md` by converting it into an adapter pointer.
- Converted `Bricks-Web/docs/DESIGN.md` into an adapter pointer to canonical brand/design system docs.
- Migrated Bricks Calc App Store copy and screenshot copy into canonical docs under `Bricks-Docs/apps/bricks-calc/product/`.
- Migrated shared social media playbook into canonical docs under `Bricks-Docs/shared/brand/`.
- Migrated content-agent base spec + per-app content-agent specs into canonical docs under `Bricks-Docs/shared/ai/` and `Bricks-Docs/apps/<app>/ai/`.
- Migrated Bricks Calc ASO and messaging docs out of the web repo into canonical Bricks Calc product docs under `Bricks-Docs/apps/bricks-calc/product/`.
- Migrated Bricks Scan ASO strategy doc into canonical Bricks Scan product docs under `Bricks-Docs/apps/bricks-scan/product/`.

## Drift That Still Needs Cleanup (Batches 2–4)

1. **Brand voice canonical duplication**
   - `Bricks-Web/docs/brand-voice-guide.md` is a second canonical copy of a shared doc (should not exist).
   - Fix: keep canonical doc only in `docs/_canonical/shared/brand/brand-voice-guide.md` and convert the web repo file into a short adapter that links to canonical.

2. **Bricks Calc marketing/docs split**
   - App Store copy and screenshot copy are product/marketing assets and should be canonical under `Bricks-Docs/apps/bricks-calc/product/`.
   - Fix: migrate content out of `Bricks-Calc/docs/` into canonical docs; keep local files as adapters (or delete once validated).

3. **Website repo docs scope creep**
   - `Bricks-Web/docs/` includes docs for app ASO strategy, keyword tracking, content agent specs, and social media playbooks.
   - These are not required to develop the static site; they are portfolio/app product docs and should be moved under `Bricks-Docs/shared/` or `Bricks-Docs/apps/<app>/`.

4. **Taxonomy mismatches**
   - Some local docs use non-standard `doc_type` values (e.g. `marketing`) and non-standard metadata keys (e.g. `last_updated` vs `last_reviewed`).
   - Fix: once moved into `Bricks-Docs/`, normalize frontmatter to the documented taxonomy and required fields.

## Output Of This Audit

This audit is paired with:

- `2026-05-24-big-project-docs-cleanup-plan.md` (decision-complete operations)
- `2026-05-24-model-selection-memo.md` (model choice + evidence)
