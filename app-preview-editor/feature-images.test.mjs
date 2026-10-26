import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const section = html.match(/<section class="capabilities section"[\s\S]*?<\/section>/)[0];
const cards = [...section.matchAll(/<article>([\s\S]*?)<\/article>/g)].map((match) => match[1]);

test("feature samples match their labels and declare their real image dimensions", async () => {
  const expected = [
    ["searchResultsSample.png", "Search Results Video", "Give people a reason to look closer."],
    ["productPageHeaderSample.png", "Product Page Header", "Set the scene for your app."],
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
