import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

globalThis.window = globalThis;

for (const file of ["app/config.js", "app/data.js", "app/models.js", "app/selectors.js", "app/domain.js", "app/storage.js", "app/services.js", "app/api-contracts.js", "app/repositories.js"]) {
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
assert.equal(livingSelectors.startOfWeek("2026-07-18"), "2026-07-13");
assert.equal(livingSelectors.addDays("2026-07-18", 7), "2026-07-25");
assert.equal(livingSelectors.addMonths("2026-07-18", 1), "2026-08-18");
assert.equal(livingSelectors.addMonths("2026-01-31", 1), "2026-02-28");
const julyGrid = livingSelectors.monthGrid("2026-07-18");
assert.equal(julyGrid.length, 42);
assert.equal(julyGrid[0], "2026-06-29");
assert.equal(julyGrid.at(-1), "2026-08-09");
const calendarEntries = livingSelectors.calendarEntries(data);
assert.ok(calendarEntries.some((item) => item.id === anaId && item.type === "reservation"));
assert.ok(calendarEntries.some((item) => item.type === "maintenance"));
assert.ok(calendarEntries.some((item) => item.type === "closure"));
assert.deepEqual(calendarEntries, [...calendarEntries].sort((a, b) => `${a.date}${a.start}${a.title}`.localeCompare(`${b.date}${b.start}${b.title}`)));
assert.equal(livingSelectors.report(data).totalReservations, data.reservations.filter((item) => item.date.startsWith("2026-07") && !["cancelled", "rejected"].includes(item.status)).length);
assert.equal(livingSelectors.report(data).totalReservations, 98);
assert.equal(livingSelectors.report(data).totalRevenue, 6320);
const recentApprovals = livingSelectors.recentApprovals(data, 5);
assert.equal(recentApprovals.length, 5);
assert.ok(recentApprovals.every((item) => item.approvedAt));
assert.deepEqual(recentApprovals, [...recentApprovals].sort((a, b) => b.approvedAt.localeCompare(a.approvedAt)));

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

const lifecycleSource = buildLivingDemoData();
const createCommand = {
  type: "create_reservation",
  residentId: "resident-402",
  areaId: "terrace",
  date: "2026-07-22",
  start: "17:00",
  end: "21:00",
  guestCount: 12,
  reason: "Reunión familiar",
  paymentMethod: "Yape",
  paymentProofName: "pago.jpg",
  paymentProofType: "image/jpeg",
  paymentProofSize: 120000,
};
let lifecycleResult = apply(lifecycleSource, createCommand, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T11:00:00-05:00");
const createdReservation = lifecycleResult.data.reservations[0];
assert.equal(createdReservation.status, "pending_approval");
assert.equal(createdReservation.areaPolicySnapshot.version, 1);
assert.equal(lifecycleResult.data.paymentLedger[0].type, "payment_submitted");
assert.equal(lifecycleResult.data.depositLedger[0].type, "deposit_held");

lifecycleResult = apply(lifecycleResult.data, { type: "reschedule_reservation", reservationId: createdReservation.id, date: "2026-07-23", start: "09:00", end: "11:00" }, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T11:10:00-05:00");
assert.equal(lifecycleResult.data.reservations.find((item) => item.id === createdReservation.id).date, "2026-07-23");

assert.throws(
  () => apply(buildLivingDemoData(), { ...createCommand, date: "2026-07-18", start: "17:00", end: "21:00" }, "building_admin", admin),
  (error) => error.code === "schedule_conflict"
);

let cancellationData = apply(buildLivingDemoData(), { type: "cancel_reservation", reservationId: anaId, reason: "Cambio de planes" }, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T11:00:00-05:00").data;
assert.equal(cancellationData.reservations.find((item) => item.id === anaId).refundStatus, "pending");
assert.throws(
  () => apply(cancellationData, { type: "refund_payment", reservationId: anaId, reference: "REF-001" }, "assistant_admin", { name: "Carlos Vega" }),
  (error) => error.code === "forbidden"
);
cancellationData = apply(cancellationData, { type: "refund_payment", reservationId: anaId, reference: "REF-001" }, "building_admin", admin, "2026-07-19T00:30:00-05:00").data;
assert.equal(cancellationData.reservations.find((item) => item.id === anaId).refundStatus, "refunded");
assert.equal(cancellationData.reservations.find((item) => item.id === anaId).depositStatus, "released");
assert.equal(cancellationData.paymentLedger[0].amount, -420);
assert.equal(cancellationData.depositLedger[0].type, "deposit_refunded");

let noShowData = apply(buildLivingDemoData(), { type: "approve_reservation", reservationId: anaId }, "building_admin", admin).data;
noShowData = apply(noShowData, { type: "mark_no_show", reservationId: anaId }, "security", security, "2026-07-19T00:30:00-05:00").data;
assert.equal(noShowData.reservations.find((item) => item.id === anaId).status, "no_show");

const maintenanceSource = buildLivingDemoData();
let maintenanceResult = apply(maintenanceSource, { type: "create_maintenance", areaId: "bbq", date: "2026-07-23", start: "08:00", end: "10:00", reason: "Limpieza profunda" }, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T11:00:00-05:00");
const createdMaintenance = maintenanceResult.data.maintenanceBlocks[0];
assert.equal(createdMaintenance.status, "active");
maintenanceResult = apply(maintenanceResult.data, { type: "remove_maintenance", maintenanceId: createdMaintenance.id }, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T12:00:00-05:00");
assert.equal(maintenanceResult.data.maintenanceBlocks[0].status, "cancelled");

const policySource = buildLivingDemoData();
const bbqPolicy = policySource.areas.find((item) => item.id === "bbq").policyVersions[0];
const policyCommand = {
  type: "update_area",
  areaId: "bbq",
  name: "Parrillas",
  location: "Piso 22 norte",
  effectiveFrom: "2026-07-23",
  status: "active",
  closureReason: "",
  reservable: true,
  capacity: 24,
  rules: ["Sin música amplificada", "Dejar el área limpia"],
  paymentEnabled: true,
  reservationFee: 80,
  paymentMethods: ["Yape", "Plin"],
  guaranteeEnabled: true,
  deposit: 200,
  guaranteeMethods: ["Yape", "Plin"],
  months: bbqPolicy.availability.months,
  weekdays: bbqPolicy.availability.weekdays,
  availabilityStart: "08:00",
  availabilityEnd: "22:00",
  blockMinutes: 120,
  maxDurationMinutes: 240,
  requiresGuestList: false,
  requiresApproval: false,
};
let policyResult = apply(policySource, policyCommand, "building_admin", admin, "2026-07-17T11:00:00-05:00");
const updatedArea = policyResult.data.areas.find((item) => item.id === "bbq");
assert.equal(updatedArea.policyVersions.length, 2);
assert.equal(updatedArea.name, "Zona BBQ");
assert.equal(livingSelectors.areaPolicyOnDate(updatedArea, "2026-07-22").version, 1);
assert.equal(livingSelectors.areaPolicyOnDate(updatedArea, "2026-07-23").version, 2);
let futureCloseData = apply(buildLivingDemoData(), { ...policyCommand, areaId: "terrace", name: "Terraza", location: "Piso 22", status: "closed", effectiveFrom: "2026-07-23" }, "building_admin", admin, "2026-07-17T11:00:00-05:00").data;
const futureClosedArea = futureCloseData.areas.find((item) => item.id === "terrace");
assert.equal(futureClosedArea.status, "active");
assert.equal(livingSelectors.areaPolicyOnDate(futureClosedArea, "2026-07-22").status, "active");
assert.equal(livingSelectors.areaPolicyOnDate(futureClosedArea, "2026-07-23").status, "closed");
const autoApprovalCommand = { ...createCommand, areaId: "bbq", date: "2026-08-31", start: "08:00", end: "10:00", paymentMethod: "Plin" };
policyResult = apply(policyResult.data, autoApprovalCommand, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T12:00:00-05:00");
const autoReservation = policyResult.data.reservations[0];
assert.equal(autoReservation.status, "pending_payment");
assert.equal(autoReservation.reservationFee, 80);
assert.equal(autoReservation.areaPolicySnapshot.version, 2);
policyResult = apply(policyResult.data, { type: "verify_payment", reservationId: autoReservation.id }, "assistant_admin", { name: "Carlos Vega" }, "2026-08-30T12:00:00-05:00");
assert.equal(policyResult.data.reservations.find((item) => item.id === autoReservation.id).status, "approved");
assert.throws(
  () => apply(buildLivingDemoData(), { ...policyCommand, paymentMethods: ["Criptomoneda"] }, "building_admin", admin, "2026-07-17T11:00:00-05:00"),
  (error) => error.code === "validation_error"
);
assert.throws(
  () => apply(buildLivingDemoData(), { ...policyCommand, paymentMethods: ["Yape"], guaranteeMethods: ["Plin"] }, "building_admin", admin, "2026-07-17T11:00:00-05:00"),
  (error) => error.code === "validation_error"
);

let rejectedPaymentData = apply(buildLivingDemoData(), { type: "reject_payment", reservationId: "EVR-2026-0719-0094", reason: "Imagen ilegible" }, "assistant_admin", { name: "Carlos Vega" }).data;
rejectedPaymentData = apply(rejectedPaymentData, { type: "resubmit_payment", reservationId: "EVR-2026-0719-0094", paymentProofName: "nuevo.pdf", paymentProofType: "application/pdf", paymentProofSize: 150000 }, "assistant_admin", { name: "Carlos Vega" }).data;
assert.equal(rejectedPaymentData.reservations.find((item) => item.id === "EVR-2026-0719-0094").paymentStatus, "submitted");
assert.equal(rejectedPaymentData.paymentLedger[0].type, "payment_resubmitted");

let closureResult = apply(buildLivingDemoData(), { type: "create_area_closure", areaId: "terrace", date: "2026-08-31", start: "08:00", end: "12:00", reason: "Inspección programada" }, "building_admin", admin, "2026-07-17T11:00:00-05:00");
const createdClosure = closureResult.data.areaClosures[0];
assert.equal(livingSelectors.availabilityForSlot(closureResult.data, { areaId: "terrace", date: "2026-08-31", start: "09:00", end: "11:00" }).available, false);
closureResult = apply(closureResult.data, { type: "remove_area_closure", closureId: createdClosure.id }, "assistant_admin", { name: "Carlos Vega" }, "2026-07-17T12:00:00-05:00");
assert.equal(closureResult.data.areaClosures[0].status, "cancelled");
assert.throws(
  () => apply(buildLivingDemoData(), { type: "create_area_closure", areaId: "terrace", date: "2026-07-18", start: "17:00", end: "21:00", reason: "Cierre extraordinario" }, "building_admin", admin),
  (error) => error.code === "schedule_conflict"
);
assert.throws(
  () => apply(buildLivingDemoData(), { type: "create_area_closure", areaId: "bbq", date: "2026-07-20", start: "08:00", end: "10:00", reason: "Cierre extraordinario" }, "building_admin", admin),
  (error) => error.code === "schedule_conflict"
);

assert.deepEqual(livingBuildApiRequest({ type: "reschedule_reservation", reservationId: anaId, date: "2026-07-22", start: "10:00", end: "12:00" }), {
  method: "PATCH",
  path: `/v1/reservations/${anaId}/schedule`,
  body: { date: "2026-07-22", start: "10:00", end: "12:00" },
});
const createApiRequest = livingBuildApiRequest(createCommand);
assert.equal(createApiRequest.body.residentId, "resident-402");
assert.equal(createApiRequest.body.areaId, "terrace");
assert.equal(livingBuildApiRequest({ type: "create_maintenance", areaId: "bbq", date: "2026-08-31", start: "08:00", end: "10:00", reason: "Trabajo técnico" }).body.areaId, "bbq");
assert.deepEqual(Object.keys(LIVING_ACTION_PERMISSIONS).sort(), Object.keys(LIVING_API_CONTRACTS).sort());
assert.throws(
  () => apply(buildLivingDemoData(), { type: "create_maintenance", areaId: "bbq", date: "2026-07-23", start: "25:00", end: "26:00", reason: "Limpieza profunda" }, "assistant_admin", { name: "Carlos Vega" }),
  (error) => error.code === "validation_error"
);

let repositoryData = buildLivingDemoData();
const repository = createLivingRepository({
  getData: () => repositoryData,
  getContext: () => ({ role: "building_admin", account: admin, now }),
  service: createLivingMockService({ minimumDelay: 0, maximumDelay: 0 }),
});
const repositoryResult = await repository.execute({ type: "approve_reservation", reservationId: anaId });
repositoryData = repositoryResult.data;
assert.equal(repositoryData.reservations.find((item) => item.id === anaId).status, "approved");
assert.equal(repository.select(livingSelectors.dashboard).pendingApprovals, 5);

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
const corruptPolicyData = buildLivingDemoData();
corruptPolicyData.areas[0].policyVersions[0].availability.months = [13];
assert.equal(validateLivingData(corruptPolicyData).valid, false);
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
const versionFourData = buildLivingDemoData();
versionFourData.areas.forEach((area) => { delete area.policyVersions; });
delete versionFourData.areaClosures;
memory.set(LIVING_STORAGE_KEY, JSON.stringify({ version: 4, data: versionFourData }));
const versionFiveData = loadLivingDemoState(storage);
assert.equal(versionFiveData.areas.every((area) => area.policyVersions.length === 1), true);
assert.ok(Array.isArray(versionFiveData.areaClosures));
assert.equal(versionFiveData.areaClosures.length, 0);
memory.set(LIVING_STORAGE_KEY, JSON.stringify({ version: 999, data }));
assert.equal(loadLivingDemoState(storage), null);
resetLivingDemoState(storage);
assert.equal(memory.has(LIVING_STORAGE_KEY), false);

console.log("Living domain tests passed: permissions, workflow, audit, and persistence.");
