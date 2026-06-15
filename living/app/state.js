window.livingParseHash = function livingParseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return { area: "landing", page: "landing" };
  const [area, page, id] = raw.split("/");
  return { area, page, id };
};

window.livingSetHash = function livingSetHash(next) {
  window.location.hash = next;
};

window.cloneLivingData = function cloneLivingData(data) {
  return JSON.parse(JSON.stringify(data));
};

window.defaultLivingPageForRole = function defaultLivingPageForRole(role) {
  switch (role) {
    case "super_admin":
      return "superadmin";
    case "security":
      return "security";
    case "cleaning":
      return "cleaning";
    case "junta":
      return "reports";
    default:
      return "dashboard";
  }
};

window.pageAllowedForLivingRole = function pageAllowedForLivingRole(role, page) {
  if (page === "reservation") {
    return ["building_admin", "assistant_admin", "security", "cleaning"].includes(role);
  }
  return window.LIVING_NAV_ITEMS.some((item) => item.id === page && item.roles.includes(role));
};

window.livingGetKpis = function livingGetKpis(data) {
  return {
    pendingApprovals: data.reservations.filter((item) => item.status === "pending_approval").length,
    pendingPayments: data.reservations.filter((item) => item.paymentStatus === "submitted").length,
    residentValidations: 4,
    todayReservations: 8,
    upcomingReservations: 24,
    revenueThisMonth: 4820,
    depositsHeld: 2700,
    incidents: data.incidents.filter((item) => item.status !== "resolved").length,
    failedWhatsapp: data.messages.filter((item) => item.status === "failed").length,
  };
};

window.livingStatusTone = function livingStatusTone(status) {
  if (["approved", "confirmed", "completed", "verified", "released", "resolved", "active"].includes(status)) return "success";
  if (["pending", "pending_approval", "pending_payment", "pending_resolution", "submitted", "held", "in_progress"].includes(status)) return "warning";
  if (["rejected", "failed", "retained", "blocked", "cancelled", "open"].includes(status)) return "danger";
  return "neutral";
};

window.createLivingActions = function createLivingActions(setData) {
  function updateReservation(reservationId, updater) {
    setData((previous) => {
      const next = window.cloneLivingData(previous);
      next.reservations = next.reservations.map((reservation) => reservation.id === reservationId ? updater(reservation) : reservation);
      return next;
    });
  }

  function completeTask(taskId) {
    setData((previous) => {
      const next = window.cloneLivingData(previous);
      next.tasks = next.tasks.map((task) => task.id === taskId ? { ...task, status: "completed", completedItems: [...task.checklist] } : task);
      const updatedReservationIds = next.tasks.filter((task) => task.status === "completed").map((task) => task.reservationId);
      next.reservations = next.reservations.map((reservation) => (
        updatedReservationIds.includes(reservation.id)
          ? {
              ...reservation,
              cleaningStatus: next.tasks.filter((task) => task.reservationId === reservation.id).every((task) => task.status === "completed")
                ? "completed"
                : reservation.cleaningStatus,
            }
          : reservation
      ));
      return next;
    });
  }

  function approveReservation(reservationId) {
    updateReservation(reservationId, (reservation) => ({
      ...reservation,
      status: "approved",
      approvedBy: "María Fernanda Rojas",
      approvedAt: "2026-07-12T09:43:00-05:00",
    }));
  }

  function markArrival(reservationId) {
    updateReservation(reservationId, (reservation) => ({
      ...reservation,
      securityResidentArrived: true,
    }));
  }

  function verifyGuests(reservationId) {
    updateReservation(reservationId, (reservation) => ({
      ...reservation,
      securityGuestsVerified: true,
    }));
  }

  return {
    approveReservation,
    completeTask,
    markArrival,
    verifyGuests,
  };
};
