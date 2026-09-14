import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Acceptance tests for README issues #2 + #3 (task: fix/missing-assets).
//
//  * GET /favicon.svg and the image placeholder answer 200 from the dev server
//    and are real, decodable assets in Chromium (not just files with the right
//    extension).
//  * A BackpackItem with images: [] renders the placeholder in both the card
//    carousel and the detail modal, with no console errors, no page errors and
//    no 404 responses.
//
// The catalog JSON is a static ES-module import, so the "empty images" pack is
// injected by intercepting Vite's transformed module for src/data/backpacks.json
// and serving a copy where the first pack has images: [].

type Backpack = { id: string; name: string; brand: string; images: string[] }

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..')
const catalog: Backpack[] = JSON.parse(readFileSync(resolve(ROOT, 'src', 'data', 'backpacks.json'), 'utf8'))

const PLACEHOLDER_PATH = '/images/placeholder.webp'
const FAVICON_PATH = '/favicon.svg'

const cards = (page: Page) => page.locator('main > div.grid > div')
const modal = (page: Page) => page.locator('div.fixed.inset-0')

/** Loads `src` in the browser as a real <img> and reports its decoded size. */
async function decodeInBrowser(page: Page, src: string) {
  return page.evaluate(async (url: string) => {
    const img = new Image()
    img.src = url
    try {
      await img.decode()
      return { ok: true, w: img.naturalWidth, h: img.naturalHeight }
    } catch (e) {
      return { ok: false, w: 0, h: 0, error: String(e) }
    }
  }, src)
}

test.describe('favicon (README issue #2)', () => {
  test('GET /favicon.svg is 200, served as SVG and is well-formed XML', async ({ page, request }) => {
    const res = await request.get(FAVICON_PATH)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/image\/svg\+xml/)

    const body = await res.text()
    expect(body).toMatch(/<svg[\s>]/)

    // Parse in the browser: a malformed SVG yields a <parsererror> document.
    await page.goto('/')
    const parsed = await page.evaluate((text: string) => {
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
      return {
        rootTag: doc.documentElement.tagName,
        parserError: doc.getElementsByTagName('parsererror').length
      }
    }, body)
    expect(parsed.rootTag).toBe('svg')
    expect(parsed.parserError).toBe(0)
  })

  test('the <link rel="icon"> the document actually points at resolves to 200 and decodes', async ({ page, request }) => {
    await page.goto('/')
    const href = await page.locator('link[rel="icon"]').getAttribute('href')
    expect(href).toBe(FAVICON_PATH)

    const res = await request.get(href!)
    expect(res.status()).toBe(200)

    const decoded = await decodeInBrowser(page, href!)
    expect(decoded.ok, decoded.error).toBe(true)
    expect(decoded.w).toBeGreaterThan(0)
    expect(decoded.h).toBeGreaterThan(0)
  })
})

