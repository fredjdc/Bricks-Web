const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("hero-visual")) {
          entry.target.style.setProperty("--reveal-delay", `${Math.max(0, 720 - performance.now())}ms`);
        }
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

const workflowVideo = document.querySelector(".workflow-media video");
const workflowSteps = document.querySelectorAll("[data-workflow-video]");
const desktopWorkflow = window.matchMedia("(min-width: 900px)");

if (workflowVideo && workflowSteps.length && "IntersectionObserver" in window) {
  const activateWorkflowStep = (step) => {
    workflowSteps.forEach((item) => item.classList.toggle("is-active", item === step));
    const source = workflowVideo.querySelector("source");
    const nextSource = step.dataset.workflowVideo;
    if (source.getAttribute("src") !== nextSource) {
      workflowVideo.pause();
      workflowVideo.poster = step.dataset.workflowPoster;
      source.setAttribute("src", nextSource);
      workflowVideo.load();
    }
    if (!reduceMotion) workflowVideo.play().catch(() => {});
  };

  const workflowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (desktopWorkflow.matches && entry.isIntersecting) activateWorkflowStep(entry.target);
    });
  }, { rootMargin: "-35% 0px -45%", threshold: 0 });

  workflowSteps.forEach((step) => workflowObserver.observe(step));
  workflowSteps[0].classList.add("is-active");
  desktopWorkflow.addEventListener("change", (event) => {
    if (!event.matches) {
      workflowVideo.pause();
      return;
    }
    const viewportCenter = window.innerHeight / 2;
    const nearestStep = [...workflowSteps].sort((a, b) =>
      Math.abs(a.getBoundingClientRect().top + a.offsetHeight / 2 - viewportCenter)
      - Math.abs(b.getBoundingClientRect().top + b.offsetHeight / 2 - viewportCenter)
    )[0];
    activateWorkflowStep(nearestStep);
  });
}

const heroVideo = document.querySelector(".hero-result-video");
const heroVideoToggle = document.querySelector(".hero-video-toggle");
const heroVisual = document.querySelector(".hero-visual");

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

  if (!reduceMotion && heroVisual) {
    const playAfterReveal = (event) => {
      if (event.target !== heroVisual) return;
      heroVisual.removeEventListener("transitionend", playAfterReveal);
      if (heroVideo.paused) heroVideo.play().catch(updateHeroVideoToggle);
    };
    heroVisual.addEventListener("transitionend", playAfterReveal);
  }
  updateHeroVideoToggle();
}

const autoplayVideos = document.querySelectorAll("[data-autoplay-video]");

document.querySelectorAll("[data-toggle-video]").forEach((video) => {
  const togglePlayback = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  video.addEventListener("click", togglePlayback);
  video.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    togglePlayback();
  });
});

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
