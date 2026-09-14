import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, cpSync, symlinkSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { normalizeBackpack, useBackpackCatalog } from '@/composables/useBackpackCatalog'
import rawData from '@/data/backpacks.json'
import type { BackpackItem, RetailerOffer } from '@/types/backpack'

// Acceptance tests for README issue #1 (task: fix/data-best-price).
//
// 1. src/data/backpacks.json: isLowestPrice is true exactly for the offer(s)
//    at min(priceUSD); lowestPriceUSD / primaryRetailer agree with that min.
// 2. useBackpackCatalog normalises every item at load time so a bad flag in
//    the JSON can never reach the UI again.
// 3. scripts/verify-catalog.mjs fails on any record whose lowestPriceUSD or
//    isLowestPrice flags disagree with the retailer offers.

const ROOT = resolve(__dirname, '..', '..')
const catalog = rawData as BackpackItem[]
const OFFICIAL_SUFFIX = / \(Official\)$/

const minPrice = (offers: RetailerOffer[]) => Math.min(...offers.map(o => o.priceUSD))

// The exact pre-fix Synik 22 offers from development (only the flags were wrong).
const PRE_FIX_SYNIK_OFFERS: RetailerOffer[] = [
  { name: 'Tom Bihn (Official)', priceUSD: 340, url: 'https://www.tombihn.com/products/synik-22', isLowestPrice: true },
  { name: 'Carryology Marketplace', priceUSD: 320, url: 'https://www.carryology.com/', isLowestPrice: false }
]

function makeItem(overrides: Partial<BackpackItem> = {}): BackpackItem {
  return {
    id: 'fixture',
    brand: 'Fixture',
    name: 'Fixture Pack',
    capacityLiters: 22,
    lowestPriceUSD: 320,
    primaryRetailer: 'Carryology Marketplace',
    review: { score: 4.7, maxScore: 5 },
    colorways: [],
    images: [],
    retailers: PRE_FIX_SYNIK_OFFERS.map(o => ({ ...o })),
    ...overrides
  }
}

describe('data: backpacks.json Best Price consistency (criterion 1)', () => {
  it('has 20 records and every record carries retailer offers', () => {
    expect(catalog).toHaveLength(20)
    for (const pack of catalog) {
      expect(pack.retailers?.length, pack.id).toBeGreaterThan(0)
    }
  })

  it('isLowestPrice is true exactly for the offers at the minimum price on every record', () => {
    for (const pack of catalog) {
      const offers = pack.retailers!
      const min = minPrice(offers)
      const flagged = offers.filter(o => o.isLowestPrice === true).map(o => o.name)
      const cheapest = offers.filter(o => o.priceUSD === min).map(o => o.name)
      expect(flagged, pack.id).toEqual(cheapest)
      // No offer above the minimum may carry the badge.
      for (const o of offers) {
        if (o.priceUSD > min) expect(o.isLowestPrice, `${pack.id} / ${o.name}`).not.toBe(true)
      }
    }
  })

  it('lowestPriceUSD equals the minimum offer price on every record', () => {
    for (const pack of catalog) {
      expect(pack.lowestPriceUSD, pack.id).toBe(minPrice(pack.retailers!))
    }
  })

  it('primaryRetailer names the first lowest offer (without " (Official)") on every record', () => {
    for (const pack of catalog) {
      const offers = pack.retailers!
      const first = offers.find(o => o.priceUSD === minPrice(offers))!
      expect(pack.primaryRetailer, pack.id).toBe(first.name.replace(OFFICIAL_SUFFIX, ''))
      expect(pack.primaryRetailer, pack.id).not.toMatch(OFFICIAL_SUFFIX)
    }
  })

  it('Tom Bihn Synik 22: Carryology Marketplace at $320 is the only Best Price and URLs are intact', () => {
    const synik = catalog.find(p => p.id === 'tom-bihn-synik-22')!
    expect(synik.lowestPriceUSD).toBe(320)
    expect(synik.primaryRetailer).toBe('Carryology Marketplace')
    expect(synik.retailers).toEqual([
      { name: 'Tom Bihn (Official)', priceUSD: 340, url: 'https://www.tombihn.com/products/synik-22', isLowestPrice: false },
      { name: 'Carryology Marketplace', priceUSD: 320, url: 'https://www.carryology.com/', isLowestPrice: true }
    ])
  })
})

