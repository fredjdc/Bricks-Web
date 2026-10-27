import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths } from "./responsive-checkpoints.mjs";

const [html, css, script] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
]);
const composition = html.match(/<section class="result-section section shell"[\s\S]*?<\/section>/)[0];
const handoffScript = script.slice(script.indexOf("const previewHandoff ="));
const geometry = vm.runInNewContext(`${handoffScript.slice(0, handoffScript.indexOf("const setupPreviewHandoff ="))}; previewHandoff`);
const entrances = vm.runInNewContext(`${handoffScript.slice(0, handoffScript.indexOf("const setupPreviewHandoff ="))}; handoffEntrances`);
const sharpness = vm.runInNewContext(`${handoffScript.slice(0, handoffScript.indexOf("const setupPreviewHandoff ="))}; handoffSharpness`);
const blurProgress = vm.runInNewContext(`${handoffScript.slice(0, handoffScript.indexOf("const setupPreviewHandoff ="))}; handoffBlurProgress`);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < .0001, `${actual} must equal ${expected}`);
const rect = (x, y, width, height, scroll = 0) => ({ left: x - width / 2, top: y - height / 2 - scroll, width, height });

test("the supplied PNG layers replace the editor video with one noninteractive preview fallback", async () => {
  const layers = [...composition.matchAll(/<img class="([^"]+)" src="([^"]+)" width="(\d+)" height="(\d+)"/g)];
  assert.deepEqual(layers.map(([, name, src]) => [name, src]), [
    ["editor-desktop", "assets/desktop-bg.png"],
    ["editor-app", "assets/app-preview-editor-app.png"],
    ["editor-preview-static", "assets/product/hero-result-center.png"],
  ]);
  for (const [, , src, width, height] of layers) {
    const png = await readFile(new URL(src, import.meta.url));
    assert.equal(png.readUInt32BE(16), Number(width));
    assert.equal(png.readUInt32BE(20), Number(height));
  }
  assert.match(composition, /role="img" aria-label="App Preview Editor with an app preview centered on its editing canvas"/);
  assert.match(composition, /class="editor-canvas" aria-hidden="true"/);
  assert.doesNotMatch(composition, /<video|<button|tabindex|data-playback|hero-demo\.mp4|editor-composition reveal/);
  assert.equal((html.match(/id="finished-preview-video"/g) ?? []).length, 1);
  assert.equal((html.match(/data-src="assets\/heroResult\.mp4"/g) ?? []).length, 1);
  assert.match(html, /class="hero-center-slot" data-hero-preview-origin>[\s\S]*?class="hero-preview-traveler">[\s\S]*?class="hero-result hero-result-center" data-hero-entrance>/);
  assert.doesNotMatch(handoffScript, /cloneNode|appendChild|replaceWith|\.focus\(|\.play\(|currentTime\s*=/);
});

test("the target matches the screenshot's blank canvas without covering controls or timeline", () => {
  assert.match(css, /\.editor-app \{[^}]*left: 5%; top: 50%; width: 90%; height: auto;/);
  const bounds = css.match(/\.editor-canvas \{ position: absolute; left: ([\d.]+)%; top: ([\d.]+)%; width: ([\d.]+)%; height: ([\d.]+)%;/).slice(1).map(Number);
  const stageWidth = 1000, stageHeight = stageWidth * 9 / 16;
  const windowScale = stageWidth * .9 / 1920;
  const windowTop = (stageHeight - 986 * windowScale) / 2;
  near(bounds[0] / 100 * stageWidth, stageWidth * .05 + 342 * windowScale);
  near(bounds[1] / 100 * stageHeight, windowTop + 52 * windowScale);
  near(bounds[2] / 100 * stageWidth, (1578 - 342) * windowScale);
  near(bounds[3] / 100 * stageHeight, (774 - 52) * windowScale);
  assert.match(css, /\.editor-preview-target \{[^}]*left: 50%; top: 50%; height: 82%; aspect-ratio: 886 \/ 1920;/);
  const previewHeight = (774 - 52) * .82;
  assert.ok(413 + previewHeight / 2 < 774);
  assert.ok(413 - previewHeight / 2 > 52);
  assert.ok(960 + previewHeight * 886 / 1920 / 2 < 1578);
  assert.match(css, /\.hero-center-slot \{[^}]*position: relative; z-index: 2; min-width: 0;/);
  assert.match(css, /\.hero-results \{ position: relative; z-index: 3;/);
});

test("scroll geometry clamps at the original hero position and fits the centered destination", () => {
  const source = scroll => rect(500, 1000, 300, 650, scroll);
  const target = scroll => rect(540, 2000, 140, 300, scroll);
  const first = geometry(source(0), target(0), 800, 1.08);
  assert.equal(first.progress, 0);
  near(first.x, 0); near(first.y, 0); near(first.scale, 1);
  const middle = geometry(source(948), target(948), 800, 1.08);
  near(middle.progress, .5); near(middle.x, 20); near(middle.y, 500);
  const last = geometry(source(2000), target(2000), 800, 1.08);
  assert.equal(last.progress, 1);
  near(source(2000).left + 150 + last.x, target(2000).left + 70);
  near(source(2000).top + 325 + last.y, target(2000).top + 150);
  assert.ok(300 * 1.08 * last.scale <= 140);
  near(650 * 1.08 * last.scale, 300);
  assert.equal(geometry({ ...source(0), width: 0 }, target(0), 800, 1.08), null);
  assert.equal(geometry({ ...source(0), left: NaN }, target(0), 800, 1.08), null);
  assert.equal(geometry(source(0), rect(500, 900, 140, 300), 800, 1.08), null);
});

test("the portrait settles earlier while the measured canvas is substantially visible", () => {
  for (const [viewport, sourceY, targetY, sourceWidth, sourceHeight, targetWidth, targetHeight] of [[800, 1000, 2000, 300, 650, 140, 300], [400, 750, 1500, 140, 304, 55, 120]]) {
    const settleScroll = targetY - viewport * .78;
    assert.ok(settleScroll < targetY - viewport * .55);
    const source = rect(500, sourceY, sourceWidth, sourceHeight, settleScroll);
    const target = rect(540, targetY, targetWidth, targetHeight, settleScroll);
    const state = geometry(source, target, viewport, 1.08);
    near(state.progress, 1);
    near(target.top + target.height / 2, viewport * .78);
    near(source.top + source.height / 2 + state.y, target.top + target.height / 2);
    near(source.left + source.width / 2 + state.x, target.left + target.width / 2);
    assert.ok(sourceWidth * 1.08 * state.scale <= targetWidth + .0001);
    assert.ok(sourceHeight * 1.08 * state.scale <= targetHeight + .0001);
    assert.ok(geometry(rect(500, sourceY, sourceWidth, sourceHeight, settleScroll - 1), rect(540, targetY, targetWidth, targetHeight, settleScroll - 1), viewport, 1.08).progress < 1);
  }
});

function page({ reduced = false } = {}) {
  let scroll = 0, targetWidth = 140, targetHeight = 300, broken = false, reads = 0;
  const listeners = {}, motionListeners = {}, frames = new Map(), properties = new Map(), sceneProperties = new Map(), classes = new Set(), imageListeners = [];
  const traveler = { style: { setProperty: (name, value) => properties.set(name, value), removeProperty: name => properties.delete(name) } };
  const origin = {
    querySelector: selector => selector === ".hero-preview-traveler" ? traveler : null,
    getBoundingClientRect() { reads++; if (broken) throw new Error("Missing geometry"); return rect(500, 1000, 300, 650, scroll); },
  };
  const target = { getBoundingClientRect: () => rect(540, 2000, targetWidth, targetHeight, scroll) };
  const title = { getBoundingClientRect: () => rect(500, 1550, 600, 70, scroll) };
  const composition = {
    querySelector: selector => selector === ".editor-desktop" ? { getBoundingClientRect: () => rect(540, 2050.5, 1000, 600, scroll) } : target,
    querySelectorAll: () => [0, 1, 2].map(() => ({ addEventListener: (name, callback) => imageListeners.push([name, callback]) })),
  };
  const scene = {
    style: { setProperty: (name, value) => sceneProperties.set(name, value), removeProperty: name => sceneProperties.delete(name) },
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    contains: node => node === composition,
  };
  origin.closest = selector => selector === "main" ? scene : null;
  const motion = { matches: reduced, addEventListener: (name, callback) => { motionListeners[name] = callback; } };
  const window = {
    innerHeight: 800,
    getComputedStyle: () => ({ getPropertyValue: () => "1.08" }),
    addEventListener: (name, callback, options) => { listeners[name] = { callback, options }; },
  };
  let nextFrame = 0;
  vm.runInNewContext(handoffScript, {
    window, motionPreference: motion,
    document: { addEventListener() {}, querySelector: selector => ({ "[data-hero-preview-origin]": origin, "[data-editor-composition]": composition, "#result-title": title })[selector] },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
  });
  return {
    properties, sceneProperties, classes, frames, listeners, imageListeners, origin,
    scroll: value => { scroll = value; listeners.scroll.callback(); },
    resize: (width, height) => { targetWidth = width; targetHeight = height; listeners.resize.callback(); },
    preference: reduced => { motion.matches = reduced; motionListeners.change(); },
    fail: () => { broken = true; listeners.resize.callback(); },
    reads: () => reads,
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); },
  };
}

test("one animation frame follows scroll and reverses without moving nodes or collapsing the origin", () => {
  const p = page();
  assert.equal(p.classes.has("is-handoff-ready"), true);
  assert.equal(p.listeners.scroll.options.passive, true);
  const initialOrigin = p.origin.getBoundingClientRect();
  p.scroll(948); p.scroll(948);
  assert.equal(p.frames.size, 1);
  p.flush(); near(parseFloat(p.properties.get("--preview-y")), 500);
  p.scroll(2000); p.flush(); near(parseFloat(p.properties.get("--preview-y")), 1000);
  p.scroll(0); p.flush(); near(parseFloat(p.properties.get("--preview-scale")), 1);
  assert.deepEqual(p.origin.getBoundingClientRect(), initialOrigin);
  assert.match(css, /\.hero-preview-traveler \{ transform-origin: center; \}/);
  assert.match(css, /\.hero-preview-traveler \{ transform: translate\(var\(--preview-x, 0px\), var\(--preview-y, 0px\)\) scale\(var\(--preview-scale, 1\)\); \}/);
});

test("resize and image loading remeasure the target instead of using fixed viewport coordinates", () => {
  const p = page();
  p.scroll(2000); p.flush();
  const previous = Number(p.properties.get("--preview-scale"));
  p.resize(90, 180); p.flush();
  const next = Number(p.properties.get("--preview-scale"));
  assert.ok(next < previous); near(next * 650 * 1.08, 180);
  p.imageListeners.forEach(([name, callback]) => { assert.equal(name, "load"); callback(); });
  assert.equal(p.frames.size, 1);
});

test("one clamped scroll progress synchronizes the center, side exits, and editor fade in both directions", () => {
  const p = page();
  for (const [scroll, expected] of [[0, 0], [948, .5], [2000, 1], [948, .5], [0, 0], [-1000, 0], [5000, 1]]) {
    p.scroll(scroll); p.flush();
    const progress = Number(p.sceneProperties.get("--handoff-progress"));
    near(progress, expected);
    near(parseFloat(p.properties.get("--preview-y")), 1000 * expected);
    assert.ok(progress >= 0 && progress <= 1);
  }
  const sideRule = css.match(/\.is-handoff-ready \.hero-side-slot \{([^}]+)\}/)[1];
  assert.ok(sideRule.includes("transform: translateX(calc(var(--hero-exit-direction) * ((var(--hero-separation-progress, 0) - 1) * var(--hero-side-rest-shift) + var(--handoff-progress) * var(--hero-exit-distance))));"));
  assert.ok(sideRule.includes("opacity: calc(1 - var(--handoff-progress)); filter: blur(calc(var(--handoff-progress) * var(--hero-exit-blur)));"));
  assert.match(css, /\.is-handoff-ready \.result-section :is\(\.result-copy h2, \.result-copy p, \.editor-backdrop, \.editor-app\) \{ opacity: var\(--enter-progress\); \}/);
  const limits = css.match(/--hero-exit-distance: clamp\((\d+)px, (\d+)vw, (\d+)px\); --hero-exit-blur: (\d+)px;/).slice(1).map(Number);
  for (const viewport of [240, 390, 1440]) {
    const distance = Math.max(limits[0], Math.min(limits[2], viewport * limits[1] / 100));
    for (const progress of [0, .5, 1]) {
      const left = -distance * progress, right = distance * progress;
      near(left, -right);
      assert.ok(Math.abs(left) <= 220);
      assert.ok(limits[3] * progress <= 6);
      near((1 - progress) + progress, 1);
    }
  }
  assert.equal((handoffScript.match(/addEventListener\("scroll"/g) ?? []).length, 1);
  assert.doesNotMatch(handoffScript, /setTimeout|setInterval/);
});

test("title, subtitle, desktop, and app use reversible staggered scroll ranges and finish with no filter", () => {
  const early = entrances(.1);
  assert.ok(early.title > 0);
  assert.equal(early.subtitle, 0); assert.equal(early.desktop, 0); assert.equal(early.app, 0);
  const middle = entrances(.5);
  assert.equal(middle.title, 1); assert.equal(middle.subtitle, 1);
  assert.ok(middle.desktop > middle.app && middle.app > 0);
  const p = page();
  for (const [scroll, progress] of [[0, 0], [948, .5], [2000, 1], [948, .5], [0, 0]]) {
    p.scroll(scroll); p.flush();
    const state = geometry(rect(500, 1000, 300, 650, scroll), rect(540, 2000, 140, 300, scroll), 800, 1.08);
    const expectedSharpness = sharpness(blurProgress(rect(500, 1000, 300, 650, scroll), rect(500, 1550, 600, 70, scroll), state, 1.08));
    for (const [stage, expected] of Object.entries(entrances(progress))) {
      near(Number(p.sceneProperties.get(`--handoff-${stage}`)), expected);
      const filter = p.sceneProperties.get(`--handoff-${stage}-filter`);
      if (expectedSharpness[stage] === 1) assert.equal(filter, "none");
      else near(Number(filter.match(/blur\(([\d.]+)px\)/)[1]), (1 - expectedSharpness[stage]) * 3);
    }
  }
  for (const [selector, stage] of [["result-copy h2", "title"], ["result-copy p", "subtitle"], ["editor-backdrop", "desktop"], ["editor-app", "app"]]) {
    assert.ok(css.includes(`.${selector} { --enter-progress: var(--handoff-${stage}); --enter-filter: var(--handoff-${stage}-filter); }`));
  }
});

test("entrance blur remains visible through the title crossing and clears as the trailing portrait edge passes it", () => {
  const p = page(), stages = ["title", "subtitle", "desktop", "app"];
  const clearProgress = (1585 - 649) / (1850 - 649);
  const clearScroll = 520 + clearProgress * 856;
  p.scroll(715); p.flush();
  assert.ok(parseFloat(p.sceneProperties.get("--handoff-title-filter").slice(5)) > 2, "Title is visibly blurred when it first enters the viewport");
  for (const scroll of [948, clearScroll - .1]) {
    p.scroll(scroll); p.flush();
    for (const stage of stages) assert.notEqual(p.sceneProperties.get(`--handoff-${stage}-filter`), "none");
  }
  p.scroll(clearScroll + .0001); p.flush();
  assert.ok(Number(p.sceneProperties.get("--handoff-progress")) < 1, "Blur clears before the canvas handoff finishes");
  for (const stage of stages) assert.equal(p.sceneProperties.get(`--handoff-${stage}-filter`), "none");
  for (const scroll of [clearScroll + 50, 2000, clearScroll - .1]) {
    p.scroll(scroll); p.flush();
    for (const stage of stages) assert.equal(p.sceneProperties.get(`--handoff-${stage}-filter`) === "none", scroll > clearScroll);
  }
});

test("title clearance follows scaled moving bounds at every responsive checkpoint and reverses at the same point", () => {
  for (const viewportWidth of widths) {
    const mobile = viewportWidth < 560, viewport = mobile ? 700 : 900;
    const sourceY = mobile ? 750 : 1000, targetY = mobile ? 1500 : 2000;
    const width = mobile ? 140 : 300, height = mobile ? 304 : 650, tw = mobile ? 55 : 140, th = mobile ? 120 : 300;
    const center = viewportWidth / 2, titleHeight = mobile ? 80 : 60;
    const titleY = sourceY + (targetY - sourceY) * .55;
    const source = scroll => rect(center, sourceY, width, height, scroll);
    const target = scroll => rect(center, targetY, tw, th, scroll);
    const title = scroll => rect(center, titleY, Math.min(viewportWidth - 32, 760), titleHeight, scroll);
    const fit = Math.min(tw / (width * 1.08), th / (height * 1.08));
    const initialTop = sourceY - height * 1.08 / 2, finalTop = targetY - height * 1.08 * fit / 2;
    const start = sourceY - viewport * .6, end = targetY - viewport * .78;
    const clearScroll = start + (titleY + titleHeight / 2 - initialTop) / (finalTop - initialTop) * (end - start);
    const at = scroll => blurProgress(source(scroll), title(scroll), geometry(source(scroll), target(scroll), viewport, 1.08), 1.08);
    const state = geometry(source(clearScroll), target(clearScroll), viewport, 1.08);
    near(sourceY - clearScroll + state.y - height * 1.08 * state.scale / 2, title(clearScroll).top + titleHeight);
    for (const offset of [-.1, .0001, 1000, .0001, -.1]) {
      const value = at(clearScroll + offset);
      if (offset > 0) near(value, 1);
      else {
        assert.ok(value < 1 && value > 0);
        assert.ok(Object.values(sharpness(value)).every(progress => progress < 1), "No layer becomes completely sharp before the title is cleared");
      }
    }
    assert.ok(Math.abs(at(clearScroll + .001) - at(clearScroll - .001)) < .00001, "No filter discontinuity at clearance");
    assert.equal(blurProgress(source(0), { ...title(0), width: 0 }, state, 1.08), null);
    assert.equal(blurProgress(source(0), { ...title(0), left: viewportWidth + 2000 }, state, 1.08), null);
  }
});

test("the backdrop frame stays unfiltered and image blur is clipped inside its existing rounded boundary", () => {
  assert.match(css, /\.editor-backdrop \{ position: absolute; inset: 0; overflow: hidden;/);
  assert.match(css, /:is\(\.result-copy h2, \.result-copy p, \.editor-desktop, \.editor-app\) \{ filter: var\(--enter-filter\); \}/);
  assert.doesNotMatch(css, /\.editor-backdrop[^{}]*\{[^}]*(?<![-\w])filter:/);
  assert.doesNotMatch(css, /\.editor-(?:backdrop|desktop|composition)::(?:before|after)/);
  assert.ok(composition.includes("A focused editor with straightforward controls keeps your attention on the video you want to create."));
});

test("the staggered sharpening ranges stay ordered, bounded and reversible without time lag", () => {
  let previous = { title: 0, subtitle: 0, desktop: 0, app: 0 };
  for (let index = 0; index <= 100; index++) {
    const next = sharpness(index / 100);
    assert.ok(next.title >= next.subtitle && next.subtitle >= next.desktop && next.desktop >= next.app);
    for (const stage of Object.keys(next)) {
      assert.ok(next[stage] >= previous[stage] && next[stage] >= 0 && next[stage] <= 1);
      if (index === 100) assert.equal(next[stage], 1);
    }
    previous = next;
  }
  const p = page();
  const filters = () => ["title", "subtitle", "desktop", "app"].map(stage => p.sceneProperties.get(`--handoff-${stage}-filter`));
  p.scroll(734); p.flush(); const mid = filters();
  p.scroll(2000); p.flush(); assert.ok(filters().every(value => value === "none"));
  p.scroll(734); p.flush(); assert.deepEqual(filters(), mid);
  p.flush(); assert.deepEqual(filters(), mid, "Sharpness holds still when scrolling stops");
  assert.equal(p.frames.size, 0);
  p.scroll(-1000); p.flush(); assert.ok(filters().every(value => value === "blur(3px)"));
  p.scroll(5000); p.flush(); assert.ok(filters().every(value => value === "none"));
});

test("side wrappers compose exits with the original entrances and preserve the shared perspective", () => {
  for (const side of ["left", "right"]) {
    assert.match(html, new RegExp(`<div class="hero-side-slot hero-side-${side}">\\s*<div class="hero-result hero-result-${side}" aria-hidden="true" data-hero-entrance>`));
  }
  const entry = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference) {"), css.indexOf("@media (min-width: 560px)", css.indexOf("@keyframes hero-preview-in")));
  assert.doesNotMatch(entry, /hero-side-slot|--handoff-progress/);
  assert.match(css, /perspective: inherit; perspective-origin: calc\(50% - var\(--hero-exit-direction\) \* var\(--hero-side-distance, 100%\)\) calc\(50% \+ var\(--hero-perspective-y, 6px\)\)/);
  assert.match(css, /--hero-perspective-y: 4px/);
  for (const [width, sideUnits, centerUnits, paddingTop, paddingBottom] of [[860, 1, 1, 16, 28], [328, .72, 1.35, 12, 20]]) {
    const unit = (width - 8) / (sideUnits * 2 + centerUnits);
    const sideWidth = unit * sideUnits;
    const distance = (sideUnits + centerUnits) / (sideUnits * 2);
    const leftCamera = 4 + sideWidth * (.5 + distance);
    const rightStart = 4 + unit * (sideUnits + centerUnits);
    const rightCamera = rightStart + sideWidth * (.5 - distance);
    near(leftCamera, width / 2); near(rightCamera, width / 2);
    near((paddingBottom - paddingTop) / 2, width === 860 ? 6 : 4);
  }
});

test("the reveal observer cannot compete with scroll fades and unfocused static content stays accessible", () => {
  assert.match(composition, /<div class="result-copy">\s*<h2 id="result-title">Your app\. Your story\.<\/h2>/);
  const copy = composition.match(/<div class="result-copy">[\s\S]*?<\/div>/)[0];
  assert.doesNotMatch(copy, /reveal|aria-hidden|tabindex|<a\b|<button\b/);
  const scrollCSS = css.match(/@media \(prefers-reduced-motion: no-preference\) \{\n  \.apes-landing \.hero-preview-traveler[\s\S]*?\n\}/)[0];
  assert.doesNotMatch(css.replace(scrollCSS, ""), /--handoff-progress|\.is-handoff-ready/);
  assert.doesNotMatch(scrollCSS, /animation:|transition:/);
  assert.doesNotMatch(css, /\.editor-(?:desktop|app) \{[^}]*opacity:/);
  assert.match(css, /\.hero-side-slot \{[^}]*pointer-events: none;/);
});

test("reduced motion, invalid geometry, and no JavaScript retain a useful static composition", () => {
  const reduced = page({ reduced: true });
  assert.equal(reduced.classes.size, 0); assert.equal(reduced.properties.size, 0); assert.equal(reduced.reads(), 0);
  assert.equal(reduced.sceneProperties.size, 0);
  reduced.preference(false); reduced.flush(); assert.equal(reduced.classes.has("is-handoff-ready"), true);
  reduced.scroll(948); reduced.flush(); reduced.preference(true);
  assert.equal(reduced.properties.size, 0); assert.equal(reduced.classes.size, 0);
  assert.equal(reduced.sceneProperties.size, 0);
  const broken = page(); broken.scroll(948); broken.flush(); broken.fail(); broken.flush();
  assert.equal(broken.properties.size, 0); assert.equal(broken.classes.size, 0);
  assert.equal(broken.sceneProperties.size, 0);
  assert.match(css, /\.apes-landing \.is-handoff-ready \.editor-preview-static \{ visibility: hidden; \}/);
  assert.match(css, /\.editor-preview-static \{ width: 100%; height: 100%; object-fit: contain; \}/);
  const stage = composition.match(/<div class="result-media[^>]+>/)[0];
  assert.doesNotMatch(stage, /reveal|hidden|style="[^"]*(?:visibility|opacity)/);
});
