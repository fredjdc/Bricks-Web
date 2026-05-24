---
title: ADR-002 Canonical vs Local Docs Policy
doc_id: shared-engineering-adr-002-canonical-vs-local-docs-policy
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
  - documentation
  - policy
---

# ADR-002 Canonical vs Local Docs Policy

## Status

`needs-review`

## Context

Bricks needs one source of truth per topic while still keeping repo-local workflow guidance close to code. Without a clear split, app repos accumulate duplicate product and architecture docs while AI entrypoints quietly become shadow sources of truth.

## Decision

Canonical documentation lives in `Bricks-Docs`.

App repos may keep only:

- root `CLAUDE.md`
- root `CODEX.md`
- repo-specific workflow docs under `docs/`

Local app repo docs must be:

- repo-specific
- workflow-specific
- non-duplicative
- short where possible
- linked back to canonical docs

Root `CLAUDE.md` and `CODEX.md` are narrow agent entrypoints only. They may summarize high-priority conventions and routing, but they must not hold product or architecture truth that is missing from canonical docs.

If a local doc starts restating canonical product, engineering, operations, or AI-source content in full, it must be reduced to a short local reference or removed.

## Consequences

- Positive:
  - Local repos stay usable for development without becoming parallel documentation systems.
  - Canonical truth is easier to review, validate, and automate.
  - Root agent files stay discoverable without turning into full manuals.
- Negative:
  - Agents and humans must follow stricter routing discipline.
  - Some repo users may initially expect a root `README.md`, which is intentionally not part of the local docs surface.
- Neutral:
  - Local setup, testing, release workflow, and repo-map docs remain close to code where they are operationally useful.

## Alternatives Considered

1. Full duplication between canonical and local docs
2. No local docs at all in app repos

Full duplication was rejected because it guarantees drift. Zero local docs was rejected because code-adjacent workflow guidance is materially more useful inside each app repo.

## Related Docs

- [Documentation System Spec](../../../docs-governance/documentation-system-spec.md)
- [Documentation Backlog](../../../docs-governance/documentation-backlog.md)
