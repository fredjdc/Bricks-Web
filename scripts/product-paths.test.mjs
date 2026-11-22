import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { sitePages, siteRedirects } from "./layout.mjs";
import { assetSourcePath, localPagePath, pageSourcePath } from "./product-paths.mjs";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("only shared page HTML sits at the root, and every app has its own sources", async () => {
  const sharedPages = new Set(["about", "help", "index", "privacy", "purchase-guide-01", "support", "survey", "terms", "thank-you", "thank-you-feedback"]);
  for (const file of await readdir(root)) {
    if (file.endsWith(".html")) assert.ok(sharedPages.has(file.replace(/(?:\.es)?\.html$/, "")), file);
  }
  for (const route of sitePages.keys()) await access(new URL(pageSourcePath(route), root));
  assert.equal(pageSourcePath("app/mortgage/index.html"), "calc/pages/app/mortgage/index.html");
  assert.equal(pageSourcePath("homebuyers.html"), "calc/pages/homebuyers.html");
  assert.equal(pageSourcePath("scan.html"), "scan/pages/index.html");
  assert.equal(pageSourcePath("support.html"), "content/pages/support.html");
});

test("direct-open paths change without moving public pages or existing redirects", async () => {
  for (const route of ["calc.html", "calc.es.html", "scan.html", "scan.es.html", "leads.html", "leads.es.html", "living.html", "homebuyers.html", "refinance.html", "app/mortgage/index.html"]) {
    assert.notEqual(localPagePath(route), route);
    assert.match(await read(localPagePath(route)), /<main id="main"/, route);
    assert.match(await read("dist/" + route), /<main id="main"/, route);
    await assert.rejects(access(new URL(route, root)), { code: "ENOENT" });
  }
  for (const [route, target] of siteRedirects) {
    assert.ok((await read("dist/" + route)).includes(JSON.stringify(target) + " + window.location.search + window.location.hash"), route);
    await assert.rejects(access(new URL(route, root)), { code: "ENOENT" });
  }
});

test("a moved stylesheet and its image work both directly and at the original URLs", async () => {
  const path = "assets/site/calc-landing.css";
  const local = new URL(assetSourcePath(path), root);
  assert.match(await readFile(local, "utf8"), /url\('site\/hero\.jpg'\)/);
  await access(new URL("site/hero.jpg", local));
  assert.match(await read("dist/" + path), /url\('\.\.\/\.\.\/images-bricks-calc\/hero\.jpg'\)/);
  await access(new URL("dist/images-bricks-calc/hero.jpg", root));
});
