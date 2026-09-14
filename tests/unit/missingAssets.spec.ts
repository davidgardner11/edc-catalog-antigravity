import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { existsSync, readFileSync, statSync, mkdirSync, mkdtempSync, rmSync, copyFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import CardCarousel from '@/components/CardCarousel.vue'
import BackpackModal from '@/components/BackpackModal.vue'
import type { BackpackItem } from '@/types/backpack'

// Acceptance tests for README issues #2 + #3 (task: fix/missing-assets):
//  1. public/favicon.svg exists and matches what index.html links.
//  2. The placeholder the components fall back to exists on disk and is a real
//     WebP; CardCarousel and BackpackModal render it for images: [].
//  3. scripts/verify-catalog.mjs fails when either asset is missing.

const ROOT = resolve(__dirname, '..', '..')
const PUBLIC = resolve(ROOT, 'public')
const VERIFY_SCRIPT = resolve(ROOT, 'scripts', 'verify-catalog.mjs')

const PLACEHOLDER_PATH = '/images/placeholder.webp'
const FAVICON_PATH = '/favicon.svg'

function makePack(images: string[], id = 'test-pack'): BackpackItem {
  return {
    id,
    brand: 'Test Brand',
    name: `Test Pack ${id}`,
    capacityLiters: 20,
    lowestPriceUSD: 100,
    primaryRetailer: 'Test Retailer',
    review: { score: 4.5, maxScore: 5, sourceName: 'Test Source' },
    colorways: [{ name: 'Black', hex: '#000000' }],
    images
  }
}

describe('favicon asset (README issue #2)', () => {
  it('index.html links exactly /favicon.svg and that file exists in public/', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8')
    const match = html.match(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/)
    expect(match, 'index.html has no <link rel="icon">').not.toBeNull()
    expect(match![1]).toBe(FAVICON_PATH)

    const file = resolve(PUBLIC, FAVICON_PATH.slice(1))
    expect(existsSync(file)).toBe(true)
    expect(statSync(file).size).toBeGreaterThan(0)
  })

  it('favicon.svg is a well-formed SVG document with a viewBox', () => {
    const svg = readFileSync(resolve(PUBLIC, 'favicon.svg'), 'utf8')
    // jsdom's DOMParser reports XML errors as a <parsererror> element.
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
    expect(doc.documentElement.tagName).toBe('svg')
    expect(doc.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(doc.documentElement.getAttribute('viewBox')).toMatch(/^\s*0 0 \d+ \d+\s*$/)
  })
})

describe('placeholder asset (README issue #3)', () => {
  it('the path CardCarousel falls back to for images: [] exists in public/ as a real WebP', () => {
    const wrapper = mount(CardCarousel, { props: { images: [], brand: 'B', name: 'N' } })
    const src = wrapper.find('img').attributes('src')!
    expect(src).toMatch(/^\/images\//)

    const file = resolve(PUBLIC, src.slice(1))
    expect(existsSync(file), `fallback ${src} is not shipped in public/`).toBe(true)
    expect(statSync(file).size).toBeGreaterThan(0)

    const bytes = readFileSync(file)
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF')
    expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP')
    // RIFF chunk size must match the file length (guards against a truncated encode).
    expect(bytes.readUInt32LE(4) + 8).toBe(bytes.length)
  })

  it('CardCarousel and BackpackModal use the same placeholder path', () => {
    const card = mount(CardCarousel, { props: { images: [], brand: 'B', name: 'N' } })
    const modal = mount(BackpackModal, { props: { backpack: makePack([]) } })
    expect(card.find('img').attributes('src')).toBe(PLACEHOLDER_PATH)
    expect(modal.find('img').attributes('src')).toBe(PLACEHOLDER_PATH)
  })
})

describe('CardCarousel with images: []', () => {
  it('renders exactly one <img> pointing at the placeholder, with no nav zones or dots', () => {
    const wrapper = mount(CardCarousel, { props: { images: [], brand: 'Test', name: 'Pack' } })
    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].attributes('src')).toBe(PLACEHOLDER_PATH)
    expect(imgs[0].attributes('alt')).toContain('Test Pack')
    expect(wrapper.find('[title="Previous image"]').exists()).toBe(false)
    expect(wrapper.find('[title="Next image"]').exists()).toBe(false)
    expect(wrapper.findAll('span.h-1')).toHaveLength(0)
  })

  it('does not regress a multi-image carousel', async () => {
    const images = ['/images/a.jpg', '/images/b.jpg', '/images/c.jpg']
    const wrapper = mount(CardCarousel, { props: { images, brand: 'Test', name: 'Pack' } })
    expect(wrapper.find('img').attributes('src')).toBe(images[0])
    expect(wrapper.findAll('span.h-1')).toHaveLength(3)

    await wrapper.find('[title="Next image"]').trigger('click')
    expect(wrapper.find('img').attributes('src')).toBe(images[1])
    await wrapper.find('[title="Previous image"]').trigger('click')
    await wrapper.find('[title="Previous image"]').trigger('click')
    expect(wrapper.find('img').attributes('src')).toBe(images[2])
  })
})

