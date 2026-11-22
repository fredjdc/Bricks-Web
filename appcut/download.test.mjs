import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { renderPage } from "../scripts/layout.mjs";

async function readLanding(path) {
  const source = await readFile(new URL(`./pages/${path}`, import.meta.url), "utf8");
  return renderPage(`appcut/${path}`, source);
}

const html = await readLanding("index.html");
const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const hero = html.match(/<div class="hero-copy">([\s\S]*?)<div class="hero-results"/)[1];
assert.match(hero, /<h1\b[^>]*>.*<\/h1>/);
assert.match(hero, /<p class="hero-lede\b[^"]*"[^>]*>[^<]+<\/p>/);
assert.equal((hero.match(/class="download-caption"/g) ?? []).length, 1);

assert.match(hero, /src="\.\.\/images\/apple-icon-white\.svg"/);
assert.match(html, /class="bricks-brand" aria-label="AppCut home"/);
assert.doesNotMatch(html, /<form|list-manage|hero-email|drops in extra clips to cover more features/i);
assert.doesNotMatch(script, /signup|mailchimp|FormData|beta-cta/i);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const application = schema["@graph"].find((item) => item["@type"] === "SoftwareApplication");
const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
assert.equal(html.match(/<meta property="og:description" content="([^"]+)"/)[1], description);
assert.equal(html.match(/<meta name="twitter:description" content="([^"]+)"/)[1], description);
assert.equal(application.description, description);
assert.match(html, /<title>AppCut — App Store Videos for Indie Developers<\/title>/);
assert.equal(html.match(/<meta property="og:title" content="([^"]+)"/)[1], html.match(/<meta name="twitter:title" content="([^"]+)"/)[1]);
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
assert.match(hero, /<p class="download-caption"[^>]*>No accounts · Works offline · macOS Tahoe 15\.0\+<\/p>/);
assert.match(html, /Pro also includes ProRes 422 HQ MOV exports and watermark-free exports\./);
assert.match(pricing, /Cancel anytime\. All prices are in USD\./);
assert.match(pricing, /Choose Pro when you need it\./);

const comparison = pricing.match(/<table class="bricks-comparison"[^>]*>([\s\S]*?)<\/table>/)?.[1];
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
assert.match(html, /aria-labelledby="delivery-title"/);
assert.match(html, /With Pro and App Store Connect API credentials, you can upload supported videos directly from AppCut\./);
assert.doesNotMatch(html, /supported App Store search placements|does not translate|guarantee (?:Apple’s )?approval|Uploading (?:doesn’t|does not) publish|Some uploads require|Export them to a folder/i);

assert.deepEqual(schema["@graph"].find((item) => item["@type"] === "SoftwareApplication").offers.map(({description}) => description), ["7-day free trial for eligible new subscribers, then $4.99/month. Auto-renews unless canceled.", "7-day free trial for eligible new subscribers, then $39.99/year. Auto-renews unless canceled.", "One-time purchase."]);

assert.match(pricing, /<h2 id="pricing-title">Start free<\/h2>/);
assert.match(pricing, /<h2 id="included-title">What’s included<\/h2>/);
assert.ok(pricing.indexOf('class="pricing-options"') < pricing.indexOf('class="bricks-comparison"'), "Purchase options must precede the feature comparison");
assert.match(pricing, /<table class="bricks-comparison" aria-labelledby="included-title">/);

assert.deepEqual([...pricing.matchAll(/<s>(.*?)<\/s>/g)].map((match) => match[1]), []);

assert.deepEqual([...pricing.matchAll(/class="plan-detail"><span class="coming-soon-label">([^<]+)<\/span><\/dd>/g)].map((match) => match[1]), ["7-day free trial", "7-day free trial", "One-time purchase"]);
const lifetime = pricing.match(/<div><dt>Lifetime<\/dt>[\s\S]*?<\/div>/)[0];
assert.doesNotMatch(lifetime, /trial|free|\/month|\/year/i);

const storefront = await readLanding("getvideoeditor.html");
for (const [page, destination] of [
  [html, "https://testflight.apple.com/join/UgyQd6ES"],
  [storefront, "https://apps.apple.com/us/app/appcut-studio/id6785711605"],
]) {
  const links = [...page.matchAll(/<a\b[^>]*\bclass="[^"]*\bdownload-button\b[^"]*"[^>]*>/g)]
    .map(([anchor]) => anchor.match(/\bhref="([^"]+)"/)[1]);
  assert.deepEqual(links, Array(3).fill(destination));
  assert.match(page, /rel="canonical" href="https:\/\/bricks\.pe\/appcut\/"/);
  assert.match(page, /id="update-preview"/);
  const deliveryStep = page === html ? "03 · Export" : "03 · Deliver";
  const steps = ["01 · Replace", "02 · Adapt", deliveryStep].map(marker => page.indexOf(marker));
  assert.ok(steps[0] >= 0 && steps[0] < steps[1] && steps[1] < steps[2]);
  if (page === storefront) {
    assert.match(page, /href="#update-preview"[^>]*>See the update workflow/);
    assert.match(page, /href="#download">Compare Free and Pro<\/a>/);
  }
  const videos = [...page.matchAll(/<video id="([^"]+)"[^>]*>/g)];
  assert.deepEqual(videos.map(match => match[1]), ["finished-preview-video", "template-preview-video"]);
  assert.doesNotMatch(page, /data-preview-control|<video[^>]*role="button"/);
  for (const [video] of videos) {
    assert.match(video, /\bautoplay\b/);
    assert.doesNotMatch(video, /\bcontrols\b/);
  }
  for (const [, ref] of page.matchAll(/\s(?:src|poster|data-src)="(assets\/[^"]+)"/g)) {
    await access(new URL(ref, import.meta.url));
  }
}
