import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("index.html", import.meta.url), "utf8");
const css = await readFile(new URL("styles.css", import.meta.url), "utf8");

test("pricing and FAQ cards inherit the page shell without narrower outer caps", () => {
  for (const section of ["pricing", "faq"]) {
    assert.match(html, new RegExp(`<section class="${section} section shell"`));
  }
  // Inspect every matching declaration, including breakpoint overrides, so a
  // future narrower card cap cannot silently return at just one viewport.
  for (const selector of [".apes-landing .pricing-block", ".apes-landing .faq-list"]) {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selectors]) => selectors.trim() === selector);
    assert.ok(rules.length);
    for (const [, , declarations] of rules) {
      for (const [, value] of declarations.matchAll(/max-width:\s*([^;]+);/g)) {
        assert.equal(value.trim(), "none", `${selector} must use the shell width`);
      }
    }
  }
  assert.match(css, /\.apes-landing \.plan-comparison \{[^}]*max-width: 760px;/);
  assert.match(css, /\.apes-landing \.faq details \{[^}]*max-width: 814px;/);
});