describe('BackpackModal with images: []', () => {
  it('renders the placeholder as the main image and no thumbnail strip', () => {
    const wrapper = mount(BackpackModal, { props: { backpack: makePack([]) } })
    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].attributes('src')).toBe(PLACEHOLDER_PATH)
    expect(imgs[0].classes()).toContain('h-64')
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(0)
    // The thumbnail container itself is not rendered (no empty strip taking up space).
    expect(wrapper.find('div.overflow-x-auto').exists()).toBe(false)
  })

  it('tolerates a backpack whose images property is missing entirely', () => {
    const pack = makePack([]) as Partial<BackpackItem>
    delete pack.images
    const wrapper = mount(BackpackModal, { props: { backpack: pack as BackpackItem } })
    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.find('img').attributes('src')).toBe(PLACEHOLDER_PATH)
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(0)
  })

  it('switches correctly between a pack with images and a pack without', async () => {
    const withImages = makePack(['/images/x/1.jpg', '/images/x/2.jpg', '/images/x/3.jpg'], 'with')
    const without = makePack([], 'without')

    const wrapper = mount(BackpackModal, { props: { backpack: withImages } })
    expect(wrapper.find('img.h-64').attributes('src')).toBe('/images/x/1.jpg')
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(3)

    // Select the last thumbnail, then swap to the image-less pack.
    await wrapper.findAll('button.w-10.h-10')[2].trigger('click')
    expect(wrapper.find('img.h-64').attributes('src')).toBe('/images/x/3.jpg')

    await wrapper.setProps({ backpack: without })
    await nextTick()
    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.find('img.h-64').attributes('src')).toBe(PLACEHOLDER_PATH)
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(0)

    // And back again: index resets to 0 and thumbnails return.
    await wrapper.setProps({ backpack: withImages })
    await nextTick()
    expect(wrapper.find('img.h-64').attributes('src')).toBe('/images/x/1.jpg')
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(3)
  })

  it('renders nothing when backpack is null', () => {
    const wrapper = mount(BackpackModal, { props: { backpack: null } })
    expect(wrapper.findAll('img')).toHaveLength(0)
  })
})

describe('scripts/verify-catalog.mjs static-asset check', () => {
  // The script resolves ../src/data/backpacks.json and ../public relative to
  // its own location, so build a throwaway tree that mirrors that layout.
  // Real backpack images are symlinked so the pre-existing image check passes.
  let sandbox: string

  function makeTree(opts: { favicon?: 'present' | 'missing' | 'empty'; placeholder?: 'present' | 'missing' | 'empty' }) {
    const dir = mkdtempSync(join(sandbox, 'tree-'))
    mkdirSync(join(dir, 'scripts'))
    mkdirSync(join(dir, 'src', 'data'), { recursive: true })
    mkdirSync(join(dir, 'public', 'images'), { recursive: true })
    copyFileSync(VERIFY_SCRIPT, join(dir, 'scripts', 'verify-catalog.mjs'))
    copyFileSync(resolve(ROOT, 'src', 'data', 'backpacks.json'), join(dir, 'src', 'data', 'backpacks.json'))
    symlinkSync(resolve(PUBLIC, 'images', 'backpacks'), join(dir, 'public', 'images', 'backpacks'), 'dir')

    const place = (state: 'present' | 'missing' | 'empty' | undefined, from: string, to: string) => {
      if (state === 'present' || state === undefined) copyFileSync(from, to)
      else if (state === 'empty') writeFileSync(to, '')
    }
    place(opts.favicon, resolve(PUBLIC, 'favicon.svg'), join(dir, 'public', 'favicon.svg'))
    place(opts.placeholder, resolve(PUBLIC, 'images', 'placeholder.webp'), join(dir, 'public', 'images', 'placeholder.webp'))
    return dir
  }

  function runVerify(dir: string) {
    const res = spawnSync(process.execPath, [join(dir, 'scripts', 'verify-catalog.mjs')], { encoding: 'utf8' })
    return { status: res.status, out: `${res.stdout}\n${res.stderr}` }
  }

  beforeAll(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'edc-verify-'))
  })
  afterAll(() => {
    rmSync(sandbox, { recursive: true, force: true })
  })

  it('passes when both assets are present', () => {
    const { status, out } = runVerify(makeTree({}))
    expect(out).toContain('public/favicon.svg')
    expect(out).toContain('public/images/placeholder.webp')
    expect(status).toBe(0)
  })

  it('fails with a pointer to the favicon when public/favicon.svg is missing', () => {
    const { status, out } = runVerify(makeTree({ favicon: 'missing' }))
    expect(status).not.toBe(0)
    expect(out).toMatch(/favicon\.svg/)
  })

  it('fails when public/images/placeholder.webp is missing', () => {
    const { status, out } = runVerify(makeTree({ placeholder: 'missing' }))
    expect(status).not.toBe(0)
    expect(out).toMatch(/placeholder\.webp/)
  })

  it('fails when an asset exists but is zero bytes', () => {
    expect(runVerify(makeTree({ favicon: 'empty' })).status).not.toBe(0)
    expect(runVerify(makeTree({ placeholder: 'empty' })).status).not.toBe(0)
  })
})
