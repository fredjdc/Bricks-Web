import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [calc, ape, css, apeCss] = await Promise.all([
  read("index.html"), read("app-preview-editor/index.html"),
  read("shared-download-cta.css"), read("app-preview-editor/styles.css"),
]);

test("both pages use one shared CTA presentation without importing the root stylesheet into APE", () => {
  assert.match(calc, /href="shared-download-cta\.css\?v=/);
  assert.match(ape, /href="\.\.\/shared-download-cta\.css\?v=/);
  assert.doesNotMatch(ape, /href="\.\.\/styles\.css/);
  assert.match(calc, /className="reveal calc-download-cta-content bricks-download-cta"/);
  const component = calc.slice(calc.indexOf("window.DownloadCTA ="), calc.indexOf("window.Footer ="));
  assert.doesNotMatch(component, /radial-gradient|boxShadow|borderRadius|fontSize/);
  assert.match(component, /<AppleDownloadButton[^>]*sharedCta/);
  assert.doesNotMatch(apeCss, /final-panel/);
  assert.match(css, /#root \.bricks-download-cta > h2/);
  assert.match(css, /\.bricks-download-cta \.bricks-cta-button \{\s*display: inline-flex/);
});

test("APE closing CTA preserves its copy, link, shell and accessible Apple icon without extra caption", async () => {
  const closing = ape.match(/<section class="final-cta section shell"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(closing);
  assert.match(closing, /class="bricks-download-cta reveal"/);
  assert.match(closing, /<h2 id="final-title">Give people a closer look\.<\/h2>/);
  assert.match(closing, /<p>Turn the screens and features you’ve built into videos for your app’s next appearance on the App Store\.<\/p>/);
  assert.equal((closing.match(/<p\b/g) ?? []).length, 1);
  assert.match(closing, /<img src="AppIcon\.png" width="64" height="64" alt="">/);
  assert.doesNotMatch(closing, /trial|availability|bricks-cta-note/i);
  assert.match(closing, /href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605" aria-label="Download for Mac"/);
  assert.match(closing, /srcset="\.\.\/images\/apple-icon-white\.svg" media="\(prefers-color-scheme: dark\)"/);
  assert.match(closing, /src="\.\.\/images\/apple-icon-black\.svg" width="18" height="18" alt=""/);
  assert.match(css, /:focus-visible \{ outline: 3px solid var\(--cta-text\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  for (const asset of ["images/apple-icon-white.svg", "images/apple-icon-black.svg"]) assert.ok((await read(asset)).includes("<svg"));
});
