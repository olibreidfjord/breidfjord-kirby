# CLAUDE.md — breidfjord-kirby

Project memory for the Leifur Breidfjord portfolio site. Read this at the start of every session.

## What this is

Portfolio site for **Leifur Breidfjord**, Icelandic stained glass artist. Built on **Kirby CMS 5** using a purchased **Tablo** theme (heavily customised). One of three artist-portfolio sites sharing the same stack; the others are `olafurbreidfjord.com` and (planned) `thisisdongzi.com`.

British English throughout. Preserve Icelandic characters correctly (ð, þ, æ, ö, á, é) — never transliterate them.

## Stack

- **Kirby CMS 5** (flat-file, no database)
- **Tablo theme** — lives in `site/plugins/tablo-theme/`, uses **Twig** templates (not plain PHP)
- **Tailwind CSS v4** + **esbuild**, compiled via npm scripts
- **Node** for the build only; Kirby itself runs on PHP 8.3
- Local dev via **Laravel Valet** at `https://breidfjord.test`

## Build — ALWAYS required after CSS/JS changes

Source files are `src/css/index.css` and `src/js/index.js`. They are NOT served directly — they compile to `site/plugins/tablo-theme/assets/`. After any edit to those source files, run:

```
npm run build
```

During active styling work, prefer the watcher so rebuilds are automatic:

```
npm run dev:css
```

Never edit the compiled `site/plugins/tablo-theme/assets/main.css` or `main.js` directly — they are generated and will be overwritten.

## Repo layout (the parts that matter)

- `src/css/index.css` — all custom styles. The `@theme` block holds colours/tokens. **Do not put `color-mix()` inside `@theme`** — Tailwind v4 rejects it; use a literal value.
- `src/js/index.js` — custom JS, wired through an `initPage()` entry point. Currently handles the gallery fade (`initGalleryFade`), the masonry layout (`initMasonry`, see below), and the mobile menu. Appended after the theme's own init code.
- `src/js/masonry.js` — the vanilla-JS masonry engine for inside-category galleries (see Key conventions).
- `site/plugins/tablo-theme/templates/*.twig` — page templates. `default.twig` is the wrapper (header, hero, nav, footer); `project.twig`, `folder.twig`, `text.twig` and others extend/compose it. Not an exhaustive list — check the folder.
- `site/plugins/tablo-theme/snippets/*.twig` — reusable partials, incl. `works-grid.twig` (the masonry grid instantiation) and the block snippets.
- `site/plugins/tablo-theme/blueprints/` — panel field definitions (YAML). Site-wide fields are in `tabs/site-layout.yml`. File-level blueprints (e.g. per-image caption) are in `blueprints/files/`.
- `content/` — Kirby content as flat text files. **Currently tracked in and deployed via git** — see the workflow section for the important consequences of that.

## Key conventions established on this project

- **Hero** is set globally in the panel (Site → Layout → Hero): `hero` image, `hero_title` (line 1), `hero_title_line2` (line 2), `hero_subtitle`. Title fields are `type: text` — do NOT change them to `textarea`, it silently breaks the panel's Layout tab. Line breaks are handled by the separate line-2 field plus `white-space: pre-line`.
- **Hero only renders on the homepage** — the template guards with `page.isHomePage`.
- **Header / nav**: a single `.midnight-header` element with a fading site-title `<figure>` that fades on scroll. Header height is handled in CSS (not JS-measured). Do NOT use `mix-blend-mode` on the header — it was tried and produced muddy greys over photos. (This replaces an earlier two-layer `.midnight-white` / `.midnight-black` scroll-swap approach, which is gone — do not reintroduce it.)
- **Category-level layout** (the 8 works on the homepage and Works page): a curated scattered "gallery-hang" layout using per-project offset fields (`layout_offset` / span / pull / depth on `project.yml`), output as CSS variables — column offset + negative margin + z-index. Deliberately authored per project, not random. Collapses to a clean single column on mobile.
- **Inside-category galleries** (e.g. the ~23 oil paintings within a category, count grows over time): a **JS masonry layout** — `masonry.js` measures items and sets grid row-spans; `.masonry-grid` / `.masonry-item` in `index.css` (1 col mobile, 2 at md/768px, 3 at xl/1280px, capped at `max-w-7xl`). Built with the CSS-Grid row-span technique and explicitly commented as the drop-in path to native `grid-template-rows: masonry` (CSS Grid Lanes) once that reaches Baseline. No library, no DOM reordering (preserves reading order for captions). Handles async image loading. Do NOT use the CSS `column-count` hack — it breaks reading order.
- **Per-image captions**: come from a free-text `Caption` field on the `gallery-image` file blueprint (`blueprints/files/gallery-image.yml`), output as `<figcaption>` inside the same `<figure>` as the image so caption and artwork travel together. New gallery uploads get the field automatically via `template: gallery-image` on the project media field. Caption *text* is entered per-image (content, not code).
- **Colours**: text `#ffffff`, background `#121d12` (dark green). Headings/nav all-caps. (Typography has evolved during the redesign — check `index.css` `@theme` for current font tokens rather than assuming.)
- **Always confirm numeric values** (hex, measurements, timings, dates) explicitly before applying — call them out rather than assuming they're right.

