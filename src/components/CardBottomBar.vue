<template>
  <div class="h-[35%] w-full grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-1.5 px-0.5 select-none">
    <!-- Bottom Left <div>: 2x4 Color Swatches Grid -->
    <div class="h-full flex items-center justify-center overflow-hidden">
      <ColorGrid :colorways="backpack.colorways" />
    </div>

    <!-- Bottom Middle <div>: Lowest Price ($USD) & Retailer -->
    <div class="h-full flex items-center justify-center overflow-hidden">
      <PriceRetailer :price="backpack.lowestPriceUSD" :retailer="backpack.primaryRetailer" />
    </div>

    <!-- Bottom Right <div>: Review Score with Denominator Scale -->
    <div class="h-full flex items-center justify-center overflow-hidden">
      <ReviewScore :review="backpack.review" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BackpackItem } from '../types/backpack'
import ColorGrid from './ColorGrid.vue'
import PriceRetailer from './PriceRetailer.vue'
import ReviewScore from './ReviewScore.vue'

defineProps<{
  backpack: BackpackItem
}>()
</script>
