document.documentElement.classList.add("js");

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  && (!video.hasAttribute("data-scene-clips") || !motionPreference.matches);

const playVideo = (video) => {
  loadVideo(video);
  return video.play();
};

const showVideoPoster = (video) => {
  const poster = video.parentElement.querySelector(".video-poster");
  poster.src = video.poster;
  poster.hidden = false;
};

// HTML dimensions reserve the verified native ratio before metadata is available.
// Refresh that hint on native size/source changes, without touching playback state.
const syncVideoGeometry = video => {
  const nativeReady = video.videoWidth > 0 && video.videoHeight > 0;
  const width = nativeReady ? video.videoWidth : Number(video.getAttribute("width"));
  const height = nativeReady ? video.videoHeight : Number(video.getAttribute("height"));
  if (![width, height].every(value => Number.isFinite(value) && value > 0)) return;
  video.setAttribute("width", String(width));
  video.setAttribute("height", String(height));
  if (video.id === "finished-preview-video") {
    const target = document.querySelector("[data-editor-preview-target]");
    if (target) target.style.aspectRatio = `${width} / ${height}`;
  }
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
  syncVideoGeometry(video);
  video.addEventListener("loadedmetadata", () => syncVideoGeometry(video));
  video.addEventListener("resize", () => syncVideoGeometry(video));
  showVideoPoster(video);
  video.addEventListener("loadstart", () => showVideoPoster(video));
  video.addEventListener("error", () => showVideoPoster(video));
  video.addEventListener("playing", () => {
    if (!video.hasAttribute("data-scene-clips")) { poster.hidden = true; return; }
    const showFrame = () => {
      if (!video.paused && !video.error && video.readyState >= 2 && !motionPreference.matches) poster.hidden = true;
    };
    if (typeof video.requestVideoFrameCallback === "function") video.requestVideoFrameCallback(showFrame);
    else showFrame();
  });
});

