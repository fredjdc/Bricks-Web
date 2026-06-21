(function registerLivingRepositories(global) {
  global.createLivingRepository = function createLivingRepository({ getData, getContext, service }) {
    let queue = Promise.resolve();
    let revision = 0;
    let workingData = null;
    return {
      execute(command) {
        const commandRevision = revision;
        const context = getContext(command);
        const operation = queue.then(async () => {
          const current = commandRevision === revision && workingData ? workingData : getData();
          global.assertLivingData(current);
          const result = await service.execute(() => current, command, context);
          global.assertLivingData(result.data);
          if (commandRevision === revision) workingData = result.data;
          return result;
        });
        queue = operation.catch(() => undefined);
        return operation;
      },
      invalidate() {
        revision += 1;
        workingData = null;
      },
      snapshot() {
        return getData();
      },
      select(selector, ...args) {
        return selector(getData(), ...args);
      },
    };
  };
})(window);
