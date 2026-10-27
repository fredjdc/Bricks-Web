(() => {
// Scroll is the only clock. These parameters control the new effect alone.
const WIND = Object.freeze({ count: 12, seed: 27027, stagger: .016, sourceAnchor: .68,
  targetAnchor: .5, startLine: .60, finishLine: .78, maxBaseSize: 40, sizeMultiplier: 2,
  entranceBlur: 18, blurApproachViewport: .18, blurApproachMinPx: 96, blurApproachMaxPx: 144,
  blurClearTitleFraction: .5, epsilon: 1e-6 });
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const mix = (a, b, p) => a + (b - a) * p;
const snap = value => value < WIND.epsilon ? 0 : value > 1 - WIND.epsilon ? 1 : value;

function makeWindFiles(seed = WIND.seed) {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const shuffle = () => {
    const slots = Array.from({ length: WIND.count }, (_, index) => index);
    for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
    return slots;
  };
  const columns = shuffle(), rows = shuffle();
  return Array.from({ length: WIND.count }, (_, index) => ({
    kind: ["video", "image", "audio"][index % 3],
    origin: { x: (index % 4 + .2 + random() * .6) / 4, y: (Math.floor(index / 4) + .2 + random() * .6) / 3 },
    target: { x: (columns[index] + .15 + random() * .7) / WIND.count, y: (rows[index] + .15 + random() * .7) / WIND.count },
    delay: index * WIND.stagger, phase: random() * Math.PI * 2, cycles: 1.15 + random() * .55,
    amplitude: .6 + random() * .45, angle: random() * 14 - 7, scale: .80 + random() * .10,
  }));
}
const WIND_FILES = makeWindFiles();

function windBlurRange(path, title, viewport) {
  if (!title || !Number.isFinite(title.top + title.height) || title.height <= 0) return null;
  const travel = path.end.y - path.start.y;
  if (travel <= 0) return null;
  const approach = clamp(viewport.height * WIND.blurApproachViewport, WIND.blurApproachMinPx, WIND.blurApproachMaxPx);
  const start = clamp((title.top - approach - path.start.y) / travel);
  const end = clamp((title.top + title.height * WIND.blurClearTitleFraction - path.start.y) / travel);
  return end > start ? { start, end } : null;
}

function windLayout(source, target, viewport, title) {
  const valid = box => box && [box.left, box.top, box.width, box.height].every(Number.isFinite) && box.width > 0 && box.height > 0;
  if (!valid(source) || !valid(target) || ![viewport.width, viewport.height].every(value => Number.isFinite(value) && value > 0)) return null;
  const motionSize = clamp(viewport.width * .045, 28, WIND.maxBaseSize);
  const size = motionSize * WIND.sizeMultiplier, padding = size * .8 + 8;
  if ([source, target].some(box => box.width <= padding * 2 || box.height <= padding * 2)) return null;
  const distance = target.top + target.height * WIND.targetAnchor - source.top - source.height * WIND.sourceAnchor
    + viewport.height * (WIND.startLine - WIND.finishLine);
  if (distance <= 0) return null;
  const progress = snap(clamp((viewport.height * WIND.startLine - source.top - source.height * WIND.sourceAnchor) / distance));
  const point = (box, normalized) => ({ x: box.left + padding + (box.width - padding * 2) * normalized.x,
    y: box.top + padding + (box.height - padding * 2) * normalized.y });
  const paths = WIND_FILES.map(file => {
    const path = { start: point(source, file.origin), end: point(target, file.target),
      amplitude: Math.min(56, motionSize * file.amplitude, source.width * .08, target.width * .08) };
    return { ...path, blurRange: windBlurRange(path, title, viewport) };
  });
  if (paths.some(path => path.end.y <= path.start.y)) return null;
  return { progress, size, motionSize, paths, viewport };
}

function windPose(layout, index) {
  const file = WIND_FILES[index], path = layout.paths[index];
  const p = snap(clamp((layout.progress - file.delay) / (1 - (WIND.count - 1) * WIND.stagger)));
  const envelope = Math.sin(Math.PI * p), wave = Math.PI * 2 * file.cycles * p + file.phase;
  const baseX = mix(path.start.x, path.end.x, smooth(p));
  const radius = layout.size * .72 + 4;
  const amplitude = Math.max(0, Math.min(path.amplitude, baseX - radius, layout.viewport.width - radius - baseX));
  const sway = Math.sin(wave) * amplitude * envelope;
  const x = baseX + sway;
  const y = mix(path.start.y, path.end.y, p) + Math.sin(wave * .8) * layout.motionSize * .18 * envelope;
  const opacity = p === 0 || p === 1 ? 0 : smooth(p / .12) * (1 - smooth((p - .78) / .22));
  const blur = path.blurRange ? WIND.entranceBlur * (1 - smooth((p - path.blurRange.start) / (path.blurRange.end - path.blurRange.start))) : 0;
  return { x, y, opacity, blur, sway, rotation: file.angle * (1 - p) + Math.sin(wave) * 9 * envelope,
    tilt: Math.cos(wave) * 11 * envelope, scale: file.scale + envelope * .08 };
}

function mountWindFiles(doc, win) {
  const overlay = doc.querySelector("[data-wind-files]");
  if (!overlay) return;
  const hide = () => { overlay.hidden = true; };
  hide();
  const source = doc.querySelector(".editor-desktop"), desktopTarget = doc.querySelector("#workflow-import-image");
  const mobileTarget = doc.querySelector('#workflow [data-workflow-step="import"] .mobile-workflow-media');
  // The heading wrapper is stable while its text runs its own entrance transform.
  const title = doc.querySelector("#workflow .workflow-heading");
  const frame = desktopTarget?.closest(".workflow-frame"), items = [...overlay.querySelectorAll("[data-wind-file]")];
  if (!source || items.length !== WIND.count || !win.MutationObserver || !win.requestAnimationFrame) return;
  const motion = win.matchMedia("(prefers-reduced-motion: reduce)"), desktop = win.matchMedia("(min-width: 900px)");
  let pending = 0;
  const update = () => {
    try {
      const target = desktop.matches ? desktopTarget : mobileTarget;
      if (motion.matches || !target?.getClientRects().length
        || desktop.matches && !frame?.classList.contains("is-active")) { hide(); return; }
      const layout = windLayout(source.getBoundingClientRect(), target.getBoundingClientRect(), { width: win.innerWidth, height: win.innerHeight }, title?.getBoundingClientRect());
      if (!layout || layout.progress === 0 || layout.progress === 1) { hide(); return; }
      const poses = items.map((_, index) => windPose(layout, index));
      // All reads precede writes. Nothing here changes the document's layout or media state.
      overlay.style.setProperty("--wind-size", `${layout.size}px`);
      poses.forEach((pose, index) => {
        const style = items[index].style;
        style.setProperty("--wind-x", `${pose.x}px`); style.setProperty("--wind-y", `${pose.y}px`);
        style.setProperty("--wind-angle", `${pose.rotation}deg`); style.setProperty("--wind-tilt", `${pose.tilt}deg`);
        style.setProperty("--wind-scale", String(pose.scale)); style.opacity = String(pose.opacity);
        style.setProperty("--wind-blur", `${pose.blur}px`);
      });
      overlay.hidden = !poses.some(pose => pose.opacity > 0);
    } catch { hide(); }
  };
  const schedule = () => {
    if (pending || motion.matches) return;
    pending = win.requestAnimationFrame(() => { pending = 0; update(); });
  };
  const invalidate = () => {
    if (motion.matches || desktop.matches && !frame?.classList.contains("is-active")) hide();
    schedule();
  };
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule); win.addEventListener("pageshow", schedule);
  motion.addEventListener("change", invalidate); desktop.addEventListener("change", invalidate);
  source.addEventListener("load", schedule);
  [desktopTarget, mobileTarget].forEach(image => image?.addEventListener("load", schedule));
  const observer = new win.MutationObserver(invalidate);
  if (frame) observer.observe(frame, { attributes: true, attributeFilter: ["class"] });
  update();
  return { update };
}

if (typeof document !== "undefined" && typeof window !== "undefined") mountWindFiles(document, window);
})();
