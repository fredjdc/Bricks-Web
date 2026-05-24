---
title: ADR-005 Localization Standard
doc_id: shared-engineering-adr-005-localization-standard
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
  - localization
  - standards
---

# ADR-005 Localization Standard

## Status

`needs-review`

## Context

Bricks apps ship in multiple languages and must avoid hardcoded user-facing strings and inconsistent localization patterns.

## Decision

Bricks apps must not ship hardcoded user-facing strings.

The default localization standard is:

- use localized string resources as the source of truth
- prefer Apple-native localization APIs such as `String(localized:)` for new work
- localize every user-facing label, action, error, and help text
- document language support and any app-specific localization exceptions in canonical docs

Allowed exception:

- an app may use a custom localization manager when that behavior is already part of the implemented product, as in Bricks Leads

Even when an exception exists, the app must still keep localization keys, supported languages, and fallback behavior explicit and documented.

## Consequences

- Positive:
  - Localization behavior is more predictable across products.
  - New code has a clear default path.
  - Existing exceptions can be documented without blocking current shipping behavior.
- Negative:
  - Mixed localization implementations can exist temporarily across apps.
  - Migration away from custom localization helpers may require follow-up work.
- Neutral:
  - Supported locales can differ per app as long as the implementation is explicit.

## Alternatives Considered

1. App-specific localization conventions
2. Hardcoded strings with selective localization
3. Mandatory immediate migration of all apps to one localization implementation

## Related Docs

- [Codebase Principles and Patterns](../codebase-principles.md)
- [Bricks Leads Development Guide](../../../apps/bricks-leads/engineering/dev-guide.md)
