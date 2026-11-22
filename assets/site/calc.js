const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const previews = document.querySelectorAll(".calc-device, .calc-intro-panel");

let frame = 0;
function updatePreviews() {
    frame = 0;
    if (reducedMotion.matches) return;
    const viewport = window.innerHeight;
    for (const preview of previews) {
        const { top, bottom, height } = preview.getBoundingClientRect();
        if (bottom <= 0 || top >= viewport) continue;
        if (preview.classList.contains("calc-intro-panel")) {
            const offset = ((viewport - top) / (viewport + height) - .5) * 42;
            preview.style.setProperty("--calc-intro-offset", `${offset}px`);
        } else {
            const offset = ((top + height / 2) / viewport - .5) * 40;
            preview.style.setProperty("--calc-device-offset", `${Math.max(-40, Math.min(40, offset))}px`);
        }
    }
}

function schedulePreviews() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(updatePreviews);
}

window.addEventListener("scroll", schedulePreviews, { passive: true });
window.addEventListener("resize", schedulePreviews);
reducedMotion.addEventListener("change", schedulePreviews);
schedulePreviews();
