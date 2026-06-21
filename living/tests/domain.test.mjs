import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

globalThis.window = globalThis;

for (const file of ["app/config.js", "app/data.js", "app/models.js", "app/selectors.js", "app/domain.js", "app/storage.js", "app/services.js", "app/repositories.js"]) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  vm.runInThisContext(source, { filename: file });
}

const admin = { name: "María Fernanda Rojas" };
const security = { name: "Luis Mendoza" };
const cleaning = { name: "Rosa Huamán" };
const now = "2026-07-12T09:43:00-05:00";

assert.match(livingFormatShortDate("2026-07-18"), /18/);

function apply(data, action, role, account, actionNow = now) {
  return livingApplyDomainAction(data, action, { role, account, now: actionNow });
}

let data = buildLivingDemoData();
const anaId = "TRL-2026-0718-0024";

assert.equal(validateLivingData(data).valid, true);
assert.equal(livingSelectors.report(data).totalReservations, data.reservations.filter((item) => item.date.startsWith("2026-07")).length);
assert.equal(livingSelectors.report(data).totalReservations, 90);
assert.equal(livingSelectors.report(data).totalRevenue, 5280);

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
  const completionTime = new Date(new Date(task.dueTime).getTime() + 15 * 60 * 1000).toISOString();
  result = apply(data, { type: "complete_task", taskId: task.id }, "cleaning", cleaning, completionTime);
  data = result.data;
}
ana = data.reservations.find((item) => item.id === anaId);
assert.equal(ana.cleaningStatus, "completed");
assert.equal(data.auditLog.length, 5);

let paymentData = buildLivingDemoData();
let paymentResult = apply(paymentData, { type: "verify_payment", reservationId: "EVR-2026-0719-0094" }, "assistant_admin", { name: "Carlos Vega" });
assert.equal(paymentResult.data.reservations.find((item) => item.id === "EVR-2026-0719-0094").paymentStatus, "verified");

assert.throws(
  () => apply(buildLivingDemoData(), { type: "reject_payment", reservationId: "EVR-2026-0719-0094", reason: "" }, "building_admin", admin),
  (error) => error.code === "validation_error"
);

assert.throws(
  () => apply(buildLivingDemoData(), { type: "retain_deposit", reservationId: "EVR-2026-0712-0007", amount: 80, reason: "Silla dañada" }, "assistant_admin", { name: "Carlos Vega" }),
  (error) => error.code === "forbidden"
);

assert.throws(
  () => apply(buildLivingDemoData(), { type: "release_deposit", reservationId: "EVR-2026-0712-0007" }, "assistant_admin", { name: "Carlos Vega" }),
  (error) => error.code === "forbidden"
);

const releasableData = buildLivingDemoData();
const releasableReservation = releasableData.reservations.find((item) => item.status === "completed" && item.depositStatus === "held" && item.depositAmount > 0);
let depositResult = apply(releasableData, { type: "release_deposit", reservationId: releasableReservation.id }, "assistant_admin", { name: "Carlos Vega" });
assert.equal(depositResult.data.reservations.find((item) => item.id === releasableReservation.id).depositStatus, "released");

const earlyTaskData = apply(buildLivingDemoData(), { type: "approve_reservation", reservationId: anaId }, "building_admin", admin).data;
assert.throws(
  () => apply(earlyTaskData, { type: "complete_task", taskId: "task-prep-ana" }, "cleaning", cleaning),
  (error) => error.code === "too_early"
);

let incidentResult = apply(buildLivingDemoData(), { type: "create_incident", reservationId: anaId, incidentType: "Daño", description: "Se detectó una mesa dañada.", estimatedCost: 60, evidenceName: "mesa.jpg" }, "cleaning", cleaning);
const createdIncident = incidentResult.data.incidents[0];
assert.equal(createdIncident.createdBy, cleaning.name);
incidentResult = apply(incidentResult.data, { type: "resolve_incident", incidentId: createdIncident.id, resolution: "Reposición coordinada" }, "building_admin", admin);
assert.equal(incidentResult.data.incidents[0].status, "resolved");

