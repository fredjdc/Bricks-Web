import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);

assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
assert.match(html, /<div class="hero-workflow">\s*<video/);
assert.doesNotMatch(html, /hero-visual|hero-parallax/);
assert.doesNotMatch(html, /proof-strip|proof-grid/);
assert.doesNotMatch(styles, /proof-strip|proof-grid/);
assert.match(html, /<source src="assets\/hero-demo\.mp4" type="video\/mp4">[\s\S]*?<\/section>\s*<section class="result-section section shell"/);
assert.match(html, /<h2 id="result-title">See what you can create for the App Store\.<\/h2>/);
assert.match(html, /From App Previews to promotional videos, give your app a polished presentation that shows what makes it worth a closer look\./);
assert.match(html, /<video id="finished-preview-video"[^>]*poster="assets\/heroResultiphone\.png"[\s\S]*?<source src="assets\/heroResultiphone\.mp4" type="video\/mp4">/);


const sectionOrder = [...html.matchAll(/<section class="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(sectionOrder, ["hero shell", "result-section section shell", "workflow section", "capabilities section", "product-tour section shell", "delivery section shell", "faq section shell", "final-cta section shell"]);
assert.doesNotMatch(html, /data-philosophy|data-count-from|problem-section/);
const productTourStart = html.indexOf('<section class="product-tour');
const storyOrder = ["Update the screen. Keep the work.", "Keep your versions together."];
assert.ok(storyOrder.every((title) => html.includes(title)));
assert.ok(html.indexOf(storyOrder[0], productTourStart) < html.indexOf(storyOrder[1], productTourStart));
for (const [video, poster] of [
  ["media-replace", "replace-media"],
  ["app-preview-variants", "project-variants"],
]) {
  assert.match(html, new RegExp(`<video[^>]*poster="assets/product/${poster}\\.png"[^>]*data-autoplay-video[^>]*>[\\s\\S]*?<source src="assets/${video}\\.mp4" type="video/mp4">`));
}

for (const forbidden of [/waitlist/i, /every Apple platform/i]) {
  assert.doesNotMatch(html, forbidden);
}

for (const [name, poster, align] of [
  ["drop-demo", "drop-import", "left"],
  ["edit-demo", "edit-timeline", "center"],
]) {
  assert.match(html, new RegExp(`data-workflow-video="assets/${name}\\.mp4" data-workflow-poster="assets/product/${poster}\\.png" data-workflow-align="${align}"`));
}

const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
assert.doesNotMatch(header, /nav-link|nav-menu/);
assert.equal(header.match(/<a /g)?.length, 2);
assert.match(header, /App Preview Editor/);
assert.match(header, /Download/);
const heroDemo = html.match(/<div class="hero-workflow">([\s\S]*?)<\/div>/)[1];
assert.doesNotMatch(heroDemo, /<button|media-toggle|data-adjacent-video-button/);
assert.equal(html.match(/data-adjacent-video-button/g)?.length, 6);
assert.match(html, /<video id="finished-preview-video"[^>]*muted loop playsinline data-autoplay-video role="button" tabindex="0"/);
assert.doesNotMatch(html, /data-video-button/);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.doesNotMatch(html, /class="native-section|<h2>Built natively for Mac\.<\/h2>/);
assert.doesNotMatch(html, /mac-native\.mp4|product\/mac-native\.png|class="native-media"/);
assert.match(script, /workflowVideo\.dataset\.videoAlign = step\.dataset\.workflowAlign/);
assert.match(script, /video\.addEventListener\("click", togglePlayback\)/);
assert.match(script, /video\.addEventListener\("keydown"/);
assert.match(script, /video\.addEventListener\("playing", \(\) => \{ poster\.hidden = true; \}\)/);
assert.match(script, /video\.addEventListener\("(?:loadstart|error)", \(\) => showVideoPoster\(video\)\)/);
assert.match(script, /workflowVideo\.poster = step\.dataset\.workflowPoster;\s+showVideoPoster\(workflowVideo\);/);
assert.match(styles, /\.video-poster \{ position: absolute; inset: 0;[^}]+pointer-events: none;/);
assert.match(styles, /\.product-story video \{ height: auto; aspect-ratio: 16 \/ 9; \}/);
assert.match(styles, /\.capabilities \{ padding-block: 104px; \}/);
assert.match(styles, /@media \(min-width: 900px\)[\s\S]*?\.capabilities \{ padding-block: 148px; \}/);
assert.ok(html.indexOf('aria-label="From the developer"') < html.indexOf('<section class="workflow'));
assert.match(styles, /\[data-video-align="left"\]\s*\{\s*object-position:\s*left center;/);
assert.match(styles, /\[data-video-align="right"\]\s*\{\s*object-position:\s*right center;/);

assert.match(html, /data-autoplay-video role="button" tabindex="0" aria-label="Play editor demo"/);
assert.match(script, /querySelectorAll\("\.hero-workflow video, #finished-preview-video"\)/);
