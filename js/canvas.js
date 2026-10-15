// Small helpers shared by every canvas demo.

export const reducedMotion =
    matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reads a colour from the CSS custom properties in style.css, so the demos
// and the stylesheet share one palette.
export function cssColor(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
}

// A canvas has its own pixel size, separate from its CSS size. Matching it
// to the screen's pixel ratio keeps lines sharp on high-DPI displays.
export function fitCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width, height };
}

// Calls step(ms since last frame) on every animation frame, but only while
// the element is on screen, so off-screen demos cost nothing.
export function loopWhileVisible(element, step) {
    let visible = false;
    let last = 0;
    function frame(time) {
        if (!visible) return;
        // Clamped: after a hidden tab the gap can be minutes long.
        const elapsed = last ? Math.min(time - last, 100) : 16;
        last = time;
        step(elapsed);
        requestAnimationFrame(frame);
    }
    new IntersectionObserver((entries) => {
        const wasVisible = visible;
        visible = entries[0].isIntersecting;
        if (visible && !wasVisible) {
            last = 0;
            requestAnimationFrame(frame);
        }
    }).observe(element);
}

// Re-runs setup when the canvas width changes (phone rotation, resizing).
export function onResize(canvas, setup) {
    let width = canvas.clientWidth;
    let timer = null;
    window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (canvas.clientWidth !== width) {
                width = canvas.clientWidth;
                setup();
            }
        }, 200);
    });
}
