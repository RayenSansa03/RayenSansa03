// Generates assets/header.svg: a cloud of scattered points that "trains" into my name.
// The letters are rendered once with sharp, sampled on a grid, and each sample becomes a dot
// that starts somewhere random and converges to its place, while a loss curve falls and the
// epochs count up. Then the dots drift apart again and the loop restarts ("re-training").
//
// Usage (from this folder): node scripts/gen-header.mjs
// sharp is borrowed from the portfolio's node_modules (no install needed here).
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire('C:/dev/portfolio/package.json');
const sharp = require('sharp');

const W = 900, H = 270;
const NAME = 'Mohamed Rayen Sansa';
const TEXT = { x: 44, y: 124, size: 52 }; // baseline of the name, in banner coordinates
const STEP = 3.6;                          // sampling grid (px): smaller = more dots
const R = 1.35;                            // dot radius

// Deterministic randomness, so the banner is the same every time it is generated.
let seed = 20270201;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());

// 1. Render the name and sample its pixels.
const glyphs = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<text x="${TEXT.x}" y="${TEXT.y}" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${TEXT.size}" letter-spacing="-1" fill="#fff">${NAME}</text>` +
    `</svg>`,
);
const { data, info } = await sharp(glyphs).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const targets = [];
for (let y = 0; y < H; y += STEP) {
  for (let x = 0; x < W; x += STEP) {
    const jx = x + (rand() - 0.5) * STEP * 0.5, jy = y + (rand() - 0.5) * STEP * 0.5;
    const i = (Math.round(jy) * info.width + Math.round(jx)) * 4 + 3;
    if (data[i] > 140) targets.push([jx, jy]);
  }
}

// 2. One dot per target: a random start (a wide noisy cloud), a delay, a colour.
const cx = 330, cy = 120;
const dots = targets.map(([x, y]) => {
  const sx = cx + gauss() * 230, sy = cy + gauss() * 70;
  const hue = rand();
  const fill = hue < 0.07 ? '#8db3f3' : hue < 0.1 ? '#7fd1a8' : '#e6e4de';
  const delay = (rand() * 0.9).toFixed(2);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${R}" fill="${fill}" style="--x:${(sx - x).toFixed(0)}px;--y:${(sy - y).toFixed(0)}px;animation-delay:${delay}s"/>`;
});

// 3. Loss curve for the panel: a falling, slightly noisy exponential.
const lossPts = [];
for (let e = 0; e <= 50; e++) {
  const v = 0.08 + 0.9 * Math.exp(-e / 9) + (rand() - 0.5) * 0.05 * Math.exp(-e / 20);
  lossPts.push([686 + e * 3.6, 196 - v * 82]);
}
const lossPath = 'M' + lossPts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
const epochs = Array.from({ length: 11 }, (_, k) => String(k * 5).padStart(2, '0'));

