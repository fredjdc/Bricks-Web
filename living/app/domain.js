(function registerLivingDomain(global) {
  const permissions = {
    approve_reservation: ["building_admin", "assistant_admin"],
    mark_arrival: ["building_admin", "assistant_admin", "security"],
    verify_guests: ["building_admin", "assistant_admin", "security"],
    complete_task: ["building_admin", "assistant_admin", "cleaning"],
    verify_payment: ["building_admin", "assistant_admin"],
    reject_payment: ["building_admin", "assistant_admin"],
    release_deposit: ["building_admin", "assistant_admin"],
    retain_deposit: ["building_admin"],
    create_incident: ["building_admin", "assistant_admin", "security", "cleaning"],
    resolve_incident: ["building_admin"],
    update_resident: ["building_admin", "assistant_admin"],
    update_area: ["building_admin", "assistant_admin"],
    update_template: ["super_admin"],
    advance_onboarding: ["super_admin"],
    update_subscription: ["super_admin"],
    resolve_support: ["super_admin"],
    create_reservation: ["building_admin", "assistant_admin"],
    reschedule_reservation: ["building_admin", "assistant_admin"],
    cancel_reservation: ["building_admin", "assistant_admin"],
    reject_reservation: ["building_admin", "assistant_admin"],
    refund_payment: ["building_admin"],
    mark_no_show: ["building_admin", "assistant_admin", "security"],
    create_maintenance: ["building_admin", "assistant_admin"],
    remove_maintenance: ["building_admin", "assistant_admin"],
  };

  const labels = {
    approve_reservation: "Reserva aprobada",
    mark_arrival: "Llegada registrada",
    verify_guests: "Invitados verificados",
    complete_task: "Checklist completado",
    verify_payment: "Pago verificado",
    reject_payment: "Pago rechazado",
    release_deposit: "Garantía liberada",
    retain_deposit: "Garantía retenida",
    create_incident: "Incidente creado",
    resolve_incident: "Incidente resuelto",
    update_resident: "Residente actualizado",
    update_area: "Área actualizada",
    update_template: "Plantilla actualizada",
    advance_onboarding: "Onboarding actualizado",
    update_subscription: "Suscripción actualizada",
    resolve_support: "Caso de soporte resuelto",
    create_reservation: "Reserva creada",
    reschedule_reservation: "Reserva reprogramada",
    cancel_reservation: "Reserva cancelada",
    reject_reservation: "Reserva rechazada",
    refund_payment: "Reembolso completado",
    mark_no_show: "Inasistencia registrada",
    create_maintenance: "Mantenimiento programado",
    remove_maintenance: "Mantenimiento cancelado",
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
      id: `${action.type}-${entity.id}-${context.now}-${data.auditLog.length + 1}`,
      action: action.type,
      label: labels[action.type],
      entityId: entity.id,
      entityType: entity.entityType || (action.type === "complete_task" ? "task" : "reservation"),
      actorName: context.account.name,
      actorRole: context.role,
      createdAt: context.now,
      detail: action.reason || action.resolution || null,
    });
  }

  function addLifecycle(reservation, status, label, context, detail = null) {
    reservation.lifecycle = Array.isArray(reservation.lifecycle) ? reservation.lifecycle : [];
    reservation.lifecycle.push({ status, label, detail, createdAt: context.now, actor: context.account.name });
  }

  function addPaymentEntry(data, reservation, type, amount, status, context, reason = null) {
    data.paymentLedger.unshift({
      id: `payment-${reservation.id}-${type}-${data.paymentLedger.length + 1}`,
      reservationId: reservation.id,
      reservationCode: reservation.code,
      type,
      amount,
      method: reservation.paymentMethod || "Transferencia",
      status,
      reason,
      createdAt: context.now,
      actor: context.account.name,
    });
  }

  function addDepositEntry(data, reservation, type, amount, status, context, reason = null) {
    data.depositLedger.unshift({
      id: `deposit-${reservation.id}-${type}-${data.depositLedger.length + 1}`,
      reservationId: reservation.id,
      reservationCode: reservation.code,
      type,
      amount,
      status,
      reason,
      createdAt: context.now,
      actor: context.account.name,
    });
  }

  function validateSchedule(data, values, excludeReservationId = null) {
    const area = data.areas.find((item) => item.id === values.areaId);
    const resident = data.residents.find((item) => item.id === values.residentId);
    if (!area || area.status !== "active") throw new LivingDomainError("El área común no está disponible.", "validation_error");
    if (!resident || resident.status !== "active" || resident.debt > 0) throw new LivingDomainError("El residente debe estar activo y sin deuda.", "resident_blocked");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date || "") || !/^\d{2}:\d{2}$/.test(values.start || "") || !/^\d{2}:\d{2}$/.test(values.end || "") || values.start >= values.end) throw new LivingDomainError("Ingrese una fecha y horario válidos.", "validation_error");
    const guestCount = Number(values.guestCount);
    if (!Number.isInteger(guestCount) || guestCount < 0 || guestCount > area.capacity) throw new LivingDomainError(`El aforo máximo de ${area.name} es ${area.capacity}.`, "capacity_exceeded");
    if (!global.livingSelectors.isSlotAvailable(data, { areaId: area.id, date: values.date, start: values.start, end: values.end, excludeReservationId })) throw new LivingDomainError("El horario se cruza con otra reserva o mantenimiento.", "schedule_conflict");
    return { area, resident, guestCount };
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
      addLifecycle(reservation, "approved", "Reserva aprobada", resolvedContext);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Reserva ${reservation.code} aprobada.` };
    }

    if (action.type === "mark_arrival") {
      const reservation = findReservation(data, action.reservationId);
      if (!["approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("La llegada solo puede registrarse en una reserva aprobada.", "invalid_transition");
      if (reservation.securityResidentArrived) throw new LivingDomainError("La llegada del residente ya fue registrada.", "already_completed");
      reservation.securityResidentArrived = true;
      if (reservation.securityGuestsVerified) {
        reservation.status = "confirmed";
        addLifecycle(reservation, "confirmed", "Acceso validado", resolvedContext);
      }
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Llegada registrada para ${reservation.code}.` };
    }

    if (action.type === "verify_guests") {
      const reservation = findReservation(data, action.reservationId);
      if (!["approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("Los invitados solo pueden verificarse en una reserva aprobada.", "invalid_transition");
      if (!reservation.guestList.length) throw new LivingDomainError("La reserva no tiene una lista de invitados registrada.", "missing_guest_list");
      if (reservation.securityGuestsVerified) throw new LivingDomainError("Los invitados ya fueron verificados.", "already_completed");
      reservation.securityGuestsVerified = true;
      if (reservation.securityResidentArrived) {
        reservation.status = "confirmed";
        addLifecycle(reservation, "confirmed", "Acceso validado", resolvedContext);
      }
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Invitados verificados para ${reservation.code}.` };
    }

    if (action.type === "complete_task") {
      const task = data.tasks.find((item) => item.id === action.taskId);
      if (!task) throw new LivingDomainError("No se encontró la tarea.", "not_found");
      if (task.status === "completed") throw new LivingDomainError("La tarea ya fue completada.", "already_completed");
      const reservation = findReservation(data, task.reservationId);
      if (!["approved", "confirmed", "completed"].includes(reservation.status)) throw new LivingDomainError("La tarea requiere una reserva aprobada.", "invalid_transition");
      if (new Date(now).getTime() < new Date(task.dueTime).getTime()) throw new LivingDomainError("La tarea todavía no está habilitada por horario.", "too_early");
      if (task.type === "Limpieza post evento" && (!reservation.securityResidentArrived || !reservation.securityGuestsVerified)) throw new LivingDomainError("Complete primero el control de acceso del evento.", "invalid_transition");
      task.status = "completed";
      task.completedItems = [...task.checklist];
      task.completedAt = now;
      task.completedBy = context.account.name;
      if (task.type === "Limpieza post evento") reservation.status = "completed";
      if (task.type === "Limpieza post evento") addLifecycle(reservation, "completed", "Evento y limpieza completados", resolvedContext);
      if (data.tasks.filter((item) => item.reservationId === task.reservationId).every((item) => item.status === "completed")) reservation.cleaningStatus = "completed";
      addAuditEntry(data, action, resolvedContext, task);
      return { data, message: `Checklist de ${task.areaName} completado.` };
    }

    if (["verify_payment", "reject_payment"].includes(action.type)) {
      const reservation = findReservation(data, action.reservationId);
      if (reservation.paymentStatus !== "submitted") throw new LivingDomainError("El comprobante ya fue procesado.", "invalid_transition");
      if (action.type === "verify_payment" && !reservation.paymentProof) throw new LivingDomainError("Adjunte el comprobante antes de verificar el pago.", "missing_payment_proof");
      if (action.type === "reject_payment" && !action.reason?.trim()) throw new LivingDomainError("Indique el motivo del rechazo.", "validation_error");
      reservation.paymentStatus = action.type === "verify_payment" ? "verified" : "rejected";
      reservation.paymentReviewedAt = now;
      reservation.paymentReviewedBy = context.account.name;
      reservation.paymentReviewReason = action.reason || null;
      addLifecycle(reservation, reservation.paymentStatus, action.type === "verify_payment" ? "Pago verificado" : "Pago rechazado", resolvedContext, action.reason || null);
      addPaymentEntry(data, reservation, action.type === "verify_payment" ? "payment_verified" : "payment_rejected", reservation.amount, reservation.paymentStatus, resolvedContext, action.reason || null);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: action.type === "verify_payment" ? `Pago de ${reservation.code} verificado.` : `Comprobante de ${reservation.code} rechazado.` };
    }

    if (["release_deposit", "retain_deposit"].includes(action.type)) {
      const reservation = findReservation(data, action.reservationId);
      if (!['held', 'retained'].includes(reservation.depositStatus)) throw new LivingDomainError("La garantía ya fue liberada.", "invalid_transition");
      if (reservation.status !== "completed") throw new LivingDomainError("La garantía solo puede cerrarse después del evento.", "invalid_transition");
      if (action.type === "release_deposit" && reservation.depositStatus === "retained" && context.role !== "building_admin") throw new LivingDomainError("Solo el administrador puede revertir una retención.", "forbidden");
      if (action.type === "retain_deposit") {
        const amount = Number(action.amount);
        if (!action.reason?.trim() || !Number.isFinite(amount) || amount <= 0 || amount > (reservation.depositAmount || 0)) throw new LivingDomainError("Ingrese un monto y motivo válidos para la retención.", "validation_error");
        reservation.depositStatus = "retained";
        reservation.retainedAmount = amount;
        reservation.depositReason = action.reason.trim();
        addDepositEntry(data, reservation, "deposit_retained", amount, "retained", resolvedContext, action.reason.trim());
      } else {
        reservation.depositStatus = "released";
        reservation.depositReleasedAt = now;
        addDepositEntry(data, reservation, "deposit_released", reservation.depositAmount, "released", resolvedContext);
      }
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: action.type === "release_deposit" ? `Garantía de ${reservation.code} liberada.` : `Garantía de ${reservation.code} retenida.` };
    }

    if (action.type === "create_incident") {
      const reservation = findReservation(data, action.reservationId);
      const estimatedCost = Number(action.estimatedCost) || 0;
      if (!action.incidentType?.trim() || action.description?.trim().length < 10 || estimatedCost < 0) throw new LivingDomainError("Complete el tipo, una descripción válida y un costo no negativo.", "validation_error");
      const incident = {
        id: `incident-${now.replace(/\D/g, "")}-${data.incidents.length + 1}`,
        entityType: "incident",
        type: action.incidentType.trim(),
        reservationId: reservation.id,
        reservationCode: reservation.code,
        areaName: reservation.areaName,
        apartment: reservation.apartment,
        residentName: reservation.residentName,
        description: action.description.trim(),
        evidence: action.evidenceName ? [action.evidenceName] : [],
        createdBy: context.account.name,
        createdAt: now,
        status: "open",
        estimatedCost,
        depositImpact: estimatedCost > 0 ? `Evaluar S/ ${estimatedCost}` : "Sin impacto",
        notes: [],
      };
      data.incidents.unshift(incident);
      addAuditEntry(data, action, resolvedContext, incident);
      return { data, message: "Incidente registrado y enviado a administración." };
    }

    if (action.type === "resolve_incident") {
      const incident = data.incidents.find((item) => item.id === action.incidentId);
      if (!incident) throw new LivingDomainError("No se encontró el incidente.", "not_found");
      if (incident.status === "resolved") throw new LivingDomainError("El incidente ya fue resuelto.", "invalid_transition");
      if (action.resolution?.trim().length < 5) throw new LivingDomainError("Describa la resolución aplicada.", "validation_error");
      incident.entityType = "incident";
      incident.status = "resolved";
      incident.resolution = action.resolution.trim();
      incident.resolvedAt = now;
      incident.resolvedBy = context.account.name;
      addAuditEntry(data, action, resolvedContext, incident);
      return { data, message: "Incidente marcado como resuelto." };
    }

    if (action.type === "update_resident") {
      const resident = data.residents.find((item) => item.id === action.residentId);
      if (!resident) throw new LivingDomainError("No se encontró el residente.", "not_found");
      if (!/^\+51 9\d{2} \d{3} \d{3}$/.test(action.phone || "")) throw new LivingDomainError("Use un teléfono peruano con formato +51 999 999 999.", "validation_error");
      if (!["active", "blocked"].includes(action.status)) throw new LivingDomainError("El estado del residente no es válido.", "validation_error");
      resident.entityType = "resident";
      resident.phone = action.phone;
      resident.status = action.status;
      const apartment = data.apartments.find((item) => item.apartment === resident.apartment);
      if (apartment) {
        apartment.whatsapp = resident.phone;
        apartment.residentStatus = resident.status;
      }
      addAuditEntry(data, action, resolvedContext, resident);
      return { data, message: `${resident.name} actualizado.` };
    }

    if (action.type === "update_area") {
      const area = data.areas.find((item) => item.id === action.areaId);
      if (!area) throw new LivingDomainError("No se encontró el área común.", "not_found");
      const capacity = Number(action.capacity);
      const reservationFee = Number(action.reservationFee);
      const deposit = Number(action.deposit);
      if (![capacity, reservationFee, deposit].every(Number.isFinite) || capacity < 1 || reservationFee < 0 || deposit < 0) throw new LivingDomainError("Revise la capacidad, tarifa y garantía.", "validation_error");
      Object.assign(area, { entityType: "area", capacity, reservationFee, deposit });
      addAuditEntry(data, action, resolvedContext, area);
      return { data, message: `${area.name} actualizada.` };
    }

    if (action.type === "update_template") {
      const template = data.superAdmin.templates.find((item) => item.id === action.templateId);
      if (!template) throw new LivingDomainError("No se encontró la plantilla.", "not_found");
      if (action.body?.trim().length < 10) throw new LivingDomainError("La plantilla debe tener al menos 10 caracteres.", "validation_error");
      if (!["Activa", "Pausada"].includes(action.status)) throw new LivingDomainError("El estado de la plantilla no es válido.", "validation_error");
      Object.assign(template, { entityType: "whatsapp_template", body: action.body.trim(), status: action.status });
      addAuditEntry(data, action, resolvedContext, template);
      return { data, message: `Plantilla ${template.name} actualizada.` };
    }

    if (action.type === "advance_onboarding") {
      const building = data.superAdmin.buildings.find((item) => item.id === action.buildingId);
      if (!building) throw new LivingDomainError("No se encontró el edificio.", "not_found");
      if (building.onboardingStep >= 5) throw new LivingDomainError("El onboarding ya está completo.", "invalid_transition");
      building.entityType = "building";
      building.onboardingStep += 1;
      building.status = building.onboardingStep === 5 ? "Activo" : "Configurando";
      addAuditEntry(data, action, resolvedContext, building);
      return { data, message: `Onboarding de ${building.name}: paso ${building.onboardingStep} de 5.` };
    }

    if (action.type === "update_subscription") {
      const subscription = data.superAdmin.subscriptions.find((item) => item.id === action.subscriptionId);
      if (!subscription) throw new LivingDomainError("No se encontró la suscripción.", "not_found");
      if (!["Piloto", "Living Base", "Living Pro"].includes(action.plan) || !["trial", "active", "pending", "paused"].includes(action.status)) throw new LivingDomainError("El plan o estado de suscripción no es válido.", "validation_error");
      subscription.entityType = "subscription";
      subscription.status = action.status;
      subscription.plan = action.plan;
      addAuditEntry(data, action, resolvedContext, subscription);
      return { data, message: `Suscripción de ${subscription.building} actualizada.` };
    }

    if (action.type === "resolve_support") {
      const support = data.superAdmin.supportQueue.find((item) => item.id === action.supportId);
      if (!support) throw new LivingDomainError("No se encontró el caso de soporte.", "not_found");
      if (support.status === "resolved") throw new LivingDomainError("El caso de soporte ya está resuelto.", "invalid_transition");
      support.entityType = "support";
      support.status = "resolved";
      support.resolvedAt = now;
      addAuditEntry(data, action, resolvedContext, support);
      return { data, message: "Caso de soporte resuelto." };
    }

    if (action.type === "create_reservation") {
      const { area, resident, guestCount } = validateSchedule(data, action);
      if (action.reason?.trim().length < 5) throw new LivingDomainError("Indique el motivo de la reserva.", "validation_error");
      if (area.reservationFee + area.deposit > 0 && !action.paymentProofName) throw new LivingDomainError("Adjunte un comprobante de pago.", "missing_payment_proof");
      const sequence = String(data.reservations.length + 1).padStart(4, "0");
      const code = `RSV-${action.date.replaceAll("-", "")}-${sequence}`;
      const reservation = {
        id: code,
        entityType: "reservation",
        code,
        residentId: resident.id,
        residentName: resident.name,
        apartment: resident.apartment,
        areaId: area.id,
        areaName: area.name,
        date: action.date,
        start: action.start,
        end: action.end,
        guestCount,
        guestList: [],
        reason: action.reason.trim(),
        status: area.reservationFee + area.deposit > 0 ? "pending_approval" : "confirmed",
        paymentStatus: area.reservationFee + area.deposit > 0 ? "submitted" : "verified",
        paymentMethod: action.paymentMethod || "Transferencia",
        paymentProof: action.paymentProofName ? { name: action.paymentProofName, type: action.paymentProofType || "application/octet-stream", size: Number(action.paymentProofSize) || 0 } : null,
        depositStatus: area.deposit > 0 ? "held" : "released",
        amount: area.reservationFee + area.deposit,
        reservationFee: area.reservationFee,
        depositAmount: area.deposit,
        approvalRequired: true,
        createdAt: now,
        paymentSubmittedAt: action.paymentProofName ? now : null,
        approvedBy: null,
        approvedAt: null,
        securityResidentArrived: false,
        securityGuestsVerified: false,
        cleaningStatus: area.requiresCleaning ? "pending" : "completed",
        messages: [],
        refundStatus: "not_applicable",
        lifecycle: [],
      };
      addLifecycle(reservation, "created", "Reserva creada", resolvedContext);
      data.reservations.unshift(reservation);
      if (reservation.amount > 0) addPaymentEntry(data, reservation, "payment_submitted", reservation.amount, "submitted", resolvedContext);
      if (reservation.depositAmount > 0) addDepositEntry(data, reservation, "deposit_held", reservation.depositAmount, "held", resolvedContext);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Reserva ${code} creada.` };
    }

    if (action.type === "reschedule_reservation") {
      const reservation = findReservation(data, action.reservationId);
      if (!["pending_approval", "approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("Esta reserva ya no puede reprogramarse.", "invalid_transition");
      validateSchedule(data, { ...action, areaId: reservation.areaId, residentId: reservation.residentId, guestCount: reservation.guestCount }, reservation.id);
      const previousSchedule = `${reservation.date} ${reservation.start}-${reservation.end}`;
      Object.assign(reservation, { date: action.date, start: action.start, end: action.end });
      addLifecycle(reservation, "rescheduled", "Reserva reprogramada", resolvedContext, `Antes: ${previousSchedule}`);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Reserva ${reservation.code} reprogramada.` };
    }

    if (["cancel_reservation", "reject_reservation"].includes(action.type)) {
      const reservation = findReservation(data, action.reservationId);
      const isReject = action.type === "reject_reservation";
      if (isReject && reservation.status !== "pending_approval") throw new LivingDomainError("Solo puede rechazarse una reserva pendiente.", "invalid_transition");
      if (!isReject && ["completed", "cancelled", "rejected", "no_show"].includes(reservation.status)) throw new LivingDomainError("Esta reserva ya no puede cancelarse.", "invalid_transition");
      if (action.reason?.trim().length < 5) throw new LivingDomainError("Indique un motivo válido.", "validation_error");
      reservation.status = isReject ? "rejected" : "cancelled";
      reservation.cancellationReason = action.reason.trim();
      reservation.refundStatus = reservation.paymentStatus === "verified" && reservation.amount > 0 ? "pending" : "not_applicable";
      if (reservation.refundStatus === "pending") addPaymentEntry(data, reservation, "refund_pending", reservation.amount, "pending", resolvedContext, action.reason.trim());
      addLifecycle(reservation, reservation.status, isReject ? "Reserva rechazada" : "Reserva cancelada", resolvedContext, action.reason.trim());
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `${isReject ? "Reserva rechazada" : "Reserva cancelada"}.` };
    }

    if (action.type === "refund_payment") {
      const reservation = findReservation(data, action.reservationId);
      if (reservation.refundStatus !== "pending" || !["cancelled", "rejected"].includes(reservation.status)) throw new LivingDomainError("No existe un reembolso pendiente.", "invalid_transition");
      reservation.refundStatus = "refunded";
      reservation.refundedAt = now;
      reservation.refundedBy = context.account.name;
      addPaymentEntry(data, reservation, "refund_completed", -reservation.amount, "completed", resolvedContext, action.reference || null);
      addLifecycle(reservation, "refunded", "Reembolso completado", resolvedContext, action.reference || null);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Reembolso de ${reservation.code} completado.` };
    }

    if (action.type === "mark_no_show") {
      const reservation = findReservation(data, action.reservationId);
      if (!["approved", "confirmed"].includes(reservation.status)) throw new LivingDomainError("Solo una reserva aprobada puede marcarse como inasistencia.", "invalid_transition");
      reservation.status = "no_show";
      addLifecycle(reservation, "no_show", "Inasistencia registrada", resolvedContext);
      addAuditEntry(data, action, resolvedContext, reservation);
      return { data, message: `Inasistencia registrada para ${reservation.code}.` };
    }

    if (action.type === "create_maintenance") {
      const area = data.areas.find((item) => item.id === action.areaId);
      const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
      if (!area || area.status !== "active" || action.reason?.trim().length < 5 || !/^\d{4}-\d{2}-\d{2}$/.test(action.date || "") || !validTime(action.start) || !validTime(action.end) || action.start >= action.end) throw new LivingDomainError("Complete los datos del mantenimiento.", "validation_error");
      if (!global.livingSelectors.isSlotAvailable(data, action)) throw new LivingDomainError("El horario tiene reservas o mantenimientos activos.", "schedule_conflict");
      const block = { id: `maintenance-${action.date.replaceAll("-", "")}-${data.maintenanceBlocks.length + 1}`, entityType: "maintenance", areaId: area.id, areaName: area.name, date: action.date, start: action.start, end: action.end, reason: action.reason.trim(), status: "active", createdBy: context.account.name, createdAt: now };
      data.maintenanceBlocks.unshift(block);
      addAuditEntry(data, action, resolvedContext, block);
      return { data, message: `Mantenimiento de ${area.name} programado.` };
    }

    if (action.type === "remove_maintenance") {
      const block = data.maintenanceBlocks.find((item) => item.id === action.maintenanceId);
      if (!block) throw new LivingDomainError("No se encontró el mantenimiento.", "not_found");
      if (block.status !== "active") throw new LivingDomainError("El mantenimiento ya fue cancelado.", "invalid_transition");
      block.entityType = "maintenance";
      block.status = "cancelled";
      block.cancelledAt = now;
      addAuditEntry(data, action, resolvedContext, block);
      return { data, message: `Mantenimiento de ${block.areaName} cancelado.` };
    }

    throw new LivingDomainError("La acción no está implementada.", "unsupported_action");
  }

  global.LivingDomainError = LivingDomainError;
  global.LIVING_ACTION_PERMISSIONS = permissions;
  global.livingApplyDomainAction = applyDomainAction;
})(window);
