import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script, styles] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"),
  readFile(new URL("script.js", import.meta.url), "utf8"),
  readFile(new URL("styles.css", import.meta.url), "utf8"),
]);

assert.equal(html.match(/data-signup-state="collapsed"/g)?.length, 2);
assert.equal(html.match(/data-beta-open[^>]*aria-expanded="false"/g)?.length, 2);
assert.equal(html.match(/data-signup-step="email"/g)?.length, 2);
assert.equal(html.match(/data-signup-step="email"[^>]*hidden/g)?.length ?? 0, 0);
assert.equal(html.match(/<span>Continue<\/span>/g)?.length, 2);
assert.doesNotMatch(html, /document\.documentElement\.classList\.add\("js"\)/);
assert.match(script, /^document\.documentElement\.classList\.add\("js"\);/);
assert.match(script, /const animateState = \(element\) =>/);
assert.match(script, /const showCollapsedStep = \(animate = true\) =>/);
assert.match(script, /const showEmailStep = \(\) =>/);
assert.match(script, /const showBetaStep = \(\) =>/);
assert.match(script, /if \(form\.dataset\.betaReady !== "true"\) \{\s+showBetaStep\(\);/);
assert.match(script, /showCollapsedStep\(\);\s+setStatus\("Thanks![\s\S]+?openButton\.focus\(\);/);
assert.match(styles, /\[hidden\] \{ display: none !important; \}/);
assert.match(styles, /\.signup-trigger \{ display: none;[^}]*margin-inline: auto;/);
assert.match(styles, /\.js \.signup-trigger \{ display: flex; width: fit-content; \}/);
assert.match(styles, /\.js \.signup-form\[data-signup-state="collapsed"\] \[data-signup-step="email"\] \{ display: none; \}/);
assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)[\s\S]*\.signup-state-entering \{ animation: signup-state-in 280ms var\(--ease\); \}/);
