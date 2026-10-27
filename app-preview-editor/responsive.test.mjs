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

test("remaining content copy centers only within the existing 559px layout", () => {
  const targets = ["#workflow .workflow-step", "#features .section-heading", "#features .capability-grid > article", ".product-tour > .section-heading", ".product-tour .story-copy", "#delivery .story-copy"].map(selector => `.apes-landing ${selector}`);
  for (const width of [320, 375, 390, 430, 482, 558, 559, 560, 561, 768, 900, 1440]) {
    for (const selector of targets) assert.equal(decl(width, [selector])["text-align"], width <= 559 ? "center" : undefined);
    for (const child of ["p", ".feature-title-icon"]) assert.equal(decl(width, [`.apes-landing #workflow .workflow-step > ${child}`])["margin-inline"], width <= 559 ? "auto" : undefined);
  }
  const scope = css.slice(css.indexOf("/* Center only the remaining content copy"));
  assert.doesNotMatch(scope, /\.hero|\.result|\.scene-clips|\.pricing|\.plan-comparison|\.faq|\.final-cta|\.founder|\.nav|\.footer|button|story-media/);
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
    assert.ok(device >= Math.max(28, Math.min(36, width * .07)) && device >= 42, `${width}px five-device row`);
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

test("hero peeks remain substantial, equal and inside the viewport at rest, including every mobile boundary", () => {
  for (const { width, shell } of matrix) {
    const group = decl(width, [".hero-results", ".hero .hero-results", ".apes-landing .hero-results"]);
    const hero = Math.min(shell, 860), side = (hero - 8) / (width < 560 ? 2.79 : 3) * (width < 560 ? .72 : 1);
    const center = hero / 2, centerWidth = hero - 8 - side * 2;
    const ratio = +group["--hero-side-distance-ratio"], inset = parseFloat(group["--hero-side-rest-inset"]) / 100;
    assert.equal(ratio, width < 560 ? .85 : .7);
    const scale = +group["--hero-side-rest-scale"], angle = parseFloat(group["--hero-side-rest-tilt"]) * Math.PI / 180;
    const project = x => { const dx = (x - side) * scale, z = -Math.sin(angle) * dx;
      return center + (4 + side + Math.cos(angle) * dx + inset * side - center) * 1200 / (1200 - z); };
    const baseline = restDistance(4, side, -1, scale, angle * 180 / Math.PI, inset, center, 1200, center);
    const shift = baseline * (1 - ratio), left = project(0) + shift, right = project(side) + shift;
    const projectRight = x => { const dx = x * scale, z = Math.sin(angle) * dx;
      return center + (hero - 4 - side + Math.cos(angle) * dx - inset * side - center) * 1200 / (1200 - z); };
    const rightInner = projectRight(0) - shift, rightOuter = projectRight(side) - shift;
    const peek = center - centerWidth * 1.08 / 2 - left;
    assert.ok(peek >= (right - left) * (width < 560 ? .45 : .3), `${width}px visible side preview`);
    assert.ok(left >= 0 && right < center && right > center - centerWidth * 1.08 / 2);
    near((left + rightOuter) / 2, center);
    near((right + rightInner) / 2, center);
    near(peek, rightOuter - (center + centerWidth * 1.08 / 2));
    let previous = -Infinity;
    for (const p of [0, .1, .3, .6, 1]) {
      const separation = baseline - shift * (1 - p); assert.ok(separation > previous); previous = separation;
    }
    const fallbackShift = (1 - ratio) * ((width < 560 ? 1.4375 : 1) - (1 - scale) / 2 - inset) * side;
    const staticPeek = center - centerWidth * 1.08 / 2 - (project(0) + fallbackShift);
    assert.ok(staticPeek >= (right - left) * (width < 560 ? .45 : .3));
  }
});
