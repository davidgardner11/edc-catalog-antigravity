import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { mount } from '@vue/test-utils'
import CatalogNavbar from '@/components/CatalogNavbar.vue'
import { THEME_STORAGE_KEY, useBackpackCatalog } from '@/composables/useBackpackCatalog'

// jsdom has no matchMedia; this stub lets tests flip the OS preference and
// fire "change" events like a real MediaQueryList would.
type ChangeListener = (event: MediaQueryListEvent) => void

function installMatchMedia(initiallyDark: boolean) {
  const listeners = new Set<ChangeListener>()
  const mql = {
    matches: initiallyDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.add(listener)
    }),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      listeners.delete(listener)
    })
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))

  return {
    mql,
    listenerCount: () => listeners.size,
    setPrefersDark(dark: boolean) {
      mql.matches = dark
      for (const listener of listeners) listener({ matches: dark } as MediaQueryListEvent)
    }
  }
}

const html = () => document.documentElement

describe('dark mode persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    html().classList.remove('dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    html().classList.remove('dark')
  })

  it('initialises from the <html> class the inline script already applied', () => {
    installMatchMedia(false)

    html().classList.add('dark')
    expect(useBackpackCatalog().isDarkMode.value).toBe(true)

    html().classList.remove('dark')
    expect(useBackpackCatalog().isDarkMode.value).toBe(false)
  })

  it('toggle flips the class and stores the explicit choice', () => {
    installMatchMedia(false)
    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()

    toggleDarkMode()
    expect(isDarkMode.value).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    toggleDarkMode()
    expect(isDarkMode.value).toBe(false)
    expect(html().classList.contains('dark')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('follows live OS preference changes while no choice is stored', () => {
    const media = installMatchMedia(false)
    const { isDarkMode } = useBackpackCatalog()

    expect(media.listenerCount()).toBe(1)

    media.setPrefersDark(true)
    expect(isDarkMode.value).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)

    media.setPrefersDark(false)
    expect(isDarkMode.value).toBe(false)
    expect(html().classList.contains('dark')).toBe(false)
  })

  it('stops following the OS once the user toggles', () => {
    const media = installMatchMedia(false)
    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()

    toggleDarkMode()
    expect(isDarkMode.value).toBe(true)
    expect(media.listenerCount()).toBe(0)

    media.setPrefersDark(false)
    expect(isDarkMode.value).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
  })

  it('does not subscribe to the OS preference when a choice is already stored', () => {
    const media = installMatchMedia(true)
    localStorage.setItem(THEME_STORAGE_KEY, 'light')

    const { isDarkMode } = useBackpackCatalog()

    expect(media.listenerCount()).toBe(0)
    media.setPrefersDark(false)
    media.setPrefersDark(true)
    expect(isDarkMode.value).toBe(false)
    expect(html().classList.contains('dark')).toBe(false)
  })

  it('removes the media listener when the owning scope is disposed', () => {
    const media = installMatchMedia(false)
    const scope = effectScope()

    scope.run(() => useBackpackCatalog())
    expect(media.listenerCount()).toBe(1)

    scope.stop()
    expect(media.listenerCount()).toBe(0)
  })

  it('still toggles when localStorage throws', () => {
    installMatchMedia(false)
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError')
    })

    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()
    expect(() => toggleDarkMode()).not.toThrow()
    expect(isDarkMode.value).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)

    setItem.mockRestore()
    getItem.mockRestore()
  })

  it('works when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)

    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()
    expect(isDarkMode.value).toBe(false)

    toggleDarkMode()
    expect(isDarkMode.value).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })
})

// ---- Contract edge cases and navbar toggle (formerly darkmode-acceptance.spec.ts) ----

type Listener = (event: MediaQueryListEvent) => void

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_: string, l: Listener) => listeners.add(l)),
    removeEventListener: vi.fn((_: string, l: Listener) => listeners.delete(l))
  }
  const matchMedia = vi.fn(() => mql)
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    mql,
    listeners,
    fire(dark: boolean) {
      mql.matches = dark
      for (const l of [...listeners]) l({ matches: dark, media: mql.media } as MediaQueryListEvent)
    }
  }
}

const root = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  root().classList.remove('dark')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
  root().classList.remove('dark')
})

