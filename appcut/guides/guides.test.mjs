import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { renderPage } from "../../scripts/layout.mjs";
import { guideRegistry } from "./guide-registry.mjs";

const shells = new URL("../../content/pages/appcut/", import.meta.url);
const readGuide = path => readFileSync(new URL(`guides/${path}`, shells), "utf8");

await import("./guides.js");

const { GUIDE_TOPICS, matchesGuide, normalizeGuideText } = globalThis.GuideCatalog;

test("guide search normalizes case, whitespace, and diacritics", () => {
  assert.equal(normalizeGuideText("  Vídeo CAPTURE  "), "video capture");
});

test("guide matching combines query and topic", () => {
  const guide = {
    searchText: "Prepare App Preview footage, screenshots, and audio",
    topics: "plan capture"
  };

  assert.equal(matchesGuide({ ...guide, query: "audio", topic: "capture" }), true);
  assert.equal(matchesGuide({ ...guide, query: "audio", topic: "edit" }), false);
  assert.equal(matchesGuide({ ...guide, query: "captions", topic: "capture" }), false);
  assert.equal(matchesGuide({ ...guide, query: "", topic: "all" }), true);
  assert.equal(matchesGuide({ ...guide, query: "audio footage", topic: "capture" }), true);
});

test("guide topics expose the complete filter vocabulary", () => {
  assert.deepEqual([...GUIDE_TOPICS], ["all", "plan", "capture", "edit", "deliver"]);
});

test("the static catalog and SEO describe the same guide collection", () => {
  const hubHTML = readGuide("index.html");
  const sitemap = readFileSync(new URL("../../sitemap.xml", import.meta.url), "utf8");
  const cardMatches = [...hubHTML.matchAll(/<article class="guide-card"[^>]*data-topics="([^"]+)"[^>]*>[\s\S]*?<a class="guide-card-link" href="([^"]+)"/g)];
  const hrefs = cardMatches.map((match) => match[2]);
  const publishedGuides = guideRegistry.filter((guide) => guide.status === "published");
  const allowedTopics = new Set([...GUIDE_TOPICS].filter((topic) => topic !== "all"));

  assert.equal(cardMatches.length, publishedGuides.length);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.equal((hubHTML.match(/Start here/g) ?? []).length, publishedGuides.filter((guide) => guide.featured).length);
  assert.equal((hubHTML.match(/class="guide-card-icon"/g) ?? []).length, publishedGuides.length);
  assert.match(hubHTML, /<section class="guide-controls"[^>]* hidden>/);
  assert.match(hubHTML, /<input[^>]*type="search"/);
  assert.match(hubHTML, /aria-live="polite"/);
  assert.match(sitemap, /<loc>https:\/\/bricks\.pe\/appcut\/guides\/<\/loc>/);
  assert.doesNotMatch(hubHTML, /[—–]/);

  cardMatches.forEach((match) => {
    match[1].split(/\s+/).forEach((topic) => assert.equal(allowedTopics.has(topic), true));
  });

  const structuredDataSource = hubHTML.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const structuredData = JSON.parse(structuredDataSource);
  const collection = structuredData["@graph"].find((item) => item["@type"] === "CollectionPage");
  const structuredSlugs = collection.mainEntity.itemListElement.map((item) => new URL(item.url).pathname.split("/").filter(Boolean).at(-1));

  assert.deepEqual(structuredSlugs, publishedGuides.map((guide) => guide.slug));
  assert.deepEqual(hrefs, publishedGuides.map((guide) => `${guide.slug}/index.html`));
  publishedGuides.forEach((guide) => {
    readGuide(`${guide.slug}/index.html`);
  });
});

test("the guide catalog and articles share accessible navigation", () => {
  const pagePaths = [
    "index.html",
    ...guideRegistry.filter((guide) => guide.status === "published").map((guide) => `${guide.slug}/index.html`),
  ];
  for (const path of pagePaths) {
    const source = readGuide(path);
    const html = renderPage(`appcut/guides/${path}`, source);
    const current = path === "index.html" ? "page" : "location";
    assert.match(html, /class="bricks-skip-link" href="#main"/);
    assert.match(html, /<main id="main" tabindex="-1">/);
    assert.ok(html.includes(`href="/appcut/guides/" aria-current="${current}">Guides`));
  }
});

test("each article breadcrumb includes the Guides collection", () => {
  const articlePaths = guideRegistry
    .filter((guide) => guide.status === "published")
    .map((guide) => `./${guide.slug}/index.html`);

  articlePaths.forEach((path) => {
    const publicArticleURL = new URL(path, import.meta.url);
    const articleHTML = readGuide(path);
    const structuredDataSource = articleHTML.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const structuredData = JSON.parse(structuredDataSource);
    const breadcrumbs = structuredData["@graph"].find((item) => item["@type"] === "BreadcrumbList");
    const headingCount = (articleHTML.match(/<h2\b/g) ?? []).length;
    const decoratedHeadingCount = (articleHTML.match(/<img class="guide-section-icon"[^>]*>\s*<h2\b/g) ?? []).length;
    const iconSources = [...articleHTML.matchAll(/src="(\.\.\/\.\.\/assets\/guide-icons\/[^"]+\.svg)"/g)].map((match) => match[1]);

    assert.match(articleHTML, /class="guide-hero-icon"/);
    assert.equal(decoratedHeadingCount, headingCount);
    assert.doesNotMatch(articleHTML, /<svg[^>]+class="guide-(?:hero|section)-icon"/);
    iconSources.forEach((source) => readFileSync(new URL(source, publicArticleURL)));
    assert.equal(breadcrumbs.itemListElement.length, 3);
    assert.equal(breadcrumbs.itemListElement[1].name, "Guides");
    assert.equal(breadcrumbs.itemListElement[2].position, 3);
  });
});

