import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Pins the browser-visible side of README issues #4, #6 and #12 (task: fix/cleanup).

type Backpack = { id: string; brand: string; images: string[]; colorways: unknown[] }

const catalog: Backpack[] = JSON.parse(
  readFileSync(resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'src', 'data', 'backpacks.json'), 'utf8')
)
const uniqueBrands = [...new Set(catalog.map(b => b.brand))].sort()

const cards = (page: Page) => page.locator('main > div.grid > div')
const brandSelect = (page: Page) => page.locator('header select').first()
const swatches = (page: Page) => page.locator('main span[style*="background-color"]')
const moreButtons = (page: Page) => page.locator('main button[title="View more colors"]')

test.describe('#12 cosmetics', () => {
  test('footer year follows the clock instead of being hard-coded to 2026', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2031-06-15T12:00:00Z'))
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toContainText('© 2031 Everyday Carry (EDC) Backpack Catalog.')
    await expect(footer).not.toContainText('2026')
  })

  test('footer year matches the real current year', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toContainText(`© ${new Date().getFullYear()} Everyday Carry (EDC) Backpack Catalog.`)
  })

  test('intro banner subtitle is plain language and tracks the filtered count', async ({ page }) => {
    await page.goto('/')
    const subtitle = page.locator('main p').first()

    await expect(subtitle).toHaveText(`Displaying ${catalog.length} of ${catalog.length} curated everyday-carry backpacks.`)
    await expect(page.locator('main')).not.toContainText(/poker card|acclaimed/i)

    await brandSelect(page).selectOption('Bellroy')
    const bellroy = catalog.filter(b => b.brand === 'Bellroy').length
    await expect(subtitle).toHaveText(`Displaying ${bellroy} of ${catalog.length} curated everyday-carry backpacks.`)
  })

  test('brand dropdown shows "All Brands (N)" first and never a literal "all" brand', async ({ page }) => {
    await page.goto('/')

    const options = brandSelect(page).locator('option')
    await expect(options).toHaveCount(uniqueBrands.length + 1)
    await expect(options.first()).toHaveText(`All Brands (${catalog.length})`)
    await expect(options.first()).toHaveAttribute('value', 'all')

    const labels = (await options.allTextContents()).map(t => t.trim())
    expect(labels.slice(1)).toEqual(uniqueBrands)
    expect(labels.filter(l => l === 'all')).toEqual([])

    const values = await options.evaluateAll(opts => opts.map(o => (o as HTMLOptionElement).value))
    expect(values).toEqual(['all', ...uniqueBrands])

    // Selecting the sentinel still shows everything, selecting a brand still filters.
    await brandSelect(page).selectOption(uniqueBrands[0])
    await expect(cards(page)).toHaveCount(catalog.filter(b => b.brand === uniqueBrands[0]).length)
    await brandSelect(page).selectOption('all')
    await expect(cards(page)).toHaveCount(catalog.length)
  })
})

test.describe('#6 orphaned assets', () => {
  test('the removed SVG placeholders and test_img are no longer served as images, JPGs still are', async ({ request }) => {
    for (const pack of catalog) {
      const jpg = await request.get(pack.images[0])
      expect(jpg.status(), pack.images[0]).toBe(200)
      expect(jpg.headers()['content-type'], pack.id).toMatch(/^image\/jpeg/)

      // Vite's dev server answers unknown paths with the SPA index.html (200, text/html),
      // so "gone" means "no longer served as an image" rather than a 404.
      const svgPath = pack.images[0].replace(/\.jpg$/, '.svg')
      const svg = await request.get(svgPath)
      expect(svg.headers()['content-type'], svgPath).not.toMatch(/^image\//)
      expect(await svg.text(), svgPath).not.toMatch(/<svg[\s>]/)
    }

    const stray = await request.get('/test_img/test.jpg')
    expect(stray.headers()['content-type']).not.toMatch(/^image\//)
  })

  test('the page only requests .jpg catalog images and no lucide bundle', async ({ page }) => {
    const urls: string[] = []
    page.on('request', req => urls.push(req.url()))
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await expect(cards(page)).toHaveCount(catalog.length)
    await expect(page.locator('main img').first()).toBeVisible()

    const imageRequests = urls.filter(u => u.includes('/images/backpacks/'))
    expect(imageRequests.length).toBeGreaterThan(0)
    expect(imageRequests.filter(u => u.endsWith('.svg'))).toEqual([])
    expect(urls.filter(u => /lucide/i.test(u))).toEqual([])
    expect(errors).toEqual([])
  })
})

test.describe('#4 Tailwind classes actually apply', () => {
  test('colour swatches get a real box-shadow (shadow-sm) instead of none', async ({ page }) => {
    await page.goto('/')
    const swatch = swatches(page).first()
    await expect(swatch).toBeVisible()

    const shadow = await swatch.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe('none')
    expect(shadow).toMatch(/rgba?\(/)
  })

  test('the ">" pagination button scales to 1.1 on hover and carries a shadow', async ({ page }) => {
    await page.goto('/')
    const button = moreButtons(page).first()
    await expect(button).toBeVisible()

    expect(await button.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none')

    await expect(button).toHaveCSS('transform', 'none')
    await button.hover()
    await expect(button).toHaveCSS('transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)')
  })

  test('the tooltip caret is pulled up by 4px (-mt-1) when a swatch is hovered', async ({ page }) => {
    await page.goto('/')
    const swatch = swatches(page).first()
    await expect(swatch).toBeVisible()

    await swatch.hover()
    const caret = page.locator('main .rotate-45').first()
    await expect(caret).toBeVisible()
    await expect(caret).toHaveCSS('margin-top', '-4px')
    expect(await caret.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none')
  })
})
