import { test, expect } from '@playwright/test'

// README issues #2 + #3: the favicon linked from index.html and the image
// placeholder used by CardCarousel / BackpackModal must be served by the dev
// server rather than 404 on every load.

test('GET /favicon.svg returns 200 with an SVG content type', async ({ request }) => {
  const res = await request.get('/favicon.svg')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/image\/svg\+xml/)
  expect(await res.text()).toContain('<svg')
})

test('GET /images/placeholder.webp returns 200 with a WebP content type', async ({ request }) => {
  const res = await request.get('/images/placeholder.webp')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/image\/webp/)
  const body = await res.body()
  expect(body.subarray(0, 4).toString('ascii')).toBe('RIFF')
  expect(body.subarray(8, 12).toString('ascii')).toBe('WEBP')
})

test('page load does not request any missing asset (no 404 responses)', async ({ page }) => {
  const notFound: string[] = []
  page.on('response', res => {
    if (res.status() === 404) notFound.push(res.url())
  })

  await page.goto('/')
  await expect(page.locator('main > div.grid > div')).toHaveCount(20)
  await page.waitForLoadState('networkidle')

  expect(notFound).toEqual([])
})
