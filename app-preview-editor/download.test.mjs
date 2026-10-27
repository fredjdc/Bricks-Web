import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const hero = html.match(/<div class="hero-copy">([\s\S]*?)<div class="hero-results"/)[1];
const heroText = hero.replace(/<[^>]*>/g, "");
assert.match(heroText, /Bring your app to life/);
assert.match(heroText, /on the App Store\./);
assert.match(hero, /Create videos for your product page, search results, and in-app events\. Keep them up to date as your app evolves\./);
assert.equal((hero.match(/<p\b/g) ?? []).length, 2);
assert.match(hero, /No app account required\./);
assert.equal((html.match(/<a[^>]*download-button[^>]*href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605"/g) ?? []).length, 3);
assert.equal((html.match(/src="\.\.\/images\/apple-icon-white\.svg"/g) ?? []).length, 2);
assert.equal((html.match(/srcset="\.\.\/images\/apple-icon-black\.svg"/g) ?? []).length, 2);
assert.match(html, /<span>App Preview Editor<\/span>/);
assert.doesNotMatch(html, /<form|beta|TestFlight|list-manage|hero-email|drops in extra clips to cover more features/i);
assert.doesNotMatch(script, /signup|mailchimp|FormData|beta-cta/i);
assert.match(html, /Built for App Store formats\./);
assert.match(html, /It checks video duration and format\. Review the results and make any needed changes before exporting\./);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
for (const question of faq.mainEntity) {
  assert.ok(html.includes(`<summary>${question.name}</summary>`));
  const answers = [...html.matchAll(/<details name="faq"><summary>(.*?)<\/summary>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/details>/g)];
  const answer = answers.find((match) => match[1] === question.name)?.[2].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");
  assert.equal(answer, question.acceptedAnswer.text);
}

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({name, price, priceCurrency}) => [name, price, priceCurrency]), [["Pro monthly", "4.99", "USD"], ["Pro yearly", "39.99", "USD"], ["Pro lifetime", "149.99", "USD"]]);
for (const price of ["$4.99", "$39.99", "$149.99"]) assert.ok(html.includes(price));
assert.doesNotMatch(html, /10.second|no auto(?:matic)?.?charg|no payment details|billed after/i);

assert.doesNotMatch(html, /introductory (?:subscription )?pricing|limited time|price-saving|<s>|\$6\.99|\$59\.99/i);
assert.doesNotMatch(html, /Early subscribers keep their lower renewal price|Planned regular price:/);
assert.doesNotMatch(html, /<del>|50%|30.days|offer ends|resubscribe|plan.switch|first.billing.period/i);

assert.equal((html.match(/aria-label="Download for Mac"/g) ?? []).length, 3);



const pricing = html.match(/<section\b[^>]*\bid="download"[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(pricing, "The pricing section must be present");
const approvedHeroCaption = '<p class="download-caption" data-hero-entrance style="--hero-delay: 1220ms">7-day free trial for eligible new subscribers. No app account required.</p>';
assert.equal(hero.split(approvedHeroCaption).length - 1, 1, "The approved trial caption must appear once in the hero");
assert.equal(html.split(approvedHeroCaption).length - 1, 1);
assert.match(html, /Pro also includes ProRes 422 HQ MOV exports\./);
assert.match(pricing, /7-day free trial for eligible new subscribers\. Subscriptions auto-renew unless canceled\. All prices in USD\./);
assert.match(pricing, /Pro includes premium Scene Clips, with new scenes added in every update\./);

const comparison = pricing.match(/<table class="plan-comparison"[^>]*>([\s\S]*?)<\/table>/)?.[1];
assert.ok(comparison, "Pricing must include a semantic comparison table");
assert.equal((comparison.match(/scope="col"/g) ?? []).length, 3);
const cells = (cell) => cell.match(/aria-label="([^"]+)"/)?.[1] ?? cell.replace(/&shy;|\u00ad/g, "").replace(/<[^>]*>/g, "").trim();
const rows = [...comparison.matchAll(/<tr><th scope="row">(.*?)<\/th><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><\/tr>/g)];
assert.deepEqual(rows.map(([, feature, free, pro]) => [feature, cells(free), cells(pro)]), [
  ["Basic Scene Clips", "Included", "Included"],
  ["Video export", "Included", "Included"],
  ["Image export", "Included", "Included"],
  ["Pro Scene Clips", "Not included", "Included"],
  ["Watermark-free exports", "Not included", "Included"],
  ["ProRes video export", "Not included", "Included"],
  ["Direct App Store Connect upload", "Not included", "Included"],
]);
assert.match(html, /Highlight your app’s core experience in a video for App Store search results\. Use supported video assets in Apple Ads, too\./);
assert.match(html, /Show what’s coming\./);
assert.match(html, /Create videos for your event card and event details page, from a major update to a special event\./);
assert.match(html, /Review duration and format checks before exporting\. Make any adjustments, then save the finished video to your Mac\./);
assert.doesNotMatch(html, /supported App Store search placements|does not translate|guarantee (?:Apple’s )?approval|Uploading (?:doesn’t|does not) publish|Some uploads require|Export them to a folder/i);

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({description}) => description), ["7-day free trial for eligible new subscribers, then $4.99/month. Auto-renews unless canceled.", "7-day free trial for eligible new subscribers, then $39.99/year. Auto-renews unless canceled.", "One-time purchase."]);

assert.match(pricing, /<h2 id="pricing-title">Pricing<\/h2>/);
assert.match(pricing, /<h2 id="included-title">What’s included<\/h2>/);
assert.ok(pricing.indexOf('class="pricing-options"') < pricing.indexOf('class="plan-comparison"'), "Purchase options must precede the feature comparison");
assert.match(pricing, /<table class="plan-comparison" aria-labelledby="included-title">/);

assert.deepEqual([...pricing.matchAll(/<s>(.*?)<\/s>/g)].map((match) => match[1]), []);

assert.deepEqual([...pricing.matchAll(/class="plan-detail">([^<]+)<\/dd>/g)].map((match) => match[1]), ["7 days free, then $4.99/month.", "7 days free, then $39.99/year.", "One-time purchase."]);
const lifetime = pricing.match(/<div><dt>Lifetime<\/dt>[\s\S]*?<\/div>/)[0];
assert.doesNotMatch(lifetime, /trial|free|\/month|\/year/i);
