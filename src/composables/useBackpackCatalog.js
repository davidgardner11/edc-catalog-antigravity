import { ref, computed } from 'vue';
import rawData from '../data/backpacks.json';
export function useBackpackCatalog() {
    const allBackpacks = ref(rawData);
    const searchQuery = ref('');
    const selectedBrand = ref('all');
    const sortBy = ref('featured');
    const isDarkMode = ref(false);
    // Unique list of brands for dropdown filter
    const brandList = computed(() => {
        const brands = new Set(allBackpacks.value.map(b => b.brand));
        return ['all', ...Array.from(brands).sort()];
    });
    // Filtered and sorted backpacks
    const filteredBackpacks = computed(() => {
        let list = [...allBackpacks.value];
        // Brand filter
        if (selectedBrand.value !== 'all') {
            list = list.filter(b => b.brand.toLowerCase() === selectedBrand.value.toLowerCase());
        }
        // Search query
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter(b => b.name.toLowerCase().includes(q) ||
                b.brand.toLowerCase().includes(q) ||
                (b.material && b.material.toLowerCase().includes(q)) ||
                (b.description && b.description.toLowerCase().includes(q)));
        }
        // Sorting
        switch (sortBy.value) {
            case 'price-asc':
                list.sort((a, b) => a.lowestPriceUSD - b.lowestPriceUSD);
                break;
            case 'price-desc':
                list.sort((a, b) => b.lowestPriceUSD - a.lowestPriceUSD);
                break;
            case 'rating-desc':
                list.sort((a, b) => {
                    const normA = (a.review.score / a.review.maxScore);
                    const normB = (b.review.score / b.review.maxScore);
                    return normB - normA;
                });
                break;
            case 'capacity-desc':
                list.sort((a, b) => b.capacityLiters - a.capacityLiters);
                break;
            case 'brand-asc':
                list.sort((a, b) => a.brand.localeCompare(b.brand));
                break;
            case 'featured':
            default:
                // preserve curated order
                break;
        }
        return list;
    });
    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    };
    const resetFilters = () => {
        searchQuery.value = '';
        selectedBrand.value = 'all';
        sortBy.value = 'featured';
    };
    return {
        allBackpacks,
        filteredBackpacks,
        searchQuery,
        selectedBrand,
        sortBy,
        brandList,
        isDarkMode,
        toggleDarkMode,
        resetFilters
    };
}
