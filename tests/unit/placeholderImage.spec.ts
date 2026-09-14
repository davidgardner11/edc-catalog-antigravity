import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import CardCarousel from '@/components/CardCarousel.vue'
import BackpackModal from '@/components/BackpackModal.vue'
import { PLACEHOLDER_IMAGE } from '@/constants'
import type { BackpackItem } from '@/types/backpack'

// Covers README issues #2 + #3: the favicon and the image placeholder must
// exist on disk, and both image surfaces must render the placeholder for a
// pack with an empty images[] instead of requesting a missing file.

const ROOT = resolve(__dirname, '..', '..')
const PUBLIC = resolve(ROOT, 'public')

function makePack(images: string[]): BackpackItem {
  return {
    id: 'test-pack',
    brand: 'Test Brand',
    name: 'Test Pack 20L',
    capacityLiters: 20,
    lowestPriceUSD: 100,
    primaryRetailer: 'Test Retailer',
    review: { score: 4.5, maxScore: 5, sourceName: 'Test Source' },
    colorways: [{ name: 'Black', hex: '#000000' }],
    images
  }
}

describe('static assets', () => {
  it('ships public/favicon.svg as a non-empty, valid-looking SVG', () => {
    const file = resolve(PUBLIC, 'favicon.svg')
    expect(existsSync(file)).toBe(true)

    const svg = readFileSync(file, 'utf8')
    expect(svg).toMatch(/^\s*<svg[\s>]/)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox=')
    expect(svg.trimEnd()).toMatch(/<\/svg>$/)
  })

  it('links the favicon from index.html at the path that exists on disk', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8')
    expect(html).toContain('href="/favicon.svg"')
  })

  it('ships the placeholder image the components fall back to, as a real WebP', () => {
    expect(PLACEHOLDER_IMAGE).toBe('/images/placeholder.webp')

    const file = resolve(PUBLIC, PLACEHOLDER_IMAGE.replace(/^\//, ''))
    expect(existsSync(file)).toBe(true)
    expect(statSync(file).size).toBeGreaterThan(0)

    // RIFF....WEBP container header.
    const header = readFileSync(file).subarray(0, 12)
    expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF')
    expect(header.subarray(8, 12).toString('ascii')).toBe('WEBP')
  })
})

describe('CardCarousel with no images', () => {
  it('renders the placeholder and no navigation zones or dots', () => {
    const wrapper = mount(CardCarousel, { props: { images: [], brand: 'Test Brand', name: 'Test Pack 20L' } })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(PLACEHOLDER_IMAGE)
    expect(wrapper.find('[title="Previous image"]').exists()).toBe(false)
    expect(wrapper.find('[title="Next image"]').exists()).toBe(false)
  })

  it('still renders the first real image when images are present', () => {
    const wrapper = mount(CardCarousel, {
      props: { images: ['/images/backpacks/goruck-gr1/1.jpg'], brand: 'GORUCK', name: 'GR1 21L' }
    })

    expect(wrapper.find('img').attributes('src')).toBe('/images/backpacks/goruck-gr1/1.jpg')
  })
})

describe('BackpackModal with no images', () => {
  it('shows the placeholder as the main image and renders no thumbnails', () => {
    const wrapper = mount(BackpackModal, { props: { backpack: makePack([]) } })

    const images = wrapper.findAll('img')
    expect(images).toHaveLength(1)
    expect(images[0].attributes('src')).toBe(PLACEHOLDER_IMAGE)
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(0)
  })

  it('renders one thumbnail per image and the first as the main image when images exist', () => {
    const pack = makePack(['/images/backpacks/goruck-gr1/1.jpg', '/images/backpacks/goruck-gr1/2.jpg'])
    const wrapper = mount(BackpackModal, { props: { backpack: pack } })

    const main = wrapper.find('img.h-64')
    expect(main.attributes('src')).toBe(pack.images[0])
    expect(wrapper.findAll('button.w-10.h-10')).toHaveLength(2)
  })
})
