// Generates assets/header-contrib.svg: a GitHub-style contribution grid that "learns" my name.
// The grid starts as ordinary noisy activity, an activation wave sweeps it left to right in
// GitHub's greens, then the cells settle into my name written in 5x7 pixels, hold, and go back
// to noise. Same cell size, gap and palette as GitHub's own graph (dark theme), so it sits
// naturally above the real one on the profile.
//
// Usage (from this folder): node scripts/gen-contrib.mjs
import fs from 'node:fs';

const W = 900, H = 270, CELL = 10, GAP = 3, STEP = CELL + GAP, LOOP = 9;
const COLS = 66, ROWS = 15, X0 = Math.round((W - (COLS * STEP - GAP)) / 2), Y0 = 34;
const EMPTY = '#161b22', LV = ['#0e4429', '#006d32', '#26a641', '#39d353'];

let seed = 2027;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// 5x7 pixel glyphs for the letters needed.
const G = {
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};
const lit = new Set();
const write = (text, row) => {
  const width = [...text].reduce((w, ch) => w + G[ch][0].length + 1, -1);
  let col = Math.floor((COLS - width) / 2);
  for (const ch of text) {
    const g = G[ch];
    g.forEach((line, r) => [...line].forEach((b, c) => b === '1' && lit.add(`${row + r},${col + c}`)));
    col += g[0].length + 1;
  }
};
write('MOHAMED', 0);
write('RAYEN SANSA', 8);

// Noise like a real contribution graph: mostly empty, sometimes active.
const noise = () => {
  const v = rand();
  return v < 0.55 ? EMPTY : v < 0.75 ? LV[0] : v < 0.88 ? LV[1] : v < 0.96 ? LV[2] : LV[3];
};

const cells = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const inName = lit.has(`${r},${c}`);
    const target = inName ? LV[rand() < 0.65 ? 3 : 2] : EMPTY;
    const delay = (c * 0.022 + r * 0.008).toFixed(3);
    cells.push(
      `<rect class="${inName ? 'n' : 'b'}" x="${X0 + c * STEP}" y="${Y0 + r * STEP}" width="${CELL}" height="${CELL}" rx="2" ` +
        `style="--c:${noise()};--t:${target};animation-delay:${delay}s"/>`,
    );
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Mohamed Rayen Sansa — AI · Full-stack · IoT Engineering Student</title>
  <desc id="desc">A GitHub contribution grid: ordinary activity, then an activation wave sweeps it in green, and the cells settle into my name, written in pixels.</desc>
  <style>
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }
    rect.n, rect.b { fill: var(--c); animation: ${LOOP}s ease-in-out infinite both; }
    rect.n { animation-name: name; }
    rect.b { animation-name: back; }
    /* noise → activation wave → the name holds → back to noise */
    @keyframes name {
      0%, 12% { fill: var(--c); }
      22% { fill: #39d353; }
      34%, 84% { fill: var(--t); }
      96%, 100% { fill: var(--c); }
    }
    @keyframes back {
      0%, 12% { fill: var(--c); }
      20% { fill: #26a641; }
      27% { fill: #0e4429; }
      34%, 84% { fill: ${EMPTY}; }
      96%, 100% { fill: var(--c); }
    }
    .tag { opacity: 0; animation: tag ${LOOP}s ease-out infinite; }
    @keyframes tag { 0%, 36% { opacity: 0 } 42%, 86% { opacity: 1 } 94%, 100% { opacity: 0 } }
    .live { animation: blink 1.2s ease-in-out infinite; }
    @keyframes blink { 50% { opacity: .25 } }
    @media (prefers-reduced-motion: reduce) {
      rect.n, rect.b { animation: none; fill: var(--t); }
      .tag { animation: none; opacity: 1; }
      .live { animation: none; }
    }
  </style>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#0d1117" stroke="#30363d"/>
  <circle cx="22" cy="18" r="4.5" fill="#ff5f57"/>
  <circle cx="37" cy="18" r="4.5" fill="#febc2e"/>
  <circle cx="52" cy="18" r="4.5" fill="#28c840"/>
  <text class="mono" x="68" y="22" font-size="11" fill="#7d8590">~/rayen $ git commit -m "learn my name"</text>
  <g class="mono" font-size="11" text-anchor="end">
    <circle class="live" cx="${W - 192}" cy="18" r="3.5" fill="#39d353"/>
    <text x="${W - 22}" y="22" fill="#7d8590">contributions · learning</text>
  </g>

  <g>
    ${cells.join('\n    ')}
  </g>

  <g class="mono tag" font-size="12.5">
    <text x="${X0}" y="${H - 20}" fill="#e6edf3">AI · Full-stack · IoT Engineer</text>
    <text x="${X0 + 250}" y="${H - 20}" fill="#7d8590">·</text>
    <text x="${X0 + 266}" y="${H - 20}" fill="#39d353">ESPRIT engineering student · PFE from Feb 2027</text>
    <text x="${W - 22}" y="${H - 20}" fill="#7d8590" text-anchor="end">mohamedrayensansa.me</text>
  </g>
</svg>
`;

fs.writeFileSync(new URL('../assets/header-contrib.svg', import.meta.url), svg);
console.log(`header-contrib.svg: ${COLS}x${ROWS} cells, ${lit.size} lit, ${(svg.length / 1024).toFixed(0)} KB`);
