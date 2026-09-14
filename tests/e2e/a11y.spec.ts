import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Acceptance tests for README issue #8 (modal / carousel / swatch / card
// accessibility). Written independently of the implementation spec so they
// pin the *behaviour* the requirement asks for:
//   - a keyboard-only user can Tab (real Tab presses, no programmatic focus)
//     to a card, open it with Enter, Tab around the dialog without escaping,
//     close it with Escape and land back on the same card;
//   - the page does not scroll behind the open dialog and keeps its scroll
//     position once the dialog closes;
//   - carousel zones and swatches are real, focusable, labelled buttons whose
//     activation never opens the card;
//   - axe-core reports no critical violations anywhere on the page, with the
//     grid visible and with the dialog open.

const cards = (page: Page) => page.locator('main > div.grid > div[role="button"]')
const dialog = (page: Page) => page.getByRole('dialog')

const activeDescription = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return 'null'
    return `${el.tagName.toLowerCase()}#${el.id}[${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}]`
  })

const focusIsInsideDialog = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement
    return !!el && el !== document.body && el.closest('[role="dialog"]') !== null
  })

/** Press Tab from wherever focus is until the given locator is focused (bounded). */
const tabUntilFocused = async (page: Page, target: ReturnType<Page['locator']>, max = 40) => {
  for (let i = 0; i < max; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return i
    await page.keyboard.press('Tab')
  }
  throw new Error(`target never received focus after ${max} Tab presses; active = ${await activeDescription(page)}`)
}

// Every flow below must run without console errors / uncaught exceptions
// (e.g. Vue warnings about unknown modifiers or focus() on a detached node).
const consoleErrors: string[] = []

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(`${msg.type()}: ${msg.text()}`)
  })
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`))
  await page.goto('/')
  await expect(cards(page).first()).toBeVisible()
})

test.afterEach(() => {
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([])
})

test('keyboard-only: Tab to a card, Enter opens, Tab never escapes, Escape returns focus to the card', async ({ page }) => {
  const card = cards(page).first()

  // Real Tab presses from the top of the document, not a programmatic .focus().
  const presses = await tabUntilFocused(page, card)
  expect(presses, 'card must be reachable by Tab').toBeGreaterThan(0)

  await page.keyboard.press('Enter')
  const modal = dialog(page)
  await expect(modal).toBeVisible()
  await expect(modal).toHaveAttribute('role', 'dialog')
  await expect(modal).toHaveAttribute('aria-modal', 'true')

  // aria-labelledby resolves to the visible heading that names the pack.
  const labelledBy = (await modal.getAttribute('aria-labelledby'))!
  expect(labelledBy).toBeTruthy()
  const title = page.locator(`#${labelledBy}`)
  await expect(title).toBeVisible()
  await expect(title).toHaveText(/GR1 21L/)

  // Focus moved inside the dialog immediately on open.
  expect(await focusIsInsideDialog(page), `focus after open: ${await activeDescription(page)}`).toBe(true)

  // Opening with Enter must not immediately re-close the dialog (keyup lands inside).
  await page.waitForTimeout(150)
  await expect(modal).toBeVisible()

  // Tab forwards well past the number of focusable controls; focus must stay inside.
  const controls = await modal.locator('a[href], button:not([disabled])').count()
  expect(controls).toBeGreaterThan(3)
  for (let i = 0; i < controls + 3; i++) {
    await page.keyboard.press('Tab')
    expect(await focusIsInsideDialog(page), `Tab #${i + 1} escaped to ${await activeDescription(page)}`).toBe(true)
  }
  // ...and backwards too.
  for (let i = 0; i < controls + 3; i++) {
    await page.keyboard.press('Shift+Tab')
    expect(await focusIsInsideDialog(page), `Shift+Tab #${i + 1} escaped to ${await activeDescription(page)}`).toBe(true)
  }

  // Escape from a control deep inside the dialog closes it.
  await modal.getByRole('button', { name: 'Back to Catalog' }).focus()
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()
  await expect(card).toBeFocused()

  // The ✕ button has an accessible name (not the bare glyph).
  await page.keyboard.press('Enter')
  await expect(modal).toBeVisible()
  const close = modal.getByRole('button', { name: /close/i })
  await expect(close).toHaveCount(1)
  await close.focus()
  await page.keyboard.press('Enter')
  await expect(modal).toBeHidden()
  await expect(card).toBeFocused()
})

