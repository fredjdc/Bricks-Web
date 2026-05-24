---
title: Bricks Scan Release Checklist
doc_id: bricks-scan-operations-release-checklist
doc_type: operations
role: canonical
app_scope: bricks-scan
owner: Freddy
status: active
last_reviewed: 2026-04-04
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - release
---

# App Store Launch Checklist

This checklist is grounded in the current Bricks Scan codebase and should be used before shipping to the Apple App Store.

It covers:

- Product and App Store Connect setup
- Code and build release gates
- Privacy, permissions, and review-risk items
- Manual validation flows that should pass on real devices

## Current Codebase Signals

- Main app target: `bricks.Bricks-Scan`
- Widget target: `bricks.Bricks-Scan.BricksScanWidgets`
- Current version/build: `1.0 (30)`
- Platforms configured in Xcode: iPhone, iPad, macOS
- Major integrations present in code:
  - CloudKit / SwiftData sync
  - WidgetKit / Live Activities
  - StoreKit 2 subscriptions and lifetime purchase
  - Firebase Analytics
  - Foundation Models / Apple Intelligence features
  - Camera, Photos, Calendar, Reminders, local notifications
- Localization present: English and `es-419`

## Launch Blockers

- [ ] Confirm App Store Connect products exist for all StoreKit IDs used in code:
  - `com.bricksscan.monthly`
  - `com.bricksscan.yearly`
  - `com.bricksscan.lifetime`
- [ ] Verify the CloudKit production schema has been pushed after the latest SwiftData model changes.
- [ ] Validate signing, capabilities, and provisioning for:
  - Main app
  - Widget extension
  - CloudKit container
  - App Group
  - Push / remote notifications if CloudKit push sync is relied on
- [ ] Confirm first-launch behavior is stable when Apple Intelligence is unavailable, disabled, or still downloading.
- [ ] Confirm purchase gating is correct for every premium entry point.
- [ ] Confirm App Store privacy answers are accurate for Firebase Analytics, app usage data, diagnostics, and any identifiers actually collected.
- [ ] Run a full release build and full test pass outside the current sandboxed environment.

## Product and Metadata

- [ ] Finalize the app name, subtitle, keywords, and description in App Store Connect.
- [ ] Prepare screenshots for:
  - iPhone
  - iPad
  - macOS
- [ ] Prepare App Preview video only if it materially improves conversion.
- [ ] Finalize the first release “What’s New” text.
- [ ] Confirm the category is correct. Current project setting is `Utilities`.
- [ ] Add a support URL and privacy policy URL in App Store Connect.
- [ ] Add an App Review contact with working credentials or reviewer notes if needed.
- [ ] Add App Review notes explaining:
  - AI features depend on Apple Intelligence availability
  - Sync uses iCloud / CloudKit
  - Premium features are gated through StoreKit 2
  - Widgets / Live Activities require compatible OS behavior

## Signing, Capabilities, and Packaging

- [ ] Archive the app with the Release configuration.
- [ ] Confirm the archive includes the widget extension correctly.
- [ ] Verify the release archive has no missing entitlements or capability mismatches.
- [ ] Confirm bundle IDs match App Store Connect records.
- [ ] Confirm version and build number are updated for the release.
- [ ] Verify exported archive installs and launches on a physical iPhone/iPad.
- [ ] Verify exported archive installs and launches on macOS if shipping the Mac target through the same listing.

## Privacy and Permissions

- [ ] Review all user-facing permission prompts for clarity and truthfulness:
  - Camera
  - Photos
  - Calendar
  - Reminders
- [ ] Verify permission requests happen only at the moment of use, not prematurely.
- [ ] Confirm denial states are graceful and recoverable from Settings.
- [ ] Confirm App Store privacy disclosures match real behavior for:
  - Analytics
  - Purchases
  - User content
  - Diagnostics / crash-related data if any
- [ ] Verify whether an app-level `PrivacyInfo.xcprivacy` file is needed for your release process. No app-level privacy manifest file is currently present in this repo.
- [ ] Confirm `ITSAppUsesNonExemptEncryption = NO` is still accurate for the shipped build and backend/service usage.

## Data, Sync, and Reliability

- [ ] Test local-only mode from a clean install.
- [ ] Test enabling iCloud sync on a device already containing local documents.
- [ ] Test disabling iCloud sync after cloud data already exists.
- [ ] Test launch behavior when iCloud account is:
  - available
  - unavailable
  - signed out
  - restricted
- [ ] Test two-device sync for create, edit, delete, restore, and conflict resolution.
- [ ] Test app relaunch after a sync fallback or migration event.
- [ ] Confirm no duplicate folders, tags, pages, or documents appear after sync reconciliation.
- [ ] Validate Spotlight indexing recovery on upgrade and relaunch.
- [ ] Validate trash cleanup behavior and 30-day deletion expectations.

## StoreKit and Premium Access

