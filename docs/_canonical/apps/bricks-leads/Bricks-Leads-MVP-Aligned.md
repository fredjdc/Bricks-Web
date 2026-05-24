---
title: Bricks Leads MVP Plan
doc_id: bricks-leads-mvp-aligned
doc_type: product
role: canonical
app_scope: bricks-leads
owner: Freddy
status: draft
last_reviewed: 2026-04-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - leads
  - mvp
  - planning
---

# Bricks Leads MVP Plan

This MVP plan aligns the original solo-realtor CRM concept with the current Bricks Leads V1 architecture and implementation.

## Product Positioning

Bricks Leads is an offline-first, on-device AI CRM for solo realtors in Peru.

Positioning:

> CRM privado con IA en el dispositivo. Tus datos se procesan en tu iPhone.

The product is built for independent agents who manage leads, owners, listings, visits, and follow-ups from their phone. The app should reduce administrative friction without becoming an agency CRM, team workspace, or portal automation tool.

V1 is Apple-native only:

- iOS 26+
- Swift 6 where supported by Xcode
- SwiftUI, SwiftData, App Intents, MapKit, Vision, Speech, EventKit, Contacts, and Foundation Models where appropriate
- Apple Intelligence-capable devices only
- No server backend
- No Android
- No team collaboration

Privacy copy must stay precise. We can claim local-first storage and on-device processing where implemented. Strong Ley 29733 compliance claims require legal review before shipping.

## MVP Goal

The MVP should prove one core loop:

1. Capture or create a contact.
2. Create a listing with structured property and Peru address data.
3. Track interactions and follow-ups.
4. Match buyers to listings using deterministic structured fields.
5. Help the agent draft messages, exports, and summaries locally, with review before anything is saved or sent.

The product should feel like a private workbench for a solo realtor, not a lightweight spreadsheet or a generic CRM.

## Current Foundation

Already implemented or in progress:

- Pure Swift foundation and domain types.
- Draft values separate from SwiftData models.
- SwiftData schema for contacts, lead profiles, service providers, listings, photos, portal references, visits, interactions, matches, reminders, documents, financial scenarios, consent records, settings, and audit logs.
- `DataStore` as the validated write path.
- `ReadStore` as the DTO read path.
- `AppState` as the high-level UI composition layer.
- Contact create/edit flow.
- Listing create/edit flow.
- Peru address entry with distrito search, postal code, UBIGEO, ambiguity handling, and street-level fields.
- Peru reference data outside SwiftData and CloudKit.
- Money stored as minor units plus currency.
- CloudKit-ready schema tests.
- DocC and ADRs for architecture boundaries.

## MVP Feature Set

### 1. CRM Spine

The first shippable slice is the contact/listing workflow.

MVP behavior:

- Create and edit contacts.
- Assign roles such as lead, owner, buyer, tenant, service provider, or organization.
- Create and edit listings.
- Link listings to owners.
- Store listing price, transaction type, property type, and structured Peru address.
- Keep views draft-driven and commit only through `DataStore`.

Next polish:

- Fuller contact and listing detail screens.
- Listing bedrooms, bathrooms, area, amenities, photos, and status.
- Owner creation and selection inside the listing workflow without losing unsaved listing draft state.
- UI tests for creating contacts and listings through the app shell.

### 2. Lead Capture

Lead capture should be review-first.

MVP behavior:

- Share Extension accepts text from WhatsApp, Mail, Messages, Notes, and portal email content.
- Text flows into Foundation Models extraction when available.
- Extracted contact, lead, listing, portal ID, and message details are shown in a review screen.
- User edits before save.
- No model output is auto-saved.

Audio note ingestion can follow after text ingestion:

- On-device Speech transcription.
- Same review-first extraction pipeline.
- Timeout handling and manual-entry fallback.

### 3. Portal Lead Ingestion

Portal ingestion should support common Peru workflows without scraping or posting automation.

MVP portal templates:

- Adondevivir
- Urbania
- Properati

MVP behavior:

- Parse shared or forwarded portal email text.
- Extract contact data, message, property reference, and portal ID.
- Link portal IDs to existing listings when possible.
- Create a review draft when no listing match exists.

Out of scope:

- Portal scraping.
- Auto-posting.
- Credentials, bots, or reverse-engineered portal APIs.

### 4. Listings and Portal Exports

Listings are the product's second anchor after contacts.

MVP behavior:

- Structured listing CRUD.
- Photos.
- Location and address.
- Price and property facts.
- Owner and representative links.
- Portal copy templates for Adondevivir, Urbania, and Properati.
- Optional on-device listing-description draft using Foundation Models.
- User edits before copy/share.

### 5. Matching

Matching should be deterministic first.

Inputs:

- Budget overlap.
- District match.
- Bedrooms.
- Area.
- Transaction type.
- Property type.

MVP behavior:

- Rank likely listings for a buyer.
- Show transparent match reasons.
- Let Foundation Models draft an outbound message only after the agent chooses a match.
- No auto-send.

