# Bricks Website Local Setup

Repo-specific setup for working in this codebase.

## Project Type

Static HTML, CSS, and JavaScript.

The site currently runs directly from source HTML, but pages that use `type="text/babel"` now have an optional precompile path so browser Babel can be removed from production.

## Key Local Notes

- Verify changes in a browser after edits
- Update `sitemap.xml` when adding pages
- Be careful with `apple-app-site-association` and related files

## JSX Precompile Workflow

The React pages still work without a build step, but the repo now includes a precompile setup for removing browser Babel from production.

Requirements:

- Node.js 20+
- npm

Commands:

- `npm install`
- `npm run build:jsx`
  Generates compiled bundles in `compiled/` from each page's inline `text/babel` blocks.
- `npm run check:jsx`
  Fails if a compiled bundle is missing or older than its source HTML.
- `npm run apply:jsx`
  Rewrites supported HTML pages to remove the Babel runtime and load their compiled bundle from `compiled/`.

Recommended rollout:

1. Run `npm install`
2. Run `npm run build:jsx`
3. Review the generated files in `compiled/`
4. Run `npm run apply:jsx`
5. Re-test every React page in the browser

Note:

- This repo snapshot was prepared in an environment without `node` or `npm`, so the build script was added but not executed here.

For full development guidance, use:
[`docs/_canonical/apps/bricks-website/engineering/dev-guide.md`](./_canonical/apps/bricks-website/engineering/dev-guide.md)
