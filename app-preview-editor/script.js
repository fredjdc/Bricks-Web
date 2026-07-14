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

if (heroParallax && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  let pointerFrame;

  heroParallax.addEventListener("pointermove", (event) => {
    const bounds = heroParallax.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      heroParallax.style.setProperty("--hero-workspace-x", `${x * -8}px`);
      heroParallax.style.setProperty("--hero-workspace-y", `${y * -8}px`);
      heroParallax.style.setProperty("--hero-result-x", `${x * 4}px`);
      heroParallax.style.setProperty("--hero-result-y", `${y * 4}px`);
    });
  });

  heroParallax.addEventListener("pointerleave", () => {
    heroParallax.style.removeProperty("--hero-workspace-x");
    heroParallax.style.removeProperty("--hero-workspace-y");
    heroParallax.style.removeProperty("--hero-result-x");
    heroParallax.style.removeProperty("--hero-result-y");
  });
}

const heroVideo = document.querySelector(".hero-result-video");
const heroVideoToggle = document.querySelector(".hero-video-toggle");

if (heroVideo && heroVideoToggle) {
  const updateHeroVideoToggle = () => {
    const action = heroVideo.paused ? "Play" : "Pause";
    heroVideoToggle.textContent = `${action} preview`;
    heroVideoToggle.setAttribute("aria-label", `${action} App Preview`);
  };

  heroVideo.addEventListener("play", updateHeroVideoToggle);
  heroVideo.addEventListener("pause", updateHeroVideoToggle);
  heroVideoToggle.addEventListener("click", () => {
    if (heroVideo.paused) heroVideo.play().catch(updateHeroVideoToggle);
    else heroVideo.pause();
  });

  if (!reduceMotion) heroVideo.play().catch(updateHeroVideoToggle);
  updateHeroVideoToggle();
}

const autoplayVideos = document.querySelectorAll("[data-autoplay-video]");

if (!reduceMotion && autoplayVideos.length) {
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { rootMargin: "120px 0px" });

    autoplayVideos.forEach((video) => videoObserver.observe(video));
  } else {
    autoplayVideos.forEach((video) => video.play().catch(() => {}));
  }
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
