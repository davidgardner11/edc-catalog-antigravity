<template>
  <div class="absolute top-2.5 left-2.5 right-2.5 z-30 pointer-events-none transition-colors duration-200">
    <div class="flex flex-col items-start max-w-full">
      <!-- Brand Name: Uppercase, tracking wider -->
      <span
        class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-200 drop-shadow-sm"
        :style="{ color: fontColor }"
      >
        {{ brand }}
      </span>
      <!-- Backpack Name: Bold text -->
      <h3
        class="text-xs sm:text-sm font-black leading-snug tracking-tight transition-colors duration-200 drop-shadow-sm truncate max-w-full"
        :style="{ color: fontColor }"
        :title="name"
      >
        {{ name }}
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageContrast } from '../composables/useImageContrast'

const props = defineProps<{
  brand: string
  name: string
  currentImage: string
}>()

// Dynamic contrast calculation for maximum WCAG contrast (all-white or all-black)
const { fontColor } = useImageContrast(() => props.currentImage)
</script>
