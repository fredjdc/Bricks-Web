import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { guideRegistry } from "./guide-registry.mjs";

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
  const hubHTML = readFileSync(new URL("./index.html", import.meta.url), "utf8");
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
  assert.match(sitemap, /<loc>https:\/\/bricks\.pe\/app-preview-editor\/guides\/<\/loc>/);
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
    readFileSync(new URL(`./${guide.slug}/index.html`, import.meta.url), "utf8");
  });
});

test("local navigation targets files instead of filesystem directories", () => {
  const pagePaths = [
    "../index.html",
    "./index.html",
    "./effective-app-preview/index.html",
    "./app-preview-assets/index.html",
    "./video-editing-app-preview/index.html"
  ];

  pagePaths.forEach((path) => {
    const html = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(html, /href="(?:\.\/|\.\.\/|\.\.\/\.\.\/)(?:#[^"]*)?"/);
  });

  const productHTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(productHTML, /href="guides\/index\.html"/);
});

test("each article breadcrumb includes the Guides collection", () => {
  const articlePaths = [
    "./effective-app-preview/index.html",
    "./app-preview-assets/index.html",
    "./video-editing-app-preview/index.html"
  ];

  articlePaths.forEach((path) => {
    const articleHTML = readFileSync(new URL(path, import.meta.url), "utf8");
    const structuredDataSource = articleHTML.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const structuredData = JSON.parse(structuredDataSource);
    const breadcrumbs = structuredData["@graph"].find((item) => item["@type"] === "BreadcrumbList");

    assert.equal(breadcrumbs.itemListElement.length, 3);
    assert.equal(breadcrumbs.itemListElement[1].name, "Guides");
    assert.equal(breadcrumbs.itemListElement[2].position, 3);
  });
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
  const resultCount = new FakeElement({ textContent: "3 guides" });
  const emptyState = new FakeElement({ hidden: true });
  const emptyTitle = new FakeElement();
  const resetButton = new FakeElement();
  const filterButtons = ["all", "plan", "capture", "edit", "deliver"].map((topic) => new FakeElement({ dataset: { topic } }));
  const cards = [
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
    location: new URL("https://bricks.pe/app-preview-editor/guides/?q=audio&topic=capture"),
    history: {
      replaceState: (_state, _title, url) => {
        globalThis.window.location = new URL(url);
      }
    },
    addEventListener: (type, listener) => windowListeners.set(type, listener)
  };

  await import(`./guides.js?dom-test=${Date.now()}`);

  assert.equal(controls.hidden, false);
  assert.deepEqual(cards.map((card) => card.hidden), [true, false, true]);
  assert.equal(resultCount.textContent, "1 guide");
  assert.equal(filterButtons[2].attributes.get("aria-pressed"), "true");

  searchInput.value = "captions";
  searchInput.dispatch("input");
  assert.equal(emptyState.hidden, false);
  assert.equal(emptyTitle.textContent, "No guides match “captions”.");

  resetButton.dispatch("click");
  assert.deepEqual(cards.map((card) => card.hidden), [false, false, false]);
  assert.equal(globalThis.window.location.search, "");

  globalThis.window.location = new URL("https://bricks.pe/app-preview-editor/guides/?q=muted&topic=deliver");
  windowListeners.get("popstate")();
  assert.deepEqual(cards.map((card) => card.hidden), [false, true, false]);
  assert.equal(resultCount.textContent, "2 guides");

  delete globalThis.document;
  delete globalThis.window;
});
