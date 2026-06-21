(function registerLivingSelectors(global) {
  const DEMO_TODAY = "2026-07-18";
  const MONTH_PREFIX = "2026-07";

  function areaFee(data, reservation) {
    return Number(reservation.reservationFee) || 0;
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
    audit(data, role) {
      const entries = data.auditLog || [];
      return role === "junta" ? entries.map(({ id, label, entityType, createdAt }) => ({ id, label, entityType, createdAt })) : entries;
    },
  };

  global.livingGetKpis = global.livingSelectors.dashboard;
})(window);
