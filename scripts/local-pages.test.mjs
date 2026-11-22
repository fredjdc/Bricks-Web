import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { parse } from "parse5";

import { localePath } from "./content.mjs";
import { sitePages, siteRedirects } from "./layout.mjs";
import { localFileHref } from "./local-pages.mjs";

const contentPaths = [...sitePages].flatMap(([path, page]) => page.bilingual ? [path, localePath(path, "es")] : [path]);
const paths = new Set([...contentPaths, ...siteRedirects.keys()]);
const root = new URL("../", import.meta.url);

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
}

test("file links keep the route, query, fragment, and external destinations", () => {
  const article = "appcut/guides/getting-started/index.html";
  assert.equal(localFileHref("/calc/?source=guide#guides", article, paths), "../../../calc/index.html?source=guide#guides");
  assert.equal(localFileHref("https://www.bricks.pe/", article, paths), "../../../index.html");
  assert.equal(localFileHref("/app-preview-editor/#workflow", "index.html", paths), "app-preview-editor/index.html#workflow");
  assert.equal(localFileHref("#main", article, paths), "#main");
  assert.equal(localFileHref("https://testflight.apple.com/join/UgyQd6ES", article, paths), "https://testflight.apple.com/join/UgyQd6ES");
});

test("every generated page can reach its site links and local assets without HTTP", async () => {
  const pages = new Map(await Promise.all([...paths].map(async path => [
    path,
    [...elements(parse(await readFile(new URL(path, root), "utf8")))],
  ])));
  const anchors = new Map([...pages].map(([path, nodes]) => [
    path,
    new Set(nodes.flatMap(node => node.attrs.filter(attr => attr.name === "id" || (node.tagName === "a" && attr.name === "name"))
      .map(attr => attr.value))),
  ]));
  const assets = new Set();

  for (const [path, nodes] of pages) {
    const current = new URL(path, root);
    if (contentPaths.includes(path)) {
      for (const name of ["header", "main", "footer"]) {
        assert.equal(nodes.filter(node => node.tagName === name && (
          name === "main" || node.attrs.some(attr => attr.name === "class" && attr.value === `bricks-${name}`)
        )).length, 1, path + " " + name);
      }
    }
    for (const node of nodes) {
      if (node.tagName === "link" && node.attrs.some(attr => attr.name === "rel" && ["canonical", "alternate"].includes(attr.value))) continue;
      if (node.tagName === "script") {
        assert.ok(!node.attrs.some(attr => attr.name === "type" && attr.value === "module"), path);
      }
      if (node.tagName === "video") {
        const names = new Set(node.attrs.map(attr => attr.name));
        for (const name of ["autoplay", "loop", "muted", "playsinline", "inert", "poster"]) {
          assert.ok(names.has(name), `${path} video must have ${name}`);
        }
        assert.ok(!names.has("controls"), `${path} preview should have no controls`);
        assert.ok(node.childNodes.some(child => child.tagName === "source" && child.attrs.some(attr => attr.name === "src" && attr.value)), path);
      }
      for (const { name, value } of node.attrs) {
        if (!["href", "src", "data-src", "poster"].includes(name) || !value) continue;
        const destination = new URL(value, current);
        assert.ok(!["bricks.pe", "www.bricks.pe", "localhost", "127.0.0.1"].includes(destination.hostname), path + ": " + value);
        if (destination.protocol !== "file:") continue;
        assert.ok(destination.href.startsWith(root.href), path + ": " + value);
        const target = decodeURIComponent(destination.pathname.slice(root.pathname.length));
        if (node.tagName === "a" && target.endsWith(".html")) {
          assert.ok(pages.has(target), path + ": " + value);
          const fragment = decodeURIComponent(destination.hash.slice(1));
          if (fragment) assert.ok(anchors.get(target).has(fragment), path + ": " + value);
        }
        assets.add(target);
      }
    }
    if (siteRedirects.has(path)) {
      const link = nodes.find(node => node.tagName === "a");
      assert.equal(link.attrs.find(attr => attr.name === "href").value, localFileHref(siteRedirects.get(path), path, paths));
    }
  }

  await Promise.all([...assets].map(async path => {
    assert.ok((await stat(new URL(path, root))).isFile(), path);
  }));
});
