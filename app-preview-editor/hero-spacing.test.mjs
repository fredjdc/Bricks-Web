import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths } from "./responsive-checkpoints.mjs";

const [css, script, html] = await Promise.all(["styles.css", "script.js", "index.html"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const source = script.slice(script.indexOf("const previewHandoff ="));
const helpers = source.slice(0, source.indexOf("const setupPreviewHandoff ="));
const restDistance = vm.runInNewContext(`${helpers}; heroSideRestDistance`);
const separation = vm.runInNewContext(`${helpers}; heroSeparationProgress`);
const spotlight = vm.runInNewContext(`${helpers}; heroSpotlightOpacity`);
const near = (a, b) => assert.ok(Math.abs(a - b) < .00001, `${a} != ${b}`);

// Resolve the actual matching resting rules, including media conditions and specificity.
function rules(text, viewport, reduced = false, result = []) {
  let offset = 0;
  while (offset < text.length) {
    const open = text.indexOf("{", offset); if (open < 0) break;
    const selector = text.slice(offset, open).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    let end = open + 1, depth = 1;
    while (depth && end < text.length) { if (text[end] === "{") depth++; if (text[end] === "}") depth--; end++; }
    const body = text.slice(open + 1, end - 1); offset = end;
    if (selector.startsWith("@media")) {
      const min = selector.match(/min-width:\s*(\d+)px/), max = selector.match(/max-width:\s*(\d+)px/);
      if (min && viewport < +min[1] || max && viewport > +max[1] || /no-preference/.test(selector) && reduced || /prefers-reduced-motion: reduce/.test(selector) && !reduced) continue;
      rules(body, viewport, reduced, result);
    } else if (!selector.startsWith("@")) {
      selector.split(",").forEach(value => result.push({ selector: value.trim(), body, order: result.length }));
    }
  }
  return result;
}
function effective(viewport, node, reduced = false) {
  const specificity = selector => (selector.match(/#/g) || []).length * 100 + (selector.match(/\.|\[/g) || []).length * 10;
  const matching = rules(css, viewport, reduced).filter(({ selector }) => selector.endsWith(`.${node}`));
  matching.sort((a, b) => specificity(a.selector) - specificity(b.selector) || a.order - b.order);
  const result = {};
  matching.forEach(({ body }) => body.split(";").forEach(declaration => {
    const colon = declaration.indexOf(":"); if (colon >= 0) result[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
  }));
  return result;
}

test("effective resting transforms use stable shared tokens at every breakpoint without an inline override", () => {
  for (const viewport of [...widths, 2006]) {
    const group = effective(viewport, "hero-results");
    assert.equal(group["--hero-side-rest-inset"], "0%");
    assert.equal(group["--hero-side-distance-ratio"], ".92");
    assert.equal(group["--hero-fan-side-track"], ".68fr");
    assert.equal(group["--hero-fan-perspective"], "1600px");
    assert.equal(group["--hero-side-rest-scale"], "1");
    assert.equal(group["--hero-side-rest-tilt"], "-28deg");
    assert.equal(group["--hero-side-rest-roll"], "0deg");
    assert.equal(effective(viewport, "hero-center-slot")["--hero-center-scale"], "1");
    assert.equal(effective(viewport, "hero-result-left").transform, "translateX(var(--hero-side-rest-inset)) rotateY(var(--hero-side-rest-tilt)) rotateZ(var(--hero-side-rest-roll)) scale(var(--hero-side-rest-scale))");
    assert.equal(effective(viewport, "hero-result-right").transform, "translateX(calc(-1 * var(--hero-side-rest-inset))) rotateY(calc(-1 * var(--hero-side-rest-tilt))) rotateZ(calc(-1 * var(--hero-side-rest-roll))) scale(var(--hero-side-rest-scale))");
    const shell = Math.min(viewport - (viewport < 560 ? 32 : 48), 1180);
    const width = Math.min(shell, 1080), pad = shell * .045;
    const centerWidth = (width - pad * 2) / 2.36, side = centerWidth * .68, center = width / 2;
    const distances = [-1, 1].map(direction => {
      const left = direction < 0 ? pad : pad + side + centerWidth;
      const frame = viewport < 560 ? 6 : 10;
      const baseline = restDistance(left, side, direction, 1, -28, 0, center, 1600, center, frame + (side - frame) * 3840 / 1776, 0);
      const shift = baseline * .08;
      assert.ok(baseline - shift > centerWidth / 2 && baseline - shift < centerWidth);
      assert.ok(baseline - shift > 0);
      return baseline;
    });
    near(distances[0], distances[1]);
    near(restDistance(pad, side, -1, 1, -28, 0, center, 1600, center), restDistance(pad + side + centerWidth, side, 1, 1, -28, 0, center, 1600, center));
  }
  const media = html.match(/<div class="hero-results"[\s\S]*?<section class="result-section/)[0];
  assert.doesNotMatch(media, /style=/);
  assert.match(css, /\.hero-result-center \{ z-index: 2; transform: scale\(var\(--hero-center-scale\)\); \}/);
});

test("hero separation starts before the handoff and never pauses between the two phases", () => {
  for (const [viewport, top, sourceCenter, height] of [[800, 650, 1000, 650], [400, 500, 750, 304]]) {
    const start = Math.max(0, top - viewport);
    const handoff = sourceCenter - viewport * .6;
    const at = scroll => separation({ top: top - scroll }, { top: sourceCenter - height / 2 - scroll, height }, viewport, scroll);
    assert.equal(at(start), 0); assert.ok(at(start + 1) > 0);
    assert.ok(at((start + handoff) / 2) > 0 && at((start + handoff) / 2) < 1);
    let previous = -Infinity;
    for (let scroll = start; scroll <= handoff + 1000; scroll += 1) {
      const p = at(scroll);
      const fade = Math.max(0, Math.min(1, (scroll - handoff) / 700));
      const offset = (p - 1) * 60 + fade * 150;
      assert.ok(offset >= previous); previous = offset;
      assert.ok(p >= 0 && p <= 1);
    }
    for (const boundary of [start, handoff, start + Math.max(.75 * viewport, handoff - start)]) assert.ok(Math.abs(at(boundary + .0001) - at(boundary - .0001)) < .00001);
  }
});

test("one background spotlight fades continuously to zero before handoff and reverses on the existing scroll clock", () => {
  for (const viewport of [400, 700, 900, 1200]) {
    const top = viewport * .9, height = viewport * .8;
    const at = scroll => spotlight({ top: top - scroll }, { top: top - scroll, height }, viewport, scroll);
    const handoff = top + height / 2 - viewport * .6, end = handoff * .85;
    assert.equal(at(0), 1); assert.ok(at(1) < 1); near(at(end / 2), .5);
    assert.equal(at(end), 0); assert.equal(at(handoff), 0);
    let previous = 1;
    for (let i = 0; i <= 100; i++) { const alpha = at(handoff * i / 100); assert.ok(alpha >= 0 && alpha <= previous); previous = alpha; }
    const before = at(end / 3); at(handoff + 500); assert.equal(at(end / 3), before);
  }
  assert.equal(spotlight({ top: NaN }, { top: 0, height: 400 }, 700, 0), null);
  const style = css.match(/\.apes-landing \.hero::before \{([^}]+)\}/)[1];
  assert.match(style, /z-index: -1; pointer-events: none;/); assert.match(style, /opacity: var\(--hero-spotlight-opacity, 0\);/);
  assert.doesNotMatch(style, /filter:|animation:|box-shadow:|transition:/);
  assert.equal((style.match(/radial-gradient/g) || []).length, 3);
  assert.match(style, /position: fixed; inset: 0;/);
  assert.match(style, /conic-gradient\(from -60deg at var\(--hero-spotlight-x, 50%\) var\(--hero-spotlight-y, 80%\)/);
  assert.match(style, /linear-gradient\(120deg,/);
  assert.match(css, /\.apes-landing \.hero \{ position: relative; z-index: 3; isolation: isolate; \}/);
  assert.match(css, /\.apes-landing \.hero-copy \{ position: relative; z-index: 4; \}/);
  assert.doesNotMatch(css, /\.hero-results::before/);
  const [grain, darkGrain] = [...css.matchAll(/\.apes-landing \.hero::after \{([^}]+)\}/g)].map(([, block]) => block);
  assert.match(grain, /--hero-grain-strength: 0\.8;/);
  assert.match(grain, /--hero-grain-light-strength: \.12;/);
  assert.match(grain, /opacity: calc\(var\(--hero-spotlight-opacity, 0\) \* var\(--hero-grain-light-strength\)\);/);
  assert.match(grain, /mask-image: var\(--hero-grain-mask\); -webkit-mask-image: var\(--hero-grain-mask\);/);
  assert.match(grain, /position: fixed; inset: 0; z-index: -1; pointer-events: none;/);
  assert.match(grain, /mix-blend-mode: multiply;/);
  assert.match(darkGrain, /mix-blend-mode: soft-light;/);
  assert.match(darkGrain, /opacity: calc\(var\(--hero-spotlight-opacity, 0\) \* var\(--hero-grain-strength\)\);/);
  const texture = decodeURIComponent(grain.match(/data:image\/svg\+xml,([^"\s]+)/)[1]);
  assert.match(texture, /seed="23" stitchTiles="stitch"/); assert.match(texture, /type="saturate" values="0"/);
  assert.doesNotMatch(texture + grain, /<animate|animation:|transition:|https?:\/\/(?!www.w3.org)/);
  const p = page(); assert.equal(+p.stage.style.values.get("--hero-spotlight-opacity"), 1);
  assert.equal(p.stage.style.values.get("--hero-spotlight-x"), "500px");
  assert.equal(p.stage.style.values.get("--hero-spotlight-y"), "1000px", "Use the full media midpoint even below the 800px viewport");
  p.scroll(221); near(+p.stage.style.values.get("--hero-spotlight-opacity"), .5);
  assert.equal(p.stage.style.values.get("--hero-spotlight-y"), "779px");
  p.scroll(442); assert.equal(+p.stage.style.values.get("--hero-spotlight-opacity"), 0);
  assert.equal(+p.main.style.values.get("--handoff-progress"), 0);
  p.scroll(221); near(+p.stage.style.values.get("--hero-spotlight-opacity"), .5);
  p.preference(true); assert.equal(p.stage.style.values.size, 0);
});

test("ambient depth drifts slowly behind content and pauses when faded, hidden or reduced", () => {
  assert.equal((html.match(/class="hero-ambient-glow" aria-hidden="true"/g) || []).length, 1);
  assert.match(css, /\.apes-landing \.hero-ambient-glow \{ display: none; \}/);
  assert.match(css, /--hero-glow-near-duration: 12s; --hero-glow-far-duration: 28s;/);
  assert.match(css, /animation-play-state: var\(--hero-glow-play-state, paused\);/);
  assert.match(css, /position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;/);
  for (const name of ["near", "far"]) {
    const frames = css.match(new RegExp(`@keyframes hero-glow-${name} \\{([\\s\\S]*?)\\n  \\}`))[1];
    assert.match(frames, /0%, 100%/); assert.match(frames, /50%/); assert.doesNotMatch(frames, /opacity|filter|background/);
  }
  assert.match(css, /animation-delay: calc\(var\(--hero-glow-near-duration\) \* -\.25\);/);
  assert.match(css, /animation-delay: calc\(var\(--hero-glow-far-duration\) \* -\.4\);/);
  assert.match(css, /rotate\(calc\(var\(--hero-glow-near-tilt\) \* -1\)\)/);
  const [light, dark] = [...css.matchAll(/\.apes-landing \.hero-ambient-glow \{([^}]+)\}/g)].map(([, block]) => block).filter(block => block.includes("--hero-glow-near-duration"));
  assert.match(light, /--hero-glow-near-drift: clamp\(32px, 6vw, 72px\); --hero-glow-near-tilt: 1\.1deg;/);
  assert.match(light, /rgba\(54,91,120,\.22\) 44deg/);
  assert.match(dark, /--hero-glow-near-duration: 18s; --hero-glow-near-drift: var\(--hero-glow-drift\); --hero-glow-near-tilt: \.45deg; --hero-glow-sweep: none;/);
  const p = page();
  assert.equal(p.frames.length, 0, "Initial update already starts the CSS loop without a scroll or queued frame");
  assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "running");
  p.visibility(true); assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "paused");
  p.scroll(221); assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "paused");
  p.visibility(false); assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "running");
  p.scroll(442); assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "paused");
  p.scroll(0); assert.equal(p.stage.style.values.get("--hero-glow-play-state"), "running");
  p.preference(true); assert.equal(p.stage.style.values.size, 0);
});

function page({ reduced = false, broken = false } = {}) {
  let scroll = 0;
  const properties = () => ({ values: new Map(), setProperty(name, value) { this.values.set(name, value); }, removeProperty(name) { this.values.delete(name); } });
  const events = {}, frames = [], classes = new Set(), motionEvents = {};
  const slots = [-1, 1].map(direction => ({ direction, offsetLeft: direction < 0 ? 4 : 572, offsetWidth: 284, style: properties() }));
  const hero = { style: properties(), getBoundingClientRect: () => ({ top: 650 - scroll, left: 70, width: 860 }), querySelectorAll: () => slots };
  const stage = { style: properties() };
  const traveler = { style: properties() };
  const origin = { closest: selector => selector === "main" ? main : selector === ".hero" ? stage : hero, querySelector: selector => selector === ".hero-preview-traveler" ? traveler : null,
    getBoundingClientRect: () => ({ left: 350, top: 675 - scroll, width: 300, height: 650 }) };
  const target = { getBoundingClientRect: () => ({ left: 470, top: 1850 - scroll, width: 140, height: 300 }) };
  const desktop = { getBoundingClientRect: () => ({ left: 40, top: 1750.5 - scroll, width: 1000, height: 600 }) };
  const title = { getBoundingClientRect: () => ({ left: 200, top: 1515 - scroll, width: 600, height: 70 }) };
  const composition = { querySelector: selector => selector === ".editor-desktop" ? desktop : target, querySelectorAll: () => [] };
  const main = { style: properties(), contains: () => true, classList: { add: name => classes.add(name), remove: name => classes.delete(name) } };
  const preference = { matches: reduced, addEventListener: (name, fn) => { motionEvents[name] = fn; } };
  const slotOffset = node => {
    const shift = parseFloat(node.style.values.get("--hero-side-rest-shift")) || .3 * (1 - .06 - .28) * 284;
    return classes.has("is-handoff-ready")
      ? node.direction * (((+hero.style.values.get("--hero-separation-progress") || 0) - 1) * shift + (+main.style.values.get("--handoff-progress") || 0) * 220)
      : -node.direction * shift;
  };
  slots.forEach(node => { node.getBoundingClientRect = () => ({ left: 70 + node.offsetLeft + slotOffset(node), width: 284, height: 602.4324324324324 }); });
  const document = { hidden: false, addEventListener: (name, fn) => { events[name] = fn; }, querySelector: selector => ({ "[data-hero-preview-origin]": origin, "[data-editor-composition]": composition, "#result-title": title })[selector] };
  vm.runInNewContext(source, {
    DOMMatrixReadOnly: class { constructor(transform) { Object.assign(this, { is2D: true, a: 1, b: 0, c: 0, d: 1, f: 0, m41: +transform.match(/matrix\(1, 0, 0, 1, ([^,]+), 0\)/)[1] }); } },
    motionPreference: preference,
    document,
    window: { innerHeight: 800, get scrollY() { return scroll; }, addEventListener: (name, fn) => { events[name] = fn; },
      getComputedStyle(node) {
        if (node === origin) return { getPropertyValue: () => "1" };
        const group = effective(1440, "hero-results");
        return { transform: `matrix(1, 0, 0, 1, ${slotOffset(node)}, 0)`, perspective: broken ? "none" : "1600px", perspectiveOrigin: `${node.direction < 0 ? 426 : -142}px 325px`,
          getPropertyValue: name => name === "--hero-exit-direction" ? String(node.direction) : group[name] };
      } },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
  });
  return { slots, hero, stage, main, traveler, classes, frames,
    visibility(value) { document.hidden = value; events.visibilitychange(); while (frames.length) frames.shift()(); },
    scroll(value) { scroll = value; events.scroll(); while (frames.length) frames.shift()(); },
    preference(value) { preference.matches = value; motionEvents.change(); while (frames.length) frames.shift()(); } };
}

test("the real scroll controller writes early separation, preserves the later handoff and reverses exactly", () => {
  const p = page();
  const left = p.slots[0], shift = parseFloat(left.style.values.get("--hero-side-rest-shift"));
  assert.ok(shift > 0);
  const baseline = restDistance(74, 284, -1, 1, -28, 0, 500, 1600, 500, 602.4324324324324, 0);
  near(shift, baseline * .08);
  const positions = [];
  for (const scroll of [0, 1, 250, 519.999, 520, 520.001, 600, 948, 1376]) {
    p.scroll(scroll);
    const separation = +p.hero.style.values.get("--hero-separation-progress");
    const handoff = +p.main.style.values.get("--handoff-progress");
    if (scroll < 520) assert.equal(handoff, 0);
    if (scroll > 0 && scroll < 600) assert.ok(separation > 0 && separation < 1);
    const offset = (separation - 1) * shift + handoff * 220;
    positions.push(offset);
    if (scroll === 0) near(baseline + offset, baseline * .92);
    if (scroll === 948) near(parseFloat(p.traveler.style.values.get("--preview-y")), 500);
    if (scroll === 1376) near(parseFloat(p.traveler.style.values.get("--preview-y")), 1000);
    near(parseFloat(p.slots[1].style.values.get("--hero-side-rest-shift")), restDistance(642, 284, 1, 1, -28, 0, 500, 1600, 500, 602.4324324324324, 0) * .08);
  }
  assert.ok(positions.every((value, index) => index === 0 || value > positions[index - 1]));
  p.scroll(250); const halfway = [...p.hero.style.values];
  p.scroll(1376); p.scroll(250); assert.deepEqual([...p.hero.style.values], halfway);
  p.scroll(0); near(+p.hero.style.values.get("--hero-separation-progress"), 0);
  assert.equal((source.match(/addEventListener\("scroll"/g) || []).length, 1);
});

test("the intro compensates outer tightening and settling has no second transform owner or step", () => {
  assert.equal(effective(390, "hero-result-left")["transform-origin"], "right center");
  assert.equal(effective(390, "hero-result-right")["transform-origin"], "left center");
  assert.doesNotMatch(css, /\.apes-landing \.hero \.hero-result-(?:left|right) \{[^}]*rotate\(/);
  for (const progress of [0, .4, 1]) {
    const side = .68, center = 1, scale = .8, target = side + center / 2;
    const restShift = .08 * (1 - progress);
    const enter = (side + center) / 2 - (1 - scale) * side / 2 - restShift;
    near(side * (1 - scale / 2) + restShift + enter, target);
    near(side + center + side * scale / 2 - restShift - enter, target);
  }
  assert.match(css, /--hero-side-enter: calc\(var\(--hero-side-distance\) - \(1 - var\(--hero-preview-scale\)\) \* 50% - \(1 - var\(--hero-separation-progress, 0\)\) \* var\(--hero-side-rest-shift\)\);/);
  const rule = css.match(/\.is-handoff-ready \.hero-side-slot \{([^}]+)\}/)[1];
  assert.ok(rule.includes("transform: translateX(calc(var(--hero-exit-direction) * ((var(--hero-separation-progress, 0) - 1) * var(--hero-side-rest-shift) + var(--handoff-progress) * var(--hero-exit-distance))));"));
  assert.match(rule, /opacity: calc\(1 - var\(--handoff-progress\)\); filter: blur\(calc\(var\(--handoff-progress\) \* var\(--hero-exit-blur\)\)\);/);
  assert.doesNotMatch(rule, /transition|animation/);
  assert.doesNotMatch(script, /\.animate\([^)]*hero|style\.transform\s*=|setTimeout|setInterval/);
  const keyframes = css.match(/@keyframes hero-preview-in \{([\s\S]*?)\n  \}/)[1];
  assert.doesNotMatch(keyframes.match(/to \{([^}]+)\}/)[1], /transform:/);
});

test("reduced motion, invalid camera and no JS retain static side peeks without hidden controls", () => {
  const reduced = page({ reduced: true }); assert.equal(reduced.hero.style.values.size, 0);
  reduced.preference(false); reduced.scroll(250); assert.ok(reduced.hero.style.values.size);
  reduced.preference(true); assert.equal(reduced.hero.style.values.size, 0);
  assert.ok(reduced.slots.every(slot => slot.style.values.size === 0));
  const invalid = page({ broken: true }); assert.equal(invalid.hero.style.values.size, 0);
  const staticStyle = effective(390, "hero-side-slot", true);
  assert.ok(staticStyle.transform.includes("--hero-side-rest-shift"));
  assert.ok(staticStyle["--hero-side-rest-shift"].includes("--hero-side-distance-ratio"));
  assert.doesNotMatch(staticStyle.transform, /--hero-separation-progress|--handoff-progress/);
  assert.equal(staticStyle["pointer-events"], "none");
  assert.match(css, /body \{[^}]*overflow-x: hidden;/);
  assert.match(html, /styles\.css\?v=[^"\s]+/);
  assert.match(html, /script\.js\?v=[^"\s]+/);
});
