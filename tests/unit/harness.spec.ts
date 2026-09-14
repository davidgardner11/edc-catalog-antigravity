// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Pins the shape of the test harness itself (task: chore/test-harness) so a
// later branch cannot silently drop a script, change the e2e port convention,
// or pull the tests into the production typecheck.

const ROOT = resolve(__dirname, '..', '..')
const readJson = (rel: string) => JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8'))

describe('package.json scripts and devDependencies', () => {
  const pkg = readJson('package.json')

  it('keeps the original build script untouched', () => {
    expect(pkg.scripts.build).toBe('vue-tsc && vite build')
    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.scripts.preview).toBe('vite preview')
  })

  it('exposes the required harness scripts', () => {
    expect(pkg.scripts.test).toBe('vitest run')
    expect(pkg.scripts['test:watch']).toBe('vitest')
    expect(pkg.scripts['test:e2e']).toBe('playwright test')
    expect(pkg.scripts.verify).toBe('node scripts/verify-catalog.mjs')
    expect(pkg.scripts.typecheck).toBe('vue-tsc --noEmit')
  })

  it('declares the test tooling as devDependencies (not runtime dependencies)', () => {
    const dev = pkg.devDependencies ?? {}
    const runtime = pkg.dependencies ?? {}

    expect(dev).toHaveProperty('vitest')
    expect(dev).toHaveProperty('@vue/test-utils')
    expect(dev).toHaveProperty('@playwright/test')
    expect(dev).toHaveProperty('@types/node')
    expect('jsdom' in dev || 'happy-dom' in dev).toBe(true)

    for (const name of ['vitest', '@vue/test-utils', '@playwright/test', 'jsdom', 'happy-dom']) {
      expect(runtime).not.toHaveProperty(name)
    }
    // Runtime deps must be unchanged.
    expect(Object.keys(runtime).sort()).toEqual(['lucide-vue-next', 'vue'])
  })

  it('has the tooling resolved in package-lock.json so `npm ci` installs it', () => {
    const lock = readJson('package-lock.json')
    for (const name of ['vitest', '@vue/test-utils', '@playwright/test']) {
      expect(lock.packages[`node_modules/${name}`], name).toBeDefined()
      expect(lock.packages[`node_modules/${name}`].dev, `${name} should be dev-only`).toBe(true)
    }
    expect(
      lock.packages['node_modules/jsdom'] ?? lock.packages['node_modules/happy-dom']
    ).toBeDefined()
    // vite major must not have been bumped by the install.
    expect(lock.packages['node_modules/vite'].version).toMatch(/^6\./)
  })
})

describe('vitest config', () => {
  it('uses jsdom, includes only tests/unit specs, and keeps the @ alias', async () => {
    const mod = await import('../../vitest.config')
    const config = mod.default as {
      test?: { environment?: string; include?: string[] }
      resolve?: { alias?: Record<string, string> }
    }

    expect(config.test?.environment).toBe('jsdom')
    expect(config.test?.include).toEqual(['tests/unit/**/*.spec.ts'])
    expect(config.resolve?.alias?.['@']).toBe(resolve(ROOT, 'src'))
  })

  it('resolves the @ alias at runtime', async () => {
    const mod = await import('@/composables/useBackpackCatalog')
    expect(typeof mod.useBackpackCatalog).toBe('function')
  })
})

describe('playwright config', () => {
  const originalPort = process.env.PW_PORT

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    if (originalPort === undefined) delete process.env.PW_PORT
    else process.env.PW_PORT = originalPort
    vi.resetModules()
  })

  type PwConfig = {
    testDir?: string
    retries?: number
    reporter?: unknown
    projects?: Array<{ name?: string }>
    use?: { baseURL?: string }
    webServer?: { command?: string; url?: string; reuseExistingServer?: boolean; timeout?: number } | Array<unknown>
  }

  const loadConfig = async (): Promise<PwConfig> => {
    const mod = await import('../../playwright.config')
    return mod.default as PwConfig
  }

  it('is chromium-only with retries 0, list reporter and testDir tests/e2e', async () => {
    const config = await loadConfig()

    expect(config.projects?.map(p => p.name)).toEqual(['chromium'])
    expect(config.retries).toBe(0)
    expect(config.reporter).toBe('list')
    expect(resolve(ROOT, config.testDir ?? '')).toBe(resolve(ROOT, 'tests', 'e2e'))
  })

  it('binds the dev server to PW_PORT with --strictPort and never reuses a running server', async () => {
    process.env.PW_PORT = '4555'
    const config = await loadConfig()
    const webServer = config.webServer as Exclude<PwConfig['webServer'], Array<unknown> | undefined>

    expect(webServer.command).toBe('npx vite --port 4555 --strictPort')
    expect(webServer.url).toBe('http://localhost:4555')
    expect(config.use?.baseURL).toBe('http://localhost:4555')
    expect(webServer.reuseExistingServer).toBe(false)
    expect(webServer.timeout).toBeGreaterThan(0)
  })

  it('falls back to port 4173 when PW_PORT is unset', async () => {
    delete process.env.PW_PORT
    const config = await loadConfig()
    const webServer = config.webServer as Exclude<PwConfig['webServer'], Array<unknown> | undefined>

    expect(webServer.command).toBe('npx vite --port 4173 --strictPort')
    expect(webServer.url).toBe('http://localhost:4173')
    expect(config.use?.baseURL).toBe('http://localhost:4173')
  })
})

describe('typecheck boundaries and docs', () => {
  it('keeps tests out of the root tsconfig so vue-tsc/build ignores them', () => {
    const tsconfig = readJson('tsconfig.json')
    const include: string[] = tsconfig.include ?? []

    expect(include.length).toBeGreaterThan(0)
    expect(include.every(p => p.startsWith('src/'))).toBe(true)
    expect(include.some(p => p.includes('tests'))).toBe(false)
  })

  it('ships a tests/tsconfig.json that covers the tests folder with vitest + playwright types', () => {
    const tsconfig = readJson('tests/tsconfig.json')
    expect(tsconfig.extends).toBe('../tsconfig.json')
    expect(tsconfig.compilerOptions?.types).toEqual(expect.arrayContaining(['node', 'vitest', '@playwright/test']))
    expect(tsconfig.include).toEqual(expect.arrayContaining(['./**/*.ts']))
  })

  it('has a short tests/README.md that documents the commands and PW_PORT', () => {
    const path = resolve(ROOT, 'tests', 'README.md')
    expect(existsSync(path)).toBe(true)

    const text = readFileSync(path, 'utf8')
    const lines = text.split('\n').filter(l => l.trim() !== '')
    expect(lines.length).toBeGreaterThanOrEqual(5)
    expect(lines.length).toBeLessThanOrEqual(10)
    expect(text).toContain('PW_PORT')
    expect(text).toContain('npm test')
    expect(text).toContain('test:e2e')
  })

  it('ignores Playwright output directories in git', () => {
    const gitignore = readFileSync(resolve(ROOT, '.gitignore'), 'utf8')
    expect(gitignore).toMatch(/^test-results\/?$/m)
    expect(gitignore).toMatch(/^playwright-report\/?$/m)
  })

  it('keeps the seed spec files in place', () => {
    for (const rel of [
      'tests/unit/useBackpackCatalog.spec.ts',
      'tests/unit/ColorGrid.spec.ts',
      'tests/e2e/smoke.spec.ts'
    ]) {
      expect(existsSync(resolve(ROOT, rel)), rel).toBe(true)
    }
  })
})
