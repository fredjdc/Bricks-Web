import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { widths, declarations as decl, fluidWidth } from "./responsive-checkpoints.mjs";

const [html, css, script, shared] = await Promise.all(["index.html", "styles.css", "script.js", "../shared-download-cta.css"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const closing = html.match(/<section class="final-cta section shell"[^>]*>[\s\S]*?<\/section>/)[0];
const reveal = script.slice(script.indexOf("const setupReveals ="), script.indexOf('document.querySelectorAll("[data-playback-toggle]")'));

test("the closing CTA adds only three decorative native-size hero stills after the existing download action", async () => {
  const composition = closing.slice(closing.indexOf('<div class="cta-preview-mask"'));
  assert.match(composition, /aria-hidden="true"/);
  assert.equal((composition.match(/<img /g) || []).length, 3);
  assert.doesNotMatch(composition, /<video|<source|<button|<a\b|tabindex|data-hero-preview-origin|hero-side-slot|hero-center-slot|data-hero-entrance/);
  for (const side of ["left", "center", "right"]) {
    const image = composition.match(new RegExp(`<img src="(assets/product/hero-result-${side}\\.png)" width="(\\d+)" height="(\\d+)" alt="" loading="lazy" decoding="async">`));
    assert.ok(image); const png = await readFile(new URL(image[1], import.meta.url));
    assert.equal(+image[2], png.readUInt32BE(16)); assert.equal(+image[3], png.readUInt32BE(20));
  }
  assert.ok(closing.indexOf('class="bricks-cta-actions"') < closing.indexOf('class="cta-preview-mask"'));
  assert.match(closing, /<h2 id="final-title">Give people a closer look\.<\/h2>/);
  assert.equal((closing.match(/<p>/g) || []).length, 1);
  assert.equal((html.match(/<video\b/g) || []).length, 3);
});

test("the alpha mask shows approximately the upper half at every breakpoint with clear, centered, unclipped tops", () => {
  assert.match(shared, /\.bricks-download-cta \{[^}]*overflow: hidden;/);
  for (const width of widths) {
    const shell = fluidWidth(width, decl(width, [".shell"]).width);
    const groupWidth = Math.min(860, shell - (width <= 768 ? 48 : 128));
    const group = decl(width, [".hero-results", ".hero .hero-results", ".apes-landing .hero-results"]);
    const mask = decl(width, [".apes-landing .cta-preview-mask"]);
    assert.equal(mask["mask-image"], "linear-gradient(to bottom, #000 0%, #000 30%, transparent 100%)");
    assert.equal(mask["-webkit-mask-image"], mask["mask-image"]);
    assert.equal(mask["mask-size"], "100% 100%"); assert.equal(mask["-webkit-mask-size"], "100% 100%");
    assert.equal(mask["pointer-events"], "none"); assert.equal(mask.opacity, undefined);
    const mobile = width < 560, side = (groupWidth - 8) / (mobile ? 2.79 : 3) * (mobile ? .72 : 1);
    const center = groupWidth - 8 - 2 * side, borderAndPadding = mobile ? 6 : 10;
    const fullHeight = ((center - borderAndPadding) * 986 / 456 + borderAndPadding) * 1.08;
    const topPadding = Math.max(12, Math.min(32, width * .04));
    const top = topPadding - fullHeight / 1.08 * .04;
    const visible = (groupWidth / +mask["aspect-ratio"] - top) / fullHeight;
    assert.ok(top > 0, `${width}px keeps rounded tops inside the mask`);
    assert.ok(visible >= .45 && visible <= .56, `${width}px reveals ${visible} of the full portrait`);
    assert.ok(center * 1.08 <= groupWidth);
    assert.equal(+group["--hero-side-distance-ratio"], mobile ? .85 : .7);
    assert.equal(parseFloat(group["--hero-side-rest-inset"]), mobile ? 8 : 28);
    assert.match(css, /\.cta-preview-center \{[^}]*z-index: 2;[^}]*transform: none;/);
  }
  assert.doesNotMatch(css, /\.cta-preview-mask[^}]*background:|\.cta-preview-mask::(?:before|after)/);
  assert.match(css, /\.cta-preview-mask > \.cta-preview-layout \{ position: absolute;/);
});

function page({ reduced = false, supported = true, broken = false, invalid = false } = {}) {
  const animations = [], motion = { matches: reduced, addEventListener(name, fn) { this.change = fn; } };
  let observer;
  const centers = { left: 280, center: 500, right: 720 };
  const previews = ["left", "center", "right"].map(side => ({
    dataset: { ctaPreview: side },
    querySelector: () => ({ getBoundingClientRect: () => ({ left: centers[side] - 80, width: invalid ? 0 : 160 }) }),
    animate(frames, options) {
      if (broken && side === "left") throw new Error("Animation unavailable");
      const animation = { side, frames, options, canceled: false, addEventListener() {}, cancel() { this.canceled = true; } };
      animations.push(animation); return animation;
    },
    contains: () => false,
  }));
  const mask = {
    matches: selector => selector !== ":focus-within" && selector.includes(".cta-preview-mask"),
    querySelectorAll: () => previews, contains: node => previews.includes(node),
    getClientRects: () => [{}], closest: () => "closing-section", animate() { throw new Error("Do not animate the mask"); },
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observer = this; }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.disconnected = true; }
  }
  const window = supported ? { IntersectionObserver } : {};
  vm.runInNewContext(reveal, { window, IntersectionObserver, motionPreference: motion,
    document: { querySelectorAll: () => [mask], addEventListener() {} } });
  return { animations, observer, enter(intersecting = true) { observer?.callback([{ target: mask, isIntersecting: intersecting }]); },
    reduce() { motion.matches = true; motion.change?.(); } };
}

