import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { localePath } from "./scripts/content.mjs";
import { renderPage, sitePages } from "./scripts/layout.mjs";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [home, homeContent, appCut, css, appCutCss] = await Promise.all([
  read("content/pages/index.html"), read("content/index.html"), read("content/pages/appcut/index.html"),
  read("shared-download-cta.css"), read("appcut/styles.css"),
]);

test("the homepage and AppCut use the shared download call to action styles", () => {
  assert.match(home, /href="shared-download-cta\.css\?v=/);
  assert.match(appCut, /href="\.\.\/shared-download-cta\.css\?v=/);
  assert.doesNotMatch(appCut, /href="\.\.\/styles\.css/);
  const component = homeContent.match(/<section\b[^>]*\bid="pricing"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(component);
  assert.match(component, /class="reveal calc-download-cta-content bricks-download-cta"/);
  assert.doesNotMatch(component, /radial-gradient|box-shadow|border-radius|font-size/);
  assert.match(component, /class="calc-download-button bricks-cta-button"/);
  assert.match(component, /ct=bricks_web_calc_pricing&amp;mt=8/);
  assert.doesNotMatch(appCutCss, /final-panel/);
  assert.match(css, /\.bricks-download-cta > h2/);
  assert.match(css, /\.bricks-download-cta \.bricks-cta-button \{\s*display: inline-flex/);
});

test("AppCut closing CTA has a heading, one description, and an accessible download link", async () => {
  const closing = renderPage("appcut/index.html", appCut).match(/<section class="final-cta section shell"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(closing);
  assert.match(closing, /class="bricks-download-cta reveal"/);
  assert.match(closing, /aria-labelledby="final-title"/);
  assert.match(closing, /<h2 id="final-title">[^<]+<\/h2>/);
  assert.match(closing, /<p>[^<]+<\/p>/);
  assert.equal((closing.match(/<p\b/g) ?? []).length, 1);
  assert.match(closing, /<img class="bricks-cta-icon" src="\/appcut\/AppIcon\.png" width="144" height="144" alt="">\s*<h2/);
  assert.doesNotMatch(closing, /trial|availability|bricks-cta-note/i);
  assert.match(closing, /href="https:\/\/testflight\.apple\.com\/join\/UgyQd6ES" aria-label="Download for Mac"/);
  assert.match(closing, /src="\.\.\/images\/apple-icon-black\.svg" width="18" height="18" alt=""/);
  assert.match(css, /:focus-visible \{ outline: 3px solid var\(--cta-text\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  for (const asset of ["images/apple-icon-white.svg", "images/apple-icon-black.svg"]) assert.ok((await read(asset)).includes("<svg"));
});

test("product download panels show the route's app icon above each heading", async () => {
  for (const [route, page] of sitePages) {
    const isCalcLanding = page.scripts?.includes("calc");
    const isScanLanding = page.entry === "scan";
    const isAppCutLanding = ["appcut/index.html", "appcut/getvideoeditor.html"].includes(route);
    if (!isCalcLanding && !isScanLanding && !isAppCutLanding) continue;

    for (const path of page.bilingual ? [route, localePath(route, "es")] : [route]) {
      const html = await read(path);
      const icons = [...html.matchAll(/<img class="bricks-cta-icon" src="([^"]+)" width="144" height="144" alt="">\s*<h2/g)];
      assert.equal(icons.length, isCalcLanding ? 2 : 1, path);
      const pageURL = new URL(path, import.meta.url);
      const brandIcon = new URL(`.${page.brand.icon}`, import.meta.url).href;
      for (const [, src] of icons) assert.equal(new URL(src, pageURL).href, brandIcon, path);
    }
  }
});
