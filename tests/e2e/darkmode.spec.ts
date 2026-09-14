import { test, expect, type Page } from '@playwright/test'

// Acceptance tests for README issue #7 (fix/dark-mode-persist), written by the
// tester independently of the developer's dark-mode.spec.ts. They pin:
//   - the `dark` class is decided by the inline head script, i.e. it is already
//     correct while the app bundle is still blocked from loading (no flash);
//   - the choice survives reload, a brand-new tab, and works from the mobile toggle;
//   - garbage or unavailable localStorage degrades to the OS preference without errors;
//   - both toggle buttons expose aria-label / aria-pressed in sync.

const THEME_KEY = 'edc-theme'
const APP_ENTRY = '**/src/main.ts'

const html = (page: Page) => page.locator('html')
const visibleToggle = (page: Page) => page.getByRole('button', { name: 'Toggle dark mode' }).locator('visible=true')
const allToggles = (page: Page) => page.locator('button[aria-label="Toggle dark mode"]')
const cards = (page: Page) => page.locator('main > div.grid > div')

const stored = (page: Page) => page.evaluate(key => localStorage.getItem(key), THEME_KEY)

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`))
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  return errors
}

/**
 * Loads "/" while holding back the Vue entry module, and reports the <html>
 * class + mount state observed while the app is guaranteed not to have run.
 * The caller gets a `release` to let the bundle through afterwards.
 */
async function loadWithAppHeld(page: Page) {
  let release!: () => void
  const held = new Promise<void>(resolve => (release = resolve))
  let continued: Promise<void> = Promise.resolve()
  await page.route(APP_ENTRY, route => {
    continued = held.then(() => route.continue())
    return continued
  })

  await page.goto('/', { waitUntil: 'commit' })
  // <body> parsed => the inline head script has certainly executed.
  await page.waitForFunction(() => document.getElementById('app') !== null)

  const snapshot = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains('dark'),
    appChildren: document.getElementById('app')?.childElementCount ?? -1
  }))

  return {
    snapshot,
    release: async () => {
      release()
      await continued
      await page.unroute(APP_ENTRY)
    }
  }
}

test.describe('dark mode acceptance (README #7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('OS dark + nothing stored: <html> is already dark while the app bundle is blocked', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const { snapshot, release } = await loadWithAppHeld(page)

    expect(snapshot).toEqual({ dark: true, appChildren: 0 })

    await release()
    await expect(cards(page).first()).toBeVisible()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(visibleToggle(page)).toHaveAttribute('aria-pressed', 'true')
  })

  test('stored "light" + OS dark: <html> is already light while the app bundle is blocked', async ({ page }) => {
    await page.evaluate(key => localStorage.setItem(key, 'light'), THEME_KEY)
    await page.emulateMedia({ colorScheme: 'dark' })
    const { snapshot, release } = await loadWithAppHeld(page)

    expect(snapshot).toEqual({ dark: false, appChildren: 0 })

    await release()
    await expect(cards(page).first()).toBeVisible()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await expect(visibleToggle(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('stored "dark" + OS light: <html> is already dark while the app bundle is blocked', async ({ page }) => {
    await page.evaluate(key => localStorage.setItem(key, 'dark'), THEME_KEY)
    await page.emulateMedia({ colorScheme: 'light' })
    const { snapshot, release } = await loadWithAppHeld(page)

    expect(snapshot).toEqual({ dark: true, appChildren: 0 })

    await release()
    await expect(html(page)).toHaveClass(/\bdark\b/)
  })

  test('toggled theme survives a reload and a brand-new tab in the same browser context', async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    await visibleToggle(page).click()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    expect(await stored(page)).toBe('dark')

    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    const fresh = await context.newPage()
    await fresh.emulateMedia({ colorScheme: 'light' })
    await fresh.goto('/')
    await expect(html(fresh)).toHaveClass(/\bdark\b/)
    await expect(visibleToggle(fresh)).toHaveAttribute('aria-pressed', 'true')
    await fresh.close()
  })

  test('mobile toggle persists the choice too', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    const mobileToggle = visibleToggle(page)
    await expect(mobileToggle).toHaveCount(1)
    await expect(mobileToggle).toHaveAttribute('title', 'Toggle Dark Mode')

    await mobileToggle.click()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    expect(await stored(page)).toBe('dark')

    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(visibleToggle(page)).toHaveAttribute('aria-pressed', 'true')
  })

  test('clearing localStorage after an explicit choice goes back to following the OS', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await visibleToggle(page).click() // explicit: light
    expect(await stored(page)).toBe('light')
    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
  })

  test('an unrecognised stored value is ignored in favour of the OS preference', async ({ page }) => {
    await page.evaluate(key => localStorage.setItem(key, 'banana'), THEME_KEY)
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    // Still following the OS because there is no valid explicit choice.
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveClass(/\bdark\b/)
  })

  test('localStorage throwing on access does not break load or the toggle', async ({ page }) => {
    const errors = collectErrors(page)
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Access is denied for this document.', 'SecurityError')
        }
      })
    })

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expect(cards(page).first()).toBeVisible()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    await visibleToggle(page).click()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await expect(visibleToggle(page)).toHaveAttribute('aria-pressed', 'false')

    await visibleToggle(page).click()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    expect(errors).toEqual([])
  })

  test('the full toggle / OS-change / reload flow produces no console errors', async ({ page }) => {
    const errors = collectErrors(page)

    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await visibleToggle(page).click()
    await visibleToggle(page).click()
    await page.reload()
    await expect(cards(page).first()).toBeVisible()

    expect(errors).toEqual([])
  })

  test('both toggle buttons expose aria-label and keep aria-pressed in sync', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()

    await expect(allToggles(page)).toHaveCount(2)
    for (const btn of await allToggles(page).all()) {
      await expect(btn).toHaveAttribute('aria-pressed', 'false')
      await expect(btn).toHaveAttribute('type', 'button')
    }

    await visibleToggle(page).click()
    for (const btn of await allToggles(page).all()) {
      await expect(btn).toHaveAttribute('aria-pressed', 'true')
    }
    // Desktop button keeps its original dynamic title.
    await expect(visibleToggle(page)).toHaveAttribute('title', 'Switch to Light Mode')
  })

  test('served document: inline theme script sits in <head> before any stylesheet and any module script', async ({ request }) => {
    const doc = await (await request.get('/')).text()
    const headEnd = doc.indexOf('</head>')
    expect(headEnd).toBeGreaterThan(-1)
    const head = doc.slice(0, headEnd)

    const inlineScriptAt = head.search(/<script>\s*\(function/)
    expect(inlineScriptAt).toBeGreaterThan(-1)

    const inlineScript = head.slice(inlineScriptAt, head.indexOf('</script>', inlineScriptAt))
    expect(inlineScript).toContain(`'${THEME_KEY}'`)
    expect(inlineScript).toContain('prefers-color-scheme: dark')
    expect(inlineScript).toMatch(/try\s*\{/)
    expect(inlineScript).toContain('document.documentElement.classList')

    const firstStylesheetAt = head.search(/<link[^>]+rel="stylesheet"/)
    expect(firstStylesheetAt).toBeGreaterThan(inlineScriptAt)

    // Nothing that can paint or run synchronously precedes it. (Vite's dev
    // client is injected first in dev, but it is a deferred module script.)
    const beforeScript = head.slice(0, inlineScriptAt)
    expect(beforeScript).not.toMatch(/<style|rel="stylesheet"/)
    const scriptsBefore = beforeScript.match(/<script[^>]*>/g) ?? []
    for (const tag of scriptsBefore) expect(tag).toContain('type="module"')
  })
})
