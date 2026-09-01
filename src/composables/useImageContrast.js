import { ref, watch, onMounted } from 'vue';
// Cache to prevent redundant canvas calculations
const contrastCache = new Map();
/**
 * Converts an sRGB color component (0-255) to linear scale
 */
function srgbToLinear(val) {
    const norm = val / 255;
    return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}
/**
 * Analyzes the top-left region of an image to compute maximum WCAG contrast text color (pure white or pure black)
 */
export function useImageContrast(imageSrcGetter) {
    const fontColor = ref('#FFFFFF');
    const isLoading = ref(false);
    const computeContrast = (src) => {
        if (!src)
            return;
        if (contrastCache.has(src)) {
            fontColor.value = contrastCache.get(src);
            return;
        }
        // Default to white while computing
        fontColor.value = '#FFFFFF';
        isLoading.value = true;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) {
                    fallback(src);
                    return;
                }
                // We sample the top-left area where the brand & model label sits
                // approx width 50%, height 30% of the image
                const sampleW = Math.max(1, Math.floor((img.naturalWidth || 600) * 0.5));
                const sampleH = Math.max(1, Math.floor((img.naturalHeight || 700) * 0.3));
                canvas.width = sampleW;
                canvas.height = sampleH;
                ctx.drawImage(img, 0, 0, sampleW, sampleH, 0, 0, sampleW, sampleH);
                const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
                let totalR = 0;
                let totalG = 0;
                let totalB = 0;
                let count = 0;
                // Step by 4 pixels to sample efficiently
                for (let i = 0; i < imgData.length; i += 16) {
                    const alpha = imgData[i + 3];
                    if (alpha > 50) {
                        totalR += imgData[i];
                        totalG += imgData[i + 1];
                        totalB += imgData[i + 2];
                        count++;
                    }
                }
                if (count === 0) {
                    fallback(src);
                    return;
                }
                const avgR = totalR / count;
                const avgG = totalG / count;
                const avgB = totalB / count;
                // ITU-R BT.709 Relative Luminance
                const L = 0.2126 * srgbToLinear(avgR) + 0.7152 * srgbToLinear(avgG) + 0.0722 * srgbToLinear(avgB);
                // WCAG Contrast Ratios
                const crWhite = (1.0 + 0.05) / (L + 0.05);
                const crBlack = (L + 0.05) / (0.0 + 0.05);
                const chosen = crWhite >= crBlack ? '#FFFFFF' : '#000000';
                contrastCache.set(src, chosen);
                fontColor.value = chosen;
            }
            catch {
                fallback(src);
            }
            finally {
                isLoading.value = false;
            }
        };
        img.onerror = () => {
            fallback(src);
            isLoading.value = false;
        };
        img.src = src;
    };
    const fallback = (src) => {
        // If the image is a Studio White angle (image #2 or #4), default to black, otherwise white
        let defaultColor = '#FFFFFF';
        if (src.includes('/2.') || src.includes('/4.')) {
            defaultColor = '#000000';
        }
        contrastCache.set(src, defaultColor);
        fontColor.value = defaultColor;
    };
    watch(imageSrcGetter, (newSrc) => {
        computeContrast(newSrc);
    }, { immediate: true });
    onMounted(() => {
        computeContrast(imageSrcGetter());
    });
    return {
        fontColor,
        isLoading
    };
}
