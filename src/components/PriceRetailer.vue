<template>
  <div class="flex flex-col items-center justify-center text-center h-full w-full px-1 overflow-hidden">
    <!-- Lowest available price in $USD: text-base, font-extrabold -->
    <span class="text-base font-extrabold text-neutral-900 dark:text-white tracking-tight leading-none">
      ${{ price }}
    </span>
    <!-- Retailer name below in smaller font-size, normal text -->
    <span class="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-full mt-0.5 leading-tight" :title="retailer">
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
