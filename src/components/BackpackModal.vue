<template>
  <transition name="fade">
    <div
      v-if="backpack"
      @click.self="$emit('close')"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backpack-modal-title"
        tabindex="-1"
        class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8 focus:outline-none"
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          type="button"
          aria-label="Close details"
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div class="grid grid-cols-1 md:grid-cols-2">
          <!-- Image Gallery Preview -->
          <div class="bg-neutral-950 flex flex-col items-center justify-center p-4">
            <img
              :src="activeModalImage"
              :alt="backpack.name"
              class="w-full h-64 object-contain rounded-lg"
            />
            <!-- Thumbnail selection (omitted when the pack has no images) -->
            <div v-if="modalImages.length > 0" class="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              <button
                v-for="(img, idx) in modalImages"
                :key="img"
                @click="activeImageIndex = idx"
                type="button"
                class="w-10 h-10 rounded-md border-2 overflow-hidden shrink-0 transition-all"
                :class="activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-neutral-700 opacity-60 hover:opacity-100'"
              >
                <img :src="img" :alt="`Angle ${idx + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Specs & Content -->
          <div class="p-6 flex flex-col justify-between">
            <div>
              <span class="text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                {{ backpack.brand }}
              </span>
              <h2
                id="backpack-modal-title"
                ref="titleRef"
                tabindex="-1"
                class="text-xl font-black text-neutral-900 dark:text-white mt-0.5 focus:outline-none"
              >
                {{ backpack.name }}
              </h2>
              <p class="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                {{ backpack.description }}
              </p>

              <!-- Technical Specifications -->
              <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Capacity</span>
                  <span class="font-bold text-neutral-900 dark:text-white">{{ backpack.capacityLiters }} Liters</span>
                </div>
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Price</span>
                  <span class="font-bold text-neutral-900 dark:text-white">${{ backpack.lowestPriceUSD }} ({{ backpack.primaryRetailer }})</span>
                </div>
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Material</span>
                  <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ backpack.material || 'Cordura Nylon' }}</span>
                </div>
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Dimensions</span>
                  <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ backpack.dimensions || 'Standard EDC' }}</span>
                </div>
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Rating</span>
                  <span class="font-bold text-neutral-900 dark:text-white">{{ backpack.review.score }}/{{ backpack.review.maxScore }} ({{ backpack.review.sourceName }})</span>
                </div>
                <div>
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold">Weight</span>
                  <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ backpack.weightKg }} kg</span>
                </div>
              </div>

              <!-- Shop At Section -->
              <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                    Shop At ({{ backpack.retailers?.length || 1 }} Retailers)
                  </span>
                  <span class="text-[10px] text-neutral-400 font-medium">Direct Links ↗</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    v-for="retailer in (backpack.retailers || [{ name: backpack.primaryRetailer, priceUSD: backpack.lowestPriceUSD, url: '#', isLowestPrice: true }])"
                    :key="retailer.name"
                    :href="retailer.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group flex items-center justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-xs"
                  >
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {{ retailer.name }}
                      </span>
                      <span
                        v-if="retailer.isLowestPrice"
                        class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0"
                      >
                        Best Price
                      </span>
                    </div>
                    <div class="flex items-center gap-1 text-xs font-black text-neutral-900 dark:text-white shrink-0 ml-2">
                      <span>${{ retailer.priceUSD }}</span>
                      <svg class="w-3 h-3 text-neutral-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Available Colorways -->
              <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <span class="text-neutral-400 block text-[10px] uppercase font-bold mb-2">
                  All Available Colors ({{ backpack.colorways.length }})
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <div
                    v-for="color in backpack.colorways"
                    :key="color.name"
                    class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <span class="w-2.5 h-2.5 rounded-full border border-black/20" :style="{ backgroundColor: color.hex }" />
                    <span>{{ color.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-6">
              <button
                @click="$emit('close')"
                type="button"
                class="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
              >
                Back to Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import type { BackpackItem } from '../types/backpack'
import { PLACEHOLDER_IMAGE } from '../constants'

const props = defineProps<{
  backpack: BackpackItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeImageIndex = ref(0)
const dialogRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)

// Element that had focus before the dialog opened; focus returns to it on close.
let previouslyFocused: HTMLElement | null = null
let previousBodyOverflow = ''

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const getFocusable = (): HTMLElement[] => {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => !el.closest('[hidden]'))
}

const lockScroll = () => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = previousBodyOverflow
}

const onOpen = async () => {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lockScroll()
  document.addEventListener('keydown', onKeydown)
  await nextTick()
  // Focus the (non-interactive) heading rather than the close button: when the
  // dialog is opened with Enter, the key's activation would otherwise land on
  // the freshly focused button and close it again immediately.
  ;(titleRef.value ?? dialogRef.value)?.focus()
}

const onClose = () => {
  document.removeEventListener('keydown', onKeydown)
  unlockScroll()
  const target = previouslyFocused
  previouslyFocused = null
  if (target && target.isConnected) target.focus()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  // Trap Tab / Shift+Tab inside the dialog.
  const focusable = getFocusable()
  if (focusable.length === 0) {
    event.preventDefault()
    dialogRef.value?.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  const inside = dialogRef.value?.contains(active) ?? false

  if (event.shiftKey) {
    if (!inside || active === first || active === dialogRef.value) {
      event.preventDefault()
      last.focus()
    }
  } else if (!inside || active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.backpack, (next, prev) => {
  activeImageIndex.value = 0
  if (next && !prev) onOpen()
  else if (!next && prev) onClose()
}, { immediate: true })

onBeforeUnmount(() => {
  if (props.backpack) onClose()
})

// Normalised image list so a pack with missing or empty images[] is safe to render.
const modalImages = computed(() => props.backpack?.images ?? [])

const activeModalImage = computed(() => {
  if (!props.backpack) return ''
  if (modalImages.value.length === 0) return PLACEHOLDER_IMAGE
  return modalImages.value[activeImageIndex.value] || modalImages.value[0]
})
</script>
