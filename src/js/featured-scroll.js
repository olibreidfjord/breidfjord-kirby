import { getLenisInstance } from "./smooth-scroll";

// Featured works (home): the section pins centred on screen and scrolling
// down moves the row sideways. Only on wide screens with a fine pointer and
// no reduced-motion setting; everywhere else the row stays a plain
// sideways-scrolling strip (see .featured in index.css).
const WIDE = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const STILL = "(prefers-reduced-motion: reduce)";

// Pixels the row moves across per pixel scrolled down. Lower is slower.
const SPEED = 0.6;

// Once pinned, the row waits this share of the screen height before it
// moves, and again after the last tile, so the pin settles in and out
// instead of snapping straight into motion.
const HOLD = 0.15;

// Closest the pinned section may sit to the top: clears the fixed header.
const HEADER = 96;

// Eases in and out at the ends of the run, linear-ish in the middle.
const ease = (u) => 0.5 * u + 0.25 * (1 - Math.cos(Math.PI * u));

const unease = (v) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < v) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

let cleanup = null;

export function initFeaturedScroll() {
  // Turbo keeps this module alive across visits: drop the last page's setup.
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const section = document.querySelector("[data-featured]");
  if (!section) return;
  const sticky = section.querySelector(".featured-sticky");
  const viewport = section.querySelector("[data-featured-viewport]");
  const track = section.querySelector("[data-featured-track]");
  if (!sticky || !viewport || !track) return;

  const wide = window.matchMedia(WIDE);
  const still = window.matchMedia(STILL);
  let pinned = false;
  let distance = 0; // how far the row travels sideways
  let run = 0; // scroll spent moving the row
  let hold = 0; // scroll spent waiting at each end
  let pinTop = HEADER;
  let frame = 0;

  // Scroll progress (px) since the section pinned.
  const scrolled = () => pinTop - section.getBoundingClientRect().top;

  const update = () => {
    frame = 0;
    if (!pinned) return;
    const u = run > 0 ? Math.min(Math.max((scrolled() - hold) / run, 0), 1) : 0;
    viewport.scrollLeft = 0; // focus can nudge an overflow:hidden box; keep it at 0
    track.style.transform = `translate3d(${-ease(u) * distance}px, 0, 0)`;
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const unpin = () => {
    pinned = false;
    section.classList.remove("is-pinned");
    section.style.height = "";
    sticky.style.top = "";
    track.style.transform = "";
  };

  const measure = () => {
    if (!wide.matches || still.matches) {
      unpin();
      getLenisInstance()?.resize();
      return;
    }
    section.classList.add("is-pinned");
    pinned = true;
    const height = sticky.offsetHeight;
    pinTop = Math.max(HEADER, Math.round((window.innerHeight - height) / 2));
    sticky.style.top = `${pinTop}px`;
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    run = Math.ceil(distance / SPEED);
    hold = Math.round(window.innerHeight * HOLD);
    section.style.height = `${height + hold * 2 + run}px`;
    getLenisInstance()?.resize();
    update();
  };

  // Keyboard: tabbing to a tile that is off to the side scrolls the page
  // to the point where the row shows it.
  const onFocus = (event) => {
    if (!pinned || distance === 0) return;
    const tile = event.target.closest(".featured-tile");
    if (!tile) return;
    viewport.scrollLeft = 0;
    const view = viewport.getBoundingClientRect();
    const box = tile.getBoundingClientRect();
    if (box.left >= view.left && box.right <= view.right) return;
    const offset = box.left - track.getBoundingClientRect().left;
    const target = Math.min(Math.max(offset, 0), distance);
    const wanted = hold + unease(target / distance) * run;
    const top = window.scrollY + (wanted - scrolled());
    const lenis = getLenisInstance();
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo(0, top);
  };

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", measure);
  wide.addEventListener("change", measure);
  still.addEventListener("change", measure);
  section.addEventListener("focusin", onFocus);
  measure();

  cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("load", measure);
    wide.removeEventListener("change", measure);
    still.removeEventListener("change", measure);
    section.removeEventListener("focusin", onFocus);
    if (frame) cancelAnimationFrame(frame);
    clearTimeout(resizeTimer);
    unpin();
  };
}
