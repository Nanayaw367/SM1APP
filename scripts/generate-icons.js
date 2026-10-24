import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard SVG Icon (512x512)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#ea580c" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background base rounded card -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Tablet Outer Casing -->
  <rect x="86" y="66" width="340" height="380" rx="36" fill="#334155" stroke="#475569" stroke-width="4" filter="url(#glow)" />
  
  <!-- Tablet Bezel Inner -->
  <rect x="96" y="76" width="320" height="360" rx="28" fill="#0f172a" />

  <!-- Tablet Front Camera -->
  <circle cx="256" cy="94" r="5" fill="#64748b" />

  <!-- Tablet Screen Area -->
  <rect x="112" y="116" width="288" height="270" rx="16" fill="url(#screenGrad)" />

  <!-- Screen Content / Wave Graphic -->
  <path d="M 112 300 Q 184 250, 256 290 T 400 260 L 400 386 L 112 386 Z" fill="#4338ca" opacity="0.4" />
  <path d="M 112 330 Q 200 280, 270 320 T 400 290 L 400 386 L 112 386 Z" fill="#6366f1" opacity="0.25" />

  <!-- Stylus / Graduation Badge -->
  <!-- Stylus Pen resting diagonally -->
  <g transform="translate(190, 160)">
    <!-- Graduation Cap Emblem -->
    <path d="M 66 10 L 130 38 L 66 66 L 2 38 Z" fill="url(#orangeGrad)" />
    <path d="M 34 52 L 34 82 Q 66 102 98 82 L 98 52" fill="none" stroke="#ea580c" stroke-width="6" stroke-linecap="round" />
    <circle cx="128" cy="40" r="4" fill="#fbbf24" />
    <path d="M 128 42 L 136 72" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Checkmark / Operational Ready Badge -->
  <circle cx="340" cy="330" r="42" fill="url(#orangeGrad)" stroke="#ffffff" stroke-width="4" />
  <path d="M 324 330 L 336 342 L 358 318" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Tablet Home Indicator / Speaker -->
  <line x1="226" y1="416" x2="286" y2="416" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
</svg>`;

// 2. Maskable SVG with safe-zone margin (central 80% circle)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Scaled content centered within safe zone (scale 0.75) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Tablet Outer Casing -->
    <rect x="86" y="66" width="340" height="380" rx="36" fill="#334155" stroke="#475569" stroke-width="4" />
    
    <!-- Tablet Bezel Inner -->
    <rect x="96" y="76" width="320" height="360" rx="28" fill="#0f172a" />

    <!-- Tablet Front Camera -->
    <circle cx="256" cy="94" r="5" fill="#64748b" />

    <!-- Tablet Screen Area -->
    <rect x="112" y="116" width="288" height="270" rx="16" fill="url(#screenGrad)" />

    <!-- Graduation Cap Emblem -->
    <g transform="translate(190, 160)">
      <path d="M 66 10 L 130 38 L 66 66 L 2 38 Z" fill="url(#orangeGrad)" />
      <path d="M 34 52 L 34 82 Q 66 102 98 82 L 98 52" fill="none" stroke="#ea580c" stroke-width="6" stroke-linecap="round" />
      <circle cx="128" cy="40" r="4" fill="#fbbf24" />
      <path d="M 128 42 L 136 72" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Checkmark Badge -->
    <circle cx="340" cy="330" r="42" fill="url(#orangeGrad)" stroke="#ffffff" stroke-width="4" />
    <path d="M 324 330 L 336 342 L 358 318" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

    <line x1="226" y1="416" x2="286" y2="416" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
  </g>
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Created icon.svg');

  const svgBuffer = Buffer.from(svgContent);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 512x512 Maskable PNG
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 32x32 Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
