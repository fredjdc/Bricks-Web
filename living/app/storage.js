(function registerLivingStorage(global) {
  const STORAGE_KEY = "bricks-living-demo-state";
  const SCHEMA_VERSION = 3;

  function isValidData(data) {
    return global.validateLivingData(data).valid;
  }

  function migrate(envelope) {
    if (![1, 2].includes(envelope.version) || !envelope.data) return null;
    const seed = global.buildLivingDemoData();
    const data = JSON.parse(JSON.stringify(envelope.data));
    data.auditLog = Array.isArray(data.auditLog) ? data.auditLog : [];
    data.report = data.report || seed.report;
    data.reservations = (data.reservations || []).map((reservation) => {
      const seedReservation = seed.reservations.find((item) => item.id === reservation.id);
      const area = seed.areas.find((item) => item.id === reservation.areaId);
      return {
        ...reservation,
        reservationFee: reservation.reservationFee ?? seedReservation?.reservationFee ?? area?.reservationFee ?? 0,
        depositAmount: reservation.depositAmount ?? seedReservation?.depositAmount ?? area?.deposit ?? 0,
        paymentMethod: reservation.paymentMethod ?? seedReservation?.paymentMethod ?? "Transferencia",
        paymentProof: reservation.paymentProof ?? seedReservation?.paymentProof ?? null,
      };
    });
    data.incidents = (data.incidents || []).map((incident) => ({
      ...incident,
      createdAt: incident.createdAt || seed.incidents.find((item) => item.id === incident.id)?.createdAt || "2026-07-01T12:00:00-05:00",
    }));
    const previousSuperAdmin = data.superAdmin || {};
    data.superAdmin = {
      ...seed.superAdmin,
      ...previousSuperAdmin,
      buildings: (previousSuperAdmin.buildings || seed.superAdmin.buildings).map((building) => ({ ...seed.superAdmin.buildings.find((item) => item.name === building.name), ...building })),
      templates: (previousSuperAdmin.templates || seed.superAdmin.templates).map((template) => ({ ...seed.superAdmin.templates.find((item) => item.name === template.name), ...template })),
      supportQueue: (previousSuperAdmin.supportQueue || seed.superAdmin.supportQueue).map((support) => ({ ...seed.superAdmin.supportQueue.find((item) => item.issue === support.issue), ...support })),
      subscriptions: previousSuperAdmin.subscriptions || seed.superAdmin.subscriptions,
    };
    return isValidData(data) ? data : null;
  }

  function load(storage = global.localStorage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      if (envelope.version === SCHEMA_VERSION) return isValidData(envelope.data) ? envelope.data : null;
      const migrated = migrate(envelope);
      if (migrated) save(migrated, storage);
      return migrated;
    } catch (_error) {
      return null;
    }
  }

  function save(data, storage = global.localStorage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), data }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function reset(storage = global.localStorage) {
    storage.removeItem(STORAGE_KEY);
  }

  global.LIVING_STORAGE_KEY = STORAGE_KEY;
  global.LIVING_STORAGE_VERSION = SCHEMA_VERSION;
  global.loadLivingDemoState = load;
  global.saveLivingDemoState = save;
  global.resetLivingDemoState = reset;
})(window);
