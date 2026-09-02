<template>
  <div
    @click="$emit('select', backpack)"
    class="aspect-[5/7] min-w-[260px] max-w-[320px] w-full rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative group"
  >
    <!-- Top 65% of the card: Infinite Image Carousel (Unobstructed) -->
    <CardCarousel
      :images="backpack.images"
      :brand="backpack.brand"
      :name="backpack.name"
    />

    <!-- Middle 15% of the card: Manufacturer & Backpack Name -->
    <div class="h-[15%] w-full flex flex-col justify-center px-3.5 border-t border-b border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50/80 dark:bg-neutral-800/40 select-none overflow-hidden">
      <span class="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 truncate leading-none">
        {{ backpack.brand }}
      </span>
      <h3 class="text-xs sm:text-sm font-black text-neutral-900 dark:text-white truncate leading-tight mt-1" :title="backpack.name">
        {{ backpack.name }}
      </h3>
    </div>

    <!-- Bottom 20% of the card: Triple Partition (Swatches, Price+Retailer, Score) -->
    <CardBottomBar
      :backpack="backpack"
    />
  </div>
</template>

<script setup lang="ts">
import type { BackpackItem } from '../types/backpack'
import CardCarousel from './CardCarousel.vue'
import CardBottomBar from './CardBottomBar.vue'

defineProps<{
  backpack: BackpackItem
}>()

defineEmits<{
  (e: 'select', item: BackpackItem): void
}>()
</script>
