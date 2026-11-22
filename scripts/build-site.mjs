import { basename, dirname, extname, join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { copyFile, cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";

import { renderAnalytics } from "./analytics.mjs";
import { localePath, renderContent } from "./content.mjs";
import { renderLocalPage } from "./local-pages.mjs";
import { localPagePath, pageSourcePath, publishedAssetDirectories, publishedProductFiles } from "./product-paths.mjs";
import { renderPage, sitePages, siteRedirects } from "./layout.mjs";
import { siteOrigin, validateSite } from "./validate-site.mjs";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = join(rootDirectory, "dist");

const publicFiles = [
  ".nojekyll",
  ".well-known/apple-app-site-association",
  "_headers",
  "apple-app-site-association",
  "appcut/AppIcon.png",
  "appcut/guides/effective-app-preview/guide.css",
  "appcut/guides/guides.js",
  "appcut/script.js",
  "appcut/styles.css",
  "appcut/wind-files.css",
  "appcut/wind-files.js",
  "asc-gui/styles.css",
  "calc/styles.css",
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "scripts.js",
  "shared-download-cta.css",
  "site.webmanifest",
  "sitemap.xml",
  "styles.css",
  "tally-embed.css",
  "tally-embed.js"
];

const publicAssetDirectories = [
  ...["appcut/assets", "asc-gui/assets", "assets", "images"].map(path => [path, path]),
  ["calc/assets", "calc/assets"],
  ...publishedAssetDirectories,
];
const republishedOnly = new Set([
  ...publishedAssetDirectories.map(([, source]) => join(rootDirectory, source)),
  ...Array.from(publishedProductFiles.values(), source => join(rootDirectory, source)),
]);
const publicMediaExtension = /\.(?:avif|gif|ico|jpe?g|mp4|png|svg|webm|webp|woff2?)$/i;
const publicSiteScripts = new Set([
  "navigation.js",
  "page-interactions.js",
  "preferences.js",
]);

async function isPublicAsset(source) {
  const name = basename(source);
  if (name.startsWith(".")) return false;
  const entry = await lstat(source);
  const siteAsset = dirname(source) === join(rootDirectory, "assets/site") &&
    (extname(name) === ".css" || publicSiteScripts.has(name));
  return entry.isDirectory() || (entry.isFile() && (publicMediaExtension.test(name) || siteAsset || name === "LICENSE.txt"));
}

function redirectPage(destination) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <title>Page moved | Bricks Apps</title>
  <link rel="canonical" href="${siteOrigin}${destination}">
  <script>window.location.replace(${JSON.stringify(destination)} + window.location.search + window.location.hash);</script>
</head>
<body><main><h1>Page moved</h1><p><a href="${destination}">Continue to Bricks Apps</a></p></main></body>
</html>
`;
}

function versionAssetLinks(html, route, versions) {
  return html.replace(/(<(?:link|script)\b[^>]*?\s(?:href|src)=)(["'])([^"'<>]+)\2/gi, (match, attribute, quote, target) => {
    const url = new URL(target.replaceAll("&amp;", "&"), siteOrigin + "/" + route);
    const revision = url.origin === siteOrigin && versions.get(url.pathname);
    if (!revision) return match;
    url.searchParams.set("v", revision);
    return `${attribute}${quote}${url.pathname}${url.search.replaceAll("&", "&amp;")}${url.hash}${quote}`;
  });
}

const stage = await mkdtemp(join(rootDirectory, ".bricks-dist-"));

try {
  for (const [route, source] of publicAssetDirectories) {
    const sourcePath = join(rootDirectory, source);
    const filter = path => (path === sourcePath || !republishedOnly.has(path)) && isPublicAsset(path);
    await cp(sourcePath, join(stage, route), { recursive: true, filter });
  }

  for (const path of [...publicFiles, ...publishedProductFiles.keys()]) {
    const destination = join(stage, path);
    await mkdir(dirname(destination), { recursive: true });
    const source = join(rootDirectory, publishedProductFiles.get(path) ?? path);
    if (path === "assets/site/calc-landing.css") {
      // Its relative image link resolves from a different directory in the hosted build.
      const css = await readFile(source, "utf8");
      await writeFile(destination, css.replace("url('site/hero.jpg')", "url('../../images-bricks-calc/hero.jpg')"));
    } else {
      await copyFile(source, destination);
    }
  }

  const sharedAssets = (await readdir(join(stage, "assets/site"))).filter(name => /\.(?:css|js)$/.test(name));
  const versionedPaths = [
    ...[...publicFiles, ...publishedProductFiles.keys()].filter(path => /\.(?:css|js)$/.test(path) && !path.startsWith("assets/site/")),
    ...sharedAssets.map(name => `assets/site/${name}`),
  ];
  const versions = new Map(await Promise.all(versionedPaths.map(async path => [
    "/" + path,
    createHash("sha256").update(await readFile(join(stage, path))).digest("hex").slice(0, 12),
  ])));
  const sources = (await Promise.all([...sitePages].map(async ([path, page]) => {
    const source = await readFile(join(rootDirectory, pageSourcePath(path)), "utf8");
    const languages = page.bilingual ? ["en", "es"] : [undefined];
    return Promise.all(languages.map(async language => {
      const route = localePath(path, language);
      const entry = language === "es" ? page.spanishEntry ?? page.entry : page.entry;
      const html = await renderContent(source, { rootDirectory, route, entry, language });
      return [route, renderPage(path, html, { language })];
    }));
  }))).flat();
  const routes = sources.map(([path]) => path);
  if (new Set([...routes, ...siteRedirects.keys()]).size !== routes.length + siteRedirects.size) {
    throw new Error("Multiple pages or redirects share the same output path");
  }
  const published = sources.map(([route, html]) => [route, versionAssetLinks(renderAnalytics(html), route, versions)]);
  for (const [path, html] of [...published, ...Array.from(siteRedirects, ([path, target]) => [path, redirectPage(target)])]) {
    const destination = join(stage, path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }

  await validateSite(stage, routes);

  const files = new Set(routes);
  const localPages = sources.map(([path, html]) => [localPagePath(path), renderLocalPage(html, path, files)]);
  if (new Set(localPages.map(([path]) => path)).size !== localPages.length) {
    throw new Error("Multiple hosted pages share the same direct-open path");
  }
  const stalePages = [];
  for (const [path, html] of localPages) {
    const destination = join(rootDirectory, path);
    const existing = await readFile(destination, "utf8").catch(error => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (existing !== html) stalePages.push({ path, destination, html });
  }
  if (process.argv.includes("--check-local-pages") && stalePages.length) {
    throw new Error(`Run npm run build to refresh the direct-open pages:\n${stalePages.map(({ path }) => path).join("\n")}`);
  }
  for (const { destination, html } of stalePages) {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }

  await rm(outputDirectory, { force: true, recursive: true });
  await rename(stage, outputDirectory);
  console.log(`Built ${localPages.length} direct-open files and validated ${routes.length} hosted pages and ${siteRedirects.size} redirects in dist/.`);
} finally {
  await rm(stage, { force: true, recursive: true });
}
