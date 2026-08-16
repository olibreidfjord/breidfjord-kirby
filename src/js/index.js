import { initState, updateState } from "./state";
import { initStickyHeader, updateStickyHeader } from "./sticky-header";
import { initMobileMenu } from "./mobile-menu";
import { initMasonry } from "./masonry";

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

// Gallery item fade
function initGalleryFade() {
  const items = document.querySelectorAll('.gallery-item')
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

document.addEventListener('turbo:load', initGalleryFade)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Turbo !== 'undefined') return
  initGalleryFade()
})