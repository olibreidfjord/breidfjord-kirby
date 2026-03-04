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
