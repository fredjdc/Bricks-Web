import { readFileSync, writeFileSync } from "node:fs";

import { guideRegistry } from "./guide-registry.mjs";

const HUB_URL = "https://bricks.pe/app-preview-editor/guides/";
const TOPICS = new Set(["plan", "capture", "edit", "deliver"]);
const GUIDE_ICONS = new Set(["camera", "film-slate", "sliders-horizontal"]);
const hubPath = new URL("./index.html", import.meta.url);
const sitemapPath = new URL("../../sitemap.xml", import.meta.url);
const publishedGuides = guideRegistry.filter((guide) => guide.status === "published");

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function replaceGeneratedSection(source, startMarker, endMarker, generated) {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Missing generated section markers: ${startMarker}`);
  }

  const contentStart = startIndex + startMarker.length;
  const endLineStart = source.lastIndexOf("\n", endIndex) + 1;
  const endIndent = source.slice(endLineStart, endIndex);
  return `${source.slice(0, contentStart)}\n${generated}\n${endIndent}${source.slice(endIndex)}`;
}

function validateRegistry() {
  const slugs = new Set();
  let featuredCount = 0;

  publishedGuides.forEach((guide) => {
    if (slugs.has(guide.slug)) throw new Error(`Duplicate guide slug: ${guide.slug}`);
    if (!GUIDE_ICONS.has(guide.icon)) throw new Error(`Invalid guide icon: ${guide.slug}`);
    if (!TOPICS.has(guide.primaryTopic)) throw new Error(`Invalid primary topic: ${guide.primaryTopic}`);
    if (!guide.tags.includes(guide.primaryTopic)) throw new Error(`Primary topic missing from tags: ${guide.slug}`);
    if (guide.tags.some((topic) => !TOPICS.has(topic))) throw new Error(`Invalid guide tag: ${guide.slug}`);
    if (guide.featured) featuredCount += 1;
    slugs.add(guide.slug);
  });

  if (featuredCount !== 1) throw new Error("Exactly one published guide must be featured.");
}

function renderStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${HUB_URL}#collection`,
        url: HUB_URL,
        name: "App Preview Editor Guides",
        description: "Practical guidance for planning, capturing, editing, and delivering App Preview videos.",
        isPartOf: {
          "@type": "WebSite",
          name: "Bricks Apps",
          url: "https://bricks.pe/"
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: publishedGuides.length,
          itemListElement: publishedGuides.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: guide.title,
            url: `${HUB_URL}${guide.slug}/`
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "App Preview Editor",
            item: "https://bricks.pe/app-preview-editor/"
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: HUB_URL
          }
        ]
      }
    ]
  };

  return `  <script type="application/ld+json">\n${JSON.stringify(data, null, 2).split("\n").map((line) => `  ${line}`).join("\n")}\n  </script>`;
}

function renderCards() {
  return publishedGuides.map((guide) => {
    const featuredBadge = guide.featured ? '\n                    <span class="guide-start-badge">Start here</span>' : "";
    const aliases = escapeHTML(guide.aliases.join(" "));

    return `              <article class="guide-card" data-guide data-topics="${guide.tags.join(" ")}" data-search="${aliases}">
                <a class="guide-card-link" href="${guide.slug}/index.html">
                  <div class="guide-card-meta">
                    <span>${escapeHTML(guide.primaryTopic[0].toUpperCase() + guide.primaryTopic.slice(1))}</span>
                    <span class="guide-reviewed">Reviewed ${formatDate(guide.reviewedDate)}</span>${featuredBadge}
                  </div>
                  <div class="guide-card-copy">
                    <img class="guide-card-icon" src="../assets/guide-icons/${guide.icon}.svg" width="34" height="34" alt="" aria-hidden="true">
                    <h3>${escapeHTML(guide.title)}</h3>
                    <p>${escapeHTML(guide.summary)}</p>
                  </div>
                  <span class="guide-card-action">Read guide</span>
                </a>
              </article>`;
  }).join("\n\n");
}

function renderSitemap() {
  const hubEntry = `    <url>
        <loc>${HUB_URL}</loc>
        <lastmod>2026-07-18</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
        <xhtml:link rel="alternate" hreflang="en" href="${HUB_URL}"/>
        <xhtml:link rel="alternate" hreflang="x-default" href="${HUB_URL}"/>
    </url>`;

  const guideEntries = publishedGuides.map((guide) => {
    const url = `${HUB_URL}${guide.slug}/`;
    return `    <url>
        <loc>${url}</loc>
        <lastmod>${guide.reviewedDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
        <xhtml:link rel="alternate" hreflang="${guide.locale}" href="${url}"/>
        <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
    </url>`;
  }).join("\n\n");

  return `${hubEntry}\n\n${guideEntries}`;
}

function buildFiles() {
  validateRegistry();

  let hubSource = readFileSync(hubPath, "utf8");
  hubSource = replaceGeneratedSection(hubSource, "<!-- guides:structured-data:start -->", "<!-- guides:structured-data:end -->", renderStructuredData());
  hubSource = replaceGeneratedSection(hubSource, "<!-- guides:cards:start -->", "<!-- guides:cards:end -->", renderCards());

  const sitemapSource = replaceGeneratedSection(
    readFileSync(sitemapPath, "utf8"),
    "<!-- app-preview-guides:start -->",
    "<!-- app-preview-guides:end -->",
    renderSitemap()
  );

  return { hubSource, sitemapSource };
}

const { hubSource, sitemapSource } = buildFiles();
const checkOnly = process.argv.includes("--check");
const writeFiles = process.argv.includes("--write");

if (checkOnly === writeFiles) {
  throw new Error("Choose one mode: --check or --write");
}

if (checkOnly) {
  if (hubSource !== readFileSync(hubPath, "utf8") || sitemapSource !== readFileSync(sitemapPath, "utf8")) {
    throw new Error("Generated guide files are out of date. Run: node app-preview-editor/guides/build-guides.mjs --write");
  }
} else if (writeFiles) {
  writeFileSync(hubPath, hubSource);
  writeFileSync(sitemapPath, sitemapSource);
}
