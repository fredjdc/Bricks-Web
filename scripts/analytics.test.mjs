import assert from "node:assert/strict";
import { test } from "node:test";

import { renderAnalytics } from "./analytics.mjs";

test("GA4 bootstrap stays at the explicit opt-in slot", () => {
  const marker = "<!-- site:analytics -->";
  const withoutAnalytics = "<head><title>Bricks Apps</title></head>";
  assert.equal(renderAnalytics(withoutAnalytics), withoutAnalytics);

  const rendered = renderAnalytics("<!-- existing integration -->" + marker + "<!-- page script -->");
  assert.ok(rendered.startsWith("<!-- existing integration --><script async "));
  assert.match(rendered, /googletagmanager\.com\/gtag\/js\?id=G-0NE96SRV4V/);
  assert.match(rendered, /gtag\("config", "G-0NE96SRV4V"\);/);
  assert.ok(rendered.endsWith("</script><!-- page script -->"));
  assert.throws(() => renderAnalytics(marker + marker), /single site:analytics slot/);
});
