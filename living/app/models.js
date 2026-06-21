/**
 * @typedef {'super_admin'|'building_admin'|'assistant_admin'|'security'|'cleaning'|'junta'} LivingRole
 * @typedef {'pending_approval'|'approved'|'confirmed'|'completed'|'cancelled'|'rejected'} ReservationStatus
 * @typedef {'submitted'|'verified'|'rejected'} PaymentStatus
 * @typedef {'held'|'released'|'retained'} DepositStatus
 * @typedef {{id:string, code:string, residentName:string, apartment:string, areaId:string, areaName:string, date:string, amount:number, status:ReservationStatus, paymentStatus:PaymentStatus, depositStatus:DepositStatus}} LivingReservation
 * @typedef {{id:string, type:string, status:string, estimatedCost:number, reservationId:string}} LivingIncident
 * @typedef {{building:object, areas:Array<object>, residents:Array<object>, apartments:Array<object>, reservations:Array<LivingReservation>, tasks:Array<object>, incidents:Array<LivingIncident>, messages:Array<object>, superAdmin:object, auditLog:Array<object>}} LivingData
 */

(function registerLivingModels(global) {
  function assertArray(data, key, errors) {
    if (!Array.isArray(data[key])) errors.push(`${key} debe ser una lista.`);
  }

  global.validateLivingData = function validateLivingData(data) {
    const errors = [];
    if (!data || typeof data !== "object") return { valid: false, errors: ["Los datos no son válidos."] };
    ["areas", "residents", "apartments", "reservations", "tasks", "incidents", "messages", "auditLog"].forEach((key) => assertArray(data, key, errors));
    if (!data.building || typeof data.building.name !== "string") errors.push("Falta el perfil del edificio.");
    if (!data.superAdmin || !["buildings", "templates", "supportQueue", "subscriptions"].every((key) => Array.isArray(data.superAdmin[key]))) errors.push("Falta la configuración de Super Admin.");
    if (!data.report || !Number.isFinite(data.report.satisfaction)) errors.push("Falta la configuración de reportes.");
    const areaIds = new Set((data.areas || []).map((area) => area.id));
    (data.areas || []).forEach((area) => {
      if (!area.id || !area.name || !Number.isFinite(area.capacity) || !Number.isFinite(area.reservationFee) || !Number.isFinite(area.deposit)) errors.push("Hay un área común incompleta.");
    });
    const ids = new Set();
    const reservationStatuses = new Set(["pending_approval", "approved", "confirmed", "completed", "cancelled", "rejected"]);
    const paymentStatuses = new Set(["submitted", "verified", "rejected"]);
    const depositStatuses = new Set(["held", "released", "retained"]);
    (data.reservations || []).forEach((reservation) => {
      if (!reservation.id || !reservation.code || !/^\d{4}-\d{2}-\d{2}$/.test(reservation.date || "") || !areaIds.has(reservation.areaId)) errors.push("Hay una reserva incompleta.");
      if (!reservationStatuses.has(reservation.status) || !paymentStatuses.has(reservation.paymentStatus) || !depositStatuses.has(reservation.depositStatus)) errors.push(`Estado inválido en ${reservation.code || "reserva"}.`);
      if (![reservation.amount, reservation.reservationFee, reservation.depositAmount].every((value) => Number.isFinite(value) && value >= 0)) errors.push(`Monto inválido en ${reservation.code || "reserva"}.`);
      if (ids.has(reservation.id)) errors.push(`ID de reserva duplicado: ${reservation.id}.`);
      ids.add(reservation.id);
    });
    (data.tasks || []).forEach((task) => {
      if (!task.id || !ids.has(task.reservationId) || !Array.isArray(task.checklist) || !Array.isArray(task.completedItems)) errors.push("Hay una tarea incompleta.");
    });
    (data.incidents || []).forEach((incident) => {
      if (!incident.id || !ids.has(incident.reservationId) || !incident.createdAt || !Number.isFinite(incident.estimatedCost)) errors.push("Hay un incidente incompleto.");
    });
    return { valid: errors.length === 0, errors };
  };

  global.assertLivingData = function assertLivingData(data) {
    const result = global.validateLivingData(data);
    if (!result.valid) throw new Error(result.errors[0]);
    return data;
  };
})(window);
