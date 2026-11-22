import { readFile } from "node:fs/promises";
import { join } from "node:path";

const contentSlot = "<!-- site:content -->";

export function localePath(path, language) {
  return language === "es" ? path.replace(/\.html$/, ".es.html") : path;
}

export async function renderContent(source, { rootDirectory, route, entry, language }) {
  if (!entry) return source;
  if (source.split(contentSlot).length !== 2) {
    throw new Error(`Expected one ${contentSlot} in ${route}`);
  }

  const fragmentPath = join(rootDirectory, "content", localePath(`${entry}.html`, language));
  const fragment = (await readFile(fragmentPath, "utf8")).trim();
  if (!fragment) throw new Error(`Missing page content for ${route}: ${fragmentPath}`);
  return source.replace(contentSlot, () => `<div id="root">\n${fragment}\n  </div>`);
}
