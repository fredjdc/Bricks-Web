import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { widths } from "./responsive-checkpoints.mjs";

const [html, css, script] = await Promise.all(["index.html", "styles.css", "script.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const delivery = html.match(/<section class="delivery section shell"[\s\S]*?<\/section>/)[0];
const row = delivery.match(/<ul class="device-support"[^>]*>[\s\S]*?<\/ul>/)[0];
const items = [...row.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, item]) => item);
const supportingCopy = "Create app previews for iPhone, including iPhone Duo, iPad, Mac, and Apple Vision Pro.";
const stripTags = value => value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();

test("the output device row follows the formats heading and preserves the existing export and upload copy", () => {
  assert.deepEqual(items.map(item => item.match(/<span>([^<]+)<\/span>/)[1]), ["iPhone", "iPhone Duo", "iPad", "Mac", "Apple Vision Pro"]);
  const ordered = [
    '<h2 id="delivery-title">Built for App Store formats.</h2>',
    row,
    `<p>${supportingCopy}</p>`,
    "Review duration and format checks before exporting. Make any adjustments, then save the finished video to your Mac.",
    "Upload your finished video directly to App Store Connect.",
  ].map(value => { const index = delivery.indexOf(value); assert.ok(index >= 0); return index; });
  assert.deepEqual(ordered, [...ordered].sort((a, b) => a - b));
  assert.equal(html.split(supportingCopy).length - 1, 1);
  assert.match(row, /role="list" aria-label="Supported app preview devices"/);
  assert.doesNotMatch(row, /<h[1-6]|<a\b|<button|<video|<img|runs on|available on/i);
});

test("every device keeps its supplied decorative SVG image and exposed text label", async () => {
  const expected = ["iphone", "iphone-duo", "ipad", "mac", "vision-pro"];
  for (const [index, item] of items.entries()) {
    const image = item.match(/<img\b([^>]+)>/);
    assert.ok(image);
    assert.match(image[1], /alt="" aria-hidden="true"/);
    assert.match(image[1], new RegExp(`src="assets/icons/${expected[index]}\\.svg"`));
    assert.match(item.replace(image[0], ""), /<span>[^<]+<\/span>/);
    assert.doesNotMatch(item, /tabindex|role="img"|<svg/);
    const svg = await readFile(new URL(`assets/icons/${expected[index]}.svg`, import.meta.url), "utf8");
    assert.match(svg, /<path /);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|<animate/);
  }
});

test("only iPhone Duo has a small New badge using the shared palette and pill shape", () => {
  assert.match(items[1], /<span class="coming-soon-label device-new">New<\/span>/);
  assert.equal((row.match(/device-new/g) || []).length, 1);
  const sharedBadge = css.match(/\.coming-soon-label \{([^}]+)\}/)[1];
  assert.match(sharedBadge, /border-radius: var\(--ape-badge-radius\);/);
  assert.match(sharedBadge, /background: var\(--ape-badge-bg\); color: var\(--ape-badge-text\);/);
  assert.match(css, /--ape-badge-bg: #facc15;/);
  assert.match(css, /--ape-badge-text: #0b0f14;/);
  assert.match(css, /--ape-badge-radius: 999px;/);
  const badge = css.match(/\.device-support \.device-new \{([^}]+)\}/)[1];
  assert.match(badge, /font-size: \.625rem;/);
  assert.doesNotMatch(badge, /(?:^|;)\s*(?:color|background|border-radius):/);
});

test("all FAQ answers match valid JSON-LD and the device answer keeps the Mac runtime distinction", () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json));
  const faq = blocks.flatMap(schema => schema["@graph"] || [schema]).find(schema => schema["@type"] === "FAQPage");
  const answers = [...html.matchAll(/<details name="faq"><summary>(.*?)<\/summary>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/details>/g)];
  assert.equal(faq.mainEntity.length, answers.length);
  for (const question of faq.mainEntity) {
    const answer = answers.find(([, summary]) => summary === question.name);
    assert.ok(answer, question.name);
    assert.equal(stripTags(answer[2]), question.acceptedAnswer.text);
  }
  assert.equal(faq.mainEntity.find(question => question.name === "Which devices can I create app previews for?").acceptedAnswer.text,
    "App Preview Editor runs on Mac. Create app previews for iPhone, iPhone Duo, iPad, Mac, and Apple Vision Pro, and keep separate device and language timelines in one project.");
});

