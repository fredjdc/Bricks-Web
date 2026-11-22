import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  const closing = appCut.match(/<section class="final-cta section shell"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(closing);
  assert.match(closing, /class="bricks-download-cta reveal"/);
  assert.match(closing, /aria-labelledby="final-title"/);
  assert.match(closing, /<h2 id="final-title">[^<]+<\/h2>/);
  assert.match(closing, /<p>[^<]+<\/p>/);
  assert.equal((closing.match(/<p\b/g) ?? []).length, 1);
  assert.match(closing, /<img src="AppIcon\.png" width="144" height="144" alt="">/);
  assert.doesNotMatch(closing, /trial|availability|bricks-cta-note/i);
  assert.match(closing, /href="https:\/\/testflight\.apple\.com\/join\/UgyQd6ES" aria-label="Download for Mac"/);
  assert.match(closing, /src="\.\.\/images\/apple-icon-black\.svg" width="18" height="18" alt=""/);
  assert.match(css, /:focus-visible \{ outline: 3px solid var\(--cta-text\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  for (const asset of ["images/apple-icon-white.svg", "images/apple-icon-black.svg"]) assert.ok((await read(asset)).includes("<svg"));
});
