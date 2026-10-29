import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, script] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
]);
const hero = html.match(/<section class="hero shell"[\s\S]*?<\/section>/)[0];
const heading = hero.match(/<h1>([\s\S]*?)<\/h1>/)[1];
const text = markup => markup.replace(/<[^>]*>/g, "");
const atoms = [...hero.matchAll(/<(?:span|p|a|div)\b([^>]*\bdata-hero-entrance\b[^>]*)>/g)].map(([, attributes]) => ({
  classes: attributes.match(/class="([^"]+)"/)[1],
  delay: attributes.includes("--hero-delay") ? Number(attributes.match(/--hero-delay:\s*(\d+)ms/)[1]) : null,
}));

// Read the whole media block, including nested keyframes.
const marker = "@media (prefers-reduced-motion: no-preference) {";
const start = css.indexOf(marker);
let depth = 1, end = start + marker.length;
while (depth && end < css.length) {
  if (css[end] === "{") depth++;
  if (css[end] === "}") depth--;
  end++;
}
const entrance = css.slice(start, end);
const mediaRule = entrance.match(/\.hero \.hero-results \{([^}]+)\}/)[1];
const token = (source, name) => source.match(new RegExp(`--${name}:\\s*([^;]+);`))[1];

test("the native heading retains its exact text, word spaces, and two responsive line groups", () => {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal(text(heading), "Bring your app to life on the App Store.");
  const ungrouped = heading.replace(/<span class="hero-phrase">((?:<span class="hero-title-word"[^>]*>[^<]+<\/span>\s*)+)<\/span>/g, "$1");
  const lines = [...ungrouped.matchAll(/<span class="hero-word">((?:<span class="hero-title-word"[^>]*>[^<]+<\/span>\s*)+)<\/span>/g)];
  assert.deepEqual(lines.map(([, line]) => text(line)), ["Bring your app to life", "on the App Store."]);
  const words = [...heading.matchAll(/<span class="hero-title-word"[^>]*>([^<]+)<\/span>/g)];
  assert.deepEqual(words.map(([, word]) => word), text(heading).split(" "));
  assert.doesNotMatch(heading, /aria-hidden|aria-label|role=|tabindex|<br|&nbsp;/);
  assert.match(html, /\.hero h1 \.hero-word \{ display: block; \}/);
  assert.match(css, /\.hero-title-word \{ display: inline-block; \}/);
  const phrases = [...heading.matchAll(/<span class="hero-phrase">((?:<span class="hero-title-word"[^>]*>[^<]+<\/span>\s*)+)<\/span>/g)].map(([, phrase]) => text(phrase));
  assert.deepEqual(phrases, ["to life", "App Store."]);
});