test('Shift+Tab straight after opening stays inside the dialog', async ({ page }) => {
  await cards(page).nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  expect(await focusIsInsideDialog(page), await activeDescription(page)).toBe(true)
  await page.keyboard.press('Shift+Tab')
  expect(await focusIsInsideDialog(page), await activeDescription(page)).toBe(true)
})

test('page does not scroll behind the modal and keeps its position after close', async ({ page }) => {
  // Make sure the document is scrollable and scroll part-way down.
  const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 200)
  expect(scrollable).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)

  // Open a card that is currently on screen with the mouse.
  const card = cards(page).nth(3)
  await card.scrollIntoViewIfNeeded()
  const before = await page.evaluate(() => window.scrollY)
  await card.getByRole('heading', { level: 3 }).click()
  await expect(dialog(page)).toBeVisible()

  // Opening (and moving focus into the dialog) must not jump the page.
  expect(await page.evaluate(() => window.scrollY)).toBe(before)

  // Wheel over the backdrop / dialog: the document must not move.
  await page.mouse.move(20, 20)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(200)
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
  await page.mouse.move(640, 360)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(200)
  expect(await page.evaluate(() => window.scrollY)).toBe(before)

  // Keyboard scrolling keys are also inert for the document while it is open.
  await page.keyboard.press('End')
  await page.waitForTimeout(150)
  expect(await page.evaluate(() => window.scrollY)).toBe(before)

  // Close: scroll position preserved and the document scrolls again.
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).not.toBe('hidden')
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)
})

test('mouse-opened dialog: backdrop click closes and focus returns to the card', async ({ page }) => {
  const card = cards(page).nth(2)
  await card.getByRole('heading', { level: 3 }).click()
  await expect(dialog(page)).toBeVisible()
  expect(await focusIsInsideDialog(page)).toBe(true)

  // Clicking inside the dialog panel must NOT close it.
  await dialog(page).getByText('Capacity', { exact: true }).click()
  await expect(dialog(page)).toBeVisible()

  // Clicking the backdrop outside the panel closes it and returns focus.
  await page.mouse.click(8, 8)
  await expect(dialog(page)).toBeHidden()
  await expect(card).toBeFocused()
})

