import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
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
