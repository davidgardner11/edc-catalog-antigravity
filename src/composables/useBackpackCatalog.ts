import { ref, computed, getCurrentScope, onScopeDispose } from 'vue'
import type { BackpackItem, SortOption } from '../types/backpack'
import rawData from '../data/backpacks.json'

/** localStorage key holding the user's explicit theme choice. Mirrored by the inline script in index.html. */
export const THEME_STORAGE_KEY = 'edc-theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

type ThemePreference = 'dark' | 'light'

/** Explicit theme the user picked earlier, or null when they never toggled (or storage is unavailable). */
function readStoredTheme(): ThemePreference | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

function writeStoredTheme(theme: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable (privacy mode, blocked cookies) — the in-memory state still works.
  }
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

const OFFICIAL_SUFFIX = / \(Official\)$/

/** Label shown on the card, e.g. "Tom Bihn (Official)" -> "Tom Bihn". */
function retailerLabel(name: string): string {
  return name.replace(OFFICIAL_SUFFIX, '')
}

/**
 * Derives the price fields from `retailers[]` so the JSON can never disagree
 * with itself: lowestPriceUSD is the minimum offer price, isLowestPrice is
 * true exactly for offers at that price, and primaryRetailer is the first
 * lowest offer. Items without retailer offers are returned unchanged.
 */
export function normalizeBackpack(item: BackpackItem): BackpackItem {
  const retailers = item.retailers
  if (!retailers || retailers.length === 0) return item

  const lowestPriceUSD = Math.min(...retailers.map(r => r.priceUSD))
  const normalizedRetailers = retailers.map(r => ({
    ...r,
    isLowestPrice: r.priceUSD === lowestPriceUSD
  }))
  const primary = normalizedRetailers.find(r => r.isLowestPrice) ?? normalizedRetailers[0]

  return {
    ...item,
    lowestPriceUSD,
    primaryRetailer: retailerLabel(primary.name),
    retailers: normalizedRetailers
  }
}

const normalizedData = (rawData as BackpackItem[]).map(normalizeBackpack)

export function useBackpackCatalog() {
  const allBackpacks = ref<BackpackItem[]>(normalizedData)
  const searchQuery = ref('')
  const selectedBrand = ref('all')
  const sortBy = ref<SortOption>('featured')
  // The inline script in index.html already resolved stored/OS preference before first paint,
  // so the <html> class is the source of truth at startup.
  const isDarkMode = ref(document.documentElement.classList.contains('dark'))

  // Until the user picks a theme explicitly, follow live changes of the OS preference.
  const colorScheme = typeof window.matchMedia === 'function' ? window.matchMedia(COLOR_SCHEME_QUERY) : null
  const onColorSchemeChange = (event: MediaQueryListEvent) => {
    if (readStoredTheme()) return
    isDarkMode.value = event.matches
    applyTheme(event.matches)
  }
  const stopFollowingColorScheme = () => {
    colorScheme?.removeEventListener('change', onColorSchemeChange)
  }
  if (colorScheme && !readStoredTheme()) {
    colorScheme.addEventListener('change', onColorSchemeChange)
    if (getCurrentScope()) onScopeDispose(stopFollowingColorScheme)
  }

  // Unique list of brands for dropdown filter
  const brandList = computed(() => {
    const brands = new Set(allBackpacks.value.map(b => b.brand))
    return ['all', ...Array.from(brands).sort()]
  })

  // Filtered and sorted backpacks
  const filteredBackpacks = computed(() => {
    let list = [...allBackpacks.value]

    // Brand filter
    if (selectedBrand.value !== 'all') {
      list = list.filter(b => b.brand.toLowerCase() === selectedBrand.value.toLowerCase())
    }

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.brand.toLowerCase().includes(q) ||
        (b.material && b.material.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
      )
    }

    // Sorting
    switch (sortBy.value) {
      case 'price-asc':
        list.sort((a, b) => a.lowestPriceUSD - b.lowestPriceUSD)
        break
      case 'price-desc':
        list.sort((a, b) => b.lowestPriceUSD - a.lowestPriceUSD)
        break
      case 'rating-desc':
        list.sort((a, b) => {
          const normA = (a.review.score / a.review.maxScore)
          const normB = (b.review.score / b.review.maxScore)
          return normB - normA
        })
        break
      case 'capacity-desc':
        list.sort((a, b) => b.capacityLiters - a.capacityLiters)
        break
      case 'brand-asc':
        list.sort((a, b) => a.brand.localeCompare(b.brand))
        break
      case 'featured':
      default:
        // preserve curated order
        break
    }

    return list
  })

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme(isDarkMode.value)
    // An explicit choice wins over the OS preference from now on.
    writeStoredTheme(isDarkMode.value ? 'dark' : 'light')
    stopFollowingColorScheme()
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedBrand.value = 'all'
    sortBy.value = 'featured'
  }

  return {
    allBackpacks,
    filteredBackpacks,
    searchQuery,
    selectedBrand,
    sortBy,
    brandList,
    isDarkMode,
    toggleDarkMode,
    resetFilters
  }
}
