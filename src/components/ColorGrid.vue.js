/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
const props = defineProps();
const currentPage = ref(0);
const TOTAL_SLOTS = 8;
const PAGE_SIZE_WITH_PAGINATION = 7;
const totalColors = computed(() => props.colorways?.length || 0);
const hasMultiplePages = computed(() => totalColors.value > TOTAL_SLOTS);
const totalPages = computed(() => {
    if (!hasMultiplePages.value)
        return 1;
    return Math.ceil(totalColors.value / PAGE_SIZE_WITH_PAGINATION);
});
// Current page swatches
const activeSwatches = computed(() => {
    if (!hasMultiplePages.value) {
        return props.colorways.slice(0, TOTAL_SLOTS);
    }
    const start = currentPage.value * PAGE_SIZE_WITH_PAGINATION;
    return props.colorways.slice(start, start + PAGE_SIZE_WITH_PAGINATION);
});
// Empty placeholder slots needed to fill the 8 cells
const emptySlotCount = computed(() => {
    const renderedItems = activeSwatches.value.length + (hasMultiplePages.value ? 1 : 0);
    return Math.max(0, TOTAL_SLOTS - renderedItems);
});
const nextPage = () => {
    currentPage.value = (currentPage.value + 1) % totalPages.value;
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex flex-col items-center justify-center h-full w-full px-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid grid-cols-4 grid-rows-2 gap-1.5 items-center justify-items-center w-full max-w-[100px]" },
});
for (const [color, idx] of __VLS_getVForSourceType((__VLS_ctx.activeSwatches))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`${__VLS_ctx.currentPage}-${idx}-${color.name}`),
        ...{ class: "group relative flex items-center justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shadow-sm transition-transform duration-150 hover:scale-125 cursor-pointer" },
        ...{ style: ({ backgroundColor: color.hex }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-40 pointer-events-none" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-semibold py-0.5 px-1.5 rounded shadow-lg whitespace-nowrap" },
    });
    (color.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-1 h-1 bg-neutral-900 dark:bg-neutral-100 rotate-45 -mt-0.5" },
    });
}
if (__VLS_ctx.hasMultiplePages) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.nextPage) },
        title: "View more colors",
        type: "button",
        ...{ class: "w-3.5 h-3.5 rounded-full flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 text-[9px] font-black transition-all duration-150 hover:scale-115 active:scale-90 shadow-sm focus:outline-none cursor-pointer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
for (const [emptyIdx] of __VLS_getVForSourceType((__VLS_ctx.emptySlotCount))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        key: (`empty-${emptyIdx}`),
        ...{ class: "w-3.5 h-3.5 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 opacity-30 flex items-center justify-center" },
    });
}
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-rows-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[100px]']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-black/15']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-white/20']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-150']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-125']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-full']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rotate-45']} */ ;
/** @type {__VLS_StyleScopedClasses['-mt-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-neutral-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-150']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:scale-115']} */ ;
/** @type {__VLS_StyleScopedClasses['active:scale-90']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-700']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-30']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            currentPage: currentPage,
            hasMultiplePages: hasMultiplePages,
            activeSwatches: activeSwatches,
            emptySlotCount: emptySlotCount,
            nextPage: nextPage,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
