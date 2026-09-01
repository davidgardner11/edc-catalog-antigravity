/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { useImageContrast } from '../composables/useImageContrast';
const props = defineProps();
// Dynamic contrast calculation for maximum WCAG contrast (all-white or all-black)
const { fontColor } = useImageContrast(() => props.currentImage);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "absolute top-2.5 left-2.5 right-2.5 z-30 pointer-events-none transition-colors duration-200" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex flex-col items-start max-w-full" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-200 drop-shadow-sm" },
    ...{ style: ({ color: __VLS_ctx.fontColor }) },
});
(__VLS_ctx.brand);
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-xs sm:text-sm font-black leading-snug tracking-tight transition-colors duration-200 drop-shadow-sm truncate max-w-full" },
    ...{ style: ({ color: __VLS_ctx.fontColor }) },
    title: (__VLS_ctx.name),
});
(__VLS_ctx.name);
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['z-30']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-[11px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-snug']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-full']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            fontColor: fontColor,
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