test("the existing observer waits for CTA visibility, then reveals center, left and right once from measured centers", () => {
  const p = page(); assert.equal(p.animations.length, 0);
  p.enter(false); assert.equal(p.animations.length, 0);
  p.enter();
  assert.deepEqual(p.animations.map(a => a.side), ["center", "left", "right"]);
  assert.deepEqual(p.animations.map(a => a.options.delay), [0, 180, 360]);
  assert.deepEqual(p.animations.map(a => a.options.duration), [600, 760, 760]);
  assert.deepEqual(p.animations.map(a => a.frames[0].transform), ["translate(0px, 8px) scale(0.96)", "translate(220px, 8px) scale(0.8)", "translate(-220px, 8px) scale(0.8)"]);
  for (const animation of p.animations) {
    assert.equal(animation.frames[0].opacity, 0); assert.match(animation.frames[0].filter, /^blur\([23]px\)$/);
    assert.equal(animation.frames[1].opacity, 1); assert.equal(animation.frames[1].filter, "none"); assert.equal(animation.frames[1].transform, "none");
    assert.equal(animation.options.fill, "backwards");
  }
  p.enter(); assert.equal(p.animations.length, 3);
});

test("reduced motion, no JS, missing APIs and animation failure retain the static masked composition", () => {
  assert.equal(page({ reduced: true }).observer, undefined);
  assert.equal(page({ supported: false }).observer, undefined);
  const active = page(); active.enter(); active.reduce(); assert.ok(active.animations.every(a => a.canceled));
  const invalid = page({ invalid: true }); invalid.enter(); assert.equal(invalid.animations.length, 0);
  const broken = page({ broken: true }); broken.enter(); assert.ok(broken.animations.every(a => a.canceled));
  assert.doesNotMatch(closing, /(?:class|style)="[^"]*(?:is-hidden|opacity:|visibility:|display:)/);
  assert.doesNotMatch(css, /\.cta-preview[^}]*animation:|\.cta-preview[^}]*opacity: 0/);
});
