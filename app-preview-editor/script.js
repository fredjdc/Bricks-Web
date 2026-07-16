const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const showVideoPoster = (video) => {
  const poster = video.parentElement.querySelector(".video-poster");
  poster.src = video.poster;
  poster.hidden = false;
};

document.querySelectorAll("video[poster]").forEach((video) => {
  const stage = document.createElement("div");
  const poster = document.createElement("img");
  stage.className = "video-stage";
  poster.className = "video-poster";
  poster.alt = "";
  poster.setAttribute("aria-hidden", "true");
  video.before(stage);
  stage.append(video, poster);
  showVideoPoster(video);
  video.addEventListener("loadstart", () => showVideoPoster(video));
  video.addEventListener("error", () => showVideoPoster(video));
  video.addEventListener("playing", () => { poster.hidden = true; });
});

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

const finishedPreviewVideo = document.getElementById("finished-preview-video");
if (finishedPreviewVideo) {
  const updateFinishedPreviewLabel = () => finishedPreviewVideo.setAttribute("aria-label", `${finishedPreviewVideo.paused ? "Play" : "Pause"} finished App Preview`);
  const toggleFinishedPreview = () => finishedPreviewVideo.paused ? finishedPreviewVideo.play().catch(updateFinishedPreviewLabel) : finishedPreviewVideo.pause();
  finishedPreviewVideo.addEventListener("click", toggleFinishedPreview);
  finishedPreviewVideo.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    toggleFinishedPreview();
  });
  finishedPreviewVideo.addEventListener("play", updateFinishedPreviewLabel);
  finishedPreviewVideo.addEventListener("pause", updateFinishedPreviewLabel);
  updateFinishedPreviewLabel();
}

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
      showVideoPoster(workflowVideo);
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
  const email = form.querySelector('[name="EMAIL"]');
  const status = form.querySelector(".form-status");
  let submitting = false;

  const setStatus = (message = "", state = "") => {
    status.textContent = message;
    status.dataset.state = state;
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
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!validateEmail()) {
      return;
    }

    submitting = true;
    const submitButton = event.submitter || form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "Sending...";
    setStatus("Submitting your request...");
    const callbackName = `mailchimpCallback${Date.now()}${Math.random().toString(36).slice(2)}`;
    const requestUrl = new URL(form.action);
    requestUrl.pathname = requestUrl.pathname.replace(/\/post$/, "/post-json");
    new FormData(form).forEach((value, key) => requestUrl.searchParams.append(key, value));
    requestUrl.searchParams.set("c", callbackName);
    const request = document.createElement("script");

    try {
      const data = await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Mailchimp request timed out")), 15000);
        window[callbackName] = (result) => {
          window.clearTimeout(timeout);
          resolve(result);
        };
        request.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Mailchimp request failed"));
        };
        request.src = requestUrl;
        document.body.append(request);
      });
      if (data.result !== "success") {
        const message = document.createElement("div");
        message.innerHTML = data.msg || "";
        setStatus(message.textContent?.replace(/^\d+\s*-\s*/, "") || "Check your email address and try again.", "error");
        return;
      }

      form.reset();
      setStatus("Thanks! Your beta request has been received. I’ll be in touch by email.", "success");
    } catch {
      setStatus("Form service is temporarily unavailable. Email hello@bricks.pe instead.", "error");
    } finally {
      request.remove();
      window[callbackName] = () => {};
      window.setTimeout(() => delete window[callbackName], 60000);
      submitting = false;
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Get Beta Access";
    }
  });
});

document.querySelectorAll("[data-beta-cta]").forEach((cta) => {
  cta.addEventListener("click", (event) => {
    event.preventDefault();
    const form = document.querySelector('[data-signup-form][data-placement="hero"]');
    const email = form.querySelector('[name="EMAIL"]');
    email.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => email.focus(), reduceMotion ? 0 : 350);
  });
});
