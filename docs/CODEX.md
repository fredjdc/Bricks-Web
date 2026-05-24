# Bricks Page — Codex Context

Bricks Page is the static public web surface for Bricks Apps. Its primary domain is `bricks.pe`, with related `leads.bricks.pe` routes used by some Bricks Leads landing and thank-you flows. It contains product pages for Bricks Scan, Bricks Calc, and Bricks Leads, plus legal, support, help, and supporting marketing pages. The site remains static HTML, CSS, and JavaScript, with an optional esbuild-based JSX precompile step for pages that still contain inline React + `text/babel`.

---

## Read These First

Before editing any web content, read these:

1. [`docs/_canonical/apps/bricks-website/product/overview.md`](./_canonical/apps/bricks-website/product/overview.md) — what the site covers
2. [`docs/_canonical/shared/brand/brand-foundation.md`](./_canonical/shared/brand/brand-foundation.md) — brand voice and personality
3. [`docs/_canonical/shared/brand/brand-system.md`](./_canonical/shared/brand/brand-system.md) — visual system, colors, typography
4. [`docs/_canonical/apps/bricks-website/engineering/dev-guide.md`](./_canonical/apps/bricks-website/engineering/dev-guide.md) — site structure, routing, and deployment
5. [`README.md`](README.md) — local setup and site map

---

## Key Conventions

- **Follow the Bricks brand voice exactly** — clear, calm, practical, trustworthy. No hype, no hollow enthusiasm, no ornamental phrasing. State what it does -> why it matters -> stop.
- **Follow the brand visual system** — monochromatic base, product accent colors, Soft-Emboss surface language. Do not introduce new color values without checking `brand-system.md`.
- **Keep the toolchain minimal** — the site is intentionally simple. Do not introduce new frameworks or replace the current static architecture. The only approved build step is the repo's minimal JSX precompile workflow for removing browser Babel from production pages.
- **Update `sitemap.xml` when adding pages** — keep the sitemap accurate for SEO.
- **Never modify `apple-app-site-association` without coordination** — this file controls universal links for all Bricks apps on iOS and macOS.
- **Treat `purrfect-yarn.html` as a non-core exception** — it is not part of the canonical Bricks website surface and should not be used as a pattern source for core pages.

---

## Do Not

- Do not use hardcoded hex colors — reference CSS custom properties or the values defined in `brand-system.md`.
- Do not introduce JavaScript frameworks (React, Vue, etc.) — the site uses vanilla JS.
- Do not add copy that contradicts product positioning — check the vendored canonical docs under `docs/_canonical/apps/` before writing product descriptions.

---

## Documentation Requirement

Documentation is part of the deliverable. The task is not complete until code and relevant documentation are aligned.

When implementation changes behavior, structure, workflow, or limits:

- Identify the affected canonical docs in `docs/_canonical/`.
- Update those canonical docs in the same pass.
- Update local `docs/` files only when repo-specific workflow changed.
- Add new canonical docs only if they fit the approved structure, then update `docs-manifest.yaml` and `documentation-backlog.md` in the same pass.
- Never leave new behavior undocumented.
- Never move a doc to `active`. At most, move it to `needs-review`.
- If no docs need changes, state why explicitly.

Update docs when changes affect any of:

- user-facing behavior or feature scope
- architecture, state ownership, or persistence
- setup, testing, or release workflow
- support guidance, limits, or pricing-related behavior
- AI routing or agent instructions

---

## Product & Brand Context

For brand voice: [`docs/_canonical/shared/brand/brand-foundation.md`](./_canonical/shared/brand/brand-foundation.md)

For product positioning: use the vendored canonical app docs under `docs/_canonical/apps/`.
