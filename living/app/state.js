window.livingParseHash = function livingParseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return { area: "landing", page: "landing" };
  const [area, page, id] = raw.split("/");
  return { area, page, id };
};

window.livingSetHash = function livingSetHash(next) {
  window.location.hash = next;
};

window.loadLivingSessionRole = function loadLivingSessionRole() {
  const role = window.sessionStorage.getItem("bricks-living-role");
  return window.LIVING_DEMO_ACCOUNTS.some((item) => item.role === role) ? role : "building_admin";
};

window.saveLivingSession = function saveLivingSession(role) {
  window.sessionStorage.setItem("bricks-living-authenticated", "true");
  window.sessionStorage.setItem("bricks-living-role", role);
};

window.clearLivingSession = function clearLivingSession() {
  window.sessionStorage.removeItem("bricks-living-authenticated");
  window.sessionStorage.removeItem("bricks-living-role");
};

window.defaultLivingPageForRole = function defaultLivingPageForRole(role) {
  if (role === "super_admin") return "superadmin";
  if (role === "security") return "security";
  if (role === "cleaning") return "cleaning";
  if (role === "junta") return "reports";
  return "dashboard";
};

window.pageAllowedForLivingRole = function pageAllowedForLivingRole(role, page) {
  if (page === "reservation") return ["building_admin", "assistant_admin"].includes(role);
  return window.LIVING_NAV_ITEMS.some((item) => item.id === page && item.roles.includes(role));
};

window.livingGetKpis = function livingGetKpis(data) {
  return window.livingSelectors.dashboard(data);
};

window.livingStatusTone = function livingStatusTone(status) {
  if (["approved", "confirmed", "completed", "verified", "released", "resolved", "active"].includes(status)) return "success";
  if (["pending", "pending_approval", "pending_payment", "pending_resolution", "submitted", "held", "in_progress"].includes(status)) return "warning";
  if (["rejected", "failed", "retained", "blocked", "cancelled", "open"].includes(status)) return "danger";
  return "neutral";
};

window.livingActionKey = function livingActionKey(action) {
  const entityId = action.reservationId || action.taskId || action.incidentId || action.residentId || action.areaId || action.templateId || action.buildingId || action.subscriptionId || action.supportId || "new";
  return `${action.type}:${entityId}`;
};

window.livingDemoActionTime = function livingDemoActionTime(action, data) {
  if (action.type === "complete_task") {
    const task = data.tasks.find((item) => item.id === action.taskId);
    return task ? new Date(new Date(task.dueTime).getTime() + 15 * 60 * 1000).toISOString() : "2026-07-18T23:30:00-05:00";
  }
  if (["mark_arrival", "verify_guests"].includes(action.type)) return "2026-07-18T17:05:00-05:00";
  if (["create_incident", "resolve_incident", "release_deposit", "retain_deposit"].includes(action.type)) return "2026-07-18T23:40:00-05:00";
  return "2026-07-12T09:43:00-05:00";
};

window.createLivingActions = function createLivingActions({ repository, getCommandGeneration, setData, setPending, setFeedback }) {
  async function run(action) {
    const key = window.livingActionKey(action);
    const generation = getCommandGeneration();
    setPending((current) => ({ ...current, [key]: true }));
    try {
      const result = await repository.execute(action);
      if (generation !== getCommandGeneration()) return null;
      setData(result.data);
      setFeedback({ tone: "success", message: result.message });
      return result;
    } catch (error) {
      if (generation !== getCommandGeneration()) return null;
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
    verifyPayment: (reservationId) => run({ type: "verify_payment", reservationId }),
    rejectPayment: (reservationId, reason) => run({ type: "reject_payment", reservationId, reason }),
    releaseDeposit: (reservationId) => run({ type: "release_deposit", reservationId }),
    retainDeposit: (reservationId, amount, reason) => run({ type: "retain_deposit", reservationId, amount, reason }),
    createIncident: (values) => run({ type: "create_incident", ...values }),
    resolveIncident: (incidentId, resolution) => run({ type: "resolve_incident", incidentId, resolution }),
    updateResident: (residentId, values) => run({ type: "update_resident", residentId, ...values }),
    updateArea: (areaId, values) => run({ type: "update_area", areaId, ...values }),
    updateTemplate: (templateId, values) => run({ type: "update_template", templateId, ...values }),
    advanceOnboarding: (buildingId) => run({ type: "advance_onboarding", buildingId }),
    updateSubscription: (subscriptionId, values) => run({ type: "update_subscription", subscriptionId, ...values }),
    resolveSupport: (supportId) => run({ type: "resolve_support", supportId }),
  };
};
