<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      
      <!-- Brand Logo / Title -->
      <div class="flex items-center justify-between w-full md:w-auto">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center shadow-sm">
            <span class="text-white dark:text-neutral-900 font-black text-sm">EDC</span>
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white leading-none">
              Top 20 EDC Backpacks
            </h1>
            <p class="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
              Curated Everyday Carry Playing Card Catalog
            </p>
          </div>
        </div>

        <!-- Mobile Dark Mode Toggle -->
        <button
          @click="$emit('toggle-dark')"
          type="button"
          class="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Dark Mode"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>

      <!-- Controls: Search, Brand Filter, Sort, Theme Toggle -->
      <div class="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full md:w-auto">
        <!-- Live Search Input -->
        <div class="relative w-full sm:w-56">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search packs or brands..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
          />
          <svg class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Brand Filter Dropdown -->
        <select
          :value="selectedBrand"
          @change="$emit('update:selectedBrand', ($event.target as HTMLSelectElement).value)"
          class="py-1.5 px-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all cursor-pointer"
        >
          <option value="all">All Brands ({{ totalCount }})</option>
          <option v-for="brand in brandList.filter(b => b !== 'all')" :key="brand" :value="brand">
            {{ brand }}
          </option>
        </select>

        <!-- Sort Selector -->
        <select
          :value="sortBy"
          @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortOption)"
          class="py-1.5 px-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all cursor-pointer"
        >
          <option value="featured">Featured Order</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="capacity-desc">Capacity (Liters)</option>
          <option value="brand-asc">Brand A-Z</option>
        </select>

        <!-- Desktop Dark Mode Toggle -->
        <button
          @click="$emit('toggle-dark')"
          type="button"
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer text-sm"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { SortOption } from '../types/backpack'

defineProps<{
  searchQuery: string
  selectedBrand: string
  sortBy: SortOption
  brandList: string[]
  totalCount: number
  isDark: boolean
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:selectedBrand', val: string): void
  (e: 'update:sortBy', val: SortOption): void
  (e: 'toggle-dark'): void
}>()
</script>
