import { describe, it, expect } from 'vitest'
import { normalizeBackpack, useBackpackCatalog } from '@/composables/useBackpackCatalog'
import rawData from '@/data/backpacks.json'
import type { BackpackItem } from '@/types/backpack'

const catalog = rawData as BackpackItem[]

/** Minimal item with the Synik 22 shape: the official store is NOT the cheapest. */
function makeItem(overrides: Partial<BackpackItem> = {}): BackpackItem {
  return {
    id: 'test-pack',
    brand: 'Test',
    name: 'Pack',
    capacityLiters: 20,
    lowestPriceUSD: 999,
    primaryRetailer: 'Wrong Retailer',
    review: { score: 4.5, maxScore: 5 },
    colorways: [],
    images: [],
    retailers: [
      { name: 'Test (Official)', priceUSD: 340, url: 'https://example.com/official', isLowestPrice: true },
      { name: 'Marketplace', priceUSD: 320, url: 'https://example.com/marketplace', isLowestPrice: false }
    ],
    ...overrides
  }
}

describe('normalizeBackpack', () => {
  it('derives lowestPriceUSD from the cheapest retailer offer', () => {
    expect(normalizeBackpack(makeItem()).lowestPriceUSD).toBe(320)
  })

  it('flags isLowestPrice only on offers at the minimum price, even if the JSON says otherwise', () => {
    const { retailers } = normalizeBackpack(makeItem())

    expect(retailers?.map(r => [r.name, r.isLowestPrice])).toEqual([
      ['Test (Official)', false],
      ['Marketplace', true]
    ])
  })

  it('flags every offer that ties for the lowest price', () => {
    const item = makeItem({
      retailers: [
        { name: 'A (Official)', priceUSD: 100, url: 'https://example.com/a' },
        { name: 'B', priceUSD: 100, url: 'https://example.com/b' },
        { name: 'C', priceUSD: 120, url: 'https://example.com/c' }
      ]
    })

    expect(normalizeBackpack(item).retailers?.map(r => r.isLowestPrice)).toEqual([true, true, false])
  })

  it('sets primaryRetailer from the first lowest offer, stripping a trailing " (Official)"', () => {
    expect(normalizeBackpack(makeItem()).primaryRetailer).toBe('Marketplace')

    const officialCheapest = makeItem({
      retailers: [
        { name: 'Test (Official)', priceUSD: 300, url: 'https://example.com/official' },
        { name: 'Marketplace', priceUSD: 320, url: 'https://example.com/marketplace' }
      ]
    })
    expect(normalizeBackpack(officialCheapest).primaryRetailer).toBe('Test')
  })

  it('does not change retailer URLs or the input object', () => {
    const item = makeItem()
    const before = JSON.parse(JSON.stringify(item))
    const result = normalizeBackpack(item)

    expect(result.retailers?.map(r => r.url)).toEqual(item.retailers?.map(r => r.url))
    expect(item).toEqual(before)
  })

  it('returns items without retailer offers unchanged', () => {
    const noOffers = makeItem({ retailers: undefined, lowestPriceUSD: 150, primaryRetailer: 'Solo Shop' })
    expect(normalizeBackpack(noOffers)).toBe(noOffers)

    const emptyOffers = makeItem({ retailers: [], lowestPriceUSD: 150, primaryRetailer: 'Solo Shop' })
    expect(normalizeBackpack(emptyOffers)).toBe(emptyOffers)
  })
})

describe('useBackpackCatalog price consistency', () => {
  it('every loaded backpack agrees with its cheapest retailer offer', () => {
    const { allBackpacks } = useBackpackCatalog()

    for (const pack of allBackpacks.value) {
      if (!pack.retailers?.length) continue
      const min = Math.min(...pack.retailers.map(r => r.priceUSD))

      expect(pack.lowestPriceUSD, pack.id).toBe(min)
      for (const offer of pack.retailers) {
        expect(Boolean(offer.isLowestPrice), `${pack.id} / ${offer.name}`).toBe(offer.priceUSD === min)
      }
    }
  })

  it('badges Carryology Marketplace as the Best Price for the Tom Bihn Synik 22', () => {
    const { allBackpacks } = useBackpackCatalog()
    const synik = allBackpacks.value.find(b => b.id === 'tom-bihn-synik-22')

    expect(synik).toBeDefined()
    expect(synik?.lowestPriceUSD).toBe(320)
    expect(synik?.primaryRetailer).toBe('Carryology Marketplace')
    expect(synik?.retailers?.filter(r => r.isLowestPrice).map(r => r.name)).toEqual(['Carryology Marketplace'])
  })

  it('keeps the on-disk JSON already consistent (no silent repair needed)', () => {
    for (const pack of catalog) {
      const normalized = normalizeBackpack(pack)
      expect(normalized.lowestPriceUSD, pack.id).toBe(pack.lowestPriceUSD)
      expect(normalized.primaryRetailer, pack.id).toBe(pack.primaryRetailer)
      expect(normalized.retailers?.map(r => Boolean(r.isLowestPrice)), pack.id).toEqual(
        pack.retailers?.map(r => Boolean(r.isLowestPrice))
      )
    }
  })
})
