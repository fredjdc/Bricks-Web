---
title: Mailchimp Operations Log
doc_id: shared-brand-mailchimp-operations-log
doc_type: product
role: canonical
app_scope: shared
owner: Freddy
status: active
last_reviewed: 2026-04-25
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - brand
  - mailchimp
  - automations
  - campaigns
  - email
  - templates
---

# Bricks Apps — Mailchimp Operations Log

## Purpose

This document tracks the actual Mailchimp system in operation.

Use this file when:

* reviewing what currently exists
* checking campaign status
* tracking active drafts and live automations
* recording changes
* planning updates
* auditing what is ready, paused, or archived

This is the execution file.
It should be updated often.

---

## 1. System Snapshot

### Main audience

**Bricks Apps**

### Current campaign inventory

| Name                                           | Type          | Status | Audience    |
| ---------------------------------------------- | ------------- | ------ | ----------- |
| Bricks Leads — 01 — Qualification Invite       | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 02 — Qualification Reminder     | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 03 — Survey Confirmation        | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 04 — Qualification Accepted     | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 05 — Qualification Not Accepted | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 06 — First Use (Onboarding)     | Regular email | Draft  | Bricks Apps |
| Bricks Leads — 07 — Feedback Request           | Regular email | Draft  | Bricks Apps |

---

## 2. Operating Status Model

Use one of these statuses for each asset:

* Drafting
* Ready for QA
* Ready to Send
* Automated Live
* Sent
* Paused
* Archived

This status layer is for internal tracking and should be maintained even if Mailchimp only shows Draft.

---

## 3. Current Beta Flow Map

| Step | Asset                      | Best Format             | Primary Job                 |
| ---- | -------------------------- | ----------------------- | --------------------------- |
| 1    | Qualification Invite       | Campaign or batch send  | Move users to Typeform      |
| 2    | Qualification Reminder     | Automation              | Recover non-completers      |
| 3    | Survey Confirmation        | Automation              | Confirm submission          |
| 4    | Qualification Accepted     | Campaign or manual send | Notify selected users       |
| 5    | Qualification Not Accepted | Campaign or manual send | Close the loop respectfully |
| 6    | First Use Onboarding       | Automation              | Drive first meaningful use  |
| 7    | Feedback Request           | Automation              | Collect structured feedback |

---

## 4. Asset Tracking Sheet

### Bricks Leads — 01 — Qualification Invite

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Drive qualified users to complete the Typeform
* **CTA:** Complete the form
* **Trigger / send rule:** Manual or batch send to interested users
* **Notes:** Anchor email for beta intake

### Bricks Leads — 02 — Qualification Reminder

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Recover users who did not complete the form
* **CTA:** Complete the form
* **Trigger / send rule:** Best as automation after non-completion
* **Notes:** Should exclude completed submitters

### Bricks Leads — 03 — Survey Confirmation

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Confirm submission and explain next step
* **CTA:** Soft or none
* **Trigger / send rule:** Best as automation immediately after submission
* **Notes:** Avoid implying acceptance

### Bricks Leads — 04 — Qualification Accepted

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Notify selected users and direct them to access
* **CTA:** Get started / Access beta
* **Trigger / send rule:** Manual or controlled send after review
* **Notes:** Must align with actual access readiness

### Bricks Leads — 05 — Qualification Not Accepted

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Close the loop respectfully for non-selected users
* **CTA:** Optional soft CTA
* **Trigger / send rule:** Manual or controlled send after review
* **Notes:** Important trust-preserving email

### Bricks Leads — 06 — First Use (Onboarding)

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Help accepted users take the first meaningful step
* **CTA:** Open Bricks Leads / Start with your first lead
* **Trigger / send rule:** Best as post-acceptance automation
* **Notes:** Focus on activation, not re-explaining acceptance

### Bricks Leads — 07 — Feedback Request

* **Type:** Regular email
* **Mailchimp status:** Draft
* **Internal status:** Drafting
* **Audience:** Bricks Apps
* **Primary goal:** Collect actionable product feedback
* **CTA:** Share feedback
* **Trigger / send rule:** Best delayed after initial use
* **Notes:** Should ask for practical feedback, not vague praise

---

## 5. Change Log

### 2026-04-25

* Split the original Mailchimp System Manual into two files:

  * Rules & Standards
  * Operations Log
* Renamed current campaigns to the normalized structure:

  * Bricks Leads — 01 — Qualification Invite
  * Bricks Leads — 02 — Qualification Reminder
  * Bricks Leads — 03 — Survey Confirmation
  * Bricks Leads — 04 — Qualification Accepted
  * Bricks Leads — 05 — Qualification Not Accepted
  * Bricks Leads — 06 — First Use (Onboarding)
  * Bricks Leads — 07 — Feedback Request

---

## 6. Current Gaps

The following still need to be added:

* subject line for each asset
* preview text for each asset
* final CTA copy
* exact segment or trigger logic
* send timing
* owner
* QA status
* performance results once sent

---

## 7. Next Actions

Recommended next updates to this file:

1. add subject lines and preview text
2. record exact send or trigger logic
3. define which assets stay manual and which move into automations
4. add final operational status for each asset
5. record first send results once live
