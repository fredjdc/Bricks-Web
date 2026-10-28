import assert from "node:assert/strict";
import { open, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths, declarations as decl } from "./responsive-checkpoints.mjs";

const [html, css, script] = await Promise.all(["index.html", "styles.css", "script.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const videos = [...html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)].map(([, attributes, body]) => ({ attributes,
  source: body.match(/<source\b[^>]*(?:data-src|src)="([^"]+)"/)[1],
  width: Number(attributes.match(/width="(\d+)"/)[1]), height: Number(attributes.match(/height="(\d+)"/)[1]) }));
const expected = { "heroResultLeft.mp4": [1776, 3840], "heroResult.mp4": [886, 1920], "heroResultRight.mp4": [1776, 3840], "scene-clip.mp4": [1920, 1080] };

test("all preview clip owners share the editor backdrop radius with concentric poster/live corners", () => {
  const owners = [".hero-result", ".editor-backdrop", ".editor-preview-target", ".workflow-frames", ".mobile-workflow-media-wrap", ".scene-clips-media", ".capability-media", ".story-media", ".template-media"];
  for (const width of widths) for (const reduced of [false, true]) {
    const palette = decl(width, [".apes-landing"], reduced);
    const radius = palette["--media-radius"] === "var(--radius-large)" ? parseFloat(palette["--radius-large"]) : parseFloat(palette["--media-radius"]);
    assert.equal(radius, width < 560 ? 20 : 32);
    for (const owner of owners) {
      const frame = decl(width, [`.apes-landing ${owner}`], reduced);
      assert.equal(frame["border-radius"], "var(--media-radius)"); assert.equal(frame.overflow, "hidden");
    }
    const hero = decl(width, [".apes-landing .hero-result"], reduced), inset = parseFloat(hero["--media-frame-inset"]);
    assert.equal(inset, width < 560 ? 2 : 4); assert.equal(radius - inset - 1, width < 560 ? 17 : 27);
    for (const inner of [".hero-result .video-stage", ".hero-result > video", ".cta-preview-layout img"]) assert.equal(decl(width, [`.apes-landing ${inner}`], reduced)["border-radius"], "calc(var(--media-radius) - var(--media-frame-inset) - 1px)");
    for (const child of ["video", ".video-poster"]) assert.equal(decl(width, [`.apes-landing .hero-result .video-stage > ${child}`], reduced)["border-radius"], "0");
    for (const owner of [".story-media", ".mobile-workflow-media-wrap"]) {
      const image = decl(width, [".feature-media-image", `.apes-landing ${owner} > .feature-media-image`], reduced);
      assert.equal(image.border, "0"); assert.equal(image["border-radius"], "0"); assert.equal(image["box-shadow"], "none");
      assert.equal(decl(width, [`.apes-landing ${owner}`], reduced)["box-shadow"], "var(--shadow)");
    }
    assert.equal(decl(width, [".apes-landing .founder-panel > img"], reduced)["border-radius"], "50%");
  }
  assert.doesNotMatch(script, /style\.borderRadius|setProperty\("border-radius"/);
  assert.match(css, /\.editor-composition \{[^}]*border-radius: var\(--media-radius\);/);
});

function boxes(buffer, start = 0, end = buffer.length) {
  const result = [];
  while (start + 8 <= end) {
    let size = buffer.readUInt32BE(start), header = 8;
    if (size === 1) { size = Number(buffer.readBigUInt64BE(start + 8)); header = 16; }
    if (size === 0) size = end - start;
    assert.ok(size >= header && start + size <= end);
    result.push({ type: buffer.toString("ascii", start + 4, start + 8), start: start + header, end: start + size });
    start += size;
  }
  return result;
}

// Read only metadata atoms; skip the large encoded media payload entirely.
async function nativeDimensions(path) {
  const file = await open(new URL(path, import.meta.url));
  try {
    const { size: length } = await file.stat();
    let offset = 0, moov;
    while (offset + 8 <= length) {
      const head = Buffer.alloc(16); await file.read(head, 0, 16, offset);
      let size = head.readUInt32BE(0), header = 8;
      if (size === 1) { size = Number(head.readBigUInt64BE(8)); header = 16; }
      if (size === 0) size = length - offset;
      assert.ok(size >= header);
      if (head.toString("ascii", 4, 8) === "moov") { moov = Buffer.alloc(size - header); await file.read(moov, 0, moov.length, offset + header); break; }
      offset += size;
    }
    assert.ok(moov, path);
    for (const track of boxes(moov).filter(box => box.type === "trak")) {
      const tkhd = boxes(moov, track.start, track.end).find(box => box.type === "tkhd");
      if (!tkhd) continue;
      const width = moov.readUInt32BE(tkhd.end - 8) / 65536, height = moov.readUInt32BE(tkhd.end - 4) / 65536;
      if (!width || !height) continue;
      const matrix = tkhd.start + (moov[tkhd.start] === 1 ? 52 : 40);
      const [a, b, c, d] = [0, 4, 12, 16].map(offset => moov.readInt32BE(matrix + offset) / 65536);
      return { width: Math.abs(a * width) + Math.abs(c * height), height: Math.abs(b * width) + Math.abs(d * height), matrix: [a, b, c, d] };
    }
    assert.fail(`Missing visual track: ${path}`);
  } finally { await file.close(); }
}

test("the three hero videos and Scene Clips demo declare actual track dimensions before metadata loads", async () => {
  assert.equal(videos.length, 4); assert.equal(new Set(videos.map(video => video.source)).size, 4);
  for (const [name, dimensions] of Object.entries(expected)) {
    const measured = await nativeDimensions(`assets/${name}`);
    assert.deepEqual([measured.width, measured.height], dimensions);
    assert.deepEqual(measured.matrix, [1, 0, 0, 1], "The audited files have no rotation metadata");
    const instances = videos.filter(video => video.source === `assets/${name}`); assert.ok(instances.length);
    instances.forEach(video => assert.deepEqual([video.width, video.height], dimensions));
  }
});

test("native content determines wrapper height; no fixed video ratio or hover zoom can crop the picture", () => {
  assert.match(css, /\.feature-media-image \{ display: block; width: 100%; height: auto;[^}]*object-fit: contain;/);
  assert.match(css, /\.hero-result video \{ display: block; width: 100%; height: auto;[^}]*object-fit: contain;/);
  assert.doesNotMatch(css, /scale\(1\.035\)|aspect-ratio: 16 \/ 10/);
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (/video\b/.test(selector) && !/poster|canvas|editor/.test(selector)) assert.doesNotMatch(body, /object-fit: cover|aspect-ratio:|height: 100%/);
  }
  assert.match(css, /\.video-poster \{[^}]*object-fit: contain; pointer-events: none;/);
  assert.match(css, /\.feature-media-image \{[^}]*border-radius: var\(--radius-large\);/);
  assert.match(css, /\.hero-result \.video-stage \{ overflow: hidden;/);
  assert.equal(decl(390, [".apes-landing .hero-result .video-stage"])["border-radius"], "calc(var(--media-radius) - var(--media-frame-inset) - 1px)");
});

test("only the active workflow frame determines height, with rounded opacity crossfades and no inner pan", () => {
  const frame = css.match(/#workflow \.workflow-frame \{([^}]+)\}/)[1];
  assert.match(frame, /position: absolute;/); assert.match(frame, /transition: opacity 420ms/);
  assert.doesNotMatch(frame, /height:|transform:/);
  assert.match(css, /#workflow \.workflow-frame\.is-active \{ position: relative;/);
  assert.match(css, /#workflow \.workflow-frames \{ display: grid; position: relative; overflow: hidden;/);
  assert.equal(decl(900, ["#workflow .workflow-frames", ".apes-landing .workflow-frames"])["border-radius"], "var(--media-radius)");
  for (const [, body] of css.matchAll(/#workflow \.workflow-frame (?:video|\.video-stage) \{([^}]+)\}/g)) assert.doesNotMatch(body, /height: 100%/);
  const workflow = html.match(/<section class="workflow section"[\s\S]*?<\/section>/)[0];
  assert.equal((workflow.match(/class="feature-media-image/g) || []).length, 4);
  assert.doesNotMatch(workflow, /<video|<source|media-toggle|data-playback/);
});

test("responsive portrait/landscape frames preserve scale and the moving center retains its canvas fit", () => {
  for (const viewport of [320, 375, 390, 430, 482, 768, 1024, 1440]) for (const video of videos) {
    const frameWidth = Math.min(viewport - 32, 860);
    const frameHeight = frameWidth * video.height / video.width;
    assert.ok(Math.abs(frameWidth / video.width - frameHeight / video.height) < 1e-10);
    assert.ok(frameWidth < viewport && Number.isFinite(frameHeight));
  }
  assert.match(css, /\.editor-preview-target \{[^}]*aspect-ratio: 886 \/ 1920;/);
  const center = videos.find(video => video.attributes.includes('id="finished-preview-video"'));
  assert.deepEqual([center.width, center.height], [886, 1920]);
  assert.equal((html.match(/id="finished-preview-video"/g) || []).length, 1);
  assert.match(script, /preview\?\.addEventListener\("loadedmetadata", schedule\)/);
  assert.match(script, /preview\?\.addEventListener\("resize", schedule\)/);
});

function stagePage() {
  const listeners = {}, attrs = new Map([["width", "886"], ["height", "1920"]]);
  const target = { style: {} };
  const poster = { setAttribute() {} };
  const stage = { children: [], append(...children) { this.children.push(...children); children[0].parentElement = this; }, querySelector: () => poster };
  const video = { id: "finished-preview-video", videoWidth: 0, videoHeight: 0, poster: "existing-poster.png", paused: true, currentTime: 6, hasAttribute: () => false,
    getAttribute: name => attrs.get(name), setAttribute: (name, value) => attrs.set(name, value), before() {},
    addEventListener: (name, callback) => { (listeners[name] ??= []).push(callback); } };
  const doc = { documentElement: { classList: { add() {} } }, querySelector: () => target,
    querySelectorAll: selector => selector === "video[poster]" ? [video] : [], createElement: tag => tag === "div" ? stage : poster };
  vm.runInNewContext(script.slice(0, script.indexOf("const setupReveals =")), { document: doc, window: { matchMedia: () => ({ matches: false }) } });
  return { attrs, target, video, poster, stage, emit: name => listeners[name]?.forEach(callback => callback()) };
}

test("metadata/source size changes update intrinsic hints and destination ratio without changing playback", () => {
  const p = stagePage();
  assert.equal(p.target.style.aspectRatio, "886 / 1920");
  assert.equal(p.poster.hidden, false); assert.equal(p.stage.children[0], p.video);
  p.video.videoWidth = 1920; p.video.videoHeight = 1080; p.emit("loadedmetadata");
  assert.equal(p.attrs.get("width"), "1920"); assert.equal(p.attrs.get("height"), "1080");
  assert.equal(p.target.style.aspectRatio, "1920 / 1080");
  p.video.videoWidth = 1776; p.video.videoHeight = 3840; p.emit("resize");
  assert.equal(p.target.style.aspectRatio, "1776 / 3840");
  assert.equal(p.video.paused, true); assert.equal(p.video.currentTime, 6);
  p.emit("playing"); assert.equal(p.poster.hidden, true);
  p.emit("error"); assert.equal(p.poster.hidden, false); assert.equal(p.poster.src, "existing-poster.png");
});
