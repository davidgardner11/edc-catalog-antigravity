<template>
  <div class="h-[65%] w-full relative overflow-hidden bg-neutral-900 group select-none">
    <!-- Active Carousel Image with Smooth Fade Transition -->
    <transition name="fade" mode="out-in">
      <img
        :key="currentImage"
        :src="currentImage"
        :alt="`${brand} ${name} - View ${currentIndex + 1}`"
        class="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </transition>

    <!-- Persistent Brand & Model Label Overlay (top-left) with dynamic contrast font color -->
    <CardLabelOverlay
      :brand="brand"
      :name="name"
      :current-image="currentImage"
    />

    <!-- Interactive Split-Click Navigation Zones (only active when images.length > 1) -->
    <template v-if="images.length > 1">
      <!-- Left 50% Click Zone: Previous Image (Infinite Loop) -->
      <div
        @click.stop="prevImage"
        title="Previous image"
        class="absolute inset-y-0 left-0 w-1/2 cursor-w-resize z-20 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <div class="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center shadow hover:bg-black/70 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      <!-- Right 50% Click Zone: Next Image (Infinite Loop) -->
      <div
        @click.stop="nextImage"
        title="Next image"
        class="absolute inset-y-0 right-0 w-1/2 cursor-e-resize z-20 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <div class="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center shadow hover:bg-black/70 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Carousel Pagination Dots (at bottom of image zone) -->
      <div class="absolute bottom-2 inset-x-0 flex justify-center items-center gap-1 z-20 pointer-events-none">
        <span
          v-for="(img, idx) in images"
          :key="img"
          class="h-1 rounded-full transition-all duration-300 shadow-sm"
          :class="idx === currentIndex ? 'w-3.5 bg-white' : 'w-1 bg-white/40'"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CardLabelOverlay from './CardLabelOverlay.vue'

const props = defineProps<{
  images: string[]
  brand: string
  name: string
}>()

const currentIndex = ref(0)

const currentImage = computed(() => {
  if (!props.images || props.images.length === 0) {
    return '/images/placeholder.webp'
  }
  return props.images[currentIndex.value] || props.images[0]
})

// Left click: previous image (loops from index 0 -> images.length - 1)
const prevImage = () => {
  if (props.images.length <= 1) return
  if (currentIndex.value === 0) {
    currentIndex.value = props.images.length - 1
  } else {
    currentIndex.value--
  }
}

// Right click: next image (loops from index images.length - 1 -> 0)
const nextImage = () => {
  if (props.images.length <= 1) return
  if (currentIndex.value === props.images.length - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }
}
</script>
