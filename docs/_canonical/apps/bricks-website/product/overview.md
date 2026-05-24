---
title: Bricks Website Overview
doc_id: bricks-website-product-overview
doc_type: product
role: canonical
app_scope: bricks-website
owner: Freddy
status: needs-review
last_reviewed: 2026-04-06
review_cycle: monthly
replacement_path:
derived_from:
source_links:
tags:
  - website
  - product
---

# Bricks Website — Overview

Bricks Website is the public web surface for Bricks Apps. Its primary domain is `bricks.pe`, with a related `leads.bricks.pe` domain used by some Bricks Leads landing and thank-you flows. The site introduces the Bricks portfolio, routes visitors into product pages, publishes legal and support information, and hosts a small set of supporting marketing flows.

The site is authored as static HTML, CSS, and JavaScript, but it is not a single landing page. It includes portfolio messaging, individual product pages, bilingual sections on key pages, analytics instrumentation, SEO metadata, cookie-consent handling, and universal-link support files for Apple platform routing.

## Audience

- Primary users: prospective Bricks customers discovering the products
- Secondary users: existing customers seeking help, support, privacy, or terms information
- Platforms: web browsers on mobile and desktop

## Core Workflows

1. Introduce the Bricks portfolio and route visitors to the right product page.
2. Present product-specific landing pages for Bricks Scan, Bricks Calc, and Bricks Leads.
3. Capture support requests, product feedback, and Bricks Leads sign-up interest through supporting pages and third-party-backed flows.

## Main Features

| Feature | What it does | Why it matters |
|---|---|---|
| Portfolio home page | Introduces the Bricks suite and links into Scan, Calc, and Leads entry points | Sets the umbrella brand, product framing, and top-level navigation |
| Product landing pages | Dedicated pages for Bricks Scan, Bricks Calc, and Bricks Leads with App Store or landing CTAs | Lets each app carry focused messaging and conversion paths |
| Support and feedback pages | Hosts support, help, survey, purchase-guide, privacy, and terms pages | Gives visitors operational, legal, and product-feedback routes without leaving the site structure |
| Bilingual presentation | Switches visible English and Spanish copy on shared pages via client-side language handling | Keeps core marketing and support surfaces usable for both audiences without duplicating page files |
| Analytics and consent flow | Shows a cookie-consent banner and conditionally enables GTM, GA4, and Meta Pixel on major pages | Supports funnel measurement while keeping consent state explicit in the browser |
| SEO and routing assets | Ships canonical tags, hreflang/metadata on some pages, `robots.txt`, `sitemap.xml`, and App Clip association files | Supports discovery, sharing, and Apple routing behavior |

## Tech Stack

- Markup: static HTML pages
- Styling: shared `styles.css`, with one outlier page (`purrfect-yarn.html`) using Tailwind CDN and inline styles
- Client-side behavior: shared `scripts.js`, page-local inline scripts, and `hero-background.js`
- Runtime libraries: Alpine.js on support-oriented pages, GSAP on the Bricks Scan page, and a Typeform embed on the survey page
- Operational assets: `_headers`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, and Apple App Clip association files

## Product Limits and Constraints

- There is no build step; changes are served directly from source files.
- The site must remain aligned with shared brand docs and canonical product docs in `Bricks-Docs`.
- Several support and feedback flows depend on external services: FormSubmit for support intake and Typeform for survey collection.
- Bricks Leads is split across the main `bricks.pe` surface and `leads.bricks.pe` URLs, so copy and routing changes must be checked in both contexts.
- Universal-link and hosting files are operationally sensitive and should change rarely.
- Marketing copy must not outpace canonical product truth in `Bricks-Docs`.
- `purrfect-yarn.html` exists in the repo but does not follow the shared Bricks visual system and should be treated as a non-core exception, not a canonical Bricks website surface.

## Key Decisions

- The site stays static to keep deployment and maintenance simple.
- Shared CSS and shared scripts are reused across the main Bricks pages to keep the surface coherent.
- Language preference and analytics consent are stored in browser local storage rather than being server-driven.
- Product pages are treated as part of the documentation and messaging system, not just standalone marketing assets.
- Operational pages are allowed to use focused third-party integrations when a fully custom implementation would add overhead without clear product value.

## Related Docs

- Engineering guide: [../engineering/dev-guide.md](../engineering/dev-guide.md)
- Brand foundation: [../../../shared/brand/brand-foundation.md](../../../shared/brand/brand-foundation.md)
- Brand system: [../../../shared/brand/brand-system.md](../../../shared/brand/brand-system.md)