test("the quick start defers YouTube until the viewer presses play", () => {
  const articleHTML = readGuide("getting-started/index.html");

  assert.match(articleHTML, /data-video-id="0MCumtDdCSw"/);
  assert.match(articleHTML, /class="guide-video-play"/);
  assert.match(articleHTML, /location\.protocol === "file:"/);
  assert.match(articleHTML, /iframe\.addEventListener\("load"/);
  assert.match(articleHTML, /iframe\.focus\(\)/);
  assert.match(articleHTML, /youtube-nocookie\.com\/embed/);
  assert.match(articleHTML, /href="https:\/\/youtu\.be\/0MCumtDdCSw"/);
  assert.doesNotMatch(articleHTML, /<iframe\b/);
});

test("the enhanced catalog restores, filters, resets, and responds to history state", async () => {
  class FakeElement {
    constructor({ dataset = {}, textContent = "", value = "", hidden = false } = {}) {
      this.dataset = dataset;
      this.textContent = textContent;
      this.value = value;
      this.hidden = hidden;
      this.attributes = new Map();
      this.listeners = new Map();
      this.focused = false;
    }

    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }

    dispatch(type) {
      this.listeners.get(type)?.({ preventDefault() {} });
    }

    setAttribute(name, value) {
      this.attributes.set(name, value);
    }

    focus() {
      this.focused = true;
    }
  }

  const controls = new FakeElement({ hidden: true });
  const searchForm = new FakeElement();
  const searchInput = new FakeElement();
  const clearButton = new FakeElement({ hidden: true });
  const resultCount = new FakeElement({ textContent: "4 guides" });
  const emptyState = new FakeElement({ hidden: true });
  const emptyTitle = new FakeElement();
  const resetButton = new FakeElement();
  const filterButtons = ["all", "plan", "capture", "edit", "deliver"].map((topic) => new FakeElement({ dataset: { topic } }));
  const cards = [
    new FakeElement({ dataset: { topics: "plan capture edit deliver", search: "quick start tutorial walkthrough" }, textContent: "Getting started with AppCut" }),
    new FakeElement({ dataset: { topics: "plan capture edit deliver", search: "story muted complete workflow" }, textContent: "App Preview essentials" }),
    new FakeElement({ dataset: { topics: "plan capture", search: "screen recordings audio" }, textContent: "Prepare App Preview footage and audio" }),
    new FakeElement({ dataset: { topics: "edit deliver", search: "captions muted export" }, textContent: "Edit an App Preview for clarity" })
  ];
  const selectors = new Map([
    [".guide-controls", controls],
    [".guide-search", searchForm],
    ["#guide-search-input", searchInput],
    [".guide-clear", clearButton],
    [".guide-result-count", resultCount],
    [".guide-empty", emptyState],
    [".guide-empty-title", emptyTitle],
    [".guide-reset", resetButton]
  ]);
  const windowListeners = new Map();

  globalThis.document = {
    querySelector: (selector) => selectors.get(selector),
    querySelectorAll: (selector) => selector === "[data-topic]" ? filterButtons : cards
  };
  globalThis.window = {
    location: new URL("https://bricks.pe/appcut/guides/?q=audio&topic=capture"),
    history: {
      replaceState: (_state, _title, url) => {
        globalThis.window.location = new URL(url);
      }
    },
    addEventListener: (type, listener) => windowListeners.set(type, listener)
  };

  await import(`./guides.js?dom-test=${Date.now()}`);

  assert.equal(controls.hidden, false);
  assert.deepEqual(cards.map((card) => card.hidden), [true, true, false, true]);
  assert.equal(resultCount.textContent, "1 guide");
  assert.equal(filterButtons[2].attributes.get("aria-pressed"), "true");

  searchInput.value = "captions";
  searchInput.dispatch("input");
  assert.equal(emptyState.hidden, false);
  assert.equal(emptyTitle.textContent, "No guides match “captions”.");

  resetButton.dispatch("click");
  assert.deepEqual(cards.map((card) => card.hidden), [false, false, false, false]);
  assert.equal(globalThis.window.location.search, "");

  globalThis.window.location = new URL("https://bricks.pe/appcut/guides/?q=muted&topic=deliver");
  windowListeners.get("popstate")();
  assert.deepEqual(cards.map((card) => card.hidden), [true, false, true, false]);
  assert.equal(resultCount.textContent, "2 guides");

  delete globalThis.document;
  delete globalThis.window;
});

test("guide beta actions reach the current beta landing and Quick Start has a poster", () => {
  const landing = readFileSync(new URL("index.html", shells), "utf8");
  assert.match(landing, /id="top"/);
  assert.match(landing, /https:\/\/testflight\.apple\.com\/join\/UgyQd6ES/);
  for (const path of ["index.html", ...guideRegistry.filter(guide => guide.status === "published").map(guide => `${guide.slug}/index.html`)]) {
    const source = readGuide(path);
    const page = renderPage(`appcut/guides/${path}`, source);
    assert.doesNotMatch(page, /#hero-email/);
    assert.match(page, /href="\/appcut\/#top" class="bricks-nav-action">Get Beta Access/);
  }
  const path = "getting-started/index.html";
  const quickStart = new URL(path, import.meta.url);
  const page = readGuide(path);
  const poster = page.match(/class="guide-video"[^>]*>\s*<img src="([^"]+)"/)?.[1];
  assert.ok(poster);
  assert.ok(readFileSync(new URL(poster, quickStart)).length > 0);
});
