---
title: Documentation Validation Rules
doc_id: docs-governance-validation-rules
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: needs-review
last_reviewed: 2026-04-06
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - validation
  - governance
---

# Documentation Validation Rules

Validation exists to keep the documentation system enforceable, not aspirational.

## Purpose

The repository validator is the minimum enforcement layer for canonical docs in `Bricks-Docs`.

It exists to catch structural problems early, keep the manifest trustworthy, and stop obvious documentation drift from quietly becoming source-of-truth debt.

## Current Validator Entry Point

The implemented validator is [`scripts/validate_docs.py`](../scripts/validate_docs.py).

Today it is a lightweight repository check, not a full documentation linter. Its scope is intentionally narrow and should stay aligned with what is actually enforced in code.

## Current Enforced Checks

The current validator enforces these checks:

- manifest paths exist
- manifest `doc_id` values are unique
- all managed markdown files have frontmatter
- required frontmatter fields are present
- manifest metadata matches frontmatter for key fields
- relative markdown links resolve

### Required Frontmatter Fields

The validator currently requires:

- `title`
- `doc_id`
- `doc_type`
- `role`
- `app_scope`
- `owner`
- `status`
- `last_reviewed`
- `review_cycle`

### Manifest Matching Scope

The validator currently compares these fields between frontmatter and `manifest/docs-manifest.yaml`:

- `title`
- `doc_id`
- `doc_type`
- `role`
- `app_scope`
- `owner`
- `status`

### Relative Link Rules

The validator checks Markdown links in managed docs after stripping fenced code blocks.

It ignores:

- absolute web links
- absolute repo-root links that start with `/`
- same-page anchors
- `mailto:` links

It validates only relative Markdown targets that should resolve from the current file location.

## Managed Documentation Scope

The validator currently treats these paths as managed:

- `README.md`
- `apps/`
- `shared/`
- `docs-governance/`
- `archive/README.md`
- `archive/legacy/README.md`

Legacy files outside the managed scope may still exist during migration, but they are not canonical.

## Operational Expectations

- Any change that affects canonical docs should keep the validator passing.
- Governance text should not promise checks that the validator does not currently perform.
- If validator behavior changes, update this file, the system spec if needed, and any affected backlog items in the same pass.

## Future Validation

These checks are approved next-phase targets, but they are not enforced yet:

- duplicate topic detection
- stale review-cycle detection
- forbidden duplication across app-local repos
- orphan-file detection
- derived-file source checks

## Known Gaps

The current validator does not yet enforce:

- status value validation against the lifecycle enum
- replacement path correctness
- required `derived_from` usage for derived files
- folder `README.md` coverage
- topic-level duplication across different files
- stale review dates relative to `review_cycle`

These gaps are acceptable for now because the current priority is structural reliability, not deep semantic linting.
