(() => {
  const root = document.documentElement;
  const themeControls = document.querySelector("[data-site-theme]");
  const themeButtons = themeControls?.querySelectorAll("[data-theme-choice]") ?? [];
  if (themeControls) themeControls.hidden = false;

  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  let theme = "auto";
  try {
    const stored = localStorage.getItem("bricksAppearance");
    if (stored === "light" || stored === "dark") theme = stored;
  } catch {
    // The system theme still works with storage disabled.
  }
  const applyTheme = () => {
    root.dataset.theme = theme === "auto" ? (dark.matches ? "dark" : "light") : theme;
    for (const button of themeButtons) {
      button.setAttribute("aria-pressed", button.dataset.themeChoice === theme);
    }
    window.dispatchEvent(new Event("bricks:theme"));
  };
  applyTheme();
  dark.addEventListener("change", applyTheme);
  for (const button of themeButtons) {
    button.addEventListener("click", () => {
      theme = button.dataset.themeChoice;
      applyTheme();
      try { localStorage.setItem("bricksAppearance", theme); } catch { /* Current page still updates. */ }
    });
  }

  const alternate = document.querySelector("[data-site-language]");
  if (!alternate) return;

  const url = new URL(window.location.href);
  const requested = url.searchParams.get("lang");
  const destination = new URL(alternate.href);
  destination.search = url.search;
  destination.searchParams.delete("lang");
  destination.hash = url.hash;
  alternate.href = destination.href;
  if (requested === alternate.dataset.siteLanguage) window.location.replace(destination);
})();