describe('data: normalizeBackpack repairs inconsistent input at load time (criterion 2)', () => {
  it('repairs the exact pre-fix Synik 22 record (flags, lowestPriceUSD and primaryRetailer all wrong)', () => {
    const broken = makeItem({ lowestPriceUSD: 340, primaryRetailer: 'Tom Bihn' })
    const fixed = normalizeBackpack(broken)

    expect(fixed.lowestPriceUSD).toBe(320)
    expect(fixed.primaryRetailer).toBe('Carryology Marketplace')
    expect(fixed.retailers!.map(o => o.isLowestPrice)).toEqual([false, true])
    // URLs, names and prices must be untouched.
    expect(fixed.retailers!.map(({ name, priceUSD, url }) => ({ name, priceUSD, url }))).toEqual(
      PRE_FIX_SYNIK_OFFERS.map(({ name, priceUSD, url }) => ({ name, priceUSD, url }))
    )
  })

  it('sets an explicit boolean isLowestPrice on every offer, even when the JSON omits it', () => {
    const item = makeItem({
      retailers: [
        { name: 'A', priceUSD: 200, url: 'https://a.example' },
        { name: 'B', priceUSD: 150, url: 'https://b.example' }
      ]
    })
    const { retailers } = normalizeBackpack(item)
    expect(retailers!.map(o => o.isLowestPrice)).toEqual([false, true])
    for (const o of retailers!) expect(typeof o.isLowestPrice).toBe('boolean')
  })

  it('clears a stale true flag when the JSON badges more than one non-minimum offer', () => {
    const item = makeItem({
      retailers: [
        { name: 'X (Official)', priceUSD: 300, url: 'https://x.example', isLowestPrice: true },
        { name: 'Y', priceUSD: 280, url: 'https://y.example', isLowestPrice: true },
        { name: 'Z', priceUSD: 260, url: 'https://z.example', isLowestPrice: true }
      ]
    })
    const out = normalizeBackpack(item)
    expect(out.retailers!.map(o => o.isLowestPrice)).toEqual([false, false, true])
    expect(out.lowestPriceUSD).toBe(260)
    expect(out.primaryRetailer).toBe('Z')
  })

  it('on a tie, badges every tied offer and takes primaryRetailer from the FIRST tied offer', () => {
    const item = makeItem({
      lowestPriceUSD: 1,
      primaryRetailer: 'nope',
      retailers: [
        { name: 'Huckberry', priceUSD: 345, url: 'https://h.example' },
        { name: 'GORUCK (Official)', priceUSD: 345, url: 'https://g.example' },
        { name: 'Rogue', priceUSD: 350, url: 'https://r.example' }
      ]
    })
    const out = normalizeBackpack(item)
    expect(out.retailers!.map(o => o.isLowestPrice)).toEqual([true, true, false])
    expect(out.primaryRetailer).toBe('Huckberry')
  })

  it('strips only a trailing " (Official)" suffix from the card label', () => {
    const official = makeItem({
      retailers: [{ name: 'Tom Bihn (Official)', priceUSD: 300, url: 'https://t.example' }]
    })
    expect(normalizeBackpack(official).primaryRetailer).toBe('Tom Bihn')

    // "(Official)" in the middle of a name is not a suffix and must be preserved.
    const midName = makeItem({
      retailers: [{ name: '(Official) Outlet Store', priceUSD: 300, url: 'https://o.example' }]
    })
    expect(normalizeBackpack(midName).primaryRetailer).toBe('(Official) Outlet Store')
  })

  it('handles a single-offer record', () => {
    const solo = makeItem({
      lowestPriceUSD: 0,
      primaryRetailer: '',
      retailers: [{ name: 'Only Shop (Official)', priceUSD: 42, url: 'https://only.example' }]
    })
    const out = normalizeBackpack(solo)
    expect(out.lowestPriceUSD).toBe(42)
    expect(out.primaryRetailer).toBe('Only Shop')
    expect(out.retailers![0].isLowestPrice).toBe(true)
  })

  it('leaves records without offers alone (no retailers key or empty array)', () => {
    const none = makeItem({ retailers: undefined, lowestPriceUSD: 77, primaryRetailer: 'Direct' })
    expect(normalizeBackpack(none)).toEqual(none)
    const empty = makeItem({ retailers: [], lowestPriceUSD: 77, primaryRetailer: 'Direct' })
    expect(normalizeBackpack(empty)).toEqual(empty)
  })

  it('is a pure function: never mutates the input record or its offers', () => {
    const input = makeItem()
    const snapshot = JSON.parse(JSON.stringify(input))
    const out = normalizeBackpack(input)
    expect(out).not.toBe(input)
    expect(out.retailers).not.toBe(input.retailers)
    expect(input).toEqual(snapshot)
  })

  it('preserves every other field of the record (type BackpackItem stays intact)', () => {
    const input = makeItem({
      description: 'desc',
      material: 'X-Pac',
      dimensions: '1x2x3',
      weightKg: 1.2,
      features: ['a', 'b'],
      contrastFallback: '#000000',
      colorways: [{ name: 'Black', hex: '#000000', isPopular: true }],
      images: ['/img/a.webp']
    })
    const out = normalizeBackpack(input)
    const { lowestPriceUSD: _l, primaryRetailer: _p, retailers: _r, ...restIn } = input
    const { lowestPriceUSD: _lo, primaryRetailer: _po, retailers: _ro, ...restOut } = out
    expect(restOut).toEqual(restIn)
    expect(Object.keys(out).sort()).toEqual(Object.keys(input).sort())
  })

  it('useBackpackCatalog exposes normalised items whose flags/price/retailer agree with the offers', () => {
    const { allBackpacks, filteredBackpacks } = useBackpackCatalog()
    expect(allBackpacks.value).toHaveLength(20)
    for (const list of [allBackpacks.value, filteredBackpacks.value]) {
      for (const pack of list) {
        const min = minPrice(pack.retailers!)
        expect(pack.lowestPriceUSD, pack.id).toBe(min)
        expect(pack.retailers!.map(o => o.isLowestPrice), pack.id).toEqual(pack.retailers!.map(o => o.priceUSD === min))
        const first = pack.retailers!.find(o => o.priceUSD === min)!
        expect(pack.primaryRetailer, pack.id).toBe(first.name.replace(OFFICIAL_SUFFIX, ''))
      }
    }
    const synik = allBackpacks.value.find(p => p.id === 'tom-bihn-synik-22')!
    expect(synik.retailers!.filter(o => o.isLowestPrice).map(o => o.name)).toEqual(['Carryology Marketplace'])
  })

  it('price sorting uses the derived lowestPriceUSD (Synik 22 sorts at $320, not $340)', () => {
    const { filteredBackpacks, sortBy } = useBackpackCatalog()
    sortBy.value = 'price-asc'
    const prices = filteredBackpacks.value.map(p => p.lowestPriceUSD)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
    const synikIdx = filteredBackpacks.value.findIndex(p => p.id === 'tom-bihn-synik-22')
    expect(filteredBackpacks.value[synikIdx].lowestPriceUSD).toBe(320)
    // Everything after Synik in price-asc order costs at least $320.
    for (const p of filteredBackpacks.value.slice(synikIdx)) expect(p.lowestPriceUSD).toBeGreaterThanOrEqual(320)
  })
})

