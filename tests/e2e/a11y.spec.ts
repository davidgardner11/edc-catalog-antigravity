import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// README issue #8: keyboard and screen-reader access for the card grid, the
// detail modal, the image carousel zones and the colour swatches.

const cards = (page: Page) => page.locator('main > div.grid > div')
const dialog = (page: Page) => page.getByRole('dialog')

const criticalViolations = async (page: Page, include?: string) => {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  if (include) builder = builder.include(include)
  const results = await builder.analyze()
  return results.violations.filter(v => v.impact === 'critical')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(cards(page).first()).toBeVisible()
})

test('cards are labelled buttons that open the dialog with Enter and Space', async ({ page }) => {
  const first = cards(page).first()
  await expect(first).toHaveAttribute('role', 'button')
  await expect(first).toHaveAttribute('tabindex', '0')
  await expect(first).toHaveAttribute('aria-label', 'View details for GORUCK GR1 21L')

  await first.focus()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()

  await first.focus()
  await page.keyboard.press('Space')
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
})

test('dialog has the right semantics, traps focus, locks scroll and returns focus on Escape', async ({ page }) => {
  const card = cards(page).nth(2)
  await card.focus()
  await page.keyboard.press('Enter')

  const modal = dialog(page)
  await expect(modal).toBeVisible()
  await expect(modal).toHaveAttribute('aria-modal', 'true')
  const labelledBy = await modal.getAttribute('aria-labelledby')
  expect(labelledBy).toBeTruthy()
  await expect(page.locator(`#${labelledBy}`)).toHaveText(await card.getByRole('heading', { level: 3 }).innerText())

  // Focus moved into the dialog, onto the heading.
  const title = page.locator(`#${labelledBy}`)
  await expect(title).toBeFocused()
  const closeButton = modal.getByRole('button', { name: 'Close details' })

  // Body scroll is locked while the dialog is open.
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')

  // Tab forwards through every focusable element and back to the start without escaping.
  const focusableCount = await modal.evaluate(el =>
    el.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])').length
  )
  expect(focusableCount).toBeGreaterThan(2)
  for (let i = 0; i <= focusableCount; i++) {
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)
    expect(inside, `Tab #${i + 1} left the dialog`).toBe(true)
  }

  // Tab from the last element wraps to the first, Shift+Tab from the first wraps to the last.
  const backButton = modal.getByRole('button', { name: 'Back to Catalog' })
  await backButton.focus()
  await page.keyboard.press('Tab')
  await expect(closeButton).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(backButton).toBeFocused()

  // Escape closes and focus lands back on the card that opened it.
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()
  await expect(card).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('backdrop click still closes the dialog', async ({ page }) => {
  await cards(page).first().getByRole('heading', { level: 3 }).click()
  await expect(dialog(page)).toBeVisible()
  await page.locator('div.fixed.inset-0').click({ position: { x: 5, y: 5 } })
  await expect(dialog(page)).toBeHidden()
})

test('carousel zones are buttons with arrow-key support and a live slide announcement', async ({ page }) => {
  const card = cards(page).first()
  const prev = card.getByRole('button', { name: 'Previous image' })
  const next = card.getByRole('button', { name: 'Next image' })
  const live = card.locator('[aria-live="polite"]')

  await expect(prev).toHaveAttribute('type', 'button')
  await expect(next).toHaveAttribute('type', 'button')
  await expect(live).toHaveText(/Image 1 of \d+/)
  await expect(card.locator('[aria-hidden="true"] > span').first()).toBeAttached()

  await next.focus()
  await expect(next).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(live).toHaveText(/Image 2 of \d+/)
  await page.keyboard.press('ArrowLeft')
  await expect(live).toHaveText(/Image 1 of \d+/)

  // Activating a zone does not bubble up and open the card dialog.
  await page.keyboard.press('Enter')
  await expect(live).toHaveText(/Image 2 of \d+/)
  await expect(dialog(page)).toBeHidden()
  await next.click()
  await expect(dialog(page)).toBeHidden()
})

test('swatches are labelled buttons whose tooltip shows on focus and toggles on click', async ({ page }) => {
  const card = cards(page).first()
  const swatches = card.locator('button[aria-label]').filter({ has: page.locator('span[style]') })
  const count = await swatches.count()
  expect(count).toBeGreaterThan(1)

  const first = swatches.first()
  const name = (await first.getAttribute('aria-label'))!
  await first.focus()
  await expect(card.getByRole('tooltip')).toHaveText(name)
  await expect(card.getByRole('tooltip')).toHaveCount(1)

  // Only one tooltip at a time.
  await swatches.nth(1).focus()
  await expect(card.getByRole('tooltip')).toHaveCount(1)
  await expect(card.getByRole('tooltip')).toHaveText((await swatches.nth(1).getAttribute('aria-label'))!)

  // Hovering shows the tooltip; clicking toggles it off and on again, and never opens the dialog.
  await first.hover()
  await expect(card.getByRole('tooltip')).toHaveText(name)
  await first.click()
  await expect(dialog(page)).toBeHidden()
  await expect(card.getByRole('tooltip')).toHaveCount(0)
  await first.click()
  await expect(card.getByRole('tooltip')).toHaveText(name)
  await expect(dialog(page)).toBeHidden()
})

test.describe('touch', () => {
  test.use({ hasTouch: true })

  test('tapping a swatch on a touch device toggles its tooltip', async ({ page }) => {
    const card = cards(page).first()
    const swatch = card.locator('button[aria-label]').filter({ has: page.locator('span[style]') }).first()
    const name = (await swatch.getAttribute('aria-label'))!

    await swatch.tap()
    await expect(card.getByRole('tooltip')).toHaveText(name)
    await swatch.tap()
    await expect(card.getByRole('tooltip')).toHaveCount(0)
    await expect(dialog(page)).toBeHidden()
  })
})

test('axe reports no critical violations on the grid', async ({ page }) => {
  const violations = await criticalViolations(page, 'main')
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
})

test('axe reports no critical violations on the open dialog', async ({ page }) => {
  await cards(page).first().getByRole('heading', { level: 3 }).click()
  await expect(dialog(page)).toBeVisible()
  const violations = await criticalViolations(page, '[role="dialog"]')
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
})
