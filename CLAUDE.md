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
- `src/js/index.js` — custom JS. Hero scroll animation and any interaction code live here, appended after the theme's own init code.
- `site/plugins/tablo-theme/templates/*.twig` — page templates. `default.twig` is the wrapper (header, hero, nav, footer); `home.twig` and `project.twig` extend it.
- `site/plugins/tablo-theme/blueprints/` — panel field definitions (YAML). Site-wide fields are in `tabs/site-layout.yml`.
- `content/` — Kirby content as flat text files. Tracked in git, but treat as data (see workflow rules below).

## Key conventions established on this project

- **Hero** is set globally in the panel (Site → Layout → Hero): `hero` image, `hero_title` (line 1), `hero_title_line2` (line 2), `hero_subtitle`. Title fields are `type: text` — do NOT change them to `textarea`, it silently breaks the panel's Layout tab. Line breaks are handled by the separate line-2 field plus `white-space: pre-line`.
- **Hero only renders on the homepage** — the template guards with `page.isHomePage`.
- **Nav colour** uses two stacked layers (`.midnight-white` / `.midnight-black`) that swap on scroll via JS, giving crisp white-over-hero and black-over-content. Do not reintroduce `mix-blend-mode` for this — it was tried and produced muddy greys over photos.
- **Colours**: text `#ffffff`, background `#121d12` (dark green). Font is **Bellefair** (Google Fonts), all-caps for headings/nav.
- **Always confirm numeric values** (hex, measurements, timings, dates) explicitly before applying — call them out rather than assuming they're right.

## Workflow — two separate tracks

**Code track (this is where you help):** edit source → `npm run build` → commit → `git push`. Pushing to `main` triggers a GitHub Action that SSHes to the server and auto-deploys to `kirby.breidfjord.com`. Never edit files directly on the server.

**Content track (NOT git, do not attempt):** project text, images, hero fields are added by the user in the Kirby panel on the live site. These are content changes and live outside the code workflow. Don't try to add or edit real content via the repo.

## Deploy / environments

- `breidfjord.com` and `www` → static holding page ("We're working on it"). Not the real site yet.
- `kirby.breidfjord.com` → the live site (auto-deploys from `main`).
- `https://breidfjord.test` → local dev (Valet).
- Config: `site/config/config.php` sets the site URL dynamically from the request host; the `.test` local override is `config.breidfjord.test.php` (gitignored). Don't hardcode a single URL.

## Things NOT to do

- Don't edit compiled assets, or files on the production server directly.
- Don't reproduce or commit secrets/tokens. The deploy uses an SSH key, not a token in the repo.
- Don't restructure the Tablo plugin wholesale; extend it.
- Don't give diet/medical/financial advice etc. — irrelevant here, just build the site.
- Do NOT attempt to screenshot, render, or visually verify pages (no chromium, Playwright, or headless-browser tooling). The user reviews visual results in their own browser at breidfjord.test. Make the code change, run the build, and stop.

## Health check before committing

Run `npm run build` and confirm it completes with no errors, then review the diff. If a change spans a blueprint AND a template AND CSS (e.g. a new field), make sure all three are updated together — a blueprint field with no template output does nothing.
