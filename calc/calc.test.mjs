import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { renderPage, sitePages } from "../scripts/layout.mjs";

const root = new URL("./", import.meta.url);
const shells = new URL("../content/pages/", root);
const page = readFileSync(new URL("calc/index.html", shells), "utf8");
const pageContent = readFileSync(new URL("../content/calc-index.html", root), "utf8");
const dist = new URL("../dist/", root);
const sitemap = readFileSync(new URL("../sitemap.xml", root), "utf8");

function catalogGuides(html) {
  const list = html.match(/<ul class="guide-grid">[\s\S]*?<\/ul>/)?.[0];
  assert.ok(list, "The Mortgage Guides page must list the published articles");
  return [...list.matchAll(/href="([^"/]+\/index\.html)"/g)].map((match) => match[1]);
}

function structuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

const guides = catalogGuides(readFileSync(new URL("calc/guides/index.html", shells), "utf8"));
assert.equal(guides.length, 7);
assert.equal(new Set(guides).size, 7);
const canonical = /<link rel="canonical" href="https:\/\/bricks\.pe\/calc\/"\s*\/?>/;
assert.match(page, canonical);
assert.match(readFileSync(new URL("calc.html", shells), "utf8"), canonical);
assert.ok(sitemap.includes("<loc>https://bricks.pe/calc/</loc>"));
assert.ok(sitemap.includes("<loc>https://bricks.pe/calc/guides/</loc>"));
assert.equal(structuredData(page).length, 1);

test("Calc overview routes share an English body and keep their Spanish update links", () => {
  assert.equal(sitePages.get("calc.html").entry, sitePages.get("calc/index.html").entry);
  const legacySpanish = readFileSync(new URL("../calc.es.html", root), "utf8");
  const overviewSpanish = readFileSync(new URL("index.es.html", root), "utf8");
  assert.match(legacySpanish, /<a href="index\.html#whats-new"[^>]*>Descubre las novedades/);
  assert.match(overviewSpanish, /<a href="https:\/\/bricksapps\.userjot\.com\/updates"[^>]*>Descubre las novedades/);
});

test("hosted and direct-open Calc link to the standalone Mortgage Guides page from the footer", {
  skip: existsSync(dist) ? false : "Run npm run build to verify the published HTML",
}, () => {
  const html = readFileSync(new URL("calc/index.html", dist), "utf8");
  assert.match(html, canonical);
  assert.match(html, /href="\/assets\/site\/layout\.css\?v=[a-f0-9]{12}"/);
  assert.match(html, /<main id="main" tabindex="-1">/);
  assert.doesNotMatch(html, /class="calc-guides"|href="#guides"/);
  assert.match(html, /<li id="guides"><a href="\/calc\/guides\/">Mortgage Guides<\/a>/);
  assert.doesNotMatch(html, /<!-- site:content -->|type="text\/babel"/);
  assert.equal(structuredData(html).length, 1);

  const directPage = new URL("index.html", root);
  const directHTML = readFileSync(directPage, "utf8");
  const directLayout = directHTML.match(/href="(\.\.\/assets\/site\/layout\.css)"/)?.[1];
  assert.ok(directLayout, "Direct-open Calc must link to the shared stylesheet by relative path");
  assert.ok(existsSync(new URL(directLayout, directPage)));
  assert.doesNotMatch(directHTML, /class="calc-guides"|href="#guides"/);
  assert.match(directHTML, /<li id="guides"><a href="guides\/index\.html">Mortgage Guides<\/a>/);

  const hostedCatalog = readFileSync(new URL("calc/guides/index.html", dist), "utf8");
  assert.match(hostedCatalog, /<link rel="canonical" href="https:\/\/bricks\.pe\/calc\/guides\/">/);
  assert.deepEqual(catalogGuides(hostedCatalog), guides);
  const directCatalog = new URL("guides/index.html", root);
  assert.deepEqual(catalogGuides(readFileSync(directCatalog, "utf8")), guides);
  for (const guide of guides) assert.ok(existsSync(new URL(guide, directCatalog)));
});

test("Calc renders native FAQ answers and inline previews in HTML", () => {
  const faq = pageContent.match(/<section\b[^>]*\bid="faq"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(faq);
  assert.equal([...faq.matchAll(/<details name="calc-faq"(?: open="")?>/g)].length, 6);
  assert.equal([...faq.matchAll(/<details name="calc-faq" open="">/g)].length, 1);
  assert.equal([...faq.matchAll(/<summary\b/g)].length, 6);
  assert.match(faq, /save up to three plans/i);

  for (const [path, locale] of [["calc-index.html", "en"], ["calc-index.es.html", "es"]]) {
    const content = readFileSync(new URL(`../content/${path}`, root), "utf8");
    const media = content.match(/<video\b[^>]*>/)?.[0];
    assert.ok(media);
    assert.match(media, /\bautoplay\b/);
    assert.doesNotMatch(media, /\bcontrols\b/);
    assert.ok(media.includes(`/images-bricks-calc/hero-video-img-${locale}.png`));
    assert.ok(content.includes(`/images-bricks-calc/hero-video-${locale}.mp4`));
    assert.match(content, /ct=bricks_web_calc_hero&amp;mt=8/);
  }
});

for (const path of guides) {
  const route = `calc/guides/${path}`;
  const source = readFileSync(new URL(route, shells), "utf8");
  const html = renderPage(route, source);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/bricks\.pe\/calc\/guides\//);
  assert.doesNotMatch(html, /[—–]/);
  const schema = structuredData(html);
  assert.equal(schema.length, 1);
  const breadcrumbs = schema[0]["@graph"].find(item => item["@type"] === "BreadcrumbList");
  assert.deepEqual(breadcrumbs.itemListElement.map(item => item.position), [1, 2]);
  assert.match(html, /class="bricks-skip-link" href="#main"/);
  assert.match(html, /<main id="main" tabindex="-1">/);
  assert.match(html, /class="bricks-nav" aria-label="Primary navigation"/);
  assert.match(html, /class="breadcrumbs" aria-label="Breadcrumb"/);
  assert.match(html, /class="guide-toc" aria-label="On this page"/);
  assert.doesNotMatch(html, /#guides/);
  assert.match(html, /href="\/calc\/guides\/"[^>]*>Mortgage Guides/);
  assert.ok(sitemap.includes(`<loc>https://bricks.pe/${route.replace(/index\.html$/, "")}</loc>`));
}

for (const path of ["affordability", "main", "mortgage", "refinance", "store"]) {
  const source = readFileSync(new URL(`app/${path}/index.html`, shells), "utf8");
  const html = renderPage(`app/${path}/index.html`, source);
  assert.ok(html.includes(`app-argument=https://www.bricks.pe/app/${path}`));
  assert.ok(html.includes(`ct=universal_link_${path}&amp;mt=8`));
  assert.match(html, /<main id="main" tabindex="-1">/);
  assert.match(html, /<nav class="bricks-nav"/);
}

for (let index = 1; index <= 8; index += 1) {
  readFileSync(resolve(new URL("assets/app-store/", root).pathname, `iphone-${index}.jpg`));
}

readFileSync(new URL("assets/app-store/app-icon.png", root));
readFileSync(new URL("assets/og-bricks-calc.png", root));

console.log("Bricks Calc landing page and 7 guides validated.");
