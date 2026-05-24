---
title: Bricks Leads Overview
doc_id: bricks-leads-product-overview
doc_type: product
role: canonical
app_scope: bricks-leads
owner: Freddy
status: needs-review
last_reviewed: 2026-04-22
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - leads
  - product
---

# Bricks Leads — Overview

Bricks Leads is an offline-first, on-device AI CRM for solo realtors in Peru. It runs natively on iPhone (primary), iPad, and Mac, with no server backend. All data lives on the user's device. Apple Intelligence handles extraction and message drafting locally; nothing is processed remotely.

The product is shaped around real estate work in Peru: UBIGEO-backed address search, portal templates for Adondevivir, Urbania, and Properati, bilingual English and Spanish support, and Peru financial tools (alcabala, UIT, mortgage simulator, commission calculator).

## Audience

- Primary users: solo real estate agents in Peru managing leads, listings, and follow-ups from their iPhone
- No team or multi-user workflows — the product is explicitly single-agent
- Platforms: iPhone first (Apple Intelligence required for AI features), iPad and Mac on roadmap

## Core Workflows (MVP)

1. Capture or create a contact — manually or via Share Extension from WhatsApp, Mail, Messages, or portal email.
2. Create a listing with structured Peru address data, price, property type, and owner link.
3. Track interactions, visits (EventKit), and follow-ups with local notifications.
4. Match buyers to listings using deterministic structured fields (budget, district, bedrooms, area, transaction type, property type).
5. Draft messages, portal copy, and follow-up notes locally with Apple Intelligence — user reviews before anything is saved or sent.

## Main Features

| Feature | What it does | Why it matters |
|---|---|---|
| Contact and listing CRUD | Stores contacts with roles (lead, owner, buyer, tenant, service provider) and listings with Peru address, price, property type, and owner link | Core CRM spine |
| Share Extension ingestion | Accepts text from WhatsApp, Mail, Messages, Notes, portal emails; extracts contact, property, and portal ID via Foundation Models | Removes manual re-entry of incoming lead data |
| Review-first AI extraction | Every Foundation Models output is shown in a review screen before saving; no model output is auto-saved | Keeps the agent in control; avoids silent mistakes |
| Peru address entry | Distrito search, postal code, UBIGEO, street-level fields using bundled reference data outside SwiftData | Accurate Peru address data without a network call |
| Portal templates | Export listing copy for Adondevivir, Urbania, and Properati; optionally draft via Foundation Models | Reduces copy-paste work for portal listings |
| Deterministic matching | Ranks buyers against listings by budget overlap, district, bedrooms, area, transaction type, property type | Transparent, explainable matches — no black box |
| Follow-up drafting | Foundation Models drafts a suggested follow-up message on-device; agent edits and sends manually through iMessage, WhatsApp, or Mail | No auto-send |
| EventKit visits | Links visits to a contact, listing, and calendar event in a dedicated Bricks Leads calendar | Keeps CRM history and system calendar in sync |
| Peru financial tools | Mortgage simulator, alcabala estimator, commission calculator, UIT display | Supports field conversations without a separate finance app |
| Localization | English and Spanish | Covers bilingual workflows |

## Tech Stack

- Language: Swift 6 (where Xcode-supported)
- UI framework: SwiftUI
- Persistence: SwiftData (local source of truth; CloudKit-ready schema for future same-user sync)
- Sync: No server backend in V1. Optional same-user CloudKit private database sync is a future feature — not a team feature.
- AI: Foundation Models (Apple Intelligence) for on-device extraction and drafting. Every AI call has timeout handling and manual-entry fallback.
- Platform integrations: Share Extension, EventKit, Speech, Vision, MapKit, Contacts, App Intents

## Product Limits and Constraints

- Apple-only. No Android, no web, no server backend.
- AI features require an Apple Intelligence-capable device.
- No team collaboration or multi-user access.
- No auto-send of any message. All AI output is review-first.
- No portal scraping, auto-posting, or credential storage for portals.
- No SUNAT invoicing or legal/financial advice claims.
- Privacy copy must stay precise: local-first storage and on-device processing are claimable where implemented. Strong Ley 29733 compliance claims require legal review before shipping.

## Key Decisions

- `DataStore` is the validated write path; views own draft state and commit only through `DataStore`.
- `ReadStore` serves App Intents, search, and internal read paths.
- Foundation, Domain, Location, widget, and DTO layers must not import SwiftData.
- Money is stored as minor units plus currency. No persisted `Decimal` in `@Model` types.
- Peru reference data (UBIGEO, distritos, postal codes) is bundled outside SwiftData and CloudKit.
- Deterministic validators own regulated fields: DNI, RUC, phone, money, location codes.
- Address entry is a product feature, not a generic text field, because Peru-specific location quality is central to the workflow.

## Related Docs

- Architecture: [../engineering/architecture.md](../engineering/architecture.md)
- Dev guide: [../engineering/dev-guide.md](../engineering/dev-guide.md)
- Operations: [../operations/README.md](../operations/README.md)
- ADRs: [../decisions/README.md](../decisions/README.md)
- Brand voice and identity: [shared/brand/brand-foundation.md](../../../shared/brand/brand-foundation.md)
- Visual system: [shared/brand/brand-system.md](../../../shared/brand/brand-system.md)
