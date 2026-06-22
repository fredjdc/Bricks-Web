(function registerLivingSelectors(global) {
  const DEMO_TODAY = global.LIVING_DEMO_TODAY;
  const MONTH_PREFIX = "2026-07";

  function areaFee(data, reservation) {
    return Number(reservation.reservationFee) || 0;
  }

  function overlaps(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
  }

  function minutes(value) {
    const [hours, minute] = value.split(":").map(Number);
    return (hours * 60) + minute;
  }

  function areaPolicyOnDate(area, date) {
    return [...(area.policyVersions || [])]
      .filter((policy) => policy.effectiveFrom <= date)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || b.version - a.version)[0] || null;
  }

  function paymentMethodsForPolicy(policy) {
    const groups = [];
    if (policy.payment.enabled) groups.push(policy.payment.methods);
    if (policy.guarantee.enabled) groups.push(policy.guarantee.methods);
    if (!groups.length) return [];
    return groups[0].filter((method) => groups.every((methods) => methods.includes(method)));
  }

  function parseDate(date) {
    return new Date(`${date}T12:00:00Z`);
  }

  function formatISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(date, amount) {
    const value = parseDate(date);
    value.setUTCDate(value.getUTCDate() + amount);
    return formatISODate(value);
  }

  function startOfWeek(date) {
    const value = parseDate(date);
    const offset = (value.getUTCDay() + 6) % 7;
    value.setUTCDate(value.getUTCDate() - offset);
    return formatISODate(value);
  }

  function addMonths(date, amount) {
    const value = parseDate(date);
    const day = value.getUTCDate();
    value.setUTCDate(1);
    value.setUTCMonth(value.getUTCMonth() + amount);
    const lastDay = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
    value.setUTCDate(Math.min(day, lastDay));
    return formatISODate(value);
  }

  function monthGrid(date) {
    const monthStart = `${date.slice(0, 7)}-01`;
    const gridStart = startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_item, index) => addDays(gridStart, index));
  }

  function calendarEntries(data) {
    const reservations = data.reservations
      .filter((item) => !["cancelled", "rejected"].includes(item.status))
      .map((item) => ({ id: item.id, type: "reservation", date: item.date, start: item.start, end: item.end, areaName: item.areaName, title: `${item.areaName} · ${item.residentName}`, status: item.status, reservationId: item.id }));
    const maintenance = data.maintenanceBlocks
      .filter((item) => item.status === "active")
      .map((item) => ({ id: item.id, type: "maintenance", date: item.date, start: item.start, end: item.end, areaName: item.areaName, title: `${item.areaName} · Mantenimiento`, status: item.status }));
    const closures = (data.areaClosures || [])
      .filter((item) => item.status === "active")
      .map((item) => ({ id: item.id, type: "closure", date: item.date, start: item.start, end: item.end, areaName: item.areaName, title: `${item.areaName} · Cierre`, status: item.status }));
    return [...reservations, ...maintenance, ...closures].sort((a, b) => `${a.date}${a.start}${a.title}`.localeCompare(`${b.date}${b.start}${b.title}`));
  }

  function availabilityForSlot(data, { areaId, date, start, end, excludeReservationId = null }) {
    const area = data.areas.find((item) => item.id === areaId);
    if (!area) return { available: false, reason: "No se encontró el área." };
    const policy = areaPolicyOnDate(area, date);
    if (!policy || (policy.status || area.status) !== "active") return { available: false, reason: policy?.closureReason || "El área está cerrada." };
    if (!policy.reservable) return { available: false, reason: "El área no admite reservas." };
    const availability = policy.availability;
    const dateValue = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(dateValue.getTime())) return { available: false, reason: "La fecha no es válida." };
    if (!availability.months.includes(dateValue.getUTCMonth() + 1) || !availability.weekdays.includes(dateValue.getUTCDay())) return { available: false, reason: "El área no opera ese día." };
    const startMinutes = minutes(start);
    const endMinutes = minutes(end);
    const openingMinutes = minutes(availability.start);
    const duration = endMinutes - startMinutes;
    if (start < availability.start || end > availability.end) return { available: false, reason: `El horario disponible es ${availability.start}–${availability.end}.` };
    if (duration <= 0 || duration > availability.maxDurationMinutes) return { available: false, reason: `La duración máxima es ${availability.maxDurationMinutes / 60} horas.` };
    if ((startMinutes - openingMinutes) % availability.blockMinutes !== 0 || duration % availability.blockMinutes !== 0) return { available: false, reason: `Reserve en bloques de ${availability.blockMinutes / 60} hora(s).` };
    const reservationConflict = data.reservations.some((item) => item.id !== excludeReservationId && item.areaId === areaId && item.date === date && !["cancelled", "rejected", "no_show"].includes(item.status) && overlaps(start, end, item.start, item.end));
    if (reservationConflict) return { available: false, reason: "El horario se cruza con otra reserva." };
    const maintenanceConflict = data.maintenanceBlocks.some((item) => item.areaId === areaId && item.date === date && item.status === "active" && overlaps(start, end, item.start, item.end));
    if (maintenanceConflict) return { available: false, reason: "El área está en mantenimiento durante ese horario." };
    const closureConflict = (data.areaClosures || []).some((item) => item.areaId === areaId && item.date === date && item.status === "active" && overlaps(start, end, item.start, item.end));
    if (closureConflict) return { available: false, reason: "El área tiene un cierre administrativo durante ese horario." };
    return { available: true, reason: null, policy };
  }

  global.livingSelectors = {
    dashboard(data) {
      const monthReservations = data.reservations.filter((item) => item.date.startsWith(MONTH_PREFIX));
      return {
        pendingApprovals: data.reservations.filter((item) => item.status === "pending_approval").length,
        pendingPayments: data.reservations.filter((item) => item.paymentStatus === "submitted").length,
        residentValidations: data.residents.filter((item) => item.status === "blocked").length,
        todayReservations: data.reservations.filter((item) => item.date === DEMO_TODAY && ["approved", "confirmed", "completed"].includes(item.status)).length,
        upcomingReservations: data.reservations.filter((item) => item.date >= DEMO_TODAY && !["cancelled", "rejected"].includes(item.status)).length,
        revenueThisMonth: monthReservations.filter((item) => item.paymentStatus === "verified").reduce((sum, item) => sum + areaFee(data, item), 0),
        depositsHeld: data.reservations.filter((item) => item.depositStatus === "held").reduce((sum, item) => sum + (Number(item.depositAmount) || 0), 0),
        incidents: data.incidents.filter((item) => item.status !== "resolved").length,
        failedWhatsapp: data.messages.filter((item) => item.status === "failed").length,
      };
    },
    report(data) {
      const reservations = data.reservations.filter((item) => item.date.startsWith(MONTH_PREFIX) && !["cancelled", "rejected"].includes(item.status));
      const reservationsByArea = data.areas.map((area) => ({ area: area.name, total: reservations.filter((item) => item.areaId === area.id).length })).filter((item) => item.total > 0);
      const revenueByArea = data.areas.map((area) => ({
        area: area.name,
        total: reservations.filter((item) => item.areaId === area.id).reduce((sum, item) => sum + areaFee(data, item), 0),
      })).filter((item) => item.total > 0);
      return {
        month: "Julio 2026",
        reservationsByArea,
        revenueByArea,
        totalReservations: reservations.length,
        totalRevenue: revenueByArea.reduce((sum, item) => sum + item.total, 0),
        totalIncidents: data.incidents.filter((item) => item.createdAt?.startsWith(MONTH_PREFIX)).length,
        topAreas: [...reservationsByArea].sort((a, b) => b.total - a.total).slice(0, 3).map((item) => item.area),
        satisfaction: data.report.satisfaction,
      };
    },
    payments(data) {
      return data.reservations.filter((item) => ["submitted", "verified", "rejected"].includes(item.paymentStatus));
    },
    deposits(data) {
      return data.reservations.filter((item) => (Number(item.depositAmount) || 0) > 0);
    },
    paymentLedger(data) {
      return [...data.paymentLedger].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    depositLedger(data) {
      return [...data.depositLedger].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    areaPolicyOnDate,
    paymentMethodsForPolicy,
    addDays,
    startOfWeek,
    addMonths,
    monthGrid,
    calendarEntries,
    availabilityForSlot,
    isSlotAvailable(data, { areaId, date, start, end, excludeReservationId = null }) {
      return availabilityForSlot(data, { areaId, date, start, end, excludeReservationId }).available;
    },
    audit(data, role) {
      const entries = data.auditLog || [];
      return role === "junta" ? entries.map(({ id, label, entityType, createdAt }) => ({ id, label, entityType, createdAt })) : entries;
    },
  };

  global.livingGetKpis = global.livingSelectors.dashboard;
})(window);
