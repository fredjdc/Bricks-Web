(function registerLivingServices(global) {
  global.createLivingMockService = function createLivingMockService(options = {}) {
    const minimumDelay = options.minimumDelay ?? 300;
    const maximumDelay = options.maximumDelay ?? 700;
    let nextFailure = null;

    function wait() {
      const duration = minimumDelay + Math.round(Math.random() * (maximumDelay - minimumDelay));
      return new Promise((resolve) => global.setTimeout(resolve, duration));
    }

    return {
      async execute(dataProvider, action, context) {
        await wait();
        if (nextFailure) {
          const message = nextFailure;
          nextFailure = null;
          throw new Error(message);
        }
        const data = typeof dataProvider === "function" ? dataProvider() : dataProvider;
        return global.livingApplyDomainAction(data, action, context);
      },
      failNext(message = "No se pudo completar la acción. Intente nuevamente.") {
        nextFailure = message;
      },
    };
  };
})(window);
