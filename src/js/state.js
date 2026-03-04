export const state = {};

export function initState() {
  state.windowHeight = window.innerHeight;
  state.windowOffset = window.scrollY;
}

export function updateState() {
  initState();
}
