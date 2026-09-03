<template>
  <div class="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
    <!-- Sticky Navigation & Filter Header -->
    <CatalogNavbar
      v-model:search-query="searchQuery"
      v-model:selected-brand="selectedBrand"
      v-model:sort-by="sortBy"
      :brand-list="brandList"
      :total-count="allBackpacks.length"
      :is-dark="isDarkMode"
      @toggle-dark="toggleDarkMode"
    />

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Catalog Intro Banner -->
      <div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Everyday Carry Card Deck
          </h2>
          <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Displaying {{ filteredBackpacks.length }} of {{ allBackpacks.length }} acclaimed backpacks in standard 5:7 poker card proportions.
          </p>
        </div>

        <!-- Reset filter action button if active -->
        <button
          v-if="searchQuery || selectedBrand !== 'all' || sortBy !== 'featured'"
          @click="resetFilters"
          type="button"
          class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Reset all filters</span>
          <span>✕</span>
        </button>
      </div>

      <!-- Backpack Cards Grid: 3 columns across on desktop, keeping identical interstitial gap -->
      <div
        v-if="filteredBackpacks.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center"
      >
        <BackpackCard
          v-for="pack in filteredBackpacks"
          :key="pack.id"
          :backpack="pack"
          @select="selectedPack = $event"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm"
      >
        <div class="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mb-4">
          🎒
        </div>
        <h3 class="text-lg font-bold text-neutral-900 dark:text-white">No backpacks match your filter</h3>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
          Try searching for a different brand name, model, or resetting the active filters.
        </p>
        <button
          @click="resetFilters"
          type="button"
          class="mt-4 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </main>

    <!-- Quick-View Detail Modal -->
    <BackpackModal
      :backpack="selectedPack"
      @close="selectedPack = null"
    />

    <!-- Footer -->
    <footer class="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Everyday Carry (EDC) Backpack Catalog.</span>
        <span>Built with Vue 3, TypeScript, and Tailwind CSS.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BackpackItem } from './types/backpack'
import { useBackpackCatalog } from './composables/useBackpackCatalog'
import CatalogNavbar from './components/CatalogNavbar.vue'
import BackpackCard from './components/BackpackCard.vue'
import BackpackModal from './components/BackpackModal.vue'

const {
  allBackpacks,
  filteredBackpacks,
  searchQuery,
  selectedBrand,
  sortBy,
  brandList,
  isDarkMode,
  toggleDarkMode,
  resetFilters
} = useBackpackCatalog()

const selectedPack = ref<BackpackItem | null>(null)
</script>
