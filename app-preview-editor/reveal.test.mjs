import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [script, css] = await Promise.all([
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);
const source = script.slice(script.indexOf("const setupReveals ="), script.indexOf('document.querySelectorAll("[data-playback-toggle]")'));

function item(name, group = "section") {
  return {
    name, group, parent: null, visible: true, focused: false,
    base: { opacity: "1", filter: "none", transform: "none" },
    getClientRects() { return this.visible ? [{}] : []; },
    closest(selector) { return selector === ".product-story" || selector === ".story-copy" ? null : this.group; },
    matches(selector) { return selector === ":focus-within" ? this.focused : false; },
    contains(node) { for (let current = node; current; current = current.parent) if (current === this) return true; return false; },
  };
}

function page(items, { reduced = false, supported = true, brokenSetup = false, nested = null } = {}) {
  const animations = [], motionListeners = {}, documentListeners = {};
  let observer;
  const motion = { matches: reduced, addEventListener: (name, callback) => { motionListeners[name] = callback; } };
  const root = { matches: () => false, querySelectorAll: () => items };
  items.forEach(target => {
    if (target.unsupported) return;
    target.animate = (frames, options) => {
      if (target.broken) throw new Error("Animation unavailable");
      const listeners = {};
      const animation = {
        target, frames, options, canceled: false,
        addEventListener: (name, callback) => { listeners[name] = callback; },
        cancel() { this.canceled = true; listeners.cancel?.(); },
        finish() { listeners.finish?.(); },
      };
      animations.push(animation);
      return animation;
    };
  });
  if (nested) nested.parent = items[0];
  class IntersectionObserver {
    constructor(callback, options) { if (brokenSetup) throw new Error("Observer unavailable"); Object.assign(this, { callback, options, targets: new Set(), disconnected: false }); observer = this; }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
  }
  const window = { getComputedStyle: target => target.base };
  if (supported) window.IntersectionObserver = IntersectionObserver;
  vm.runInNewContext(source, {
    window, IntersectionObserver, motionPreference: motion,
    document: { querySelectorAll: () => [root], addEventListener: (name, callback) => { documentListeners[name] = callback; } },
  });
  return {
    observer, animations,
    enter: entries => observer.callback(entries.map(([target, isIntersecting = true]) => ({ target, isIntersecting }))),
    preference: value => { motion.matches = value; motionListeners.change?.(); },
    focus: target => documentListeners.focusin({ target }),
  };
}

test("only currently intersecting content units stagger in document order within their own section", () => {
  const heading = item("heading"), subtitle = item("subtitle"), media = item("media"), offscreen = item("offscreen"), other = item("other", "next-section");
  const p = page([heading, subtitle, media, offscreen, other]);
  p.enter([[media], [other], [subtitle], [offscreen, false], [heading]]);
  assert.deepEqual(p.animations.map(({ target }) => target.name), ["heading", "subtitle", "media", "other"]);
  assert.deepEqual(p.animations.map(({ options }) => options.delay), [0, 70, 140, 0]);
  assert.equal(p.observer.options.threshold, 0);
  p.enter([[heading], [offscreen]]);
  assert.equal(p.animations.length, 5);
  assert.equal(p.animations.at(-1).options.delay, 0, "A later viewport batch never waits for earlier siblings");
});

test("hidden mobile units and nested content do not consume stagger slots or double animate", () => {
  const details = item("details"), answer = item("answer"), hidden = item("hidden"), visible = item("visible");
  hidden.visible = false;
  const p = page([details, answer, hidden, visible], { nested: answer });
  assert.equal(p.observer.targets.has(answer), false);
  p.enter([[hidden], [visible]]);
  assert.equal(p.animations.length, 1);
  assert.equal(p.animations[0].options.delay, 0);
  hidden.visible = true; p.enter([[hidden]]);
  assert.equal(p.animations.length, 2);
  const many = Array.from({ length: 8 }, (_, index) => item(String(index)));
  const batch = page(many); batch.enter(many.map(target => [target]));
  assert.ok(batch.animations.every(({ options }) => options.delay <= 210 && options.duration === 480));
  const storyTitle = item("story title"), storyMedia = item("story media"), body = item("story body"), devices = item("story devices"), outside = item("outside copy");
  for (const target of [storyTitle, body, devices]) target.closest = selector => selector === ".product-story" || selector === ".story-copy" ? {} : target.group;
  storyMedia.closest = selector => selector === ".product-story" ? {} : selector === ".story-copy" ? null : storyMedia.group;
  storyMedia.matches = selector => selector === ".story-media";
  const stories = page([storyTitle, storyMedia, body, devices, outside]);
  assert.deepEqual([...stories.observer.targets].map(target => target.name), ["outside copy"], "The complete scroll-owned copy column and media never receive a second timed reveal");
});

test("blur and mild movement compose existing styles and leave no persistent blur or fill", () => {
  const target = item("icon");
  target.base = { opacity: ".6", filter: "invert(1)", transform: "matrix(1, 0, 0, 1, 0, 0)" };
  const p = page([target]); p.enter([[target]]);
  const { frames, options } = p.animations[0];
  assert.equal(frames[0].opacity, 0);
  assert.equal(frames[0].filter, "invert(1) blur(3px)");
  assert.equal(frames[0].transform, "matrix(1, 0, 0, 1, 0, 0) translateY(10px)");
  assert.equal(frames[1].opacity, ".6"); assert.equal(frames[1].filter, "invert(1)");
  assert.equal(frames[1].transform, target.base.transform);
  assert.equal(options.fill, "backwards");
  p.animations[0].finish(); p.enter([[target]]);
  assert.equal(p.animations.length, 1);
  assert.doesNotMatch(css, /^\.js \.reveal\s*\{/m);
  assert.match(css, /\.js body:not\(\.apes-landing\) \.reveal \{/);
});

test("keyboard focus cancels delayed entrances and already focused controls remain visible", () => {
  const title = item("title"), media = item("media"), focused = item("focused");
  focused.focused = true;
  const p = page([title, media, focused]); p.enter([[title], [media], [focused]]);
  assert.equal(p.animations.length, 2);
  p.focus({ parent: media });
  assert.equal(p.animations[1].canceled, true);
  assert.equal(p.animations[0].canceled, false);
});

test("reduced motion, missing APIs, or failures immediately retain the underlying visible content", () => {
  assert.equal(page([item("reduced")], { reduced: true }).observer, undefined);
  assert.equal(page([item("unsupported")], { supported: false }).observer, undefined);
  assert.equal(page([item("broken-setup")], { brokenSetup: true }).observer, undefined);
  const missing = item("missing"); missing.unsupported = true;
  const staticPage = page([missing]); staticPage.enter([[missing]]); assert.equal(staticPage.animations.length, 0);
  const first = item("first"), broken = item("broken"); broken.broken = true;
  const failed = page([first, broken]); failed.enter([[first], [broken]]);
  assert.equal(failed.animations[0].canceled, true); assert.equal(failed.observer.disconnected, true);
  const target = item("preference"); const live = page([target]); live.enter([[target]]); live.preference(true);
  assert.equal(live.animations[0].canceled, true); assert.equal(live.observer.disconnected, true);
  assert.doesNotMatch(source, /style\.setProperty|setTimeout|setInterval|\.hero-result|\.editor-app/);
});
