import { getLenisInstance } from "./smooth-scroll";

// Vanilla-JS lightbox for the in-project masonry gallery. One shared
// overlay, rebuilt on every turbo:load (Turbo replaces <body>, so any
// previously-appended node is gone — same reasoning as hero-parallax.js).
// Document-level listeners persist across navigations and are attached once.
//
// Navigation wraps (last -> first, first -> last) rather than stopping at
// the ends.

let overlay, backdropEl, closeBtn, prevBtn, nextBtn, imageEl, captionEl, figureEl;
let listenersAttached = false;
let triggers = [];
let currentIndex = 0;
let lastFocused = null;
let touchStartX = null;

function buildOverlay() {
  const el = document.createElement("div");
  el.className = "lightbox";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Image viewer");
  el.inert = true;

  el.innerHTML = `
    <div class="lightbox-backdrop" data-lightbox-backdrop></div>
    <button type="button" class="lightbox-close" data-lightbox-close aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <button type="button" class="lightbox-prev" data-lightbox-prev aria-label="Previous image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg>
    </button>
    <button type="button" class="lightbox-next" data-lightbox-next aria-label="Next image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg>
    </button>
    <figure class="lightbox-figure">
      <img class="lightbox-image" data-lightbox-image alt="">
      <figcaption class="lightbox-caption" data-lightbox-caption></figcaption>
    </figure>
  `;

  document.body.appendChild(el);

  backdropEl = el.querySelector("[data-lightbox-backdrop]");
  closeBtn = el.querySelector("[data-lightbox-close]");
  prevBtn = el.querySelector("[data-lightbox-prev]");
  nextBtn = el.querySelector("[data-lightbox-next]");
  imageEl = el.querySelector("[data-lightbox-image]");
  captionEl = el.querySelector("[data-lightbox-caption]");
  figureEl = el.querySelector(".lightbox-figure");

  backdropEl.addEventListener("click", closeLightbox);
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => showImage(currentIndex - 1));
  nextBtn.addEventListener("click", () => showImage(currentIndex + 1));

  figureEl.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  figureEl.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 50) return;
      showImage(currentIndex + (delta < 0 ? 1 : -1));
    },
    { passive: true }
  );

  return el;
}

function showImage(index) {
  const count = triggers.length;
  currentIndex = ((index % count) + count) % count; // wrap both directions
  const trigger = triggers[currentIndex];

  const img = trigger.querySelector("img");
  imageEl.src = trigger.dataset.lightboxSrc;
  imageEl.alt = img ? img.alt : "";

  const figure = trigger.closest(".masonry-item");
  const caption = figure ? figure.querySelector("figcaption") : null;
  captionEl.textContent = caption ? caption.textContent : "";
  captionEl.hidden = !caption;

  const multiple = count > 1;
  prevBtn.hidden = !multiple;
  nextBtn.hidden = !multiple;
}

function openLightbox(trigger) {
  const grid = trigger.closest("[data-masonry]");
  if (!grid) return;

  triggers = Array.from(grid.querySelectorAll("[data-lightbox-trigger]"));
  currentIndex = triggers.indexOf(trigger);
  if (currentIndex === -1) return;

  showImage(currentIndex);

  lastFocused = document.activeElement;
  overlay.inert = false;
  overlay.classList.add("is-open");
  closeBtn.focus();

  document.body.classList.add("lightbox-open");
  getLenisInstance()?.stop();
}

function closeLightbox() {
  if (!overlay.classList.contains("is-open")) return;

  overlay.classList.remove("is-open");
  overlay.inert = true;

  document.body.classList.remove("lightbox-open");
  getLenisInstance()?.start();

  if (lastFocused) lastFocused.focus();
  lastFocused = null;
}

function handleKeydown(e) {
  if (!overlay || !overlay.classList.contains("is-open")) return;

  if (e.key === "Escape") {
    closeLightbox();
    return;
  }

  if (e.key === "ArrowLeft") {
    showImage(currentIndex - 1);
    return;
  }

  if (e.key === "ArrowRight") {
    showImage(currentIndex + 1);
    return;
  }

  if (e.key === "Tab") {
    const focusable = [closeBtn, prevBtn, nextBtn].filter((btn) => !btn.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function handleTriggerClick(e) {
  const trigger = e.target.closest("[data-lightbox-trigger]");
  if (!trigger) return;
  openLightbox(trigger);
}

export function initLightbox() {
  // Rebuilt every turbo:load — Turbo replaces <body>, so any previously
  // appended overlay node is already gone by the time this runs again.
  overlay = buildOverlay();

  // Defensive: never leave Lenis stopped across a fresh page load.
  getLenisInstance()?.start();

  if (listenersAttached) return;
  listenersAttached = true;

  document.addEventListener("click", handleTriggerClick);
  document.addEventListener("keydown", handleKeydown);
}
