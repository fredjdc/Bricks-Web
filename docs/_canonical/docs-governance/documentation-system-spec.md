---
title: Bricks Documentation System Spec
doc_id: docs-governance-system-spec
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - documentation
  - governance
  - architecture
---

# Bricks Documentation System Spec

This file defines the implemented documentation system for all Bricks Apps.

`Bricks-Docs` is the canonical documentation repository. App repositories keep only a minimal set of local development documents that are tightly coupled to that repo's workflow.

## Goals

- Keep one source of truth per topic
- Make files easy to find before opening them
- Separate shared knowledge from app-specific knowledge
- Keep AI context files narrow and derived
- Make documentation reviewable, enforceable, and scalable

## Core Rules

1. Canonical knowledge lives in `Bricks-Docs`.
2. Every document has exactly one role: `canonical`, `reference`, or `derived`.
3. Every document has exactly one primary taxonomy type.
4. Local app docs are allowed only when repo proximity materially improves development.
5. Every meaningful product or engineering change includes documentation review.

## Canonical Repository Structure

```text
Bricks-Docs/
  README.md
  manifest/
    docs-manifest.yaml
  docs-governance/
    documentation-system-spec.md
    documentation-backlog.md
    validation-rules.md
    CLAUDE.md
    CODEX.md
    migration-plan.md
    templates/
      README.md
      app-overview-template.md
      architecture-template.md
      positioning-template.md
      testing-strategy-template.md
      support-runbook-template.md
      adr-template.md
      ai-context-template.md
      release-notes-template.md
  shared/
    CLAUDE.md
    CODEX.md
    brand/
    engineering/
      decisions/
    ai/
    product/
  apps/
    bricks-scan/
      README.md
      product/
      engineering/
      ai/
      operations/
      decisions/
      meta/
    bricks-calc/
    bricks-leads/
    bricks-website/
  archive/
```

## Taxonomy

Every document belongs to one of these types:

- `product`
- `engineering`
- `operations`
- `ai`
- `decisions`
- `meta`

### Shared Scope

- `shared/brand/`: brand voice, visual system, tone, identity
- `shared/engineering/`: cross-app architecture rules, localization standards, state management rules, persistence patterns
- `shared/ai/`: shared agent constraints, generation rules, sync rules for derived AI files
- `shared/product/`: portfolio-level product principles, shared naming and messaging rules

### App Scope

Each app folder uses the same internal structure:

```text
apps/<app>/
  README.md
  product/
  engineering/
  ai/
  operations/
  decisions/
  meta/
```

## Canonical, Reference, Derived

### Canonical

The full authoritative source for a topic.

### Reference

A short routing or summary document that links to the canonical file. It must not restate large bodies of truth.

### Derived

A generated or manually synced output based on canonical docs. Derived files must declare their source.

## Frontmatter Standard

All managed docs start with frontmatter:

```yaml
---
title: Example Title
doc_id: example-doc-id
doc_type: engineering
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - example
---
```

Required fields:

- `title`
- `doc_id`
- `doc_type`
- `role`
- `app_scope`
- `owner`
- `status`
- `last_reviewed`
- `review_cycle`

## Minimal Local Docs Rule

App repos may keep only docs that are:

- repo-specific
- workflow-specific
- non-duplicative
- short where possible
- linked back to canonical docs

Allowed local docs:

```text
CLAUDE.md
CODEX.md
docs/README.md
docs/CONTRIBUTING.md
docs/local-setup.md
docs/testing.md
docs/release-checklist.md
docs/troubleshooting.md
docs/repo-map.md
```

Everything else should move to `Bricks-Docs`.

At app repo root, `CLAUDE.md` and `CODEX.md` are the only documentation files allowed.

## ADR Policy

Use ADRs for any long-term decision, including:

- sync architecture
- AppState rules
- persistence approach
- localization standards
- docs structure
- AI context generation policy
- release workflow changes
- major shared UI or service patterns

ADRs live in either:

- `shared/engineering/decisions/`
- `apps/<app>/decisions/`

## Change Trigger Policy

Documentation review is required when:

- a feature ships or is removed
- architecture changes
- a service is renamed, replaced, or deleted
- a file or folder structure changes
- persistence or sync behavior changes
- AppState or mutation rules change
- localization behavior changes
- release workflow changes
- AI instructions or context dependencies change

## Review Cadence

- shared brand docs: quarterly
- shared engineering docs: quarterly or after major refactors
- shared AI docs: after workflow changes
- app product docs: monthly or per release milestone
- app engineering docs: after major refactors
- app operations docs: before every release
- ADRs: update only on status or supersession

## Lifecycle

Valid statuses:

- `draft`
- `needs-review`
- `active`
- `deprecated`
- `archived`

Status must always come from this fixed list. Do not invent additional states.

Deprecated docs must link to their replacement. Archived docs move under `archive/`.

## Review Workflow

- Agents may create and update canonical docs within approved scope.
- Agents may move a doc from `draft` to `needs-review` only when the matching template checklist is materially satisfied.
- Only Freddy may move a doc to `active`.
- Review cadence is Monday and Friday.

### Approval Checklist

Before moving a document from `needs-review` to `active`, confirm:

- the document is factually correct against the current codebase or approved product truth
- the document follows the correct template structure for its type
- required sections are materially complete
- the wording is clear, specific, and non-hyped
- the document does not contradict another canonical doc
- internal links route to the correct canonical files
- the document does not duplicate large bodies of truth better owned elsewhere
- the document is trustworthy enough to serve as the current source of truth

### Status Change Rules

- `draft` -> `needs-review`
  - allowed for agents when the template checklist is materially satisfied
- `needs-review` -> `active`
  - only Freddy may make this change
- `needs-review` -> `draft`
  - use when review reveals substantial gaps or factual issues
- `active` -> `deprecated`
  - use when a document is still visible but no longer current
- `deprecated` -> `archived`
  - use when the document becomes historical only

Whenever status changes, update both:

- the document frontmatter
- the matching entry in `manifest/docs-manifest.yaml`

## Cross-Linking Standard

Every folder has a `README.md` that explains:

- what belongs there
- what does not belong there
- where to go next

Every non-trivial doc links to:

- its parent index
- related docs
- replacement docs if deprecated
- canonical source if reference or derived

## AI File Boundary

AI files may:

- summarize high-priority rules
- route to canonical docs
- state execution constraints

AI files may not:

- become full product docs
- become full architecture docs
- duplicate large bodies of content from canonical files

## Definition Of Done For Docs

For any meaningful change, done includes:

- canonical docs updated if needed
- derived docs reviewed or regenerated
- outdated references removed
- manifest updated
- links validated
- ADR added if the decision has long-term impact

## Validation

Validation should eventually check:

- broken links
- naming lint
- missing frontmatter
- duplicate `doc_id`
- duplicate canonical topic ownership
- orphan files
- invalid replacement paths
- derived files missing `derived_from`
- missing folder `README.md`

## Searchability

Searchability is enforced by:

- one consistent taxonomy
- predictable folder structure
- lowercase kebab-case file names
- a top-level repo `README.md`
- per-folder indexes
- per-app `meta/document-index.md`
- a machine-readable manifest
