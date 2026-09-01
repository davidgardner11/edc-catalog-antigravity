import CardCarousel from './CardCarousel.vue';
import CardBottomBar from './CardBottomBar.vue';
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('select', __VLS_ctx.backpack);
        } },
    ...{ class: "aspect-[5/7] min-w-[260px] max-w-[320px] w-full rounded-xl overflow-hidden border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative group" },
});
/** @type {[typeof CardCarousel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(CardCarousel, new CardCarousel({
    images: (__VLS_ctx.backpack.images),
    brand: (__VLS_ctx.backpack.brand),
    name: (__VLS_ctx.backpack.name),
}));
const __VLS_1 = __VLS_0({
    images: (__VLS_ctx.backpack.images),
    brand: (__VLS_ctx.backpack.brand),
    name: (__VLS_ctx.backpack.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof CardBottomBar, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(CardBottomBar, new CardBottomBar({
    backpack: (__VLS_ctx.backpack),
}));
const __VLS_4 = __VLS_3({
    backpack: (__VLS_ctx.backpack),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
/** @type {__VLS_StyleScopedClasses['aspect-[5/7]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-[260px]']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[320px]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-neutral-200/90']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-neutral-800/90']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-card-hover']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CardCarousel: CardCarousel,
            CardBottomBar: CardBottomBar,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
