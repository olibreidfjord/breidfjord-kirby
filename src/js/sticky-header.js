import clamp from "clamp";
import { state } from "./state";

export function initStickyHeader() {
  state.stickyHeader = document.querySelector("body > header.sticky");
  if (!state.stickyHeader) return;
  state.stickyHeaderHeight =
    state.stickyHeader.offsetHeight || state.stickyHeader.querySelector("*").offsetHeight;
  state.stickyHeaderOffset = 0;
}

export function updateStickyHeader() {
  if (!state.stickyHeader) return;
  const offset = window.scrollY - state.windowOffset;
  state.stickyHeaderOffset = clamp(state.stickyHeaderOffset + offset, 0, state.stickyHeaderHeight);
  state.stickyHeader.style.top = `-${state.stickyHeaderOffset}px`;
}
