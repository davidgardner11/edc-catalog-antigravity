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

const pack = (catalog as BackpackItem[])[0]
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
