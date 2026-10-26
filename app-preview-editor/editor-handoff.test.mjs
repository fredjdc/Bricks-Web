import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [html, css, script] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
]);
const composition = html.match(/<section class="result-section section shell"[\s\S]*?<\/section>/)[0];
const handoffScript = script.slice(script.indexOf("const previewHandoff ="));
const geometry = vm.runInNewContext(`${handoffScript.slice(0, handoffScript.indexOf("const setupPreviewHandoff ="))}; previewHandoff`);
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
  const middle = geometry(source(1100), target(1100), 800, 1.08);
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

function page({ reduced = false } = {}) {
  let scroll = 0, targetWidth = 140, targetHeight = 300, broken = false, reads = 0;
  const listeners = {}, motionListeners = {}, frames = new Map(), properties = new Map(), classes = new Set(), imageListeners = [];
  const traveler = { style: { setProperty: (name, value) => properties.set(name, value), removeProperty: name => properties.delete(name) } };
  const origin = {
    querySelector: selector => selector === ".hero-preview-traveler" ? traveler : null,
    getBoundingClientRect() { reads++; if (broken) throw new Error("Missing geometry"); return rect(500, 1000, 300, 650, scroll); },
  };
  const target = { getBoundingClientRect: () => rect(540, 2000, targetWidth, targetHeight, scroll) };
  const composition = {
    querySelector: () => target,
    querySelectorAll: () => [0, 1, 2].map(() => ({ addEventListener: (name, callback) => imageListeners.push([name, callback]) })),
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
  };
  const motion = { matches: reduced, addEventListener: (name, callback) => { motionListeners[name] = callback; } };
  const window = {
    innerHeight: 800,
    getComputedStyle: () => ({ getPropertyValue: () => "1.08" }),
    addEventListener: (name, callback, options) => { listeners[name] = { callback, options }; },
  };
  let nextFrame = 0;
  vm.runInNewContext(handoffScript, {
    window, motionPreference: motion,
    document: { querySelector: selector => ({ "[data-hero-preview-origin]": origin, "[data-editor-composition]": composition })[selector] },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
  });
  return {
    properties, classes, frames, listeners, imageListeners, origin,
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
  p.scroll(1100); p.scroll(1100);
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

test("reduced motion, invalid geometry, and no JavaScript retain a useful static composition", () => {
  const reduced = page({ reduced: true });
  assert.equal(reduced.classes.size, 0); assert.equal(reduced.properties.size, 0); assert.equal(reduced.reads(), 0);
  reduced.preference(false); reduced.flush(); assert.equal(reduced.classes.has("is-handoff-ready"), true);
  reduced.scroll(1100); reduced.flush(); reduced.preference(true);
  assert.equal(reduced.properties.size, 0); assert.equal(reduced.classes.size, 0);
  const broken = page(); broken.scroll(1100); broken.flush(); broken.fail(); broken.flush();
  assert.equal(broken.properties.size, 0); assert.equal(broken.classes.size, 0);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.apes-landing \.hero-preview-traveler \{[^}]+\}\s*\.apes-landing \.editor-composition\.is-handoff-ready \.editor-preview-static \{ visibility: hidden; \}\s*\}/);
  assert.match(css, /\.editor-preview-static \{ width: 100%; height: 100%; object-fit: contain; \}/);
  const stage = composition.match(/<div class="result-media[^>]+>/)[0];
  assert.doesNotMatch(stage, /reveal|hidden|style="[^"]*(?:visibility|opacity)/);
});
