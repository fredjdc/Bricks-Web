(function registerLivingDomain(global) {
  const permissions = {
    approve_reservation: ["building_admin", "assistant_admin"],
    mark_arrival: ["building_admin", "assistant_admin", "security"],
    verify_guests: ["building_admin", "assistant_admin", "security"],
    complete_task: ["building_admin", "assistant_admin", "cleaning"],
  };

  const labels = {
    approve_reservation: "Reserva aprobada",
    mark_arrival: "Llegada registrada",
    verify_guests: "Invitados verificados",
    complete_task: "Checklist completado",
  };

  class LivingDomainError extends Error {
    constructor(message, code = "invalid_action") {
      super(message);
      this.name = "LivingDomainError";
      this.code = code;
    }
  }

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function assertPermission(role, actionType) {
    if (!permissions[actionType] || !permissions[actionType].includes(role)) {
      throw new LivingDomainError("Su rol no tiene permiso para realizar esta acción.", "forbidden");
    }
  }

  function findReservation(data, reservationId) {
    const reservation = data.reservations.find((item) => item.id === reservationId);
    if (!reservation) throw new LivingDomainError("No se encontró la reserva.", "not_found");
    return reservation;
  }

  function addAuditEntry(data, action, context, entity) {
    data.auditLog = Array.isArray(data.auditLog) ? data.auditLog : [];
    data.auditLog.unshift({
      id: `${action.type}-${entity.id}-${context.now}`,
      action: action.type,
      label: labels[action.type],
      entityId: entity.id,
      entityType: action.type === "complete_task" ? "task" : "reservation",
      actorName: context.account.name,
      actorRole: context.role,
      createdAt: context.now,
    });
  }

  function applyDomainAction(currentData, action, context) {
    if (!action || !action.type) throw new LivingDomainError("La acción no es válida.");
    assertPermission(context.role, action.type);
    const data = clone(currentData);
    const now = context.now || new Date().toISOString();
    const resolvedContext = { ...context, now };

    if (action.type === "approve_reservation") {
      const reservation = findReservation(data, action.reservationId);
      if (reservation.status !== "pending_approval") throw new LivingDomainError("Esta reserva ya no está pendiente de aprobación.", "invalid_transition");
      if (reservation.paymentStatus !== "verified") throw new LivingDomainError("Verifique el pago antes de aprobar la reserva.", "payment_unverified");
      reservation.status = "approved";
      reservation.approvedBy = context.account.name;
      reservation.approvedAt = now;
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Reserva ${reservation.code} aprobada.` };
    }

    if (action.type === "mark_arrival") {
      const reservation = findReservation(data, action.reservationId);
      if (!["approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("La llegada solo puede registrarse en una reserva aprobada.", "invalid_transition");
      if (reservation.securityResidentArrived) throw new LivingDomainError("La llegada del residente ya fue registrada.", "already_completed");
      reservation.securityResidentArrived = true;
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Llegada registrada para ${reservation.code}.` };
    }

    if (action.type === "verify_guests") {
      const reservation = findReservation(data, action.reservationId);
      if (!["approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("Los invitados solo pueden verificarse en una reserva aprobada.", "invalid_transition");
      if (!reservation.guestList.length) throw new LivingDomainError("La reserva no tiene una lista de invitados registrada.", "missing_guest_list");
      if (reservation.securityGuestsVerified) throw new LivingDomainError("Los invitados ya fueron verificados.", "already_completed");
      reservation.securityGuestsVerified = true;
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Invitados verificados para ${reservation.code}.` };
    }

    if (action.type === "complete_task") {
      const task = data.tasks.find((item) => item.id === action.taskId);
      if (!task) throw new LivingDomainError("No se encontró la tarea.", "not_found");
      if (task.status === "completed") throw new LivingDomainError("La tarea ya fue completada.", "already_completed");
      task.status = "completed";
      task.completedItems = [...task.checklist];
      task.completedAt = now;
      task.completedBy = context.account.name;
      const reservation = findReservation(data, task.reservationId);
      if (data.tasks.filter((item) => item.reservationId === task.reservationId).every((item) => item.status === "completed")) reservation.cleaningStatus = "completed";
      addAuditEntry(data, action, resolvedContext, task);
      return { data, message: `Checklist de ${task.areaName} completado.` };
    }

    throw new LivingDomainError("La acción no está implementada.", "unsupported_action");
  }

  global.LivingDomainError = LivingDomainError;
  global.LIVING_ACTION_PERMISSIONS = permissions;
  global.livingApplyDomainAction = applyDomainAction;
})(window);
