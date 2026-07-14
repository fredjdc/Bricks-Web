import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);

assert.equal(html.match(/<h1(?:\s|>)/g)?.length, 1);
assert.equal(html.match(/<form[^>]*data-signup-form/g)?.length, 2);
assert.equal(html.match(/name="signup_intent" value="beta"/g)?.length, 2);
assert.equal(html.match(/Get Beta Access/g)?.length, 3);
assert.equal(html.match(/Beta is open\. Applications are reviewed manually\./g)?.length, 2);
assert.equal(html.match(/What are you building\?/g)?.length, 2);
assert.equal(html.match(/App or website \(optional\)/g)?.length, 2);
assert.equal(html.match(/What's the hardest part about creating App Preview videos\?/g)?.length, 2);
assert.match(html, /Ready to spend less time making App Previews\?/);
assert.equal(html.match(/data-beta-back/g)?.length, 2);
assert.match(html, /data-beta-cta/);
assert.doesNotMatch(html, /<fieldset|type="radio"|value="launch"|launch_updates|Notify me|Choose an option/);
assert.doesNotMatch(html, /hero-workflow|hero-visual|hero-parallax/);
assert.match(script, /email\.scrollIntoView/);
assert.match(script, /Add a short answer so we can review your application\./);
assert.match(script, /Thanks! Your application has been received\. We'll review it and contact you by email if you're selected\./);
assert.doesNotMatch(script, /selectedIntent|validateIntent|helperText|buttonText/);

const workflowEnd = html.indexOf("</section>", html.indexOf('<section class="workflow'));
const philosophyStart = html.indexOf('<section class="philosophy');
const productTourStart = html.indexOf('<section class="product-tour');
assert.ok(workflowEnd < philosophyStart && philosophyStart < productTourStart);

const storyOrder = ["Skip the empty timeline.", "Update without starting over.", "One project. Every App Preview."];
assert.deepEqual([...storyOrder].sort((a, b) => html.indexOf(a, productTourStart) - html.indexOf(b, productTourStart)), storyOrder);

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

assert.equal(html.match(/data-adjacent-video-button/g)?.length, 5);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.match(script, /workflowVideo\.dataset\.videoAlign = step\.dataset\.workflowAlign/);
assert.match(styles, /\[data-video-align="left"\]\s*\{\s*object-position:\s*left center;/);
assert.match(styles, /\[data-video-align="right"\]\s*\{\s*object-position:\s*right center;/);
