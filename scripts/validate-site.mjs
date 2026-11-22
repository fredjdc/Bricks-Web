import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "parse5";

export const siteOrigin = "https://bricks.pe";
const siteHosts = new Set(["bricks.pe", "www.bricks.pe"]);
const referenceAttributes = new Set(["href", "src", "poster", "action", "data-src"]);
const sourceSetAttributes = new Set(["srcset", "data-srcset"]);
const socialMetadata = new Set(["og:image", "og:url", "twitter:image"]);
const cssUrl = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*?))\s*\)/gi;
const retiredScripts = /(?:@babel\/standalone|\/react(?:-dom)?@|\/assets\/site\/pages\/|\.jsx(?:[?#]|$))/i;

async function listFiles(directory, prefix = "") {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) {
      paths.push(...await listFiles(join(directory, entry.name), path + "/"));
    } else if (entry.isFile()) {
      paths.push(path);
    } else {
      throw new Error(`Unexpected entry in published site: ${path}`);
    }
  }
  return paths.sort();
}

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
}

function publicPath(paths, pathname) {
  const path = decodeURIComponent(pathname).slice(1);
  if (paths.has(path)) return path;
  const directoryIndex = path.replace(/\/?$/, "/").replace(/^\//, "") + "index.html";
  return paths.has(directoryIndex) ? directoryIndex : undefined;
}

function referencesInStyle(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return Array.from(withoutComments.matchAll(cssUrl), ([, double, single, unquoted]) => double ?? single ?? unquoted);
}

function referencesInSourceSet(sourceSet) {
  return Array.from(sourceSet.matchAll(/\s*([^\s,]+(?:,[^\s,]+)*)(?:\s+[^,]*)?,?/g), ([, url]) => url);
}

export async function validateSite(directory, contentRoutes = []) {
  const paths = new Set(await listFiles(directory));
  const read = path => readFile(join(directory, path), "utf8");
  const pages = new Map();
  const issues = [];

  for (const path of paths) {
    if (!path.endsWith(".html")) continue;
    const nodes = [...elements(parse(await read(path)))].map(node => ({
      tag: node.tagName,
      attributes: new Map(node.attrs.map(({ name, value }) => [name, value])),
      style: node.tagName === "style" ? node.childNodes.map(child => child.value ?? "").join("") : ""
    }));
    const anchors = new Set(nodes.flatMap(({ tag, attributes }) => [
      attributes.get("id"),
      tag === "a" ? attributes.get("name") : undefined
    ].filter(Boolean)));
    pages.set(path, { nodes, anchors });
  }

  for (const path of contentRoutes) {
    const nodes = pages.get(path)?.nodes ?? [];
    const header = nodes.filter(({ tag, attributes }) => tag === "header" && attributes.get("class") === "bricks-header");
    const footer = nodes.filter(({ tag, attributes }) => tag === "footer" && attributes.get("class") === "bricks-footer");
    const main = nodes.filter(({ tag }) => tag === "main");
    if (header.length !== 1 || footer.length !== 1 || main.length !== 1 || main[0].attributes.get("id") !== "main") {
      issues.push(`${path}: expected a shared header and footer and one main landmark`);
    }
    if (nodes.some(({ tag, attributes }) => tag === "script" &&
      (attributes.get("type") === "text/babel" || retiredScripts.test(attributes.get("src") ?? "")))) {
      issues.push(`${path}: references a retired React or JSX script`);
    }
  }

  function checkReference(source, reference, checkAnchor = false) {
    if (!reference?.trim()) return;
    let url;
    let target;
    try {
      url = new URL(reference, new URL("/" + source, siteOrigin));
      if (!["https:", "http:"].includes(url.protocol) || !siteHosts.has(url.hostname)) return;
      target = publicPath(paths, url.pathname);
    } catch {
      issues.push(`${source}: invalid URL ${reference}`);
      return;
    }

    if (!target) {
      issues.push(`${source}: missing target ${reference}`);
    } else if (checkAnchor && url.hash && pages.has(target)) {
      const fragment = decodeURIComponent(url.hash.slice(1).split(":~:")[0]);
      if (fragment && !pages.get(target).anchors.has(fragment)) {
        issues.push(`${source}: missing anchor ${reference}`);
      }
    }
  }

  for (const [path, { nodes }] of pages) {
    for (const { tag, attributes, style } of nodes) {
      for (const [name, value] of attributes) {
        if (referenceAttributes.has(name)) checkReference(path, value, tag === "a" && name === "href");
        if (sourceSetAttributes.has(name)) {
          for (const reference of referencesInSourceSet(value)) checkReference(path, reference);
        }
      }

      if (tag === "meta" && socialMetadata.has(attributes.get("property") ?? attributes.get("name"))) {
        checkReference(path, attributes.get("content"));
      }
      for (const reference of referencesInStyle(style + (attributes.get("style") ?? ""))) {
        if (!reference.startsWith("#")) checkReference(path, reference);
      }
    }
  }

  for (const path of paths) {
    if (!path.endsWith(".css")) continue;
    for (const reference of referencesInStyle(await read(path))) {
      if (!reference.startsWith("#")) checkReference(path, reference);
    }
  }

  const manifest = JSON.parse(await read("site.webmanifest"));
  checkReference("site.webmanifest", manifest.start_url);
  for (const icon of manifest.icons ?? []) checkReference("site.webmanifest", icon.src);

  const sitemap = await read("sitemap.xml");
  for (const [, location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    checkReference("sitemap.xml", location);
  }

  const association = await read("apple-app-site-association");
  if (association !== await read(".well-known/apple-app-site-association")) {
    issues.push("Apple app site association files differ");
  }
  for (const detail of JSON.parse(association).applinks.details) {
    for (const component of detail.components) {
      const path = component["/"];
      if (path?.startsWith("/app/")) checkReference("apple-app-site-association", path);
    }
  }

  if (issues.length) throw new Error(`Website validation failed:\n${[...new Set(issues)].join("\n")}`);
}
