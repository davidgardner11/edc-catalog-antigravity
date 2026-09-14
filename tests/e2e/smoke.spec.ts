import { test, expect, type Page } from '@playwright/test'

const TOTAL_BACKPACKS = 20

// Each BackpackCard is a direct child of the main catalog grid.
const cards = (page: Page) => page.locator('main > div.grid > div')
const searchInput = (page: Page) => page.getByPlaceholder('Search packs or brands...')
const brandSelect = (page: Page) => page.locator('header select').first()
const modal = (page: Page) => page.locator('div.fixed.inset-0')

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('page loads with the catalog header', async ({ page }) => {
  await expect(page).toHaveTitle(/Top 20 EDC Backpacks/)
  await expect(page.getByRole('heading', { level: 1, name: 'Top 20 EDC Backpacks' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Everyday Carry Card Deck' })).toBeVisible()
})

test('renders all 20 backpack cards', async ({ page }) => {
  await expect(cards(page)).toHaveCount(TOTAL_BACKPACKS)
  await expect(page.getByText(`Displaying ${TOTAL_BACKPACKS} of ${TOTAL_BACKPACKS}`)).toBeVisible()
  await expect(cards(page).first()).toContainText('GR1 21L')
})

test('search narrows the grid', async ({ page }) => {
  await searchInput(page).fill('Synik')

  await expect(cards(page)).toHaveCount(1)
  await expect(cards(page).first()).toContainText('Tom Bihn')
  await expect(page.getByText(`Displaying 1 of ${TOTAL_BACKPACKS}`)).toBeVisible()

  await searchInput(page).fill('no-such-backpack-xyz')
  await expect(cards(page)).toHaveCount(0)
  await expect(page.getByText('No backpacks match your filter')).toBeVisible()

  await page.getByRole('button', { name: 'Reset Filters' }).click()
  await expect(cards(page)).toHaveCount(TOTAL_BACKPACKS)
  await expect(searchInput(page)).toHaveValue('')
})

test('brand filter narrows the grid to one brand', async ({ page }) => {
  await brandSelect(page).selectOption('Bellroy')

  await expect(cards(page)).toHaveCount(1)
  await expect(cards(page).first()).toContainText('Bellroy')
  await expect(cards(page).first()).toContainText('Transit Workpack 20L')

  await brandSelect(page).selectOption('all')
  await expect(cards(page)).toHaveCount(TOTAL_BACKPACKS)
})

test('clicking a card opens the detail modal and the close button dismisses it', async ({ page }) => {
  await expect(modal(page)).toBeHidden()

  // The image carousel swallows clicks (prev/next zones), so click the name band.
  await cards(page).first().getByRole('heading', { level: 3 }).click()

  await expect(modal(page)).toBeVisible()
  await expect(modal(page).getByRole('heading', { level: 2, name: 'GR1 21L' })).toBeVisible()
  await expect(modal(page).getByText('21 Liters')).toBeVisible()

  await modal(page).getByRole('button', { name: 'Close details' }).click()

  await expect(modal(page)).toBeHidden()
  await expect(cards(page)).toHaveCount(TOTAL_BACKPACKS)
})

test('modal badges the cheapest retailer as Best Price (Tom Bihn Synik 22)', async ({ page }) => {
  await searchInput(page).fill('Synik')
  await cards(page).first().getByRole('heading', { level: 3 }).click()
  await expect(modal(page)).toBeVisible()

  // Retailer offers are the external links inside the "Shop At" section.
  const offers = modal(page).locator('a[target="_blank"]')
  await expect(offers).toHaveCount(2)

  const official = offers.filter({ hasText: 'Tom Bihn (Official)' })
  const carryology = offers.filter({ hasText: 'Carryology Marketplace' })

  await expect(carryology).toContainText('$320')
  await expect(carryology.getByText('Best Price')).toBeVisible()
  await expect(official).toContainText('$340')
  await expect(official.getByText('Best Price')).toHaveCount(0)
  await expect(modal(page).getByText('Best Price')).toHaveCount(1)
})
