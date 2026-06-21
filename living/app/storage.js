(function registerLivingStorage(global) {
  const STORAGE_KEY = "bricks-living-demo-state";
  const SCHEMA_VERSION = 1;

  function isValidData(data) {
    return data && Array.isArray(data.reservations) && Array.isArray(data.tasks) && data.building;
  }

  function load(storage = global.localStorage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      return envelope.version === SCHEMA_VERSION && isValidData(envelope.data) ? envelope.data : null;
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
