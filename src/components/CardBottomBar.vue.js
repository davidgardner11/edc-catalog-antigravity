/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import ColorGrid from './ColorGrid.vue';
import PriceRetailer from './PriceRetailer.vue';
import ReviewScore from './ReviewScore.vue';
const __VLS_props = defineProps();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-[35%] w-full grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-1.5 px-0.5 select-none" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-full flex items-center justify-center overflow-hidden" },
});
/** @type {[typeof ColorGrid, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ColorGrid, new ColorGrid({
    colorways: (__VLS_ctx.backpack.colorways),
}));
const __VLS_1 = __VLS_0({
    colorways: (__VLS_ctx.backpack.colorways),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-full flex items-center justify-center overflow-hidden" },
});
/** @type {[typeof PriceRetailer, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(PriceRetailer, new PriceRetailer({
    price: (__VLS_ctx.backpack.lowestPriceUSD),
    retailer: (__VLS_ctx.backpack.primaryRetailer),
}));
const __VLS_4 = __VLS_3({
    price: (__VLS_ctx.backpack.lowestPriceUSD),
    retailer: (__VLS_ctx.backpack.primaryRetailer),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-full flex items-center justify-center overflow-hidden" },
});
/** @type {[typeof ReviewScore, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(ReviewScore, new ReviewScore({
    review: (__VLS_ctx.backpack.review),
}));
const __VLS_7 = __VLS_6({
    review: (__VLS_ctx.backpack.review),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['h-[35%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
/** @type {__VLS_StyleScopedClasses['divide-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:divide-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-800']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ColorGrid: ColorGrid,
            PriceRetailer: PriceRetailer,
            ReviewScore: ReviewScore,
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
