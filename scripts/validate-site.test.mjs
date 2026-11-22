import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { validateSite } from "./validate-site.mjs";

test("publish validation follows nested routes, fragments, styles and lazy asset URLs", async () => {
  const directory = await mkdtemp(join(tmpdir(), "bricks-site-test-"));
  const association = JSON.stringify({ applinks: { details: [{ components: [{ "/": "/app/main" }] }] } });
  const files = {
    "index.html": '<a href="/guides?source=home#start">Read the guide</a>',
    "guides/index.html": '<main id="start"><img data-src="../images/cover.png?v=1" srcset="../images/cover.png 1x, ../images/cover@2x.png 2x"></main>',
    "app/main/index.html": '<a href="/">Home</a>',
    "assets/site.css": '.cover { background-image: url("../images/cover.png") }',
    "images/cover.png": "",
    "images/cover@2x.png": "",
    "sitemap.xml": "<urlset><url><loc>https://bricks.pe/guides/</loc></url></urlset>",
    "site.webmanifest": '{"start_url":"/","icons":[{"src":"/images/cover.png"}]}',
    ".well-known/apple-app-site-association": association,
    "apple-app-site-association": association
  };

  try {
    for (const [path, content] of Object.entries(files)) {
      const destination = join(directory, path);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, content);
    }
    await validateSite(directory);

    await unlink(join(directory, "images/cover@2x.png"));
    await writeFile(join(directory, "guides/index.html"), files["guides/index.html"].replace('id="start"', 'id="other"'));

    await assert.rejects(validateSite(directory), {
      message: /guides\/index\.html: missing target \.\.\/images\/cover@2x\.png\nindex\.html: missing anchor \/guides\?source=home#start/
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
