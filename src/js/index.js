import { initState, updateState } from "./state";
import { initStickyHeader, updateStickyHeader } from "./sticky-header";
import { initMobileMenu } from "./mobile-menu";

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

// Hero scroll animation
const heroWrap = document.querySelector('.hero-image-wrap')
const heroOverlay = document.querySelector('.hero-overlay')

if (heroWrap) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY
    const vh = window.innerHeight
    const progress = Math.min(scrollY / vh, 1)
    const scale = 1 - (progress * 0.15)
    heroWrap.style.transform = `scale(${scale})`
    if (heroOverlay) {
      heroOverlay.style.opacity = Math.max(1 - (progress * 2), 0)
    }
  }, { passive: true })
}

// Midnight header
function initMidnightHeader() {
  const header = document.querySelector('[data-js="midnightHeader"]')
  if (!header) return

  const hero = document.querySelector('.hero-section')
  if (!hero) return

  // Set header height CSS var
  const h = header.offsetHeight
  header.style.setProperty('--midnight-header-height', `${h}px`)

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