---
title: Shared Documentation Codex Context
doc_id: shared-codex-context
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
  - shared
---

# Shared Documentation — Codex Context

This folder contains canonical documentation that applies across more than one Bricks app.

## Read These First

1. [`README.md`](./README.md)
2. [`../docs-governance/documentation-system-spec.md`](../docs-governance/documentation-system-spec.md)
3. [`../docs-governance/documentation-backlog.md`](../docs-governance/documentation-backlog.md)
4. [`../docs-governance/templates/README.md`](../docs-governance/templates/README.md)

## Purpose and Routing

- Use `shared/brand/` for brand voice, identity, and visual rules.
- Use `shared/engineering/` for cross-app engineering rules and ADRs.
- Use `shared/ai/` for shared AI-source docs and generation rules.
- Use `shared/product/` only for portfolio-level product principles.

## Do Not

- Do not write app-specific product or engineering truth here.
- Do not create freeform docs without first adding or linking a backlog item.
- Do not skip templates for new canonical docs.
- Do not move a file to `active` status. Only Freddy approves `active`.

## Writing Rules

- Start from the closest template.
- Update frontmatter before writing body content.
- Update links if you move or rename a file.
- If a doc is only partial, keep it `draft` or move it to `needs-review`.
