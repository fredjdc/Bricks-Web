import { posix } from "node:path";

const productFolders = new Set(["appcut", "asc-gui", "calc", "leads", "living", "scan"]);

// Keep existing public paths, while putting direct-open and source files with their app.
export function localPagePath(route) {
  if (route.startsWith("app/")) return "calc/" + route;
  const match = route.match(/^(calc|scan|leads|living|homebuyers|calculadora-hipotecaria|refinance|refinanciamiento)(\.es)?\.html$/);
  if (!match) return route;
  const [, page, locale = ""] = match;
  if (page === "calc") return `calc/legacy${locale}.html`;
  if (productFolders.has(page)) return `${page}/index${locale}.html`;
  return "calc/" + route;
}

export function pageSourcePath(route) {
  const local = localPagePath(route);
  const [owner, ...path] = local.split("/");
  return path.length && productFolders.has(owner)
    ? `${owner}/pages/${path.join("/")}`
    : "content/pages/" + local;
}

export function fragmentSourcePath(route, name) {
  const owner = localPagePath(route).split("/")[0];
  return productFolders.has(owner) ? `${owner}/content/${name}` : "content/" + name;
}

const productsWithMedia = ["calc", "leads", "living", "scan"];
export const publishedAssetDirectories = [
  ["generated_images", "assets/reference/generated"],
  ["userjot-images", "assets/userjot"],
  ...productsWithMedia.map(app => [`images-bricks-${app}`, `${app}/assets/site`]),
  ...["calc", "leads", "scan"].map(app => ["social-media-img", `${app}/assets/social`]),
];
export const publishedProductFiles = new Map([
  ["living-page.css", "living/assets/living-page.css"],
  ...["calc.js", "calc-content.css", "calc-landing.css"].map(name => [`assets/site/${name}`, `calc/assets/${name}`]),
  ...["calc", "leads", "scan"].flatMap(app => [
    [`images/bricks-${app}-web-icon.png`, `${app}/assets/bricks-${app}-web-icon.png`],
    ...["en", "es"].flatMap(locale => ["light", "dark"].map(theme => {
      const name = `bricks-${app}-${locale}-${theme}.png`;
      return [`assets/${name}`, `${app}/assets/badges/${name}`];
    })),
  ]),
]);

export function assetSourcePath(published) {
  const exact = publishedProductFiles.get(published);
  if (exact) return exact;
  for (const [prefix, source] of publishedAssetDirectories) {
    if (!published.startsWith(prefix + "/")) continue;
    const file = published.slice(prefix.length + 1);
    if (prefix === "social-media-img" && !file.includes(`bricks-${source.split("/")[0]}-`)) continue;
    return posix.join(source, file);
  }
  return published;
}
