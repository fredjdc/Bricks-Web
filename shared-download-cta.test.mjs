import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { localePath } from "./scripts/content.mjs";
import { renderPage, sitePages } from "./scripts/layout.mjs";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [homeContent, appCut, css, appCutCss] = await Promise.all([
  read("content/index.html"), read("content/pages/appcut/index.html"),
  read("shared-download-cta.css"), read("appcut/styles.css"),
]);

test("the homepage and AppCut use the shared download call to action styles", () => {
  assert.doesNotMatch(appCut, /href="\.\.\/styles\.css/);
  const component = homeContent.match(/<section\b[^>]*\bid="pricing"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(component);
  assert.match(component, /class="bricks-download-cta reveal"/);
  assert.doesNotMatch(component, /radial-gradient|box-shadow|border-radius|font-size/);
  assert.match(component, /class="bricks-cta-button"/);
  assert.match(component, /ct=bricks_web_calc_pricing&amp;mt=8/);
  assert.doesNotMatch(appCutCss, /final-panel/);
  assert.match(css, /\.bricks-download-cta > h2/);
  assert.match(css, /\.bricks-download-cta \.bricks-cta-button \{\s*display: inline-flex/);
});

test("AppCut closing CTA has a heading, one description, and an accessible download link", async () => {
  const closing = renderPage("appcut/index.html", appCut).match(/<section class="bricks-cta-section"[^>]*>[\s\S]*?<\/section>/)?.[0];
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

test("each product landing page uses the shared CTA layout and its own icon", async () => {
  for (const [route, page] of sitePages) {
    const isCalcLanding = page.scripts?.includes("calc");
    const isProductLanding = ["scan", "leads", "living"].includes(page.entry) ||
      ["appcut/index.html", "appcut/getvideoeditor.html", "asc-gui/index.html"].includes(route);
    if (!isCalcLanding && !isProductLanding) continue;

    for (const path of page.bilingual ? [route, localePath(route, "es")] : [route]) {
      const html = await read(path);
      const sections = [...html.matchAll(/<section\b[^>]*class="bricks-cta-section"[^>]*>([\s\S]*?)<\/section>/g)];
      assert.equal(sections.length, isCalcLanding ? 2 : 1, path);
      const pageURL = new URL(path, import.meta.url);
      const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]*shared-download-cta\.css)"/g)];
      assert.equal(styles.length, 1, path);
      assert.equal(new URL(styles[0][1], pageURL).href, new URL("shared-download-cta.css", import.meta.url).href, path);
      const brandIcon = new URL(`.${page.brand.ctaIcon ?? page.brand.icon}`, import.meta.url).href;
      for (const [, section] of sections) {
        const icon = section.match(/<div class="bricks-download-cta(?: reveal)?">\s*<img class="bricks-cta-icon" src="([^"]+)" width="144" height="144" alt="">\s*(?:<p class="bricks-cta-eyebrow">[^<]+<\/p>\s*)?<h2/);
        assert.ok(icon, path);
        assert.equal(new URL(icon[1], pageURL).href, brandIcon, path);
        assert.match(section, /<div class="bricks-cta-actions">\s*<a\b[^>]*class="bricks-cta-button(?: download-button)?"/, path);
      }
    }
  }
});
