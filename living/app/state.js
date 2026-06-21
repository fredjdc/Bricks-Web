window.livingParseHash = function livingParseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return { area: "landing", page: "landing" };
  const [area, page, id] = raw.split("/");
  return { area, page, id };
};

window.livingSetHash = function livingSetHash(next) {
  window.location.hash = next;
};

window.defaultLivingPageForRole = function defaultLivingPageForRole(role) {
  if (role === "super_admin") return "superadmin";
  if (role === "security") return "security";
  if (role === "cleaning") return "cleaning";
  if (role === "junta") return "reports";
  return "dashboard";
};

window.pageAllowedForLivingRole = function pageAllowedForLivingRole(role, page) {
  if (page === "reservation") return ["building_admin", "assistant_admin", "security", "cleaning"].includes(role);
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

window.livingActionKey = function livingActionKey(action) {
  return `${action.type}:${action.reservationId || action.taskId}`;
};

window.createLivingActions = function createLivingActions({ getData, getRole, getAccount, service, setData, setPending, setFeedback }) {
  async function run(action) {
    const key = window.livingActionKey(action);
    setPending((current) => ({ ...current, [key]: true }));
    try {
      const result = await service.execute(getData, action, {
        role: getRole(),
        account: getAccount(),
        now: "2026-07-12T09:43:00-05:00",
      });
      setData(result.data);
      setFeedback({ tone: "success", message: result.message });
      return result;
    } catch (error) {
      setFeedback({ tone: "danger", message: error.message || "No se pudo completar la acción." });
      return null;
    } finally {
      setPending((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  return {
    approveReservation: (reservationId) => run({ type: "approve_reservation", reservationId }),
    markArrival: (reservationId) => run({ type: "mark_arrival", reservationId }),
    verifyGuests: (reservationId) => run({ type: "verify_guests", reservationId }),
    completeTask: (taskId) => run({ type: "complete_task", taskId }),
  };
};
