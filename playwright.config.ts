import { defineConfig, devices } from '@playwright/test'

// Several branches run e2e concurrently, so each run picks its own port via
// PW_PORT (falls back to 4173). The dev server is bound to exactly that port.
const PORT = process.env.PW_PORT || 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000
  }
})
