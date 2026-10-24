import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const hero = html.match(/<div class="hero-copy">([\s\S]*?)<div class="hero-workflow">/)[1];
assert.match(hero, /Show your app/);
assert.match(hero, /at its best\./);
assert.match(hero, /Create and update App Store preview videos and promotional visuals in one place\./);
assert.equal((hero.match(/<p\b/g) ?? []).length, 2);
assert.equal((html.match(/No account required\./g) ?? []).length, 2);
assert.equal((html.match(/<a[^>]*download-button[^>]*href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605"/g) ?? []).length, 3);
assert.equal((html.match(/src="\.\.\/images\/apple-icon-white\.svg"/g) ?? []).length, 3);
assert.equal((html.match(/srcset="\.\.\/images\/apple-icon-black\.svg"/g) ?? []).length, 3);
assert.match(html, /<span>App Preview Editor<\/span>/);
assert.doesNotMatch(html, /<form|beta|TestFlight|list-manage|hero-email|drops in extra clips to cover more features/i);
assert.doesNotMatch(script, /signup|mailchimp|FormData|beta-cta/i);
assert.match(html, /Built for App Store formats\./);
assert.match(html, /APEs checks video duration and format\. Review the results, then trim or adjust your video on the timeline\./);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
for (const question of faq.mainEntity) {
  assert.ok(html.includes(`<summary>${question.name}</summary>`));
  const answers = [...html.matchAll(/<details name="faq"><summary>(.*?)<\/summary>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/details>/g)];
  const answer = answers.find((match) => match[1] === question.name)?.[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");
  assert.equal(answer, question.acceptedAnswer.text);
}

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({name, price, priceCurrency}) => [name, price, priceCurrency]), [["Pro monthly — introductory pricing", "4.99", "USD"], ["Pro yearly — introductory pricing", "39.99", "USD"], ["Pro lifetime", "149.99", "USD"]]);
for (const price of ["$4.99", "$39.99", "$6.99", "$59.99", "$149.99"]) assert.ok(html.includes(price));
assert.doesNotMatch(html, /10.second|auto.renew|billed after|Scene Clips.*Pro.only/i);

assert.match(html, /Introductory pricing/);
assert.match(html, /Planned regular price: \$6\.99\/month/);
assert.match(html, /Planned regular price: \$59\.99\/year/);
assert.match(html, /Early subscribers keep their lower renewal price\./);
assert.doesNotMatch(html, /<s>|<del>|50%|30.days|limited.time|offer ends|resubscribe|plan.switch|first.billing.period/i);

assert.equal((html.match(/aria-label="Download for Mac"/g) ?? []).length, 3);

assert.match(html, /Your projects remain available to save and edit with Free after the trial\./);

assert.match(html, /It ends without an automatic charge\./);
assert.match(html, /The trial is managed locally on each Mac\./);

const pricing = html.match(/<section\b[^>]*\bid="download"[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(pricing, "The pricing section must be present");
const outsidePricing = html.replace(pricing, "").replaceAll("Apple Vision Pro", "");
const planLanguage = /\b(?:free|pro|trial|upgrade|watermarks?|watermarked|plans?|pricing|subscriptions?|introductory|renewals?)\b|Made with APEs/i;
assert.doesNotMatch(outsidePricing, planLanguage, "Plan, trial and watermark language belongs only in pricing");
for (const question of faq.mainEntity) {
  const copy = `${question.name} ${question.acceptedAnswer.text}`.replaceAll("Apple Vision Pro", "");
  assert.doesNotMatch(copy, planLanguage, "FAQ copy and structured answers must remain plan-free");
}
assert.match(pricing, /Start the 7 day Pro trial in the app/);

const comparison = pricing.match(/<table class="plan-comparison">([\s\S]*?)<\/table>/)?.[1];
assert.ok(comparison, "Pricing must include a semantic comparison table");
assert.match(comparison, /<caption>Compare Free and Pro<\/caption>/);
assert.equal((comparison.match(/scope="col"/g) ?? []).length, 3);
const cells = (cell) => cell.match(/aria-label="([^"]+)"/)?.[1] ?? cell.replace(/&shy;|\u00ad/g, "").replace(/<[^>]*>/g, "").trim();
const rows = [...comparison.matchAll(/<tr><th scope="row">(.*?)<\/th><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><\/tr>/g)];
assert.deepEqual(rows.map(([, feature, free, pro]) => [feature, cells(free), cells(pro)]), [
  ["All editing tools, including Scene Clips", "Included", "Included"],
  ["Save and edit projects", "Included", "Included"],
  ["H.264 and PNG exports", "Watermarked", "No watermark"],
  ["ProRes exports", "Not included", "Included"],
  ["Direct App Store Connect upload", "Not included", "Included"],
]);
assert.match(html, /Show your app in action in App Store search ads\./);
assert.match(html, /Showcase your next event\./);
assert.match(html, /Create videos for your Event Card and Event Details Page\./);
assert.match(html, /Upload your finished videos directly to App Store Connect\./);
assert.doesNotMatch(html, /supported App Store search placements|does not translate|guarantee (?:Apple’s )?approval|Uploading (?:doesn’t|does not) publish|Some uploads require|Export them to a folder/i);
