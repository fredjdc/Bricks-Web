import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths, declarations, rules } from "./responsive-checkpoints.mjs";

const [html, css, module] = await Promise.all(["index.html", "wind-files.css", "wind-files.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const { WIND, WIND_FILES, makeWindFiles, windLayout, windPose, mountWindFiles } = vm.runInNewContext(
  module.slice(module.indexOf("const WIND ="), module.indexOf('if (typeof document !==')) + "; ({ WIND, WIND_FILES, makeWindFiles, windLayout, windPose, mountWindFiles })");
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const duration = 1 - (WIND.count - 1) * WIND.stagger;
const rect = (left, top, width, height) => ({ left, top, width, height });
const shift = (box, scroll) => ({ ...box, top: box.top - scroll });
const fixtures = widths.map(width => {
  const shell = Math.min(1180, width - (width < 560 ? 32 : 48));
  return { viewport: { width, height: width < 560 ? 700 : 900 },
    source: rect((width - shell) / 2, 1000, shell, shell * 9 / 16), title: rect(40, 1900, width - 80, 80),
    target: rect(width < 900 ? 40 : 100, 2200, width < 900 ? width - 80 : 600, width < 900 ? (width - 80) / 1.6 : 375) };
});
const at = (g, index, p) => windPose({ ...g, progress: WIND_FILES[index].delay + duration * p }, index);

test("the current baseline gains twelve supplied icons, with no restored lane-based transfer", async () => {
  const overlay = html.match(/<div class="wind-files"[^>]*>[\s\S]*?<\/div>/)[0];
  assert.match(overlay, /data-wind-files aria-hidden="true" hidden/);
  for (const kind of ["video", "image", "audio"]) {
    assert.equal((overlay.match(new RegExp(`data-wind-file="${kind}"`, "g")) || []).length, 4);
    const png = await readFile(new URL(`assets/icons/${kind}file.png`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 1254); assert.equal(png.readUInt32BE(20), 1254);
  }
  assert.equal((overlay.match(/<img\b/g) || []).length, 12);
  assert.doesNotMatch(overlay, /tabindex|<button|<a\b|<svg|\breveal\b/);
  assert.match(html, /src="wind-files\.js\?v=[^"]+" defer/);
  assert.doesNotMatch(html, /file-transfer|data-transfer-file/);
  assert.doesNotMatch(module.replace(/\/\/[^\n]*/g, ""), /lane|corridor|fileTransfer|Math\.random|Date\.|performance\.now|setTimeout|setInterval/);
});

test("seeded phases and normalized origins/landings are stable and spread across both axes", () => {
  assert.equal(WIND_FILES.length, 12);
  assert.deepEqual(makeWindFiles(), makeWindFiles());
  assert.deepEqual(makeWindFiles(), WIND_FILES);
  assert.notDeepEqual(makeWindFiles(123), WIND_FILES);
  for (const key of ["origin", "target"]) {
    const points = WIND_FILES.map(file => file[key]);
    assert.ok(Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)) > .7);
    assert.ok(Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)) > .5);
  }
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title); assert.ok(g);
    WIND_FILES.forEach((file, index) => {
      const start = at(g, index, 0), end = at(g, index, 1), padding = g.size * .8 + 8;
      for (const [point, box] of [[start, source], [end, target]]) {
        assert.ok(point.x - g.size * .72 >= box.left && point.x + g.size * .72 <= box.left + box.width);
        assert.ok(point.y - g.size * .72 >= box.top && point.y + g.size * .72 <= box.top + box.height);
      }
      near((start.x - source.left - padding) / (source.width - 2 * padding), file.origin.x);
      near((end.y - target.top - padding) / (target.height - 2 * padding), file.target.y);
      assert.equal(start.opacity, 0); assert.equal(end.opacity, 0);
    });
  }
});

