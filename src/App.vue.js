/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref } from 'vue';
import { useBackpackCatalog } from './composables/useBackpackCatalog';
import CatalogNavbar from './components/CatalogNavbar.vue';
import BackpackCard from './components/BackpackCard.vue';
import BackpackModal from './components/BackpackModal.vue';
const { allBackpacks, filteredBackpacks, searchQuery, selectedBrand, sortBy, brandList, isDarkMode, toggleDarkMode, resetFilters } = useBackpackCatalog();
const selectedPack = ref(null);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200" },
});
/** @type {[typeof CatalogNavbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CatalogNavbar, new CatalogNavbar({
    ...{ 'onToggleDark': {} },
    searchQuery: (__VLS_ctx.searchQuery),
    selectedBrand: (__VLS_ctx.selectedBrand),
    sortBy: (__VLS_ctx.sortBy),
    brandList: (__VLS_ctx.brandList),
    totalCount: (__VLS_ctx.allBackpacks.length),
    isDark: (__VLS_ctx.isDarkMode),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onToggleDark': {} },
    searchQuery: (__VLS_ctx.searchQuery),
    selectedBrand: (__VLS_ctx.selectedBrand),
    sortBy: (__VLS_ctx.sortBy),
    brandList: (__VLS_ctx.brandList),
    totalCount: (__VLS_ctx.allBackpacks.length),
    isDark: (__VLS_ctx.isDarkMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onToggleDark: (__VLS_ctx.toggleDarkMode)
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1" },
});
(__VLS_ctx.filteredBackpacks.length);
(__VLS_ctx.allBackpacks.length);
if (__VLS_ctx.searchQuery || __VLS_ctx.selectedBrand !== 'all' || __VLS_ctx.sortBy !== 'featured') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.resetFilters) },
        type: "button",
        ...{ class: "text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
if (__VLS_ctx.filteredBackpacks.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center" },
    });
    for (const [pack] of __VLS_getVForSourceType((__VLS_ctx.filteredBackpacks))) {
        /** @type {[typeof BackpackCard, ]} */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(BackpackCard, new BackpackCard({
            ...{ 'onSelect': {} },
            key: (pack.id),
            backpack: (pack),
        }));
        const __VLS_8 = __VLS_7({
            ...{ 'onSelect': {} },
            key: (pack.id),
            backpack: (pack),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_10;
        let __VLS_11;
        let __VLS_12;
        const __VLS_13 = {
            onSelect: (...[$event]) => {
                if (!(__VLS_ctx.filteredBackpacks.length > 0))
                    return;
                __VLS_ctx.selectedPack = $event;
            }
        };
        var __VLS_9;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "text-lg font-bold text-neutral-900 dark:text-white" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.resetFilters) },
        type: "button",
        ...{ class: "mt-4 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs transition-colors" },
    });
}
/** @type {[typeof BackpackModal, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(BackpackModal, new BackpackModal({
    ...{ 'onClose': {} },
    backpack: (__VLS_ctx.selectedPack),
}));
const __VLS_15 = __VLS_14({
    ...{ 'onClose': {} },
    backpack: (__VLS_ctx.selectedPack),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_17;
let __VLS_18;
let __VLS_19;
const __VLS_20 = {
    onClose: (...[$event]) => {
        __VLS_ctx.selectedPack = null;
    }
};
var __VLS_16;
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-400 dark:text-neutral-600" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-950']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-400']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-600']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CatalogNavbar: CatalogNavbar,
            BackpackCard: BackpackCard,
            BackpackModal: BackpackModal,
            allBackpacks: allBackpacks,
            filteredBackpacks: filteredBackpacks,
            searchQuery: searchQuery,
            selectedBrand: selectedBrand,
            sortBy: sortBy,
            brandList: brandList,
            isDarkMode: isDarkMode,
            toggleDarkMode: toggleDarkMode,
            resetFilters: resetFilters,
            selectedPack: selectedPack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
