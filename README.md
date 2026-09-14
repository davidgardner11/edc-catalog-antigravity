# Top 20 EDC Backpacks — Everyday Carry Catalog App

A single-page application (SPA) static catalog of 20 curated Everyday Carry (EDC) backpacks. Each backpack card has an image carousel, a title band, and a data bar (color swatches, lowest price + retailer, review score). Clicking a card opens a quick-view modal with full specs, all colorways, and direct links to retailers.

The project was scaffolded from an AI-generated implementation plan (see [`edc-catalog-app-antigravity-implementation-plan.md`](./edc-catalog-app-antigravity-implementation-plan.md)) and then iterated on. During implementation and testing, some revisions occurred. The README below describes what functionality actually exists new.

## What the app does

- **Catalog grid** — 20 backpacks in a responsive grid (1 / 2 / 3 columns at mobile / tablet / desktop). Cards are `aspect-[5/7]`, 260–420 px wide. Each card is keyboard-focusable (`role="button"`, Enter/Space opens the modal).
- **Three-tier card layout**
  - Top 65 %: image carousel (5 photos per pack). Hovering reveals left/right half-click zones (real `<button>`s with `aria-label`s, ArrowLeft/ArrowRight supported) that loop infinitely; pagination dots show the active image and a visually hidden live region announces "Image N of M". Packs with no images fall back to `/images/placeholder.webp`.
  - Middle 15 %: brand + model name.
  - Bottom 20 %: three partitions — a 3×3 color-swatch grid, lowest price in USD with retailer, and review score with source (e.g. `4.8/5.0 · Pack Hacker`).
- **Color swatch pagination** — packs with ≤ 9 colorways show all swatches (empty cells render as dashed placeholder circles to keep alignment). Packs with > 9 colorways show 8 per page plus a `>` button in slot 9 that loops through pages. Each swatch is a labelled `<button>`; the colorway-name tooltip appears on hover or focus and toggles on click/tap. 7 of the 20 packs exercise the pagination path.
- **Sticky header** with live search (matches name, brand, material, description), brand dropdown filter, sort selector (featured / price ↑↓ / rating / capacity / brand A–Z), and a dark-mode toggle.
- **Quick-view modal** — a proper `role="dialog"` (`aria-modal`, `aria-labelledby`, focus trap, Escape to close, body scroll lock, focus restored on close) with a larger image and thumbnail strip, description, spec grid (capacity, price, material, dimensions, rating, weight), "Shop At" retailer links with a "Best Price" badge, and the full colorway list.
- **Best Price derivation** — `lowestPriceUSD`, `primaryRetailer` and every offer's `isLowestPrice` flag are recomputed from `retailers[]` at load time (`normalizeBackpack()` in `useBackpackCatalog.ts`), so the card, modal, and badge can never disagree with each other.
- **Empty state** with a reset button when filters match nothing; a "Reset all filters" link appears in the intro banner whenever any filter is active.
- **Dark mode** via Tailwind's `class` strategy (toggled on `<html>`). The choice is persisted to `localStorage` (`edc-theme`); with no stored choice the app follows `prefers-color-scheme`, including live OS changes. An inline script in `index.html` applies the class before first paint so there is no flash.

All data is static and ships with the bundle; there is no backend, API call, or runtime fetch.

## End-to-end data flow

How a backpack goes from a curated pick to a card on screen. The first three stages are offline, one-shot steps that produce files committed to the repo; only the last stage runs in the browser.

