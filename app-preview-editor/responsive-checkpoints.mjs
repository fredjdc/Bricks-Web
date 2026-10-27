import { readFile } from "node:fs/promises";
const [page, styles, shared] = await Promise.all([
  readFile(new URL("index.html", import.meta.url), "utf8"), readFile(new URL("styles.css", import.meta.url), "utf8"),
  readFile(new URL("../shared-download-cta.css", import.meta.url), "utf8"),
]);
const inline = [...page.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, content]) => content).join("\n");
export const CSS = `${styles}\n${shared}\n${inline}`;
export const breakpoints = [...new Set([...CSS.matchAll(/@media([^{}]+)\{/g)].flatMap(([, condition]) =>
  [...condition.matchAll(/(?:min|max)-width:\s*(\d+)px/g)].map(([, value]) => +value)))].sort((a, b) => a - b);
export const widths = [...new Set([320, 360, 375, 390, 414, 430, 482, 640, 768, 820, 1024, 1280, 1440, 1920,
  710, 946, ...breakpoints.flatMap(value => [value - 1, value, value + 1])])].sort((a, b) => a - b);

export function rules(viewport, reduced = false, text = CSS, result = []) {
  let offset = 0;
  while (offset < text.length) {
    const open = text.indexOf("{", offset); if (open < 0) break;
    const selector = text.slice(offset, open).replace(/\/\*[\s\S]*?\*\//g, "").trim();
    let end = open + 1, depth = 1;
    while (depth && end < text.length) { if (text[end] === "{") depth++; if (text[end] === "}") depth--; end++; }
    const body = text.slice(open + 1, end - 1); offset = end;
    if (selector.startsWith("@media")) {
      const min = selector.match(/min-width:\s*(\d+)px/), max = selector.match(/max-width:\s*(\d+)px/);
      if (min && viewport < +min[1] || max && viewport > +max[1] || /no-preference/.test(selector) && reduced
        || /prefers-reduced-motion: reduce/.test(selector) && !reduced) continue;
      rules(viewport, reduced, body, result);
    } else if (!selector.startsWith("@")) result.push({ selector, body, order: result.length });
  }
  return result;
}

export function declarations(viewport, selectors, reduced = false) {
  const specificity = selector => (selector.match(/#/g) || []).length * 100 + (selector.match(/\.|\[/g) || []).length * 10;
  const matching = rules(viewport, reduced).flatMap(rule => rule.selector.split(/,(?![^()]*\))/).map(selector => ({ ...rule, selector: selector.trim() })))
    .filter(rule => selectors.includes(rule.selector)).sort((a, b) => specificity(a.selector) - specificity(b.selector) || a.order - b.order);
  const values = {};
  matching.forEach(rule => rule.body.split(";").forEach(declaration => {
    const colon = declaration.indexOf(":"); if (colon >= 0) values[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
  }));
  return values;
}
export function fluidWidth(viewport, value) {
  const gutter = +value.match(/100% - (\d+)px/)[1];
  return Math.min(viewport - gutter, +declarations(viewport, [":root"])["--shell"].replace("px", ""));
}