test("real trajectory math sways in both directions, with restrained, varied leaf angles", () => {
  const fixture = fixtures.find(({ viewport }) => viewport.width === 1440), g = windLayout(fixture.source, fixture.target, fixture.viewport);
  let reversingTrajectories = 0;
  const midAngles = [];
  WIND_FILES.forEach((_, index) => {
    let last, lastSway, sign = 0, swaySign = 0, reversals = 0, swayReversals = 0;
    for (let p = .02; p < .98; p += .01) {
      const value = at(g, index, p);
      if (last !== undefined) {
        const next = Math.sign(value.x - last), nextSway = Math.sign(value.sway - lastSway);
        if (sign && next !== sign) reversals++;
        if (swaySign && nextSway !== swaySign) swayReversals++;
        sign = next; swaySign = nextSway;
      }
      last = value.x; lastSway = value.sway;
      assert.ok(Math.abs(value.rotation) <= 16 && Math.abs(value.tilt) <= 11);
      assert.ok(value.scale >= .80 && value.scale <= .98);
    }
    assert.ok(swayReversals >= 2);
    if (reversals) reversingTrajectories++;
    midAngles.push(at(g, index, .5).rotation);
  });
  assert.ok(reversingTrajectories >= 6);
  assert.ok(Math.max(...midAngles) - Math.min(...midAngles) > 8);
});

test("early, mid and late frames remain distributed without any common routing column", () => {
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title);
    for (const progress of [.25, .5, .75]) {
      const values = WIND_FILES.map((_, index) => windPose({ ...g, progress }, index));
      assert.ok(Math.max(...values.map(v => v.x)) - Math.min(...values.map(v => v.x)) > Math.min(source.width, target.width) * .2);
      assert.equal(new Set(values.map(value => value.x)).size, 12);
      for (const value of values) assert.ok(value.x - g.size * .72 >= 0 && value.x + g.size * .72 <= viewport.width);
    }
  }
});

test("scroll is the only clock: exact opacity phases, coherent reverse, resize and downward anchors", () => {
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title);
    const firstScroll = source.top + source.height * WIND.sourceAnchor - viewport.height * WIND.startLine;
    const lastScroll = target.top + target.height * WIND.targetAnchor - viewport.height * WIND.finishLine;
    near(windLayout(shift(source, firstScroll), shift(target, firstScroll), viewport).progress, 0);
    near(windLayout(shift(source, lastScroll), shift(target, lastScroll), viewport).progress, 1);
    assert.ok(WIND.finishLine > WIND.startLine);
    WIND_FILES.forEach((file, index) => {
      assert.equal(at(g, index, 0).opacity, 0); assert.equal(at(g, index, 1).opacity, 0);
      assert.equal(at(g, index, .5).opacity, 1);
      const original = at(g, index, .43); at(g, index, .9); assert.deepEqual(at(g, index, .43), original);
      const normalized = (g.paths[index].end.x - target.left - (g.size * .8 + 8)) / (target.width - (g.size * .8 + 8) * 2);
      near(normalized, file.target.x);
    });
  }
  assert.equal(windLayout(rect(0, 0, 0, 10), fixtures[0].target, fixtures[0].viewport), null);
});

test("every icon has one fade-in, an uninterrupted opaque cruise and one fade-out at all responsive sizes", () => {
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title);
    WIND_FILES.forEach((file, index) => {
      let previous = 0;
      for (let step = 0; step <= 1000; step++) {
        const q = step / 1000, value = at(g, index, q).opacity;
        if (step === 0 || step === 1000) assert.equal(value, 0);
        else assert.ok(value > 0, "No interior disappearance");
        if (q >= .12 && q <= .78) assert.equal(value, 1);
        if (q <= .12) assert.ok(value >= previous - 1e-9);
        if (q > .78) assert.ok(value <= previous + 1e-9);
        const reversed = at(g, index, 1 - (1000 - step) / 1000).opacity;
        near(value, reversed);
        previous = value;
      }
    });
  }
  assert.doesNotMatch(module, /windClearance|protectedRects|obstacles/);
  assert.doesNotMatch(css, /mix-blend-mode:/, "File colors retain their original rendering");
});

