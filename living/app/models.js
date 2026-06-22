/**
 * @typedef {'super_admin'|'building_admin'|'assistant_admin'|'security'|'cleaning'|'junta'} LivingRole
 * @typedef {'pending_payment'|'pending_approval'|'approved'|'confirmed'|'completed'|'cancelled'|'rejected'|'no_show'} ReservationStatus
 * @typedef {'submitted'|'verified'|'rejected'} PaymentStatus
 * @typedef {'held'|'released'|'retained'} DepositStatus
 * @typedef {{id:string, code:string, residentName:string, apartment:string, areaId:string, areaName:string, date:string, amount:number, status:ReservationStatus, paymentStatus:PaymentStatus, depositStatus:DepositStatus}} LivingReservation
 * @typedef {{id:string, type:string, status:string, estimatedCost:number, reservationId:string}} LivingIncident
 * @typedef {{building:object, areas:Array<object>, residents:Array<object>, apartments:Array<object>, reservations:Array<LivingReservation>, tasks:Array<object>, incidents:Array<LivingIncident>, messages:Array<object>, paymentLedger:Array<object>, depositLedger:Array<object>, maintenanceBlocks:Array<object>, areaClosures:Array<object>, superAdmin:object, auditLog:Array<object>}} LivingData
 */

(function registerLivingModels(global) {
  function assertArray(data, key, errors) {
    if (!Array.isArray(data[key])) errors.push(`${key} debe ser una lista.`);
  }

  global.validateLivingData = function validateLivingData(data) {
    const errors = [];
    if (!data || typeof data !== "object") return { valid: false, errors: ["Los datos no son válidos."] };
    ["areas", "residents", "apartments", "reservations", "tasks", "incidents", "messages", "paymentLedger", "depositLedger", "maintenanceBlocks", "areaClosures", "auditLog"].forEach((key) => assertArray(data, key, errors));
    if (!data.building || typeof data.building.name !== "string") errors.push("Falta el perfil del edificio.");
    if (!data.superAdmin || !["buildings", "templates", "supportQueue", "subscriptions"].every((key) => Array.isArray(data.superAdmin[key]))) errors.push("Falta la configuración de Super Admin.");
    if (!data.report || !Number.isFinite(data.report.satisfaction)) errors.push("Falta la configuración de reportes.");
    const areaIds = new Set((data.areas || []).map((area) => area.id));
    (data.areas || []).forEach((area) => {
      if (!area.id || !area.name || !Number.isFinite(area.capacity) || !Number.isFinite(area.reservationFee) || !Number.isFinite(area.deposit) || !Array.isArray(area.policyVersions) || !area.policyVersions.length) errors.push("Hay un área común incompleta.");
      const policyVersions = new Set();
      const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
      const allowedMethods = new Set(["Yape", "Plin", "Transferencia", "Efectivo"]);
      (area.policyVersions || []).forEach((policy) => {
        const availability = policy.availability || {};
        const methods = [...(policy.payment?.methods || []), ...(policy.guarantee?.methods || [])];
        const validCollections = Array.isArray(policy.rules) && policy.rules.length && Array.isArray(availability.months) && availability.months.length && availability.months.every((month) => Number.isInteger(month) && month >= 1 && month <= 12) && Array.isArray(availability.weekdays) && availability.weekdays.length && availability.weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
        const validSchedule = validTime(availability.start) && validTime(availability.end) && availability.start < availability.end && Number.isFinite(availability.blockMinutes) && availability.blockMinutes >= 30 && Number.isFinite(availability.maxDurationMinutes) && availability.maxDurationMinutes >= availability.blockMinutes && availability.maxDurationMinutes % availability.blockMinutes === 0;
        const validFees = Number.isFinite(policy.payment?.amount) && policy.payment.amount >= 0 && Number.isFinite(policy.guarantee?.amount) && policy.guarantee.amount >= 0 && methods.every((method) => allowedMethods.has(method));
        if (!policy.id || !Number.isInteger(policy.version) || policyVersions.has(policy.version) || !/^\d{4}-\d{2}-\d{2}$/.test(policy.effectiveFrom || "") || !policy.name || !policy.location || !["active", "closed"].includes(policy.status) || !Number.isFinite(policy.capacity) || policy.capacity < 1 || !policy.payment || !policy.guarantee || !policy.requirements || !validCollections || !validSchedule || !validFees) errors.push(`Hay una política incompleta en ${area.name || "área"}.`);
        policyVersions.add(policy.version);
      });
    });
    const ids = new Set();
    const reservationStatuses = new Set(["pending_payment", "pending_approval", "approved", "confirmed", "completed", "cancelled", "rejected", "no_show"]);
    const paymentStatuses = new Set(["submitted", "verified", "rejected"]);
    const depositStatuses = new Set(["held", "released", "retained"]);
    (data.reservations || []).forEach((reservation) => {
      if (!reservation.id || !reservation.code || !/^\d{4}-\d{2}-\d{2}$/.test(reservation.date || "") || !areaIds.has(reservation.areaId)) errors.push("Hay una reserva incompleta.");
      if (!reservationStatuses.has(reservation.status) || !paymentStatuses.has(reservation.paymentStatus) || !depositStatuses.has(reservation.depositStatus)) errors.push(`Estado inválido en ${reservation.code || "reserva"}.`);
      if (![reservation.amount, reservation.reservationFee, reservation.depositAmount].every((value) => Number.isFinite(value) && value >= 0)) errors.push(`Monto inválido en ${reservation.code || "reserva"}.`);
      if (!Array.isArray(reservation.lifecycle)) errors.push(`Falta el historial de ${reservation.code || "reserva"}.`);
      if (ids.has(reservation.id)) errors.push(`ID de reserva duplicado: ${reservation.id}.`);
      ids.add(reservation.id);
    });
    (data.tasks || []).forEach((task) => {
      if (!task.id || !ids.has(task.reservationId) || !Array.isArray(task.checklist) || !Array.isArray(task.completedItems)) errors.push("Hay una tarea incompleta.");
    });
    (data.incidents || []).forEach((incident) => {
      if (!incident.id || !ids.has(incident.reservationId) || !incident.createdAt || !Number.isFinite(incident.estimatedCost)) errors.push("Hay un incidente incompleto.");
    });
    [...(data.paymentLedger || []), ...(data.depositLedger || [])].forEach((entry) => {
      if (!entry.id || !ids.has(entry.reservationId) || !Number.isFinite(entry.amount) || !entry.createdAt) errors.push("Hay un movimiento financiero incompleto.");
    });
    (data.maintenanceBlocks || []).forEach((block) => {
      if (!block.id || !areaIds.has(block.areaId) || !block.date || !block.start || !block.end) errors.push("Hay un bloqueo de mantenimiento incompleto.");
    });
    (data.areaClosures || []).forEach((closure) => {
      if (!closure.id || !areaIds.has(closure.areaId) || !closure.date || !closure.start || !closure.end) errors.push("Hay un cierre de área incompleto.");
    });
    return { valid: errors.length === 0, errors };
  };

  global.assertLivingData = function assertLivingData(data) {
    const result = global.validateLivingData(data);
    if (!result.valid) throw new Error(result.errors[0]);
    return data;
  };
})(window);
