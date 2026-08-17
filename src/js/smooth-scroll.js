import Lenis from "lenis";

let lenis;

export function getLenisInstance() {
  return lenis;
}

// Native (non-wrapper) mode only — Lenis drives the real window.scrollY via
// window.scrollTo() each frame rather than a transformed virtual-scroll
// container, so position:fixed/sticky and existing scroll-position reads
// (midnight header, sticky header, gallery fade) all keep working unchanged.
export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Turbo swaps <body> only — main.js and window persist across page
  // visits, so reuse the one instance and just remeasure content height
  // for the new page instead of creating a competing instance.
  if (lenis) {
    lenis.resize();
    return;
  }

  lenis = new Lenis({ autoRaf: true });
}