test("each file retains strong blur until approaching the measured title, then clears monotonically through it", () => {
  assert.ok(WIND.entranceBlur >= 16);
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title);
    WIND_FILES.forEach((file, index) => {
      const path = g.paths[index], range = path.blurRange, travel = path.end.y - path.start.y;
      const approach = Math.max(WIND.blurApproachMinPx, Math.min(WIND.blurApproachMaxPx, viewport.height * WIND.blurApproachViewport));
      near(path.start.y + range.start * travel, title.top - approach);
      near(path.start.y + range.end * travel, title.top + title.height * WIND.blurClearTitleFraction);
      assert.ok(range.start > .22, "Sharpening no longer starts during the initial opacity fade");
      near(at(g, index, 0).blur, WIND.entranceBlur);
      near(at(g, index, range.start).blur, WIND.entranceBlur);
      near(at(g, index, (range.start + range.end) / 2).blur, WIND.entranceBlur / 2);
      assert.ok(Math.abs(at(g, index, range.start).y - (title.top - approach)) <= g.motionSize * .18);
      assert.ok(Math.abs(at(g, index, range.end).y - (title.top + title.height * .5)) <= g.motionSize * .18);
      let previous = WIND.entranceBlur;
      for (let step = 0; step <= 100; step++) {
        const q = step / 100, value = at(g, index, q).blur;
        assert.ok(value >= 0 && value <= previous + 1e-9);
        if (q >= range.end) assert.equal(value, 0);
        near(at(g, index, 1 - (100 - step) / 100).blur, value);
        previous = value;
      }
      assert.ok(at(g, index, .06).blur > WIND.entranceBlur * .75);
      assert.equal(windPose({ ...g, progress: file.delay }, index).blur, WIND.entranceBlur);
      const resized = windLayout(source, target, { ...viewport, width: viewport.width + 20 }, title);
      near(at(resized, index, .1).blur, at(g, index, .1).blur);
      const movedTitle = windLayout(source, target, viewport, { ...title, top: title.top + 50 });
      assert.ok(movedTitle.paths[index].blurRange.start > range.start);
      const tallerTitle = windLayout(source, target, viewport, { ...title, height: title.height * 2 });
      near(tallerTitle.paths[index].blurRange.start, range.start);
      assert.ok(tallerTitle.paths[index].blurRange.end > range.end);
      const shortViewport = windLayout(source, target, { ...viewport, height: 500 }, title);
      assert.ok(shortViewport.paths[index].blurRange.start >= range.start);
      near(shortViewport.paths[index].blurRange.end, range.end);
      const shifted = windLayout(shift(source, 300), shift(target, 300), viewport, shift(title, 300));
      near(shifted.paths[index].blurRange.start, range.start); near(shifted.paths[index].blurRange.end, range.end);
    });
  }
  assert.match(css, /filter: blur\(var\(--wind-blur, 0px\)\) drop-shadow\(0 5px 8px rgba\(0, 0, 0, \.22\)\)/);
  assert.doesNotMatch(css, /box-shadow:/);
  const layer = rules(390, false, css).find(rule => rule.selector === ".wind-files");
  assert.match(layer.body, /overflow: visible/);
  assert.doesNotMatch(layer.body, /contain:[^;]*paint|overflow: (?:hidden|clip)/);
  const missingTitle = windLayout(fixtures[0].source, fixtures[0].target, fixtures[0].viewport);
  assert.equal(at(missingTitle, 0, .1).blur, 0, "Missing title geometry keeps files sharp");
});

