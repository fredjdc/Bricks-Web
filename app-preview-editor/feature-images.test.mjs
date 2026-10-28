import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { widths, declarations as decl } from "./responsive-checkpoints.mjs";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const css = await readFile(new URL("styles.css", import.meta.url), "utf8");
const section = html.match(/<section class="capabilities section"[\s\S]*?<\/section>/)[0];
const cards = [...section.matchAll(/<article>([\s\S]*?)<\/article>/g)].map((match) => match[1]);

test("feature samples match their labels and declare their real image dimensions", async () => {
  const expected = [
    ["searchResultsSample.png", "Search Results Video", "Give a reason to look."],
    ["productPageHeaderSample.png", "Product Page Header", "Set the scene."],
    ["In-AppEventsSample.png", "In-App Events", "Show what’s coming."],
  ];
  assert.equal(cards.length, expected.length);
  for (const [index, [file, label, title]] of expected.entries()) {
    const card = cards[index];
    const image = card.match(/<div class="capability-media"><img ([^>]+)>/)[1];
    assert.ok(image.includes(`src="assets/${file}"`));
    assert.ok(card.indexOf('class="capability-media"') < card.indexOf(label));
    assert.ok(card.includes(`<h3>${title}</h3>`));
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
    assert.match(image, /alt="[^"]+"/);
    const png = await readFile(new URL(`assets/${file}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(Number(image.match(/width="(\d+)"/)[1]), png.readUInt32BE(16));
    assert.equal(Number(image.match(/height="(\d+)"/)[1]), png.readUInt32BE(20));
  }
});

test("all three placement images fill equal square media areas with rounded clipping at every width", () => {
  const frame = css.match(/\.apes-landing \.capability-media \{([^}]+)\}/)[1];
  assert.match(frame, /aspect-ratio: 1;/);
  assert.match(frame, /overflow: hidden;/);
  for (const width of widths) assert.equal(decl(width, [".apes-landing .capability-media"])["border-radius"], "var(--media-radius)");
  assert.doesNotMatch(frame, /(?:^|;)\s*(?:height|padding):/);
  const image = css.match(/\.apes-landing \.capability-media img \{([^}]+)\}/)[1];
  assert.match(image, /width: 100%; height: 100%;/);
  assert.match(image, /object-fit: contain;/);
  assert.doesNotMatch(image, /border-radius:/);
  for (const [, rule] of css.matchAll(/\.apes-landing \.capability-media \{([^}]+)\}/g)) {
    assert.doesNotMatch(rule, /(?:^|;)\s*height:/);
  }
  assert.match(css, /\.apes-landing \.capability-grid \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});
