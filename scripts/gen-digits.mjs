// Generates assets/header-digits.svg: my name, and beside it a real neural network reading
// handwritten digits. Everything drawn comes from data/digits_model.json (scripts/train_digits.py):
// real test images, the hidden activations the network computes for them, its real weights
// (hidden -> output, colour = sign, width = size) and its real output probabilities.
//
// Usage (from this folder): node scripts/gen-digits.mjs
import fs from 'node:fs';

const M = JSON.parse(fs.readFileSync(new URL('../data/digits_model.json', import.meta.url), 'utf8'));
const W = 900, H = 270;
const N = M.samples.length, SLOT = 3.5, LOOP = N * SLOT; // seconds per digit, whole loop

// Geometry of the network card.
const IMG = { x: 530, y: 84, cell: 7, gap: 1 };
const HID = { x: 640, y0: 52, step: 10, r: 3.6 };
const OUT = { x: 724, y0: 56, step: 15.5, r: 4.6 };
const BAR = { x: 760, max: 92 };
const hy = (j) => HID.y0 + j * HID.step;
const oy = (k) => OUT.y0 + k * OUT.step;
const pct = (t) => ((t / LOOP) * 100).toFixed(2);

let css = '';
// Visible during digit `k`, appearing `lag` seconds into its slot.
const windowRule = (name, k, lag) => {
  const a = k * SLOT + lag, b = (k + 1) * SLOT - 0.25;
  css += `.${name}{animation:${name} ${LOOP}s linear infinite}@keyframes ${name}{0%{opacity:0}${pct(Math.max(a - 0.01, 0))}%{opacity:0}${pct(a + 0.3)}%{opacity:1}${pct(b)}%{opacity:1}${pct(b + 0.2)}%{opacity:0}100%{opacity:0}}`;
};

// Static: input → hidden fan (the image is the input layer), hidden → output real weights.
const fan = [];
for (let r = 0; r < 8; r += 1) {
  const yIn = IMG.y + r * (IMG.cell + IMG.gap) + IMG.cell / 2;
  for (let j = 0; j < 16; j += 2) fan.push(`<path d="M${IMG.x + 64} ${yIn.toFixed(1)}L${HID.x} ${hy(j)}"/>`);
}
const wmax = Math.max(...M.w2.flat().map(Math.abs));
const weights = [];
M.w2.forEach((row, j) =>
  row.forEach((w, k) => {
    const a = Math.abs(w) / wmax;
    if (a < 0.12) return; // the faintest ones only add noise to the picture
    weights.push(`<path d="M${HID.x} ${hy(j)}L${OUT.x} ${oy(k)}" stroke="${w > 0 ? '#5f8fd6' : '#d0705e'}" stroke-width="${(0.3 + a * 1.4).toFixed(2)}" opacity="${(0.12 + a * 0.5).toFixed(2)}"/>`);
  }),
);

// Per digit: the image, the hidden activations, the output bars, the verdict.
const layers = M.samples.map((s, k) => {
  windowRule(`img${k}`, k, 0);
  windowRule(`hid${k}`, k, 0.55);
  windowRule(`out${k}`, k, 1.1);
  const img = s.image.map((v, i) => {
    const r = Math.floor(i / 8), c = i % 8;
    return v > 0.02
      ? `<rect x="${IMG.x + c * (IMG.cell + IMG.gap)}" y="${IMG.y + r * (IMG.cell + IMG.gap)}" width="${IMG.cell}" height="${IMG.cell}" rx="1.2" fill="#e6edf3" opacity="${(0.15 + v * 0.85).toFixed(2)}"/>`
      : '';
  }).join('');
  const hid = s.hidden.map((a, j) => (a > 0.02 ? `<circle cx="${HID.x}" cy="${hy(j)}" r="${(HID.r - 1).toFixed(1)}" fill="#9cc3ff" opacity="${(0.15 + a * 0.85).toFixed(2)}"/>` : '')).join('');
  const best = s.proba.indexOf(Math.max(...s.proba));
  const bars = s.proba.map((p, d) => {
    const w = Math.max(p * BAR.max, 1);
    const on = d === best;
    return `<rect x="${BAR.x}" y="${(oy(d) - 3).toFixed(1)}" width="${w.toFixed(1)}" height="6" rx="3" fill="${on ? '#39d353' : '#3d4a59'}"/>` +
      (p >= 0.02 ? `<text x="${(BAR.x + w + 5).toFixed(1)}" y="${(oy(d) + 3).toFixed(1)}" fill="${on ? '#39d353' : '#7d8590'}">${Math.round(p * 100)}%</text>` : '') +
      (on ? `<circle cx="${OUT.x}" cy="${oy(d)}" r="${OUT.r - 1.4}" fill="#39d353"/>` : '');
  }).join('');
  const verdict = `<text x="530" y="236" fill="#e6edf3">prediction <tspan fill="#39d353" font-weight="700">${best}</tspan> · ${Math.round(s.proba[best] * 100)}% <tspan fill="#39d353">✓</tspan><tspan fill="#7d8590">  (true label ${s.label})</tspan></text>`;
  return `<g class="img${k}">${img}</g><g class="hid${k}">${hid}</g><g class="out${k} mono" font-size="9.5">${bars}${verdict}</g>`;
});

