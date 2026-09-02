<template>
  <div class="flex flex-col items-center justify-center text-center h-full w-full px-1 overflow-hidden">
    <!-- Score formatted as score/maxScore -->
    <div class="flex items-center gap-1">
      <svg class="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      <span class="text-xs font-black text-neutral-900 dark:text-white tracking-tight leading-none">
        {{ formattedScore }}/{{ formattedMax }}
      </span>
    </div>
    <!-- Optional source/review count subtext -->
    <span v-if="review.sourceName" class="text-[9px] font-medium text-neutral-400 dark:text-neutral-500 truncate max-w-full mt-0.5 leading-tight" :title="review.sourceName">
      {{ review.sourceName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewScore } from '../types/backpack'

const props = defineProps<{
  review: ReviewScore
}>()

const formattedScore = computed(() => {
  return Number.isInteger(props.review.score) ? `${props.review.score}.0` : props.review.score.toString()
})

const formattedMax = computed(() => {
  return Number.isInteger(props.review.maxScore) ? `${props.review.maxScore}.0` : props.review.maxScore.toString()
})
</script>
