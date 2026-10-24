document.documentElement.classList.add("js");

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduceMotion = motionPreference.matches;
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
  && video.dataset.userPaused !== "true"
  && (!video.hasAttribute("data-workflow-media") || !motionPreference.matches)
  && (!video.hasAttribute("data-workflow-frame") || video.dataset.workflowActive === "true");

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

const setWorkflowUserPaused = (video, paused) => {
  if (!video.hasAttribute("data-workflow-media")) return;
  document.querySelectorAll("#workflow [data-workflow-media]").forEach((item) => {
    item.dataset.userPaused = String(paused);
    if (paused) item.pause();
  });
};

const connectVideoButton = (video, button, idleLabel) => {
  if (!video || !button) return;
  button.addEventListener("click", () => {
    const pause = !video.paused;
    setWorkflowUserPaused(video, pause);
    if (pause) video.pause();
    else video.play().catch(() => setVideoButtonLabel(video, button, idleLabel));
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

const setupWorkflow = () => {
  const media = document.querySelector(".workflow-media");
  const steps = [...document.querySelectorAll("[data-workflow-video]")];
  if (!media || steps.length !== 2) return;
  const frames = [...media.querySelectorAll(".workflow-frame")];
  if (frames.length !== steps.length) return;
  const videos = frames.map((frame) => frame.querySelector("video"));
  const button = media.querySelector("[data-workflow-video-button]");
  const phases = [...media.querySelectorAll(".workflow-progress span")];
  const desktop = window.matchMedia("(min-width: 900px)");
  let activeIndex = 0;
  let requestedIndex = 0;

  const updateButton = () => {
    const video = videos[activeIndex];
    const label = video.paused ? "Play" : "Pause";
    button.textContent = label;
    button.setAttribute("aria-label", `${label} ${phases[activeIndex].textContent} demo`);
    button.setAttribute("aria-controls", video.id);
  };
  const playIfVisible = (video) => {
    const bounds = video.getBoundingClientRect();
    if (canPlayVideo(video) && bounds.bottom > 0 && bounds.top < window.innerHeight) {
      if (video.paused) playVideo(video).catch(updateButton);
    } else video.pause();
  };
  const resumeWorkflow = () => {
    document.querySelectorAll("#workflow [data-workflow-media]").forEach(playIfVisible);
  };
  const showStep = (index) => {
    activeIndex = index;
    frames.forEach((frame, i) => {
      frame.classList.toggle("is-active", i === index);
      frame.setAttribute("aria-hidden", String(i !== index));
      videos[i].dataset.workflowActive = String(i === index);
      if (i !== index) videos[i].pause();
    });
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    phases.forEach((phase, i) => {
      if (i === index) phase.setAttribute("aria-current", "step");
      else phase.removeAttribute("aria-current");
    });
    updateButton();
    if (desktop.matches && !motionPreference.matches) playIfVisible(videos[index]);
  };
  const commitRequestedStep = () => {
    if (!desktop.matches || motionPreference.matches || requestedIndex === activeIndex) return;
    const incoming = videos[requestedIndex];
    const poster = incoming.parentElement.querySelector(".video-poster");
    // Keep the outgoing frame until either the next poster or video can paint.
    if (incoming.readyState < 2 && !(poster.complete && poster.naturalWidth > 0)) {
      loadVideo(incoming);
      return;
    }
    showStep(requestedIndex);
  };
  const updateWorkflow = () => {
    if (!desktop.matches || motionPreference.matches) {
      videos.forEach((video) => video.pause());
      return;
    }
    requestedIndex = steps[1].getBoundingClientRect().top <= window.innerHeight / 2 ? 1 : 0;
    commitRequestedStep();
  };

  videos.forEach((video) => {
    video.parentElement.querySelector(".video-poster").addEventListener("load", commitRequestedStep);
    video.addEventListener("loadeddata", commitRequestedStep);
    video.addEventListener("play", updateButton);
    video.addEventListener("pause", updateButton);
  });
  button.addEventListener("click", () => {
    const video = videos[activeIndex];
    const pause = !video.paused;
    setWorkflowUserPaused(video, pause);
    if (!pause) playIfVisible(video);
    updateButton();
  });
  let workflowObserver;
  const observeSteps = () => {
    if (!("IntersectionObserver" in window)) return;
    workflowObserver?.disconnect();
    const inset = window.innerHeight * 0.4;
    workflowObserver = new IntersectionObserver(updateWorkflow, {
      rootMargin: `-${inset}px 0px -${inset}px`,
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
    });
    steps.forEach((step) => workflowObserver.observe(step));
  };
  observeSteps();
  desktop.addEventListener("change", () => {
    updateWorkflow();
    resumeWorkflow();
  });
  motionPreference.addEventListener("change", () => {
    document.querySelectorAll("#workflow [data-workflow-media]").forEach((video) => video.pause());
    updateWorkflow();
    resumeWorkflow();
  });
  document.addEventListener("visibilitychange", resumeWorkflow);
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      observeSteps();
      updateWorkflow();
      resumeWorkflow();
    });
  });
  showStep(0);
  updateWorkflow();
};
setupWorkflow();

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