describe('data: scripts/verify-catalog.mjs flags Best Price mismatches (criterion 3)', () => {
  // The script resolves ../src/data/backpacks.json and ../public relative to
  // its own location, so each case runs it from a temp tree with a mutated copy
  // of the catalog and a symlink to the real public/ directory.
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  function runVerify(mutate: (data: BackpackItem[]) => void) {
    const dir = mkdtempSync(join(tmpdir(), 'edc-verify-'))
    tempDirs.push(dir)
    mkdirSync(join(dir, 'scripts'))
    mkdirSync(join(dir, 'src', 'data'), { recursive: true })
    cpSync(join(ROOT, 'scripts', 'verify-catalog.mjs'), join(dir, 'scripts', 'verify-catalog.mjs'))
    symlinkSync(join(ROOT, 'public'), join(dir, 'public'), 'dir')

    const data = JSON.parse(JSON.stringify(catalog)) as BackpackItem[]
    mutate(data)
    writeFileSync(join(dir, 'src', 'data', 'backpacks.json'), JSON.stringify(data, null, 2))

    const res = spawnSync(process.execPath, [join(dir, 'scripts', 'verify-catalog.mjs')], { encoding: 'utf8' })
    return { status: res.status, out: `${res.stdout}\n${res.stderr}` }
  }

  const synikOf = (data: BackpackItem[]) => data.find(p => p.id === 'tom-bihn-synik-22')!

  it('passes on the committed catalog', () => {
    const { status, out } = runVerify(() => {})
    expect(out).toMatch(/Best Price/)
    expect(status).toBe(0)
  })

  it('fails when the isLowestPrice flags are swapped (the original Synik 22 bug)', () => {
    const { status, out } = runVerify(data => {
      const s = synikOf(data)
      s.retailers![0].isLowestPrice = true
      s.retailers![1].isLowestPrice = false
    })
    expect(status).toBe(1)
    expect(out).toContain('tom-bihn-synik-22')
    expect(out).toMatch(/isLowestPrice/)
  })

  it('fails when a non-minimum offer is additionally badged', () => {
    const { status, out } = runVerify(data => {
      synikOf(data).retailers![0].isLowestPrice = true
    })
    expect(status).toBe(1)
    expect(out).toContain('Tom Bihn (Official)')
  })

  it('fails when the minimum offer is missing its badge', () => {
    const { status, out } = runVerify(data => {
      synikOf(data).retailers![1].isLowestPrice = false
    })
    expect(status).toBe(1)
    expect(out).toContain('Carryology Marketplace')
  })

  it('fails when lowestPriceUSD disagrees with the cheapest offer', () => {
    const { status, out } = runVerify(data => {
      synikOf(data).lowestPriceUSD = 340
    })
    expect(status).toBe(1)
    expect(out).toMatch(/tom-bihn-synik-22.*lowestPriceUSD/)
  })

  it('fails when a new cheaper offer is added without updating the flags/price', () => {
    const { status, out } = runVerify(data => {
      data[0].retailers!.push({ name: 'Cheapo', priceUSD: 1, url: 'https://cheapo.example', isLowestPrice: false })
    })
    expect(status).toBe(1)
    expect(out).toContain(catalog[0].id)
  })
})
