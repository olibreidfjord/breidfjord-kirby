// Use the same displayed fields as the gallery, with real text separators.
// textContent alone joins adjacent block-level spans without adding spaces.
export function getArtworkCaptionText(caption) {
  if (!caption) return "";

  const normalise = (text) => text.replace(/\s+/gu, " ").trim();
  const parts = Array.from(caption.querySelectorAll("[data-caption-part]"))
    .map((part) => normalise(part.textContent))
    .filter(Boolean);

  return parts.length
    ? parts.join(" · ")
    : normalise(caption.textContent);
}