test("wind artwork passes in front of section text while navigation stays above it and input passes through", () => {
  const overlay = html.match(/<div class="wind-files"[^>]*>/)[0];
  assert.match(overlay, /aria-hidden="true"/);
  assert.match(css, /\.wind-files, \.wind-files \* \{ pointer-events: none;/);
  for (const width of widths) for (const reduced of [false, true]) {
    const layer = rules(width, reduced, css).find(rule => rule.selector === ".wind-files");
    const windZ = +layer.body.match(/z-index:\s*(\d+)/)[1];
    const text = declarations(width, [".workflow-heading", ".workflow-step", "#workflow .workflow-step",
      ".workflow-step > h3", ".workflow-step > p", ".apes-landing #workflow :is(.workflow-heading, .workflow-step > h3, .workflow-step > p)"], reduced);
    assert.ok(windZ > +(text["z-index"] || 0));
    assert.ok(+declarations(width, [".site-header", ".apes-landing .site-header"], reduced)["z-index"] > windZ);
    assert.ok(+declarations(width, [".skip-link"], reduced)["z-index"] > windZ);
  }
});

function page({ reduced = false, desktop = true, observer = true } = {}) {
  let scroll = 0, active = true;
  const events = {}, frames = [], changes = [], protectedNodes = [], observed = [], items = WIND_FILES.map(() => ({ style: { values: {}, opacity: "0", setProperty(name, value) { this.values[name] = value; } } }));
  const overlay = { hidden: true, style: { setProperty() {} }, querySelectorAll: () => items };
  const source = { box: rect(70, 1000, 850, 480), getBoundingClientRect() { return shift(this.box, scroll); }, addEventListener() {} };
  const video = box => ({ box, dataset: { workflowActive: "true" }, closest: () => ({ classList: { contains: () => active } }),
    getClientRects: () => [{}], getBoundingClientRect() { return shift(this.box, scroll); }, addEventListener() {} });
  const wide = video(rect(100, 2200, 600, 375)), narrow = video(rect(40, 2400, 310, 194));
  const title = { getBoundingClientRect: () => shift(rect(70, 1900, 850, 80), scroll) };
  const motion = { matches: reduced, addEventListener(name, fn) { this.change = fn; } };
  const screen = { matches: desktop, addEventListener(name, fn) { this.change = fn; } };
  const doc = {
    querySelector: selector => ({ "[data-wind-files]": overlay, ".editor-desktop": source, "#workflow-import-video": wide, "#workflow .workflow-heading": title,
      '#workflow [data-workflow-video="assets/drop-demo.mp4"] .mobile-workflow-media': narrow })[selector],
    querySelectorAll: () => protectedNodes,
  };
  const win = { innerWidth: 1024, innerHeight: 800, matchMedia: query => query.includes("reduced-motion") ? motion : screen,
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; }, addEventListener: (name, fn, options) => { events[name] = { fn, options }; },
    MutationObserver: !observer ? undefined : class { constructor(fn) { changes.push(fn); } observe(node, options) { observed.push([node, options]); } } };
  const controller = mountWindFiles(doc, win);
  const flush = () => { while (frames.length) frames.shift()(); };
  return { overlay, items, source, wide, narrow, observed, events, frames, controller, flush, notify: () => changes[0](),
    scroll(value) { scroll = value; events.scroll?.fn(); flush(); },
    resize(width) { win.innerWidth = width; source.box.width = width - 80; events.resize.fn(); flush(); },
    reduce(value) { motion.matches = value; motion.change(); flush(); },
    mobile() { screen.matches = false; screen.change(); flush(); },
    edit(value) { active = !value; wide.dataset.workflowActive = value ? "false" : "true"; changes[0](); flush(); },
  };
}
const snapshot = p => p.items.map(item => [item.style.opacity, { ...item.style.values }]);

