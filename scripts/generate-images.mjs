// Generates the local placeholder car illustrations in /public/cars.
//   node scripts/generate-images.mjs
// They are original, simple vector drawings - no external image dependencies.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cars');
mkdirSync(out, { recursive: true });

const SHAPES = {
  sedan: {
    body: 'M120 330 L130 292 Q135 276 160 271 L250 252 Q290 192 350 187 L490 187 Q545 190 580 252 L650 272 Q680 280 682 306 L685 330 Q685 346 670 346 L130 346 Q118 346 120 330 Z',
    glass: ['M268 250 Q300 207 350 202 L418 202 L418 250 Z', 'M434 202 L490 202 Q522 205 550 250 L434 250 Z'],
  },
  hatch: {
    body: 'M130 336 L135 292 Q140 274 165 270 L250 250 Q290 196 345 190 L500 190 Q560 192 590 252 L640 262 Q668 270 670 300 L672 336 Q672 349 658 349 L140 349 Q128 349 130 336 Z',
    glass: ['M268 248 Q298 207 345 203 L410 203 L410 248 Z', 'M425 203 L500 203 Q540 206 565 248 L425 248 Z'],
  },
  suv: {
    body: 'M110 336 L115 282 Q120 264 145 260 L240 247 L270 178 Q280 162 300 162 L560 162 Q585 162 600 182 L640 252 L665 264 Q690 272 692 302 L695 336 Q695 351 680 351 L120 351 Q108 351 110 336 Z',
    glass: ['M288 180 L418 180 L418 246 L258 246 Z', 'M434 180 L556 180 L598 246 L434 246 Z'],
  },
  van: {
    body: 'M100 342 L105 192 Q108 172 130 170 L560 170 Q600 170 625 207 L675 267 Q695 282 697 312 L698 342 Q698 357 683 357 L112 357 Q98 357 100 342 Z',
    glass: ['M130 190 L250 190 L250 250 L128 250 Z', 'M265 190 L400 190 L400 250 L265 250 Z', 'M415 190 L555 190 Q580 190 596 220 L622 250 L415 250 Z'],
  },
};

