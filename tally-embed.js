(() => {
  const states = new WeakMap();
  let widgetPromise;
  const widget = () => {
    if (window.Tally) return Promise.resolve();
    if (widgetPromise) return widgetPromise;
    widgetPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://tally.so/widgets/embed.js";
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        widgetPromise = undefined;
        reject(new Error("Tally widget could not load"));
      };
      document.head.append(script);
    });
    return widgetPromise;
  };

  const mount = () => document.querySelectorAll("[data-tally-form]").forEach(container => {
    if (states.has(container)) return;
    const frame = container.querySelector("iframe");
    const status = container.querySelector(".tally-status");
    const retry = container.querySelector(".tally-retry");
    const details = container.closest("details");
    const state = { frame, status, retry, timer: null, started: false, ready: false };
    states.set(container, state);
    const slow = () => {
      if (state.ready || !container.isConnected) return;
      status.textContent = container.dataset.slow;
      status.hidden = false;
      retry.hidden = false;
    };
    const start = (reload = false) => {
      state.started = true;
      state.ready = false;
      status.textContent = container.dataset.loading;
      status.hidden = false;
      retry.hidden = true;
      clearTimeout(state.timer);
      state.timer = setTimeout(slow, 15000);
      frame.dataset.tallySrc = frame.dataset.embedUrl;
      if (reload) frame.src = frame.dataset.embedUrl;
      widget().then(() => window.Tally.loadEmbeds()).catch(() => {
        // The native iframe can still work if the height/lazy-loading helper is blocked.
        if (!frame.getAttribute("src")) frame.src = frame.dataset.embedUrl;
        slow();
      });
    };
    retry.addEventListener("click", () => start(true));
    if (details) details.addEventListener("toggle", () => {
      if (details.open && !state.started) start();
    });
    if (!details || details.open) start();
  });

  // Only the matching Tally iframe can dismiss loading; this never marks a submission successful.
  window.addEventListener("message", event => {
    if (event.origin !== "https://tally.so") return;
    let message;
    try { message = typeof event.data === "string" ? JSON.parse(event.data) : event.data; }
    catch { return; }
    if (message?.event !== "Tally.FormLoaded") return;
    document.querySelectorAll("[data-tally-form]").forEach(container => {
      const state = states.get(container);
      if (!state || event.source !== state.frame.contentWindow || message.payload?.formId !== container.dataset.tallyForm) return;
      state.ready = true;
      clearTimeout(state.timer);
      state.status.hidden = true;
      state.retry.hidden = true;
    });
  });
  window.addEventListener("tally:mount", mount);
  mount();
})();
