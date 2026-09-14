import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import BackpackModal from '@/components/BackpackModal.vue'
import BackpackCard from '@/components/BackpackCard.vue'
import CardCarousel from '@/components/CardCarousel.vue'
import ColorGrid from '@/components/ColorGrid.vue'
import catalog from '@/data/backpacks.json'
import type { BackpackItem } from '@/types/backpack'

// Acceptance-level unit checks for README issue #8 that complement the e2e
// suite: lifecycle hygiene of the modal (scroll lock restore, listener
// cleanup, focus restore) and the contract of the card / carousel / swatch
// controls independent of a real browser.

const packs = catalog as BackpackItem[]
const mounted: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T): T => {
  mounted.push(w)
  return w
}

const escape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))

afterEach(() => {
  mounted.splice(0).forEach(w => w.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('BackpackModal lifecycle', () => {
  it('restores whatever body overflow value was set before it opened', async () => {
    document.body.style.overflow = 'scroll'
    const wrapper = track(mount(BackpackModal, { props: { backpack: null }, attachTo: document.body }))

    await wrapper.setProps({ backpack: packs[0] })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ backpack: null })
    await nextTick()
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('unlocks scroll, drops the Escape listener and restores focus when unmounted while open', async () => {
    const opener = document.createElement('button')
    opener.textContent = 'opener'
    document.body.appendChild(opener)
    opener.focus()

    const wrapper = mount(BackpackModal, { props: { backpack: packs[1] }, attachTo: document.body })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).not.toBe(opener)
    expect(wrapper.find('[role="dialog"]').element.contains(document.activeElement)).toBe(true)

    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)

    // No stale document listener: Escape after unmount emits nothing and throws nothing.
    escape()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close exactly once per Escape and only while open', async () => {
    const wrapper = track(mount(BackpackModal, { props: { backpack: null }, attachTo: document.body }))
    escape()
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.setProps({ backpack: packs[0] })
    await nextTick()
    const evt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    expect(wrapper.emitted('close')).toHaveLength(1)

    // Parent reacts by clearing the pack; a further Escape does nothing.
    await wrapper.setProps({ backpack: null })
    await nextTick()
    escape()
    expect(wrapper.emitted('close')).toHaveLength(1)

    // Re-open: exactly one listener again (not two).
    await wrapper.setProps({ backpack: packs[2] })
    await nextTick()
    escape()
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('swapping directly from one pack to another keeps the lock and does not lose the focus origin', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = track(mount(BackpackModal, { props: { backpack: null }, attachTo: document.body }))

    await wrapper.setProps({ backpack: packs[0] })
    await nextTick()
    await wrapper.setProps({ backpack: packs[1] })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('#backpack-modal-title').text()).toBe(packs[1].name)

    await wrapper.setProps({ backpack: null })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
  })

  it('names the dialog via aria-labelledby -> the h2, labels the close button and ignores keys other than Tab/Escape', async () => {
    const wrapper = track(mount(BackpackModal, { props: { backpack: packs[0] }, attachTo: document.body }))
    await nextTick()
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    const id = dialog.attributes('aria-labelledby')!
    const h2 = wrapper.find(`h2#${id}`)
    expect(h2.exists()).toBe(true)
    expect(h2.text()).toBe(packs[0].name)

    const close = wrapper.find('button[aria-label]')
    expect(close.attributes('aria-label')).toMatch(/close/i)
    expect(close.attributes('type')).toBe('button')

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    document.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('Tab from outside the dialog is pulled back to the first control', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    const wrapper = track(mount(BackpackModal, { props: { backpack: packs[0] }, attachTo: document.body }))
    await nextTick()
    const controls = wrapper.find('[role="dialog"]').element.querySelectorAll<HTMLElement>('a[href], button')

    outside.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(controls[0])

    outside.focus()
    const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    document.dispatchEvent(shiftTab)
    expect(shiftTab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(controls[controls.length - 1])
  })
})

describe('BackpackCard root contract', () => {
  it('has button semantics for every catalog entry and prevents Space from scrolling', async () => {
    for (const pack of packs.slice(0, 5)) {
      const wrapper = track(mount(BackpackCard, { props: { backpack: pack } }))
      const root = wrapper.find('[role="button"]')
      expect(root.element).toBe(wrapper.element)
      expect(root.attributes('tabindex')).toBe('0')
      expect(root.attributes('aria-label')).toBe(`View details for ${pack.brand} ${pack.name}`)
    }

    const wrapper = track(mount(BackpackCard, { props: { backpack: packs[0] } }))
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')).toEqual([[packs[0]]])

    // Other keys do nothing.
    await wrapper.trigger('keydown', { key: 'a' })
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('keys on nested swatch / pagination buttons do not select the card', async () => {
    const pack = packs.find(p => p.colorways.length > 9)!
    const wrapper = track(mount(BackpackCard, { props: { backpack: pack } }))
    const swatch = wrapper.find('button[aria-label]:not([aria-label$=" image"])')
    await swatch.trigger('keydown', { key: 'Enter' })
    await swatch.trigger('keydown', { key: ' ' })
    await swatch.trigger('click')
    const more = wrapper.find('button[aria-label="View more colors"]')
    await more.trigger('keydown', { key: 'Enter' })
    await more.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })
})

describe('CardCarousel contract', () => {
  it('renders no zones or live region for a single image and does not throw on arrows', async () => {
    const wrapper = track(mount(CardCarousel, { props: { images: ['/only.webp'], brand: 'B', name: 'N' } }))
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.find('[aria-live]').exists()).toBe(false)
  })

  it('arrow keys on either zone wrap around and never leak to the parent', async () => {
    const parentKeys: string[] = []
    const wrapper = track(mount({
      components: { CardCarousel },
      methods: { onKey(e: KeyboardEvent) { parentKeys.push(e.key) } },
      template: '<div @keydown="onKey"><CardCarousel :images="[\'/a\',\'/b\']" brand="B" name="N" /></div>'
    }))
    const prev = wrapper.find('button[aria-label="Previous image"]')
    const live = wrapper.find('[aria-live="polite"]')
    expect(live.classes()).toContain('sr-only')
    expect(live.attributes('aria-atomic')).toBe('true')

    await prev.trigger('keydown', { key: 'ArrowRight' })
    expect(live.text()).toBe('Image 2 of 2')
    await prev.trigger('keydown', { key: 'ArrowRight' })
    expect(live.text()).toBe('Image 1 of 2')
    await prev.trigger('keydown', { key: 'ArrowLeft' })
    expect(live.text()).toBe('Image 2 of 2')
    expect(parentKeys).toEqual([])

    // Unrelated keys still bubble (the zone only swallows what it handles).
    await prev.trigger('keydown', { key: 'Tab' })
    expect(parentKeys).toEqual(['Tab'])

    // Dots are hidden from assistive tech and the arrow icons are decorative.
    const dots = wrapper.find('div[aria-hidden="true"]')
    expect(dots.exists()).toBe(true)
    expect(dots.findAll('span')).toHaveLength(2)
    expect(wrapper.findAll('svg').every(s => s.attributes('aria-hidden') === 'true')).toBe(true)
  })
})

describe('ColorGrid contract', () => {
  const colorways = Array.from({ length: 12 }, (_, i) => ({ name: `Color ${i + 1}`, hex: '#112233' }))

  it('keeps the tooltip isolated to one swatch across hover, focus and click', async () => {
    const wrapper = track(mount(ColorGrid, { props: { colorways } }))
    const cells = wrapper.findAll('.grid > div').filter(c => c.find('button').exists())
    expect(cells).toHaveLength(8)

    await cells[0].trigger('mouseenter')
    await cells[1].find('button').trigger('focus')
    expect(wrapper.findAll('[role="tooltip"]')).toHaveLength(1)
    expect(wrapper.find('[role="tooltip"]').text()).toBe('Color 2')

    await cells[2].find('button').trigger('click')
    expect(wrapper.findAll('[role="tooltip"]')).toHaveLength(1)
    expect(wrapper.find('[role="tooltip"]').text()).toBe('Color 3')

    // Paginating clears the tooltip and swaps the labels.
    await wrapper.find('button[aria-label="View more colors"]').trigger('click')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    expect(wrapper.findAll('button[aria-label]').map(b => b.attributes('aria-label')))
      .toEqual(['Color 9', 'Color 10', 'Color 11', 'Color 12', 'View more colors'])
  })

  it('keeps the overflow-visible layout so tooltips are not clipped', () => {
    const wrapper = track(mount(ColorGrid, { props: { colorways } }))
    expect(wrapper.classes()).toContain('overflow-visible')
    expect(wrapper.find('.grid').classes()).toContain('overflow-visible')
  })
})
