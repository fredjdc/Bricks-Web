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
  delay: Number(attributes.match(/--hero-delay:\s*(\d+)ms/)[1]),
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

test("the native heading retains its exact text, word spaces, and two responsive line groups", () => {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal(text(heading), "Bring your app to life on the App Store.");
  const lines = [...heading.matchAll(/<span class="hero-word">((?:<span class="hero-title-word"[^>]*>[^<]+<\/span>\s*)+)<\/span>/g)];
  assert.deepEqual(lines.map(([, line]) => text(line)), ["Bring your app to life", "on the App Store."]);
  const words = [...heading.matchAll(/<span class="hero-title-word"[^>]*>([^<]+)<\/span>/g)];
  assert.deepEqual(words.map(([, word]) => word), text(heading).split(" "));
  assert.doesNotMatch(heading, /aria-hidden|aria-label|role=|tabindex|<br|&nbsp;/);
  assert.match(html, /\.hero h1 \.hero-word \{ display: block; \}/);
  assert.match(css, /\.hero-title-word \{ display: inline-block; \}/);
});

test("nine words lead into subtitle, button, caption, and media within 1.8 seconds", () => {
  assert.equal(atoms.length, 13);
  assert.deepEqual(atoms.slice(0, 9).map(({ classes }) => classes), Array(9).fill("hero-title-word"));
  assert.deepEqual(atoms.map(({ delay }) => delay), [0, 60, 120, 180, 240, 300, 360, 420, 480, 860, 1060, 1220, 1380]);
  assert.deepEqual(atoms.slice(9).map(({ classes }) => classes), ["hero-lede hero-intro-secondary", "button download-button", "download-caption", "hero-results"]);
  const duration = Number(entrance.match(/animation: hero-intro-in (\d+)ms/)[1]);
  const mediaDuration = Number(entrance.match(/\.hero \.hero-results \{ animation-duration: (\d+)ms;/)[1]);
  assert.ok(atoms[8].delay + duration <= atoms[9].delay, "Finish the title before starting the subtitle");
  assert.equal(atoms.at(-1).delay + mediaDuration, 1800);
  assert.match(entrance, /animation-delay: var\(--hero-delay, 0ms\)/);
  assert.doesNotMatch(entrance, /\.hero-word:nth-child|\.hero-intro-detail \{/);
});

test("reduced motion has no hero animation or delayed hidden state", () => {
  assert.ok(start >= 0 && depth === 0);
  assert.match(entrance, /from \{ opacity: 0; transform: translateY\(8px\); \}/);
  const outsideEntrance = css.slice(0, start) + css.slice(end);
  assert.doesNotMatch(outsideEntrance, /hero-intro-in|\[data-hero-entrance\]|--hero-delay/);
  assert.doesNotMatch(hero, /style="[^\"]*(?:opacity|visibility|display|animation-delay):/);
});

test("no JavaScript shows the hero immediately and script failure cannot leave it hidden", () => {
  assert.match(html, /<noscript><style>\.hero \[data-hero-entrance\] \{ animation: none !important; \}<\/style><\/noscript>/);
  assert.match(entrance, /animation: hero-intro-in 360ms var\(--ease\) backwards;/);
  assert.doesNotMatch(entrance, /\b(?:both|forwards|infinite)\b|\.js|visibility: hidden|display: none/);
  assert.doesNotMatch(script, /data-hero-entrance|hero-title-word|hero-intro-in/);
});

test("keyboard focus reveals controls immediately and scrolling cannot replay the entrance", () => {
  assert.match(entrance, /\.hero :is\(\.download-button:focus-visible, \.hero-results:focus-within\) \{ animation: none; \}/);
  assert.doesNotMatch(entrance, /is-visible|:hover|animation-play-state/);
  assert.match(hero, /href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605" aria-label="Download for Mac" data-hero-entrance/);
  assert.doesNotMatch(hero, /disabled|inert|class="[^"]*reveal/);
});
