import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

globalThis.window = globalThis;

for (const file of ["app/config.js", "app/data.js", "app/domain.js", "app/storage.js"]) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  vm.runInThisContext(source, { filename: file });
}

const admin = { name: "María Fernanda Rojas" };
const security = { name: "Luis Mendoza" };
const cleaning = { name: "Rosa Huamán" };
const now = "2026-07-12T09:43:00-05:00";

assert.match(livingFormatShortDate("2026-07-18"), /18/);

function apply(data, action, role, account) {
  return livingApplyDomainAction(data, action, { role, account, now });
}

let data = buildLivingDemoData();
const anaId = "TRL-2026-0718-0024";

assert.throws(
  () => apply(data, { type: "approve_reservation", reservationId: anaId }, "security", security),
  (error) => error.code === "forbidden"
);

assert.throws(
  () => apply(data, { type: "complete_task", taskId: data.tasks[0].id }, "junta", { name: "Junta directiva" }),
  (error) => error.code === "forbidden"
);

assert.throws(
  () => apply(data, { type: "mark_arrival", reservationId: anaId }, "security", security),
  (error) => error.code === "invalid_transition"
);

let result = apply(data, { type: "approve_reservation", reservationId: anaId }, "building_admin", admin);
data = result.data;
let ana = data.reservations.find((item) => item.id === anaId);
assert.equal(ana.status, "approved");
assert.equal(ana.approvedBy, admin.name);
assert.equal(data.auditLog[0].action, "approve_reservation");

assert.throws(
  () => apply(data, { type: "approve_reservation", reservationId: anaId }, "building_admin", admin),
  (error) => error.code === "invalid_transition"
);

result = apply(data, { type: "mark_arrival", reservationId: anaId }, "security", security);
data = result.data;
result = apply(data, { type: "verify_guests", reservationId: anaId }, "security", security);
data = result.data;
ana = data.reservations.find((item) => item.id === anaId);
assert.equal(ana.securityResidentArrived, true);
assert.equal(ana.securityGuestsVerified, true);

const anaTasks = data.tasks.filter((item) => item.reservationId === anaId);
for (const task of anaTasks) {
  result = apply(data, { type: "complete_task", taskId: task.id }, "cleaning", cleaning);
  data = result.data;
}
ana = data.reservations.find((item) => item.id === anaId);
assert.equal(ana.cleaningStatus, "completed");
assert.equal(data.auditLog.length, 5);

const memory = new Map();
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
assert.equal(saveLivingDemoState(data, storage), true);
assert.equal(loadLivingDemoState(storage).auditLog.length, 5);
memory.set(LIVING_STORAGE_KEY, JSON.stringify({ version: 999, data }));
assert.equal(loadLivingDemoState(storage), null);
resetLivingDemoState(storage);
assert.equal(memory.has(LIVING_STORAGE_KEY), false);

console.log("Living domain tests passed: permissions, workflow, audit, and persistence.");