const setupReveals = () => {
  if (motionPreference.matches || !("IntersectionObserver" in window)) return;
  const selector = "h2, h3, p, .device-support, .feature-title-icon, .workflow-progress, .workflow-frames, .mobile-workflow-media-wrap, .story-media, .scene-clips-media, .capability-media, .pricing-block > .coming-soon-label, .pricing-options > div, .plan-comparison, .faq-list > details, .bricks-download-cta > img, .bricks-cta-actions, .cta-preview-mask, .founder-panel > img, .founder-link";
  const targets = new Map();
  try {
    document.querySelectorAll(".reveal").forEach(root => {
      const candidates = root.matches(selector) ? [root] : [...root.querySelectorAll(selector)];
      candidates.filter(item => !candidates.some(parent => parent !== item && parent.contains(item))
        && !(item.closest(".product-story") && (item.closest(".story-copy") || item.matches(".story-media")))).forEach(item => {
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
          const delay = Math.min(index * 70, 210);
          if (item.matches(".cta-preview-mask")) {
            const order = ["center", "left", "right"];
            const previews = [...item.querySelectorAll("[data-cta-preview]")].sort((a, b) => order.indexOf(a.dataset.ctaPreview) - order.indexOf(b.dataset.ctaPreview));
            if (previews.length !== 3 || previews.some(preview => typeof preview.animate !== "function")) return [];
            const bounds = previews.map(preview => preview.querySelector("img").getBoundingClientRect());
            if (bounds.some(box => !Number.isFinite(box.left + box.width) || box.width <= 0)) return [];
            const center = bounds[0].left + bounds[0].width / 2;
            return previews.map((preview, step) => ({
              item: preview, delay: delay + step * 180, duration: step ? 760 : 600, easing: "cubic-bezier(.22, 1, .36, 1)",
              frames: [
                { opacity: 0, filter: `blur(${step ? 3 : 2}px)`, transform: `translate(${center - bounds[step].left - bounds[step].width / 2}px, 8px) scale(${step ? .8 : .96})` },
                { opacity: 1, filter: "none", transform: "none" },
              ],
            }));
          }
          const base = window.getComputedStyle(item);
          return [{ item, delay, frames: [
            { opacity: 0, filter: base.filter === "none" ? "blur(3px)" : `${base.filter} blur(3px)`, transform: `${base.transform === "none" ? "" : `${base.transform} `}translateY(10px)` },
            { opacity: base.opacity, filter: base.filter, transform: base.transform },
          ] }];
        });
        plans.forEach(({ item, frames, delay, duration = 480, easing = "cubic-bezier(0.16, 1, 0.3, 1)" }) => {
          const animation = item.animate(frames, { duration, delay, easing, fill: "backwards" });
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

const workflowPinLayout = (cardHeight, viewportHeight, navBottom, bottomSpace) => {
  if (![cardHeight, viewportHeight].every(value => Number.isFinite(value) && value > 0)
    || ![navBottom, bottomSpace].every(value => Number.isFinite(value) && value >= 0)) return null;
  const top = Math.ceil(navBottom + 16);
  if (top + cardHeight + 24 > viewportHeight) return null;
  return { top, cardHeight, distance: viewportHeight * .9, bottomSpace };
};

const setupWorkflow = () => {
  const section = document.querySelector("#workflow");
  const card = section?.querySelector(":scope > .shell");
  const media = section?.querySelector(".workflow-media");
  const steps = [...document.querySelectorAll("[data-workflow-step]")];
  if (!card || !media || steps.length !== 2 || typeof window.requestAnimationFrame !== "function") return;
  const frames = [...media.querySelectorAll(".workflow-frame")];
  if (frames.length !== steps.length) return;
  const images = frames.map(frame => frame.querySelector("img"));
  if (images.some(image => !image)) return;
  const phases = [...media.querySelectorAll("[data-workflow-nav]")];
  const desktop = window.matchMedia("(min-width: 900px)");
  const header = document.querySelector(".site-header");
  let activeIndex = 0, requestedIndex = 0, pin = null, frame = 0, needsMeasure = false;
  const showStep = index => {
    activeIndex = index;
    frames.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      item.setAttribute("aria-hidden", String(i !== index));
    });
    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === index);
      if (pin) step.setAttribute("aria-hidden", String(i !== index));
      else step.removeAttribute("aria-hidden");
    });
    phases.forEach((phase, i) => {
      if (i === index) phase.setAttribute("aria-current", "step");
      else phase.removeAttribute("aria-current");
    });
  };
  const resetPin = () => {
    pin = null;
    section.classList.remove("is-workflow-pinned");
    ["top", "card-height", "distance", "bottom-space"].forEach(name => section.style.removeProperty(`--workflow-pin-${name}`));
    requestedIndex = 0;
    showStep(0);
  };
  const measurePin = () => {
    if (!desktop.matches || motionPreference.matches) { resetPin(); return; }
    try {
      // Measure the compact candidate once on layout changes, never during scroll.
      section.classList.add("is-workflow-pinned");
      const navBottom = header ? header.getBoundingClientRect().height + (parseFloat(window.getComputedStyle(header).top) || 0) : 0;
      const bottomSpace = parseFloat(window.getComputedStyle(section).paddingBottom) || 0;
      pin = workflowPinLayout(card.getBoundingClientRect().height, window.innerHeight, navBottom, bottomSpace);
      if (!pin) { resetPin(); return; }
      Object.entries({ top: pin.top, "card-height": pin.cardHeight, distance: pin.distance, "bottom-space": pin.bottomSpace })
        .forEach(([name, value]) => section.style.setProperty(`--workflow-pin-${name}`, `${value}px`));
      showStep(activeIndex);
    } catch { resetPin(); }
  };
  const updateWorkflow = () => {
    if (!pin) return;
    const progress = Math.max(0, Math.min(1, (pin.top - section.getBoundingClientRect().top) / pin.distance));
    requestedIndex = progress < .5 ? 0 : 1;
    const incoming = images[requestedIndex];
    if (requestedIndex !== activeIndex && incoming.complete && incoming.naturalWidth > 0) showStep(requestedIndex);
  };
  const schedule = (measure = false) => {
    needsMeasure ||= measure;
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (needsMeasure) { needsMeasure = false; measurePin(); }
      updateWorkflow();
    });
  };
  phases.forEach((phase, index) => phase.addEventListener("click", () => {
    if (!pin) return;
    const start = section.getBoundingClientRect().top + window.scrollY - pin.top;
    window.scrollTo({ top: start + pin.distance * (index ? .75 : .25), behavior: "smooth" });
  }));
  images.forEach(image => image.addEventListener("load", () => schedule(true)));
  window.addEventListener("scroll", () => schedule(), { passive: true });
  window.addEventListener("resize", () => schedule(true));
  const modeChanged = () => { measurePin(); updateWorkflow(); };
  desktop.addEventListener("change", modeChanged);
  motionPreference.addEventListener("change", modeChanged);
  document.fonts?.ready.then(() => schedule(true));
  showStep(0);
  modeChanged();
};
setupWorkflow();

