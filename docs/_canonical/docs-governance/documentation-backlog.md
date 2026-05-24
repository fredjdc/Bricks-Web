---
title: Documentation Backlog
doc_id: docs-governance-documentation-backlog
doc_type: meta
role: canonical
app_scope: shared
owner: Freddy
status: draft
last_reviewed: 2026-04-06
review_cycle: weekly
replacement_path:
derived_from:
source_links:
tags:
  - backlog
  - writing
  - governance
---

# Documentation Backlog

This is the global prioritized writing backlog for `Bricks-Docs`.

## Workflow Rules

- Agents may create or update docs only from this backlog or from a clearly linked follow-up item.
- New canonical docs must start from a template in [`templates/`](templates/README.md).
- Agents may move a doc from `draft` to `needs-review`.
- Only Freddy may move a doc to `active`.
- Review cadence is Monday and Friday.
- If a backlog item depends on codebase research, the agent should read the app repo first and document facts, not assumptions.

## Priority Legend

- `P0`: blocks consistent documentation writing
- `P1`: launch-critical
- `P2`: important but not launch-blocking
- `P3`: nice to have

## Backlog

| Priority | Path | Status | Completeness | Owner | Next action |
|---|---|---:|---:|---|---|
| P0 | [shared/ai/README.md](../shared/ai/README.md) | needs-review | 80% | Freddy | Review shared AI routing, derived-file rules, and folder scope |
| P0 | [docs-governance/documentation-system-spec.md](documentation-system-spec.md) | needs-review | 92% | Freddy | Review implemented structure, template list, and review workflow wording |
| P0 | [docs-governance/validation-rules.md](validation-rules.md) | needs-review | 90% | Freddy | Review current validator scope against the next-phase checks before approval |
| P0 | [shared/engineering/decisions/adr-001-documentation-system-structure.md](../shared/engineering/decisions/adr-001-documentation-system-structure.md) | needs-review | 85% | Freddy | Review decision wording, consequences, and acceptance status |
| P0 | [shared/engineering/decisions/adr-002-canonical-vs-local-docs-policy.md](../shared/engineering/decisions/adr-002-canonical-vs-local-docs-policy.md) | needs-review | 85% | Freddy | Review local-doc boundary and root agent entrypoint policy |
| P1 | [shared/brand/brand-foundation.md](../shared/brand/brand-foundation.md) | active | 85% | Freddy | Tighten examples and cross-link product positioning usage |
| P1 | [shared/brand/brand-system.md](../shared/brand/brand-system.md) | active | 80% | Freddy | Verify it fully matches current website and app styling rules |
| P1 | [shared/engineering/codebase-principles.md](../shared/engineering/codebase-principles.md) | active | 85% | Freddy | Add links to ADRs once they are completed |
| P1 | [apps/bricks-scan/product/overview.md](../apps/bricks-scan/product/overview.md) | needs-review | 85% | Freddy | Review updated dependency/privacy wording and expanded limits section |
| P1 | [apps/bricks-scan/engineering/architecture.md](../apps/bricks-scan/engineering/architecture.md) | needs-review | 88% | Freddy | Review store-boundary wording, analytics integration notes, and state-ownership section |
| P1 | [apps/bricks-calc/product/overview.md](../apps/bricks-calc/product/overview.md) | needs-review | 85% | Freddy | Review for product wording and approve or request final tightening |
| P1 | [apps/bricks-calc/product/positioning.md](../apps/bricks-calc/product/positioning.md) | needs-review | 80% | Freddy | Review positioning guardrails and confirm messaging direction |
| P1 | [apps/bricks-calc/engineering/architecture.md](../apps/bricks-calc/engineering/architecture.md) | needs-review | 85% | Freddy | Review architecture narrative and approve or request deeper implementation detail |
| P1 | [apps/bricks-leads/product/overview.md](../apps/bricks-leads/product/overview.md) | needs-review | 92% | Freddy | Review updated workflow scope, metrics boundaries, and non-shipped task/import-export wording |
| P1 | [apps/bricks-leads/engineering/architecture.md](../apps/bricks-leads/engineering/architecture.md) | needs-review | 94% | Freddy | Review schema-truth note for `TodoTask` and confirm distributed save/error-handling wording |
| P1 | [shared/engineering/decisions/adr-003-appstate-single-source-of-truth.md](../shared/engineering/decisions/adr-003-appstate-single-source-of-truth.md) | needs-review | 80% | Freddy | Review single-source-of-truth rule and allowed non-AppState variations |
| P1 | [shared/engineering/decisions/adr-004-persistence-and-sync-policy.md](../shared/engineering/decisions/adr-004-persistence-and-sync-policy.md) | needs-review | 82% | Freddy | Review app-specific sync allowances and local-first wording |
| P1 | [shared/engineering/decisions/adr-005-localization-standard.md](../shared/engineering/decisions/adr-005-localization-standard.md) | needs-review | 78% | Freddy | Review default localization rule and documented exception policy |
| P1 | [shared/engineering/decisions/adr-006-ai-context-generation-policy.md](../shared/engineering/decisions/adr-006-ai-context-generation-policy.md) | needs-review | 82% | Freddy | Review derived-entrypoint scope and regeneration triggers |
| P2 | [apps/bricks-website/product/overview.md](../apps/bricks-website/product/overview.md) | needs-review | 93% | Freddy | Review the documented `leads.bricks.pe` split, third-party flow boundaries, and the non-core `purrfect-yarn.html` exception |
| P2 | [apps/bricks-website/engineering/dev-guide.md](../apps/bricks-website/engineering/dev-guide.md) | needs-review | 92% | Freddy | Review deployment checks, runtime dependency wording, and the non-core page exception handling |
| P2 | [apps/bricks-scan/operations/support-runbook.md](../apps/bricks-scan/operations/support-runbook.md) | needs-review | 92% | Freddy | Review debug-only sync guidance, analytics wording, and support escalation coverage |
| P2 | [apps/bricks-calc/engineering/testing-strategy.md](../apps/bricks-calc/engineering/testing-strategy.md) | needs-review | 92% | Freddy | Review release gates, manual integration gaps, and simulator command choices |
| P2 | [apps/bricks-leads/engineering/testing-strategy.md](../apps/bricks-leads/engineering/testing-strategy.md) | draft | 65% | Freddy | Expand automated coverage inventory and release gates beyond the initial canonical baseline |
| P2 | [apps/bricks-scan/operations/release-notes.md](../apps/bricks-scan/operations/release-notes.md) | needs-review | 90% | Freddy | Review 1.0.1 draft scope against the intended App Store release contents |
| P3 | [shared/product/README.md](../shared/product/README.md) | draft | 20% | Freddy | Add shared product principles if they become explicit |

## Recommended Writing Order

1. Shared docs and shared ADRs
2. Bricks Scan normalization
3. Bricks Calc product and engineering docs
4. Bricks Leads product and engineering docs
5. Bricks Website docs
6. Lower-priority support, release, and reference docs