let residentData = buildLivingDemoData();
const anaResident = residentData.residents.find((item) => item.apartment === "402");
let residentResult = apply(residentData, { type: "update_resident", residentId: anaResident.id, phone: "+51 999 111 222", status: "active" }, "assistant_admin", { name: "Carlos Vega" });
assert.equal(residentResult.data.apartments.find((item) => item.apartment === "402").whatsapp, "+51 999 111 222");

let platformData = buildLivingDemoData();
let platformResult = apply(platformData, { type: "advance_onboarding", buildingId: "building-alameda" }, "super_admin", { name: "Freddy Ops" });
assert.equal(platformResult.data.superAdmin.buildings.find((item) => item.id === "building-alameda").onboardingStep, 4);
platformResult = apply(platformResult.data, { type: "update_template", templateId: "template-approved", body: "Tu reserva {{codigo}} está aprobada y lista.", status: "Activa" }, "super_admin", { name: "Freddy Ops" });
assert.match(platformResult.data.superAdmin.templates.find((item) => item.id === "template-approved").body, /lista/);
assert.equal(livingSelectors.audit(platformResult.data, "junta")[0].actorName, undefined);

let repositoryData = buildLivingDemoData();
const repository = createLivingRepository({
  getData: () => repositoryData,
  getContext: () => ({ role: "building_admin", account: admin, now }),
  service: createLivingMockService({ minimumDelay: 0, maximumDelay: 0 }),
});
const repositoryResult = await repository.execute({ type: "approve_reservation", reservationId: anaId });
repositoryData = repositoryResult.data;
assert.equal(repositoryData.reservations.find((item) => item.id === anaId).status, "approved");
assert.equal(repository.select(livingSelectors.dashboard).pendingApprovals, 2);

const concurrentSource = buildLivingDemoData();
const concurrentRepository = createLivingRepository({
  getData: () => concurrentSource,
  getContext: () => ({ role: "building_admin", account: admin, now }),
  service: createLivingMockService({ minimumDelay: 0, maximumDelay: 0 }),
});
const [, concurrentFinal] = await Promise.all([
  concurrentRepository.execute({ type: "approve_reservation", reservationId: anaId }),
  concurrentRepository.execute({ type: "verify_payment", reservationId: "EVR-2026-0719-0094" }),
]);
assert.equal(concurrentFinal.data.reservations.find((item) => item.id === anaId).status, "approved");
assert.equal(concurrentFinal.data.reservations.find((item) => item.id === "EVR-2026-0719-0094").paymentStatus, "verified");

const historicalData = buildLivingDemoData();
const historicalRevenue = livingSelectors.report(historicalData).totalRevenue;
historicalData.areas.find((item) => item.id === "terrace").reservationFee = 999;
assert.equal(livingSelectors.report(historicalData).totalRevenue, historicalRevenue);

const corruptData = buildLivingDemoData();
corruptData.reservations[0].paymentStatus = "unknown";
assert.equal(validateLivingData(corruptData).valid, false);
assert.deepEqual(LIVING_NAV_ITEMS.find((item) => item.id === "dashboard").roles, ["building_admin", "assistant_admin"]);

const memory = new Map();
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
assert.equal(saveLivingDemoState(data, storage), true);
assert.equal(loadLivingDemoState(storage).auditLog.length, 5);
const legacyData = buildLivingDemoData();
legacyData.reservations[0].status = "approved";
legacyData.reservations.forEach((item) => { delete item.reservationFee; delete item.depositAmount; });
delete legacyData.superAdmin.subscriptions;
memory.set(LIVING_STORAGE_KEY, JSON.stringify({ version: 1, data: legacyData }));
const migratedData = loadLivingDemoState(storage);
assert.equal(migratedData.reservations[0].status, "approved");
assert.equal(migratedData.reservations[0].reservationFee, 120);
assert.ok(Array.isArray(migratedData.superAdmin.subscriptions));
memory.set(LIVING_STORAGE_KEY, JSON.stringify({ version: 999, data }));
assert.equal(loadLivingDemoState(storage), null);
resetLivingDemoState(storage);
assert.equal(memory.has(LIVING_STORAGE_KEY), false);

console.log("Living domain tests passed: permissions, workflow, audit, and persistence.");
