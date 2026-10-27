import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { widths, declarations as decl, fluidWidth } from "./responsive-checkpoints.mjs";

const [html, css, script, wind] = await Promise.all(["index.html", "styles.css", "script.js", "wind-files.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const images = [...html.matchAll(/<img\b([^>]*class="feature-media-image[^>]+)>/g)].map(([, attrs]) => ({
  attrs, src: attrs.match(/src="([^"]+)"/)[1], width: +attrs.match(/width="(\d+)"/)[1], height: +attrs.match(/height="(\d+)"/)[1],
}));

test("exactly five requested illustrations use their current PNGs at verified intrinsic dimensions, including mobile copies", async () => {
  assert.equal(images.length, 7);
  const counts = { "drop-import": 2, "edit-timeline": 2, "replace-media": 1, "project-variants": 1, "upload-validation": 1 };
  for (const [name, count] of Object.entries(counts)) {
    const matching = images.filter(image => image.src === `assets/product/${name}.png`);
    assert.equal(matching.length, count);
    const bytes = await readFile(new URL(`assets/product/${name}.png`, import.meta.url));
    for (const image of matching) {
      assert.equal(image.width, bytes.readUInt32BE(16)); assert.equal(image.height, bytes.readUInt32BE(20));
      assert.match(image.attrs, /alt="[^"]+"/); assert.match(image.attrs, /loading="lazy" decoding="async"/);
      assert.doesNotMatch(image.attrs, /poster=|preload=|data-autoplay|data-src|data-video/);
    }
  }
});

test("the five converted sections stay image-only alongside the three hero videos and dedicated Scene Clips demo", () => {
  const hero = html.match(/<section class="hero shell"[\s\S]*?<\/section>/)[0];
  assert.equal((html.match(/<video\b/g) || []).length, 4);
  assert.equal((hero.match(/<video\b/g) || []).length, 3);
  assert.equal((html.match(/<source[^>]+type="video\/mp4"/g) || []).length, 4);
  assert.doesNotMatch(html, /(?:drop-demo|edit-demo|media-replace|app-preview-variants|upload-demo)\.mp4/);
  for (const section of ["workflow section", "product-tour section shell", "delivery section shell"]) {
    const block = html.match(new RegExp(`<section class="${section}"[\\s\\S]*?</section>`))[0];
    assert.doesNotMatch(block, /<video|<source|<button|media-toggle|poster=|preload=/);
  }
  assert.match(hero, /data-playback-toggle[^>]*role="button" tabindex="0"/);
  assert.doesNotMatch(script, /data-workflow-video|data-workflow-media|data-workflow-frame|data-adjacent-video-button/);
});

test("responsive stills preserve their full frame and rounded edges; no-JS and reduced motion show both workflow images", () => {
  for (const width of widths) {
    const media = decl(width, [".feature-media-image"]);
    assert.equal(media.width, "100%"); assert.equal(media.height, "auto"); assert.equal(media["object-fit"], "contain");
    assert.equal(media["border-radius"], "var(--radius-large)"); assert.equal(media["aspect-ratio"], undefined);
    const shell = fluidWidth(width, decl(width, [".shell"]).width);
    const workflow = shell - 2 - (width >= 900 ? 96 : width < 560 ? 40 : 48);
    const available = width < 900 ? workflow : workflow - 48 - Math.max(280, (workflow - 48) * .8 / 2.05);
    assert.ok(available > 0 && available < width);
    for (const image of images) {
      const height = available * image.height / image.width;
      assert.ok(Number.isFinite(height) && height > 0);
      assert.ok(Math.abs(available / image.width - height / image.height) < 1e-9);
    }
    assert.equal(decl(width, ["html:not(.js) #workflow .workflow-media"]).display, "none");
    assert.equal(decl(width, ["html:not(.js) #workflow .mobile-workflow-media-wrap"]).display, "block");
    assert.equal(decl(width, ["#workflow .workflow-media"], true).display, "none");
    assert.equal(decl(width, ["#workflow .mobile-workflow-media-wrap"], true).display, "block");
  }
  assert.match(css, /#workflow \.workflow-frames \{[^}]*overflow: hidden;[^}]*border-radius: var\(--radius-large\);/);
});

test("wind lands on the active Import image and remeasures on image loading without playback dependencies", () => {
  assert.match(wind, /querySelector\("#workflow-import-image"\)/);
  assert.match(wind, /\[data-workflow-step="import"\] \.mobile-workflow-media/);
  assert.match(wind, /desktop\.matches && !frame\?\.classList\.contains\("is-active"\)/);
  assert.match(wind, /\[desktopTarget, mobileTarget\]\.forEach\(image => image\?\.addEventListener\("load", schedule\)\)/);
  assert.doesNotMatch(wind, /workflow-import-video|data-workflow-video|loadedmetadata|workflowActive/);
  assert.match(html, /id="workflow-import-image" class="feature-media-image"/);
});