## Workflow — content AND code both deploy via git (current phase)

**Current model (initial build-out, Oli authoring solo):** both code AND content are committed to git and deployed together. Local `breidfjord.test` is the single source of truth. Editing flow: make changes locally (code and/or content) → commit → `git push` to `main` → the GitHub Action pulls, builds, clears the Twig cache, and deploys to `kirby.breidfjord.com`. Both environments stay in sync because everything travels through git.

This means content (project text, folder structure/ordering, category organisation, sidecar `.txt` files) IS committed during this phase — a deliberate override of the usual Kirby "content lives only in the panel" convention, chosen so Oli can build out the real content locally and push it live without rebuilding it by hand on the server.

**CRITICAL consequence:** the deploy runs `git reset --hard origin/main`, which OVERWRITES the server's files with whatever is in git. So while content is in git, **any content edited directly in the server panel at kirby.breidfjord.com will be WIPED on the next push.** During this phase, ALL content edits must happen locally and be pushed — never edit content in the server panel, or it will be lost.

**Future switch (when Leifur takes over editing):** once the initial content is complete and Leifur begins adding/editing works via the server panel, this model MUST change — content editing moves to the server panel, and only CODE is pushed from local. At that point:
- Stop committing `content/` changes from local.
- The deploy must stop running `git reset --hard` against the content directory (e.g. add `content/` to a deploy-time exclude, or change the deploy so it doesn't hard-reset content), so server-side panel edits survive deploys.
- Update this file to describe the code-only push model.

Flag this to Oli whenever content-handover to Leifur comes up — it is a hard switch, and getting it wrong means Leifur's panel edits get overwritten by a code push.

## Deploy pipeline (reference)

Push to `main` → GitHub Action (`.github/workflows/deploy.yml`) SSHes to the server (dedicated passphrase-less deploy key stored as a GitHub secret — NOT a token in the repo, NOT Oli's personal SSH key) → `git fetch` + `git reset --hard origin/main` → `npm install` → `npm run build` → `rm -rf site/cache/twig`. That last step matters: in production Twig's `auto_reload` is off, so without clearing the compiled Twig cache the server serves stale HTML even after new templates deploy. If live ever shows old markup with new CSS/JS, that cache is the first suspect (and the deploy step should already handle it). Deploy target: `/home/oli40/web/breidfjord.com/public_html`, served at `kirby.breidfjord.com`.

## Things NOT to do

- Don't edit compiled assets, or files on the production server directly.
- Don't reproduce or commit secrets/tokens. The deploy uses an SSH key, not a token in the repo.
- Don't restructure the Tablo plugin wholesale; extend it.
- Don't give diet/medical/financial advice etc. — irrelevant here, just build the site.
- Do NOT attempt to screenshot, render, or visually verify pages (no chromium, Playwright, or headless-browser tooling). The user reviews visual results in their own browser at `breidfjord.test`. Make the code change, run the build, and stop.

## Health check before committing

Run `npm run build` and confirm it completes with no errors, then review the diff. If a change spans a blueprint AND a template AND CSS (e.g. a new field), make sure all three are updated together — a blueprint field with no template output does nothing. Commit related work in logical groups (e.g. captions separate from masonry separate from redesign) so any one piece can be reverted cleanly.