```mermaid
flowchart TD
    subgraph collect["1 · Collect"]
        plan["Implementation plan<br/>Top-20 curated list"]
        json0["src/data/backpacks.json<br/>id · brand · name · capacity<br/>price · review · colorways"]
        bing["download-real-backpack-photos.py<br/>Bing Image Search scrape"]
        jpgs["public/images/backpacks/&lt;id&gt;/1-5.jpg"]
        plan --> json0
        json0 -- "brand + model queries" --> bing
        bing --> jpgs
        bing -- "rewrites images[]" --> json0
    end

    subgraph enrich["2 · Enrich"]
        retail["add-retailers-data.py<br/>hard-coded retailer map"]
        json1["backpacks.json + retailers[]<br/>name · priceUSD · url · isLowestPrice"]
        json0 --> retail --> json1
    end

    subgraph prepare["3 · Prepare & verify"]
        verify["npm run verify<br/>verify-catalog.mjs"]
        tests["npm test · npm run test:e2e<br/>Vitest + Playwright"]
        build["npm run build<br/>vue-tsc + vite build"]
        dist["dist/<br/>static bundle + images"]
        json1 --> verify
        jpgs --> verify
        verify --> build
        tests --> build
        build --> dist
    end

    subgraph present["4 · Present (browser runtime)"]
        load["useBackpackCatalog()<br/>imports JSON at module load"]
        norm["normalizeBackpack()<br/>derive lowestPriceUSD ·<br/>isLowestPrice · primaryRetailer"]
        state["search · brand filter · sort<br/>dark-mode preference"]
        navbar["CatalogNavbar"]
        grid["BackpackCard grid<br/>5:7 playing cards"]
        carousel["CardCarousel"]
        bar["CardBottomBar<br/>ColorGrid · PriceRetailer · ReviewScore"]
        modal["BackpackModal<br/>specs · Shop At · colorways"]
        dist --> load --> norm --> state
        state <--> navbar
        state --> grid
        grid --> carousel
        grid --> bar
        grid -- "click / Enter" --> modal
        jpgs -. "served from /images" .-> carousel
        jpgs -. "served from /images" .-> modal
    end

    classDef file fill:#f5f5f4,stroke:#a8a29e,color:#1c1917
    classDef script fill:#e0f2fe,stroke:#38bdf8,color:#0c4a6e
    classDef runtime fill:#ecfdf5,stroke:#34d399,color:#064e3b
    class json0,json1,jpgs,dist,plan file
    class bing,retail,verify,tests,build script
    class load,norm,state,navbar,grid,carousel,bar,modal runtime
```

Notes on the pipeline:

- **Collect** — the 20 picks and their base specs were hand-authored from the implementation plan; photos were fetched by `download-real-backpack-photos.py`, which also rewrites each record's `images[]` to the downloaded JPG paths. (An earlier `generate-assets.mjs` step produced SVG placeholders; those have since been removed.)
- **Enrich** — `add-retailers-data.py` merges a per-pack `retailers[]` array (name, price, URL, best-price flag) into the JSON.
- **Prepare & verify** — `verify-catalog.mjs` checks record shape, that every referenced image and static asset exists on disk, and that `lowestPriceUSD` / `isLowestPrice` / `primaryRetailer` agree with the retailer offers. The unit and e2e suites pin behaviour; `vue-tsc` + Vite produce the static `dist/`.
- **Present** — at runtime the JSON is imported statically, passed through `normalizeBackpack()` so the Best Price fields can never drift from `retailers[]`, then filtered/sorted by `useBackpackCatalog` and rendered by the card grid and modal. Nothing is fetched from a network at runtime except the images and the Inter font.

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | [Vue 3](https://vuejs.org/) (`^3.5`) with `<script setup>` + Composition API | Single root component, no router, no Pinia |
| Language | TypeScript (`^5.7`), `strict: true` | Type-checked with `vue-tsc` as part of `npm run build` |
| Build | [Vite 6](https://vite.dev/) + `@vitejs/plugin-vue` | Dev server on port **3000**; `@` alias → `src/` |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS + Autoprefixer | Custom `shadow-card` / `shadow-card-hover`, `aspect-poker`, Inter font stack |
| Font | Inter via Google Fonts `<link>` in `index.html` | Falls back to system sans |
| Icons | Inline SVG | `vue` is the only runtime dependency |
| Data | `src/data/backpacks.json` imported directly (`resolveJsonModule`) | 20 records, typed by `src/types/backpack.ts`; normalised at load time |
| Images | `public/images/backpacks/<id>/1..5.jpg` | ~23 MB of JPEGs; `public/images/placeholder.webp` is the fallback |
| Tests | [Vitest 5](https://vitest.dev/) + `@vue/test-utils` + jsdom; [Playwright](https://playwright.dev/) (chromium) + `@axe-core/playwright` | `tests/unit/` and `tests/e2e/`; see [`tests/README.md`](./tests/README.md) |
| Tooling scripts | Node ESM (`.mjs`) and Python 3 | Data/asset maintenance only, not part of the build |

No linter, formatter, or CI configuration is present.

## Project structure

```
.
├── index.html                          # Vite entry; inline theme script, Inter font, mounts #app
├── src/
│   ├── main.ts                         # createApp(App).mount('#app')
│   ├── App.vue                         # Page shell: navbar, intro banner, grid, modal, footer
│   ├── constants.ts                    # PLACEHOLDER_IMAGE path shared by carousel + modal
│   ├── assets/main.css                 # Tailwind directives, scrollbar, fade/slide transitions
│   ├── types/backpack.ts               # BackpackItem, BackpackColorway, ReviewScore, RetailerOffer, SortOption
│   ├── data/backpacks.json             # The 20-pack dataset (curated "featured" order)
│   ├── composables/
│   │   └── useBackpackCatalog.ts       # normalizeBackpack(), search / brand filter / sort / dark-mode state
│   └── components/
│       ├── CatalogNavbar.vue           # Sticky header: title, search, brand, sort, theme toggle
│       ├── BackpackCard.vue            # 5:7 card container; composes carousel + title band + bottom bar
│       ├── CardCarousel.vue            # Top 65 %: fade-transition image loop, prev/next buttons, dots
│       ├── CardBottomBar.vue           # Bottom 20 %: 3-column grid
│       ├── ColorGrid.vue               # 3×3 swatch grid with pagination + hover/focus/tap tooltips
│       ├── PriceRetailer.vue           # "$219" + retailer name
│       ├── ReviewScore.vue             # "4.8/5.0" + source
│       └── BackpackModal.vue           # Quick-view detail dialog (focus trap, Escape, scroll lock)
├── public/
│   ├── favicon.svg                     # "EDC" tile matching the navbar logo
│   └── images/
│       ├── placeholder.webp            # Fallback image for packs with no photos
│       └── backpacks/<id>/             # 5 JPGs per pack
├── tests/
│   ├── README.md                       # How to run the suites, PW_PORT convention
│   ├── tsconfig.json                   # Editor/Vitest/Playwright types for tests (not part of vue-tsc)
│   ├── unit/*.spec.ts                  # Vitest + @vue/test-utils (jsdom)
│   └── e2e/*.spec.ts                   # Playwright (chromium) incl. axe-core checks
├── scripts/                            # One-off data & asset tooling (see below)
├── vitest.config.ts · playwright.config.ts
├── tailwind.config.ts · postcss.config.js · vite.config.ts · tsconfig*.json
└── edc-catalog-app-antigravity-implementation-plan.md   # Original design spec
```

### Data model (`src/types/backpack.ts`)

```ts
interface BackpackItem {
  id: string                 // slug, matches public/images/backpacks/<id>/
  brand: string
  name: string
  capacityLiters: number
  lowestPriceUSD: number     // shown on the card; re-derived from retailers[] at load time
  primaryRetailer: string    // shown on the card next to the price; re-derived from retailers[]
  review: { score: number; maxScore: number; sourceName?: string; reviewCount?: number }
  colorways: { name: string; hex: string; isPopular?: boolean }[]
  images: string[]           // 0–5 public paths (empty → placeholder.webp)
  retailers?: { name: string; priceUSD: number; url: string; isLowestPrice?: boolean }[]
  description?: string
  material?: string
  dimensions?: string
  weightKg?: number
  features?: string[]        // declared but unpopulated in the dataset
}
```

"Featured" sort is simply the array order in `backpacks.json`. Rating sort normalises `score / maxScore` so 5-point and 10-point scales compare fairly.

When `retailers[]` is non-empty, `normalizeBackpack()` sets `lowestPriceUSD = min(priceUSD)`, flags every offer at that price with `isLowestPrice` (ties are all flagged), and sets `primaryRetailer` from the first lowest offer with a trailing " (Official)" stripped. Items without offers pass through unchanged. `npm run verify` enforces the same invariant on the on-disk JSON.

## Setup

Prerequisites: **Node.js 18+** (developed on Node 24 / npm 11). Python 3 is only needed for the optional data scripts.

```bash
git clone https://github.com/davidgardner11/edc-catalog-antigravity.git
cd edc-catalog-antigravity
npm install
```

No environment variables are required.

## Running

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR at **http://localhost:3000** |
| `npm run build` | `vue-tsc` type-check, then production build to `dist/` |
| `npm run preview` | Serve the production `dist/` build locally |
| `npm run typecheck` | `vue-tsc --noEmit` over `src/` (no build) |
| `npm run verify` | `scripts/verify-catalog.mjs`: 20 packs, required fields, every image path exists on disk, Best Price consistency (`lowestPriceUSD` / `isLowestPrice` / `primaryRetailer` vs `retailers[]`), static assets (`favicon.svg`, `placeholder.webp`) present, swatch-pagination math, contrast math |
| `npm test` | Vitest unit suite (`tests/unit/**/*.spec.ts`, jsdom), single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright suite in `tests/e2e/` (chromium); starts its own Vite dev server |

### Testing

Unit tests use Vitest + `@vue/test-utils` in jsdom; `vitest.config.ts` merges `vite.config.ts` so the `@` alias and Vue plugin work unchanged. End-to-end tests use Playwright (chromium only, `playwright.config.ts`), which launches `npx vite --port $PW_PORT --strictPort` itself (`reuseExistingServer: false`, no retries) and includes axe-core accessibility checks via `@axe-core/playwright`. Run `npx playwright install chromium` once per machine.

`PW_PORT` selects the e2e dev-server port (default `4173`). Because several branches/worktrees may run e2e concurrently, give each run its own port, e.g. `PW_PORT=4100 npm run test:e2e`.

Tests are excluded from the production `vue-tsc` run (root `tsconfig` only includes `src/**`); `tests/tsconfig.json` provides Vitest/Playwright types for editors and can be type-checked with `npx vue-tsc --noEmit -p tests/tsconfig.json`. See [`tests/README.md`](./tests/README.md) for details.

The app is a fully static SPA — deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel, S3). No server-side rendering or API is involved. If you deploy under a sub-path, set `base` in `vite.config.ts`; image paths in `backpacks.json` are root-relative (`/images/...`).

### Maintenance scripts (`scripts/`)

These are one-shot utilities that were used to build the dataset. Only `verify-catalog.mjs` is wired into `package.json` (as `npm run verify`).

| Script | Purpose |
| --- | --- |
| `verify-catalog.mjs` | Read-only validation of `backpacks.json`, image files, Best Price consistency, and static assets (safe to run any time). |
| `add-retailers-data.py` | Merges a hard-coded `retailers[]` map into `backpacks.json` and rewrites the file. |
| `generate-assets.mjs` | Generates stylised placeholder SVGs per pack and **rewrites `images[]` to `.svg`** — running it now would revert the real photos. |
| `download-real-backpack-photos.py` | Scrapes Bing Image Search for 5 photos per pack, saves them as JPGs, and rewrites `images[]`. Network-dependent and fragile. |
| `test-image-search.py`, `test-product-images.mjs` | Scratch experiments for the two image-sourcing approaches. |

> **Back up `src/data/backpacks.json` before running any of the Python or `generate-assets` scripts** — they overwrite it in place.

## Known issues & bugs

Found while reviewing the code and data. None break the build (`npm run build`, `npm run verify`, `npm test` and `npm run test:e2e` all pass).

1. **Unoptimised images.** JPEGs are used as downloaded (one is 3.4 MB; 12 exceed 500 KB), with no resizing, `srcset`, or WebP conversion. Cards use `loading="lazy"` but the modal thumbnails do not.
2. **Image provenance.** Photos were scraped from Bing Image Search results, so licensing is unverified. Treat them as placeholders before any public deployment.
3. **Static "live" pricing.** Prices and review scores are hard-coded snapshots; retailer URLs are unvalidated and several are guesses at product slugs (e.g. the Carryology Marketplace link for the Tom Bihn Synik 22 is just the site's home page).
4. **`features[]` is typed but never populated or rendered.**

### Fixed since the initial review

For reference, the following items from the original list have been resolved on `development` (each with unit/e2e coverage):

- Wrong "Best Price" badge on the Tom Bihn Synik 22 — data corrected, and Best Price fields are now derived from `retailers[]` at load time and checked by `npm run verify`.
- Missing `public/favicon.svg` and `public/images/placeholder.webp` — both added; the modal also tolerates an empty `images[]`.
- No-op Tailwind classes (`-mt-0.75`, `hover:scale-115`, `shadow-xs`) — replaced with `-mt-1` / `hover:scale-110` / `shadow-sm`.
- Dead code — `CardLabelOverlay.vue`, `useImageContrast.ts`, the `contrastFallback` field and the unused `lucide-vue-next` dependency were removed.
- Orphaned assets — the 100 generated `.svg` files and `test_img/` were deleted.
- Dark mode — persisted to `localStorage`, follows `prefers-color-scheme` when no choice is stored, applied before first paint.
- Accessibility — modal is a real dialog (focus trap, Escape, scroll lock, focus restore); carousel zones and swatches are labelled buttons with keyboard support; cards are keyboard-activatable; navbar selects have `aria-label`s; axe reports no critical violations on the grid or the open dialog.
- Minor — `brandList` no longer carries an `'all'` sentinel, the footer year is computed, and the banner subtitle is plain text.

## Recommended improvements

Roughly ordered by value-for-effort.

**Accessibility & UX**
- Consider swipe gestures on the carousel for touch devices.
- Persist search / brand / sort in the URL query string so views are shareable and survive reload.
- Add a "compare" tray (pick 2–3 packs → side-by-side spec table) — the data model already supports it.
- Add range filters (price, capacity) and a colour filter; extend search to colorway names.

**Data & content**
- Move retailer pricing to a small JSON feed or scheduled scraper so "live pricing" is honest, and show a `lastUpdated` timestamp.
- Replace scraped images with licensed/official product photography, then run an optimisation step (sharp → WebP/AVIF, 2–3 sizes, `srcset`).
- Populate the `features[]` field and render it in the modal.
- Add a JSON Schema (or Zod) for `backpacks.json` and validate it in `verify-catalog.mjs` / CI.
- Fix the Synik 22 Carryology Marketplace URL to point at the actual listing, and validate the other retailer URLs.

**Engineering hygiene**
- Add ESLint (`eslint-plugin-vue`) + Prettier.
- Add a GitHub Actions workflow: install → typecheck → build → verify → test → test:e2e → (optionally) deploy `dist/` to GitHub Pages.
- Self-host the Inter font (or drop it) to remove the Google Fonts dependency and third-party request.
- If the catalog grows past a few dozen items, consider SSG (Vite SSG or Nuxt, as the original plan intended) for per-pack routes and SEO.

## Design notes

- **Card geometry** is driven entirely by `aspect-[5/7]` plus percentage heights (`h-[65%]`, `h-[15%]`, `h-[20%]`) so the three tiers scale with the card rather than with content. Text in the middle and bottom tiers uses `truncate` to protect the geometry.
- **Swatch pagination math** (`ColorGrid.vue`): `TOTAL_SLOTS = 9`, `PAGE_SIZE_WITH_PAGINATION = 8`. Pages exist only when `colorways.length > 9`; the `>` button always occupies slot 9 and wraps `currentPage` modulo `ceil(n / 8)`.
- **Tooltip isolation**: each swatch tracks hover/focus independently (`hoveredColor === color.name`) and the bottom bar uses `overflow-visible` so tooltips can escape the card's bounds — this was a deliberate fix (see commit `2c1c675`). On touch devices a `touchstart` flag suppresses the emulated `mouseenter`/`focus` so a tap toggles the tooltip cleanly.
- **Dialog focus**: on open, focus moves to the modal's `<h2>` (`tabindex="-1"`) rather than the close button — when the dialog is opened with Enter, the key's activation would otherwise land on the freshly focused ✕ and close it immediately.
- **Contrast engine**: the canvas-based luminance/WCAG picker (`useImageContrast.ts`) from the original spec was removed along with the image overlay label; `verify-catalog.mjs` still exercises the underlying luminance math as a sanity check.

## License

No license file is present. Add one before publishing; also confirm image licensing (see Known issues #2).