const observedVideos = document.querySelectorAll("video");

const resumeVisibleVideos = () => {
  if (motionPreference.matches) return;
  visibleVideos.forEach((video) => {
    if (canPlayVideo(video)) playVideo(video).catch(() => {});
    else video.pause();
  });
};

if (observedVideos.length && "IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleVideos.add(entry.target);
      else visibleVideos.delete(entry.target);
      if (entry.isIntersecting && !motionPreference.matches && entry.target.hasAttribute("data-autoplay-video") && canPlayVideo(entry.target)) {
        playVideo(entry.target).catch(() => {});
      } else if (!entry.isIntersecting || !canPlayVideo(entry.target)) entry.target.pause();
    });
  }, { threshold: 0.05 });
  observedVideos.forEach((video) => videoObserver.observe(video));
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

motionPreference.addEventListener("change", () => {
  if (motionPreference.matches) {
    observedVideos.forEach(video => video.pause());
    document.querySelectorAll("[data-scene-clips]").forEach(showVideoPoster);
  } else resumeVisibleVideos();
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

const boundedProgress = (value, start, end) => Math.max(0, Math.min(1, (value - start) / (end - start)));

const handoffBlurSettings = {
  maxBlurPx: 3,
  easing: progress => progress * progress * (3 - 2 * progress),
  ranges: { title: [0, 1], subtitle: [.06, 1], desktop: [.14, 1], app: [.22, 1] },
};

const handoffBlurProgress = (source, title, state, sourceScale) => {
  if (![title.width, title.height].every(value => Number.isFinite(value) && value > 0)
    || ![title.left, title.top].every(Number.isFinite)) return null;
  const sourceHeight = source.height * sourceScale;
  const centerX = source.left + source.width / 2 + state.x;
  const halfWidth = source.width * sourceScale * state.scale / 2;
  if (centerX + halfWidth < title.left || centerX - halfWidth > title.left + title.width) return null;
  const sourceY = source.top + source.height / 2;
  const initialTop = sourceY - sourceHeight / 2;
  const movingTop = sourceY + state.y - sourceHeight * state.scale / 2;
  const titleBottom = title.top + title.height;
  // The portrait has passed the letters only when its trailing top clears the title.
  if (movingTop >= titleBottom || initialTop >= titleBottom) return 1;
  return boundedProgress(movingTop, initialTop, titleBottom);
};

const handoffEntrances = progress => {
  const stage = (start, end) => boundedProgress(progress, start, end);
  return { title: stage(0, .35), subtitle: stage(.12, .5), desktop: stage(.24, .75), app: stage(.4, 1) };
};

const handoffSharpness = progress => Object.fromEntries(Object.entries(handoffBlurSettings.ranges).map(([stage, [start, end]]) => {
  const fraction = boundedProgress(progress, start, end);
  return [stage, handoffBlurSettings.easing(fraction)];
}));

// Each card follows its own stable layout position, including the stacked mobile layout.
const placementEntrance = (top, viewportHeight, delay = 0) => {
  const progress = boundedProgress(viewportHeight - top, viewportHeight * .04, viewportHeight * .48);
  const stagger = boundedProgress(progress, delay, 1);
  return handoffBlurSettings.easing(stagger);
};

const createPlacementReveal = () => {
  const section = document.querySelector("#features");
  if (!section) return { measure: () => () => {}, reset: () => {} };
  const grid = section.querySelector(".capability-grid");
  const copy = [...section.querySelectorAll(".section-heading > h2, .section-heading > p")];
  const cards = grid ? [...grid.querySelectorAll(":scope > article")] : [];
  const targets = [...copy, ...cards];
  const reset = () => {
    section.classList.remove("is-placement-ready");
    targets.forEach(item => ["--placement-progress", "--placement-opacity", "--placement-x", "--placement-y", "--placement-scale", "--placement-filter"].forEach(name => item.style.removeProperty(name)));
  };
  const measure = () => {
    if (motionPreference.matches || !grid || copy.length !== 2 || cards.length !== 3) return reset;
    try {
      const bounds = grid.getBoundingClientRect();
      if (![bounds.width, window.innerHeight].every(value => Number.isFinite(value) && value > 0) || !Number.isFinite(bounds.top)) return reset;
      const stacked = window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length === 1;
      const plans = copy.map((item, index) => ({ item, progress: placementEntrance(item.getBoundingClientRect().top, window.innerHeight, index * .1), x: 0, y: 0, card: false }));
      cards.forEach((item, index) => {
        const { offsetLeft: left, offsetTop: top, offsetWidth: width } = item;
        if (![left, top, width].every(Number.isFinite) || width <= 0) throw new Error("Missing placement geometry");
        plans.push({ item, progress: placementEntrance(bounds.top + top, window.innerHeight, stacked ? 0 : [ .08, 0, .16 ][index]), x: stacked ? 0 : bounds.width / 2 - (left + width / 2), y: 12, card: true, solid: index === 1 });
      });
      if (plans.some(plan => !Number.isFinite(plan.progress))) return reset;
      return () => {
        try {
          plans.forEach(({ item, progress, x, y, card, solid }) => {
            if (item.matches(":focus-within")) progress = 1;
            item.style.setProperty("--placement-progress", String(progress));
            item.style.setProperty("--placement-opacity", String(solid ? 1 : progress));
            item.style.setProperty("--placement-x", `${x * (1 - progress)}px`);
            item.style.setProperty("--placement-y", `${solid ? 0 : y * (1 - progress)}px`);
            item.style.setProperty("--placement-scale", String(card && !solid ? .9 + .1 * progress : 1));
            item.style.setProperty("--placement-filter", solid || progress === 1 ? "none" : `blur(${(1 - progress) * handoffBlurSettings.maxBlurPx}px)`);
          });
          section.classList.add("is-placement-ready");
        } catch { reset(); }
      };
    } catch { return reset; }
  };
  section.addEventListener("focusin", () => measure()());
  return { measure, reset };
};

const storyRevealSettings = { maxBlurPx: 6, maxSlidePx: 64, slideViewportFraction: .08, stackedSlidePx: 16, finishCenterViewportFraction: .5 };
// Start at first image entry; finish only when the image center reaches viewport center.
const storyEntrance = (top, height, viewport) => handoffBlurSettings.easing(boundedProgress(viewport - top, 0, viewport * (1 - storyRevealSettings.finishCenterViewportFraction) + height / 2));

const createStoryReveal = () => {
  const entries = [...(document.querySelectorAll?.(".product-story") || [])].map(section => ({
    section, copy: section.querySelector(".story-copy-content"), media: section.querySelector(".story-media"),
  })).filter(entry => entry.copy && entry.media);
  const reset = () => entries.forEach(({ section, media }) => {
    section.classList.remove("is-story-ready");
    ["--story-progress", "--story-filter"].forEach(name => section.style.removeProperty(name));
    media.style.removeProperty("--story-x");
  });
  const measure = () => {
    if (motionPreference.matches) return reset;
    try {
      const viewport = window.innerHeight, width = document.documentElement?.clientWidth || window.innerWidth;
      if (![viewport, width].every(value => Number.isFinite(value) && value > 0)) return reset;
      const plans = entries.map(({ section, media }) => {
        const bounds = media.getBoundingClientRect(), frame = section.getBoundingClientRect();
        if (![bounds.width, bounds.height].every(value => Number.isFinite(value) && value > 0) || !Number.isFinite(bounds.top + bounds.left + frame.left + frame.width)) throw new Error("Missing story geometry");
        // Remove the previous horizontal translation so gutter limits never feed back into themselves.
        const left = bounds.left - (parseFloat(media.style.getPropertyValue("--story-x")) || 0);
        const stacked = window.getComputedStyle(section).gridTemplateColumns.trim().split(/\s+/).length === 1;
        const direction = stacked ? (section.classList.contains("product-story-reverse") ? -1 : 1) : (left + bounds.width / 2 < frame.left + frame.width / 2 ? -1 : 1);
        const gutter = direction < 0 ? left : width - left - bounds.width;
        const distance = Math.max(0, Math.min(storyRevealSettings.maxSlidePx, width * storyRevealSettings.slideViewportFraction, stacked ? storyRevealSettings.stackedSlidePx : Infinity, gutter));
        const progress = section.matches(":focus-within") ? 1 : storyEntrance(bounds.top, bounds.height, viewport);
        return { section, media, progress, x: direction * distance * (1 - progress) };
      });
      return () => {
        try {
          plans.forEach(({ section, media, progress, x }) => {
            section.style.setProperty("--story-progress", String(progress));
            section.style.setProperty("--story-filter", progress === 1 ? "none" : `blur(${(1 - progress) * storyRevealSettings.maxBlurPx}px)`);
            media.style.setProperty("--story-x", `${x}px`);
            section.classList.add("is-story-ready");
          });
        } catch { reset(); }
      };
    } catch { return reset; }
  };
  entries.forEach(({ section, media }) => {
    section.addEventListener("focusin", () => measure()());
    media.querySelector("img")?.addEventListener("load", () => measure()());
  });
  return { measure, reset };
};

// Project the unanimated resting card's edges through the same CSS camera.
// Undo the outer translation before measuring; inner intro transforms never enter this baseline.
const heroSideRestDistance = (left, width, direction, scale, tilt, inset, camera, depth, center) => {
  if (![left, width, direction, scale, tilt, inset, camera, depth, center].every(Number.isFinite)
    || width <= 0 || scale <= 0 || depth <= 0) return null;
  const origin = direction < 0 ? width : 0;
  const angle = -direction * tilt * Math.PI / 180;
  const project = x => {
    const dx = (x - origin) * scale;
    const z = -Math.sin(angle) * dx;
    if (z >= depth) return NaN;
    const world = left + origin + Math.cos(angle) * dx - direction * inset * width;
    return camera + (world - camera) * depth / (depth - z);
  };
  const distance = Math.abs(center - (project(0) + project(width)) / 2);
  return Number.isFinite(distance) ? distance : null;
};

const heroSpacingSettings = { minimumScrollViewportFraction: .75 };
const heroSeparationProgress = (hero, source, viewport, scroll) => {
  if (![hero.top, source.top, source.height, viewport, scroll].every(Number.isFinite) || viewport <= 0 || source.height <= 0) return null;
  const start = Math.max(0, hero.top + scroll - viewport);
  const handoffStart = source.top + source.height / 2 + scroll - viewport * .6;
  const end = start + Math.max(viewport * heroSpacingSettings.minimumScrollViewportFraction, handoffStart - start);
  return boundedProgress(scroll, start, end);
};

const heroSpotlightSettings = { fadeBeforeHandoffFraction: .85, sourceHeightFraction: .5 };
const heroSpotlightOpacity = (hero, source, viewport, scroll) => {
  if (![hero.top, source.top, source.height, viewport, scroll].every(Number.isFinite) || viewport <= 0 || source.height <= 0) return null;
  const start = Math.max(0, hero.top + scroll - viewport);
  const handoffStart = source.top + source.height / 2 + scroll - viewport * .6;
  const end = start + (handoffStart - start) * heroSpotlightSettings.fadeBeforeHandoffFraction;
  return end > start ? 1 - handoffBlurSettings.easing(boundedProgress(scroll, start, end)) : 0;
};

const createHeroSpacing = origin => {
  const hero = origin.closest(".hero-results");
  const stage = origin.closest(".hero");
  const slots = hero ? [...hero.querySelectorAll(".hero-side-slot")] : [];
  const reset = () => {
    hero?.style.removeProperty("--hero-separation-progress");
    ["--hero-spotlight-opacity", "--hero-spotlight-x", "--hero-spotlight-y"].forEach(name => stage?.style.removeProperty(name));
    slots.forEach(slot => slot.style.removeProperty("--hero-side-rest-shift"));
  };
  const measure = source => {
    if (!hero || slots.length !== 2 || motionPreference.matches) return reset;
    try {
      const bounds = hero.getBoundingClientRect();
      const progress = heroSeparationProgress(bounds, source, window.innerHeight, window.scrollY);
      const spotlight = heroSpotlightOpacity(bounds, source, window.innerHeight, window.scrollY);
      if (progress === null || spotlight === null) return reset;
      const center = source.left + source.width / 2;
      const plans = slots.map(slot => {
        const style = window.getComputedStyle(slot);
        const token = name => parseFloat(style.getPropertyValue(name));
        const matrix = new DOMMatrixReadOnly(style.transform);
        if (!matrix.is2D || matrix.a !== 1 || matrix.b || matrix.c || matrix.d !== 1 || matrix.f) throw new Error("Unexpected hero slot transform");
        const slotBounds = slot.getBoundingClientRect();
        const left = slotBounds.left - matrix.m41;
        const ratio = token("--hero-side-distance-ratio");
        const distance = heroSideRestDistance(left, slotBounds.width, token("--hero-exit-direction"), token("--hero-side-rest-scale"), token("--hero-side-rest-tilt"), token("--hero-side-rest-inset") / 100, left + parseFloat(style.perspectiveOrigin), parseFloat(style.perspective), center);
        if (distance === null || !(ratio > 0 && ratio <= 1)) throw new Error("Missing hero spacing geometry");
        return { slot, shift: distance * (1 - ratio) };
      });
      return () => {
        hero.style.setProperty("--hero-separation-progress", String(progress));
        stage?.style.setProperty("--hero-spotlight-opacity", String(spotlight));
        stage?.style.setProperty("--hero-spotlight-x", `${center}px`);
        stage?.style.setProperty("--hero-spotlight-y", `${source.top + source.height * heroSpotlightSettings.sourceHeightFraction}px`);
        plans.forEach(({ slot, shift }) => slot.style.setProperty("--hero-side-rest-shift", `${shift}px`));
      };
    } catch { return reset; }
  };
  return { measure, reset };
};

const setupPreviewHandoff = () => {
  const origin = document.querySelector("[data-hero-preview-origin]");
  const composition = document.querySelector("[data-editor-composition]");
  if (!origin || !composition) return;
  const scene = origin.closest("main");
  if (!scene || !scene.contains(composition)) return;
  const traveler = origin.querySelector(".hero-preview-traveler");
  const target = composition.querySelector("[data-editor-preview-target]");
  const title = document.querySelector("#result-title");
  if (!traveler || !target || !title) return;
  const placements = createPlacementReveal();
  const stories = createStoryReveal();
  const heroSpacing = createHeroSpacing(origin);
  let frame = 0;
  const reset = () => {
    heroSpacing.reset();
    ["--preview-x", "--preview-y", "--preview-scale"].forEach(name => traveler.style.removeProperty(name));
    scene.style.removeProperty("--handoff-progress");
    ["title", "subtitle", "desktop", "app"].forEach(stage => {
      scene.style.removeProperty(`--handoff-${stage}`);
      scene.style.removeProperty(`--handoff-${stage}-filter`);
    });
    scene.classList.remove("is-handoff-ready");
  };
  const update = () => {
    const paintPlacements = placements.measure();
    const paintStories = stories.measure();
    let paintHeroSpacing = heroSpacing.reset;
    if (motionPreference.matches) { reset(); paintPlacements(); paintStories(); return; }
    try {
      const sourceScale = Number(window.getComputedStyle(origin).getPropertyValue("--hero-center-scale"));
      const sourceRect = origin.getBoundingClientRect();
      paintHeroSpacing = heroSpacing.measure(sourceRect);
      const targetRect = target.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const state = previewHandoff(sourceRect, targetRect, window.innerHeight, sourceScale);
      if (!state) { reset(); return; }
      const blurProgress = handoffBlurProgress(sourceRect, titleRect, state, sourceScale);
      if (blurProgress === null) { reset(); return; }
      const sharpness = handoffSharpness(blurProgress);
      traveler.style.setProperty("--preview-x", `${state.x}px`);
      traveler.style.setProperty("--preview-y", `${state.y}px`);
      traveler.style.setProperty("--preview-scale", String(state.scale));
      scene.style.setProperty("--handoff-progress", String(state.progress));
      Object.entries(handoffEntrances(state.progress)).forEach(([stage, progress]) => {
        scene.style.setProperty(`--handoff-${stage}`, String(progress));
        scene.style.setProperty(`--handoff-${stage}-filter`, sharpness[stage] === 1 ? "none" : `blur(${(1 - sharpness[stage]) * handoffBlurSettings.maxBlurPx}px)`);
      });
      scene.classList.add("is-handoff-ready");
    } catch {
      reset();
    } finally {
      paintPlacements();
      paintStories();
      paintHeroSpacing();
    }
  };
  const schedule = () => {
    if (motionPreference.matches || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  motionPreference.addEventListener("change", () => { reset(); placements.reset(); stories.reset(); schedule(); });
  const preview = origin.querySelector("video");
  preview?.addEventListener("loadedmetadata", schedule);
  preview?.addEventListener("resize", schedule);
  composition.querySelectorAll("img").forEach(img => img.addEventListener("load", schedule));
  update();
};
setupPreviewHandoff();
