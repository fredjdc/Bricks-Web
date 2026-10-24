document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopResults = window.matchMedia("(min-width: 900px)");
const visibleVideos = new Set();

const loadVideo = (video) => {
  const source = video.querySelector("source[data-src]");
  if (!source) return;
  source.src = source.dataset.src;
  source.removeAttribute("data-src");
  if (video.dataset.startTime) {
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Number(video.dataset.startTime);
    }, { once: true });
  }
  video.load();
};

const canPlayVideo = (video) => !document.hidden
  && video.getClientRects().length > 0
  && (!video.hasAttribute("data-hero-side") || desktopResults.matches)
  && video.dataset.userPaused !== "true";

const playVideo = (video) => {
  loadVideo(video);
  return video.play();
};

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

document.querySelectorAll("[data-playback-toggle]").forEach((video) => {
  const name = video.dataset.playbackLabel;
  const updateLabel = () => video.setAttribute("aria-label", `${video.paused ? "Play" : "Pause"} ${name}`);
  const togglePlayback = () => {
    const pause = !video.paused;
    const targets = video.id === "finished-preview-video"
      ? document.querySelectorAll(".hero-results video") : [video];
    targets.forEach((target) => {
      target.dataset.userPaused = String(pause);
      if (pause) target.pause();
      else if (canPlayVideo(target)) playVideo(target).catch(updateLabel);
    });
  };
  video.addEventListener("click", togglePlayback);
  video.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    togglePlayback();
  });
  video.addEventListener("play", updateLabel);
  video.addEventListener("pause", updateLabel);
  updateLabel();
});

const workflowVideo = document.querySelector(".workflow-media video");
const workflowButton = document.querySelector(".workflow-media [data-adjacent-video-button]");
const workflowSteps = document.querySelectorAll("[data-workflow-video]");
const desktopWorkflow = window.matchMedia("(min-width: 900px)");

if (workflowVideo && workflowSteps.length && "IntersectionObserver" in window) {
  const activateWorkflowStep = (step) => {
    workflowSteps.forEach((item) => item.classList.toggle("is-active", item === step));
    document.querySelectorAll(".workflow-progress span").forEach((phase, index) => {
      if (workflowSteps[index] === step) phase.setAttribute("aria-current", "step");
      else phase.removeAttribute("aria-current");
    });
    workflowVideo.dataset.videoAlign = step.dataset.workflowAlign;
    const source = workflowVideo.querySelector("source");
    if (source.getAttribute("src") !== step.dataset.workflowVideo) {
      workflowVideo.pause();
      workflowVideo.poster = step.dataset.workflowPoster;
      showVideoPoster(workflowVideo);
      source.setAttribute("src", step.dataset.workflowVideo);
      workflowVideo.load();
    }
    if (!reduceMotion && canPlayVideo(workflowVideo)) workflowVideo.play().catch(() => setVideoButtonLabel(workflowVideo, workflowButton, "Play"));
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

const resumeVisibleVideos = () => {
  if (reduceMotion) return;
  visibleVideos.forEach((video) => {
    if (canPlayVideo(video)) playVideo(video).catch(() => {});
    else video.pause();
  });
};

if (!reduceMotion && observedVideos.length) {
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleVideos.add(entry.target);
        else visibleVideos.delete(entry.target);
        if (entry.isIntersecting && entry.target.hasAttribute("data-autoplay-video") && canPlayVideo(entry.target)) {
          playVideo(entry.target).catch(() => {});
        } else entry.target.pause();
      });
    }, { threshold: 0.05 });
    observedVideos.forEach((video) => videoObserver.observe(video));
  }
} else {
  autoplayVideos.forEach((video) => video.pause());
}

desktopResults.addEventListener("change", () => {
  document.querySelectorAll("[data-hero-side]").forEach((video) => {
    if (!desktopResults.matches) {
      video.pause();
      showVideoPoster(video);
    }
  });
  resumeVisibleVideos();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) observedVideos.forEach((video) => video.pause());
  else resumeVisibleVideos();
});
