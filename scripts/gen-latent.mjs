// Generates assets/header-latent.svg: my name stored as latent codes, decoded by a real network.
// Like a binary dump turning into ASCII, but machine-learning: every letter first shows the two
// numbers a trained autoencoder keeps for it (its latent code), then the decoder's real
// reconstruction draws the letter pixel by pixel. Data: data/autoencoder_name.json
// (scripts/train_autoencoder.py).
//
// Usage (from this folder): node scripts/gen-latent.mjs
import fs from 'node:fs';

const M = JSON.parse(fs.readFileSync(new URL('../data/autoencoder_name.json', import.meta.url), 'utf8'));
const W = 900, H = 270, LOOP = 12, LAG = 0.32;
const CELL = 6, GAP = 1.3, P = CELL + GAP, LW = 5 * P - GAP, SLOT = 40, SPACE = 22;
const Y = 108; // top of the letters

const chars = [...M.name];
const width = chars.reduce((w, ch) => w + (ch === ' ' ? SPACE : SLOT), 0) - (SLOT - LW);
let x = Math.round((W - width) / 2);
const fmt = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);

let n = 0;
const slots = chars.map((ch) => {
  if (ch === ' ') { x += SPACE; return ''; }
  const L = M.letters[ch], d = (n++ * LAG).toFixed(2), x0 = x;
  x += SLOT;
  const base = [], lit = [];
  L.recon.forEach((v, i) => {
    const px = x0 + (i % 5) * P, py = Y + Math.floor(i / 5) * P;
    base.push(`<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${CELL}" height="${CELL}" rx="1"/>`);
    if (v > 0.03) lit.push(`<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${CELL}" height="${CELL}" rx="1" style="--o:${v.toFixed(2)}"/>`);
  });
  const cx = x0 + LW / 2;
  return (
    `<g class="code" style="animation-delay:${d}s"><text x="${cx.toFixed(1)}" y="${Y - 28}">${fmt(L.code[0])}</text><text x="${cx.toFixed(1)}" y="${Y - 15}">${fmt(L.code[1])}</text></g>` +
    `<g class="base">${base.join('')}</g>` +
    `<g class="lit" style="animation-delay:${d}s">${lit.join('')}</g>` +
    `<text class="ch" x="${cx.toFixed(1)}" y="${Y + 7 * P + 16}" style="animation-delay:${d}s">${ch}</text>`
  );
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Mohamed Rayen Sansa — AI &amp; Machine Learning Engineer</title>
  <desc id="desc">My name stored the way a neural network stores it: each letter as two numbers, the latent code of a trained autoencoder, then decoded back into pixels by the network, one letter after another.</desc>
  <style>
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }
    .code text { font-size: 9.5px; text-anchor: middle; fill: #8db3f3; }
    .code { opacity: 0; animation: code ${LOOP}s ease-out infinite both; }
    @keyframes code { 0% { opacity: 0 } 3% { opacity: 1 } 16% { opacity: 1 } 24%, 84% { opacity: .38 } 92%, 100% { opacity: 0 } }
    .base rect { fill: #161b22; }
    .lit rect { fill: #e6edf3; opacity: 0; }
    .lit { animation: lit ${LOOP}s ease-out infinite both; }
    .lit rect { opacity: var(--o); }
    @keyframes lit { 0%, 12% { opacity: 0; filter: blur(2px) } 22% { opacity: 1; filter: blur(0) } 84% { opacity: 1 } 92%, 100% { opacity: 0 } }
    .ch { font-size: 10px; text-anchor: middle; fill: #39d353; opacity: 0; animation: ch ${LOOP}s ease-out infinite both; }
    @keyframes ch { 0%, 20% { opacity: 0 } 25%, 84% { opacity: 1 } 92%, 100% { opacity: 0 } }
    .in { opacity: 0; animation: in ${LOOP}s ease-out infinite; }
    @keyframes in { 0%, 52% { opacity: 0 } 58%, 88% { opacity: 1 } 94%, 100% { opacity: 0 } }
    .live { animation: blink 1.2s ease-in-out infinite; }
    @keyframes blink { 50% { opacity: .25 } }
    @media (prefers-reduced-motion: reduce) {
      .code, .lit, .ch, .in, .live { animation: none; opacity: 1; }
      .code { opacity: .38; }
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
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#grid)"/>
  <circle cx="30" cy="28" r="5.5" fill="#ff5f57"/>
  <circle cx="48" cy="28" r="5.5" fill="#febc2e"/>
  <circle cx="66" cy="28" r="5.5" fill="#28c840"/>
  <text class="mono" x="88" y="32" font-size="12" fill="#7d8590">~/rayen $ python decode.py --latent-dim 2</text>
  <g class="mono" font-size="11">
    <circle class="live" cx="${W - 214}" cy="28" r="3.5" fill="#39d353"/>
    <text x="${W - 26}" y="32" fill="#7d8590" text-anchor="end">decoder · ${Math.round(M.pixel_accuracy * 100)}% pixels right</text>
  </g>

  <g class="mono">
    <text x="${Math.round((W - width) / 2) - 14}" y="${Y - 28}" font-size="9.5" fill="#56606b" text-anchor="end">z₁</text>
    <text x="${Math.round((W - width) / 2) - 14}" y="${Y - 15}" font-size="9.5" fill="#56606b" text-anchor="end">z₂</text>
    ${slots.join('\n    ')}
  </g>

  <g class="mono in" text-anchor="middle">
    <text x="${W / 2}" y="${H - 48}" font-size="14" fill="#e6edf3">AI &amp; Machine Learning Engineer  ·  <tspan fill="#8db3f3">ESPRIT engineering student · PFE from Feb 2027</tspan></text>
    <text x="${W / 2}" y="${H - 26}" font-size="11" fill="#56606b">each letter is stored as 2 numbers by a denoising autoencoder (${M.architecture}) and drawn back by its decoder  ·  mohamedrayensansa.me</text>
  </g>
</svg>
`;

fs.writeFileSync(new URL('../assets/header-latent.svg', import.meta.url), svg);
console.log(`header-latent.svg: ${n} letters, ${(svg.length / 1024).toFixed(0)} KB`);
