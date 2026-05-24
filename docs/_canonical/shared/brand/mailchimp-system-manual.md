---
title: Mailchimp Rules & Standards
doc_id: shared-brand-mailchimp-system-manual
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

# Bricks Apps — Mailchimp Rules & Standards

## Purpose

This document defines the rules for creating and maintaining Mailchimp campaigns, emails, automations, templates, tags, and segments at Bricks Apps.

Use this file when:

* creating a new campaign
* drafting a new email
* naming a new asset
* deciding whether something should be a campaign or automation
* reviewing quality before sending
* keeping future work consistent across products

This is the policy file.
It should change rarely.

---

## 1. Core Principles

### 1.1 Build systems, not one-offs

Every new email should fit an existing structure when possible.

Prefer:

* reusable templates
* predictable naming
* simple segmentation
* documented triggers
* repeatable QA

### 1.2 One email, one job

Every email should have one primary purpose.

Examples:

* get the user to complete a form
* confirm a submission
* announce acceptance
* drive first use
* collect feedback

Do not overload a single email with multiple competing goals.

### 1.3 Clarity over cleverness

Emails should be easy to scan and easy to act on.

Prefer:

* clear subject lines
* direct body copy
* one primary CTA
* short paragraphs
* obvious next steps

### 1.4 Reuse structure, not confusion

Do not create new naming patterns, tag styles, or template formats unless there is a clear reason.

---

## 2. Brand and Writing Rules

### 2.1 Voice

Use the Bricks Apps editorial voice.

The voice should feel:

* clear
* calm
* precise
* credible
* practical

Avoid:

* hype
* inflated claims
* vague marketing language
* startup clichés
* fake urgency

### 2.2 Writing standard

Keep copy:

* concrete
* readable
* intentional
* low-friction

### 2.3 CTA rule

Every email should have one primary CTA.

Optional secondary links are acceptable only when they do not compete with the main action.

### 2.4 Subject line rule

Subject lines should describe the purpose of the email, not perform tricks.

Prefer:

* direct relevance
* specific context
* moderate length
* natural language

---

## 3. Asset Naming Rules

### 3.1 Campaign naming

Use:
`[Product] — [Number] — [Purpose]`

Examples:

* `Bricks Leads — 01 — Qualification Invite`
* `Bricks Calc — 03 — Launch Announcement`

### 3.2 Automation naming

Use:
`[Product] — [Flow Type] — [Goal]`

Examples:

* `Bricks Leads — Beta Flow — Qualification`
* `Bricks Scan — Onboarding Flow — Activation`

### 3.3 Template naming

Use:
`[Product] — Template — [Use Case]`

Examples:

* `Bricks Leads — Template — Acceptance`
* `Bricks Apps — Template — Newsletter`

### 3.4 Segment naming

Use:
`[Product] — Segment — [Condition]`

Examples:

* `Bricks Leads — Segment — Survey Completed`
* `Bricks Calc — Segment — Clicked Launch Email`

### 3.5 Tag naming

Use:
`[Category]: [Value]`

Approved categories:

* Source
* Product
* Stage
* Action

Examples:

* `Source: Typeform`
* `Product: Bricks Leads`
* `Stage: Beta Accepted`
* `Action: Survey Completed`

---

## 4. Campaign vs Automation Rules

### 4.1 Use a campaign when

Use a campaign when the message is:

* a one-time send
* batch-controlled
* manually selected
* dependent on a manual decision
* editorial or announcement-based

### 4.2 Use an automation when

Use an automation when the message depends on:

* a trigger
* a delay
* non-completion behavior
* form submission
* onboarding sequence timing
* a consistent lifecycle event

### 4.3 Manual-decision rule

If a message depends on human review or acceptance, keep it manual unless the decision system is fully reliable.

---

## 5. Audience and Data Rules

### 5.1 Audience simplicity

Use one main audience unless a split is clearly necessary.

### 5.2 Field discipline

Keep custom fields minimal.
Prefer tags and segments over unnecessary fields.

### 5.3 Source tracking

Every new entry point should have a documented source.

For every new form or import, record:

* source name
* product
* tags applied
* segment logic
* owner

---

## 6. Email Structure Rules

### 6.1 Recommended structure

Default email structure:

1. context
2. why it matters
3. next step
4. CTA

### 6.2 Length rule

Keep emails as short as the purpose allows.

Do not make them short just for appearance if clarity suffers.

### 6.3 Primary CTA placement

The main CTA should appear early enough that the action is obvious without excessive scrolling.

### 6.4 Redundancy rule

Do not repeat the same point in the subject line, heading, and body unless repetition improves clarity.

---

## 7. Template Rules

### 7.1 Use a limited template set

Do not create a new template for every email.

Preferred reusable template categories:

* Invite
* Reminder
* Confirmation
* Acceptance
* Not Accepted
* Onboarding
* Feedback Request
* Announcement
* Newsletter

### 7.2 Template ownership

Every template should have:

* a name
* a purpose
* a product scope
* a note on when to use it

---

## 8. QA Checklist Before Send

Before any campaign or automation goes live, verify:

* name matches the naming standard
* audience is correct
* segment is correct
* subject line is final
* preview text is final
* links work
* CTA is clear
* copy matches brand voice
* tags or automation logic are correct
* exclusions are correct
* mobile rendering is checked
* timing is correct
* duplicate sends are not possible

---

## 9. Documentation Rules

Every new asset should be documented with:

* final name
* purpose
* product
* type
* audience
* trigger or send rule
* CTA
* status
* owner
* notes

If it is not documented, it is not complete.

---

## 10. Change Control

This file should only change when a rule, standard, or system pattern changes.

Do not use this file to log day-to-day edits.

That belongs in the operations file.
