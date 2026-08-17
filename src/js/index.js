import { initState, updateState } from "./state";
import { initStickyHeader, updateStickyHeader } from "./sticky-header";
import { initMobileMenu } from "./mobile-menu";
import { initMasonry } from "./masonry";
import { initSmoothScroll } from "./smooth-scroll";
import { initHeroParallax } from "./hero-parallax";
import { initLightbox } from "./lightbox";

// Page

document.addEventListener("turbo:load", initPage);

function initPage() {
  // State
  initState();

  // Sticky header
  initStickyHeader();

  // Responsive images
  document.querySelectorAll("img[data-srcset]").forEach((el) => {
    el.setAttribute("sizes", `${el.clientWidth}px`);
    el.setAttribute("srcset", el.dataset.srcset);
  });

  // Lightbox
  document.querySelectorAll("[data-block]:has([data-lightbox]").forEach(function (node) {
    GLightbox({
      selector: `[data-block="${node.dataset.block}"] a[data-lightbox]`,
      skin: "tablo",
      openEffect: "fade",
      closeEffect: "fade",
    });
  });

  // Mobile menu
  initMobileMenu();

  // Project gallery masonry
  initMasonry();
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Turbo !== "undefined") return;
  initPage();
});

// Events

window.addEventListener("scroll", function () {
  updateStickyHeader();
  updateState();
});

// Smooth scroll (Lenis)
document.addEventListener('turbo:load', initSmoothScroll)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initSmoothScroll()
})

// Hero parallax
document.addEventListener('turbo:load', initHeroParallax)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initHeroParallax()
})

// Lightbox (project gallery)
document.addEventListener('turbo:load', initLightbox)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initLightbox()
})

// Midnight header
function initMidnightHeader() {
  const header = document.querySelector('[data-js="midnightHeader"]')
  if (!header) return

  const hero = document.querySelector('.hero-section')
  if (!hero) return

  const check = () => {
    const heroBottom = hero.getBoundingClientRect().bottom
    if (heroBottom <= (window.innerHeight * 0.1)) {
      header.classList.add('is-light')
    } else {
      header.classList.remove('is-light')
    }
  }

  window.addEventListener('scroll', check, { passive: true })
  window.addEventListener('resize', check)
  check()
}

document.addEventListener('turbo:load', initMidnightHeader)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initMidnightHeader()
})

// Fade-in-on-scroll — shared by .gallery-item and .section-intro (each
// selector's own CSS drives what actually fades/staggers; this just
// toggles the trigger class via IntersectionObserver).
function initFadeObserver(selector) {
  const items = document.querySelectorAll(selector)
  if (!items.length) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting)
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' })

  items.forEach((item) => observer.observe(item))
}

function initFades() {
  initFadeObserver('.gallery-item')
  initFadeObserver('.section-intro')
  initFadeObserver('.masonry-item')
}

document.addEventListener('turbo:load', initFades)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initFades()
})