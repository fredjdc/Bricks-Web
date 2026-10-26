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

const setupReveals = () => {
  if (motionPreference.matches || !("IntersectionObserver" in window)) return;
  const selector = "h2, h3, p, .feature-title-icon, .workflow-progress, .workflow-frames, .workflow-media > .media-toggle, .mobile-workflow-media-wrap, .story-media, .capability-media, .pricing-block > .coming-soon-label, .pricing-options > div, .plan-comparison, .faq-list > details, .bricks-download-cta > img, .bricks-cta-actions, .founder-panel > img, .founder-link";
  const targets = new Map();
  try {
    document.querySelectorAll(".reveal").forEach(root => {
      const candidates = root.matches(selector) ? [root] : [...root.querySelectorAll(selector)];
      candidates.filter(item => !candidates.some(parent => parent !== item && parent.contains(item))).forEach(item => {
        if (!targets.has(item)) targets.set(item, { order: targets.size, group: item.closest("section, aside") || root });
      });
    });
  } catch { return; }
  if (!targets.size) return;
  const pending = new Set(targets.keys());
  const active = new Map();
  let observer;
  const showAll = () => {
    observer?.disconnect();
    active.forEach(animation => animation.cancel());
    active.clear();
    pending.clear();
  };
  try {
    observer = new IntersectionObserver(entries => {
      try {
        if (motionPreference.matches) { showAll(); return; }
        const eligible = [...new Set(entries.filter(entry => entry.isIntersecting && pending.has(entry.target) && entry.target.getClientRects().length).map(entry => entry.target))];
        eligible.sort((a, b) => targets.get(a).order - targets.get(b).order);
        const groups = new Map();
        // Read the batch before starting animations; offscreen siblings add no delay.
        const plans = eligible.flatMap(item => {
          pending.delete(item);
          observer.unobserve(item);
          if (typeof item.animate !== "function" || item.matches(":focus-within")) return [];
          const group = targets.get(item).group;
          const index = groups.get(group) || 0;
          groups.set(group, index + 1);
          const base = window.getComputedStyle(item);
          return [{ item, delay: Math.min(index * 70, 210), frames: [
            { opacity: 0, filter: base.filter === "none" ? "blur(3px)" : `${base.filter} blur(3px)`, transform: `${base.transform === "none" ? "" : `${base.transform} `}translateY(10px)` },
            { opacity: base.opacity, filter: base.filter, transform: base.transform },
          ] }];
        });
        plans.forEach(({ item, frames, delay }) => {
          const animation = item.animate(frames, { duration: 480, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" });
          active.set(item, animation);
          animation.addEventListener("finish", () => active.delete(item), { once: true });
          animation.addEventListener("cancel", () => active.delete(item), { once: true });
        });
      } catch { showAll(); }
    }, { threshold: 0 });
    targets.forEach((_, item) => observer.observe(item));
    motionPreference.addEventListener("change", () => { if (motionPreference.matches) showAll(); });
    document.addEventListener("focusin", event => {
      active.forEach((animation, item) => {
        if (item.contains(event.target)) { animation.cancel(); active.delete(item); }
      });
    });
  } catch { showAll(); }
};
setupReveals();

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
      else if (canPlayVideo(target) && (target === video || visibleVideos.has(target))) playVideo(target).catch(updateLabel);
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

const previewHandoff = (source, target, viewportHeight, sourceScale) => {
  const dimensions = [source.width, source.height, target.width, target.height, viewportHeight, sourceScale];
  if (dimensions.some(value => !Number.isFinite(value) || value <= 0)) return null;
  if (![source.left, source.top, target.left, target.top].every(Number.isFinite)) return null;
  const sourceX = source.left + source.width / 2;
  const sourceY = source.top + source.height / 2;
  const targetX = target.left + target.width / 2;
  const targetY = target.top + target.height / 2;
  const startViewportFraction = .6;
  const settleViewportFraction = .78;
  // Settle while the canvas is substantially visible, before it reaches mid-screen.
  const start = sourceY - viewportHeight * startViewportFraction;
  const end = targetY - viewportHeight * settleViewportFraction;
  if (end <= start) return null;
  const progress = Math.max(0, Math.min(1, -start / (end - start)));
  const fit = Math.min(target.width / (source.width * sourceScale), target.height / (source.height * sourceScale));
  return {
    progress,
    x: (targetX - sourceX) * progress,
    y: (targetY - sourceY) * progress,
    scale: 1 + (fit - 1) * progress,
  };
};

const handoffEntrances = progress => {
  const stage = (start, end) => Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return { title: stage(0, .35), subtitle: stage(.12, .5), desktop: stage(.24, .75), app: stage(.4, 1) };
};

const setupPreviewHandoff = () => {
  const origin = document.querySelector("[data-hero-preview-origin]");
  const composition = document.querySelector("[data-editor-composition]");
  if (!origin || !composition) return;
  const scene = origin.closest("main");
  if (!scene || !scene.contains(composition)) return;
  const traveler = origin.querySelector(".hero-preview-traveler");
  const target = composition.querySelector("[data-editor-preview-target]");
  if (!traveler || !target) return;
  let frame = 0;
  const reset = () => {
    ["--preview-x", "--preview-y", "--preview-scale"].forEach(name => traveler.style.removeProperty(name));
    scene.style.removeProperty("--handoff-progress");
    ["title", "subtitle", "desktop", "app"].forEach(stage => {
      scene.style.removeProperty(`--handoff-${stage}`);
      scene.style.removeProperty(`--handoff-${stage}-filter`);
    });
    scene.classList.remove("is-handoff-ready");
  };
  const update = () => {
    if (motionPreference.matches) { reset(); return; }
    try {
      const sourceScale = Number(window.getComputedStyle(origin).getPropertyValue("--hero-center-scale"));
      const state = previewHandoff(origin.getBoundingClientRect(), target.getBoundingClientRect(), window.innerHeight, sourceScale);
      if (!state) { reset(); return; }
      traveler.style.setProperty("--preview-x", `${state.x}px`);
      traveler.style.setProperty("--preview-y", `${state.y}px`);
      traveler.style.setProperty("--preview-scale", String(state.scale));
      scene.style.setProperty("--handoff-progress", String(state.progress));
      Object.entries(handoffEntrances(state.progress)).forEach(([stage, progress]) => {
        scene.style.setProperty(`--handoff-${stage}`, String(progress));
        scene.style.setProperty(`--handoff-${stage}-filter`, progress === 1 ? "none" : `blur(${(1 - progress) * 3}px)`);
      });
      scene.classList.add("is-handoff-ready");
    } catch {
      reset();
    }
  };
  const schedule = () => {
    if (motionPreference.matches || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  motionPreference.addEventListener("change", () => { reset(); schedule(); });
  composition.querySelectorAll("img").forEach(img => img.addEventListener("load", schedule));
  update();
};
setupPreviewHandoff();
