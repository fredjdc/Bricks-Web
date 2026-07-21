import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL("./", import.meta.url);
const page = readFileSync(new URL("index.html", root), "utf8");
const guides = [...page.matchAll(/href="(guides\/[^"]+\/index\.html)"/g)].map((match) => match[1]);

function structuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

assert.equal(new Set(guides).size, 7);
assert.match(page, /<link rel="canonical" href="https:\/\/bricks\.pe\/calc\/">/);
assert.doesNotMatch(page, /[—–]/);
assert.equal(structuredData(page).length, 1);

for (const path of guides) {
  const html = readFileSync(new URL(path, root), "utf8");
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/bricks\.pe\/calc\/guides\//);
  assert.doesNotMatch(html, /[—–]/);
  assert.equal(structuredData(html).length, 1);
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /class="nav shell" aria-label="Primary navigation"/);
  assert.match(html, /class="breadcrumbs" aria-label="Breadcrumb"/);
  assert.match(html, /class="guide-toc" aria-label="On this page"/);
}

for (let index = 1; index <= 8; index += 1) {
  readFileSync(resolve(new URL("assets/app-store/", root).pathname, `iphone-${index}.jpg`));
}

readFileSync(new URL("assets/app-store/app-icon.png", root));
readFileSync(new URL("assets/og-bricks-calc.png", root));

console.log("Bricks Calc landing page and 7 guides validated.");
