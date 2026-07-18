# App Preview Editor guides

`guide-registry.mjs` is the source of truth for the Guides hub. Each published record generates its crawlable catalog row, search metadata, structured data, and sitemap entry.

To add or update a guide:

1. Add the article at `<slug>/index.html`.
2. Add or update its record in `guide-registry.mjs`.
3. Run `node app-preview-editor/guides/build-guides.mjs --write` from the repository root.
4. Run `node --test app-preview-editor/guides/guides.test.mjs`.

Use one primary topic and any applicable filter tags. Keep exactly one published guide featured as the `Start here` guide. Update `reviewedDate` only after checking claims that depend on Apple guidance.
