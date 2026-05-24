---
title: Bricks Scan Support Runbook
doc_id: bricks-scan-operations-support-runbook
doc_type: operations
role: canonical
app_scope: bricks-scan
owner: Freddy
status: needs-review
last_reviewed: 2026-04-21
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - scan
  - support
---

# Bricks Scan Support Runbook

## Product Facts

- Platforms: iPhone, iPad, and Mac from one shared SwiftUI app target, plus a widget and Live Activity extension
- Account model: No app account. Purchases and restores run through StoreKit and the App Store account on the device.
- Sync model: Local-first SwiftData library. Cloud sync code exists, but the current Settings sync UI is gated behind `#if DEBUG`, so do not promise a user-visible iCloud toggle in release builds without rechecking the shipped app.
- Data sensitivity: OCR, summaries, metadata extraction, rendering, and export happen on device. Release-capable builds also include optional Firebase analytics controls, so privacy guidance should stay specific to document content and processing.

## Common Support Topics

| Topic | Likely cause | First response | Escalation path |
|---|---|---|---|
| Free plan limit reached | User hit a hard free-tier cap for documents, pages, tags, folders, or saved signatures | Confirm which limit was reached and explain that upgrading removes the cap | Escalate only if the user is below the documented limit but the paywall still appears |
| PDF import fails | The PDF is encrypted, unreadable, empty, or exceeds the current page limit | Ask whether the file is password protected and how many pages it has, then suggest trying an unlocked PDF or splitting the file | Escalate with the failing file type, page count, and exact error copy if an unlocked valid PDF still fails |
| Summary or AI naming unavailable | Apple Intelligence is unavailable on the device, not enabled, or the document locale is unsupported | Explain that the app falls back to non-Apple-Intelligence organization paths and that Summary requires Apple Intelligence availability | Escalate only if a supported device with Apple Intelligence enabled still fails consistently |
| Reminders sync or alerts fail | Notification, Reminders, or Calendar permissions are disabled, or the chosen Reminders list is unavailable | Ask the user to check system permissions and reselect or refresh the Reminders list in Settings | Escalate with platform, permission state, and whether the issue affects document alerts, folder sync, or both |
| Export output is missing expected content | OCR embedding, markup, or signatures were not included in the export options, or the document has no OCR text | Ask which export format was used and whether OCR, markup, and signatures were enabled in the export sheet | Escalate with export format, platform, and whether the issue affects PDF, image, text, or HTML export |
| Restore purchases does not unlock Pro | App Store entitlement refresh has not completed or the purchase belongs to a different Apple account | Ask the user to use Restore Purchases and confirm the same App Store account is active | Escalate if restore succeeds but premium access still does not update |

## Troubleshooting Steps

1. Confirm platform, app version, and whether the issue is on iPhone, iPad, or Mac.
2. Identify the exact workflow: scan, import, summarize, organize, export, reminder, or purchase restore.
3. Ask for the exact user-visible error message and whether the issue is reproducible with a different document.
4. Check known hard limits first: `Document.maxDocumentsLimit` = 40, `Document.maxPagesPerDocument` = 300, `Tag.maxTagsLimit` = 20, `DocumentFolder.maxFoldersLimit` = 20, `Signature.maxSignaturesLimit` = 2 on the free tier.
5. For import issues, verify whether the PDF is encrypted or exceeds the allowed page count.
6. For AI issues, verify Apple Intelligence availability and keep guidance specific: Summary and AI naming depend on Foundation Models availability and supported locale.
7. For reminders or alerts, verify system permissions plus the chosen Apple Reminders list or calendar state.
8. For purchase issues, ask the user to run Restore Purchases before escalating.

## Known Limits

- Free tier caps are enforced in-app: 40 documents, 300 pages per document, 20 tags, 20 folders, and 2 saved signatures.
- Password-protected PDFs are not supported for import.
- Apple Intelligence features can be unavailable because the device is ineligible, the feature is disabled, the model is not ready, or the document locale is unsupported.
- iCloud sync code exists, but the current Settings UI exposes sync controls only in debug builds. Do not instruct release users to toggle sync in Settings unless the shipped UI is revalidated first.
- Analytics can be enabled or disabled by the user in supported release builds; do not describe the app as completely telemetry-free.

## Escalation Notes

- Escalate when a limit, entitlement, or permission explanation does not match the observed behavior in the shipped app.
- Collect platform, app version, reproduction steps, exact error copy, document source type, and whether the issue affects one document or all documents.
- For import failures, collect whether the file is encrypted, its page count, and whether it came from Files, Photos, or another app.
- For AI failures, collect device model, Apple Intelligence availability state, document language, and whether the fallback organization flow still worked.
- For export failures, collect the chosen format plus whether markup, signatures, and OCR embedding were enabled.

## Minimum Complete Content Checklist

- [x] Product facts are accurate
- [x] Common topics are practical
- [x] Troubleshooting is actionable
- [x] Limits are explicit
- [x] Escalation path is defined
