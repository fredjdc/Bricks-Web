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

  function availableReservationSlots(data, areaId, date) {
    const area = data.areas.find((item) => item.id === areaId);
    const policy = area ? areaPolicyOnDate(area, date) : null;
    if (!policy?.reservable || policy.status !== "active") return [];
    const opening = minutes(policy.availability.start);
    const closing = minutes(policy.availability.end);
    const block = policy.availability.blockMinutes;
    const format = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
    const slots = [];
    for (let start = opening; start + block <= closing; start += block) {
      for (let duration = block; duration <= policy.availability.maxDurationMinutes && start + duration <= closing; duration += block) {
        const candidate = { start: format(start), end: format(start + duration) };
        if (availabilityForSlot(data, { areaId, date, ...candidate }).available) slots.push(candidate);
      }
    }
    return slots;
  }

  function availableReservationDates(data, areaId, startDate, days = null) {
    const dateCount = days ?? Math.round((new Date(`${addMonths(startDate, 1)}T12:00:00Z`) - new Date(`${startDate}T12:00:00Z`)) / 86400000) + 1;
    return Array.from({ length: dateCount }, (_item, index) => addDays(startDate, index))
      .filter((date) => availableReservationSlots(data, areaId, date).length);
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

  function dateRange(endDate, days) {
    return Array.from({ length: days }, (_item, index) => addDays(endDate, index - (days - 1)));
  }

  function dayKey(value) {
    return value ? value.slice(0, 10) : "";
  }

  function daySeries(dates, map) {
    return dates.map((date) => ({ date, value: map(date) }));
  }

  function sumSeries(series) {
    return series.reduce((sum, item) => sum + item.value, 0);
  }

  function compareSeries(current, previous) {
    if (previous === 0) return current === 0 ? 0 : 100;
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
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
    dashboardInsights(data) {
      const today = DEMO_TODAY;
      const days = 14;
      const dates = dateRange(today, days);
      const monthReservations = data.reservations.filter((item) => item.date.startsWith(MONTH_PREFIX));
      const reservationsByDay = daySeries(dates, (date) => data.reservations.filter((item) => item.date === date && !["cancelled", "rejected"].includes(item.status)).length);
      const paymentsByDay = daySeries(dates, (date) => data.reservations.filter((item) => dayKey(item.paymentSubmittedAt) === date && item.paymentStatus === "submitted").length);
      const revenueByDay = daySeries(dates, (date) => data.reservations.filter((item) => dayKey(item.paymentSubmittedAt || item.createdAt) === date && item.paymentStatus === "verified").reduce((sum, item) => sum + areaFee(data, item), 0));
      const approvalRequestsByDay = daySeries(dates, (date) => data.reservations.filter((item) => dayKey(item.createdAt) === date && item.status === "pending_approval").length);
      const previousReservations = sumSeries(reservationsByDay.slice(0, 7));
      const currentReservations = sumSeries(reservationsByDay.slice(7));
      const previousRevenue = sumSeries(revenueByDay.slice(0, 7));
      const currentRevenue = sumSeries(revenueByDay.slice(7));
      const queue = [
        { label: "Aprobaciones", value: data.reservations.filter((item) => item.status === "pending_approval").length, tone: "warning" },
        { label: "Pagos por revisar", value: data.reservations.filter((item) => item.paymentStatus === "submitted").length, tone: "warning" },
        { label: "Incidentes abiertos", value: data.incidents.filter((item) => item.status !== "resolved").length, tone: "danger" },
        { label: "Tareas activas", value: data.tasks.filter((item) => item.status !== "completed").length, tone: "neutral" },
        { label: "Bloqueos activos", value: data.maintenanceBlocks.filter((item) => item.status === "active").length, tone: "neutral" },
      ];
      const queueTotal = queue.reduce((sum, item) => sum + item.value, 0) || 1;
      const topAreas = data.areas.map((area) => {
        const reservations = monthReservations.filter((item) => item.areaId === area.id);
        return {
          id: area.id,
          area: area.name,
          location: area.location,
          reservations: reservations.length,
          revenue: reservations.filter((item) => item.paymentStatus === "verified").reduce((sum, item) => sum + areaFee(data, item), 0),
          pendingApprovals: reservations.filter((item) => item.status === "pending_approval").length,
        };
      }).filter((item) => item.reservations > 0).sort((a, b) => b.reservations - a.reservations || b.revenue - a.revenue);
      const upcomingReservations = [...data.reservations]
        .filter((item) => item.date >= today && !["cancelled", "rejected"].includes(item.status))
        .sort((a, b) => `${a.date}${a.start}${a.code}`.localeCompare(`${b.date}${b.start}${b.code}`))
        .slice(0, 6);
      const criticalItems = [
        ...data.reservations.filter((item) => item.status === "pending_approval").map((item) => ({
          id: `approval:${item.id}`,
          kind: "Aprobación",
          title: item.code,
          detail: `${item.residentName} · ${item.areaName} · ${item.start}–${item.end}`,
          severity: 1,
          action: "Abrir",
          reservationId: item.id,
        })),
        ...data.reservations.filter((item) => item.paymentStatus === "submitted").map((item) => ({
          id: `payment:${item.id}`,
          kind: "Pago",
          title: item.code,
          detail: `${item.residentName} · ${item.paymentMethod || "Transferencia"} · ${window.livingFormatCurrency(item.amount)}`,
          severity: 2,
          action: "Revisar",
          reservationId: item.id,
        })),
        ...data.incidents.filter((item) => item.status !== "resolved").map((item) => ({
          id: `incident:${item.id}`,
          kind: "Incidente",
          title: item.type,
          detail: `${item.residentName} · ${item.areaName} · ${window.livingFormatShortDate(item.createdAt)}`,
          severity: 3,
          action: "Ver",
          reservationId: item.reservationId,
        })),
        ...data.tasks.filter((item) => item.status !== "completed").slice(0, 6).map((item) => ({
          id: `task:${item.id}`,
          kind: "Limpieza",
          title: item.areaName,
          detail: `${item.type} · ${item.dueTime ? window.livingFormatDateTime(item.dueTime) : "Pendiente"}`,
          severity: 4,
          action: "Abrir",
          reservationId: item.reservationId,
        })),
      ].sort((left, right) => left.severity - right.severity).slice(0, 8);
      return {
        today,
        dates,
        reservationsByDay,
        paymentsByDay,
        revenueByDay,
        approvalRequestsByDay,
        topAreas,
        upcomingReservations,
        criticalItems,
        queue: queue.map((item) => ({ ...item, share: item.value / queueTotal })),
        summary: {
          currentReservations,
          previousReservations,
          currentRevenue,
          previousRevenue,
          reservationsDelta: compareSeries(currentReservations, previousReservations),
          revenueDelta: compareSeries(currentRevenue, previousRevenue),
          pendingApprovals: queue[0].value,
          pendingPayments: queue[1].value,
          activeIncidents: queue[2].value,
          activeTasks: queue[3].value,
        },
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
    recentApprovals(data, limit = 8) {
      return data.reservations
        .filter((item) => item.approvedAt)
        .sort((a, b) => b.approvedAt.localeCompare(a.approvedAt))
        .slice(0, limit);
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
    availableReservationSlots,
    availableReservationDates,
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
