import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths, declarations as decl } from "./responsive-checkpoints.mjs";

const [script, html] = await Promise.all(["script.js", "index.html"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const source = script.slice(script.indexOf("const workflowPinLayout ="), script.indexOf("const observedVideos ="));
const layout = vm.runInNewContext(`${source.slice(0, source.indexOf("const setupWorkflow ="))}; workflowPinLayout`);

function workflow({ reduced = false, desktop = true, height = 900, cardHeight = 550 } = {}) {
  const node = extra => {
    const listeners = {}, attributes = {}, classes = new Set(), values = new Map();
    return Object.assign({ attributes, classes, style: { values, setProperty: (name, value) => values.set(name, value), removeProperty: name => values.delete(name) },
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) },
      addEventListener(name, fn) { (listeners[name] ??= []).push(fn); }, emit(name) { listeners[name]?.forEach(fn => fn()); },
      setAttribute(name, value) { attributes[name] = value; }, removeAttribute(name) { delete attributes[name]; },
    }, extra);
  };
  const motion = node({ matches: reduced }), screen = node({ matches: desktop });
  const images = [node({ complete: true, naturalWidth: 1449 }), node({ complete: true, naturalWidth: 1200 })];
  const frames = images.map(image => node({ querySelector: () => image })), steps = [node(), node()], phases = [node(), node()];
  const media = { querySelectorAll: selector => selector === ".workflow-frame" ? frames : phases };
  let scroll = 0;
  const card = { getBoundingClientRect: () => ({ height: cardHeight }) };
  const section = node({ querySelector: selector => selector === ":scope > .shell" ? card : media, getBoundingClientRect: () => ({ top: 2000 - scroll }) });
  const header = { getBoundingClientRect: () => ({ height: 66 }) }, pending = new Map();
  let next = 0;
  const win = node({ innerHeight: height, get scrollY() { return scroll; },
    requestAnimationFrame: fn => { pending.set(++next, fn); return next; },
    matchMedia: () => screen, getComputedStyle: node => node === header ? { top: "16px" } : { paddingBottom: "104px" },
  });
  Object.defineProperty(win, "scrollY", { get: () => scroll });
  const flush = () => { const work = [...pending.values()]; pending.clear(); work.forEach(fn => fn()); };
  win.scrollTo = options => { win.lastScroll = options; scroll = options.top; win.emit("scroll"); flush(); };
  vm.runInNewContext(source, { motionPreference: motion, window: win,
    document: { querySelector: selector => selector === "#workflow" ? section : header, querySelectorAll: () => steps } });
  const start = () => 2000 - parseFloat(section.style.values.get("--workflow-pin-top"));
  const distance = () => parseFloat(section.style.values.get("--workflow-pin-distance"));
  return { images, frames, steps, phases, motion, screen, section, win, pending, flush, start, distance,
    scroll(progress) { scroll = start() + distance() * progress; win.emit("scroll"); flush(); },
    resize(value, content = cardHeight) { win.innerHeight = value; cardHeight = content; win.emit("resize"); flush(); } };
}

test("the full card pins below the navbar and progress switches media/copy together in both directions", () => {
  const p = workflow(); assert.ok(p.section.classes.has("is-workflow-pinned"));
  assert.equal(p.section.style.values.get("--workflow-pin-top"), "98px");
  assert.equal(p.section.style.values.get("--workflow-pin-distance"), "810px");
  for (const progress of [-1, 0, .49, .5, .9, 2, .49, 0]) {
    p.scroll(progress); const index = progress < .5 ? 0 : 1;
    assert.ok(p.frames[index].classList.contains("is-active"));
    assert.equal(p.phases[index].attributes["aria-current"], "step");
    assert.equal(p.steps[index].attributes["aria-hidden"], "false");
    assert.equal(p.steps[1 - index].attributes["aria-hidden"], "true");
  }
  for (const width of widths) {
    const pinned = decl(width, [".apes-landing #workflow.is-workflow-pinned > .shell"]);
    assert.equal(pinned.position, width >= 900 ? "sticky" : undefined);
    assert.equal(decl(width, [".apes-landing #workflow .workflow-media"]).position, "static");
    assert.equal(decl(width, [".apes-landing #workflow .workflow-media"]).display, "none");
    assert.equal(decl(width, [".apes-landing #workflow .mobile-workflow-media-wrap"]).display, "block");
    if (width >= 900) {
      assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned"])["min-height"], "calc(var(--workflow-pin-card-height) + var(--workflow-pin-distance) + var(--workflow-pin-bottom-space))");
      assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned .workflow-layout"])["align-items"], "center");
      assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned .workflow-frames"])["grid-area"], "2 / 1");
      assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned .workflow-steps"])["grid-area"], "2 / 2");
      assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned .workflow-progress"])["grid-area"], "1 / 1");
    }
  }
});

