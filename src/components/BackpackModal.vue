<template>
  <transition name="fade">
    <div
      v-if="backpack"
      @click.self="$emit('close')"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8"
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          type="button"
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div class="grid grid-cols-1 md:grid-cols-2">
          <!-- Image Gallery Preview -->
          <div class="bg-neutral-950 flex flex-col items-center justify-center p-4">
            <img
              :src="activeModalImage"
              :alt="backpack.name"
              class="w-full h-64 object-contain rounded-lg"
            />
            <!-- Thumbnail selection -->
            <div class="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              <button
                v-for="(img, idx) in backpack.images"
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
              <h2 class="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
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
                class="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs shadow-md transition-colors"
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
import { ref, computed, watch } from 'vue'
import type { BackpackItem } from '../types/backpack'

const props = defineProps<{
  backpack: BackpackItem | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const activeImageIndex = ref(0)

watch(() => props.backpack, () => {
  activeImageIndex.value = 0
})

const activeModalImage = computed(() => {
  if (!props.backpack) return ''
  return props.backpack.images[activeImageIndex.value] || props.backpack.images[0]
})
</script>
