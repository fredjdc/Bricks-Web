import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.equal(html.match(/<video[^>]*data-toggle-video/g)?.length, 5);
assert.equal(html.match(/<video[^>]*data-video-align="left"/g)?.length, 2);
assert.equal(html.match(/<video[^>]*data-video-align="right"/g)?.length, 1);
assert.match(script, /video\.addEventListener\("click", togglePlayback\)/);
assert.match(script, /event\.key !== " " && event\.key !== "Enter"/);

for (const [name, poster, align] of [
  ["drop-demo", "drop-import", "left"],
  ["edit-demo", "edit-timeline", "center"],
  ["upload-demo", "upload-validation", "right"],
]) {
  assert.match(html, new RegExp(`data-workflow-video="assets/${name}\\.mp4" data-workflow-poster="assets/product/${poster}\\.png" data-workflow-align="${align}"`));
  const video = html.match(new RegExp(`<video[^>]*poster="assets/product/${poster}\\.png"[^>]*>[\\s\\S]*?<source src="assets/${name}\\.mp4"[\\s\\S]*?</video>`));
  assert.ok(video);
  assert.match(video[0], /data-toggle-video/);
  assert.doesNotMatch(video[0].split(">")[0], /\scontrols(?:\s|$)/);
}
assert.match(script, /workflowVideo\.dataset\.videoAlign = step\.dataset\.workflowAlign/);
assert.match(styles, /\[data-video-align="left"\]\s*\{\s*object-position:\s*left center;/);
assert.match(styles, /\[data-video-align="right"\]\s*\{\s*object-position:\s*right center;/);
