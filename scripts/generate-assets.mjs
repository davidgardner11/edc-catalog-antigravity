import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backpacksPath = path.resolve(__dirname, '../src/data/backpacks.json');
let backpacks = JSON.parse(fs.readFileSync(backpacksPath, 'utf-8'));

const publicDir = path.resolve(__dirname, '../public/images/backpacks');

// 5 angles with distinct studio lighting and background tones
const angles = [
  { id: 1, label: "Front Hero", subtitle: "Exterior Profile", bg: ["#18181b", "#09090b"], isDark: true },
  { id: 2, label: "Studio Light", subtitle: "Clean Lighting", bg: ["#f8fafc", "#e2e8f0"], isDark: false },
  { id: 3, label: "Side Harness", subtitle: "Ergonomic Straps", bg: ["#1e293b", "#0f172a"], isDark: true },
  { id: 4, label: "Interior Tech", subtitle: "Laptop & Admin", bg: ["#ffffff", "#f1f5f9"], isDark: false },
  { id: 5, label: "Stealth Detail", subtitle: "Weatherproof 1000D", bg: ["#27272a", "#18181b"], isDark: true },
];

for (const pack of backpacks) {
  const packDir = path.join(publicDir, pack.id);
  fs.mkdirSync(packDir, { recursive: true });

  // Update pack image URLs to .svg
  pack.images = [1, 2, 3, 4, 5].map(i => `/images/backpacks/${pack.id}/${i}.svg`);

  for (let i = 1; i <= 5; i++) {
    const angle = angles[i - 1];
    const mainColor = pack.colorways[0]?.hex || '#334155';
    const accentColor = pack.colorways[1]?.hex || '#64748b';
    const textColor = angle.isDark ? '#ffffff' : '#0f172a';
    const subtextColor = angle.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)';
    const badgeBg = angle.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
    const badgeBorder = angle.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
    const gridStroke = angle.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

    // Custom distinct features by brand
    let specialFeatures = '';
    if (pack.brand === 'GORUCK') {
      specialFeatures = `
        <!-- MOLLE Webbing -->
        <line x1="-70" y1="20" x2="70" y2="20" stroke="#000" stroke-width="4" opacity="0.6"/>
        <line x1="-70" y1="40" x2="70" y2="40" stroke="#000" stroke-width="4" opacity="0.6"/>
        <line x1="-70" y1="60" x2="70" y2="60" stroke="#000" stroke-width="4" opacity="0.6"/>
        <!-- Velcro Morale Patch -->
        <rect x="-40" y="-120" width="80" height="45" rx="4" fill="#2d3748" stroke="#4a5568" stroke-width="2"/>
        <text x="0" y="-92" font-family="sans-serif" font-size="11" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="2">GORUCK</text>
      `;
    } else if (pack.brand === 'Mystery Ranch') {
      specialFeatures = `
        <!-- 3-ZIP Iconic Y-Zipper -->
        <path d="M 0 100 L 0 -40 L -70 -140 M 0 -40 L 70 -140" fill="none" stroke="#ea580c" stroke-width="5" stroke-linecap="round"/>
        <circle cx="0" cy="-40" r="8" fill="#ea580c"/>
      `;
    } else if (pack.brand === 'Peak Design') {
      specialFeatures = `
        <!-- MagLatch Hardware & Clean Origami Lines -->
        <rect x="-25" y="-120" width="50" height="28" rx="6" fill="#cbd5e1" stroke="#000" stroke-width="2"/>
        <path d="M -100 -50 L 0 20 L 100 -50" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.7"/>
        <path d="M -100 60 L 0 120 L 100 60" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.7"/>
      `;
    } else if (pack.brand === 'Wandrd') {
      specialFeatures = `
        <!-- Rolltop Buckle & Magnetic Tote Handles -->
        <rect x="-110" y="-170" width="220" height="35" rx="8" fill="#000" opacity="0.7"/>
        <rect x="-30" y="-180" width="60" height="18" rx="4" fill="#ea580c"/>
        <line x1="-90" y1="-50" x2="90" y2="-50" stroke="#ea580c" stroke-width="4"/>
      `;
    } else if (pack.brand === 'Chrome Industries') {
      specialFeatures = `
        <!-- Welded Cargo Net -->
        <path d="M -80 -90 L 80 70 M -80 70 L 80 -90 M 0 -90 L 0 70 M -80 -10 L 80 -10" stroke="#dc2626" stroke-width="4" opacity="0.8"/>
      `;
    } else if (pack.brand === 'The North Face') {
      specialFeatures = `
        <!-- Front Bungee Cord System -->
        <path d="M -70 -60 L 70 0 L -70 60 L 70 120" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
      `;
    } else {
      specialFeatures = `
        <!-- Clean Minimalist Stitching & Accent Pocket -->
        <rect x="-90" y="-70" width="180" height="85" rx="14" fill="${angle.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}" stroke="${accentColor}" stroke-width="2"/>
        <line x1="-70" y1="-25" x2="70" y2="-25" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
      `;
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <linearGradient id="bg-${pack.id}-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${angle.bg[0]}"/>
      <stop offset="100%" stop-color="${angle.bg[1]}"/>
    </linearGradient>
    <linearGradient id="packGrad-${pack.id}-${i}" x1="0%" y1="0%" x2="40%" y2="100%">
      <stop offset="0%" stop-color="${mainColor}"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <filter id="shadow-${pack.id}-${i}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="28" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <pattern id="grid-${pack.id}-${i}" width="24" height="24" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="24" y2="0" stroke="${gridStroke}" stroke-width="1"/>
      <line x1="0" y1="0" x2="0" y2="24" stroke="${gridStroke}" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Canvas -->
  <rect width="600" height="700" fill="url(#bg-${pack.id}-${i})"/>
  <rect width="600" height="700" fill="url(#grid-${pack.id}-${i})"/>

  <!-- Ambient Glow -->
  <circle cx="300" cy="370" r="230" fill="${mainColor}" opacity="${angle.isDark ? '0.2' : '0.1'}" filter="blur(60px)"/>

  <!-- Top-Right Spec Badge -->
  <g transform="translate(560, 45)" text-anchor="end">
    <rect x="-95" y="-15" width="105" height="30" rx="15" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1"/>
    <text x="-12" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="${textColor}">${pack.capacityLiters}L EDC</text>
  </g>

  <!-- Backpack Illustration Container -->
  <g filter="url(#shadow-${pack.id}-${i})" transform="translate(300, 365)">
    <!-- Top Carry Handle -->
    <path d="M -55 -165 Q 0 -210 55 -165" fill="none" stroke="${accentColor}" stroke-width="16" stroke-linecap="round"/>
    
    <!-- Main Backpack Body -->
    <rect x="-135" y="-165" width="270" height="335" rx="46" fill="url(#packGrad-${pack.id}-${i})" stroke="${accentColor}" stroke-width="3.5" opacity="0.98"/>
    
    <!-- Upper Profile Contour -->
    <path d="M -120 -80 C -60 -100, 60 -100, 120 -80" fill="none" stroke="${angle.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}" stroke-width="3"/>
    
    <!-- Special Brand Specific Features -->
    ${specialFeatures}

    <!-- Brand Emblem / Lower Patch -->
    <rect x="-45" y="90" width="90" height="28" rx="6" fill="${angle.isDark ? '#09090b' : '#ffffff'}" stroke="${accentColor}" stroke-width="2"/>
    <text x="0" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="${angle.isDark ? '#ffffff' : '#09090b'}" text-anchor="middle" letter-spacing="1.5">${pack.brand.toUpperCase()}</text>

    <!-- Angle & Image Indicator Pill -->
    <g transform="translate(0, 195)">
      <rect x="-105" y="-14" width="210" height="28" rx="14" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.5"/>
      <text x="0" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="${textColor}" text-anchor="middle" letter-spacing="1">
        IMAGE ${i} OF 5 • ${angle.label.toUpperCase()}
      </text>
    </g>
  </g>
</svg>`;

    const svgPath = path.join(packDir, `${i}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf-8');
  }
}

// Write updated backpacks.json with .svg URLs
fs.writeFileSync(backpacksPath, JSON.stringify(backpacks, null, 2), 'utf-8');

console.log('Successfully generated all 100 SVG assets and updated backpacks.json!');
