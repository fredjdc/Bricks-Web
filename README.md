# Bricks Web

Bricks Web generates static HTML for GitHub Pages. The repository root contains the homepage, shared company and support pages, and site-wide build and hosting files.

| App | Folder |
| --- | --- |
| AppCut | `appcut/` |
| ASC GUI | `asc-gui/` |
| Bricks Calc | `calc/` |
| Bricks Leads | `leads/` |
| Bricks Living | `living/` |
| Bricks Scan | `scan/` |

## Find and edit a page

- Edit the shell in the app’s `pages/` folder. If it has a `site:content` slot, edit the body in that app’s `content/` folder. App-specific assets and documentation also stay with the app.
- For the homepage and shared pages, edit `content/pages/` and `content/`. The common styles and interactions are in `assets/site/`.
- HTML outside these source folders is generated. Open root `index.html` or a generated page inside an app’s folder for an offline preview. Use the HTTP preview to test hosted integrations.
- Existing public URLs do not need to match where files live in this checkout. For example, `calc/homebuyers.html` opens locally while `/homebuyers.html` is still the hosted URL. Public redirects and asset paths are preserved by the build. Route metadata is in `scripts/layout.mjs` and its imports, and the path mapping is in `scripts/product-paths.mjs`.

## Preview and check

Use Node.js 22 to match CI and Python 3 for the local preview server.

```sh
npm ci
npm run build
npm test
npm run preview
```

The preview runs at [127.0.0.1:8080](http://127.0.0.1:8080/). After an edit, include the updated generated HTML. CI checks it with `npm run build -- --check-local-pages` before publishing `dist/`.
