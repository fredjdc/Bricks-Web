import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const source = script.slice(script.indexOf("const setupWorkflow ="), script.indexOf("const observedVideos ="));

function workflow({ reduced = false, desktop = true } = {}) {
  const node = extra => {
    const listeners = {}, attributes = {}, classes = new Set();
    return Object.assign({ attributes,
      classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) },
      addEventListener(name, fn) { (listeners[name] ??= []).push(fn); }, emit(name) { listeners[name]?.forEach(fn => fn()); },
      setAttribute(name, value) { attributes[name] = value; }, removeAttribute(name) { delete attributes[name]; },
    }, extra);
  };
  const motion = node({ matches: reduced }), screen = node({ matches: desktop });
  const images = [node({ complete: true, naturalWidth: 1449 }), node({ complete: true, naturalWidth: 1200 })];
  const frames = images.map(image => node({ querySelector: () => image }));
  let secondTop = 800;
  const steps = [node(), node({ getBoundingClientRect: () => ({ top: secondTop }) })];
  const phases = [node(), node()];
  const media = { querySelectorAll: selector => selector === ".workflow-frame" ? frames : phases };
  const observers = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); } disconnect() { this.targets = []; }
  }
  const win = node({ innerHeight: 1000, IntersectionObserver, matchMedia: () => screen });
  vm.runInNewContext(source, { motionPreference: motion, window: win, IntersectionObserver,
    document: { querySelector: () => media, querySelectorAll: () => steps },
    cancelAnimationFrame() {}, requestAnimationFrame: fn => { fn(); return 1; } });
  return { images, frames, phases, motion, screen, win,
    scroll(top) { secondTop = top; observers.find(o => o.targets.includes(steps[1])).callback([]); } };
}

test("desktop workflow stills and step labels switch together in both scroll directions", () => {
  const p = workflow();
  assert.ok(p.frames[0].classList.contains("is-active"));
  p.scroll(400); assert.ok(p.frames[1].classList.contains("is-active"));
  assert.equal(p.frames[1].attributes["aria-hidden"], "false");
  assert.equal(p.phases[1].attributes["aria-current"], "step");
  p.scroll(800); p.scroll(-200); p.scroll(800);
  assert.ok(p.frames[0].classList.contains("is-active"));
  assert.equal(p.phases[1].attributes["aria-current"], undefined);
});

test("late image loading preserves the current still and cannot commit a stale reverse-scroll request", () => {
  const p = workflow(); p.images[1].complete = false;
  p.scroll(400); assert.ok(p.frames[0].classList.contains("is-active"));
  p.scroll(800); p.images[1].complete = true; p.images[1].emit("load");
  assert.ok(p.frames[0].classList.contains("is-active"));
  p.images[1].naturalWidth = 0; p.scroll(400);
  assert.ok(p.frames[0].classList.contains("is-active"));
  p.images[1].naturalWidth = 1200; p.images[1].emit("load");
  assert.ok(p.frames[1].classList.contains("is-active"));
});

test("mobile and reduced-motion modes keep static images and resume the current step on desktop", () => {
  const p = workflow({ desktop: false }); p.scroll(400);
  assert.ok(p.frames[0].classList.contains("is-active"));
  p.screen.matches = true; p.screen.emit("change");
  assert.ok(p.frames[1].classList.contains("is-active"));
  p.motion.matches = true; p.motion.emit("change"); p.scroll(800);
  assert.ok(p.frames[1].classList.contains("is-active"));
  p.motion.matches = false; p.motion.emit("change");
  assert.ok(p.frames[0].classList.contains("is-active"));
  const reduced = workflow({ reduced: true }); reduced.scroll(400);
  assert.ok(reduced.frames[0].classList.contains("is-active"));
});

test("workflow state no longer loads, plays, pauses or controls any video", () => {
  assert.doesNotMatch(source, /\bvideo|\.play\(|\.pause\(|\.load\(|currentTime|data-src|visibilitychange|media-toggle/);
  assert.doesNotMatch(script, /setWorkflowUserPaused|connectVideoButton|setVideoButtonLabel|data-adjacent-video-button/);
});
