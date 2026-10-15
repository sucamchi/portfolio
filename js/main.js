// Page chrome: the tmux-style status bar and the hero prompt.
import { reducedMotion } from "./canvas.js";

// Highlight the status bar window for the section being read. The thin
// band in the middle of the screen decides which section counts as "current".
const bar = document.querySelector(".tmux-windows");
const windows = bar.querySelectorAll("a");
const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of windows) {
            const current = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", current);
            if (current) {
                link.setAttribute("aria-current", "true");
                // On phones the bar scrolls sideways; keep the current
                // window in view. Not scrollIntoView(): that can cancel
                // the page's own smooth scroll.
                bar.scrollLeft = link.offsetLeft - bar.clientWidth / 2;
            } else {
                link.removeAttribute("aria-current");
            }
        }
    }
}, { rootMargin: "-45% 0px -50% 0px" });
for (const link of windows) {
    observer.observe(document.querySelector(link.getAttribute("href")));
}

const clock = document.getElementById("clock");
function tickClock() {
    clock.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit",
    }) + " Málaga";
}
tickClock();
setInterval(tickClock, 20000);

// Types the hero command once. The text is already in the HTML, so
// nothing is lost if this script never runs.
const command = document.getElementById("hero-command");
if (!reducedMotion) {
    const text = command.textContent;
    command.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
        command.textContent = text.slice(0, ++i);
        if (i === text.length) clearInterval(timer);
    }, 70);
}
