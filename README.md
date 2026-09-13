# Top 20 EDC Backpacks — Everyday Carry Catalog App

A single-page application (SPA) static catalog of 20 curated Everyday Carry (EDC) backpacks. Each backpack card has an image carousel, a title band, and a data bar (color swatches, lowest price + retailer, review score). Clicking a card opens a quick-view modal with full specs, all colorways, and direct links to retailers.

The project was scaffolded from an AI-generated implementation plan (see [`edc-catalog-app-antigravity-implementation-plan.md`](./edc-catalog-app-antigravity-implementation-plan.md)) and then iterated on. During implementation and testing, some revisions occurred. The README below describes what functionality actually exists new.

## What the app does

- **Catalog grid** — 20 backpacks in a responsive grid (1 / 2 / 3 columns at mobile / tablet / desktop). Cards are `aspect-[5/7]`, 260–420 px wide.
- **Three-tier card layout**
  - Top 65 %: image carousel (5 photos per pack). Hovering reveals left/right half-click zones that loop infinitely; pagination dots show the active image.
  - Middle 15 %: brand + model name.
  - Bottom 20 %: three partitions — a 3×3 color-swatch grid, lowest price in USD with retailer, and review score with source (e.g. `4.8/5.0 · Pack Hacker`).
- **Color swatch pagination** — packs with ≤ 9 colorways show all swatches (empty cells render as dashed placeholder circles to keep alignment). Packs with > 9 colorways show 8 per page plus a `>` button in slot 9 that loops through pages. Hovering a swatch shows a tooltip with the colorway name. 7 of the 20 packs exercise the pagination path.
- **Sticky header** with live search (matches name, brand, material, description), brand dropdown filter, sort selector (featured / price ↑↓ / rating / capacity / brand A–Z), and a dark-mode toggle.
- **Quick-view modal** — larger image with thumbnail strip, description, spec grid (capacity, price, material, dimensions, rating, weight), "Shop At" retailer links with a "Best Price" badge, and the full colorway list.
- **Empty state** with a reset button when filters match nothing; a "Reset all filters" link appears in the intro banner whenever any filter is active.
- **Dark mode** via Tailwind's `class` strategy (toggled on `<html>`).

