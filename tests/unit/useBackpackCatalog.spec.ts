import { describe, it, expect } from 'vitest'
import { useBackpackCatalog } from '@/composables/useBackpackCatalog'
import rawData from '@/data/backpacks.json'
import type { BackpackItem, SortOption } from '@/types/backpack'

const catalog = rawData as BackpackItem[]

/** True when the item matches the same fields the composable searches. */
function matchesQuery(item: BackpackItem, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.name.toLowerCase().includes(q) ||
    item.brand.toLowerCase().includes(q) ||
    (item.material?.toLowerCase().includes(q) ?? false) ||
    (item.description?.toLowerCase().includes(q) ?? false)
  )
}

function expectNonIncreasing(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    expect(values[i]).toBeLessThanOrEqual(values[i - 1])
  }
}

function expectNonDecreasing(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
  }
}

describe('useBackpackCatalog', () => {
  it('starts with the full catalog in curated order and default filters', () => {
    const { allBackpacks, filteredBackpacks, searchQuery, selectedBrand, sortBy } = useBackpackCatalog()

    expect(allBackpacks.value).toHaveLength(catalog.length)
    expect(filteredBackpacks.value.map(b => b.id)).toEqual(catalog.map(b => b.id))
    expect(searchQuery.value).toBe('')
    expect(selectedBrand.value).toBe('all')
    expect(sortBy.value).toBe('featured')
  })

  describe('brandList', () => {
    it('starts with "all" followed by unique, alphabetically sorted brands', () => {
      const { brandList } = useBackpackCatalog()
      const [first, ...brands] = brandList.value

      expect(first).toBe('all')
      expect(new Set(brands).size).toBe(brands.length)
      expect(brands).toEqual([...brands].sort())
      expect(new Set(brands)).toEqual(new Set(catalog.map(b => b.brand)))
    })
  })

  describe('brand filter', () => {
    it('keeps only backpacks from the selected brand', () => {
      const { filteredBackpacks, selectedBrand } = useBackpackCatalog()
      const expected = catalog.filter(b => b.brand === 'GORUCK')

      selectedBrand.value = 'GORUCK'

      expect(filteredBackpacks.value.length).toBeGreaterThan(0)
      expect(filteredBackpacks.value).toHaveLength(expected.length)
      expect(filteredBackpacks.value.every(b => b.brand === 'GORUCK')).toBe(true)
    })

    it('matches brand names case-insensitively', () => {
      const { filteredBackpacks, selectedBrand } = useBackpackCatalog()

      selectedBrand.value = 'bellroy'

      expect(filteredBackpacks.value.map(b => b.id)).toEqual(['bellroy-transit-workpack'])
    })

    it('shows everything again when set back to "all"', () => {
      const { filteredBackpacks, selectedBrand } = useBackpackCatalog()

      selectedBrand.value = 'Aer'
      expect(filteredBackpacks.value).toHaveLength(1)

      selectedBrand.value = 'all'
      expect(filteredBackpacks.value).toHaveLength(catalog.length)
    })
  })

  describe('search', () => {
    it('matches on backpack name', () => {
      const { filteredBackpacks, searchQuery } = useBackpackCatalog()

      searchQuery.value = 'Synik'

      const ids = filteredBackpacks.value.map(b => b.id)
      expect(ids).toContain('tom-bihn-synik-22')
      expect(filteredBackpacks.value.every(b => matchesQuery(b, 'Synik'))).toBe(true)
    })

    it('matches on brand', () => {
      const { filteredBackpacks, searchQuery } = useBackpackCatalog()

      searchQuery.value = 'Peak Design'

      const ids = filteredBackpacks.value.map(b => b.id)
      expect(ids).toContain('peak-design-everyday')
      expect(filteredBackpacks.value.every(b => matchesQuery(b, 'Peak Design'))).toBe(true)
    })

    it('matches on material', () => {
      const { filteredBackpacks, searchQuery } = useBackpackCatalog()

      searchQuery.value = 'X-Pac'

      const ids = filteredBackpacks.value.map(b => b.id)
      expect(ids).toContain('able-carry-daily-plus')
      expect(filteredBackpacks.value.every(b => matchesQuery(b, 'X-Pac'))).toBe(true)
    })

    it('is case-insensitive and ignores surrounding whitespace', () => {
      const { filteredBackpacks, searchQuery } = useBackpackCatalog()

      searchQuery.value = 'goruck'
      const lower = filteredBackpacks.value.map(b => b.id)

      searchQuery.value = '  GORUCK  '
      const padded = filteredBackpacks.value.map(b => b.id)

      expect(lower).toContain('goruck-gr1')
      expect(padded).toEqual(lower)
    })

    it('returns an empty list when nothing matches', () => {
      const { filteredBackpacks, searchQuery } = useBackpackCatalog()

      searchQuery.value = 'definitely-not-a-backpack-xyz'

      expect(filteredBackpacks.value).toEqual([])
    })

    it('combines with the brand filter', () => {
      const { filteredBackpacks, searchQuery, selectedBrand } = useBackpackCatalog()

      selectedBrand.value = 'Osprey'
      searchQuery.value = 'Cordura'

      expect(filteredBackpacks.value).toEqual([])

      searchQuery.value = 'Daylite'
      expect(filteredBackpacks.value.map(b => b.id)).toEqual(['osprey-daylite-plus'])
    })
  })

  describe('sorting', () => {
    const setSort = (option: SortOption) => {
      const api = useBackpackCatalog()
      api.sortBy.value = option
      return api.filteredBackpacks.value
    }

    it('"featured" preserves the curated order', () => {
      expect(setSort('featured').map(b => b.id)).toEqual(catalog.map(b => b.id))
    })

    it('"price-asc" sorts by lowest price ascending', () => {
      const list = setSort('price-asc')
      expect(list).toHaveLength(catalog.length)
      expectNonDecreasing(list.map(b => b.lowestPriceUSD))
    })

    it('"price-desc" sorts by lowest price descending', () => {
      const list = setSort('price-desc')
      expect(list).toHaveLength(catalog.length)
      expectNonIncreasing(list.map(b => b.lowestPriceUSD))
    })

    it('"rating-desc" sorts by normalized review score descending', () => {
      const list = setSort('rating-desc')
      expect(list).toHaveLength(catalog.length)
      expectNonIncreasing(list.map(b => b.review.score / b.review.maxScore))
    })

    it('"capacity-desc" sorts by capacity descending', () => {
      const list = setSort('capacity-desc')
      expect(list).toHaveLength(catalog.length)
      expectNonIncreasing(list.map(b => b.capacityLiters))
    })

    it('"brand-asc" sorts alphabetically by brand', () => {
      const list = setSort('brand-asc')
      const brands = list.map(b => b.brand)
      expect(list).toHaveLength(catalog.length)
      expect(brands).toEqual([...brands].sort((a, b) => a.localeCompare(b)))
    })

    it('does not mutate the underlying catalog order', () => {
      const { allBackpacks, sortBy } = useBackpackCatalog()
      const before = allBackpacks.value.map(b => b.id)

      sortBy.value = 'price-asc'

      expect(allBackpacks.value.map(b => b.id)).toEqual(before)
    })
  })

  describe('resetFilters', () => {
    it('restores default search, brand and sort and shows the full catalog', () => {
      const { filteredBackpacks, searchQuery, selectedBrand, sortBy, resetFilters } = useBackpackCatalog()

      searchQuery.value = 'Aer'
      selectedBrand.value = 'Aer'
      sortBy.value = 'price-desc'
      expect(filteredBackpacks.value).toHaveLength(1)

      resetFilters()

      expect(searchQuery.value).toBe('')
      expect(selectedBrand.value).toBe('all')
      expect(sortBy.value).toBe('featured')
      expect(filteredBackpacks.value.map(b => b.id)).toEqual(catalog.map(b => b.id))
    })
  })
})