const LOOP = 10; // seconds

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">${NAME} — AI · Full-stack · IoT Engineering Student</title>
  <desc id="desc">A cloud of scattered data points trains, epoch after epoch, until it converges into my name, while a loss curve falls beside it.</desc>
  <style>
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }
    .sans { font-family: 'Segoe UI', Inter, Helvetica, Arial, sans-serif; }

    /* Each dot: scattered, converges to its place, holds, drifts apart, on a ${LOOP} s loop. */
    .dots circle { animation: train ${LOOP}s cubic-bezier(.2,.7,.2,1) infinite both; }
    @keyframes train {
      0%, 6%   { transform: translate(var(--x), var(--y)); opacity: .35; }
      48%      { transform: translate(0, 0); opacity: 1; }
      86%      { transform: translate(0, 0); opacity: 1; }
      100%     { transform: translate(var(--x), var(--y)); opacity: .35; }
    }

    /* Under the name, once it has converged. */
    .after { opacity: 0; animation: after ${LOOP}s ease-out infinite; }
    .after2 { animation-delay: .25s; }
    @keyframes after { 0%, 50% { opacity: 0; transform: translateY(5px) } 56%, 84% { opacity: 1; transform: none } 92%, 100% { opacity: 0 } }

    /* Training panel: the loss curve draws itself, the epochs count, the progress bar fills. */
    .loss { fill: none; stroke: #8db3f3; stroke-width: 1.8; stroke-linejoin: round; stroke-dasharray: 260; animation: loss ${LOOP}s linear infinite; }
    @keyframes loss { 0%, 6% { stroke-dashoffset: 260 } 48%, 86% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: 260 } }
    .bar { animation: bar ${LOOP}s linear infinite; }
    @keyframes bar { 0%, 6% { width: 0 } 48%, 86% { width: 180px } 100% { width: 0 } }
    .epochs { animation: epochs ${LOOP}s steps(1, end) infinite; }
    @keyframes epochs { ${epochs.map((_, k) => `${(6 + k * 4.2).toFixed(1)}% { transform: translateY(${-k * 16}px) }`).join(' ')} 86% { transform: translateY(${-10 * 16}px) } 100% { transform: translateY(0) } }
    .done { opacity: 0; animation: done ${LOOP}s ease-out infinite; }
    @keyframes done { 0%, 48% { opacity: 0 } 52%, 84% { opacity: 1 } 90%, 100% { opacity: 0 } }

    @media (prefers-reduced-motion: reduce) {
      .dots circle, .after, .loss, .bar, .epochs, .done { animation: none; }
      .after, .done { opacity: 1; }
      .loss { stroke-dashoffset: 0; } .bar { width: 180px; }
      .epochs { transform: translateY(-160px); }
    }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#15191e"/>
      <stop offset="1" stop-color="#0e1115"/>
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="#ffffff" stroke-opacity=".035"/>
    </pattern>
    <clipPath id="epclip"><rect x="736" y="38" width="40" height="18"/></clipPath>
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#grid)"/>
  <circle cx="30" cy="28" r="5.5" fill="#ff5f57"/>
  <circle cx="48" cy="28" r="5.5" fill="#febc2e"/>
  <circle cx="66" cy="28" r="5.5" fill="#28c840"/>
  <text class="mono" x="88" y="32" font-size="12" fill="#6b7682">~/rayen $ python train.py --target "${NAME.toLowerCase().replace(/ /g, '_')}"</text>

  <g class="dots">
    ${dots.join('\n    ')}
  </g>

  <text class="mono after" x="${TEXT.x + 2}" y="176" font-size="16" fill="#d7dde3">AI · Full-stack · IoT Engineer</text>
  <text class="mono after after2" x="${TEXT.x + 2}" y="206" font-size="13" fill="#8db3f3">ESPRIT engineering student · open to a PFE internship, Feb 2027</text>
  <text class="mono after after2" x="${TEXT.x + 2}" y="236" font-size="12" fill="#6b7682">mohamedrayensansa.me</text>

  <!-- Training panel -->
  <rect x="672" y="22" width="206" height="226" rx="12" fill="#12161b" stroke="#2a3038"/>
  <text class="mono" x="688" y="51" font-size="11" fill="#9aa4ae">epoch</text>
  <g clip-path="url(#epclip)">
    <g class="epochs mono" font-size="13" fill="#f1efe9">
      ${epochs.map((e, k) => `<text x="738" y="${51 + k * 16}">${e}</text>`).join('\n      ')}
    </g>
  </g>
  <text class="mono" x="760" y="51" font-size="11" fill="#6b7682">/ 50</text>
  <rect x="688" y="62" width="180" height="4" rx="2" fill="#1f262e"/>
  <rect class="bar" x="688" y="62" width="180" height="4" rx="2" fill="#8db3f3"/>

  <text class="mono" x="688" y="92" font-size="11" fill="#9aa4ae">loss</text>
  <path d="M686 196H868M686 114V196" fill="none" stroke="#2a3038"/>
  <path class="loss" d="${lossPath}"/>
  <text class="mono done" x="688" y="226" font-size="11" fill="#7fd1a8">✓ converged</text>
  <text class="mono" x="866" y="226" font-size="10" fill="#56606b" text-anchor="end">${targets.length} points</text>
</svg>
`;

fs.writeFileSync(new URL('../assets/header.svg', import.meta.url), svg);
console.log(`header.svg: ${targets.length} points, ${(svg.length / 1024).toFixed(0)} KB`);