function carSVG({ shape = 'sedan', color = '#2563a8', sky1 = '#dfe9f5', sky2 = '#f6f9fd', label = '' }) {
  const s = SHAPES[shape];
  const wheelY = shape === 'van' ? 357 : shape === 'suv' ? 351 : 346;
  const wheels = [235, 585]
    .map(
      (x) => `<circle cx="${x}" cy="${wheelY}" r="60" fill="#1a2230"/><circle cx="${x}" cy="${wheelY}" r="46" fill="#10151d"/><circle cx="${x}" cy="${wheelY}" r="26" fill="#c9d3df"/><circle cx="${x}" cy="${wheelY}" r="8" fill="#6b7788"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${label || 'Car illustration'}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".78"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="800" height="500" fill="url(#sky)"/>
<circle cx="640" cy="110" r="44" fill="#ffffff" opacity=".7"/>
<path d="M0 330 L120 270 L210 320 L330 240 L450 320 L560 255 L690 330 L800 285 L800 400 L0 400 Z" fill="#c4d3e6" opacity=".55"/>
<rect y="395" width="800" height="105" fill="#2a3342"/>
<rect y="392" width="800" height="8" fill="#3b4658"/>
<g fill="#fff" opacity=".55"><rect x="60" y="448" width="90" height="8" rx="4"/><rect x="250" y="448" width="90" height="8" rx="4"/><rect x="440" y="448" width="90" height="8" rx="4"/><rect x="630" y="448" width="90" height="8" rx="4"/></g>
<ellipse cx="400" cy="402" rx="300" ry="20" fill="#000" opacity=".28"/>
<path d="${s.body}" fill="url(#body)"/>
<path d="${s.body}" fill="url(#shine)" opacity=".6"/>
${s.glass.map((g) => `<path d="${g}" fill="#cfe3f5" stroke="#10151d" stroke-opacity=".25" stroke-width="2"/>`).join('')}
<rect x="415" y="${shape === 'van' ? 262 : 262}" width="4" height="${shape === 'van' ? 85 : 72}" fill="#000" opacity=".18"/>
<rect x="650" y="${wheelY - 70}" width="30" height="16" rx="6" fill="#fff6c9"/>
<rect x="120" y="${wheelY - 70}" width="20" height="16" rx="6" fill="#d33a2c"/>
<rect x="330" y="${wheelY - 38}" width="40" height="7" rx="3" fill="#000" opacity=".25"/>
${wheels}
</svg>`;
}

const cars = {
  'car-001': { shape: 'sedan', color: '#1f5f9e', label: 'Blue Toyota Corolla' },
  'car-002': { shape: 'suv', color: '#27313f', label: 'Dark grey Toyota Land Cruiser Prado' },
  'car-003': { shape: 'hatch', color: '#c0392b', label: 'Red Hyundai i10' },
  'car-004': { shape: 'sedan', color: '#cfd6df', label: 'Silver Suzuki Dzire', sky1: '#e5ebf3' },
  'car-005': { shape: 'van', color: '#f3f5f7', label: 'White Toyota Hiace', sky1: '#dbe5f1' },
  'car-006': { shape: 'sedan', color: '#7a1f2b', label: 'Burgundy Volkswagen Jetta' },
  'car-007': { shape: 'suv', color: '#e8e9ec', label: 'White Nissan X-Trail' },
  'car-008': { shape: 'hatch', color: '#3b7d5b', label: 'Green Honda Fit' },
  'car-009': { shape: 'suv', color: '#a9741f', label: 'Bronze Ford Ranger' },
  'car-010': { shape: 'hatch', color: '#e0a21b', label: 'Yellow Kia Picanto' },
  'demo-1': { shape: 'sedan', color: '#2a6fb5', label: 'Blue sedan' },
  'demo-2': { shape: 'hatch', color: '#d1423a', label: 'Red hatchback' },
  'demo-3': { shape: 'suv', color: '#f1f3f5', label: 'White SUV' },
  'demo-4': { shape: 'sedan', color: '#b7c0cc', label: 'Silver sedan' },
  'demo-5': { shape: 'suv', color: '#1d232d', label: 'Black SUV' },
  'demo-6': { shape: 'hatch', color: '#3f8a63', label: 'Green hatchback' },
  'demo-7': { shape: 'van', color: '#cfa23a', label: 'Gold minivan' },
  'demo-8': { shape: 'sedan', color: '#6c7686', label: 'Grey sedan' },
};

for (const [name, cfg] of Object.entries(cars)) {
  writeFileSync(join(out, `${name}.svg`), carSVG(cfg));
}

// Interior view
writeFileSync(
  join(out, 'interior.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Car interior illustration">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0f2"/><stop offset="1" stop-color="#eef4fb"/></linearGradient>
<linearGradient id="d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3444"/><stop offset="1" stop-color="#171d28"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#g)"/>
<path d="M0 120 Q400 40 800 120 L800 500 L0 500 Z" fill="#9db8d4" opacity=".6"/>
<path d="M0 300 Q400 230 800 300 L800 500 L0 500 Z" fill="url(#d)"/>
<rect x="60" y="300" width="680" height="16" rx="8" fill="#3a4559"/>
<g fill="#10151d" opacity=".9"><circle cx="230" cy="380" r="95"/></g>
<circle cx="230" cy="380" r="88" fill="none" stroke="#4a5568" stroke-width="16"/>
<circle cx="230" cy="380" r="20" fill="#4a5568"/>
<path d="M142 380 H320 M230 380 V468" stroke="#4a5568" stroke-width="12"/>
<rect x="430" y="330" width="260" height="110" rx="14" fill="#0b0f16"/>
<rect x="444" y="344" width="232" height="82" rx="8" fill="#1d4f7a"/>
<circle cx="500" cy="385" r="22" fill="#e8a317" opacity=".9"/><rect x="540" y="365" width="110" height="10" rx="5" fill="#cfe3f5"/><rect x="540" y="388" width="80" height="10" rx="5" fill="#8db1d6"/>
</svg>`,
);

// Street scene
writeFileSync(
  join(out, 'street.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="City road illustration">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c978"/><stop offset=".55" stop-color="#f7e3c3"/><stop offset="1" stop-color="#dbe7f4"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#s)"/>
<circle cx="560" cy="250" r="70" fill="#fff3d0" opacity=".9"/>
<g fill="#7d8da3" opacity=".7"><rect x="60" y="210" width="60" height="170"/><rect x="130" y="170" width="50" height="210"/><rect x="190" y="240" width="70" height="140"/><rect x="620" y="200" width="60" height="180"/><rect x="690" y="230" width="70" height="150"/></g>
<path d="M0 500 L330 330 H470 L800 500 Z" fill="#2c3545"/>
<path d="M400 340 V500" stroke="#f3f5f7" stroke-width="6" stroke-dasharray="26 22" opacity=".8"/>
<path d="M0 380 H800 V330 H0 Z" fill="#6d9a6b" opacity=".35"/>
</svg>`,
);

// Fallback shown when an image fails to load
writeFileSync(
  join(out, 'fallback.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Photo unavailable">
<rect width="800" height="500" fill="#e8edf4"/>
<g fill="none" stroke="#9aa9bd" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M230 330 L260 270 Q270 250 295 250 H505 Q530 250 540 270 L570 330"/><rect x="200" y="330" width="400" height="60" rx="16"/><circle cx="280" cy="395" r="28"/><circle cx="520" cy="395" r="28"/></g>
<text x="400" y="460" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#7a8aa0">Photo unavailable</text>
</svg>`,
);

console.log('Generated placeholder images in', out);
