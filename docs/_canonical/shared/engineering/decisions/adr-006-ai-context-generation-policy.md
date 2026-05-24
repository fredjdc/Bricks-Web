---
title: ADR-006 AI Context Generation Policy
doc_id: shared-engineering-adr-006-ai-context-generation-policy
doc_type: decisions
role: canonical
app_scope: shared
owner: Freddy
status: needs-review
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - adr
  - ai
  - documentation
---

# ADR-006 AI Context Generation Policy

## Status

`needs-review`

## Context

Agent entrypoints such as `CLAUDE.md` and `CODEX.md` are necessary, but they become high-drift files if they restate product and engineering truth independently.

## Decision

Root `CLAUDE.md` and `CODEX.md` files are derived agent entrypoints, not canonical documentation.

They must:

- route agents to canonical docs first
- summarize only the highest-priority constraints and conventions
- remain short and operational

They must not:

- become full product or architecture manuals
- contain unique truth that is missing from canonical docs
- drift independently from canonical routing

Regeneration or manual sync is required whenever:

- canonical routing changes
- required read-first docs change
- key engineering or product conventions change
- local app repo workflow docs move in a way that affects agent entrypoints

## Consequences

- Positive:
  - Agent entrypoints stay discoverable without recreating documentation sprawl.
  - Canonical truth remains centralized.
  - Drift becomes easier to detect and repair.
- Negative:
  - Entrypoints require maintenance when canonical routing changes.
  - Writers must resist putting missing truth into the easiest-to-find root files.
- Neutral:
  - Small repo-specific override content may still exist if it only routes work and does not create shadow truth.

## Alternatives Considered

1. Fully manual AI entrypoints
2. No root AI entrypoints in app repos
3. Treat root AI entrypoints as full local documentation

## Related Docs

- [Shared AI Documentation](../../ai/README.md)
- [Documentation System Spec](../../../docs-governance/documentation-system-spec.md)
