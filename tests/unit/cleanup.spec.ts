import { afterEach, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { mount } from '@vue/test-utils'

import App from '@/App.vue'
import CatalogNavbar from '@/components/CatalogNavbar.vue'
import { useBackpackCatalog } from '@/composables/useBackpackCatalog'
import rawData from '@/data/backpacks.json'
import type { BackpackItem } from '@/types/backpack'
import tailwindConfig from '../../tailwind.config'

// Pins README issues #4, #5, #6 and #12 (task: fix/cleanup).
//   #4  no-op Tailwind 3 classes replaced with real scale values
//   #5  dead component/composable/type field/dependency removed
//   #6  orphaned SVG placeholders and test_img/ removed
//   #12 brandList has no 'all' sentinel, footer year is dynamic, subtitle is plain language

const ROOT = resolve(__dirname, '..', '..')
const read = (rel: string) => readFileSync(resolve(ROOT, rel), 'utf8')
const readJson = (rel: string) => JSON.parse(read(rel))
const catalog = rawData as BackpackItem[]

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const sourceFiles = () =>
  [...walk(resolve(ROOT, 'src')).filter(f => /\.(vue|ts)$/.test(f)), resolve(ROOT, 'index.html')]

describe('#4 no-op Tailwind classes', () => {
  const colorGrid = read('src/components/ColorGrid.vue')
  const modal = read('src/components/BackpackModal.vue')

  it('ColorGrid.vue uses -mt-1, hover:scale-110 and shadow-sm instead of the no-op variants', () => {
    expect(colorGrid).not.toMatch(/-mt-0\.75\b/)
    expect(colorGrid).not.toMatch(/hover:scale-115\b/)
    expect(colorGrid).not.toMatch(/shadow-xs\b/)

    expect(colorGrid).toMatch(/\brotate-45 -mt-1\b/)
    expect(colorGrid).toMatch(/\bhover:scale-110\b/)
    expect(colorGrid).toMatch(/\bshadow-sm\b/)
  })

  it('BackpackModal.vue uses shadow-sm instead of shadow-xs', () => {
    expect(modal).not.toMatch(/shadow-xs\b/)
    expect(modal).toMatch(/\bshadow-sm\b/)
  })

  it('no source file uses a class outside Tailwind 3.4\'s default scale', () => {
    for (const file of sourceFiles()) {
      const text = readFileSync(file, 'utf8')
      expect(text, relative(ROOT, file)).not.toMatch(/\b(-?mt-0\.75|scale-115|shadow-xs)\b/)
    }
  })

  it('every class token in src/ and index.html is emitted by the Tailwind build', async () => {
    // Compile Tailwind exactly as the app does (same config, same content globs),
    // then check every static class token in the templates is present in the output.
    const config = {
      ...tailwindConfig,
      content: (tailwindConfig.content as string[]).map(p => resolve(ROOT, p))
    }
    const { css } = await postcss([tailwindcss(config as never)]).process(
      '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
      { from: undefined }
    )

    const tokens = new Map<string, string>()
    for (const file of sourceFiles()) {
      const text = readFileSync(file, 'utf8')
      for (const m of text.matchAll(/(?:^|\s):?class="([^"]*)"/g)) {
        const body = m[1]
        // Static `class="a b"` or the quoted string literals inside `:class="cond ? 'a' : 'b'"`.
        const parts = body.includes("'") ? [...body.matchAll(/'([^']*)'/g)].map(x => x[1]) : [body]
        for (const part of parts) {
          for (const token of part.split(/\s+/)) {
            if (!token) continue
            // Skip anything that still looks like an expression rather than a class name.
            const stripped = token.replace(/^([a-z-]+:)+/, '').replace(/\[[^\]]*\]/g, '')
            if (/[{}[\]:?=>()&|!,]/.test(stripped)) continue
            if (!tokens.has(token)) tokens.set(token, relative(ROOT, file))
          }
        }
      }
    }
    expect(tokens.size).toBeGreaterThan(200)

    const escape = (s: string) => s.replace(/[.:/[\]%#()!,]/g, c => `\\${c}`)
    const missing = [...tokens].filter(([token]) => !css.includes(`.${escape(token)}`))
    expect(missing, 'class tokens not present in compiled Tailwind CSS').toEqual([])

    // The three replacements really produce rules.
    expect(css).toMatch(/\.-mt-1\s*\{/)
    expect(css).toMatch(/\.hover\\:scale-110:hover\s*\{/)
    expect(css).toMatch(/\.shadow-sm\s*\{/)
  })
})

describe('#5 dead code and unused dependency', () => {
  it('CardLabelOverlay.vue and useImageContrast.ts are gone', () => {
    expect(existsSync(resolve(ROOT, 'src/components/CardLabelOverlay.vue'))).toBe(false)
    expect(existsSync(resolve(ROOT, 'src/composables/useImageContrast.ts'))).toBe(false)
  })

  it('nothing in src/ or package.json mentions the removed code or lucide', () => {
    const pattern = /CardLabelOverlay|useImageContrast|lucide|contrastFallback/
    for (const file of [...walk(resolve(ROOT, 'src')), resolve(ROOT, 'package.json')]) {
      if (!/\.(vue|ts|json|css|html)$/.test(file)) continue
      expect(readFileSync(file, 'utf8'), relative(ROOT, file)).not.toMatch(pattern)
    }
  })

  it('lucide-vue-next is removed from package.json, package-lock.json and node_modules', () => {
    const pkg = readJson('package.json')
    expect(pkg.dependencies).not.toHaveProperty('lucide-vue-next')
    expect(pkg.devDependencies ?? {}).not.toHaveProperty('lucide-vue-next')
    expect(Object.keys(pkg.dependencies)).toEqual(['vue'])

    const lock = read('package-lock.json')
    expect(lock).not.toContain('lucide')

    expect(existsSync(resolve(ROOT, 'node_modules/lucide-vue-next'))).toBe(false)
  })

  it('BackpackItem drops contrastFallback but keeps features', () => {
    const types = read('src/types/backpack.ts')
    const iface = types.match(/export interface BackpackItem \{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(iface).not.toContain('contrastFallback')
    expect(iface).toMatch(/\bfeatures\?: string\[\]/)
  })
})

describe('#6 orphaned assets', () => {
  const imageRoot = resolve(ROOT, 'public/images/backpacks')

  it('no .svg files remain under public/images/backpacks', () => {
    const svgs = walk(imageRoot).filter(f => f.endsWith('.svg'))
    expect(svgs).toEqual([])
  })

  it('test_img/ is gone', () => {
    expect(existsSync(resolve(ROOT, 'test_img'))).toBe(false)
  })

  it('backpacks.json references only .jpg images and every one still exists on disk', () => {
    const refs = catalog.flatMap(b => b.images)
    expect(refs).toHaveLength(100)
    for (const ref of refs) {
      expect(ref).toMatch(/^\/images\/backpacks\/[^/]+\/\d+\.jpg$/)
      expect(existsSync(resolve(ROOT, 'public', ref.slice(1))), ref).toBe(true)
    }
    // No file on disk is referenced by nothing (the SVGs were the only orphans).
    const onDisk = walk(imageRoot).map(f => '/' + relative(resolve(ROOT, 'public'), f))
    expect(onDisk.sort()).toEqual([...refs].sort())
  })
})

describe('#12 cosmetics', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('brandList contains only real brands, sorted, with no "all" sentinel', () => {
    const { brandList } = useBackpackCatalog()
    const expected = [...new Set(catalog.map(b => b.brand))].sort()

    expect(brandList.value).toEqual(expected)
    expect(brandList.value).not.toContain('all')
  })

  it('CatalogNavbar renders "All Brands (N)" first, then every brand exactly once', () => {
    const brands = ['Bellroy', 'GORUCK', 'Tom Bihn']
    const wrapper = mount(CatalogNavbar, {
      props: {
        searchQuery: '',
        selectedBrand: 'all',
        sortBy: 'featured',
        brandList: brands,
        totalCount: 20,
        isDark: false
      }
    })

    const options = wrapper.findAll('select').at(0)!.findAll('option')
    expect(options.map(o => o.attributes('value'))).toEqual(['all', ...brands])
    expect(options.map(o => o.text())).toEqual(['All Brands (20)', ...brands])
  })

  it('CatalogNavbar no longer filters the list itself (a literal "all" brand would now be shown)', () => {
    // Guards against a regression where the composable is reverted to include the
    // sentinel and the navbar silently hides it again: the responsibility now lives
    // solely in useBackpackCatalog.
    const wrapper = mount(CatalogNavbar, {
      props: {
        searchQuery: '',
        selectedBrand: 'all',
        sortBy: 'featured',
        brandList: ['all', 'Zed'],
        totalCount: 2,
        isDark: false
      }
    })
    const values = wrapper.findAll('select').at(0)!.findAll('option').map(o => o.attributes('value'))
    expect(values).toEqual(['all', 'all', 'Zed'])
    expect(read('src/components/CatalogNavbar.vue')).not.toMatch(/brandList\.filter/)
  })

  it('App shows the current year in the footer instead of a hard-coded 2026', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2031, 5, 15))

    const wrapper = mount(App)
    const footer = wrapper.find('footer').text()

    expect(footer).toContain('© 2031 Everyday Carry (EDC) Backpack Catalog.')
    expect(footer).not.toContain('2026')
    expect(read('src/App.vue')).not.toMatch(/©\s*2026/)
    wrapper.unmount()
  })

  it('App intro banner subtitle uses the plain-language wording', () => {
    const wrapper = mount(App)
    const subtitle = wrapper.find('main p').text()

    expect(subtitle).toBe(`Displaying ${catalog.length} of ${catalog.length} curated everyday-carry backpacks.`)
    expect(wrapper.text()).not.toMatch(/poker card|acclaimed/i)
    wrapper.unmount()
  })
})
