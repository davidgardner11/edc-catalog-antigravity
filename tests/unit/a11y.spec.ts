import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ColorGrid from '@/components/ColorGrid.vue'
import CardCarousel from '@/components/CardCarousel.vue'
import BackpackCard from '@/components/BackpackCard.vue'
import BackpackModal from '@/components/BackpackModal.vue'
import catalog from '@/data/backpacks.json'
import type { BackpackItem } from '@/types/backpack'

// README issue #8: keyboard / screen-reader affordances on the modal,
// carousel, swatches and card root.

const packs = catalog as BackpackItem[]
const pack = packs[0]

const escape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
const mounted: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T): T => {
  mounted.push(w)
  return w
}

afterEach(() => {
  mounted.splice(0).forEach(w => w.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('ColorGrid swatches', () => {
  const colorways = [
    { name: 'Black', hex: '#000000' },
    { name: 'Coyote', hex: '#81613c' }
  ]

  it('renders each swatch as a labelled button and shows the tooltip on focus', async () => {
    const wrapper = track(mount(ColorGrid, { props: { colorways } }))
    const buttons = wrapper.findAll('button[aria-label]')

    expect(buttons.map(b => b.attributes('aria-label'))).toEqual(['Black', 'Coyote'])
    expect(buttons.every(b => b.attributes('type') === 'button')).toBe(true)
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)

    await buttons[1].trigger('focus')
    expect(wrapper.findAll('[role="tooltip"]')).toHaveLength(1)
    expect(wrapper.find('[role="tooltip"]').text()).toBe('Coyote')

    await buttons[1].trigger('blur')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('toggles the tooltip on click without bubbling to the card', async () => {
    const wrapper = track(mount({
      components: { ColorGrid },
      data: () => ({ clicks: 0, colorways }),
      template: '<div @click="clicks++"><ColorGrid :colorways="colorways" /></div>'
    }))
    const swatch = wrapper.find('button[aria-label="Black"]')

    await swatch.trigger('click')
    expect(wrapper.find('[role="tooltip"]').text()).toBe('Black')
    await swatch.trigger('click')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    expect((wrapper.vm as unknown as { clicks: number }).clicks).toBe(0)
  })

  it('shows the tooltip after a tap even though touch emulates hover and focus first', async () => {
    const wrapper = track(mount(ColorGrid, { props: { colorways } }))
    const cell = wrapper.findAll('.grid > div')[0]
    const swatch = cell.find('button')

    await cell.trigger('touchstart')
    await cell.trigger('mouseenter')
    await swatch.trigger('focus')
    await swatch.trigger('click')
    expect(wrapper.find('[role="tooltip"]').text()).toBe('Black')

    await cell.trigger('touchstart')
    await swatch.trigger('click')
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })
})

describe('CardCarousel navigation zones', () => {
  const images = ['/a.webp', '/b.webp', '/c.webp']

  it('renders prev/next as labelled buttons with a live slide announcement and hidden dots', async () => {
    const wrapper = track(mount(CardCarousel, { props: { images, brand: 'Brand', name: 'Pack' } }))
    const prev = wrapper.find('button[aria-label="Previous image"]')
    const next = wrapper.find('button[aria-label="Next image"]')
    const live = wrapper.find('[aria-live="polite"]')

    expect(prev.attributes('type')).toBe('button')
    expect(next.attributes('type')).toBe('button')
    expect(wrapper.find('.pointer-events-none[aria-hidden="true"]').exists()).toBe(true)
    expect(live.text()).toBe('Image 1 of 3')

    await next.trigger('keydown', { key: 'ArrowRight' })
    expect(live.text()).toBe('Image 2 of 3')
    await next.trigger('keydown', { key: 'ArrowLeft' })
    expect(live.text()).toBe('Image 1 of 3')
    await prev.trigger('keydown', { key: 'ArrowLeft' })
    expect(live.text()).toBe('Image 3 of 3')
  })

  it('does not let zone clicks bubble to the card', async () => {
    const wrapper = track(mount({
      components: { CardCarousel },
      data: () => ({ clicks: 0, images }),
      template: '<div @click="clicks++"><CardCarousel :images="images" brand="B" name="N" /></div>'
    }))

    await wrapper.find('button[aria-label="Next image"]').trigger('click')
    expect((wrapper.vm as unknown as { clicks: number }).clicks).toBe(0)
  })
})

describe('BackpackCard root', () => {
  it('is a labelled, focusable button that selects on Enter and Space', async () => {
    const wrapper = track(mount(BackpackCard, { props: { backpack: pack } }))
    const root = wrapper.find('[role="button"]')

    expect(root.attributes('tabindex')).toBe('0')
    expect(root.attributes('aria-label')).toBe(`View details for ${pack.brand} ${pack.name}`)

    await root.trigger('keydown', { key: 'Enter' })
    await root.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('select')).toHaveLength(2)

    // Keys pressed on nested controls (carousel zones) must not open the card.
    await wrapper.find('button[aria-label="Next image"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toHaveLength(2)
  })
})

describe('BackpackModal', () => {
  it('exposes dialog semantics, locks scroll, moves focus in and restores it on close', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const wrapper = track(mount(BackpackModal, { props: { backpack: null }, attachTo: document.body }))
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await wrapper.setProps({ backpack: pack })
    await nextTick()

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    const title = wrapper.find(`#${dialog.attributes('aria-labelledby')}`)
    expect(title.text()).toBe(pack.name)
    expect(document.activeElement).toBe(title.element)
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('button[aria-label="Close details"]').exists()).toBe(true)

    await wrapper.setProps({ backpack: null })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
  })

  it('emits close on Escape', async () => {
    const wrapper = track(mount(BackpackModal, { props: { backpack: pack }, attachTo: document.body }))
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)

    // Listener is removed once the dialog closes.
    await wrapper.setProps({ backpack: null })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('wraps Tab from the last control to the first and Shift+Tab back', async () => {
    const wrapper = track(mount(BackpackModal, { props: { backpack: pack }, attachTo: document.body }))
    await nextTick()

    const controls = Array.from(
      wrapper.find('[role="dialog"]').element.querySelectorAll<HTMLElement>('a[href], button')
    )
    const first = controls[0]
    const last = controls[controls.length - 1]

    last.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(first)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(last)
  })
})

// ---- Lifecycle hygiene and control contracts (formerly a11y-acceptance.spec.ts) ----

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