test("the controller clears blur near the title, preserves its shadow and restores blur on reverse", () => {
  const p = page();
  p.scroll(1000);
  const blurred = p.items.map(item => item.style.values["--wind-blur"]);
  assert.ok(blurred.every(value => value === "18px"));
  p.scroll(1700);
  assert.ok(p.items.every(item => item.style.values["--wind-blur"] === "0px"));
  p.scroll(1000);
  assert.deepEqual(p.items.map(item => item.style.values["--wind-blur"]), blurred);
  p.resize(768);
  assert.deepEqual(p.items.map(item => item.style.values["--wind-blur"]), blurred);
});

test("the isolated controller reverses, remeasures and follows actual Import/Edit state", () => {
  const p = page(); assert.equal(p.overlay.hidden, true);
  p.scroll(1200); assert.equal(p.overlay.hidden, false); const original = snapshot(p);
  p.scroll(4000); assert.equal(p.overlay.hidden, true);
  p.scroll(1200); assert.deepEqual(snapshot(p), original);
  p.controller.update(); assert.deepEqual(snapshot(p), original);
  p.notify(); p.notify(); assert.equal(p.overlay.hidden, false); assert.equal(p.frames.length, 1); p.flush();
  p.resize(768); assert.notDeepEqual(snapshot(p), original);
  p.edit(true); assert.equal(p.overlay.hidden, true);
  p.edit(false); assert.equal(p.overlay.hidden, false);
  const wide = snapshot(p); p.mobile(); assert.notDeepEqual(snapshot(p), wide);
  assert.equal(p.observed.length, 2); assert.equal(p.events.scroll.options.passive, true);
});

test("reduced motion, missing capabilities and invalid geometry keep the overlay hidden", () => {
  const reduced = page({ reduced: true }); assert.equal(reduced.overlay.hidden, true);
  reduced.reduce(false); reduced.scroll(1200); assert.equal(reduced.overlay.hidden, false);
  reduced.reduce(true); assert.equal(reduced.overlay.hidden, true);
  const missing = page({ observer: false }); assert.equal(missing.controller, undefined); assert.equal(missing.overlay.hidden, true);
  const invalid = page(); invalid.source.box.width = 0; invalid.scroll(1200); assert.equal(invalid.overlay.hidden, true);
  assert.match(css, /\.wind-files\[hidden\] \{ display: none !important;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /pointer-events: none; user-select: none;/);
  assert.match(css, /position: fixed; inset: 0;/);
  assert.doesNotMatch(css, /animation:|transition:/);
  assert.doesNotMatch(module, /\.play\(|\.pause\(|currentTime\s*=|heroSpacing|previewHandoff/);
});


test("only the rendered wind footprint doubles at every width; sway, flutter and per-file scales keep their original units", () => {
  for (const { source, target, viewport, title } of fixtures) {
    const g = windLayout(source, target, viewport, title);
    const previousSize = Math.max(28, Math.min(40, viewport.width * .045));
    near(g.size, previousSize * 2); near(g.motionSize, previousSize);
    for (let step = 0; step <= 100; step++) WIND_FILES.forEach((_, index) => {
      const value = windPose({ ...g, progress: step / 100 }, index);
      assert.ok(value.x - g.size * .72 >= 0 && value.x + g.size * .72 <= viewport.width);
    });
    WIND_FILES.forEach((file, index) => {
      near(g.paths[index].amplitude, Math.min(56, previousSize * file.amplitude, source.width * .08, target.width * .08));
      for (const p of [.2, .5, .8]) {
        const pose = at(g, index, p), wave = Math.PI * 2 * file.cycles * p + file.phase;
        const baseY = g.paths[index].start.y + (g.paths[index].end.y - g.paths[index].start.y) * p;
        near(pose.y - baseY, Math.sin(wave * .8) * previousSize * .18 * Math.sin(Math.PI * p));
        near(pose.scale, file.scale + Math.sin(Math.PI * p) * .08);
      }
    });
  }
  assert.match(css, /width: var\(--wind-size, 64px\); height: var\(--wind-size, 64px\);/);
});
