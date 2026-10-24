import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const hero = html.match(/<div class="hero-copy">([\s\S]*?)<div class="hero-results"/)[1];
assert.match(hero, /Show your app/);
assert.match(hero, /at its best\./);
assert.match(hero, /Create, update, and upload videos for the App Store, all in one place\./);
assert.equal((hero.match(/<p\b/g) ?? []).length, 2);
assert.match(hero, /No account required\./);
assert.equal((html.match(/<a[^>]*download-button[^>]*href="https:\/\/apps\.apple\.com\/us\/app\/app-preview-editor-studio\/id6785711605"/g) ?? []).length, 3);
assert.equal((html.match(/src="\.\.\/images\/apple-icon-white\.svg"/g) ?? []).length, 2);
assert.equal((html.match(/srcset="\.\.\/images\/apple-icon-black\.svg"/g) ?? []).length, 2);
assert.match(html, /<span>App Preview Editor<\/span>/);
assert.doesNotMatch(html, /<form|beta|TestFlight|list-manage|hero-email|drops in extra clips to cover more features/i);
assert.doesNotMatch(script, /signup|mailchimp|FormData|beta-cta/i);
assert.match(html, /Built for App Store formats\./);
assert.match(html, /APEs checks video duration and format before export\./);
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

assert.match(html, /Introductory pricing/i);
assert.match(html, /<s>\$6\.99\/month<\/s>/);
assert.match(html, /<s>\$59\.99\/year<\/s>/);
assert.doesNotMatch(html, /Early subscribers keep their lower renewal price|Planned regular price:/);
assert.doesNotMatch(html, /<del>|50%|30.days|limited.time|offer ends|resubscribe|plan.switch|first.billing.period/i);

assert.equal((html.match(/aria-label="Download for Mac"/g) ?? []).length, 3);



const pricing = html.match(/<section\b[^>]*\bid="download"[^>]*>[\s\S]*?<\/section>/)?.[0];
assert.ok(pricing, "The pricing section must be present");
const approvedHeroCaption = '<p class="download-caption">No account required. 7 days free trial.</p>';
assert.equal(hero.split(approvedHeroCaption).length - 1, 1, "Only the approved hero caption may describe plans outside pricing");
assert.equal(html.split(approvedHeroCaption).length - 1, 1);
const outsidePricing = html.replace(pricing, "").replace(approvedHeroCaption, "").replaceAll("Apple Vision Pro", "");
const planLanguage = /\b(?:free|pro|trial|upgrade|watermarks?|watermarked|plans?|pricing|subscriptions?|introductory|renewals?)\b|Made with APEs/i;
assert.doesNotMatch(outsidePricing, planLanguage, "Plan, trial and watermark language belongs only in pricing");
for (const question of faq.mainEntity) {
  const copy = `${question.name} ${question.acceptedAnswer.text}`.replaceAll("Apple Vision Pro", "");
  assert.doesNotMatch(copy, planLanguage, "FAQ copy and structured answers must remain plan-free");
}

const comparison = pricing.match(/<table class="plan-comparison"[^>]*>([\s\S]*?)<\/table>/)?.[1];
assert.ok(comparison, "Pricing must include a semantic comparison table");
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
assert.match(html, /Show your app in action with the App Store’s new search creative asset or in search ads\./);
assert.match(html, /Showcase your next event\./);
assert.match(html, /Bring your Event Card and Event Details Page to life with video that shows what’s coming\./);
assert.match(html, /Export your work to your Mac, or upload directly to App Store Connect\./);
assert.doesNotMatch(html, /supported App Store search placements|does not translate|guarantee (?:Apple’s )?approval|Uploading (?:doesn’t|does not) publish|Some uploads require|Export them to a folder/i);

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({description}) => description).filter(Boolean), ["Regular: $6.99/month.", "Regular: $59.99/year."]);

assert.match(pricing, /<h2 id="pricing-title">Introductory Price<\/h2>/);
assert.match(pricing, /<h2 id="included-title">What’s included<\/h2>/);
assert.ok(pricing.indexOf('class="pricing-options"') < pricing.indexOf('class="plan-comparison"'), "Purchase options must precede the feature comparison");
assert.match(pricing, /<table class="plan-comparison" aria-labelledby="included-title">/);

assert.deepEqual([...pricing.matchAll(/<s>(.*?)<\/s>/g)].map((match) => match[1]), ["$6.99/month", "$59.99/year"]);

const subscriptionOffers = schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.slice(0, 2);
const savings = subscriptionOffers.map(({price, description}) => {
  const regular = Number(description.match(/\$([\d.]+)/)[1]);
  return `Save ${Math.round((regular - Number(price)) / regular * 100)}%`;
});
assert.deepEqual([...pricing.matchAll(/class="price-saving">([^<]+)<\/span>/g)].map((match) => match[1]), savings);
assert.deepEqual(savings, ["Save 29%", "Save 33%"]);
assert.doesNotMatch(pricing, /<dt>Lifetime[\s\S]*?price-saving[\s\S]*?<\/dt>/);
