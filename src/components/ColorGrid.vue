<template>
  <div class="flex flex-col items-center justify-center h-full w-full px-0.5 relative overflow-visible">
    <!-- 3x3 Grid Container (3 rows, 3 columns = 9 slots) -->
    <div class="grid grid-cols-3 grid-rows-3 gap-1.5 items-center justify-items-center w-full max-w-[88px] relative overflow-visible">
      <!-- Render active page swatches (up to 8 swatches when paginated, or up to 9 when single-page) -->
      <div
        v-for="(color, idx) in activeSwatches"
        :key="`${currentPage}-${idx}-${color.name}`"
        class="relative flex items-center justify-center"
        @mouseenter="hoveredColor = color.name"
        @mouseleave="hoveredColor = null"
      >
        <span
          class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-black/15 dark:border-white/20 shadow-xs transition-transform duration-150 hover:scale-125 cursor-pointer"
          :style="{ backgroundColor: color.hex }"
        />
        <!-- Tooltip on hover: ONLY renders for the hovered color -->
        <div
          v-if="hoveredColor === color.name"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 pointer-events-none whitespace-nowrap"
        >
          <div class="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold py-1 px-2 rounded-md shadow-xl whitespace-nowrap border border-white/10 dark:border-black/10">
            {{ color.name }}
          </div>
          <div class="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-100 rotate-45 -mt-0.75 shadow-sm"></div>
        </div>
      </div>

      <!-- If has pagination: Slot 9 is the interactive '>' More button -->
      <button
        v-if="hasMultiplePages"
        @click.stop="nextPage"
        title="View more colors"
        type="button"
        class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-[9px] sm:text-[10px] font-black transition-all duration-150 hover:scale-115 active:scale-90 shadow-xs focus:outline-none cursor-pointer leading-none"
      >
        <span>&gt;</span>
      </button>

      <!-- Empty wireframe placeholder circles for remaining slots to maintain exact 3x3 alignment -->
      <div
        v-for="emptyIdx in emptySlotCount"
        :key="`empty-${emptyIdx}`"
        class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 opacity-30 flex items-center justify-center"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BackpackColorway } from '../types/backpack'

const props = defineProps<{
  colorways: BackpackColorway[]
}>()

const hoveredColor = ref<string | null>(null)
const currentPage = ref(0)
const TOTAL_SLOTS = 9
const PAGE_SIZE_WITH_PAGINATION = 8

const totalColors = computed(() => props.colorways?.length || 0)
const hasMultiplePages = computed(() => totalColors.value > TOTAL_SLOTS)

const totalPages = computed(() => {
  if (!hasMultiplePages.value) return 1
  return Math.ceil(totalColors.value / PAGE_SIZE_WITH_PAGINATION)
})

// Current page swatches
const activeSwatches = computed(() => {
  if (!hasMultiplePages.value) {
    return props.colorways.slice(0, TOTAL_SLOTS)
  }
  const start = currentPage.value * PAGE_SIZE_WITH_PAGINATION
  return props.colorways.slice(start, start + PAGE_SIZE_WITH_PAGINATION)
})

// Empty placeholder slots needed to fill the 8 cells
const emptySlotCount = computed(() => {
  const renderedItems = activeSwatches.value.length + (hasMultiplePages.value ? 1 : 0)
  return Math.max(0, TOTAL_SLOTS - renderedItems)
})

const nextPage = () => {
  hoveredColor.value = null
  currentPage.value = (currentPage.value + 1) % totalPages.value
}
</script>
