/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import CardLabelOverlay from './CardLabelOverlay.vue';
const props = defineProps();
const currentIndex = ref(0);
const currentImage = computed(() => {
    if (!props.images || props.images.length === 0) {
        return '/images/placeholder.webp';
    }
    return props.images[currentIndex.value] || props.images[0];
});
// Left click: previous image (loops from index 0 -> images.length - 1)
const prevImage = () => {
    if (props.images.length <= 1)
        return;
    if (currentIndex.value === 0) {
        currentIndex.value = props.images.length - 1;
    }
    else {
        currentIndex.value--;
    }
};
// Right click: next image (loops from index images.length - 1 -> 0)
const nextImage = () => {
    if (props.images.length <= 1)
        return;
    if (currentIndex.value === props.images.length - 1) {
        currentIndex.value = 0;
    }
    else {
        currentIndex.value++;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-[65%] w-full relative overflow-hidden bg-neutral-900 group select-none" },
});
const __VLS_0 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "fade",
    mode: "out-in",
}));
const __VLS_2 = __VLS_1({
    name: "fade",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    key: (__VLS_ctx.currentImage),
    src: (__VLS_ctx.currentImage),
    alt: (`${__VLS_ctx.brand} ${__VLS_ctx.name} - View ${__VLS_ctx.currentIndex + 1}`),
    ...{ class: "w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-105" },
    loading: "lazy",
});
var __VLS_3;
/** @type {[typeof CardLabelOverlay, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(CardLabelOverlay, new CardLabelOverlay({
    brand: (__VLS_ctx.brand),
    name: (__VLS_ctx.name),
    currentImage: (__VLS_ctx.currentImage),
}));
const __VLS_5 = __VLS_4({
    brand: (__VLS_ctx.brand),
    name: (__VLS_ctx.name),
    currentImage: (__VLS_ctx.currentImage),
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
if (__VLS_ctx.images.length > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.prevImage) },
        title: "Previous image",
        ...{ class: "absolute inset-y-0 left-0 w-1/2 cursor-w-resize z-20 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center shadow hover:bg-black/70 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "w-3.5 h-3.5" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2.5",
        d: "M15 19l-7-7 7-7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.nextImage) },
        title: "Next image",
        ...{ class: "absolute inset-y-0 right-0 w-1/2 cursor-e-resize z-20 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center shadow hover:bg-black/70 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "w-3.5 h-3.5" },
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2.5",
        d: "M9 5l7 7-7 7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "absolute bottom-2 inset-x-0 flex justify-center items-center gap-1 z-20 pointer-events-none" },
    });
    for (const [img, idx] of __VLS_getVForSourceType((__VLS_ctx.images))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
            key: (img),
            ...{ class: "h-1 rounded-full transition-all duration-300 shadow-sm" },
            ...{ class: (idx === __VLS_ctx.currentIndex ? 'w-3.5 bg-white' : 'w-1 bg-white/40') },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['h-[65%]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-neutral-900']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['object-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-500']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:scale-105']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-w-resize']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-start']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-black/70']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-y-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-e-resize']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-black/70']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CardLabelOverlay: CardLabelOverlay,
            currentIndex: currentIndex,
            currentImage: currentImage,
            prevImage: prevImage,
            nextImage: nextImage,
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
