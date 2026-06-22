import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

globalThis.window = globalThis;

const config = fs.readFileSync(new URL("../app/config.js", import.meta.url), "utf8");
vm.runInThisContext(config, { filename: "app/config.js" });
const components = fs.readFileSync(new URL("../app/components.jsx", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../living.css", import.meta.url), "utf8");

const sourceColumns = [
  { key: "paymentSubmittedAt", label: "Recibido" },
  { key: "status", label: "Estado" },
  { key: "code", label: "Reserva" },
  { key: "summary", label: "Resumen" },
  { key: "actions", label: "Acciones" },
];
const orderedColumns = livingOrderTableColumns(sourceColumns);

assert.deepEqual(orderedColumns.map((column) => column.label), ["Reserva", "Estado", "Recibido", "Resumen", "Acciones"]);
assert.deepEqual(sourceColumns.map((column) => column.label), ["Recibido", "Estado", "Reserva", "Resumen", "Acciones"]);
assert.equal(orderedColumns.at(-1).key, "actions");
assert.deepEqual(livingOrderTableColumns([{ key: "status", label: "Estado reserva" }, { key: "code", label: "Reserva" }]).map((column) => column.key), ["code", "status"]);
assert.deepEqual(livingOrderTableColumns([{ key: "residentName", label: "Origen" }, { key: "status", label: "Estado" }]).map((column) => column.label), ["Estado", "Origen"]);
assert.equal(livingTableColumnKind({ key: "paymentSubmittedAt", label: "Recibido" }), "date");
assert.equal(livingTableColumnWidth({ key: "code", label: "Reserva" }), 148);
assert.match(components, /--living-mobile-order/);
assert.doesNotMatch(components, /minWidth:\s*"100%"/);
assert.match(styles, /\.living-table td\[data-column-kind\]\s*\{\s*width:\s*100%;/);

console.log("Living table column tests passed.");
