<template>
  <div
    @click="$emit('select', backpack)"
    class="aspect-[5/7] min-w-[260px] max-w-[320px] w-full rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative group"
  >
    <!-- Top 65% of the card: Infinite Image Carousel & Label Overlay -->
    <CardCarousel
      :images="backpack.images"
      :brand="backpack.brand"
      :name="backpack.name"
    />

    <!-- Bottom 35% of the card: Triple Partition (Swatches, Price+Retailer, Score) -->
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
