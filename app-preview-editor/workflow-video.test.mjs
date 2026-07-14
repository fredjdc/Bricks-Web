import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);

assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
assert.equal(html.match(/<form[^>]*data-signup-form/g)?.length, 2);
assert.equal(html.match(/action="https:\/\/api\.web3forms\.com\/submit"/g)?.length, 2);
assert.equal(html.match(/name="access_key" value="ca61524d-2686-4509-b641-41657cb777c8"/g)?.length, 2);
assert.equal(html.match(/name="botcheck"/g)?.length, 2);
assert.equal(html.match(/name="signup_intent" value="beta"/g)?.length, 2);
assert.equal(html.match(/Get Beta Access/g)?.length, 3);
assert.equal(html.match(/Beta requests are reviewed before invitations are sent\./g)?.length, 2);
assert.equal(html.match(/What are you building\?/g)?.length, 2);
assert.equal(html.match(/App or website \(optional\)/g)?.length, 2);
assert.equal(html.match(/What's the hardest part about creating App Preview videos\?/g)?.length, 2);
assert.match(html, /Ready to spend less time making App Previews\?/);
assert.equal(html.match(/data-beta-back/g)?.length, 2);
assert.match(html, /data-beta-cta/);
assert.doesNotMatch(html, /<fieldset|type="radio"|value="launch"|launch_updates|Notify me|Choose an option/);
assert.match(html, /<img class="hero-workflow" src="assets\/product\/hero-workflow\.png" width="1480" height="925"/);
assert.ok(html.indexOf('class="hero-workflow"') > html.indexOf('</form>', html.indexOf('<section class="hero')));
assert.doesNotMatch(html, /hero-visual|hero-parallax/);
assert.match(script, /email\.scrollIntoView/);
assert.match(script, /Add a short answer so we can review your application\./);
assert.match(script, /Thanks! Your beta request has been received\. I’ll be in touch by email\./);
assert.match(script, /body: new FormData\(form\)/);
assert.doesNotMatch(script, /"Content-Type": "application\/json"/);
assert.match(script, /!\[true, "true"\]\.includes\(data\.success\)/);
assert.doesNotMatch(html, /formsubmit\.co/);
assert.match(html, /<script src="script\.js\?v=20260714-2" defer><\/script>/);
assert.doesNotMatch(html, /<iframe|target="(?:hero|final)_signup_target"/);
assert.doesNotMatch(script, /selectedIntent|validateIntent|helperText|buttonText/);

const workflowEnd = html.indexOf("</section>", html.indexOf('<section class="workflow'));
const philosophyStart = html.indexOf('<section class="philosophy');
const productTourStart = html.indexOf('<section class="product-tour');
assert.ok(workflowEnd < philosophyStart && philosophyStart < productTourStart);
assert.equal(html.match(/data-philosophy-line/g)?.length, 5);
assert.equal(html.match(/data-philosophy-trigger=/g)?.length, 5);
assert.match(html, /Just App Preview videos\.<\/p>\s*<p class="philosophy-summary">It’s not a smaller video editor\. It’s a better workflow for App Preview videos\.<\/p>/);
assert.match(script, /line\.classList\.toggle\("is-past", lineIndex < index\)/);
assert.match(styles, /\.philosophy-line\.is-active \{ opacity: 1; filter: blur\(0\); transform: none; \}/);
assert.match(styles, /\.philosophy-stage\.is-scroll-ready \{ position: relative; height: 300svh; \}/);
assert.match(styles, /\.philosophy-lines \{ position: sticky; top: 0; height: 100svh;/);
assert.match(styles, /\.philosophy-triggers \{ position: absolute; inset: 50svh 0;/);
const nearestLineSource = script.match(/const nearestPhilosophyLineIndex = .*;/)?.[0];
assert.ok(nearestLineSource);
const nearestLine = Function(`${nearestLineSource}; return nearestPhilosophyLineIndex;`)();
assert.equal(nearestLine([100, 200, 300, 400, 500], 310), 2);
assert.equal(nearestLine([250, 350], 300), 0);
assert.equal(nearestLine([-400, -300, -200, -100, 0], 0), 4);
assert.equal(nearestLine([600, 700, 800, 900, 1000], 500), 0);

const storyOrder = ["Skip the empty timeline.", "Update without starting over.", "One project. Every App Preview."];
assert.deepEqual([...storyOrder].sort((a, b) => html.indexOf(a, productTourStart) - html.indexOf(b, productTourStart)), storyOrder);
for (const [video, poster] of [
  ["app-preview-draft", "focused-tools"],
  ["media-replace", "replace-media"],
  ["app-preview-variants", "project-variants"],
]) {
  assert.match(html, new RegExp(`<video[^>]*poster="assets/product/${poster}\\.png"[^>]*data-autoplay-video[^>]*>[\\s\\S]*?<source src="assets/${video}\\.mp4" type="video/mp4">`));
}

for (const forbidden of [/waitlist/i, /App Store Preview/i, /every Apple platform/i]) {
  assert.doesNotMatch(html, forbidden);
}

for (const [name, poster, align] of [
  ["drop-demo", "drop-import", "left"],
  ["edit-demo", "edit-timeline", "center"],
  ["upload-demo", "upload-validation", "right"],
]) {
  assert.match(html, new RegExp(`data-workflow-video="assets/${name}\\.mp4" data-workflow-poster="assets/product/${poster}\\.png" data-workflow-align="${align}"`));
}

assert.equal(html.match(/data-adjacent-video-button/g)?.length, 7);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.doesNotMatch(html, /class="native-section|<h2>Built natively for Mac\.<\/h2>/);
assert.doesNotMatch(html, /mac-native\.mp4|product\/mac-native\.png|class="native-media"/);
assert.match(script, /workflowVideo\.dataset\.videoAlign = step\.dataset\.workflowAlign/);
assert.match(script, /video\.addEventListener\("playing", \(\) => \{ poster\.hidden = true; \}\)/);
assert.match(script, /video\.addEventListener\("(?:loadstart|error)", \(\) => showVideoPoster\(video\)\)/);
assert.match(script, /workflowVideo\.poster = step\.dataset\.workflowPoster;\s+showVideoPoster\(workflowVideo\);/);
assert.match(styles, /\.video-poster \{ position: absolute; inset: 0;[^}]+pointer-events: none;/);
assert.match(styles, /\.product-story video \{ height: auto; aspect-ratio: 16 \/ 9; \}/);
assert.match(styles, /\.capabilities \{ padding-block: 104px; \}/);
assert.match(styles, /@media \(min-width: 900px\)[\s\S]*?\.capabilities \{ padding-block: 148px; \}/);
assert.match(styles, /\.founder-note \{ margin: 48px 0 0;/);
assert.match(styles, /\[data-video-align="left"\]\s*\{\s*object-position:\s*left center;/);
assert.match(styles, /\[data-video-align="right"\]\s*\{\s*object-position:\s*right center;/);
