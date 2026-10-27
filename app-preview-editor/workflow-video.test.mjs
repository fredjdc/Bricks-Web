import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);

assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
const hero = html.match(/<section class="hero shell"[\s\S]*?<\/section>/)[0];
const showcase = html.match(/<section class="result-section section shell"[\s\S]*?<\/section>/)[0];
assert.doesNotMatch(html, /hero-visual|hero-parallax|proof-strip|proof-grid/);
assert.doesNotMatch(styles, /proof-strip|proof-grid/);
for (const [file, poster] of [["heroResultLeft", "left"], ["heroResult", "center"], ["heroResultRight", "right"]]) {
  assert.ok(hero.includes(`data-src="assets/${file}.mp4"`));
  assert.ok(hero.includes(`poster="assets/product/hero-result-${poster}.png"`));
  assert.ok((await stat(new URL(`assets/${file}.mp4`, import.meta.url))).size > 0);
  assert.ok((await stat(new URL(`assets/product/hero-result-${poster}.png`, import.meta.url))).size > 0);
}
assert.doesNotMatch(hero, /hero-demo|preload="metadata"|<source src=/);
assert.match(showcase, /<h2 id="result-title">Your app\. Your story\.<\/h2>/);
assert.match(showcase, /class="result-media editor-composition"/);
assert.match(showcase, /src="assets\/desktop-bg\.png" width="2560" height="1080"/);
assert.match(showcase, /src="assets\/app-preview-editor-app\.png" width="1920" height="986"/);
assert.match(showcase, /data-editor-preview-target/);
assert.doesNotMatch(showcase, /<video|finished-preview-video|hero-demo\.mp4/);

const sectionOrder = [...html.matchAll(/<section class="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(sectionOrder, ["hero shell", "result-section section shell", "workflow section", "capabilities section", "product-tour section shell", "delivery section shell", "pricing section shell", "faq section shell", "final-cta section shell"]);
assert.doesNotMatch(html, /data-philosophy|data-count-from|problem-section/);
const productTourStart = html.indexOf('<section class="product-tour');
const storyOrder = ["Update the screen. Keep the work.", "Keep your timelines together."];
assert.ok(storyOrder.every((title) => html.includes(title)));
assert.ok(html.indexOf(storyOrder[0], productTourStart) < html.indexOf(storyOrder[1], productTourStart));
for (const still of ["replace-media", "project-variants", "upload-validation"]) assert.match(html, new RegExp(`<img class="feature-media-image" src="assets/product/${still}\\.png"`));

for (const forbidden of [/waitlist/i, /every Apple platform/i]) {
  assert.doesNotMatch(html, forbidden);
}

for (const step of ["import", "edit"]) assert.match(html, new RegExp(`data-workflow-step="${step}"`));

const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
assert.doesNotMatch(header, /nav-link|nav-menu/);
assert.equal(header.match(/<a /g)?.length, 2);
assert.match(header, /App Preview Editor/);
assert.match(header, /Download/);
assert.doesNotMatch(hero, /<button|media-toggle|data-adjacent-video-button/);
assert.doesNotMatch(html, /data-adjacent-video-button|data-workflow-video-button|data-workflow-video|data-workflow-frame/);
assert.equal((html.match(/<video\b/g) || []).length, 3);
assert.match(hero, /<video id="finished-preview-video"[^>]*data-playback-toggle[^>]*role="button" tabindex="0"/);
assert.doesNotMatch(html, /data-video-button/);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.doesNotMatch(html, /class="native-section|<h2>Built natively for Mac\.<\/h2>/);
assert.doesNotMatch(html, /mac-native\.mp4|product\/mac-native\.png|class="native-media"/);
assert.match(script, /frame\.classList\.toggle\("is-active", i === index\)/);
assert.match(script, /video\.addEventListener\("click", togglePlayback\)/);
assert.match(script, /video\.addEventListener\("keydown"/);
assert.match(script, /video\.addEventListener\("playing", \(\) => \{ poster\.hidden = true; \}\)/);
assert.match(script, /video\.addEventListener\("(?:loadstart|error)", \(\) => showVideoPoster\(video\)\)/);
assert.match(script, /!incoming\.complete \|\| incoming\.naturalWidth <= 0/);
assert.match(styles, /\.video-poster \{ position: absolute; inset: 0;[^}]+pointer-events: none;/);
assert.match(styles, /\.feature-media-image \{ display: block; width: 100%; height: auto;/);
assert.doesNotMatch(styles, /scale\(1\.035\)/);
assert.match(styles, /\.capabilities \{ padding-block: 104px; \}/);
assert.match(styles, /@media \(min-width: 900px\)[\s\S]*?\.capabilities \{ padding-block: 148px; \}/);
const founder = html.match(/<aside class="founder-note[\s\S]*?<\/aside>/)?.[0];
assert.ok(founder, "The developer section must be present");
assert.match(html.slice(html.indexOf(founder) + founder.length), /^\s*<\/main>\s*<footer\b/, "The developer section must be the final content before the footer");
assert.doesNotMatch(script, /setWorkflowUserPaused|connectVideoButton|data-workflow-media|data-workflow-frame/);

assert.match(showcase, /role="img" aria-label="App Preview Editor with an app preview centered on its editing canvas"/);
assert.match(script, /querySelectorAll\("\[data-playback-toggle\]"\)/);
