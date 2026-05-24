---
title: Bricks Website Development Guide
doc_id: bricks-website-engineering-dev-guide
doc_type: engineering
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
  - development
---

# Bricks Website — Development Guide

## Overview

The Bricks marketing website is a static site served directly from source files. There is no build step, bundler, or package-managed asset pipeline. The main public surface lives at `bricks.pe`, while some Bricks Leads routes and thank-you flows resolve to `leads.bricks.pe`.

Shared brand docs and canonical product docs remain the source of truth for messaging. The Bricks Page repo is the source of truth for actual routing, assets, page-local scripts, and hosting behavior.

---

## Site Structure

| File / Folder | Purpose |
|---|---|
| `index.html` | Home page |
| `bricks-scan.html` | Bricks Scan product page |
| `bricks-calc.html` | Bricks Calc product page |
| `bricks-leads.html` | Bricks Leads product page |
| `about.html` | About page |
| `help.html` | Help center — combined user guide for Bricks Calc and Bricks Scan, organized by app with accordion sections |
| `support.html` | Support contact |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `purchase-guide-01.html` | Purchase flow guide |
| `survey.html` | User survey |
| `thank-you.html` / `thank-you-feedback.html` | Confirmation pages |
| `purrfect-yarn.html` | Non-core standalone page in the repo; not part of the canonical Bricks website surface |
| `styles.css` | Global stylesheet |
| `scripts.js` | Global JavaScript for language switching, consent handling, shared motion, and utility behavior |
| `hero-background.js` | Canvas-based hero animation support |
| `images/` | Shared images and icons |
| `images-bricks-scan/` | Bricks Scan screenshots and assets |
| `images-bricks-calc/` | Bricks Calc screenshots and assets |
| `images-bricks-leads/` | Bricks Leads screenshots and assets |
| `purrfect-yarm-images/` | Assets for the non-core `purrfect-yarn.html` page |
| `apple-app-site-association` | Universal links configuration |
| `apple-app-site-association.json` | Duplicate App Clip association payload kept in repo |
| `site.webmanifest` | PWA/browser metadata |
| `_headers` | Hosting response headers and cache policy |
| `formatFileSize.test.js` | Small Node test covering shared file-size formatting logic |
| `robots.txt` | Crawler configuration |
| `sitemap.xml` | SEO sitemap |

---

## Design Conventions

Follow the Bricks brand system exactly. See [`shared/brand/brand-system.md`](../../../shared/brand/brand-system.md) for the full spec.

Key rules for the web:

- **No new hardcoded hex colors on core Bricks pages** — prefer existing CSS custom properties and the values already aligned with `brand-system.md`
- **Monochromatic base** — restrained use of color; accent colors are product-specific (Scan = Teal, Calc = Blue, Leads = Orange)
- **Soft-Emboss visual language** — subtle shadows and surface depth; no heavy borders or sharp contrasts
- **SF Pro typography** — use system font stack that resolves to SF Pro on Apple devices
- **No ornamental copy** — brand voice is clear, calm, practical. State what it does, why it matters, stop

`purrfect-yarn.html` is an explicit exception today. It uses Tailwind CDN, Google Fonts, and a brighter non-Bricks visual language. Do not treat that page as a pattern source for the main Bricks site.

## Frontend Architecture Notes

- Shared styling lives in `styles.css`.
- Shared interaction code lives in `scripts.js`.
- `scripts.js` handles language switching, localStorage-backed language persistence, analytics-consent persistence, shared scroll/reveal behavior, and some page-specific helpers.
- `hero-background.js` provides a canvas animation rather than a general site runtime.
- Some pages use lightweight third-party scripts such as Alpine.js, GSAP, and Typeform embed code, but the site is still authored as static source files.
- Product assets are grouped into product-specific folders to avoid one mixed image surface.
- Several pages include inline scripts for page-specific behavior, especially support and thank-you flows.

Do not introduce a build pipeline to solve an organizational problem that can be handled with better file discipline.

---

## Adding or Updating a Product Page

1. Follow the structure of an existing product page (e.g., `bricks-scan.html`)
2. Reuse the existing shared header, footer, cookie-consent banner, and language-switch pattern unless there is a strong reason not to
3. Update `sitemap.xml` if adding a new page
4. Place product-specific images in the matching `images-[product]/` folder
5. Verify `robots.txt` does not block the new page
6. Verify the copy still matches the canonical product docs in `Bricks-Docs/apps/`
7. Check whether the new page should link to `bricks.pe`, `leads.bricks.pe`, or an App Store URL, and keep those boundaries consistent
8. If the page includes analytics or embedded third-party services, verify consent behavior still makes sense for that surface

---

## Universal Links

`apple-app-site-association` and `apple-app-site-association.json` are repo-tracked association payloads for Apple routing. `_headers` sets the required `Content-Type: application/json` for the extensionless association paths. These files are operationally sensitive and should not be changed casually.

The current payload is App Clip-oriented rather than a broad app-site association document. Treat any change here as a coordinated app-and-hosting change, not a routine content edit.

## Runtime Dependencies

- **Shared first-party assets:** `styles.css`, `scripts.js`, `hero-background.js`
- **Analytics:** Google Tag Manager, GA4, Meta Pixel
- **Support intake:** FormSubmit endpoint in `support.html`
- **Feedback intake:** Typeform live embed in `survey.html`
- **Interactive helpers:** Alpine.js on several support-oriented pages, GSAP on `bricks-scan.html`

If one of these third-party dependencies changes, update the canonical docs in the same pass.

---

## Deployment

The site is static. Deployment is effectively a source publish, with no build output to inspect beforehand.

After deploying:
- Verify universal links still work by testing a deep link on device
- Verify `sitemap.xml` is accessible
- Check that `apple-app-site-association` is served correctly (Content-Type: `application/json`, no extension in the URL)
- Verify key product pages still match current canonical app positioning and support information
- Verify support form submission still reaches FormSubmit and the success modal still renders a reference number
- Verify the Typeform survey still loads
- Verify `leads.bricks.pe` routes used by Bricks Leads CTAs and thank-you pages still resolve as expected
- Spot-check that language switching and cookie-consent behavior still work on at least one shared page