All data is static and ships with the bundle; there is no backend, API call, or runtime fetch.

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | [Vue 3](https://vuejs.org/) (`^3.5`) with `<script setup>` + Composition API | Single root component, no router, no Pinia |
| Language | TypeScript (`^5.7`), `strict: true` | Type-checked with `vue-tsc` as part of `npm run build` |
| Build | [Vite 6](https://vite.dev/) + `@vitejs/plugin-vue` | Dev server on port **3000**; `@` alias → `src/` |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS + Autoprefixer | Custom `shadow-card` / `shadow-card-hover`, `aspect-poker`, Inter font stack |
| Font | Inter via Google Fonts `<link>` in `index.html` | Falls back to system sans |
| Icons | Inline SVG | `lucide-vue-next` is in `dependencies` but is **not imported anywhere** |
| Data | `src/data/backpacks.json` imported directly (`resolveJsonModule`) | 20 records, typed by `src/types/backpack.ts` |
| Images | `public/images/backpacks/<id>/1..5.jpg` | ~23 MB of JPEGs; 100 legacy SVG placeholders also present |
| Tooling scripts | Node ESM (`.mjs`) and Python 3 | Data/asset maintenance only, not part of the build |

No test runner, linter, formatter, or CI configuration is present.

## Project structure

```
.
├── index.html                          # Vite entry; loads Inter font, mounts #app
├── src/
│   ├── main.ts                         # createApp(App).mount('#app')
│   ├── App.vue                         # Page shell: navbar, intro banner, grid, modal, footer
│   ├── assets/main.css                 # Tailwind directives, scrollbar, fade/slide transitions
│   ├── types/backpack.ts               # BackpackItem, BackpackColorway, ReviewScore, RetailerOffer, SortOption
│   ├── data/backpacks.json             # The 20-pack dataset (curated "featured" order)
│   ├── composables/
│   │   ├── useBackpackCatalog.ts       # Search / brand filter / sort / dark-mode state
│   │   └── useImageContrast.ts         # Canvas luminance → white/black text picker (currently unused)
│   └── components/
│       ├── CatalogNavbar.vue           # Sticky header: title, search, brand, sort, theme toggle
│       ├── BackpackCard.vue            # 5:7 card container; composes carousel + title band + bottom bar
│       ├── CardCarousel.vue            # Top 65 %: fade-transition image loop, split click zones, dots
│       ├── CardBottomBar.vue           # Bottom 20 %: 3-column grid
│       ├── ColorGrid.vue               # 3×3 swatch grid with pagination + hover tooltips
│       ├── PriceRetailer.vue           # "$219" + retailer name
│       ├── ReviewScore.vue             # "4.8/5.0" + source
│       ├── BackpackModal.vue           # Quick-view detail dialog
│       └── CardLabelOverlay.vue        # Brand/model overlay for the image (currently unused)
├── public/images/backpacks/<id>/       # 5 JPGs (+ 5 orphaned SVGs) per pack
├── scripts/                            # One-off data & asset tooling (see below)
├── test_img/test.jpg                   # Stray sample image, not referenced by the app
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
  lowestPriceUSD: number     // shown on the card
  primaryRetailer: string    // shown on the card next to the price
  review: { score: number; maxScore: number; sourceName?: string; reviewCount?: number }
  colorways: { name: string; hex: string; isPopular?: boolean }[]
  images: string[]           // 1–5 public paths
  retailers?: { name: string; priceUSD: number; url: string; isLowestPrice?: boolean }[]
  description?: string
  material?: string
  dimensions?: string
  weightKg?: number
  features?: string[]        // declared but unpopulated in the dataset
  contrastFallback?: '#FFFFFF' | '#000000'   // declared but unused
}
```

"Featured" sort is simply the array order in `backpacks.json`. Rating sort normalises `score / maxScore` so 5-point and 10-point scales compare fairly.

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
| `node scripts/verify-catalog.mjs` | Sanity-check the dataset: 20 packs, required fields, every image path exists on disk, swatch-pagination math, contrast math |

The app is a fully static SPA — deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel, S3). No server-side rendering or API is involved. If you deploy under a sub-path, set `base` in `vite.config.ts`; image paths in `backpacks.json` are root-relative (`/images/...`).

### Maintenance scripts (`scripts/`)

These are one-shot utilities that were used to build the dataset. None are wired into `package.json`.

| Script | Purpose |
| --- | --- |
| `verify-catalog.mjs` | Read-only validation of `backpacks.json` and image files (safe to run any time). |
| `add-retailers-data.py` | Merges a hard-coded `retailers[]` map into `backpacks.json` and rewrites the file. |
| `generate-assets.mjs` | Generates stylised placeholder SVGs per pack and **rewrites `images[]` to `.svg`** — running it now would revert the real photos. |
| `download-real-backpack-photos.py` | Scrapes Bing Image Search for 5 photos per pack, saves them as JPGs, and rewrites `images[]`. Network-dependent and fragile. |
| `test-image-search.py`, `test-product-images.mjs` | Scratch experiments for the two image-sourcing approaches. |

> **Back up `src/data/backpacks.json` before running any of the Python or `generate-assets` scripts** — they overwrite it in place.

## Known issues & bugs

Found while reviewing the code and data. None break the build (`npm run build` and `verify-catalog.mjs` both pass).

1. **Wrong "Best Price" badge — Tom Bihn Synik 22.** `retailers[]` lists Tom Bihn (Official) at $340 with `isLowestPrice: true` and Carryology Marketplace at $320 with `isLowestPrice: false`. The card correctly shows $320 / Carryology, but the modal badges the $340 offer as best. The Carryology URL is also just the site's home page. Fix in `backpacks.json` (or derive `isLowestPrice` at runtime from `Math.min`).
2. **Missing favicon.** `index.html` references `/favicon.svg`, which does not exist in `public/` → 404 on every load.
3. **Missing image fallback.** `CardCarousel.vue` falls back to `/images/placeholder.webp` when a pack has no images, but that file does not exist.
4. **No-op Tailwind classes.** `-mt-0.75` and `hover:scale-115` (`ColorGrid.vue`) and `shadow-xs` (`ColorGrid.vue`, `BackpackModal.vue`) are not in Tailwind 3's default scale and are dropped from the built CSS. Use `-mt-1` / `hover:scale-110` / `shadow-sm`, or extend the theme.
5. **Dead code.** `CardLabelOverlay.vue` and `useImageContrast.ts` (the canvas-based WCAG contrast picker from the original spec) are no longer imported since the 3-tier layout moved the label out of the image area. `lucide-vue-next` is an unused dependency. `features` and `contrastFallback` fields are typed but never populated or read.
6. **Orphaned assets.** 100 generated `.svg` files remain in `public/images/backpacks/` alongside the JPGs and are copied into every build. `test_img/test.jpg` is a stray committed file.
7. **Dark mode is not persisted** and ignores `prefers-color-scheme` — always starts in light mode and resets on reload.
8. **Modal accessibility.** No `role="dialog"` / `aria-modal`, no focus trap, no Escape-to-close, and the page behind it still scrolls. Card carousel click zones are `<div>`s, so they are unreachable by keyboard; swatch tooltips are hover-only and never appear on touch devices.
9. **Unoptimised images.** JPEGs are used as downloaded (one is 3.4 MB; 12 exceed 500 KB), with no resizing, `srcset`, or WebP conversion. Cards use `loading="lazy"` but the modal thumbnails do not.
10. **Image provenance.** Photos were scraped from Bing Image Search results, so licensing is unverified. Treat them as placeholders before any public deployment.
11. **Static "live" pricing.** Prices and review scores are hard-coded snapshots; retailer URLs are unvalidated and several are guesses at product slugs.
12. **Minor:** `brandList` includes the `'all'` sentinel and the navbar filters it back out; the footer hard-codes `© 2026`; the intro banner text says "poker card proportions" but is otherwise decorative.

## Recommended improvements

Roughly ordered by value-for-effort.

**Quick wins**
- Fix items 1–6 above (data fix, add `public/favicon.svg` and a placeholder image, correct Tailwind classes, delete dead code / unused dep / stray files, `git rm` the SVGs).
- Compute `isLowestPrice` and `lowestPriceUSD` from `retailers[]` at load time so the card, modal, and badge can never disagree.
- Persist dark mode to `localStorage` and initialise from `prefers-color-scheme` (add an inline script in `index.html` to avoid a flash).
- Add `npm run verify` (→ `scripts/verify-catalog.mjs`) and `npm run typecheck` scripts.

**Accessibility & UX**
- Make the modal a proper dialog: `role="dialog"`, `aria-modal`, focus trap, Escape to close, `overflow:hidden` on `<body>` while open, restore focus on close.
- Turn carousel click zones into `<button>`s with `aria-label`s; support arrow keys; consider swipe on touch.
- Give the swatch tooltip a tap/focus trigger, and add `aria-label` with the colour name to each swatch.
- Persist search / brand / sort in the URL query string so views are shareable and survive reload.
- Add a "compare" tray (pick 2–3 packs → side-by-side spec table) — the data model already supports it.
- Add range filters (price, capacity) and a colour filter; extend search to colorway names.

**Data & content**
- Move retailer pricing to a small JSON feed or scheduled scraper so "live pricing" is honest, and show a `lastUpdated` timestamp.
- Replace scraped images with licensed/official product photography, then run an optimisation step (sharp → WebP/AVIF, 2–3 sizes, `srcset`).
- Populate the `features[]` field and render it in the modal.
- Add a JSON Schema (or Zod) for `backpacks.json` and validate it in `verify-catalog.mjs` / CI.

**Engineering hygiene**
- Add ESLint (`eslint-plugin-vue`) + Prettier, and Vitest unit tests for `useBackpackCatalog` (filter/sort) and `ColorGrid` pagination math.
- Add a Playwright smoke test (grid renders 20 cards, filter/sort work, modal opens/closes).
- Add a GitHub Actions workflow: install → typecheck → build → verify → (optionally) deploy `dist/` to GitHub Pages.
- Self-host the Inter font (or drop it) to remove the Google Fonts dependency and third-party request.
- If the catalog grows past a few dozen items, consider SSG (Vite SSG or Nuxt, as the original plan intended) for per-pack routes and SEO.

## Design notes

- **Card geometry** is driven entirely by `aspect-[5/7]` plus percentage heights (`h-[65%]`, `h-[15%]`, `h-[20%]`) so the three tiers scale with the card rather than with content. Text in the middle and bottom tiers uses `truncate` to protect the geometry.
- **Swatch pagination math** (`ColorGrid.vue`): `TOTAL_SLOTS = 9`, `PAGE_SIZE_WITH_PAGINATION = 8`. Pages exist only when `colorways.length > 9`; the `>` button always occupies slot 9 and wraps `currentPage` modulo `ceil(n / 8)`.
- **Tooltip isolation**: each swatch tracks hover independently (`hoveredColor === color.name`) and the bottom bar uses `overflow-visible` so tooltips can escape the card's bounds — this was a deliberate fix (see commit `2c1c675`).
- **Contrast engine** (`useImageContrast.ts`, currently unused): samples the top-left 50 % × 30 % of an image via canvas, computes BT.709 relative luminance, and picks white or black by WCAG contrast ratio, with a per-URL cache. Kept in the tree in case the overlay label returns.

## License

No license file is present. Add one before publishing; also confirm image licensing (see Known issues #10).
