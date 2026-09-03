<template>
  <div class="flex flex-col items-center justify-center text-center h-full w-full px-1 overflow-hidden">
    <!-- Lowest available price in $USD: text-xl sm:text-2xl, font-black -->
    <span class="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
      ${{ price }}
    </span>
    <!-- Retailer name below: text-xs sm:text-[13px], font-medium -->
    <span class="text-xs sm:text-[13px] font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-full mt-1 leading-tight" :title="retailer">
      {{ retailer }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  price: number
  retailer: string
}>()
</script>
