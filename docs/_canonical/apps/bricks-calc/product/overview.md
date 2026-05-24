---
title: Bricks Calc Overview
doc_id: bricks-calc-product-overview
doc_type: product
role: canonical
app_scope: bricks-calc
owner: Freddy
status: needs-review
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - product
---

# Bricks Calc — Overview

Bricks Calc is a native Apple mortgage and real estate finance calculator for iPhone, iPad, Mac, and visionOS. It helps users model monthly payments, total housing cost, amortization behavior, prepayment strategies, and side-by-side scenarios without leaving the Apple ecosystem.

The app is calculation-first, but it also supports saved scenarios, reminders, widgets, Spotlight search, App Intents, and Bricks Advisor — an Apple Foundation Models-powered assistant for natural-language mortgage exploration.

## Audience

- Primary users: home buyers, homeowners, and real estate professionals evaluating mortgage scenarios
- Secondary users: advisors or agents who need to compare options live with clients
- Platforms: iPhone, iPad, Mac, visionOS

## Core Workflows

1. Enter a mortgage scenario and calculate monthly payment, total cost, and amortization results.
2. Add insurance, recurring expenses, and prepayments to understand the real carrying cost of the loan.
3. Save, compare, share, search, and revisit calculations across Apple devices.

## Main Features

| Feature | What it does | Why it matters |
|---|---|---|
| Mortgage calculation | Computes payment, total interest, total paid, and amortization schedule | Gives users a fast baseline for any scenario |
| Prepayment analysis | Models one-off and recurring extra payments, visualized with an amortization chart overlay | Helps users evaluate time savings vs. cash outlay |
| Refinance scenarios | Models a refinance against an existing loan to compute break-even points, monthly savings, and total cost | Helps users compare current vs. new loan terms |
| Expense and insurance modeling | Includes insurance and recurring financial costs in the scenario | Reflects real monthly cost, not just principal and interest |
| Rental income modeling | Offsets monthly carrying costs with rental income | Provides a net cash flow calculation for investment properties |
| Saved calculations | Persists named calculations in SwiftData | Lets users compare, revisit, and organize scenarios |
| Comparison mode | Side-by-side stacked bar chart of cost components (principal, interest, home insurance, life insurance, property tax) plus collapsible metric rows that highlight the best loan per metric | Supports decision-making during planning or client meetings |
| App Onboarding & What's New | Guides new users through a personalized setup with interactive mock calculators and surfaces release notes to returning users | Builds trust and explains value before asking for input |
| Reminders and widgets | Surfaces saved scenarios through reminders and widget timelines | Keeps important calculations visible outside the app |
| Spotlight and App Intents | Exposes saved calculations to system search and shortcuts | Improves retrieval and system-level integration |
| Bricks Advisor and AI snapshotting | Uses Apple Foundation Models to explain or summarize scenarios when available | Adds guided understanding without replacing the app's own math |

## Tech Stack

- Language: Swift
- UI framework: SwiftUI
- Persistence: SwiftData for calculations, UserDefaults for settings
- Sync: CloudKit via the shared SwiftData container and `CloudSyncManager`
- AI: Apple Foundation Models where available
- Platform integrations: WidgetKit, App Intents, CoreSpotlight, UserNotifications, StoreKit 2

## Product Limits and Constraints

- The app is Apple-only and built around Apple frameworks.
- AI-assisted features depend on Foundation Models availability and must degrade gracefully when unavailable.
- Saved calculations are persisted explicitly through `AppState`; the app does not rely on autosave while the user is actively editing inputs.
- The canonical calculation engine remains deterministic. AI features may explain or summarize results, but they do not replace the math engine.

## Key Decisions

- `AppState` owns the high-level write path for saved calculations so views stay decoupled from persistence.
- Settings and calculations use different storage paths because user preferences need instant access while calculations need richer persisted data.
- The app treats comparison, sharing, widgets, reminders, and Spotlight as part of the core finance workflow, not as disconnected extras.

## Related Docs

- Positioning: [positioning.md](./positioning.md)
- App Store copy: [app-store-copy.md](./app-store-copy.md)
- Architecture: [../engineering/architecture.md](../engineering/architecture.md)
- Dev guide: [../engineering/dev-guide.md](../engineering/dev-guide.md)
- Testing strategy: [../engineering/testing-strategy.md](../engineering/testing-strategy.md)
- Brand voice and identity: [shared/brand/brand-foundation.md](../../../shared/brand/brand-foundation.md)
- Visual system: [shared/brand/brand-system.md](../../../shared/brand/brand-system.md)
