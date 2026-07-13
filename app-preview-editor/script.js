const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.documentElement.classList.add("js");
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const workflowImage = document.querySelector(".workflow-media img");
const workflowSteps = document.querySelectorAll("[data-workflow-image]");

if (workflowImage && workflowSteps.length && "IntersectionObserver" in window) {
  const workflowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      workflowSteps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
      const nextSource = entry.target.dataset.workflowImage;
      if (workflowImage.getAttribute("src") !== nextSource) workflowImage.setAttribute("src", nextSource);
    });
  }, { rootMargin: "-35% 0px -45%", threshold: 0 });

  workflowSteps.forEach((step) => workflowObserver.observe(step));
  workflowSteps[0].classList.add("is-active");
}

const heroParallax = document.querySelector(".hero-parallax");

if (heroParallax && !reduceMotion) {
  let pointerFrame;

  window.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      heroParallax.style.setProperty("--hero-background-x", `${x * -14}px`);
      heroParallax.style.setProperty("--hero-background-y", `${y * -14}px`);
      heroParallax.style.setProperty("--hero-foreground-x", `${x * 18}px`);
      heroParallax.style.setProperty("--hero-foreground-y", `${y * 18}px`);
    });
  });
}

const heroSlides = document.querySelectorAll(".hero-slide");

if (heroSlides.length > 1 && !reduceMotion) {
  let activeSlide = 0;

  window.setInterval(() => {
    heroSlides[activeSlide].classList.remove("is-active");
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides[activeSlide].classList.add("is-active");
  }, 3600);
}

document.querySelectorAll("[data-signup-form]").forEach((form) => {
  const frame = document.querySelector(`iframe[name="${form.target}"]`);
  const button = form.querySelector("button[type='submit']");
  const buttonLabel = button.querySelector("span");
  const betaAccess = form.querySelector("[name='beta_access']");
  const status = form.querySelector(".form-status");
  let submitting = false;
  let timeout;

  const updateButtonLabel = () => {
    if (!button.disabled) buttonLabel.textContent = betaAccess.checked ? "Invite Me" : "Notify Me";
  };

  betaAccess.addEventListener("change", updateButtonLabel);

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    submitting = true;
    button.disabled = true;
    buttonLabel.textContent = "Sending…";
    status.textContent = "Submitting your request…";
    status.dataset.state = "";

    timeout = window.setTimeout(() => {
      if (!submitting) return;
      submitting = false;
      button.disabled = false;
      buttonLabel.textContent = "Try again";
      status.textContent = "We couldn’t confirm the submission. Check your connection and try again.";
      status.dataset.state = "error";
    }, 15000);
  });

  frame.addEventListener("load", () => {
    if (!submitting) return;
    window.clearTimeout(timeout);
    submitting = false;
    form.reset();
    button.disabled = false;
    updateButtonLabel();
    status.textContent = "Thanks. Your request has been received.";
    status.dataset.state = "success";
  });
});