test.describe('image placeholder (README issue #3)', () => {
  test('GET /images/placeholder.webp is 200, served as WebP and decodes in Chromium', async ({ page, request }) => {
    const res = await request.get(PLACEHOLDER_PATH)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/image\/webp/)
    expect((await res.body()).length).toBeGreaterThan(0)

    await page.goto('/')
    const decoded = await decodeInBrowser(page, PLACEHOLDER_PATH)
    expect(decoded.ok, decoded.error).toBe(true)
    expect(decoded.w).toBeGreaterThan(0)
    expect(decoded.h).toBeGreaterThan(0)
  })

  test('a pack with images: [] shows the placeholder in the card and the modal without errors or 404s', async ({ page }) => {
    const emptyPack = catalog[0]
    const patched = catalog.map((b, i) => (i === 0 ? { ...b, images: [] } : b))

    let intercepted = 0
    await page.route('**/src/data/backpacks.json**', async route => {
      intercepted++
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `export default ${JSON.stringify(patched)}\n`
      })
    })

    const consoleErrors: string[] = []
    const pageErrors: string[] = []
    const notFound: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('response', res => {
      if (res.status() === 404) notFound.push(res.url())
    })

    await page.goto('/')
    await expect(cards(page)).toHaveCount(catalog.length)
    expect(intercepted, 'catalog module was not intercepted; test setup is broken').toBeGreaterThan(0)

    // --- Card carousel ---
    const card = cards(page).first()
    await expect(card).toContainText(emptyPack.name)
    const cardImg = card.locator('img').first()
    await expect(cardImg).toHaveAttribute('src', PLACEHOLDER_PATH)
    await expect(cardImg).toBeVisible()
    await expect
      .poll(async () => cardImg.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
      .toBe(true)
    // No prev/next zones or pagination dots for an image-less pack.
    await expect(card.locator('[title="Previous image"]')).toHaveCount(0)
    await expect(card.locator('[title="Next image"]')).toHaveCount(0)

    // A pack that still has images is unaffected.
    const secondCardImg = cards(page).nth(1).locator('img').first()
    await expect(secondCardImg).toHaveAttribute('src', catalog[1].images[0])

    // --- Modal ---
    await card.getByRole('heading', { level: 3 }).click()
    await expect(modal(page)).toBeVisible()
    await expect(modal(page).getByRole('heading', { level: 2, name: emptyPack.name })).toBeVisible()

    const modalImgs = modal(page).locator('img')
    await expect(modalImgs).toHaveCount(1)
    await expect(modalImgs.first()).toHaveAttribute('src', PLACEHOLDER_PATH)
    await expect
      .poll(async () => modalImgs.first().evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
      .toBe(true)
    // No thumbnail strip.
    await expect(modal(page).locator('button.w-10.h-10')).toHaveCount(0)

    await modal(page).getByRole('button', { name: 'Close details' }).click()
    await expect(modal(page)).toBeHidden()

    // Opening a normal pack afterwards still shows its own images and thumbnails.
    await cards(page).nth(1).getByRole('heading', { level: 3 }).click()
    await expect(modal(page)).toBeVisible()
    await expect(modal(page).locator('img.h-64')).toHaveAttribute('src', catalog[1].images[0])
    await expect(modal(page).locator('button.w-10.h-10')).toHaveCount(catalog[1].images.length)
    await modal(page).getByRole('button', { name: 'Close details' }).click()
    await expect(modal(page)).toBeHidden()

    await page.waitForLoadState('networkidle')
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
    expect(notFound).toEqual([])
  })

  test('browser-initiated fetches of the favicon and placeholder get 200 image responses, not the SPA fallback', async ({ page }) => {
    // NOTE: Vite's dev server answers a *missing* file with index.html at 200
    // (history-API fallback), so "no 404s" alone cannot detect a missing asset.
    // Assert on the concrete responses for the two paths instead.
    const seen: Record<string, { status: number; type: string }> = {}
    const notFound: string[] = []
    page.on('response', res => {
      const path = new URL(res.url()).pathname
      if (path === FAVICON_PATH || path === PLACEHOLDER_PATH) {
        seen[path] = { status: res.status(), type: res.headers()['content-type'] ?? '' }
      }
      if (res.status() === 404) notFound.push(res.url())
    })

    await page.goto('/')
    await expect(cards(page)).toHaveCount(catalog.length)
    // Force the fallbacks to be fetched even though every real pack has images.
    const placeholder = await decodeInBrowser(page, PLACEHOLDER_PATH)
    const favicon = await decodeInBrowser(page, FAVICON_PATH)
    await page.waitForLoadState('networkidle')

    expect(placeholder.ok, placeholder.error).toBe(true)
    expect(favicon.ok, favicon.error).toBe(true)
    expect(seen[PLACEHOLDER_PATH]?.status).toBe(200)
    expect(seen[PLACEHOLDER_PATH]?.type).toMatch(/^image\/webp/)
    expect(seen[FAVICON_PATH]?.status).toBe(200)
    expect(seen[FAVICON_PATH]?.type).toMatch(/^image\/svg\+xml/)
    expect(notFound).toEqual([])
  })
})
