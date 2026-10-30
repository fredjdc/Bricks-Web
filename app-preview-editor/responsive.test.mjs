import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { widths, breakpoints, declarations as decl, fluidWidth } from "./responsive-checkpoints.mjs";

const [html, css, script] = await Promise.all(["index.html", "styles.css", "script.js"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
const helpers = script.slice(script.indexOf("const previewHandoff ="), script.indexOf("const setupPreviewHandoff ="));
const restDistance = vm.runInNewContext(`${helpers}; heroSideRestDistance`);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

export const matrix = widths.map(width => {
  const shell = fluidWidth(width, decl(width, [".shell"]).width);
  const header = fluidWidth(width, decl(width, [".site-header", ".apes-landing .site-header"]).width);
  const workflow = shell - 2 - (width >= 900 ? 96 : 48);
  const story = width >= 900 ? Math.max(280, (shell - 56) * .35) : shell;
  const price = shell - 2 - (width < 560 ? 32 : 64);
  return { width, shell, header, workflow, story, price };
});

test("checkpoint coverage includes every declared screen boundary and all requested widths", () => {
  assert.deepEqual(breakpoints, [559, 560, 768, 899, 900, 1200]);
  for (const breakpoint of breakpoints) for (const delta of [-1, 0, 1]) assert.ok(widths.includes(breakpoint + delta));
  for (const width of [320,360,375,390,414,430,482,640,768,820,1024,1280,1440,1920]) assert.ok(widths.includes(width));
});

test("hero wrapping balances narrow layouts with phrase fallbacks and keeps desktop line groups", () => {
  for (const width of [...widths, 347]) {
    assert.equal(decl(width, [".hero h1 .hero-word"]).display, width < 900 ? "inline" : "block");
    const heading = decl(width, ["h1", ".hero h1"]);
    assert.equal(heading["max-width"], "none"); assert.equal(heading["white-space"], "normal");
    assert.equal(heading["text-wrap"], "balance");
    assert.equal(heading["font-size"], "clamp(2.5rem, 9vw, 7.25rem)");
    const phrase = decl(width, [".hero h1 .hero-phrase"]);
    assert.equal(phrase.display, "inline-block"); assert.equal(phrase["max-width"], "100%");
    assert.equal(phrase["white-space"], undefined, "Phrase chunks can still reflow under extreme text enlargement");
  }
});

test("remaining content copy centers only within the existing 559px layout", () => {
  const targets = ["#workflow .workflow-step", "#features .section-heading", "#features .capability-grid > article", ".product-tour > .section-heading", ".product-tour .story-copy", "#delivery .story-copy"].map(selector => `.apes-landing ${selector}`);
  for (const width of [320, 375, 390, 430, 482, 558, 559, 560, 561, 768, 900, 1440]) {
    for (const selector of targets) assert.equal(decl(width, [selector])["text-align"], width <= 559 ? "center" : undefined);
    for (const child of ["p", ".feature-title-icon"]) assert.equal(decl(width, [`.apes-landing #workflow .workflow-step > ${child}`])["margin-inline"], width <= 559 ? "auto" : undefined);
  }
  const scope = css.slice(css.indexOf("/* Center only the remaining content copy")).split("\n}")[0];
  assert.doesNotMatch(scope, /\.hero|\.result|\.scene-clips|\.pricing|\.plan-comparison|\.faq|\.final-cta|\.founder|\.nav|\.footer|button|story-media/);
});

test("template previews follow the developer, link from Scene Clips and keep honest accessible responsive stills", async () => {
  const section = html.match(/<section class="templates section shell"[\s\S]*?<\/section>/)[0];
  const founderEnd = html.indexOf("</aside>", html.indexOf('<aside class="founder-note'));
  assert.ok(founderEnd < html.indexOf(section) && html.indexOf(section) < html.indexOf('<footer class="footer'));
  assert.match(section, /id="templates" aria-labelledby="templates-title" tabindex="-1"/);
  assert.match(css, /\.apes-landing #templates:focus \{ outline: none; \}/);
  assert.doesNotMatch(css, /#templates(?::focus-within|\s+(?:\*|a|button|summary))[^{}]*\{[^}]*outline:\s*(?:none|0)/);
  assert.match(css, /\.template-share > summary:focus-visible \{ outline: 3px solid var\(--focus\);/);
  assert.match(section, /<h2 id="templates-title">Start with a template\.<\/h2>/);
  assert.match(section, /Choose a starting point, add your screens, and make it your own\./);
  assert.equal((section.match(/>Free to use<\/span>/g) || []).length, 3);
  assert.doesNotMatch(section, /<video|<form|\sdownload[=>\s]|Pro.only|creator:/i);
  assert.match(html.match(/<section class="scene-clips[\s\S]*?<\/section>/)[0], /href="#templates">Explore templates<\/a>/);
  assert.match(section, /<details class="template-share">\s*<summary>Share your template<\/summary>/);
  assert.match(section, /data-tally-form="RWWAPv"/);
  assert.match(section, /height="802"[^>]*title="Share an App Preview Editor template"/);
  assert.match(section, /Upload one ZIP, up to 10 MB/);
  assert.doesNotMatch(section, /mailto:|target="_blank"/);
  const previews = [...section.matchAll(/<img class="template-preview" src="([^"]+)" width="(\d+)" height="(\d+)" alt="([^"]+)" loading="lazy" decoding="async">/g)];
  assert.equal(previews.length, 3);
  for (const [, path, width, height, alt] of previews) {
    const png = await readFile(new URL(path, import.meta.url));
    assert.equal(+width, png.readUInt32BE(16)); assert.equal(+height, png.readUInt32BE(20)); assert.ok(alt.length > 20);
  }
  for (const width of widths) {
    const columns = width < 560 ? 1 : width < 900 ? 2 : 3;
    assert.equal(decl(width, [".apes-landing .template-gallery"])["grid-template-columns"], columns === 1 ? "minmax(0, 1fr)" : `repeat(${columns}, minmax(0, 1fr))`);
    assert.ok((fluidWidth(width, decl(width, [".shell"]).width) - (columns - 1) * 24) / columns >= 200);
    assert.equal(decl(width, [".apes-landing .template-preview"])["object-fit"], "contain");
    assert.equal(decl(width, [".apes-landing .templates"])["scroll-margin-top"], "112px");
  }
  assert.equal(decl(390, ["html"], true)["scroll-behavior"], "auto");
});

test("both inline Tally forms load, retry and accept only their own readiness event without navigation or fake success", async () => {
  const [support, source, embedCSS] = await Promise.all(["../support.html", "../tally-embed.js", "../tally-embed.css"].map(file => readFile(new URL(file, import.meta.url), "utf8")));
  assert.match(support, /data-tally-form="6DDgZ5"/);
  assert.match(support, /height="639"[^>]*title=\{t.title\}/);
  assert.match(support, /window.dispatchEvent\(new Event\('tally:mount'\)\)/);
  assert.doesNotMatch(support, /formsubmit|support_iframe|SuccessOverlay|generateReferenceNumber|DataTransfer|_captcha|reference_number/);
  assert.doesNotMatch(source, /window\.open|location\s*=|FormSubmitted|submit\(|fetch\(/);
  for (const page of [support, html]) {
    assert.match(page, /tally-embed\.js\?v=/);
    assert.match(page, /tally-embed\.css\?v=/);
    assert.match(page, /https:\/\/tally\.so\/embed\/(?:6DDgZ5|RWWAPv)\?alignLeft=1(?:&amp;|&)hideTitle=1(?:&amp;|&)transparentBackground=1(?:&amp;|&)dynamicHeight=1/);
  }
  assert.match(embedCSS, /\.tally-embed \{[^}]*width: 100%;[^}]*background: #fff;[^}]*color-scheme: light/);
  assert.match(embedCSS, /\.tally-embed iframe \{[^}]*width: 100%; max-width: 100%/);
  const listeners = {}, timers = new Map(); let clock = 0, loads = 0;
  const make = (id, closed = false) => {
    const handlers = {}, details = closed ? { open: false, addEventListener: (event, fn) => { handlers[event] = fn; } } : null;
    const frame = { dataset: { embedUrl: `https://tally.so/embed/${id}?dynamicHeight=1` }, contentWindow: {}, getAttribute: key => frame[key] || null };
    const status = {}, retry = { addEventListener: (event, fn) => { handlers[event] = fn; } };
    return { dataset: { tallyForm: id, loading: "Loading", slow: "Retry here" }, frame, status, retry, details, handlers, isConnected: true,
      closest: () => details, querySelector: selector => selector === "iframe" ? frame : selector === ".tally-status" ? status : retry };
  };
  const supportForm = make("6DDgZ5"), templateForm = make("RWWAPv", true);
  const forms = [supportForm, templateForm];
  const context = { document: { querySelectorAll: () => forms }, window: { Tally: { loadEmbeds: () => loads++ }, addEventListener: (name, fn) => { listeners[name] = fn; } },
    setTimeout: fn => { timers.set(++clock, fn); return clock; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(source, context);
  await Promise.resolve();
  assert.equal(loads, 1);
  assert.equal(templateForm.frame.dataset.tallySrc, undefined, "Closed template embed stays unloaded");
  templateForm.details.open = true; templateForm.handlers.toggle(); await Promise.resolve();
  assert.equal(loads, 2);
  assert.equal(templateForm.frame.dataset.tallySrc, templateForm.frame.dataset.embedUrl);
  templateForm.handlers.toggle(); assert.equal(loads, 2, "Reopening preserves the same form and answers");
  const event = { origin: "https://tally.so", source: supportForm.frame.contentWindow, data: JSON.stringify({ event: "Tally.FormLoaded", payload: { formId: "6DDgZ5" } }) };
  listeners.message({ ...event, origin: "https://other.example" }); assert.equal(supportForm.status.hidden, false);
  listeners.message({ ...event, source: {} }); assert.equal(supportForm.status.hidden, false);
  listeners.message({ ...event, data: "not JSON" });
  listeners.message(event); assert.equal(supportForm.status.hidden, true);
  assert.equal(templateForm.status.hidden, false);
  [...timers.values()].forEach(fn => fn()); assert.equal(templateForm.retry.hidden, false);
  templateForm.handlers.click(); await Promise.resolve();
  assert.equal(templateForm.frame.src, templateForm.frame.dataset.embedUrl, "Retry reloads the iframe, not the host page");
  assert.equal(templateForm.retry.hidden, true);
  assert.equal(loads, 3);
  const blocked = make("6DDgZ5"); let scriptRemoved = false;
  const offlineContext = { ...context, document: { querySelectorAll: () => [blocked], createElement: () => ({ remove: () => { scriptRemoved = true; } }), head: { append: script => { Promise.resolve().then(() => script.onerror()); } } }, window: { addEventListener: () => {} } };
  vm.runInNewContext(source, offlineContext);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(scriptRemoved, true);
  assert.equal(blocked.frame.src, blocked.frame.dataset.embedUrl, "Blocked height helper falls back to an inline iframe");
  assert.equal(blocked.retry.hidden, false);
  for (const width of widths) {
    assert.equal(decl(width, [".apes-landing .template-share"])["max-width"], "760px");
    assert.equal(decl(width, [".apes-landing .template-share-content"])["text-align"], "left");
  }
});

test("shells, floating navigation, nested cards and footer retain equal outer gutters", () => {
  assert.match(html, /<html lang="en" class="ape-page">/);
  assert.equal(decl(390, ["html.ape-page"])["overflow-x"], "clip");
  assert.equal(decl(390, ["body", ".apes-landing"])["overflow-x"], "clip");
  for (const { width, shell, header, workflow, story, price } of matrix) {
    assert.equal(decl(width, [".shell"])["margin-inline"], "auto");
    assert.match(decl(width, [".apes-landing .site-header"]).margin, /auto/);
    assert.ok(shell <= width && header <= width);
    near((width - shell) / 2 + shell / 2, width / 2);
    near((width - header) / 2 + header / 2, width / 2);
    for (const inner of [workflow, story, price]) assert.ok(inner > 0 && inner <= shell);
    const nav = header - 2 - 2 * parseFloat(decl(width, [".nav", ".apes-landing .nav"])["margin-inline"]);
    // Conservative brand-word and button min-content budgets, not browser font measurements.
    const navMinimum = width <= 560 ? 28 + 6 + 7 * 13 * .75 + 16 + 6 + 8 * 12 * .75 + 20 + 8 : 38 + 12 + 7 * 15 * .75 + 20 + 10 + 8 * 14 * .75 + 32 + 16;
    assert.ok(nav >= navMinimum, `${width}px navigation fits with a wrapping brand`);
    const footer = decl(width, [".footer", ".apes-landing .footer"]);
    assert.equal(footer["flex-wrap"], "wrap"); assert.equal(footer["justify-content"], "space-between");
    assert.equal(footer["flex-direction"], width < 560 ? "column" : "row");
    assert.equal(decl(width, [".apes-landing .footer > p"]).flex, width < 560 ? undefined : "1 1 260px");
    const columns = width >= 900 ? 3 : 1;
    const placement = (shell - (columns - 1) * 48) / columns;
    assert.ok(placement > 0 && placement <= shell);
    const gap = Math.max(4, Math.min(8, width * .01)), device = (Math.min(590, story) - 4 * gap) / 5;
    assert.ok(device >= 26 * 1802.98 / 1002.75 && device >= 42, `${width}px five-device row`);
    const founderInner = shell - 2 - (width >= 900 ? 112 : 48);
    assert.ok(founderInner >= (width >= 900 ? 144 : 112));
    const faqInner = shell - 50; assert.ok(faqInner > 0);
    const ctaInner = shell - (width <= 768 ? 48 : 128); assert.ok(ctaInner >= 200);
  }
});

test("intrinsic 4K/portrait media cannot force implicit mobile grid tracks wider than their container", () => {
  for (const width of widths) {
    assert.equal(decl(width, [".hero"])["grid-template-columns"], "minmax(0, 1fr)");
    assert.equal(decl(width, [".workflow-steps"])["grid-template-columns"], "minmax(0, 1fr)");
    assert.equal(decl(width, [".product-stories"])["grid-template-columns"], "minmax(0, 1fr)");
    if (width < 900) assert.equal(decl(width, [".product-story"])["grid-template-columns"], "minmax(0, 1fr)");
  }
  for (const selector of [".hero > *", ".workflow-layout > *", ".workflow-steps > *", ".product-story > *", ".capability-grid > *", ".footer > *", ".nav > *"]) assert.ok(css.includes(selector));
  assert.match(css, /\.apes-landing :is\(main,[^}]+\{ min-width: 0; \}/);
  assert.match(css, /\.apes-landing :is\(\.video-stage, \.workflow-frames, \.mobile-workflow-media-wrap\) \{ min-width: 0; max-width: 100%;/);
  assert.match(css, /\.pricing-options dd:not\(\.plan-detail\) \{ display: flex; flex-wrap: wrap;/);
  assert.match(css, /\.plan-comparison \{[^}]*table-layout: fixed;/);
  assert.doesNotMatch(css, /height: 100%;[^}]*object-fit: cover;[^}]*video/);
});

test("top hero projected inner gaps are equal at rest, separation, handoff and static fallback across breakpoints", () => {
  for (const { width, shell } of matrix) {
    const group = decl(width, [".hero-results", ".hero .hero-results", ".apes-landing .hero-results", ".apes-landing .hero .hero-results"]);
    const hero = Math.min(shell, 1080), pad = shell * .045;
    const centerWidth = (hero - pad * 2) / 2.36, side = centerWidth * .68, center = hero / 2;
    const ratio = +group["--hero-side-distance-ratio"], angle = parseFloat(group["--hero-side-rest-tilt"]) * Math.PI / 180;
    const depth = parseFloat(group["--hero-fan-perspective"]);
    const frame = width < 560 ? 6 : 10;
    const height = frame + (side - frame) * 3840 / 1776;
    const roll = parseFloat(group["--hero-side-rest-roll"]) * Math.PI / 180;
    const project = (x, y, direction = -1) => {
      const origin = direction < 0 ? side : 0, left = direction < 0 ? pad : pad + side + centerWidth;
      const inset = parseFloat(group["--hero-side-rest-inset"]) / 100, yaw = -direction * angle, rotation = -direction * roll;
      const dx = x - origin, dy = y - height / 2;
      const rotatedX = Math.cos(rotation) * dx - Math.sin(rotation) * dy;
      const rotatedY = Math.sin(rotation) * dx + Math.cos(rotation) * dy;
      const z = -Math.sin(yaw) * rotatedX, cameraY = height / 2 + (width < 560 ? 4 : 6);
      return {
        x: center + (left + origin + Math.cos(yaw) * rotatedX - direction * inset * side - center) * depth / (depth - z),
        y: cameraY + (height / 2 + rotatedY - cameraY) * depth / (depth - z),
      };
    };
    const corners = [project(0, 0), project(side, 0), project(0, height), project(side, height)];
    const outer = Math.min(...corners.map(point => point.x)), inner = Math.max(...corners.map(point => point.x));
    const halfBounds = (inner - outer) / 2;
    const rightCorners = [project(0, 0, 1), project(side, 0, 1), project(0, height, 1), project(side, height, 1)];
    const rightOuter = Math.max(...rightCorners.map(point => point.x));
    const rightInner = Math.min(...rightCorners.map(point => point.x));
    const rightBaseline = restDistance(pad + side + centerWidth, side, 1, 1, angle * 180 / Math.PI, 0, center, depth, center, height, roll * 180 / Math.PI);
    assert.ok(side * Math.sin(angle) < 0 && depth > side, "Outward panels have receding outer edges without camera intersection");
    const drop = side * parseFloat(group["--hero-fan-drop"]) / 100;
    const topOffset = drop + Math.min(...corners.map(point => point.y));
    near(topOffset, drop);
    assert.ok(topOffset / centerWidth > .18 && topOffset / centerWidth < .19, `${width}px existing vertical offset is preserved`);
    assert.ok(side < centerWidth && height + drop < frame + (centerWidth - frame) * 1920 / 886);
    const baseline = restDistance(pad, side, -1, 1, angle * 180 / Math.PI, 0, center, depth, center, height, roll * 180 / Math.PI), shift = baseline * (1 - ratio);
    near(baseline, center - (outer + inner) / 2);
    let previous = -Infinity;
    for (const p of [0, .1, .3, .6, 1]) {
      const distance = baseline - shift * (1 - p);
      assert.ok(distance > previous); previous = distance;
      const left = center - distance - halfBounds, right = rightOuter - rightBaseline * (1 - ratio) * (1 - p);
      assert.ok((width - hero) / 2 + left >= 0 && (width - hero) / 2 + right <= width, `${width}px fan stays in the viewport before its fading exit`);
      near(center - centerWidth / 2 - (inner + shift * (1 - p)), rightInner - rightBaseline * (1 - ratio) * (1 - p) - (center + centerWidth / 2));
      assert.ok(distance + halfBounds - centerWidth / 2 >= (inner - outer) * .8, `${width}px projected side panels remain distinguishable`);
      for (const handoff of [0, .1, .5, 1]) {
        const exit = Math.max(48, Math.min(220, width * .18)) * handoff;
        const movingHalfWidth = centerWidth / 2 * (1 - .6 * handoff);
        const leftGap = center - movingHalfWidth - (inner + shift * (1 - p) - exit);
        const rightGap = rightInner - rightBaseline * (1 - ratio) * (1 - p) + exit - (center + movingHalfWidth);
        near(leftGap, rightGap);
        near(Math.max(0, leftGap), Math.max(0, rightGap));
      }
    }
    near(baseline, rightBaseline);
    const fallbackShift = (1 - ratio) * parseFloat(group["--hero-side-distance"]) / 100 * side;
    near(center - centerWidth / 2 - inner - fallbackShift, rightInner - fallbackShift - center - centerWidth / 2);
    assert.equal(group["--hero-side-rest-inset"], "0%");
    assert.equal(group["--hero-side-inset-factor"], undefined);
    assert.equal(angle * 180 / Math.PI, -28); assert.equal(roll, 0);
    assert.ok(decl(width, [".apes-landing .hero .hero-result-left"]).transform.includes("rotateY(var(--hero-side-rest-tilt))"));
    assert.equal(decl(width, [".apes-landing .hero"])["row-gap"], "16px");
    const closing = decl(width, [".apes-landing .hero-results"]);
    assert.equal(closing["--hero-fan-perspective"], undefined, "Closing CTA retains the previous layout");
    assert.equal(closing.width, "min(100%, 860px)");
  }
});
