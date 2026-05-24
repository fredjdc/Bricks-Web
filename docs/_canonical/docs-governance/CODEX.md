---
title: Docs Governance Codex Context
doc_id: docs-governance-codex-context
doc_type: ai
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-04
review_cycle: weekly
replacement_path:
derived_from:
source_links:
tags:
  - ai
  - codex
  - governance
---

# Docs Governance — Codex Context

This folder defines the Bricks documentation system and the rules that agents must follow when writing canonical docs.

## Read These First

1. [`documentation-system-spec.md`](./documentation-system-spec.md)
2. [`documentation-backlog.md`](./documentation-backlog.md)
3. [`validation-rules.md`](./validation-rules.md)
4. [`templates/README.md`](./templates/README.md)

## Purpose and Routing

- Keep governance, lifecycle, backlog, and validation docs here.
- Keep reusable canonical templates in `templates/`.
- Keep implementation history or one-off migration mapping here only if it affects documentation structure.

## Do Not

- Do not place app-specific product docs here.
- Do not treat templates as optional.
- Do not add unmanaged docs without manifest coverage.
- Do not mark governance docs `active` without Freddy review.

## Writing Rules

- Any new managed markdown file here must be added to the manifest.
- Governance changes must remain consistent with validator behavior.
- If a governance rule changes, update related agent-entry docs and backlog guidance in the same pass.
