import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { localePath, renderContent } from "./content.mjs";

test("localized content preserves route depth and renders before JavaScript", async () => {
  const rootDirectory = await mkdtemp(join(tmpdir(), "bricks-content-test-"));
  try {
    assert.equal(localePath("calc/index.html", "es"), "calc/index.es.html");
    assert.equal(localePath("calculadora-hipotecaria.html"), "calculadora-hipotecaria.html");
    await mkdir(join(rootDirectory, "calc", "content"), { recursive: true });
    await writeFile(join(rootDirectory, "calc", "content", "calc.es.html"), '<main id="main">Presupuesto de $425</main>\n');
    const options = { rootDirectory, route: "calc/index.es.html", entry: "calc", language: "es" };
    const page = await renderContent("<body><!-- site:content --></body>", options);
    assert.match(page, /<main id="main">Presupuesto de \$425<\/main>/);
    assert.doesNotMatch(page, /site:content|<script/);
    await assert.rejects(renderContent("<body></body>", options), /Expected one <!-- site:content -->/);
  } finally {
    await rm(rootDirectory, { recursive: true, force: true });
  }
});
