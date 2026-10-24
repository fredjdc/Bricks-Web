import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("script.js", import.meta.url), "utf8");

function page({ reduced = false, desktop = false } = {}) {
  const observers = [];
  const desktopListeners = {};
  const documentListeners = {};
  const media = { matches: desktop, addEventListener: (name, callback) => { desktopListeners[name] = callback; } };
  const video = (id, side = false) => {
    const listeners = {};
    const source = { dataset: { src: `${id}.mp4` }, removeAttribute() { delete this.dataset.src; } };
    return {
      id, paused: true, dataset: { startTime: "6" }, playCount: 0, loadCount: 0,
      parentElement: { querySelector: () => ({}) }, poster: "poster.jpg",
      getClientRects: () => [{}], hasAttribute: (name) => name === "data-autoplay-video" || (side && name === "data-hero-side"),
      querySelector: () => source.dataset.src ? source : null,
      addEventListener(name, callback) { listeners[name] = callback; },
      setAttribute() {},
      load() { this.loadCount++; listeners.loadedmetadata?.(); },
      play() { this.paused = false; this.playCount++; listeners.play?.(); return Promise.resolve(); },
      pause() { this.paused = true; listeners.pause?.(); },
      click() { listeners.click(); },
      key(key) { listeners.keydown({ key, preventDefault() {} }); },
    };
  };
  const left = video("left", true), center = video("finished-preview-video"), right = video("right", true), editor = video("editor");
  const hero = [left, center, right], videos = [...hero, editor];
  const document = {
    hidden: false, documentElement: { classList: { add() {} } }, querySelector: () => null,
    addEventListener: (name, callback) => { documentListeners[name] = callback; },
    querySelectorAll: (selector) => ({
      "video": videos, "[data-autoplay-video]": videos, "[data-playback-toggle]": [center, editor],
      ".hero-results video": hero, "[data-hero-side]": [left, right],
    })[selector] ?? [],
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
  }
  const window = { IntersectionObserver, matchMedia: (query) => query.includes("reduced-motion") ? { matches: reduced } : media };
  vm.runInNewContext(script, { document, window, IntersectionObserver });
  const intersect = (targets, isIntersecting) => observers.at(-1).callback(targets.map(target => ({ target, isIntersecting })));
  return { left, center, right, editor, hero, videos, document, documentListeners, media, desktopListeners, intersect };
}

test("mobile loads only the visible center; keyboard pause survives observer updates", () => {
  const p = page();
  p.intersect(p.hero, true);
  assert.equal(p.center.loadCount, 1);
  assert.equal(p.center.currentTime, 6);
  assert.equal(p.left.loadCount + p.right.loadCount + p.editor.loadCount, 0);
  p.center.key("Enter");
  assert.ok(p.hero.every(video => video.paused));
  p.intersect(p.hero, true);
  assert.ok(p.hero.every(video => video.paused));
  p.center.key(" ");
  assert.equal(p.center.paused, false);
  assert.equal(p.left.loadCount + p.right.loadCount, 0);
});

test("desktop pauses the group offscreen and when hidden; mobile keeps side posters", () => {
  const p = page({ desktop: true });
  p.intersect(p.hero, true);
  assert.ok(p.hero.every(video => !video.paused));
  p.intersect(p.hero, false);
  assert.ok(p.hero.every(video => video.paused));
  p.intersect(p.hero, true);
  p.document.hidden = true;
  p.documentListeners.visibilitychange();
  assert.ok(p.videos.every(video => video.paused));
  p.document.hidden = false;
  p.documentListeners.visibilitychange();
  assert.ok(p.hero.every(video => !video.paused));
  p.media.matches = false;
  p.desktopListeners.change();
  assert.equal(p.left.paused, true);
  assert.equal(p.right.paused, true);
  assert.equal(p.center.paused, false);
});

test("reduced motion keeps all media unloaded until explicitly played", () => {
  const p = page({ reduced: true });
  assert.ok(p.videos.every(video => video.paused && video.loadCount === 0));
  p.center.click();
  assert.equal(p.center.paused, false);
  assert.equal(p.center.loadCount, 1);
  assert.equal(p.left.loadCount + p.right.loadCount + p.editor.loadCount, 0);
});