// Forward-pass sparks along the strongest weights, once per digit.
const strongest = M.w2.flatMap((row, j) => row.map((w, k) => ({ j, k, a: Math.abs(w) }))).sort((p, q) => q.a - p.a).slice(0, 26);
const sparks = strongest.map(({ j, k }) => {
  const len = Math.hypot(OUT.x - HID.x, oy(k) - hy(j)).toFixed(1);
  return `<path class="spark" d="M${HID.x} ${hy(j)}L${OUT.x} ${oy(k)}" style="--len:${len}"/>`;
});
const s0 = (0.8 / SLOT) * 100, s1 = (1.25 / SLOT) * 100;
css += `.spark{fill:none;stroke:#9cc3ff;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:6 var(--len);stroke-dashoffset:var(--len);opacity:0;animation:spark ${SLOT}s linear infinite}` +
  `@keyframes spark{0%,${s0.toFixed(1)}%{stroke-dashoffset:var(--len);opacity:0}${(s0 + 2).toFixed(1)}%{opacity:1}${s1.toFixed(1)}%{stroke-dashoffset:0;opacity:1}${(s1 + 4).toFixed(1)}%,100%{stroke-dashoffset:0;opacity:0}}`;

const acc = (M.accuracy * 100).toFixed(1);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Mohamed Rayen Sansa — AI · Full-stack · IoT Engineering Student</title>
  <desc id="desc">My name, and beside it a real neural network (64-16-10, ${acc}% test accuracy) reading handwritten digits it never saw: the image, its hidden activations, its weights and its output probabilities, all computed by the trained model.</desc>
  <style>
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }
    .sans { font-family: 'Segoe UI', Inter, Helvetica, Arial, sans-serif; }
    .in { opacity: 0; animation: in .6s ease-out forwards; }
    @keyframes in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .d1 { animation-delay: .2s } .d2 { animation-delay: .5s } .d6 { animation-delay: 1.9s } .d7 { animation-delay: 2.2s }
    .typed { animation: type 2s steps(30, end) 1s both; }
    @keyframes type { from { width: 0 } to { width: 292px } }
    .cursor { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0 } }
    .fan path { stroke: #2a3440; stroke-width: .6; fill: none; }
    .node { fill: #141a21; stroke: #46566a; stroke-width: 1; }
    ${css}
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
      .in, .img0, .hid0, .out0 { opacity: 1 !important; } .typed { width: 292px; } .spark { opacity: 0 !important; }
      ${M.samples.slice(1).map((_, k) => `.img${k + 1}, .hid${k + 1}, .out${k + 1} { opacity: 0 !important; }`).join(' ')}
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
    <clipPath id="typeclip"><rect class="typed" x="48" y="140" width="292" height="26"/></clipPath>
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#grid)"/>
  <circle cx="30" cy="28" r="5.5" fill="#ff5f57"/>
  <circle cx="48" cy="28" r="5.5" fill="#febc2e"/>
  <circle cx="66" cy="28" r="5.5" fill="#28c840"/>

  <text class="mono in d1" x="48" y="72" font-size="15" fill="#9aa4ae">~/rayen <tspan fill="#7fd1a8">$</tspan> <tspan fill="#d7dde3">python predict.py</tspan></text>
  <text class="sans in d2" x="46" y="122" font-size="42" font-weight="700" fill="#f1efe9" letter-spacing="-.5">Mohamed Rayen Sansa</text>
  <g clip-path="url(#typeclip)"><text class="mono" x="48" y="160" font-size="16" fill="#d7dde3">AI · Full-stack · IoT Engineer</text></g>
  <rect class="cursor" x="342" y="146" width="9" height="17" fill="#8db3f3"/>
  <text class="mono in d6" x="48" y="198" font-size="13" fill="#8db3f3">ESPRIT engineering student · PFE from Feb 2027</text>
  <text class="mono in d7" x="48" y="226" font-size="12" fill="#6b7682">mohamedrayensansa.me</text>

  <rect x="512" y="22" width="364" height="226" rx="12" fill="#12161b" stroke="#2a3038"/>
  <text class="mono" x="528" y="40" font-size="10" fill="#6b7682">MLP 64→16→10 · reads handwritten digits</text>
  <text class="mono" x="860" y="40" font-size="10" fill="#39d353" text-anchor="end">test acc ${acc}%</text>
  <rect x="${IMG.x - 3}" y="${IMG.y - 3}" width="${8 * (IMG.cell + IMG.gap) + 5}" height="${8 * (IMG.cell + IMG.gap) + 5}" rx="4" fill="#0d1117" stroke="#2a3038"/>
  <text class="mono" x="${IMG.x}" y="${IMG.y + 80}" font-size="9" fill="#6b7682">input 8×8</text>
  <g class="fan">${fan.join('')}</g>
  <g>${weights.join('')}</g>
  <g>${sparks.join('')}</g>
  <g>${Array.from({ length: 16 }, (_, j) => `<circle class="node" cx="${HID.x}" cy="${hy(j)}" r="${HID.r}"/>`).join('')}</g>
  <g>${Array.from({ length: 10 }, (_, k) => `<circle class="node" cx="${OUT.x}" cy="${oy(k)}" r="${OUT.r}"/><text class="mono" x="${OUT.x + 10}" y="${oy(k) + 3}" font-size="9" fill="#9aa4ae">${k}</text>`).join('')}</g>
  ${layers.join('\n  ')}
</svg>
`;

fs.writeFileSync(new URL('../assets/header-digits.svg', import.meta.url), svg);
console.log(`header-digits.svg: ${N} digits, ${weights.length} weights drawn, ${(svg.length / 1024).toFixed(0)} KB`);
