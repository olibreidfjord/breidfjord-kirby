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

// Nav colour switch on scroll
function initNavColorSwitch() {
  const navWrap = document.querySelector('.site-nav-wrap.has-hero')
  const heroSection = document.querySelector('.hero-section')
  if (!navWrap || !heroSection) return

  const getTriggerY = () => navWrap.getBoundingClientRect().height

  // Prefer IntersectionObserver (robust with different scroll containers).
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        // Flip earlier than "end of hero": when hero's bottom passes behind the nav.
        const triggerY = getTriggerY()
        const heroBottom = entry.boundingClientRect.bottom
        navWrap.classList.toggle("nav-dark", heroBottom <= triggerY)
      },
      { root: null, threshold: 0 }
    );
    io.observe(heroSection);
    return;
  }

  // Fallback for older browsers.
  const updateNav = () => {
    const heroBottom = heroSection.getBoundingClientRect().bottom
    const triggerY = getTriggerY()
    navWrap.classList.toggle('nav-dark', heroBottom <= triggerY)
  }

  window.addEventListener('scroll', updateNav, { passive: true })
  window.addEventListener('resize', updateNav)
  updateNav()
}

document.addEventListener("turbo:load", initNavColorSwitch);

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Turbo !== "undefined") return;
  initNavColorSwitch();
});