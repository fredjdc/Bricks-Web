const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.documentElement.classList.add("js");
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const philosophyStage = document.querySelector("[data-philosophy-stage]");
const nearestPhilosophyLineIndex = (centers, viewportCenter) => centers.reduce((nearest, center, index) => Math.abs(center - viewportCenter) < Math.abs(centers[nearest] - viewportCenter) ? index : nearest, 0);

if (philosophyStage && !reduceMotion && "IntersectionObserver" in window) {
  const philosophyLines = [...philosophyStage.querySelectorAll("[data-philosophy-line]")];
  const philosophyTriggers = philosophyStage.querySelectorAll("[data-philosophy-trigger]");

  const activatePhilosophyLine = (index) => {
    philosophyLines.forEach((line, lineIndex) => {
      line.classList.toggle("is-active", lineIndex === index);
      line.classList.toggle("is-past", lineIndex < index);
    });
  };

  if (philosophyLines.length && philosophyLines.length === philosophyTriggers.length) {
    philosophyStage.classList.add("is-scroll-ready");
    const philosophyObserver = new IntersectionObserver(() => {
      const centers = [...philosophyTriggers].map((trigger) => {
        const bounds = trigger.getBoundingClientRect();
        return bounds.top + bounds.height / 2;
      });
      activatePhilosophyLine(nearestPhilosophyLineIndex(centers, innerHeight / 2));
    }, { rootMargin: "-45% 0px -45%", threshold: 0 });
    philosophyTriggers.forEach((trigger) => philosophyObserver.observe(trigger));
  }
}

const setVideoButtonLabel = (video, button, idleLabel = "Play") => {
  const label = video.paused ? idleLabel : "Pause";
  button.textContent = label;
  button.setAttribute("aria-label", label);
};

const connectVideoButton = (video, button, idleLabel) => {
  if (!video || !button) return;
  button.addEventListener("click", () => {
    if (video.paused) video.play().catch(() => setVideoButtonLabel(video, button, idleLabel));
    else video.pause();
  });
  video.addEventListener("play", () => setVideoButtonLabel(video, button, idleLabel));
  video.addEventListener("pause", () => setVideoButtonLabel(video, button, idleLabel));
  setVideoButtonLabel(video, button, idleLabel);
};

document.querySelectorAll("[data-adjacent-video-button]").forEach((button) => {
  connectVideoButton(button.parentElement.querySelector("video"), button, "Play");
});

document.querySelectorAll("[data-video-button]").forEach((button) => {
  connectVideoButton(document.getElementById(button.getAttribute("aria-controls")), button, "Play");
});

const workflowVideo = document.querySelector(".workflow-media video");
const workflowButton = document.querySelector(".workflow-media [data-adjacent-video-button]");
const workflowSteps = document.querySelectorAll("[data-workflow-video]");
const desktopWorkflow = window.matchMedia("(min-width: 900px)");

if (workflowVideo && workflowSteps.length && "IntersectionObserver" in window) {
  const activateWorkflowStep = (step) => {
    workflowSteps.forEach((item) => item.classList.toggle("is-active", item === step));
    workflowVideo.dataset.videoAlign = step.dataset.workflowAlign;
    const source = workflowVideo.querySelector("source");
    if (source.getAttribute("src") !== step.dataset.workflowVideo) {
      workflowVideo.pause();
      workflowVideo.poster = step.dataset.workflowPoster;
      source.setAttribute("src", step.dataset.workflowVideo);
      workflowVideo.load();
    }
    if (!reduceMotion) workflowVideo.play().catch(() => setVideoButtonLabel(workflowVideo, workflowButton, "Play"));
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

const observedVideos = document.querySelectorAll("video");
const autoplayVideos = document.querySelectorAll("[data-autoplay-video]");

if (!reduceMotion && observedVideos.length) {
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.hasAttribute("data-autoplay-video")) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { rootMargin: "120px 0px" });
    observedVideos.forEach((video) => videoObserver.observe(video));
  } else {
    autoplayVideos.forEach((video) => video.play().catch(() => {}));
  }
} else {
  autoplayVideos.forEach((video) => video.pause());
}

document.querySelectorAll("[data-signup-form]").forEach((form) => {
  const emailStep = form.querySelector('[data-signup-step="email"]');
  const betaStep = form.querySelector('[data-signup-step="beta"]');
  const email = form.querySelector('[name="email"]');
  const status = form.querySelector(".form-status");
  const betaButtonLabel = betaStep.querySelector("button[type='submit'] span");
  const building = form.querySelector('[name="building"]');
  const appLink = form.querySelector('[name="app_link"]');
  const challenge = form.querySelector('[name="preview_challenge"]');
  let submitting = false;

  const setStatus = (message = "", state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };
  const showEmailStep = () => {
    betaStep.hidden = true;
    emailStep.hidden = false;
    form.dataset.betaReady = "false";
  };
  const showBetaStep = () => {
    emailStep.hidden = true;
    betaStep.hidden = false;
    form.dataset.betaReady = "true";
    setStatus();
    building.focus();
  };
  const validateEmail = () => {
    const valid = email.value.trim() && email.validity.valid;
    email.setAttribute("aria-invalid", String(!valid));
    if (!valid) {
      setStatus("Enter a valid email address.", "error");
      email.focus();
    }
    return valid;
  };
  const validateBetaApplication = () => {
    for (const field of [building, challenge]) {
      const valid = field.value.trim().length > 0;
      field.setAttribute("aria-invalid", String(!valid));
      if (!valid) {
        setStatus("Add a short answer so we can review your application.", "error");
        field.focus();
        return false;
      }
    }
    if (appLink.value.trim() && !appLink.validity.valid) {
      appLink.setAttribute("aria-invalid", "true");
      setStatus("Enter a complete link or leave this field empty.", "error");
      appLink.focus();
      return false;
    }
    appLink.removeAttribute("aria-invalid");
    return true;
  };

  form.querySelector("[data-beta-back]").addEventListener("click", () => {
    showEmailStep();
    email.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!validateEmail()) {
      return;
    }

    if (form.dataset.betaReady !== "true") {
      showBetaStep();
      return;
    }
    if (!validateBetaApplication()) {
      return;
    }

    submitting = true;
    const submitButton = event.submitter || betaStep.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "Sending...";
    setStatus("Submitting your request...");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || ![true, "true"].includes(data.success)) throw new Error(data.message || `Form submission failed: ${response.status}`);

      form.reset();
      showEmailStep();
      setStatus("Thanks! We’ll review your request and be in touch by email soon.", "success");
    } catch {
      setStatus("Something went wrong. Your information was not submitted. Please try again.", "error");
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
      betaButtonLabel.textContent = "Submit beta application";
    }
  });
});

document.querySelectorAll("[data-beta-cta]").forEach((cta) => {
  cta.addEventListener("click", (event) => {
    event.preventDefault();
    const form = document.querySelector('[data-signup-form][data-placement="hero"]');
    const emailStep = form.querySelector('[data-signup-step="email"]');
    const betaStep = form.querySelector('[data-signup-step="beta"]');
    const email = form.querySelector('[name="email"]');
    emailStep.hidden = false;
    betaStep.hidden = true;
    form.dataset.betaReady = "false";
    email.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => email.focus(), reduceMotion ? 0 : 350);
  });
});
