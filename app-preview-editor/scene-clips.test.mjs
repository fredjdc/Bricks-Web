import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths, declarations as decl, fluidWidth } from "./responsive-checkpoints.mjs";

const [html, css, script, png] = await Promise.all([
  ...["index.html", "styles.css", "script.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")),
  readFile(new URL("assets/app-preview-scene-app.png", import.meta.url)),
]);
const scene = html.match(/<section class="scene-clips section shell"[\s\S]*?<\/section>/)[0];

test("Templates follows the workflow with consistent feature terminology, supplied video and loading poster", () => {
  assert.ok(html.indexOf('id="workflow"') < html.indexOf(scene));
  assert.ok(html.indexOf(scene) < html.indexOf('id="features"'));
  assert.match(scene, /<p class="scene-clips-eyebrow">Templates<\/p>/);
  assert.match(scene, /<h2 id="scene-clips-title">Set the scene in a few steps\.<\/h2>/);
  assert.match(scene, /<p>Start with a template, then make it your own\. The motion is already there, so you can focus on your app’s story\.<\/p>/);
  assert.match(scene, /aria-label="Ready-made templates in App Preview Editor"/);
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(visible, /Scene Clips?|visual[ -]pauses?/i);
  assert.match(visible, /Find pauses with Auto Cut, then review and remove the ones you don’t need\./);
  assert.match(visible, /Paid includes Pro Templates, with new templates added monthly\./);
  for (const [name, labels] of [["Free Templates", ["Included", "Included"]], ["Pro Templates", ["Not included", "Included"]]]) {
    const row = html.match(new RegExp(`<tr><th scope="row">${name}<\\/th>(.*?)<\\/tr>`))[1];
    assert.deepEqual([...row.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]), labels);
  }
  assert.equal((scene.match(/<p\b/g) || []).length, 2);
  assert.match(scene, /<video width="1920" height="1080" poster="assets\/app-preview-scene-app\.png" preload="none" muted loop playsinline data-autoplay-video data-scene-clips/);
  assert.match(scene, /<source data-src="assets\/product\/scene-clip\.mp4" type="video\/mp4">/);
  assert.match(scene, /class="editor-backdrop">\s*<img class="editor-desktop" src="assets\/desktop-bg\.png"/);
  assert.match(scene, /class="scene-clips-window">\s*<video/);
  assert.doesNotMatch(scene, /<button|\bcontrols(?:\s|=|>)|data-playback-toggle|tabindex|<source src=/);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [2032, 1098]);
});

test("native dimensions reserve the full uncropped frame and rounded container at every checkpoint", () => {
  for (const width of widths) {
    const frameWidth = fluidWidth(width, decl(width, [".shell"]).width) - 2;
    const frameHeight = frameWidth * 9 / 16;
    assert.ok(frameWidth > 0 && frameWidth < width && frameHeight > 0);
    const video = decl(width, [".apes-landing .scene-clips-media video"]);
    assert.equal(video.width, "100%"); assert.equal(video.height, "auto"); assert.equal(video["object-fit"], "contain");
    assert.equal(video["aspect-ratio"], undefined);
    const frame = decl(width, [".apes-landing .editor-composition", ".apes-landing .scene-clips-media"]);
    assert.equal(frame.overflow, "hidden"); assert.equal(frame["border-radius"], "var(--media-radius)");
    assert.equal(frame["aspect-ratio"], "16 / 9");
    const window = decl(width, [".apes-landing .scene-clips-window"]);
    assert.equal(window.left, "5%"); assert.equal(window.width, "90%");
    assert.equal(window.top, "50%"); assert.equal(window.transform, "translateY(-50%)");
    assert.ok(frameWidth * .9 * 1080 / 1920 < frameHeight);
    assert.equal(window["border-radius"], "var(--media-radius)");
    assert.equal(decl(width, [".apes-landing .scene-clips > .section-heading"])["text-align"], "center");
  }
  assert.match(css, /\.video-poster \{[^}]*object-fit: contain;/);
  assert.match(script, /\.story-media, \.scene-clips-media,/);
  assert.match(scene, /class="section-heading reveal"/); assert.match(scene, /class="scene-clips-media editor-composition reveal"/);
  assert.doesNotMatch(css, /\.scene-clips[^}]*opacity: 0|\.scene-clips[^}]*visibility: hidden/);
  // With no JS, the native poster remains available while the MP4 has no assigned source.
  assert.match(scene, /poster="assets\/app-preview-scene-app\.png"/);
  assert.doesNotMatch(scene, /\ssrc="assets\/product\/scene-clip\.mp4"/);
});

function posterPage({ frameCallback = true } = {}) {
  const listeners = {}, attrs = new Map([["width", "1920"], ["height", "1080"]]), callbacks = [];
  const motion = { matches: false }, poster = { setAttribute() {} };
  const stage = { append(video) { video.parentElement = this; }, querySelector: () => poster };
  const video = { id: "scene-clips-demo", paused: false, readyState: 3, error: null, videoWidth: 0, videoHeight: 0,
    poster: "assets/app-preview-scene-app.png", hasAttribute: name => name === "data-scene-clips",
    getAttribute: name => attrs.get(name), setAttribute: (name, value) => attrs.set(name, value), before() {},
    addEventListener(name, callback) { listeners[name] = callback; } };
  if (frameCallback) video.requestVideoFrameCallback = callback => callbacks.push(callback);
  const document = { documentElement: { classList: { add() {} } },
    querySelectorAll: selector => selector === "video[poster]" ? [video] : [], createElement: tag => tag === "div" ? stage : poster };
  vm.runInNewContext(script.slice(0, script.indexOf("const setupReveals =")), { document, window: { matchMedia: () => motion } });
  return { video, poster, motion, callbacks, emit: name => listeners[name]?.() };
}

test("the supplied still stays visible until a decoded frame can paint and returns on source failure", () => {
  const p = posterPage(); assert.equal(p.poster.hidden, false);
  p.emit("playing"); assert.equal(p.poster.hidden, false); assert.equal(p.callbacks.length, 1);
  p.callbacks.shift()(); assert.equal(p.poster.hidden, true);
  p.emit("loadstart"); assert.equal(p.poster.hidden, false);
  p.emit("playing"); p.video.error = new Error("Decode failed"); p.emit("error"); p.callbacks.shift()();
  assert.equal(p.poster.hidden, false);
  p.video.error = null; p.emit("playing"); p.motion.matches = true; p.callbacks.shift()(); assert.equal(p.poster.hidden, false);
  const fallback = posterPage({ frameCallback: false }); fallback.video.readyState = 1; fallback.emit("playing");
  assert.equal(fallback.poster.hidden, false);
  fallback.video.readyState = 3; fallback.emit("playing"); assert.equal(fallback.poster.hidden, true);
});
