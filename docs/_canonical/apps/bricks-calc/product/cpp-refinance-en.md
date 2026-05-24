---
title: Bricks Calc Custom Product Page — Refinance (EN)
doc_id: bricks-calc-product-cpp-refinance-en
doc_type: product
role: canonical
app_scope: bricks-calc
owner: Freddy
status: needs-review
last_reviewed: 2026-05-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - app-store
  - cpp
  - refinance
  - en
---

# Bricks Calc — Refinance Custom Product Page

Last updated: April 28, 2026

## Goal

Create a refinance-focused custom product page for Bricks Calc that answers one clear question:

Will refinancing actually save me money?

This page should target people who already have a mortgage and want to compare their current loan against a new rate, term, or payment.

## Audience

- Existing homeowners
- People actively shopping refinance offers
- Users comparing lower-rate, lower-payment, or shorter-term refinance options

This is not a first-time buyer page. Avoid home search, down payment, or PMI-first messaging unless it directly supports the refinance story.

## Core Positioning

Lead with the practical outcome:

See the new payment, break-even timing, and long-term savings before you refinance.

Then support it with the product proof:

Compare your current and new loan side by side, review amortization, and test extra payments after refinancing.

## App Store Connect Setup

### Reference Name

```text
Refinance
```

### Base Page To Copy

Start from the current default Bricks Calc product page, then replace the screenshot set and promotional text for refinance intent.

### Promotional Text

```text
Compare your current loan with a new rate, payment, and term. Bricks Calc helps you see when refinancing starts to save money.
```

### Keywords

Select only keywords that match refinance intent. Keep this keyword combination unique to this CPP.

Recommended:

- `refinance`
- `loan`
- `calculator`
- `payment`
- `interest`
- `amortization`

Do not prioritize:

- `pmi`
- `tax`
- `rental`
- `emi`

Those terms dilute the refinance story for U.S. intent.

## Screenshot Strategy

The first two screenshots matter most. They should answer:

1. What is my new monthly payment?
2. When does refinancing actually pay off?

Recommended order:

1. New monthly payment
2. Refinance break-even
3. Current loan vs new loan
4. Total interest difference
5. Loan over time
6. Extra payments after refinance

### Screenshot Headlines

Use short, outcome-first copy:

1. `See your new monthly payment`
2. `Know when refinancing pays off`
3. `Compare your current and new loan`
4. `See the total interest difference`
5. `Understand the loan over time`
6. `Test extra payments later`

## Messaging Guardrails

This CPP should:

- feel narrower than the default page
- stay focused on refinance math, not general loan shopping
- emphasize break-even and savings, not just calculation features

This CPP should not:

- open with homebuyer language
- mix in too many unrelated buyer inputs
- read like a general mortgage calculator page with refinance mentioned at the end

## Deep Link

If app routing is ready, add a refinance deep link when configuring the CPP in App Store Connect.

Suggested destination:

- Refinance view or refinance comparison entry state

If deep linking is not ready yet, leave this empty for now and keep the CPP focused on conversion rather than post-install routing.

## Success Criteria

Primary metric:

- Conversion rate

Secondary metrics:

- Retention
- Sessions
- Paying user quality, if meaningful volume exists

Do not compare this CPP against the homebuyer CPP as if they serve the same audience. The right question is whether refinance-intent traffic converts better on this page than on the default page.

## Build Sequence

1. Create the `Refinance` CPP in App Store Connect.
2. Apply the promotional text above.
3. Assign the refinance keyword set.
4. Upload the refinance-ordered screenshots.
5. Add a deep link only if the app-side destination is ready.
6. Launch only on traffic that clearly signals refinance intent.

## Next Step

After this CPP is assembled in App Store Connect, decide whether a separate `refinance.html` page is still needed for website traffic, SEO, or paid landing-page use.
