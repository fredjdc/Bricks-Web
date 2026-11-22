import assert from "node:assert/strict";
import test from "node:test";

import { renderPage } from "./layout.mjs";

test("a page must provide exactly one slot for each shared layout element", () => {
  const route = "appcut/index.html";
  const markers = ["<!-- site:head -->", "<!-- site:header -->", "<!-- site:footer -->"];
  const source = markers.join("\n");
  for (const marker of markers) {
    const expected = { message: `Expected one ${marker} in ${route}` };
    assert.throws(() => renderPage(route, source.replace(marker, "")), expected);
    assert.throws(() => renderPage(route, source + marker), expected);
  }
});