test("late image loading cannot commit a stale reverse-scroll request", () => {
  const p = workflow(); p.images[1].complete = false;
  p.scroll(.75); assert.ok(p.frames[0].classList.contains("is-active"));
  p.scroll(.25); p.images[1].complete = true; p.images[1].emit("load"); p.flush();
  assert.ok(p.frames[0].classList.contains("is-active"));
  p.images[1].naturalWidth = 0; p.scroll(.75); assert.ok(p.frames[0].classList.contains("is-active"));
  p.images[1].naturalWidth = 1200; p.images[1].emit("load"); p.flush();
  assert.ok(p.frames[1].classList.contains("is-active"));
});

test("mobile, reduced motion and short viewports unpin, expose all copy, and can resume a fitting presentation", () => {
  for (const options of [{ desktop: false }, { reduced: true }, { height: 600 }]) {
    const p = workflow(options); assert.equal(p.section.classes.has("is-workflow-pinned"), false);
    assert.ok(p.steps.every(step => step.attributes["aria-hidden"] === undefined));
    assert.equal(p.section.style.values.size, 0);
  }
  const p = workflow(); p.scroll(.75); p.motion.matches = true; p.motion.emit("change");
  assert.equal(p.section.classes.has("is-workflow-pinned"), false);
  p.motion.matches = false; p.motion.emit("change"); assert.ok(p.frames[1].classList.contains("is-active"));
  p.resize(600); assert.equal(p.section.classes.has("is-workflow-pinned"), false);
  p.resize(900); assert.ok(p.section.classes.has("is-workflow-pinned"));
  for (const width of [899, 900, 901, 1199, 1200, 1201, 1920]) for (const height of [320, 480, 600, 768, 900, 1080]) for (const card of [420, 550, 700]) {
    const pin = layout(card, height, 82, 104);
    assert.equal(!!pin, 98 + card + 24 <= height);
    if (pin) {
      const outerTopAtRelease = pin.top - pin.distance;
      const cardBottom = pin.top + card;
      const followingSectionTop = outerTopAtRelease + card + pin.distance + pin.bottomSpace;
      assert.equal(followingSectionTop - cardBottom, 104, "Natural sticky release leaves the existing section gap before Scene Clips");
    }
    assert.equal(decl(width, [".apes-landing #workflow.is-workflow-pinned > .shell"], true).position, undefined);
  }
});

test("native Import/Edit buttons navigate within the section track without trapping keyboard focus", () => {
  const p = workflow();
  for (const [index, progress] of [[1, .75], [0, .25]]) {
    p.phases[index].emit("click");
    assert.equal(p.win.lastScroll.top, p.start() + p.distance() * progress);
    assert.equal(p.win.lastScroll.behavior, "smooth");
    assert.ok(p.frames[index].classList.contains("is-active"));
  }
  for (const step of ["import", "edit"]) {
    assert.match(html, new RegExp(`<button type="button" data-workflow-nav="${step}"[^>]*aria-controls="workflow-${step}-frame workflow-${step}-step"`));
    assert.ok(html.includes(`id="workflow-${step}-frame"`) && html.includes(`id="workflow-${step}-step"`));
  }
  assert.doesNotMatch(source, /keydown|preventDefault|\.focus\(|\bvideo|\.play\(|\.pause\(|currentTime|data-src/);
  assert.doesNotMatch(html, /class="workflow[^\"]*is-workflow-pinned/);
});
