import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const script = await readFile(new URL("script.js", import.meta.url), "utf8");

function workflow({ reduced = false, desktop = true } = {}) {
  const node = (extra = {}) => {
    const listeners = {}, attributes = {}, classes = new Set();
    return Object.assign({
      dataset: {}, attributes,
      classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name), add: name => classes.add(name) },
      addEventListener(name, callback) { (listeners[name] ??= []).push(callback); },
      emit(name) { listeners[name]?.forEach(callback => callback()); },
      setAttribute(name, value) { attributes[name] = value; }, removeAttribute(name) { delete attributes[name]; },
    }, extra);
  };
  const motion = node({ matches: reduced }), screen = node({ matches: desktop });
  let visible = true, secondTop = 800;
  const video = (id, frame) => {
    const source = { dataset: { src: `${id}.mp4` }, removeAttribute() { delete this.dataset.src; } };
    const poster = node({ complete: true, naturalWidth: 100 });
    return node({
      id, poster, paused: true, readyState: 0, loadCount: 0,
      parentElement: { querySelector: () => poster },
      hasAttribute: name => ["data-autoplay-video", "data-workflow-media"].includes(name) || (frame && name === "data-workflow-frame"),
      querySelector: () => source.dataset.src ? source : null,
      getClientRects: () => (frame ? screen.matches && !motion.matches : !screen.matches || motion.matches) ? [{}] : [],
      getBoundingClientRect: () => ({ top: visible ? 120 : 1200, bottom: visible ? 520 : 1600 }),
      load() { this.loadCount++; },
      play() { this.paused = false; this.emit("play"); return Promise.resolve(); },
      pause() { this.paused = true; this.emit("pause"); },
    });
  };
  const videos = [video("import", true), video("edit", true), video("mobile-import"), video("mobile-edit")];
  const frames = videos.slice(0, 2).map(v => node({ querySelector: () => v }));
  const steps = [node(), node()];
  steps[1].getBoundingClientRect = () => ({ top: secondTop });
  const phases = [node({ textContent: "Import" }), node({ textContent: "Edit" })], button = node();
  const media = { querySelectorAll: selector => selector === ".workflow-frame" ? frames : phases, querySelector: () => button };
  const document = node({ hidden: false, documentElement: { classList: { add() {} } },
    querySelector: () => media,
    querySelectorAll: selector => ({ "[data-workflow-video]": steps, "#workflow [data-workflow-media]": videos, "video": videos, "[data-autoplay-video]": videos })[selector] ?? [],
  });
  const observers = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.targets = []; }
  }
  const window = node({ innerHeight: 1000, IntersectionObserver, matchMedia: q => q.includes("reduced-motion") ? motion : screen });
  vm.runInNewContext(script, { document, window, IntersectionObserver, cancelAnimationFrame() {}, requestAnimationFrame: callback => { callback(); return 1; } });
  const scroll = top => { secondTop = top; observers.find(o => o.targets.includes(steps[1])).callback([]); };
  return { videos, frames, steps, phases, button, document, motion, screen, window, scroll, offscreen: () => { visible = false; window.emit("resize"); } };
}

test("workflow changes in both directions without reloading prepared sources", () => {
  const p = workflow();
  assert.equal(p.frames[0].classList.contains("is-active"), true);
  p.scroll(400);
  assert.equal(p.frames[1].classList.contains("is-active"), true);
  assert.equal(p.phases[1].attributes["aria-current"], "step");
  assert.equal(p.button.attributes["aria-controls"], "edit");
  assert.ok(p.videos[0].paused && !p.videos[1].paused);
  p.scroll(800); p.scroll(-200); p.scroll(800);
  assert.equal(p.frames[0].classList.contains("is-active"), true);
  assert.equal(p.videos[0].loadCount, 1);
  assert.equal(p.videos[1].loadCount, 1);
});

test("late posters keep the current frame and cannot commit a stale reverse-scroll request", () => {
  const p = workflow(), incoming = p.videos[1];
  incoming.poster.complete = false;
  p.scroll(400);
  assert.equal(p.frames[0].classList.contains("is-active"), true);
  assert.equal(incoming.loadCount, 1);
  p.scroll(800);
  incoming.poster.complete = true; incoming.poster.emit("load");
  assert.equal(p.frames[0].classList.contains("is-active"), true);
  incoming.poster.complete = false;
  p.scroll(400); incoming.readyState = 2; incoming.emit("loadeddata");
  assert.equal(p.frames[1].classList.contains("is-active"), true);
});

test("manual pause survives step changes, hidden tabs, and responsive mode changes", () => {
  const p = workflow();
  p.button.emit("click"); p.scroll(400);
  assert.ok(p.videos.every(v => v.paused && v.dataset.userPaused === "true"));
  p.screen.matches = false; p.screen.emit("change");
  p.screen.matches = true; p.screen.emit("change");
  assert.ok(p.videos.every(v => v.paused));
  p.button.emit("click"); assert.equal(p.videos[1].paused, false);
  p.document.hidden = true; p.document.emit("visibilitychange");
  assert.ok(p.videos.every(v => v.paused));
  p.document.hidden = false; p.document.emit("visibilitychange");
  assert.equal(p.videos[1].paused, false);
  p.offscreen(); assert.ok(p.videos.every(v => v.paused));
});

test("mobile and reduced motion avoid pinned autoplay and respond to preference changes", () => {
  const p = workflow({ desktop: false });
  assert.ok(p.videos.slice(0, 2).every(v => v.paused && v.loadCount === 0));
  p.screen.matches = true; p.screen.emit("change");
  assert.equal(p.videos[0].paused, false);
  p.motion.matches = true; p.motion.emit("change");
  p.scroll(400); assert.ok(p.videos.every(v => v.paused));
  p.motion.matches = false; p.motion.emit("change");
  assert.equal(p.frames[1].classList.contains("is-active"), true);
  assert.equal(p.videos[1].paused, false);
  const reduced = workflow({ reduced: true });
  assert.ok(reduced.videos.every(v => v.paused && v.loadCount === 0));
});
