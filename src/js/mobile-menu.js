import { animate, stagger } from "animejs";
import { state } from "./state.js";

export function initMobileMenu() {
  state.isMobileMenuOpen = false;

  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const defaultProps = {
    easing: "easeInOutQuad",
    duration: 150,
  };

  const burgerSvg = mobileMenuToggle.querySelector("svg");
  const burgerLine1 = burgerSvg.querySelector("line:nth-child(1)");
  const burgerLine2 = burgerSvg.querySelector("line:nth-child(2)");
  const burgerLine3 = burgerSvg.querySelector("line:nth-child(3)");

  const menuOverlay = document.getElementById("mobile-menu-overlay");
  const allLinks = mobileMenu.querySelectorAll("a:not(.button)");
  const allButtons = mobileMenu.querySelectorAll("a.button");

  function animateIn() {
    // Burger button
    animate(burgerLine1, { x1: 3, x2: 21, y1: 3, y2: 21, ...defaultProps });
    animate(burgerLine2, { x1: 12, x2: 12, opacity: 0, ...defaultProps });
    animate(burgerLine3, { x1: 3, x2: 21, y1: 21, y2: 3, ...defaultProps });
    // Menu Overlay
    animate(menuOverlay, {
      opacity: [0, 1],
      ...defaultProps,
      duration: 100,
    });
    // Links
    animate(allLinks, {
      translateY: [10, 0],
      opacity: [0, 1],
      delay: stagger(50, { start: 50 }),
      ...defaultProps,
      duration: 100,
    });
    // Buttons
    animate(allButtons, {
      scale: [0.9, 1.05, 1],
      opacity: [0, 1],
      delay: stagger(50, { start: 250 }),
      ...defaultProps,
    });
  }

  function animateOut(cb) {
    // Burger button
    animate(burgerLine1, { x1: 2, x2: 22, y1: 6, y2: 6, ...defaultProps });
    animate(burgerLine2, { x1: 2, x2: 22, opacity: 1, ...defaultProps });
    animate(burgerLine3, { x1: 2, x2: 22, y1: 18, y2: 18, ...defaultProps });
    // Menu Overlay
    animate(menuOverlay, {
      opacity: 0,
      delay: 150,
      ...defaultProps,
      onComplete: cb,
    });
    // Links
    animate(allLinks, {
      translateY: -10,
      opacity: 0,
      delay: stagger(20),
      ...defaultProps,
      duration: 50,
    });
    // Buttons
    animate(allButtons, {
      scale: 0.8,
      opacity: 0,
      delay: stagger(20, { start: 50 }),
      ...defaultProps,
    });
  }

  function close() {
    document.body.style.removeProperty("overflow");
    animateOut(function () {
      mobileMenu.setAttribute("hidden", "");
    });
    state.isMobileMenuOpen = false;
  }

  // Toggle on burger button click
  mobileMenuToggle.addEventListener("click", (e) => {
    if (!state.isMobileMenuOpen) {
      // Show menu
      mobileMenu.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      animateIn();
      state.isMobileMenuOpen = true;
    } else {
      // Hide menu
      close();
    }
  });

  // Close on link click
  mobileMenu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });
}
