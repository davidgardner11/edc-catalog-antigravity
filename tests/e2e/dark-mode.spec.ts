import { test, expect, type Page } from '@playwright/test'

// README issue #7: the theme must survive a reload, respect prefers-color-scheme
// when nothing is stored, and be applied before first paint (no flash).

const THEME_KEY = 'edc-theme'

const html = (page: Page) => page.locator('html')
// Desktop viewport: the md:flex toggle is the visible one.
const toggle = (page: Page) => page.getByRole('button', { name: 'Toggle dark mode' }).locator('visible=true')

const storedTheme = (page: Page) => page.evaluate(key => localStorage.getItem(key), THEME_KEY)

test.describe('dark mode persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test from a clean slate so no stored choice leaks between tests.
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('starts light when nothing is stored and the OS prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()

    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
    expect(await storedTheme(page)).toBeNull()
  })

  test('toggle then reload keeps the chosen theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    await toggle(page).click()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
    expect(await storedTheme(page)).toBe('dark')

    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

    await toggle(page).click()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    expect(await storedTheme(page)).toBe('light')

    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('with no stored choice, prefers-color-scheme: dark loads dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()

    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
    expect(await storedTheme(page)).toBeNull()
  })

  test('follows live OS changes until the user toggles, then the stored choice wins', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).not.toHaveClass(/\bdark\b/)

    // Explicit choice: dark. The OS flipping back to light must no longer matter.
    await toggle(page).click()
    await expect(html(page)).toHaveClass(/\bdark\b/)
    expect(await storedTheme(page)).toBe('dark')

    await page.emulateMedia({ colorScheme: 'light' })
    await page.waitForTimeout(100)
    await expect(html(page)).toHaveClass(/\bdark\b/)

    // And after a reload with the OS on light, the stored dark choice still wins.
    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)
  })

  test('a stored preference beats the OS preference on load', async ({ page }) => {
    await page.evaluate(key => localStorage.setItem(key, 'light'), THEME_KEY)
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()

    await expect(html(page)).not.toHaveClass(/\bdark\b/)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('the dark class is applied before <body> exists (no flash of the wrong theme)', async ({ page }) => {
    // Observe the <html> class from document creation onwards and record the
    // document state at the moment "dark" first appears. The inline head script
    // runs while the parser is still in <head>, i.e. before <body> is created
    // and long before the Vue bundle executes.
    await page.addInitScript(() => {
      const w = window as unknown as { __darkApplied?: { readyState: string; hadBody: boolean; appMounted: boolean } }
      const observer = new MutationObserver(() => {
        if (w.__darkApplied || !document.documentElement?.classList.contains('dark')) return
        w.__darkApplied = {
          readyState: document.readyState,
          hadBody: document.body !== null,
          appMounted: (document.getElementById('app')?.childElementCount ?? 0) > 0
        }
        observer.disconnect()
      })
      observer.observe(document, { attributes: true, attributeFilter: ['class'], subtree: true })
    })

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expect(html(page)).toHaveClass(/\bdark\b/)

    const applied = await page.evaluate(() => (window as unknown as { __darkApplied?: unknown }).__darkApplied)
    expect(applied).toEqual({ readyState: 'loading', hadBody: false, appMounted: false })
  })

  test('the inline theme script precedes every stylesheet in the document head', async ({ request }) => {
    const document = await (await request.get('/')).text()
    const head = document.slice(0, document.indexOf('</head>'))

    const scriptAt = head.indexOf('edc-theme')
    const firstStylesheetAt = head.search(/<link[^>]+rel="stylesheet"/)

    expect(scriptAt).toBeGreaterThan(-1)
    expect(head).toContain('prefers-color-scheme: dark')
    expect(firstStylesheetAt).toBeGreaterThan(scriptAt)
  })
})