describe('useBackpackCatalog dark mode (acceptance)', () => {
  it('exports the storage key the inline script uses', () => {
    expect(THEME_STORAGE_KEY).toBe('edc-theme')
  })

  it('seeds isDarkMode from the <html> class, not from matchMedia', () => {
    const media = stubMatchMedia(true) // OS says dark ...
    root().classList.remove('dark') // ... but the inline script (or stored "light") left it light
    expect(useBackpackCatalog().isDarkMode.value).toBe(false)

    media.mql.matches = false // OS says light ...
    root().classList.add('dark') // ... but html is dark
    expect(useBackpackCatalog().isDarkMode.value).toBe(true)
  })

  it('queries exactly the prefers-color-scheme: dark media query', () => {
    const media = stubMatchMedia(false)
    useBackpackCatalog()
    expect(media.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    expect(media.mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('treats an unrecognised stored value as "no preference" and follows the OS', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'banana')
    const media = stubMatchMedia(false)
    const { isDarkMode } = useBackpackCatalog()

    expect(media.listeners.size).toBe(1)
    media.fire(true)
    expect(isDarkMode.value).toBe(true)
    expect(root().classList.contains('dark')).toBe(true)
  })

  it('treats unreadable storage as "no preference" and still follows the OS', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    const media = stubMatchMedia(false)
    const { isDarkMode } = useBackpackCatalog()

    expect(media.listeners.size).toBe(1)
    media.fire(true)
    expect(isDarkMode.value).toBe(true)
  })

  it('ignores OS changes once a preference was stored elsewhere (e.g. another tab)', () => {
    const media = stubMatchMedia(false)
    const { isDarkMode } = useBackpackCatalog()

    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    media.fire(true)
    expect(isDarkMode.value).toBe(false)
    expect(root().classList.contains('dark')).toBe(false)
  })

  it('writes the literal strings "dark" / "light" under edc-theme and removes the OS listener on first toggle', () => {
    const media = stubMatchMedia(false)
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()

    toggleDarkMode()
    expect(setItem).toHaveBeenLastCalledWith(THEME_STORAGE_KEY, 'dark')
    expect(media.mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(media.listeners.size).toBe(0)

    toggleDarkMode()
    expect(setItem).toHaveBeenLastCalledWith(THEME_STORAGE_KEY, 'light')
    expect(isDarkMode.value).toBe(false)

    // Only ever the two accepted values are written.
    for (const call of setItem.mock.calls) {
      expect(call[0]).toBe(THEME_STORAGE_KEY)
      expect(['dark', 'light']).toContain(call[1])
    }
  })

  it('toggle starting from an OS-dark page stores "light" and keeps it after later OS flips', () => {
    const media = stubMatchMedia(true)
    root().classList.add('dark')
    const { isDarkMode, toggleDarkMode } = useBackpackCatalog()
    expect(isDarkMode.value).toBe(true)

    toggleDarkMode()
    expect(isDarkMode.value).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    media.fire(true)
    media.fire(false)
    media.fire(true)
    expect(isDarkMode.value).toBe(false)
    expect(root().classList.contains('dark')).toBe(false)
  })
})

describe('CatalogNavbar dark toggle contract', () => {
  const baseProps = {
    searchQuery: '',
    selectedBrand: 'all',
    sortBy: 'featured' as const,
    brandList: ['Aer', 'Bellroy'],
    totalCount: 20
  }

  it('renders two toggle buttons with aria-label and aria-pressed mirroring isDark', async () => {
    const wrapper = mount(CatalogNavbar, { props: { ...baseProps, isDark: false } })
    const toggles = wrapper.findAll('button[aria-label="Toggle dark mode"]')
    expect(toggles).toHaveLength(2)
    for (const btn of toggles) {
      expect(btn.attributes('aria-pressed')).toBe('false')
      expect(btn.attributes('type')).toBe('button')
      expect(btn.text()).toBe('🌙')
    }

    await wrapper.setProps({ isDark: true })
    for (const btn of wrapper.findAll('button[aria-label="Toggle dark mode"]')) {
      expect(btn.attributes('aria-pressed')).toBe('true')
      expect(btn.text()).toBe('☀️')
    }
  })

  it('keeps the original titles and emits toggle-dark from either button', async () => {
    const wrapper = mount(CatalogNavbar, { props: { ...baseProps, isDark: false } })
    const [mobile, desktop] = wrapper.findAll('button[aria-label="Toggle dark mode"]')

    expect(mobile.attributes('title')).toBe('Toggle Dark Mode')
    expect(mobile.classes()).toContain('md:hidden')
    expect(desktop.attributes('title')).toBe('Switch to Dark Mode')
    expect(desktop.classes()).toContain('md:flex')

    await mobile.trigger('click')
    await desktop.trigger('click')
    expect(wrapper.emitted('toggle-dark')).toHaveLength(2)

    await wrapper.setProps({ isDark: true })
    expect(desktop.attributes('title')).toBe('Switch to Light Mode')
  })
})
