import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const start = script.indexOf("const animateCountUp");
const end = script.indexOf("\n\nconst showVideoPoster", start);
const callbacks = [];
const animateCountUp = Function("performance", "requestAnimationFrame", `${script.slice(start, end)}; return animateCountUp;`)(
  { now: () => 0 },
  (callback) => callbacks.push(callback)
);
const classes = new Set();
const element = {
  dataset: { countUp: "30" },
  textContent: "30",
  classList: {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  },
};

animateCountUp(element);
assert.equal(element.textContent, "0");
assert.equal(classes.has("is-counting"), true);

callbacks.shift()(0);
callbacks.shift()(400);
assert.equal(element.textContent, "26");

callbacks.shift()(800);
assert.equal(element.textContent, "30");
assert.equal(classes.has("is-counting"), false);
assert.equal(callbacks.length, 0);
