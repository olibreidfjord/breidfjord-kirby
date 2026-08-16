// CSS Grid row-span masonry. Items stay in normal document/grid-flow order —
// only grid-row-end is set, nothing is reparented — so DOM order, tab order
// and caption/image pairing are untouched. See src/css/index.css for the
// matching .masonry-grid / .masonry-item rules and the native-masonry swap note.

export function initMasonry() {
  document.querySelectorAll("[data-masonry]").forEach(setupGrid);
}

function setupGrid(grid) {
  const items = Array.from(grid.querySelectorAll(":scope > [data-masonry-item]"));
  if (!items.length) return;

  let scheduled = false;
  function scheduleLayout() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      layout(grid, items);
    });
  }

  items.forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;
    if (img.complete) return;
    img.addEventListener("load", scheduleLayout, { once: true });
    img.addEventListener("error", scheduleLayout, { once: true });
  });

  new ResizeObserver(scheduleLayout).observe(grid);

  scheduleLayout();
}

function layout(grid, items) {
  const styles = getComputedStyle(grid);
  const rowHeight = parseFloat(styles.getPropertyValue("grid-auto-rows")) || 1;
  const rowGap = parseFloat(styles.getPropertyValue("row-gap")) || 0;

  items.forEach((item) => {
    const height = item.getBoundingClientRect().height;
    const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = `span ${span}`;
  });
}
