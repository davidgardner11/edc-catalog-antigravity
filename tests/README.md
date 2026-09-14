# Tests

- `npm test` runs the Vitest unit suite (`tests/unit/**/*.spec.ts`, jsdom environment) once; `npm run test:watch` keeps it running.
- `npm run test:e2e` runs the Playwright smoke suite in `tests/e2e/` against a Vite dev server that Playwright starts itself (chromium only). Run `npx playwright install chromium` once per machine.
- `tests/e2e/a11y.spec.ts` covers keyboard-only flows (card -> dialog -> Escape), focus trapping, carousel/swatch buttons and runs axe-core via `@axe-core/playwright`; it fails on any `critical` violation inside the grid or the open dialog.
- `PW_PORT` picks the port the e2e dev server binds to (default `4173`, `--strictPort`). Several branches run e2e at the same time, so give each run its own port, e.g. `PW_PORT=4100 npm run test:e2e`.
- `npm run typecheck` runs `vue-tsc --noEmit` over `src/`; `npm run verify` checks `src/data/backpacks.json` and the image files it references.
- Tests are excluded from the production typecheck; `tests/tsconfig.json` only exists so editors resolve the `@/` alias and Vitest/Playwright types.
