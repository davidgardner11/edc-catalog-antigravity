import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backpacksPath = path.resolve(__dirname, '../src/data/backpacks.json');
const backpacks = JSON.parse(fs.readFileSync(backpacksPath, 'utf-8'));

const publicDir = path.resolve(__dirname, '../public/images/backpacks');

// Visual styling themes for 5 slides per pack
const angles = [
  { label: "Front View", subtitle: "Exterior Profile", bg: ["#1e293b", "#0f172a"], dark: true },
  { label: "Studio White", subtitle: "Hero Shot", bg: ["#f8fafc", "#e2e8f0"], dark: false },
  { label: "Side Profile", subtitle: "Ergonomic Harness", bg: ["#2d3748", "#1a202c"], dark: true },
  { label: "Internal Layout", subtitle: "Organization & Laptop", bg: ["#f1f5f9", "#cbd5e1"], dark: false },
  { label: "Detail Close-Up", subtitle: "Weatherproof Hardware", bg: ["#18181b", "#09090b"], dark: true },
];

for (const pack of backpacks) {
  const packDir = path.join(publicDir, pack.id);
  fs.mkdirSync(packDir, { recursive: true });

  for (let i = 1; i <= 5; i++) {
    const angle = angles[i - 1];
    const mainColor = pack.colorways[0]?.hex || '#334155';
    const accentColor = pack.colorways[1]?.hex || '#64748b';
    const textColor = angle.dark ? '#ffffff' : '#0f172a';
    const subtextColor = angle.dark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.65)';
    const badgeBg = angle.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
    const gridStroke = angle.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

    // Generate crisp SVG graphic representation
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
      <defs>
        <linearGradient id="bg-${pack.id}-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${angle.bg[0]}"/>
          <stop offset="100%" stop-color="${angle.bg[1]}"/>
        </linearGradient>
        <linearGradient id="packGrad-${pack.id}-${i}" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="${mainColor}"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-opacity="0.35"/>
        </filter>
        <pattern id="grid-${pack.id}-${i}" width="30" height="30" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="30" y2="0" stroke="${gridStroke}" stroke-width="1"/>
          <line x1="0" y1="0" x2="0" y2="30" stroke="${gridStroke}" stroke-width="1"/>
        </pattern>
      </defs>

      <!-- Background Canvas -->
      <rect width="600" height="700" fill="url(#bg-${pack.id}-${i})"/>
      <rect width="600" height="700" fill="url(#grid-${pack.id}-${i})"/>

      <!-- Ambient Glow -->
      <circle cx="300" cy="380" r="220" fill="${mainColor}" opacity="0.15" filter="blur(50px)"/>

      <!-- Backpack Silhouette Illustration -->
      <g filter="url(#shadow)" transform="translate(300, 360)">
        <!-- Main Body -->
        <rect x="-130" y="-170" width="260" height="320" rx="42" fill="url(#packGrad-${pack.id}-${i})" stroke="${accentColor}" stroke-width="3" opacity="0.95"/>
        
        <!-- Top Carry Handle -->
        <path d="M -50 -170 Q 0 -210 50 -170" fill="none" stroke="${accentColor}" stroke-width="14" stroke-linecap="round"/>
        
        <!-- Front Compression / Zip Panels -->
        <path d="M -110 -100 L 110 -100" stroke="${angle.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}" stroke-width="4" stroke-dasharray="6,4"/>
        <rect x="-100" y="-70" width="200" height="90" rx="16" fill="${angle.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}" stroke="${angle.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}" stroke-width="2"/>
        
        <!-- Lower Quick-Access Pocket -->
        <rect x="-100" y="40" width="200" height="85" rx="14" fill="${angle.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}" stroke="${angle.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}" stroke-width="2"/>
        
        <!-- Zipper Pulls & Molle Straps -->
        <rect x="-80" y="-50" width="160" height="6" rx="3" fill="${accentColor}" opacity="0.8"/>
        <rect x="-80" y="-30" width="160" height="6" rx="3" fill="${accentColor}" opacity="0.8"/>
        
        <!-- Brand Patch / Logo Box -->
        <rect x="-35" y="70" width="70" height="26" rx="6" fill="${angle.dark ? '#111827' : '#ffffff'}" stroke="${accentColor}" stroke-width="1.5"/>
        <text x="0" y="87" font-family="-apple-system, system-ui, sans-serif" font-size="10" font-weight="800" fill="${angle.dark ? '#ffffff' : '#111827'}" text-anchor="middle" letter-spacing="1.5">${pack.brand.toUpperCase()}</text>

        <!-- Dynamic Slide Indicator Badge -->
        <rect x="-85" y="165" width="170" height="26" rx="13" fill="${badgeBg}" stroke="${angle.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}" stroke-width="1"/>
        <text x="0" y="182" font-family="-apple-system, system-ui, sans-serif" font-size="11" font-weight="600" fill="${textColor}" text-anchor="middle">
          IMAGE ${i} OF 5 • ${angle.label.toUpperCase()}
        </text>
      </g>

      <!-- Watermark Capacity -->
      <text x="560" y="660" font-family="-apple-system, system-ui, sans-serif" font-size="28" font-weight="900" fill="${textColor}" opacity="0.12" text-anchor="end">${pack.capacityLiters}L</text>
    </svg>`;

    const filePath = path.join(packDir, `${i}.webp`);
    // Save SVG file content (modern browsers and Vue render SVG directly under webp/svg)
    fs.writeFileSync(filePath, svgContent, 'utf-8');
  }
}

console.log('Successfully generated 100 backpack imagery assets in public/images/backpacks!');
