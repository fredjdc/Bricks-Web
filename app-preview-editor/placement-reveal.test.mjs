import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [script, css, html] = await Promise.all(["script.js", "styles.css", "index.html"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const helpers = script.slice(script.indexOf("const previewHandoff ="), script.indexOf("const setupPreviewHandoff ="));
const sectionHTML = html.match(/<section class="capabilities section"[\s\S]*?<\/section>/)[0];
const entrance = vm.runInNewContext(`${helpers}; placementEntrance`);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < .0001, `${actual} must equal ${expected}`);

function page({ stacked = false, reduced = false, missing = false } = {}) {
  let scroll = 0, broken = false;
  const classes = new Set(), events = {}, motion = { matches: reduced };
  const item = (top, left = 0, width = 300) => ({
    values: new Map(), focused: false, offsetTop: top, offsetLeft: left, offsetWidth: width,
    getBoundingClientRect() { return { top: top - scroll }; },
    matches() { return this.focused; },
    style: { setProperty(name, value) { this.values.set(name, value); }, removeProperty(name) { this.values.delete(name); } },
  });
  const copy = [item(980), item(1080)];
  const cards = Array.from({ length: 3 }, (_, index) => item(stacked ? index * 600 : 0, stacked ? 0 : index * 350));
  [...copy, ...cards].forEach(node => { node.style.values = node.values; });
  const grid = {
    getBoundingClientRect() { if (broken) throw new Error("Unavailable geometry"); return { width: stacked ? 300 : 1000, top: 1200 - scroll }; },
    querySelectorAll: () => cards,
  };
  const section = {
    querySelector: () => grid, querySelectorAll: () => copy,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    addEventListener: (name, callback) => { events[name] = callback; },
  };
  const controller = vm.runInNewContext(`${helpers}; createPlacementReveal()`, {
    document: { querySelector: () => missing ? null : section },
    window: { innerHeight: 800, getComputedStyle: () => ({ gridTemplateColumns: stacked ? "300px" : "300px 300px 300px" }) },
    motionPreference: motion,
  });
  const update = value => { scroll = value; controller.measure()(); };
  return { copy, cards, classes, controller, update,
    reduce(value) { motion.matches = value; update(scroll); },
    fail() { broken = true; update(scroll); },
    focus(index) { cards[index].focused = true; events.focusin(); },
  };
}

const value = (item, name) => item.values.get(`--placement-${name}`);
const snapshot = p => [...p.copy, ...p.cards].map(item => [...item.values]);

test("title then subtitle scrub opacity and blur as each enters, and reverse without timers", () => {
  const p = page();
  p.update(0);
  assert.ok([...p.copy, ...p.cards].every(item => value(item, "progress") === "0"));
  p.update(400);
  assert.ok(Number(value(p.copy[0], "progress")) > Number(value(p.copy[1], "progress")));
  assert.ok(Number(value(p.copy[1], "progress")) > 0);
  assert.equal(value(p.cards[0], "progress"), "0");
  const middle = snapshot(p);
  p.update(2000);
  for (const item of [...p.copy, ...p.cards]) {
    assert.equal(value(item, "progress"), "1");
    assert.equal(value(item, "filter"), "none");
  }
  p.update(400); assert.deepEqual(snapshot(p), middle);
  p.update(400); assert.deepEqual(snapshot(p), middle, "Stopped scroll never continues an animation");
});

test("whole desktop columns emerge from measured center, center first, then sides, to exact layout", () => {
  const p = page();
  p.update(0);
  const starts = p.cards.map(item => parseFloat(value(item, "x")));
  assert.deepEqual(starts, [350, 0, -350]);
  p.cards.forEach((item, index) => {
    near(item.offsetLeft + item.offsetWidth / 2 + starts[index], 500);
    near(Number(value(item, "scale")), index === 1 ? 1 : .9);
    assert.equal(value(item, "filter"), index === 1 ? "none" : "blur(3px)");
  });
  p.update(650);
  const progress = p.cards.map(item => Number(value(item, "progress")));
  assert.ok(progress[1] > progress[0] && progress[0] > progress[2] && progress[2] > 0);
  const mid = snapshot(p);
  p.update(1000);
  for (const item of p.cards) {
    assert.equal(value(item, "x"), "0px"); assert.equal(value(item, "y"), "0px");
    assert.equal(value(item, "scale"), "1"); assert.equal(value(item, "filter"), "none");
  }
  p.update(650); assert.deepEqual(snapshot(p), mid);
});

test("stacked mobile cards reveal from their own position without lateral travel or offscreen delays", () => {
  const p = page({ stacked: true });
  p.update(650);
  assert.ok(Number(value(p.cards[0], "progress")) > 0);
  assert.equal(value(p.cards[1], "progress"), "0"); assert.equal(value(p.cards[2], "progress"), "0");
  const first = value(p.cards[0], "progress");
  p.update(1250); near(Number(value(p.cards[1], "progress")), Number(first));
  p.update(1850); near(Number(value(p.cards[2], "progress")), Number(first));
  for (const item of p.cards) {
    assert.equal(value(item, "x"), "0px");
    assert.ok(parseFloat(value(item, "y")) <= 12);
  }
});

test("reduced motion, missing section, geometry failure and no JS retain visible static content", () => {
  const p = page({ reduced: true }); p.update(0);
  assert.equal(p.classes.size, 0); assert.ok([...p.copy, ...p.cards].every(item => item.values.size === 0));
  p.reduce(false); assert.ok(p.classes.has("is-placement-ready"));
  p.reduce(true); assert.equal(p.classes.size, 0);
  const broken = page(); broken.update(650); broken.fail();
  assert.equal(broken.classes.size, 0); assert.ok([...broken.copy, ...broken.cards].every(item => item.values.size === 0));
  const missing = page({ missing: true }); assert.doesNotThrow(() => missing.update(0));
  const motionCSS = css.match(/@media \(prefers-reduced-motion: no-preference\) \{\n  \.apes-landing #features.is-placement-ready[\s\S]*?\n\}/)[0];
  assert.doesNotMatch(css.replace(motionCSS, ""), /is-placement-ready/);
  assert.doesNotMatch(motionCSS, /animation:|transition:|will-change:/);
  assert.doesNotMatch(sectionHTML, /\breveal\b|aria-hidden|tabindex|style=/);
});

test("keyboard focus immediately shows an entire column and its content", () => {
  const p = page(); p.update(0); p.focus(2);
  assert.equal(value(p.cards[2], "progress"), "1");
  assert.equal(value(p.cards[2], "scale"), "1");
  assert.equal(value(p.cards[2], "x"), "0px");
  assert.equal(value(p.cards[2], "filter"), "none");
  assert.equal(value(p.cards[0], "progress"), "0");
});

test("reveal math is bounded at varied viewport sizes and placement transforms have one owner", () => {
  for (const viewport of [320, 800, 1440]) {
    let previous = 0;
    for (let top = viewport * 2; top >= -viewport; top -= viewport / 100) {
      const progress = entrance(top, viewport, .16);
      assert.ok(progress >= previous && progress >= 0 && progress <= 1);
      previous = progress;
    }
    assert.equal(previous, 1);
  }
  assert.match(css, /\.apes-landing \.capability-grid \{ position: relative;/);
  assert.match(css, /\.capability-grid > article \{ z-index: 1; transform: translate\(var\(--placement-x\), var\(--placement-y\)\) scale\(var\(--placement-scale\)\);/);
  assert.equal((script.match(/window.addEventListener\("scroll", schedule/g) || []).length, 1);
  assert.ok(script.includes("const paintPlacements = placements.measure();"));
  assert.ok(script.includes("finally {\n      paintPlacements();"));
  assert.doesNotMatch(helpers, /setTimeout|setInterval|requestAnimationFrame|\.animate\(/);
  assert.match(sectionHTML, /<h3>Give a reason to look\.<\/h3>/);
  assert.match(sectionHTML, /<h3>Set the scene\.<\/h3>/);
  assert.match(sectionHTML, /Show how your app works, give your product page a visual identity, or introduce an upcoming event\.<\/p>/);
});


test("the center stays fully opaque, sharp, full size and foremost during entry, exit and reversal", () => {
  for (const stacked of [false, true]) {
    const p = page({ stacked });
    for (const scroll of [0, 500, 650, 1000, 2400, 650, 0]) {
      p.update(scroll);
      const center = p.cards[1];
      assert.equal(value(center, "opacity"), "1");
      assert.equal(value(center, "filter"), "none");
      assert.equal(value(center, "scale"), "1");
      assert.equal(value(center, "x"), "0px");
      assert.equal(value(center, "y"), "0px");
      for (const side of [p.cards[0], p.cards[2]]) near(Number(value(side, "opacity")), Number(value(side, "progress")));
    }
  }
  assert.match(css, /\.capability-grid \{ isolation: isolate; \}/);
  assert.match(css, /\.capability-grid > article:nth-child\(2\) \{ z-index: 2; opacity: 1; background: var\(--bg\); \}/);
  assert.doesNotMatch(css, /#features\.is-placement-ready[^{}]*\.capability-grid \{[^}]*(?<![-\w])opacity:/);
});

test("placement blur excludes every card boundary and frame, while image pixels clip to the square rounded frame", () => {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([, selector, declarations]) => selector.includes("#features.is-placement-ready") && /(?<![-\w])filter:/.test(declarations));
  for (const [, selector] of rules) {
    assert.doesNotMatch(selector, /article\s*[,)]|article\s*$|\.capability-media\s*[,)]|\.capability-media\s*$/);
  }
  assert.match(css, /\.capability-media > img\) \{ filter: var\(--placement-filter\);/);
  assert.match(css, /\.apes-landing \.capability-media \{[^}]*aspect-ratio: 1; overflow: hidden;[^}]*border: 1px solid var\(--border\); border-radius: 24px; background: var\(--surface-muted\);/);
  assert.doesNotMatch(css, /(?:#features|\.capability-(?:grid|media))::(?:before|after)\s*\{/);
  const headingAndGrid = sectionHTML.match(/<div class="shell">([\s\S]*)/)[1];
  assert.doesNotMatch(headingAndGrid, /class="[^"]*reveal[^"]*"|style="[^"]*opacity/);
});