test("the word, subtitle, button, and caption sequence is preserved before the media", () => {
  assert.equal(atoms.length, 15);
  assert.deepEqual(atoms.slice(0, 9).map(({ classes }) => classes), Array(9).fill("hero-title-word"));
  assert.deepEqual(atoms.slice(0, 12).map(({ delay }) => delay), [0, 60, 120, 180, 240, 300, 360, 420, 480, 860, 1060, 1220]);
  assert.deepEqual(atoms.slice(9, 12).map(({ classes }) => classes), ["hero-lede hero-intro-secondary", "button download-button", "download-caption"]);
  const duration = Number(entrance.match(/animation: hero-intro-in (\d+)ms/)[1]);
  assert.ok(atoms[8].delay + duration <= atoms[9].delay, "Finish the title before starting the subtitle");
  assert.ok(atoms[11].delay < parseFloat(token(mediaRule, "hero-media-start")));
  assert.match(entrance, /animation-delay: var\(--hero-delay, 0ms\)/);
  assert.doesNotMatch(entrance, /\.hero-word:nth-child|\.hero-intro-detail \{/);
});

test("only individual previews animate, with the center followed by left and right", () => {
  assert.deepEqual(atoms.slice(12).map(({ classes }) => classes), ["hero-result hero-result-left", "hero-result hero-result-center", "hero-result hero-result-right"]);
  const mediaStart = parseFloat(token(mediaRule, "hero-media-start"));
  const stagger = parseFloat(token(mediaRule, "hero-media-stagger"));
  const delays = ["center", "left", "right"].map(side => {
    const rule = entrance.match(new RegExp(`\\.hero \\.hero-result-${side} \\{([^}]+)\\}`))[1];
    return mediaStart + Number(token(rule, "hero-media-step")) * stagger;
  });
  assert.deepEqual(delays, [1380, 1560, 1740]);
  assert.equal(delays[2] + parseFloat(token(mediaRule, "hero-media-duration")), 2500);
  assert.match(entrance, /\.hero \.hero-result\[data-hero-entrance\] \{ animation-name: hero-preview-in;/);
  assert.match(entrance, /animation-delay: calc\(var\(--hero-media-start\) \+ var\(--hero-media-step\) \* var\(--hero-media-stagger\)\)/);
  assert.match(entrance, /animation-timing-function: cubic-bezier\(\.22, 1, \.36, 1\)/);
  assert.doesNotMatch(mediaRule, /(?:^|;)\s*(?:animation|transform):/);
  assert.match(hero, /<div class="hero-results" role="group" aria-label="App Store video examples">/);
});

test("the smaller side previews start centered behind the center at wide and narrow widths", () => {
  const scale = parseFloat(token(mediaRule, "hero-preview-scale"));
  assert.ok(scale < 1 && scale >= .75);
  assert.match(entrance, /--hero-side-enter: calc\(var\(--hero-side-distance\) - \(1 - var\(--hero-preview-scale\)\) \* 50% - \(1 - var\(--hero-separation-progress, 0\)\) \* var\(--hero-side-rest-shift\)\);/);
  const mobile = css.match(/\.apes-landing \.hero-results \{ --hero-side-distance: ([\d.]+)%; grid-template-columns: minmax\(0, ([\d.]+)fr\) minmax\(0, ([\d.]+)fr\) minmax\(0, ([\d.]+)fr\);/);
  const layouts = [[1, 1, parseFloat(token(mediaRule, "hero-side-distance"))], [Number(mobile[2]), Number(mobile[3]), Number(mobile[1])]];
  assert.equal(mobile[2], mobile[4], "Both side columns must use the same geometry");
  for (const [sideWidth, centerWidth, distance] of layouts) {
    const restShift = .3 * (distance / 100 - .28 - .06) * sideWidth;
    const shift = (distance / 100 - (1 - scale) / 2) * sideWidth - restShift;
    // Existing origins are right-center for left, left-center for right.
    const leftCenter = sideWidth * (1 - scale / 2) + shift + restShift;
    const rightCenter = sideWidth + centerWidth + sideWidth * scale / 2 - shift - restShift;
    const target = sideWidth + centerWidth / 2;
    assert.ok(Math.abs(leftCenter - target) < .00001);
    assert.ok(Math.abs(rightCenter - target) < .00001);
    assert.ok(sideWidth * scale < centerWidth * 1.08, "Both smaller cards fit behind the center preview");
  }
  assert.match(entrance, /--hero-preview-enter-x: calc\(-1 \* var\(--hero-side-enter\)\)/);
  assert.match(css, /\.hero-center-slot \{ --hero-center-scale: 1\.08; position: relative; z-index: 2; min-width: 0; \}/);
  assert.match(css, /\.hero-result-center \{ z-index: 2; transform: scale\(var\(--hero-center-scale\)\); \}/);
  for (const [, declarations] of css.matchAll(/\.apes-landing \.hero-results \{([^}]+)\}/g)) {
    assert.doesNotMatch(declarations, /overflow(?:-x|-y)?:\s*(?:hidden|clip)/);
  }
});

test("settling removes blur and uses shared resting spacing with the existing responsive tilt and scale", () => {
  const frames = entrance.slice(entrance.indexOf("@keyframes hero-preview-in"));
  assert.match(frames, /from \{ opacity: 0; filter: blur\(var\(--hero-preview-blur\)\); transform: translateX\(var\(--hero-preview-enter-x\)\) translateY\(8px\) scale\(var\(--hero-preview-scale\)\); \}/);
  assert.match(frames, /to \{ opacity: 1; filter: blur\(0\); \}/);
  assert.doesNotMatch(frames.match(/to \{([^}]+)\}/)[1], /transform:/);
  assert.ok(parseFloat(token(mediaRule, "hero-preview-blur")) <= 3);
  assert.doesNotMatch(entrance, /will-change|\b(?:both|forwards|infinite)\b|(?:^|[;{])\s*(?:width|height|top|left|right|margin):/m);
  assert.ok(css.includes("transform: translateX(var(--hero-side-rest-inset)) rotateY(var(--hero-side-rest-tilt)) scale(var(--hero-side-rest-scale));"));
  assert.ok(css.includes("transform: translateX(calc(-1 * var(--hero-side-rest-inset))) rotateY(calc(-1 * var(--hero-side-rest-tilt))) rotateZ(calc(-1 * var(--hero-side-rest-roll))) scale(var(--hero-side-rest-scale));"));
  for (const pair of ["--hero-side-rest-scale: .88; --hero-side-rest-tilt: 12deg;", "--hero-side-rest-scale: .9; --hero-side-rest-tilt: 6deg;", "--hero-side-rest-scale: .94; --hero-side-rest-tilt: 3deg;"]) assert.ok(css.includes(pair));
  assert.match(css, /\.hero-result-left \{[^}]*transform-origin: right center;/);
  assert.match(css, /\.hero-result-right \{[^}]*transform-origin: left center;/);
});

test("reduced motion has no hero animation or delayed hidden state", () => {
  assert.ok(start >= 0 && depth === 0);
  assert.match(entrance, /from \{ opacity: 0; filter: blur\(3px\); transform: translateY\(8px\); \} to \{ filter: blur\(0\); \}/);
  const outsideEntrance = css.slice(0, start) + css.slice(end);
  assert.doesNotMatch(outsideEntrance, /hero-intro-in|hero-preview-in|\[data-hero-entrance\]|--hero-delay/);
  assert.doesNotMatch(hero, /style="[^\"]*(?:opacity|visibility|display|animation-delay):/);
});

test("no JavaScript shows the hero immediately and script failure cannot leave it hidden", () => {
  assert.match(html, /<noscript><style>\.hero \[data-hero-entrance\] \{ animation: none !important; \}<\/style><\/noscript>/);
  assert.match(entrance, /animation: hero-intro-in 360ms var\(--ease\) backwards;/);
  assert.doesNotMatch(entrance, /\b(?:both|forwards|infinite)\b|\.js|visibility: hidden|display: none/);
  assert.doesNotMatch(script, /data-hero-entrance|hero-title-word|hero-intro-in/);
});

test("keyboard focus reveals controls immediately and scrolling cannot replay the entrance", () => {
  assert.match(entrance, /\.hero \.download-button:focus-visible, \.hero \.hero-results:focus-within \[data-hero-entrance\] \{ animation: none; \}/);
  assert.doesNotMatch(entrance, /is-visible|:hover|animation-play-state/);
  assert.match(hero, /href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605" aria-label="Download for Mac" data-hero-entrance/);
  assert.doesNotMatch(hero, /disabled|inert|class="[^"]*reveal/);
});