- [ ] Verify product loading succeeds in production-signed builds.
- [ ] Verify monthly, yearly, and lifetime purchases individually.
- [ ] Verify restore purchases from a fresh install and a second device.
- [ ] Verify cancelled, pending, expired, grace-period, and billing-retry states.
- [ ] Verify premium unlock state survives relaunch and account changes.
- [ ] Verify every paywall and premium feature entry surface behaves correctly when:
  - user is free
  - user becomes premium
  - user loses entitlement
- [ ] Confirm App Store Connect subscription metadata, pricing, and localization are complete.

## Core User Flows

- [ ] Onboarding from a clean install
- [ ] First scan from camera
- [ ] First import from Photos
- [ ] PDF import
- [ ] Multi-page scan and reorder
- [ ] Auto-crop and image enhancement
- [ ] OCR extraction
- [ ] Search by title, OCR text, notes, tags, and folders
- [ ] Export as PDF
- [ ] Export as images
- [ ] Export as text
- [ ] Share sheet on iPhone/iPad
- [ ] Notes editing
- [ ] Signature capture and placement
- [ ] Markup / annotations
- [ ] Folder creation, rename, move, delete
- [ ] Tag creation, assignment, removal
- [ ] Deletion, trash, and restore flows

## AI and Apple Intelligence

- [ ] Validate summary generation on a supported device with Apple Intelligence enabled.
- [ ] Validate behavior when Apple Intelligence is:
  - disabled
  - unsupported on device
  - still preparing model assets
- [ ] Verify non-AI fallback paths still let the app feel complete.
- [ ] Check generated summaries, titles, tags, and folder suggestions for obvious hallucinations on representative real documents.
- [ ] Confirm language behavior for English and `es-419`.
- [ ] Verify AI features fail gracefully offline or when the model is unavailable.
- [ ] Add App Review notes if reviewers need to understand why AI output may not appear on unsupported hardware.

## Widgets, Live Activities, and Shortcuts

- [ ] Verify the widget renders with real shared app data.
- [ ] Verify widget behavior after document creation, deletion, and app relaunch.
- [ ] Verify Live Activity start, update, and end behavior during scan processing.
- [ ] Verify App Intents / Shortcuts donate and execute correctly.
- [ ] Confirm App Group data sharing works correctly across app and extension builds.

## Notifications, Calendar, and Reminders

- [ ] Verify local notifications schedule correctly for documents and folders.
- [ ] Verify deleting a document or folder cleans up associated reminder state.
- [ ] Verify “Add to Calendar” works and handles denied access cleanly.
- [ ] Verify “Add to Apple Reminders” works and handles denied access cleanly.
- [ ] Verify Reminders-list-to-folder sync works and does not create duplicates.
- [ ] Verify relaunch state after reminders auto-sync runs on startup.

## Accessibility and Quality

- [ ] Check Dynamic Type on iPhone and iPad.
- [ ] Check VoiceOver for the main flows:
  - onboarding
  - scanner entry
  - document list
  - document detail
  - export
  - paywall
- [ ] Check color contrast and selection states.
- [ ] Check keyboard navigation on iPad and macOS.
- [ ] Check empty states, error alerts, and loading states for polish and clarity.
- [ ] Verify no debug-only copy, placeholder text, or internal wording leaks into release UI.

## Performance and Stability

- [ ] Test a large library import / scan set.
- [ ] Test very large PDFs and multi-page documents.
- [ ] Test low-storage device behavior.
- [ ] Test background/foreground transitions during scanning and processing.
- [ ] Test memory behavior during OCR, PDF generation, markup, and export.
- [ ] Review Firebase analytics in a release build to confirm there is no startup regression.
- [ ] Review crash logs / organizer issues before submission.

## Regression Suite That Should Always Pass

- [ ] Settings persistence across relaunch
- [ ] iCloud toggle and sync status transitions
- [ ] Paywall, purchase, and restore
- [ ] Entitlement gating entry points
- [ ] Onboarding completion and relaunch state
- [ ] Scan to document creation
- [ ] Import to OCR to search
- [ ] Export flows
- [ ] Delete / trash / restore
- [ ] Widget and Live Activity sanity checks

## Evidence to Capture Before Submission

- [ ] Archive hash / build number recorded
- [ ] Screenshots of successful premium purchase and restore
- [ ] Screenshots or video of sync working across two devices
- [ ] Screenshots of denial-state handling for permissions
- [ ] Notes for any known issues accepted for 1.0
- [ ] Final go/no-go owner signoff

## Notes From This Review

- The current app target builds successfully for macOS Debug in this environment.
- Automated tests were not validated here because sandboxed `xcodebuild test` hit local environment I/O and simulator-service restrictions, so a full unsandboxed test run is still required before launch.
- The existing repo had only a minimal release checklist; this file now covers the current app surface area.
- `Documentation/GETTING_STARTED.md` appears outdated relative to the current project state:
  - it says there are zero external dependencies, but Firebase packages are present
  - its example bundle identifiers do not match the project
  - its platform / SDK notes should be revalidated before handoff
