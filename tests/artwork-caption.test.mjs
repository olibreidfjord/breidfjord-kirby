import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// Load the standalone module without changing the project's package/module type.
const source = readFileSync(new URL("../src/js/artwork-caption.js", import.meta.url), "utf8");
const { getArtworkCaptionText } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const caption = (parts, textContent = parts.join("")) => ({
  textContent,
  querySelectorAll: () => parts.map((textContent) => ({ textContent })),
});

test("separates adjacent title, size, location and year", () => {
  assert.equal(getArtworkCaptionText(caption(["Dýrð-Vald-Virðing", "860 x 190 cm", "Hallgrímskirkja", "1999"])), "Dýrð-Vald-Virðing · 860 x 190 cm · Hallgrímskirkja · 1999");
});
test("omits empty fields and normalises whitespace", () => {
  assert.equal(getArtworkCaptionText(caption([" Bústaðakirkja,\n Reykjavík ", " ", "1982–98"])), "Bústaðakirkja, Reykjavík · 1982–98");
});
test("handles single, missing and whitespace-only captions", () => {
  assert.equal(getArtworkCaptionText(caption(["Fossvogur Chapel"])), "Fossvogur Chapel");
  assert.equal(getArtworkCaptionText(null), "");
  assert.equal(getArtworkCaptionText(caption([], " \n ")), "");
});
test("supports legacy plain-text captions", () => {
  assert.equal(getArtworkCaptionText(caption([], "  Window, 1983  ")), "Window, 1983");
});
test("returns literal text without interpreting markup", () => {
  assert.equal(getArtworkCaptionText(caption(["<script>alert('x')</script>", "A & B"])), "<script>alert('x')</script> · A & B");
});
test("has no stale caption across next, previous and reopening", () => {
  const a = caption(["Bústaðakirkja", "1982–1986"]);
  const b = caption(["Window", "24 × 32 cm"]);
  for (const [input, expected] of [[a, "Bústaðakirkja · 1982–1986"], [b, "Window · 24 × 32 cm"], [null, ""], [b, "Window · 24 × 32 cm"], [a, "Bústaðakirkja · 1982–1986"]]) {
    assert.equal(getArtworkCaptionText(input), expected);
  }
});

test("viewer updates captions through navigation, close and reopening", async () => {
  const { build } = await import("esbuild");
  const { runInNewContext } = await import("node:vm");
  const bundled = await build({
    entryPoints: [new URL("../src/js/lightbox.js", import.meta.url).pathname],
    bundle: true, write: false, platform: "node", format: "cjs",
    plugins: [{
      name: "stub-scroll-controller",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/smooth-scroll$/ }, () => ({ path: "scroll", namespace: "test" }));
        builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: "export const getLenisInstance = () => null;" }));
      },
    }],
  });
  const listeners = new Map();
  let focused;
  const element = () => {
    const classes = new Set();
    return {
      hidden: false, textContent: "", events: {},
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
      setAttribute() {},
      focus() { focused = this; },
      addEventListener(name, callback) { this.events[name] = callback; },
    };
  };
  const parts = Object.fromEntries(["backdrop", "close", "prev", "next", "image", "caption"].map((name) => [`[data-lightbox-${name}]`, element()]));
  parts[".lightbox-figure"] = element();
  const overlay = element();
  overlay.querySelector = (selector) => parts[selector];
  const doc = {
    body: { ...element(), appendChild() {} },
    get activeElement() { return focused; },
    createElement: () => overlay,
    addEventListener(name, callback) { listeners.set(name, callback); },
  };
  const module = { exports: {} };
  runInNewContext(bundled.outputFiles[0].text, { module, exports: module.exports, document: doc });
  module.exports.initLightbox();
  const captions = [caption(["Bústaðakirkja", "1982–1986"]), caption(["Window", "24 × 32 cm"]), null];
  const triggers = captions.map((text, i) => ({
    ...element(), dataset: { lightboxSrc: `image-${i}.jpg` },
    querySelector: () => ({ alt: `Artwork ${i}` }),
    closest: (selector) => selector === "[data-masonry]" ? { querySelectorAll: () => triggers } : { querySelector: () => text },
  }));
  const click = (trigger) => {
    focused = trigger;
    listeners.get("click")({ target: { closest: () => trigger } });
  };
  const displayed = parts["[data-lightbox-caption]"];
  click(triggers[0]);
  assert.equal(displayed.textContent, "Bústaðakirkja · 1982–1986");
  assert.equal(displayed.hidden, false);
  parts["[data-lightbox-next]"].events.click();
  assert.equal(displayed.textContent, "Window · 24 × 32 cm");
  parts["[data-lightbox-next]"].events.click();
  assert.equal(displayed.textContent, "");
  assert.equal(displayed.hidden, true);
  parts["[data-lightbox-next]"].events.click();
  assert.equal(displayed.textContent, "Bústaðakirkja · 1982–1986");
  listeners.get("keydown")({ key: "ArrowLeft" });
  assert.equal(displayed.hidden, true);
  parts["[data-lightbox-prev]"].events.click();
  assert.equal(displayed.textContent, "Window · 24 × 32 cm");
  listeners.get("keydown")({ key: "Escape" });
  assert.equal(overlay.classList.contains("is-open"), false);
  assert.equal(focused, triggers[0]);
  click(triggers[1]);
  assert.equal(displayed.textContent, "Window · 24 × 32 cm");
  assert.equal(overlay.classList.contains("is-open"), true);
  parts["[data-lightbox-close]"].events.click();
  assert.equal(overlay.classList.contains("is-open"), false);
  assert.equal(focused, triggers[1]);
});
