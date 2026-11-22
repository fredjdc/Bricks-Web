import assert from "node:assert/strict";
import test from "node:test";

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
    assert.equal([...page.matchAll(/data-theme-choice=/g)].length, 3, route);
    assert.equal([...page.matchAll(/src="\/assets\/site\/preferences\.js"/g)].length, 1, route);
  }
  const spanish = directory(renderPage("calc/index.html", source, { language: "es" }));
  assert.match(spanish, /<li id="guides"><a href="\/calc\/guides\/">Guías hipotecarias<\/a>/);
  assert.match(spanish, /href="\/support\.es\.html"/);
});
