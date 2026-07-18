import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(new URL("script.js", import.meta.url), "utf8");
const start = script.indexOf("const numberWords");
const end = script.indexOf("\n\nconst showVideoPoster", start);
const callbacks = [];
const animateNumber = Function("performance", "requestAnimationFrame", `${script.slice(start, end)}; return animateNumber;`)(
  { now: () => 0 },
  (callback) => callbacks.push(callback)
);
const classes = new Set();
const element = {
  dataset: { countFrom: "0", countTo: "30" },
  textContent: "30",
  hasAttribute: () => false,
  classList: {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  },
};

animateNumber(element);
assert.equal(element.textContent, "0");
assert.equal(classes.has("is-counting"), true);

callbacks.shift()(0);
callbacks.shift()(400);
assert.equal(element.textContent, "26");

callbacks.shift()(800);
assert.equal(element.textContent, "30");
assert.equal(classes.has("is-counting"), false);
assert.equal(callbacks.length, 0);

element.dataset = { countFrom: "12", countTo: "3" };
element.textContent = "three";
element.hasAttribute = (name) => name === "data-count-words";
animateNumber(element);
assert.equal(element.textContent, "twelve");

const words = [element.textContent];
callbacks.shift()(0);
for (let now = 16; now <= 800; now += 16) {
  callbacks.shift()(now);
  if (words.at(-1) !== element.textContent) words.push(element.textContent);
}
assert.deepEqual(words, ["twelve", "eleven", "ten", "nine", "eight", "seven", "six", "five", "four", "three"]);
assert.equal(classes.has("is-counting"), false);