test("five equal device columns remain in one row at every requested responsive width", () => {
  const list = css.match(/\.apes-landing \.device-support \{([^}]+)\}/)[1];
  assert.match(list, /display: grid; grid-template-columns: repeat\(5, minmax\(0, 1fr\)\);/);
  assert.match(list, /--device-icon-height: 26px;/);
  assert.match(list, /gap: clamp\(4px, 1vw, 8px\);/);
  assert.match(list, /margin: 24px 0; padding: 0; list-style: none;/);
  const item = css.match(/\.apes-landing \.device-support li \{([^}]+)\}/)[1];
  assert.match(item, /min-width: 0;/);
  assert.match(item, /margin: 0; padding: 0;/);
  assert.doesNotMatch(item, /flex-basis:|flex:|max-width:|white-space:|overflow:/);
  assert.match(css, /\.apes-landing \.device-support li::before \{ display: none; \}/);
  assert.match(css, /\.device-support li > span \{ max-width: 100%; overflow-wrap: anywhere; text-wrap: balance; \}/);
  assert.match(css, /\.device-support img \{ display: block; flex: none; width: auto; height: var\(--device-icon-height\); object-fit: contain; \}/);
  // Model the existing shell, copy cap, and desktop 0.7fr/1.3fr split.
  assert.match(css, /--shell: 1180px;/);
  assert.match(css, /\.shell \{ width: min\(calc\(100% - 32px\), var\(--shell\)\);/);
  assert.match(css, /\.story-copy \{ max-width: 590px;/);
  assert.match(css, /\.product-story \{ grid-template-columns: minmax\(280px, 0.7fr\) minmax\(0, 1.3fr\); gap: 72px;/);
  assert.match(css, /\.apes-landing \.product-story \{ gap: 56px;/);
  for (const viewport of widths) {
    const shell = Math.min(viewport - (viewport < 560 ? 32 : 48), 1180);
    const copy = Math.min(590, viewport >= 900 ? Math.max(280, (shell - 56) * .35) : shell);
    const gap = Math.max(4, Math.min(8, viewport * .01));
    const column = (copy - gap * 4) / 5;
    const icon = 26 * 1802.98 / 1002.75;
    assert.ok(column >= icon, `${viewport}px: icon must fit its column`);
    assert.ok(column >= 42, `${viewport}px: conservative New badge width including padding/border fits`);
    assert.ok(Math.abs(column * 5 + gap * 4 - copy) < .0001, `${viewport}px: all five columns fit without another row`);
    assert.ok(icon < 48 && copy <= shell, `${viewport}px: normalized artwork and no row overflow`);
  }
  const deviceRules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([, selector]) => selector.includes(".device-support"));
  for (const [, , declarations] of deviceRules) assert.doesNotMatch(declarations, /position: absolute|overflow: hidden|white-space: nowrap|grid-column:|grid-row:|flex-wrap:/);
  assert.doesNotMatch(css, /\.device-support[^{}]*:nth-(?:child|of-type)/);
});

test("the supplied silhouettes share a visible height without stretched proportions or padded Mac/goggles", async () => {
  const dimensions = [[802.065, 1342.75, 1341.67], [1514.57, 1176, 1175.742909], [1060.45, 1433.08, 1433.0277743], [2180.1063, 1277.848, 1277.848], [1802.98, 1002.75, 1002.75]];
  const heights = [];
  for (const [index, item] of items.entries()) {
    const source = item.match(/src="([^" ]+)"/)[1];
    const svg = await readFile(new URL(source, import.meta.url), "utf8");
    const box = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
    assert.equal(box[2], dimensions[index][0]); assert.equal(box[3], dimensions[index][1]);
    const visibleHeight = 26 * dimensions[index][2] / box[3];
    heights.push(visibleHeight);
    assert.ok(Math.abs(visibleHeight - 26) < .03);
    assert.ok(26 * box[2] / box[3] < 48, "Native proportions fit the narrowest column");
    assert.match(svg, /fill="black" fill-opacity="0\.85"/);
  }
  assert.ok(Math.max(...heights) - Math.min(...heights) < .03);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\s*\.feature-title-icon \{ filter: invert\(1\);/);
});

test("the existing reveal observer handles the row once as a unit with no nested animation or hidden fallback", () => {
  assert.match(script, /const selector = "h2, h3, p, \.device-support,/);
  assert.doesNotMatch(row, /class="[^\"]*reveal[^\"]*"|style=|\bhidden\b(?!="true")/);
  for (const [, declarations] of css.matchAll(/\.apes-landing \.device-support[^{}]*\{([^}]+)\}/g)) {
    assert.doesNotMatch(declarations, /(?:opacity|visibility|animation|transition|filter):/);
  }
});
