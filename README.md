# Bricks Web

Bricks Web builds static HTML for GitHub Pages. The build renders the shared header and footer on every content route. Pages use native HTML controls and load plain JavaScript for enhancements such as theme preferences and media.

## Preview and check

Open `index.html` or any site's HTML file at its normal path in the repository. The pages link to each other on disk and use local styles, images, and controls. External destinations such as the App Store, YouTube, and hosted forms still require an internet connection.

Use Node.js 22 to match the Pages workflow and Python 3 for the local preview server.

```sh
npm ci
npm run preview
```

Use [the HTTP preview](http://127.0.0.1:8080/) to test the hosted site and its integrations. Run `npm run build` after editing the site to refresh both the direct-open files and `dist/`, then run `npm test`. Include the regenerated HTML with your source changes. CI verifies that the direct-open files are current and publishes `dist/`.

## Edit a page

- Edit route shells under `content/pages/`. Pages with a content slot keep their bodies in `content/`, for example `content/index.html` for the homepage. A bilingual page has a matching `.es.html` body and a direct language link. The HTML at the public routes is generated.
- Add routes and their product links, locale, and primary action to the appropriate route data in `scripts/layout.mjs` or its imports. Shared labels and markup live in the layout. Keep the canonical URL and sitemap consistent when adding or moving an indexable page.
- Edit `assets/site/layout.css` for the shared navigation, footer, typography, and elevation. Keep product imagery and feature styles with their pages. Load integrations on the routes that use them.
- When retiring a public path, update the redirect map in `scripts/layout.mjs`. Preserve campaign parameters, fragments, and both copies of the Apple App Site Association file.
