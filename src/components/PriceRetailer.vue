<template>
  <div class="flex flex-col items-center justify-center text-center h-full w-full px-1 overflow-hidden">
    <!-- Lowest available price in $USD: larger font-size, bolded text -->
    <span class="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
      ${{ price }}
    </span>
    <!-- Retailer name below in smaller font-size, normal text -->
    <span class="text-[10px] sm:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-full mt-0.5" :title="retailer">
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
