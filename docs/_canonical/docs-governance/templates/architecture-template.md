---
title: Architecture Template
doc_id: docs-governance-template-architecture
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
  - template
  - engineering
  - architecture
---

# Architecture Template

Use this for `apps/<app>/engineering/architecture.md`.

## System Overview

[2-4 paragraphs describing the architecture.]

## Major Layers and Modules

| Layer or module | Responsibility | Key files or types |
|---|---|---|
| [layer] | [responsibility] | [paths/types] |

## Core Models and Entities

- [entity]: [purpose]
- [entity]: [purpose]

## State Ownership

- App-level state:
- View-level state:
- Mutation path:
- Save/update boundary:

## Persistence and Sync

- Storage model:
- Sync model:
- Conflict handling:
- Failure behavior:

## Integration Points

- [framework/service]: [purpose]
- [framework/service]: [purpose]

## Constraints and Tradeoffs

- [constraint]
- [tradeoff]

## Extension Guidance

- Preferred extension points:
- Patterns to reuse:
- Anti-patterns to avoid:

## Related Docs

- Overview:
- Dev guide:
- Testing:
- ADRs:

## Minimum Complete Content Checklist

- [ ] Architecture overview is specific
- [ ] Major modules are mapped
- [ ] Core models are named
- [ ] State ownership is explicit
- [ ] Persistence and sync are accurate
- [ ] Integration points are listed
- [ ] Constraints are honest
- [ ] Extension guidance is actionable
