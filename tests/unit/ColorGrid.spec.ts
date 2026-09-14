import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorGrid from '@/components/ColorGrid.vue'
import type { BackpackColorway } from '@/types/backpack'

const TOTAL_SLOTS = 9
const PAGE_SIZE = 8

function makeColorways(count: number): BackpackColorway[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Color ${i + 1}`,
    hex: `#${(i + 1).toString(16).padStart(6, '0')}`
  }))
}

function mountGrid(count: number) {
  const wrapper = mount(ColorGrid, { props: { colorways: makeColorways(count) } })
  return {
    wrapper,
    swatches: () => wrapper.findAll('span[style]'),
    placeholders: () => wrapper.findAll('.border-dashed'),
    moreButton: () => wrapper.find('button[title="View more colors"]'),
    /** Hovers the swatch cell at `index` and returns its tooltip label. */
    swatchName: async (index: number) => {
      const cell = wrapper.findAll('.grid > div').filter(w => w.find('span[style]').exists())[index]
      await cell.trigger('mouseenter')
      const label = cell.text()
      await cell.trigger('mouseleave')
      return label
    }
  }
}

describe('ColorGrid', () => {
  describe('with 3 colorways (single page)', () => {
    it('renders 3 swatches, 6 placeholders and no ">" button', () => {
      const { swatches, placeholders, moreButton } = mountGrid(3)

      expect(swatches()).toHaveLength(3)
      expect(placeholders()).toHaveLength(TOTAL_SLOTS - 3)
      expect(moreButton().exists()).toBe(false)
    })
  })

  describe('with 9 colorways (exactly fills the grid)', () => {
    it('renders all 9 swatches with no placeholders and no ">" button', () => {
      const { swatches, placeholders, moreButton } = mountGrid(9)

      expect(swatches()).toHaveLength(9)
      expect(placeholders()).toHaveLength(0)
      expect(moreButton().exists()).toBe(false)
    })
  })

  describe('with 10 colorways (two pages, short second page)', () => {
    it('renders 8 swatches plus the ">" button on the first page', () => {
      const { swatches, placeholders, moreButton } = mountGrid(10)

      expect(swatches()).toHaveLength(PAGE_SIZE)
      expect(placeholders()).toHaveLength(0)
      expect(moreButton().exists()).toBe(true)
    })

    it('shows the remaining 2 swatches with 6 placeholders on the second page', async () => {
      const { swatches, placeholders, moreButton, swatchName } = mountGrid(10)

      await moreButton().trigger('click')

      expect(swatches()).toHaveLength(2)
      expect(placeholders()).toHaveLength(TOTAL_SLOTS - 2 - 1)
      expect(moreButton().exists()).toBe(true)
      expect(await swatchName(0)).toBe('Color 9')
      expect(await swatchName(1)).toBe('Color 10')
    })

    it('wraps back to the first page after the last page', async () => {
      const { swatches, placeholders, moreButton, swatchName } = mountGrid(10)

      await moreButton().trigger('click')
      await moreButton().trigger('click')

      expect(swatches()).toHaveLength(PAGE_SIZE)
      expect(placeholders()).toHaveLength(0)
      expect(await swatchName(0)).toBe('Color 1')
      expect(await swatchName(PAGE_SIZE - 1)).toBe('Color 8')
    })
  })

  describe('with 16 colorways (two full pages)', () => {
    it('renders 8 swatches plus the ">" button on both pages', async () => {
      const { swatches, placeholders, moreButton, swatchName } = mountGrid(16)

      expect(swatches()).toHaveLength(PAGE_SIZE)
      expect(placeholders()).toHaveLength(0)
      expect(moreButton().exists()).toBe(true)
      expect(await swatchName(0)).toBe('Color 1')

      await moreButton().trigger('click')

      expect(swatches()).toHaveLength(PAGE_SIZE)
      expect(placeholders()).toHaveLength(0)
      expect(moreButton().exists()).toBe(true)
      expect(await swatchName(0)).toBe('Color 9')
      expect(await swatchName(PAGE_SIZE - 1)).toBe('Color 16')
    })

    it('wraps around to the first page on the second click', async () => {
      const { moreButton, swatchName } = mountGrid(16)

      await moreButton().trigger('click')
      await moreButton().trigger('click')

      expect(await swatchName(0)).toBe('Color 1')
    })
  })

  it('does not propagate the ">" click to the parent card', async () => {
    const wrapper = mount({
      components: { ColorGrid },
      data: () => ({ clicks: 0, colorways: makeColorways(12) }),
      template: '<div @click="clicks++"><ColorGrid :colorways="colorways" /></div>'
    })

    await wrapper.find('button[title="View more colors"]').trigger('click')

    expect((wrapper.vm as unknown as { clicks: number }).clicks).toBe(0)
  })
})
