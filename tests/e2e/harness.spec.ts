import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Pins the e2e side of the test harness (task: chore/test-harness): the dev
// server really runs on PW_PORT, static assets are served, and the page is
// driveable end to end without console errors.

type Backpack = {
  id: string
  name: string
  brand: string
  lowestPriceUSD: number
  capacityLiters: number
  images: string[]
}

const catalog: Backpack[] = JSON.parse(
  readFileSync(resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'src', 'data', 'backpacks.json'), 'utf8')
)
const EXPECTED_PORT = String(process.env.PW_PORT || 4173)

const cards = (page: Page) => page.locator('main > div.grid > div')
const cardTitles = (page: Page) => cards(page).getByRole('heading', { level: 3 })
const brandSelect = (page: Page) => page.locator('header select').nth(0)
const sortSelect = (page: Page) => page.locator('header select').nth(1)
const modal = (page: Page) => page.locator('div.fixed.inset-0')

test('dev server is bound to PW_PORT and answers 200 for the document', async ({ page, request, baseURL }) => {
  expect(new URL(baseURL!).port).toBe(EXPECTED_PORT)

  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  expect(new URL(page.url()).port).toBe(EXPECTED_PORT)

  const direct = await request.get(`http://localhost:${EXPECTED_PORT}/`)
  expect(direct.status()).toBe(200)
  expect(await direct.text()).toContain('<div id="app">')
})

test('static catalog images referenced by the data are served with 200', async ({ request }) => {
  // First image of every backpack; keeps the run cheap but covers all 20 folders.
  for (const pack of catalog) {
    const res = await request.get(pack.images[0])
    expect(res.status(), `${pack.id}: ${pack.images[0]}`).toBe(200)
    expect(res.headers()['content-type'], pack.id).toMatch(/^image\//)
  }
})

test('page loads without console errors or uncaught exceptions', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('/')
  await expect(cards(page)).toHaveCount(catalog.length)

  expect(errors).toEqual([])
})

test('renders one card per catalog entry in curated order', async ({ page }) => {
  await page.goto('/')

  await expect(cardTitles(page)).toHaveText(catalog.map(b => b.name))
})

test('brand dropdown lists every unique brand once, alphabetically, after "all"', async ({ page }) => {
  await page.goto('/')

  const values = await brandSelect(page).locator('option').evaluateAll(opts =>
    opts.map(o => (o as HTMLOptionElement).value)
  )
  const uniqueBrands = [...new Set(catalog.map(b => b.brand))].sort()

  expect(values).toEqual(['all', ...uniqueBrands])
})

test('brand filter shows exactly that brand\'s packs for every brand', async ({ page }) => {
  await page.goto('/')

  const uniqueBrands = [...new Set(catalog.map(b => b.brand))].sort()
  for (const brand of uniqueBrands) {
    await brandSelect(page).selectOption(brand)
    const expected = catalog.filter(b => b.brand === brand).map(b => b.name)
    await expect(cardTitles(page)).toHaveText(expected)
  }

  await brandSelect(page).selectOption('all')
  await expect(cards(page)).toHaveCount(catalog.length)
})

test('sort dropdown reorders the grid', async ({ page }) => {
  await page.goto('/')

  const byPriceAsc = [...catalog].sort((a, b) => a.lowestPriceUSD - b.lowestPriceUSD)
  await sortSelect(page).selectOption('price-asc')
  await expect(cardTitles(page).first()).toHaveText(byPriceAsc[0].name)
  const ascTitles = await cardTitles(page).allTextContents()
  const ascPrices = ascTitles.map(t => catalog.find(b => b.name === t.trim())!.lowestPriceUSD)
  for (let i = 1; i < ascPrices.length; i++) expect(ascPrices[i]).toBeGreaterThanOrEqual(ascPrices[i - 1])

  await sortSelect(page).selectOption('price-desc')
  const descTitles = await cardTitles(page).allTextContents()
  const descPrices = descTitles.map(t => catalog.find(b => b.name === t.trim())!.lowestPriceUSD)
  for (let i = 1; i < descPrices.length; i++) expect(descPrices[i]).toBeLessThanOrEqual(descPrices[i - 1])

  await sortSelect(page).selectOption('capacity-desc')
  const capTitles = await cardTitles(page).allTextContents()
  const caps = capTitles.map(t => catalog.find(b => b.name === t.trim())!.capacityLiters)
  for (let i = 1; i < caps.length; i++) expect(caps[i]).toBeLessThanOrEqual(caps[i - 1])

  await sortSelect(page).selectOption('featured')
  await expect(cardTitles(page)).toHaveText(catalog.map(b => b.name))
})

test('search matches on material and reset restores everything', async ({ page }) => {
  await page.goto('/')
  const search = page.getByPlaceholder('Search packs or brands...')
  await expect(page.getByRole('button', { name: /Reset all filters/ })).toBeHidden()

  await search.fill('X-Pac')
  const expected = catalog.filter(b => JSON.stringify(b).toLowerCase().includes('x-pac'))
  expect(expected.length).toBeGreaterThan(0)
  await expect(cards(page).first()).toBeVisible()
  const count = await cards(page).count()
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThan(catalog.length)

  // The inline reset link only appears while a filter is active.
  const resetLink = page.getByRole('button', { name: /Reset all filters/ })
  await expect(resetLink).toBeVisible()
  await resetLink.click()
  await expect(cards(page)).toHaveCount(catalog.length)
  await expect(search).toHaveValue('')
  await expect(resetLink).toBeHidden()
})

test('modal opens for a non-first card and closes via the backdrop as well as the button', async ({ page }) => {
  await page.goto('/')
  const target = catalog[5]

  await cardTitles(page).nth(5).click()
  await expect(modal(page)).toBeVisible()
  await expect(modal(page).getByRole('heading', { level: 2, name: target.name })).toBeVisible()

  // Close with the ✕ button.
  await modal(page).getByRole('button', { name: 'Close details' }).click()
  await expect(modal(page)).toBeHidden()

  // Reopen and close by clicking the backdrop (top-left corner is outside the dialog panel).
  await cardTitles(page).nth(5).click()
  await expect(modal(page)).toBeVisible()
  await modal(page).click({ position: { x: 5, y: 5 } })
  await expect(modal(page)).toBeHidden()

  // Grid is unaffected by opening/closing the modal.
  await expect(cards(page)).toHaveCount(catalog.length)
})