### 6. Visits

Visits should connect CRM history to the system calendar.

MVP behavior:

- EventKit integration with a dedicated Bricks Leads calendar.
- Visits link to a contact or lead profile, a listing, and an EventKit event identifier.
- Visit outcomes are stored in the interaction timeline.

### 7. Follow-Ups

Follow-ups should be local, predictable, and review-first.

MVP behavior:

- Daily local maintenance identifies stale leads.
- Reminders use local notifications.
- Foundation Models can draft a suggested message.
- User edits and sends manually through system surfaces.
- No auto-send.

### 8. Peru Financial Tools

Financial tools should support the realtor's field conversations without becoming a full finance product.

MVP tools:

- Mortgage simulator.
- Alcabala estimator.
- Commission calculator.
- UIT display support.

Implementation rules:

- Store money as minor units plus currency.
- Keep assumptions visible.
- Snapshot rates or UIT values used in saved scenarios.
- Expose stable tools through App Intents after the underlying calculations are tested.

Out of scope:

- SUNAT invoicing.
- Tax filing.
- Legal or financial advice claims.

### 9. Document Intelligence

Document intelligence should support data review, not automatic legal interpretation.

MVP document goals:

- DNI validation support.
- SUNARP summary support.
- Preliminary contract key-term summaries.

Implementation rules:

- Use Apple-native Vision and Foundation Models APIs.
- Keep extracted results review-first.
- Never change product data without user confirmation.
- Store source documents and extracted summaries locally.

### 10. Map Context

MapKit should help agents explain location value.

MVP behavior:

- District-aware search.
- Travel-time context.
- Look Around where available.
- Nearby amenity talking points.

## Architecture Rules

- SwiftData is the local source of truth for user data.
- CloudKit private database sync is a future same-user multi-device feature, not a team feature.
- V1 schema must stay CloudKit-ready before sync is enabled.
- Views own draft/edit state.
- `DataStore` commits validated mutations.
- `ReadStore` serves App Intents, search, and internal read paths.
- Widgets read App Group `Codable` snapshots only.
- Foundation, Domain, Location, widget, and DTO layers must not import SwiftData.
- No persisted `Decimal` in `@Model` types.
- No `UndoManager` inside `DataStore` for V1.
- Every AI call must have timeout handling and manual-entry fallback.
- LLM-generated structure should use guided generation where available.
- Deterministic validators own regulated fields such as DNI, RUC, phone, money, and location codes.

## Important Corrections From The Original MVP

### Automatic Call Logging

Automatic detection of client calls is not a reliable V1 promise for a third-party iOS app. Bricks Leads should not claim automatic call detection or automatic post-call prompts.

Better MVP direction:

- Manual interaction logging.
- Fast call-note entry from a contact or lead.
- Future App Intent or shortcut-assisted logging where Apple APIs allow it.
- Speech dictation for notes when the user explicitly starts it.

### Cloud Positioning

The MVP should not claim "zero cloud syncing" as a permanent product promise.

Correct positioning:

- Local-first by default.
- No server-side backend.
- Future optional CloudKit private database sync for the same user across their own devices.
- No team collaboration.

### Monetization Timing

Do not build monetization before the core workflow is useful.

Recommended order:

1. Ship the local CRM spine.
2. Add lead capture and listing workflows.
3. Add matching, follow-ups, and portal exports.
4. Add document and financial tools.
5. Test willingness to pay.
6. Add StoreKit subscription or lifetime beta offer only after V1 value is proven.

Potential paid features later:

- Unlimited document intelligence.
- Advanced financial scenarios.
- AI-assisted follow-ups and listing copy.
- Widgets and App Intent power workflows.
- Future same-user CloudKit sync.

## MVP Non-Goals

- Server-side AI.
- Team collaboration.
- RoomPlan or 3D floor plans.
- Portal scraping.
- Portal posting automation.
- SUNAT invoicing.
- Android.
- Non-AI-device fallback product mode.
- Auto-send messaging.
- Automatic call monitoring.

## Build Order

1. Finish the contact/listing CRM spine.
2. Add richer listing fields, detail screens, photos, and owner workflows.
3. Add portal export templates.
4. Add Share Extension text ingestion and extraction review.
5. Add portal email parsing.
6. Add Speech transcription for voice notes.
7. Add visits and EventKit.
8. Add Peru financial calculators.
9. Add deterministic matching and review-first follow-up drafting.
10. Add document intelligence.
11. Add MapKit context.
12. Add Siri, widgets, onboarding, privacy review, and TestFlight polish.

## Launch Quality Bar

The MVP is ready for TestFlight only when:

- Contact and listing creation are reliable.
- Address resolution handles ambiguity without silent guesses.
- DataStore validation prevents invalid regulated fields.
- Export and purge behavior are accurate enough for privacy claims.
- AI output is always reviewed before save/send.
- The app has no server dependency.
- App copy avoids legal overclaims.
- UI tests cover the core create/edit flows.
- Documentation, ADRs, and implementation status match the code.
