import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const hero = html.match(/<div class="hero-copy">([\s\S]*?)<div class="hero-results"/)[1];
const heroText = hero.replace(/<[^>]*>/g, "");
assert.match(heroText, /App Store videos\./);
assert.match(heroText, /Built for indie developers\./);
assert.match(hero, /Turn your screen recordings into videos for your App Store page\. Edit on Mac, start with a template, and update your video when your app changes\./);
assert.equal((hero.match(/<p\b/g) ?? []).length, 2);
assert.match(hero, /No app account required\./);
assert.equal((html.match(/<a[^>]*download-button[^>]*href="https:\/\/apps\.apple\.com\/us\/app\/appcut-studio\/id6785711605"/g) ?? []).length, 3);
assert.equal((html.match(/src="\.\.\/images\/apple-icon-white\.svg"/g) ?? []).length, 2);
assert.equal((html.match(/srcset="\.\.\/images\/apple-icon-black\.svg"/g) ?? []).length, 2);
assert.match(html, /<span>AppCut<\/span>/);
assert.doesNotMatch(html, /<form|beta|TestFlight|list-manage|hero-email|drops in extra clips to cover more features/i);
assert.doesNotMatch(script, /signup|mailchimp|FormData|beta-cta/i);
assert.match(html, /Export for the formats your app needs\./);
assert.match(html, /It checks video duration and format\. Review the results and make any needed changes before exporting\./);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const application = schema["@graph"].find((item) => item["@type"] === "SoftwareApplication");
const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
assert.equal(html.match(/<meta property="og:description" content="([^"]+)"/)[1], description);
assert.equal(html.match(/<meta name="twitter:description" content="([^"]+)"/)[1], description);
assert.equal(application.description, description);
assert.match(html, /<title>AppCut — App Store Videos for Indie Developers<\/title>/);
assert.equal(html.match(/<meta property="og:title" content="([^"]+)"/)[1], "App Store videos. Built for indie developers.");
assert.equal(html.match(/<meta name="twitter:title" content="([^"]+)"/)[1], "App Store videos. Built for indie developers.");
const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
const answers = [...html.matchAll(/<details name="faq"><summary>(.*?)<\/summary>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/details>/g)];
assert.equal(answers.length, faq.mainEntity.length);
for (const question of faq.mainEntity) {
  assert.ok(html.includes(`<summary>${question.name}</summary>`));
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
const approvedHeroCaption = '<p class="download-caption" data-hero-entrance style="--hero-delay: 1220ms">Free to download. No app account required.</p>';
assert.equal(hero.split(approvedHeroCaption).length - 1, 1, "The approved free-download caption must appear once in the hero");
assert.equal(html.split(approvedHeroCaption).length - 1, 1);
assert.match(html, /Pro also includes ProRes 422 HQ MOV exports and watermark-free exports\./);
assert.match(pricing, /The 7-day free trial is available to eligible new subscribers\. Subscriptions auto-renew unless canceled\. All prices are in USD\./);
assert.match(pricing, /Free video exports include a watermark\. Pro adds watermark-free exports, Pro Templates, ProRes exports, and direct App Store Connect uploads\./);

const comparison = pricing.match(/<table class="plan-comparison"[^>]*>([\s\S]*?)<\/table>/)?.[1];
assert.ok(comparison, "Pricing must include a semantic comparison table");
assert.equal((comparison.match(/scope="col"/g) ?? []).length, 3);
const cells = (cell) => cell.match(/aria-label="([^"]+)"/)?.[1] ?? cell.replace(/&shy;|\u00ad/g, "").replace(/<[^>]*>/g, "").trim();
const rows = [...comparison.matchAll(/<tr><th scope="row">(.*?)<\/th><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><\/tr>/g)];
assert.deepEqual(rows.map(([, feature, free, pro]) => [feature, cells(free), cells(pro)]), [
  ["H.264 video export", "Included", "Included"],
  ["Image frame export", "Included", "Included"],
  ["Free Templates", "Included", "Included"],
  ["Pro Templates", "Not included", "Included"],
  ["ProRes video export", "Not included", "Included"],
  ["Direct App Store Connect upload", "Not included", "Included"],
  ["Watermark-free exports", "Not included", "Included"],
]);
assert.match(html, /Give people a clear look at what your app does when they find it in search results\./);
assert.match(html, /Show what’s happening\./);
assert.match(html, /Create videos for your event card and event details page, so people can see what the event offers\./);
assert.match(html, /Choose the device and placement for your video\. Export to your Mac, or upload supported videos to App Store Connect with Pro\./);
assert.doesNotMatch(html, /supported App Store search placements|does not translate|guarantee (?:Apple’s )?approval|Uploading (?:doesn’t|does not) publish|Some uploads require|Export them to a folder/i);

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({description}) => description), ["7-day free trial for eligible new subscribers, then $4.99/month. Auto-renews unless canceled.", "7-day free trial for eligible new subscribers, then $39.99/year. Auto-renews unless canceled.", "One-time purchase."]);

assert.match(pricing, /<h2 id="pricing-title">Start free\. Choose Pro when you need it\.<\/h2>/);
assert.match(pricing, /<h2 id="included-title">What’s included<\/h2>/);
assert.ok(pricing.indexOf('class="pricing-options"') < pricing.indexOf('class="plan-comparison"'), "Purchase options must precede the feature comparison");
assert.match(pricing, /<table class="plan-comparison" aria-labelledby="included-title">/);

assert.deepEqual([...pricing.matchAll(/<s>(.*?)<\/s>/g)].map((match) => match[1]), []);

assert.deepEqual([...pricing.matchAll(/class="plan-detail"><span class="coming-soon-label">([^<]+)<\/span><\/dd>/g)].map((match) => match[1]), ["7-day free trial", "7-day free trial", "One-time purchase"]);
const lifetime = pricing.match(/<div><dt>Lifetime<\/dt>[\s\S]*?<\/div>/)[0];
assert.doesNotMatch(lifetime, /trial|free|\/month|\/year/i);
