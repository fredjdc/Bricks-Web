import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
]);
assert.doesNotMatch(html, /<video[^>]*\scontrols(?:\s|>)/);
assert.equal(html.match(/<video[^>]*data-toggle-video/g)?.length, 5);
assert.match(script, /video\.addEventListener\("click", togglePlayback\)/);
assert.match(script, /event\.key !== " " && event\.key !== "Enter"/);

for (const [name, poster] of [
  ["drop-demo", "drop-import"],
  ["edit-demo", "edit-timeline"],
  ["upload-demo", "upload-validation"],
]) {
  assert.match(html, new RegExp(`data-workflow-video="assets/${name}\\.mp4" data-workflow-poster="assets/product/${poster}\\.png"`));
  const video = html.match(new RegExp(`<video[^>]*poster="assets/product/${poster}\\.png"[^>]*>[\\s\\S]*?<source src="assets/${name}\\.mp4"[\\s\\S]*?</video>`));
  assert.ok(video);
  assert.match(video[0], /data-toggle-video/);
  assert.doesNotMatch(video[0].split(">")[0], /\scontrols(?:\s|$)/);
}
