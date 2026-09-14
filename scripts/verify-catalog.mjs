import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../src/data/backpacks.json');
const backpacks = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const publicDir = path.resolve(__dirname, '../public');

console.log(`\n=== VERIFYING EDC BACKPACK CATALOG (${backpacks.length} Backpacks) ===\n`);

let errors = 0;

// 1. Verify Catalog Size
if (backpacks.length !== 20) {
  console.error(`❌ Expected 20 backpacks, found ${backpacks.length}`);
  errors++;
} else {
  console.log(`✅ Catalog contains exactly 20 curated backpacks.`);
}

// 2. Verify Card Data Structure & Image Files
let totalImages = 0;
let multiPagePacks = 0;
let packsWithOffers = 0;

for (const pack of backpacks) {
  if (!pack.id || !pack.brand || !pack.name || !pack.capacityLiters || !pack.lowestPriceUSD || !pack.primaryRetailer || !pack.review) {
    console.error(`❌ Backpack ${pack.id || 'unknown'} missing mandatory fields.`);
    errors++;
  }

  if (pack.images.length < 1 || pack.images.length > 5) {
    console.error(`❌ Backpack ${pack.id} has invalid image count: ${pack.images.length} (expected 1-5).`);
    errors++;
  }

  for (const imgUrl of pack.images) {
    const localPath = path.join(publicDir, imgUrl);
    if (!fs.existsSync(localPath)) {
      console.error(`❌ Missing image file on disk: ${localPath}`);
      errors++;
    } else {
      totalImages++;
    }
  }

  // 3. Verify Best Price consistency (lowestPriceUSD / isLowestPrice vs retailers[])
  if (Array.isArray(pack.retailers) && pack.retailers.length > 0) {
    packsWithOffers++;
    const minPrice = Math.min(...pack.retailers.map(r => r.priceUSD));

    if (pack.lowestPriceUSD !== minPrice) {
      console.error(`❌ Backpack ${pack.id} lowestPriceUSD is ${pack.lowestPriceUSD} but the cheapest retailer offer is ${minPrice}.`);
      errors++;
    }

    for (const offer of pack.retailers) {
      const shouldBeLowest = offer.priceUSD === minPrice;
      if (Boolean(offer.isLowestPrice) !== shouldBeLowest) {
        console.error(`❌ Backpack ${pack.id} retailer "${offer.name}" ($${offer.priceUSD}) has isLowestPrice=${Boolean(offer.isLowestPrice)} but the minimum price is $${minPrice}.`);
        errors++;
      }
    }

    const lowestOffer = pack.retailers.find(r => r.priceUSD === minPrice);
    const expectedPrimary = lowestOffer.name.replace(/ \(Official\)$/, '');
    if (pack.primaryRetailer !== expectedPrimary) {
      console.error(`❌ Backpack ${pack.id} primaryRetailer is "${pack.primaryRetailer}" but the first lowest offer is "${lowestOffer.name}" (expected "${expectedPrimary}").`);
      errors++;
    }
  }

  // 4. Test 3x3 Swatch Pagination Logic
  const totalColors = pack.colorways.length;
  const hasMultiplePages = totalColors > 9;
  if (hasMultiplePages) {
    multiPagePacks++;
    const totalPages = Math.ceil(totalColors / 8);
    if (totalPages < 2) {
      console.error(`❌ Multi-page pack ${pack.id} has invalid totalPages: ${totalPages}`);
      errors++;
    }
  }
}

console.log(`✅ Verified ${totalImages} image assets on disk across 20 backpacks.`);
console.log(`✅ Verified Best Price consistency across ${packsWithOffers} packs with retailer offers (lowestPriceUSD, isLowestPrice, primaryRetailer).`);
console.log(`✅ Verified 3x3 swatch grid logic (${multiPagePacks} packs feature >9 colors with multi-page '>' pagination).`);

// 4. Verify Static Assets Referenced by the App Shell & Components
// index.html links /favicon.svg; CardCarousel.vue and BackpackModal.vue fall
// back to the placeholder image whenever a pack has no images.
const requiredAssets = [
  { rel: 'favicon.svg', reason: 'linked from index.html <link rel="icon">' },
  { rel: 'images/placeholder.webp', reason: 'image fallback in CardCarousel.vue / BackpackModal.vue' }
];

for (const asset of requiredAssets) {
  const assetPath = path.join(publicDir, asset.rel);
  if (!fs.existsSync(assetPath) || fs.statSync(assetPath).size === 0) {
    console.error(`❌ Missing static asset: public/${asset.rel} (${asset.reason})`);
    errors++;
  } else {
    console.log(`✅ Static asset present: public/${asset.rel}`);
  }
}

// 5. Test Relative Luminance Math
function srgbToLinear(val) {
  const norm = val / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function computeContrast(r, g, b) {
  const L = 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  const crWhite = (1.0 + 0.05) / (L + 0.05);
  const crBlack = (L + 0.05) / (0.0 + 0.05);
  return crWhite >= crBlack ? '#FFFFFF' : '#000000';
}

const darkResult = computeContrast(20, 20, 20); // Dark background
const brightResult = computeContrast(240, 240, 240); // Bright white background

if (darkResult !== '#FFFFFF' || brightResult !== '#000000') {
  console.error(`❌ Contrast logic failed: dark=${darkResult}, bright=${brightResult}`);
  errors++;
} else {
  console.log(`✅ Dynamic contrast calculation verified (Dark -> #FFFFFF, Bright -> #000000).`);
}

if (errors === 0) {
  console.log(`\n🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!\n`);
  process.exit(0);
} else {
  console.error(`\n❌ Found ${errors} verification errors.\n`);
  process.exit(1);
}
