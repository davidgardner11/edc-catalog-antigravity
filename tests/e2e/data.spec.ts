import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Acceptance e2e for README issue #1 (task: fix/data-best-price): the modal's
// "Best Price" badge sits on the cheapest retailer offer(s) for every pack,
// and the card / modal price line agree with that minimum.

type Offer = { name: string; priceUSD: number; url: string; isLowestPrice?: boolean }
type Backpack = {
  id: string
  name: string
  brand: string
  lowestPriceUSD: number
  primaryRetailer: string
  retailers: Offer[]
}

const catalog: Backpack[] = JSON.parse(
  readFileSync(resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'src', 'data', 'backpacks.json'), 'utf8')
)

const cards = (page: Page) => page.locator('main > div.grid > div')
const cardTitles = (page: Page) => cards(page).getByRole('heading', { level: 3 })
const searchInput = (page: Page) => page.getByPlaceholder('Search packs or brands...')
const modal = (page: Page) => page.locator('div.fixed.inset-0')
const offerLinks = (page: Page) => modal(page).locator('a[target="_blank"]')
const badge = (scope: ReturnType<Page['locator']>) => scope.getByText('Best Price', { exact: true })

const minPrice = (offers: Offer[]) => Math.min(...offers.map(o => o.priceUSD))

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Synik 22 modal: only Carryology Marketplace ($320) carries the Best Price badge', async ({ page }) => {
  await searchInput(page).fill('Synik')
  await expect(cards(page)).toHaveCount(1)
  await cardTitles(page).first().click()
  await expect(modal(page)).toBeVisible()

  const offers = offerLinks(page)
  await expect(offers).toHaveCount(2)

  const official = offers.nth(0)
  const carryology = offers.nth(1)
  await expect(official).toContainText('Tom Bihn (Official)')
  await expect(official).toContainText('$340')
  await expect(badge(official)).toHaveCount(0)

  await expect(carryology).toContainText('Carryology Marketplace')
  await expect(carryology).toContainText('$320')
  await expect(badge(carryology)).toBeVisible()

  await expect(badge(modal(page))).toHaveCount(1)

  // Modal price line reflects the minimum and its retailer.
  await expect(modal(page).getByText('$320 (Carryology Marketplace)')).toBeVisible()

  // Retailer URLs unchanged.
  await expect(official).toHaveAttribute('href', 'https://www.tombihn.com/products/synik-22')
  await expect(carryology).toHaveAttribute('href', 'https://www.carryology.com/')
})

test('Synik 22 card shows the minimum price and the cheapest retailer', async ({ page }) => {
  await searchInput(page).fill('Synik')
  const card = cards(page).first()
  await expect(card).toContainText('$320')
  await expect(card).toContainText('Carryology Marketplace')
  await expect(card).not.toContainText('$340')
})

test('every pack badges exactly the minimum-priced offers and no "(Official)" suffix leaks into the card label', async ({ page }) => {
  test.setTimeout(120_000)
  await expect(cards(page)).toHaveCount(catalog.length)

  for (let i = 0; i < catalog.length; i++) {
    const pack = catalog[i]
    const min = minPrice(pack.retailers)
    const card = cards(page).nth(i)

    // Card label: minimum price and primary retailer without " (Official)".
    await expect(card, pack.id).toContainText(`$${min}`)
    await expect(card, pack.id).toContainText(pack.primaryRetailer)
    await expect(card, pack.id).not.toContainText('(Official)')

    await cardTitles(page).nth(i).click()
    await expect(modal(page), pack.id).toBeVisible()
    await expect(modal(page).getByRole('heading', { level: 2, name: pack.name }), pack.id).toBeVisible()

    const offers = offerLinks(page)
    await expect(offers, pack.id).toHaveCount(pack.retailers.length)

    const expectedBadges = pack.retailers.filter(o => o.priceUSD === min).length
    await expect(badge(modal(page)), pack.id).toHaveCount(expectedBadges)

    for (let j = 0; j < pack.retailers.length; j++) {
      const offer = pack.retailers[j]
      const link = offers.nth(j)
      const label = `${pack.id} / ${offer.name}`
      await expect(link, label).toContainText(offer.name)
      await expect(link, label).toContainText(`$${offer.priceUSD}`)
      await expect(link, label).toHaveAttribute('href', offer.url)
      await expect(badge(link), label).toHaveCount(offer.priceUSD === min ? 1 : 0)
    }

    // Modal price line uses the minimum.
    await expect(modal(page).getByText(`$${min} (${pack.primaryRetailer})`), pack.id).toBeVisible()

    // Close via the backdrop (the ✕ can sit outside the viewport once the grid is scrolled).
    await modal(page).click({ position: { x: 5, y: 5 } })
    await expect(modal(page), pack.id).toBeHidden()
  }
})

test('price ascending sort places Synik 22 by its $320 minimum', async ({ page }) => {
  const sortSelect = page.locator('header select').nth(1)
  await sortSelect.selectOption('price-asc')

  const titles = await cardTitles(page).allTextContents()
  const synikIdx = titles.findIndex(t => t.includes('Synik'))
  expect(synikIdx).toBeGreaterThan(-1)

  // In price-asc order, every card before Synik costs <= 320 and every card after >= 320.
  const sorted = [...catalog].sort((a, b) => a.lowestPriceUSD - b.lowestPriceUSD)
  const expectedIdx = sorted.findIndex(p => p.id === 'tom-bihn-synik-22')
  const before = sorted.slice(0, expectedIdx).map(p => p.lowestPriceUSD)
  expect(Math.max(...before)).toBeLessThanOrEqual(320)
  // The card at Synik's position must display $320, not the official $340.
  await expect(cards(page).nth(synikIdx)).toContainText('$320')
})
