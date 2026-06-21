(function registerLivingApiContracts(global) {
  const contracts = {
    create_reservation: { method: "POST", path: "/v1/buildings/{buildingId}/reservations" },
    approve_reservation: { method: "POST", path: "/v1/reservations/{reservationId}/approval" },
    reject_reservation: { method: "POST", path: "/v1/reservations/{reservationId}/rejection" },
    reschedule_reservation: { method: "PATCH", path: "/v1/reservations/{reservationId}/schedule" },
    cancel_reservation: { method: "POST", path: "/v1/reservations/{reservationId}/cancellation" },
    mark_no_show: { method: "POST", path: "/v1/reservations/{reservationId}/no-show" },
    verify_payment: { method: "POST", path: "/v1/reservations/{reservationId}/payments/verification" },
    reject_payment: { method: "POST", path: "/v1/reservations/{reservationId}/payments/rejection" },
    refund_payment: { method: "POST", path: "/v1/reservations/{reservationId}/refunds" },
    release_deposit: { method: "POST", path: "/v1/reservations/{reservationId}/deposit/release" },
    retain_deposit: { method: "POST", path: "/v1/reservations/{reservationId}/deposit/retention" },
    mark_arrival: { method: "POST", path: "/v1/reservations/{reservationId}/security/arrival" },
    verify_guests: { method: "POST", path: "/v1/reservations/{reservationId}/security/guest-verification" },
    complete_task: { method: "POST", path: "/v1/tasks/{taskId}/completion" },
    create_incident: { method: "POST", path: "/v1/buildings/{buildingId}/incidents" },
    resolve_incident: { method: "POST", path: "/v1/incidents/{incidentId}/resolution" },
    create_maintenance: { method: "POST", path: "/v1/buildings/{buildingId}/maintenance-blocks" },
    remove_maintenance: { method: "DELETE", path: "/v1/maintenance-blocks/{maintenanceId}" },
    update_resident: { method: "PATCH", path: "/v1/residents/{residentId}" },
    update_area: { method: "PATCH", path: "/v1/areas/{areaId}" },
    update_template: { method: "PATCH", path: "/v1/whatsapp/templates/{templateId}" },
    advance_onboarding: { method: "POST", path: "/v1/buildings/{buildingId}/onboarding/advance" },
    update_subscription: { method: "PATCH", path: "/v1/subscriptions/{subscriptionId}" },
    resolve_support: { method: "POST", path: "/v1/support/{supportId}/resolution" },
  };

  global.LIVING_API_CONTRACTS = contracts;
  global.livingBuildApiRequest = function livingBuildApiRequest(command, options = {}) {
    const contract = contracts[command.type];
    if (!contract) throw new Error(`No existe contrato API para ${command.type}.`);
    const params = { buildingId: options.buildingId || "building-torres", ...command };
    const path = contract.path.replace(/\{(\w+)\}/g, (_match, key) => {
      if (!params[key]) throw new Error(`Falta el parámetro ${key}.`);
      return encodeURIComponent(params[key]);
    });
    const routeKeys = new Set(["type", "buildingId", "reservationId", "taskId", "incidentId", "maintenanceId", "residentId", "areaId", "templateId", "subscriptionId", "supportId"]);
    const body = Object.fromEntries(Object.entries(command).filter(([key]) => !routeKeys.has(key)));
    return { method: contract.method, path, body: contract.method === "DELETE" ? undefined : body };
  };
})(window);
