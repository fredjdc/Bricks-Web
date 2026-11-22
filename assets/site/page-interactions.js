if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      target.classList.add("in");
      observer.unobserve(target);
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  for (const element of document.querySelectorAll("#root .reveal")) {
    if (element.getBoundingClientRect().top < innerHeight) {
      element.classList.add("in");
    } else {
      element.setAttribute("data-reveal-ready", "");
      observer.observe(element);
    }
  }
}

document.addEventListener("click", event => {
  const control = event.target.closest("[data-analytics-label]");
  if (control && typeof window.gtag === "function") {
    const { analyticsEvent = "click", analyticsLabel } = control.dataset;
    window.gtag("event", analyticsEvent, { event_category: "engagement", event_label: analyticsLabel });
  }
});
