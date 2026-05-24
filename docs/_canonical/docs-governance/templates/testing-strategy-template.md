---
title: Testing Strategy Template
doc_id: docs-governance-template-testing-strategy
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
  - testing
---

# Testing Strategy Template

Use this for `apps/<app>/engineering/testing-strategy.md`.

## Test Scope

[What is covered and what is intentionally not covered.]

## Test Layers

- Unit:
- Integration:
- UI:
- Manual verification:

## Critical Flows To Protect

1. [flow]
2. [flow]
3. [flow]

## Commands and Execution

```bash
[command]
```

## Test Data and Helpers

- Fixtures:
- Factories:
- Mocks/stubs:

## Release Gates

- [gate]
- [gate]

## Known Gaps

- [gap]
- [gap]

## Minimum Complete Content Checklist

- [ ] Scope is explicit
- [ ] Test layers are defined
- [ ] Critical flows are listed
- [ ] Commands are runnable
- [ ] Release gates are stated
- [ ] Known gaps are honest
