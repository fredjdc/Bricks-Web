---
title: Model Selection Memo — Docs Drift Audit & Cleanup (2026-05-24)
doc_id: docs-governance-model-selection-memo-docs-audit-2026-05-24
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
  - ai
  - models
  - documentation
  - governance
---

# Model Selection Memo — Docs Drift Audit & Cleanup (2026-05-24)

## Recommendation

Use **GPT-5.3-Codex** for this job when available.

Rationale: OpenAI positions GPT-5.3-Codex as "the most capable agentic coding model to date" with improved long-running agentic capability and stronger combined coding + reasoning performance.

References:

- https://openai.com/index/introducing-gpt-5-3-codex/
- https://help.openai.com/en/articles/9624314-model-release-notes

Fallbacks:

- **GPT-5.2-Codex** for agentic repo work when GPT-5.3-Codex is unavailable (positioned as OpenAI’s most intelligent coding model optimized for long-horizon agentic coding).
- **GPT-5.2** for pure editorial rewriting or short copy transforms that do not require repo/tool reasoning (positioned as the flagship for coding and agentic tasks broadly).

References:

- https://platform.openai.com/docs/models/gpt-5.2-codex
- https://platform.openai.com/docs/models/gpt-5.2/
- https://platform.openai.com/docs/models

## Evaluation Suite (What We Actually Need)

This docs project is mostly:

- repo-truth auditing (don’t invent paths or policies)
- structured, low-risk refactors across many files (links, taxonomy, dedupe, moves)
- consistent tone enforcement (Bricks voice)

Those are long-horizon, agentic "sweep" tasks, so Codex-optimized models are the right default.

## Evidence (Observed In This Cleanup)

These were the highest-leverage behaviors required and successfully exercised:

- Fixing cross-repo drift (renames + link repair) without breaking the validator.
- Detecting canonical duplication (`doc_id` collision) and planning adapter conversions.
- Migrating canonical stubs (TODO) to match the project’s real copy sources.

The selection rule is simple:

- Prefer the newest Codex model that OpenAI designates as most capable for agentic coding (currently GPT-5.3-Codex).

Reference:

- https://openai.com/index/introducing-gpt-5-3-codex/
