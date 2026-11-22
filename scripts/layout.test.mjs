import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { localePath } from "./content.mjs";
import { renderPage, sitePages } from "./layout.mjs";

const slots = ["<!-- site:head -->", "<!-- site:header -->", "<!-- site:footer -->"];

test("a page must provide exactly one slot for each shared layout element", () => {
  const route = "appcut/index.html";
  const source = slots.join("\n");
  for (const marker of slots) {
    const expected = { message: `Expected one ${marker} in ${route}` };
    assert.throws(() => renderPage(route, source.replace(marker, "")), expected);
    assert.throws(() => renderPage(route, source + marker), expected);
  }
});

test("the footer directory and appearance controls are shared by every page", () => {
  const source = slots.join("\n");
  const directory = html => html.match(/<nav class="bricks-footer-columns"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  const linkGroups = html => [...directory(html).matchAll(/<section class="bricks-footer-group">([\s\S]*?)<\/section>/g)]
    .map(([, section]) => [...section.matchAll(/href="([^"]+)"/g)].map(([, href]) => href));
  const calcLabel = footer => footer.match(/<a href="\/calc\/">(?:<span[^>]*>)?([^<]+)/)?.[1];
  const homepage = renderPage("index.html", source);
  const expected = linkGroups(homepage);

  assert.deepEqual([...directory(homepage).matchAll(/<h2>([^<]+)<\/h2>/g)].map(([, label]) => label),
    ["Bricks Calc", "Apps", "Dev Tools", "Bricks Apps"]);
  assert.deepEqual(expected[0], ["/calc/", "/homebuyers.html", "/refinance.html", "/calc/guides/"]);
  assert.deepEqual(expected[2], ["/appcut/", "/asc-gui/", "/appcut/guides/"]);
  assert.ok(expected[3].includes("/about.html") && expected[3].includes("/support.html"));
  for (const route of sitePages.keys()) {
    const page = renderPage(route, source, { language: "en" });
    assert.deepEqual(linkGroups(page), expected, route);
    assert.equal(calcLabel(directory(page)), "Mortgage Calculator", route);
    assert.equal([...page.matchAll(/data-theme-choice=/g)].length, 3, route);
    assert.equal([...page.matchAll(/src="\/assets\/site\/preferences\.js"/g)].length, 1, route);
  }
  const spanish = directory(renderPage("calc/index.html", source, { language: "es" }));
  assert.match(spanish, /<a href="\/calc\/index\.es\.html">Calculadora hipotecaria<\/a>/);
  assert.match(spanish, /<li id="guides"><a href="\/calc\/guides\/">Guías hipotecarias<\/a>/);
  assert.match(spanish, /href="\/support\.es\.html"/);
});

test("product pages render shared feature stories, cards, and stylesheet", async () => {
  const root = new URL("../", import.meta.url);
  const stylesheet = new URL("assets/site/features.css", root).href;
  for (const [route, page] of sitePages) {
    const isProduct = page.scripts?.includes("calc") || ["scan", "leads", "living"].includes(page.entry) ||
      ["appcut/index.html", "appcut/getvideoeditor.html", "asc-gui/index.html"].includes(route);
    if (!isProduct) continue;

    for (const path of page.bilingual ? [route, localePath(route, "es")] : [route]) {
      const pageURL = new URL(path, root);
      const html = await readFile(pageURL, "utf8");
      const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)]
        .map(([, href]) => new URL(href, pageURL).href);
      assert.equal(sheets.filter(href => href === stylesheet).length, 1, path);
      assert.match(html, /class="[^"]*\bproduct-story\b/, path);
      assert.match(html, /class="[^"]*\bbricks-feature-card\b/, path);
      assert.doesNotMatch(html, /\b(?:calc-feature-grid|product-feature-grid)\b/, path);
    }
  }
});

test("product FAQs share the same stylesheet and render as native grouped disclosures", async () => {
  const root = new URL("../", import.meta.url);
  const stylesheet = new URL("assets/site/faq.css", root);
  for (const [route, page] of sitePages) {
    const startsOpen = page.scripts?.includes("calc") || ["scan", "leads"].includes(page.entry);
    const startsClosed = ["appcut/index.html", "appcut/getvideoeditor.html", "asc-gui/index.html"].includes(route);
    if (!startsOpen && !startsClosed) continue;

    for (const path of page.bilingual ? [route, localePath(route, "es")] : [route]) {
      const pageURL = new URL(path, root);
      const html = await readFile(pageURL, "utf8");
      const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)]
        .map(([, href]) => new URL(href, pageURL).href);
      assert.equal(sheets.filter(href => href === stylesheet.href).length, 1, path);

      const sections = [...html.matchAll(/<section class="bricks-faq" id="faq" aria-labelledby="faq-title">([\s\S]*?)<\/section>/g)];
      assert.equal(sections.length, 1, path);
      const [, section] = sections[0];
      assert.match(section, /<h2 id="faq-title">[^<]+<\/h2>/, path);
      assert.match(section, /<div class="bricks-faq-list\b/, path);
      const rows = [...section.matchAll(/<details name="([^"]+)"( open="")?>([\s\S]*?)<\/details>/g)];
      assert.ok(rows.length > 1, path);
      assert.equal(rows.length, [...section.matchAll(/<details\b/g)].length, path);
      assert.equal(new Set(rows.map(([, name]) => name)).size, 1, path);
      assert.deepEqual(rows.flatMap(([, , open], index) => open ? [index] : []), startsOpen ? [0] : [], path);
      for (const [, , , row] of rows) {
        assert.match(row, /^\s*<summary\b[^>]*>[^<]+<\/summary>/, path);
        assert.match(row, /<div class="bricks-faq-answer"[^>]*>\s*<div>\s*<p>/, path);
      }
    }
  }
});
