# Bricks Website Repo Map

Fast map of the website repository.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Marketing home / product suite landing page |
| `calc.html` | Bricks Calc product page |
| `scan.html` | Bricks Scan product page |
| `leads.html` | Bricks Leads product page |
| `about.html` | About / company page |
| `help.html` | Help center |
| `support.html` | Support contact page |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `purchase-guide-01.html` | In-app purchase guide (step 1) |
| `survey.html` | User survey page |
| `thank-you.html` | Post-purchase thank-you page |
| `thank-you-feedback.html` | Post-feedback thank-you page |

## Core Assets

| Path | Purpose |
|---|---|
| `styles.css` | Global stylesheet (design tokens, layout, components) |
| `scripts.js` | Global JavaScript (interactions, nav, shared logic) |
| `hero-background.js` | Hero section particle / gradient animation |
| `compiled/` | Generated production JS bundles for pages that precompile inline JSX |
| `shared.jsx` | Shared JSX component definitions |
| `shared_components.jsx` | Additional shared JSX components |
| `favicon.ico` / `favicon.svg` | Site favicons |
| `site.webmanifest` | PWA web app manifest |
| `robots.txt` | Crawler rules |
| `sitemap.xml` | SEO sitemap |
| `_headers` | Cloudflare / CDN HTTP response headers |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

## Image Directories

| Path | Purpose |
|---|---|
| `images/` | Shared site-wide images |
| `images-bricks-calc/` | Bricks Calc screenshots and marketing images |
| `images-bricks-scan/` | Bricks Scan screenshots and marketing images |
| `images-bricks-leads/` | Bricks Leads screenshots and marketing images |
| `userjot-images/` | UserJot widget / feedback images |
| `sf-pro-display/` | SF Pro Display font files |
| `assets/` | Multi-locale app screenshots (dark/light, EN/ES) for all three apps |

## Universal Links & App Association

| Path | Purpose |
|---|---|
| `.well-known/` | AASA and assetlinks files for iOS/Android universal links |
| `apple-app-site-association` | iOS universal link association (no extension) |
| `apple-app-site-association.json` | iOS universal link association (JSON) |

## Tooling & Scripts

| File | Purpose |
|---|---|
| `package.json` | Local build commands for JSX precompilation |
| `scripts/precompile-jsx.mjs` | Extracts inline `text/babel` scripts from supported pages and compiles them with esbuild |
| `generate_scan.py` | Python script — generates Bricks Scan page content |
| `replace_styles.py` | Python script — bulk style replacement utility |
| `formatFileSize.test.js` | Unit tests for `formatFileSize` helper |

## Docs (`docs/`)

| File | Purpose |
|---|---|
| `repo-map.md` | This file — fast map of the repository |
| `README.md` | Project overview |
| `CODEX.md` | AI agent rules and conventions for this repo |
| `DESIGN.md` | Visual design system — tokens, typography, color palette |
| `CONTRIBUTING.md` | Contribution guidelines |
| `brand-voice-guide.md` | Bricks brand voice, tone, and writing style guide |
| `social-media-playbook.md` | Platform-specific social media posting rules and templates |
| `seo-validation-checklist.md` | Post-change checklist for Search Console, Rich Results Test, and Lighthouse |
| `local-setup.md` | Local development environment setup instructions |
| `content-agent-base.md` | Base specification shared by all per-app content agents |
| `bricks-calc-content-agent-spec.md` | Content agent spec — Bricks Calc |
| `bricks-scan-content-agent-spec.md` | Content agent spec — Bricks Scan (stub) |
| `bricks-leads-content-agent-spec.md` | Content agent spec — Bricks Leads (stub) |
| `bricks-calc-asc-en.md` | App Store Connect metadata — Bricks Calc (English) |
| `bricks-calc-asc-es.md` | App Store Connect metadata — Bricks Calc (Spanish) |
| `bricks-scan-asc-en.md` | App Store Connect metadata — Bricks Scan (English) |

## CI / GitHub

| Path | Purpose |
|---|---|
| `.github/` | GitHub Actions workflows and PR templates |
| `.claude/` | Claude AI project instructions |
| `.gitignore` | Git ignore rules |

---

For the canonical engineering explanation, use:
[`docs/_canonical/apps/bricks-website/engineering/dev-guide.md`](./_canonical/apps/bricks-website/engineering/dev-guide.md)
