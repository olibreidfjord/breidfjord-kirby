import { getLenisInstance } from "./smooth-scroll";

const IMAGE_FACTOR = 0.04;
const OVERLAY_FACTOR = 0.2;

let currentHandler = null;

export function initHeroParallax() {
  const lenis = getLenisInstance();

  // Always clear the previous page's listener first — main.js (and this
  // Lenis instance) persist across Turbo navigations, but the hero only
  // exists on the homepage, so a stale handler would otherwise keep
  // updating detached nodes from an earlier visit.
  if (lenis && currentHandler) {
    lenis.off('scroll', currentHandler);
    currentHandler = null;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  if (!lenis) return;

  const hero = document.querySelector('.hero-section');
  const img = document.querySelector('.hero-img');
  const overlay = document.querySelector('.hero-overlay');
  if (!hero || !img || !overlay) return;

  currentHandler = ({ scroll }) => {
    const offset = Math.min(Math.max(scroll, 0), hero.offsetHeight);
    img.style.transform = `translateY(${-offset * IMAGE_FACTOR}px) scale(1.08)`;
    overlay.style.transform = `translateY(${-offset * OVERLAY_FACTOR}px)`;
  };

  lenis.on('scroll', currentHandler);
}
