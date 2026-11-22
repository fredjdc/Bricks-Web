# AppCut guides

`guide-registry.mjs` is the source of truth for the Guides hub. Each published record generates its crawlable catalog row, search metadata, structured data, and sitemap entry.

To add or update a guide:

1. Add the article at `content/pages/appcut/guides/<slug>/index.html`. Resolve media links from the published article path under `appcut/guides/`.
2. Add or update its record in `appcut/guides/guide-registry.mjs`. Register new article routes in `scripts/static-layouts.mjs`.
3. Run `node appcut/guides/build-guides.mjs --write` from the repository root.
4. Run `node --test appcut/guides/guides.test.mjs`.

Use one primary topic and any applicable filter tags. Keep exactly one published guide featured as the `Start here` guide. Update `reviewedDate` only after checking claims that depend on Apple guidance.

Run `npm run build` from the repository root and open `appcut/guides/index.html` to review the generated pages. Run `npm run preview` to serve them over HTTP.