test('Escape only acts while the dialog is open (listener is removed on close)', async ({ page }) => {
  const card = cards(page).first()
  await card.focus()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()

  // Re-open, close with the button, re-open again and make sure a single
  // Escape closes it (no stale listeners, no double-close side effects).
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  await dialog(page).getByRole('button', { name: 'Back to Catalog' }).click()
  await expect(dialog(page)).toBeHidden()
  await expect(card).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
  await expect(card).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('carousel zones: real buttons, hover reveal kept, focus ring visible, arrows work, nothing opens the card', async ({ page }) => {
  const card = cards(page).first()
  const prev = card.getByRole('button', { name: 'Previous image' })
  const next = card.getByRole('button', { name: 'Next image' })
  await expect(prev).toHaveAttribute('type', 'button')
  await expect(next).toHaveAttribute('type', 'button')
  await expect(prev).toHaveJSProperty('tagName', 'BUTTON')
  await expect(next).toHaveJSProperty('tagName', 'BUTTON')

  // Hover reveal: hidden until the card is hovered (same visual as before).
  await page.mouse.move(0, 0)
  await expect.poll(() => next.evaluate(el => getComputedStyle(el).opacity)).toBe('0')
  await expect(next).toHaveCSS('cursor', 'e-resize')
  await expect(prev).toHaveCSS('cursor', 'w-resize')
  await card.hover()
  await expect.poll(() => next.evaluate(el => getComputedStyle(el).opacity)).toBe('1')

  // Live region announces the slide; dots are hidden from AT.
  const live = card.locator('[aria-live]')
  await expect(live).toHaveCount(1)
  await expect(live).toHaveText(/^\s*Image 1 of (\d+)\s*$/)
  const total = Number((await live.innerText()).match(/of (\d+)/)![1])
  expect(total).toBeGreaterThan(1)
  const dotsContainer = card.locator('[aria-hidden="true"]').filter({ has: page.locator('span') }).first()
  await expect(dotsContainer.locator('span')).toHaveCount(total)

  // Keyboard: Tab from the card root lands on the previous-image zone, which gets a visible ring.
  await page.mouse.move(0, 0)
  await card.focus()
  await page.keyboard.press('Tab')
  await expect(prev).toBeFocused()
  await expect.poll(() => prev.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  const ringShadow = await prev.locator('span').first().evaluate(el => getComputedStyle(el).boxShadow)
  expect(ringShadow, 'focused zone should show a ring').not.toBe('none')

  await page.keyboard.press('ArrowRight')
  await expect(live).toHaveText(/Image 2 of/)
  await page.keyboard.press('ArrowRight')
  await expect(live).toHaveText(/Image 3 of/)
  await page.keyboard.press('ArrowLeft')
  await expect(live).toHaveText(/Image 2 of/)
  await page.keyboard.press('ArrowLeft')
  await expect(live).toHaveText(/Image 1 of/)
  // Previous from the first wraps to the last.
  await page.keyboard.press('ArrowLeft')
  await expect(live).toHaveText(new RegExp(`Image ${total} of`))

  // Space / Enter on a zone acts on the carousel only.
  await page.keyboard.press('Space')
  await expect(live).toHaveText(new RegExp(`Image ${total - 1} of`))
  await expect(dialog(page)).toBeHidden()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeHidden()

  // Mouse click on the zones must not open the card either.
  await next.click()
  await prev.click()
  await expect(dialog(page)).toBeHidden()
  await expect(cards(page).first()).toBeVisible()
})

test('swatches: labelled buttons, tooltip on focus/hover/click, isolation, pagination button focusable', async ({ page }) => {
  // Pick a card that has more than 9 colourways so the ">" pagination control exists.
  const paginated = cards(page).filter({ has: page.getByRole('button', { name: 'View more colors' }) }).first()
  await expect(paginated).toBeVisible()
  await paginated.scrollIntoViewIfNeeded()

  const more = paginated.getByRole('button', { name: 'View more colors' })
  await expect(more).toHaveAttribute('type', 'button')
  await expect(more).toHaveAttribute('title', 'View more colors')

  const swatchButtons = paginated.locator('button[aria-label]').filter({ has: page.locator('span[style*="background-color"]') })
  await expect(swatchButtons).toHaveCount(8)
  const names = await swatchButtons.evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
  expect(names.every(n => n && n.length > 0)).toBe(true)
  expect(await swatchButtons.evaluateAll(els => els.every(e => e.tagName === 'BUTTON' && e.getAttribute('type') === 'button'))).toBe(true)

  // Tab through the swatches: each one shows exactly its own tooltip.
  await swatchButtons.nth(0).focus()
  const tips = paginated.getByRole('tooltip')
  await expect(tips).toHaveCount(1)
  await expect(tips).toHaveText(names[0]!)
  await page.keyboard.press('Tab')
  await expect(swatchButtons.nth(1)).toBeFocused()
  await expect(tips).toHaveCount(1)
  await expect(tips).toHaveText(names[1]!)
  const ring = await swatchButtons.nth(1).evaluate(el => getComputedStyle(el).boxShadow)
  expect(ring, 'focused swatch should show a ring').not.toBe('none')

  // Enter on the focused swatch toggles its tooltip and never opens the dialog.
  await page.keyboard.press('Enter')
  await expect(tips).toHaveCount(0)
  await expect(dialog(page)).toBeHidden()
  await page.keyboard.press('Enter')
  await expect(tips).toHaveText(names[1]!)
  await expect(dialog(page)).toBeHidden()

  // Tab off the last swatch lands on the pagination button, which paginates via keyboard.
  await swatchButtons.nth(7).focus()
  await page.keyboard.press('Tab')
  await expect(more).toBeFocused()
  const moreRing = await more.evaluate(el => getComputedStyle(el).boxShadow)
  expect(moreRing, 'focused pagination button should show a ring').not.toBe('none')
  await expect(tips).toHaveCount(0)
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeHidden()
  const namesAfter = await swatchButtons.evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
  expect(namesAfter).not.toEqual(names)

  // Mouse: hover shows, moving away hides, clicking the '>' does not open the card.
  await swatchButtons.nth(0).hover()
  await expect(tips).toHaveText(namesAfter[0]!)
  await page.mouse.move(0, 0)
  await expect(tips).toHaveCount(0)
  await more.click()
  await expect(dialog(page)).toBeHidden()
})

test.describe('touch', () => {
  test.use({ hasTouch: true })

  test('tap toggles a swatch tooltip, a second tap on another swatch moves it, and neither opens the card', async ({ page }) => {
    const card = cards(page).first()
    const swatches = card.locator('button[aria-label]').filter({ has: page.locator('span[style*="background-color"]') })
    expect(await swatches.count()).toBeGreaterThan(1)
    const tips = card.getByRole('tooltip')

    await swatches.nth(0).tap()
    await expect(tips).toHaveCount(1)
    await expect(tips).toHaveText((await swatches.nth(0).getAttribute('aria-label'))!)
    await swatches.nth(1).tap()
    await expect(tips).toHaveCount(1)
    await expect(tips).toHaveText((await swatches.nth(1).getAttribute('aria-label'))!)
    await swatches.nth(1).tap()
    await expect(tips).toHaveCount(0)
    await expect(dialog(page)).toBeHidden()

    // Tapping the card body still opens it on touch.
    await card.getByRole('heading', { level: 3 }).tap()
    await expect(dialog(page)).toBeVisible()
  })
})

test('every card is a labelled button that opens with Enter and Space and shows a focus ring', async ({ page }) => {
  const all = cards(page)
  const count = await all.count()
  expect(count).toBeGreaterThan(10)
  const labels = await all.evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
  expect(labels.every(l => /^View details for \S+ .+/.test(l ?? ''))).toBe(true)
  expect(new Set(labels).size).toBe(count)
  expect(await all.evaluateAll(els => els.every(e => e.getAttribute('tabindex') === '0'))).toBe(true)

  const last = all.last()
  await last.scrollIntoViewIfNeeded()
  await last.focus()
  // Keyboard-focus ring is present (Tailwind ring renders as box-shadow).
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(last).toBeFocused()
  expect(await last.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none')

  const before = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('Space')
  await expect(dialog(page)).toBeVisible()
  // Space must not scroll the page.
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
  await expect(last).toBeFocused()
})

test('axe: no critical violations on the whole page, grid visible or dialog open', async ({ page }) => {
  const scan = async () => {
    const results = await new AxeBuilder({ page }).analyze()
    return results.violations.filter(v => v.impact === 'critical')
  }
  const gridViolations = await scan()
  expect(gridViolations, JSON.stringify(gridViolations, null, 2)).toEqual([])

  await cards(page).first().focus()
  await page.keyboard.press('Enter')
  await expect(dialog(page)).toBeVisible()
  const dialogViolations = await scan()
  expect(dialogViolations, JSON.stringify(dialogViolations, null, 2)).toEqual([])
})
