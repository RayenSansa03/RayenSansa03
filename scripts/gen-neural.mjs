// Generates assets/header.svg: my name, and beside it a small neural network that trains live.
// Inputs are the features of my FootBallAnalysis model (age, goals, minutes, club level), the
// output is the market value. Each 6 s loop is one training step: a forward pass lights the
// layers left to right, a backward pass (backprop) runs right to left, and the weights change
// (thickness, sign colour) from one epoch to the next while the loss falls.
//
// Usage (from this folder): node scripts/gen-neural.mjs
import fs from 'node:fs';

const W = 900, H = 270, LOOP = 6;
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// Layers: x position, node count, labels for the input and output layers.
const layers = [
  { x: 610, n: 4, labels: ['age', 'goals', 'minutes', 'club'] },
  { x: 680, n: 6 },
  { x: 750, n: 6 },
  { x: 820, n: 1, labels: ['value €'] },
];
const top = 62, bottom = 186;
const ys = (n) => Array.from({ length: n }, (_, i) => (n === 1 ? (top + bottom) / 2 : top + (i * (bottom - top)) / (n - 1)));
layers.forEach((l) => (l.ys = ys(l.n)));

const edges = [];
for (let li = 0; li < layers.length - 1; li++) {
  const a = layers[li], b = layers[li + 1];
  for (const y1 of a.ys) for (const y2 of b.ys) edges.push({ li, x1: a.x, y1, x2: b.x, y2 });
}

// Each edge: a weight that drifts over the loop (sign colour, width), and its pulses.
// Forward pulse of layer li runs during [li*14 %, li*14+14 %]; backward runs later, reversed.
const fwd = (li) => [6 + li * 13, 6 + li * 13 + 13];
const bwd = (li) => [52 + (2 - li) * 13, 52 + (2 - li) * 13 + 13];

let css = '';
const edgeSvg = edges.map((e, k) => {
  const w1 = rand() * 2 - 1, w2 = w1 * 0.4 + (rand() * 2 - 1) * 0.8; // weight before / after the step
  const col = (w) => (w >= 0 ? '#5f8fd6' : '#d0705e');
  const wid = (w) => (0.35 + Math.abs(w) * 1.5).toFixed(2);
  const op = (w) => (0.18 + Math.abs(w) * 0.42).toFixed(2);
  const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1).toFixed(1);
  css += `.w${k}{stroke:${col(w1)};stroke-width:${wid(w1)};opacity:${op(w1)};animation:w${k} ${LOOP}s ease-in-out infinite}` +
    `@keyframes w${k}{0%,84%{stroke:${col(w1)};stroke-width:${wid(w1)};opacity:${op(w1)}}92%,96%{stroke:${col(w2)};stroke-width:${wid(w2)};opacity:${op(w2)}}100%{stroke:${col(w1)};stroke-width:${wid(w1)};opacity:${op(w1)}}}`;
  const show = rand() < 0.55; // not every edge carries a visible pulse, it reads better
  const d = `M${e.x1} ${e.y1.toFixed(1)}L${e.x2} ${e.y2.toFixed(1)}`;
  const dr = `M${e.x2} ${e.y2.toFixed(1)}L${e.x1} ${e.y1.toFixed(1)}`;
  return (
    `<path class="w${k}" d="${d}"/>` +
    (show ? `<path class="pf f${e.li}" d="${d}" style="--len:${len}"/><path class="pb b${e.li}" d="${dr}" style="--len:${len}"/>` : '')
  );
});

for (let li = 0; li < 3; li++) {
  const [f0, f1] = fwd(li), [b0, b1] = bwd(li);
  css += `.f${li}{animation:f${li} ${LOOP}s linear infinite}@keyframes f${li}{0%,${f0}%{stroke-dashoffset:var(--len);opacity:0}${f0 + 1}%{opacity:1}${f1}%{stroke-dashoffset:0;opacity:1}${f1 + 3}%,100%{stroke-dashoffset:0;opacity:0}}`;
  css += `.b${li}{animation:b${li} ${LOOP}s linear infinite}@keyframes b${li}{0%,${b0}%{stroke-dashoffset:var(--len);opacity:0}${b0 + 1}%{opacity:1}${b1}%{stroke-dashoffset:0;opacity:1}${b1 + 3}%,100%{stroke-dashoffset:0;opacity:0}}`;
}

// Nodes light up when the forward pass reaches their layer, with their own activation level.
const nodeSvg = layers.map((l, li) => l.ys.map((y) => {
  const a = (0.35 + rand() * 0.65).toFixed(2);
  const t = li === 0 ? 4 : fwd(li - 1)[1];
  const name = `n${li}_${Math.round(y)}`;
  css += `.${name}{animation:${name} ${LOOP}s ease-out infinite}@keyframes ${name}{0%,${t}%{opacity:0}${t + 3}%{opacity:${a}}${Math.min(t + 26, 88)}%{opacity:${a}}${Math.min(t + 34, 94)}%,100%{opacity:0}}`;
  const r = li === layers.length - 1 ? 7.5 : 5.5;
  return `<circle class="node" cx="${l.x}" cy="${y.toFixed(1)}" r="${r}"/><circle class="act ${name}" cx="${l.x}" cy="${y.toFixed(1)}" r="${(r - 2.2).toFixed(1)}"/>`;
}).join('')).join('');

const labels =
  layers[0].ys.map((y, i) => `<text x="${layers[0].x - 12}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${layers[0].labels[i]}</text>`).join('') +
  `<text x="${layers[3].x + 14}" y="${(layers[3].ys[0] + 3.5).toFixed(1)}">${layers[3].labels[0]}</text>`;

// Loss over the epochs shown, and the epoch counter (one epoch per loop is too slow to read,
// so the counter cycles through a few values while the curve draws).
const loss = [];
for (let e = 0; e <= 40; e++) loss.push([548 + e * 5.6, 232 - (0.1 + 0.85 * Math.exp(-e / 7) + (rand() - 0.5) * 0.04) * 22]);
const lossPath = 'M' + loss.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">Mohamed Rayen Sansa — AI · Full-stack · IoT Engineering Student</title>
  <desc id="desc">My name, and beside it a small neural network training live: a forward pass lights the layers from the inputs (age, goals, minutes, club) to the output (market value), backpropagation runs back, and the weights change while the loss falls.</desc>
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

    .net path { fill: none; stroke-linecap: round; }
    .pf { stroke: #9cc3ff; stroke-width: 1.8; stroke-dasharray: 7 var(--len); stroke-dashoffset: var(--len); opacity: 0; }
    .pb { stroke: #ffb37a; stroke-width: 1.6; stroke-dasharray: 7 var(--len); stroke-dashoffset: var(--len); opacity: 0; }
    .node { fill: #141a21; stroke: #46566a; stroke-width: 1.2; }
    .act { fill: #9cc3ff; opacity: 0; }
    .phase { opacity: 0; }
    .ph-f { animation: phf ${LOOP}s linear infinite; }
    .ph-b { animation: phb ${LOOP}s linear infinite; }
    .ph-u { animation: phu ${LOOP}s linear infinite; }
    @keyframes phf { 0%, 4% { opacity: 0 } 6%, 46% { opacity: 1 } 50%, 100% { opacity: 0 } }
    @keyframes phb { 0%, 50% { opacity: 0 } 52%, 86% { opacity: 1 } 88%, 100% { opacity: 0 } }
    @keyframes phu { 0%, 87% { opacity: 0 } 89%, 99% { opacity: 1 } 100% { opacity: 0 } }
    .loss { fill: none; stroke: #7fd1a8; stroke-width: 1.5; stroke-dasharray: 300; animation: loss ${LOOP * 4}s linear infinite; }
    @keyframes loss { 0% { stroke-dashoffset: 300 } 90% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: 0 } }
    .ep { animation: ep ${LOOP * 4}s steps(1, end) infinite; }
    @keyframes ep { 0% { transform: translateY(0) } 25% { transform: translateY(-14px) } 50% { transform: translateY(-28px) } 75% { transform: translateY(-42px) } 100% { transform: translateY(0) } }
    ${css}
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
      .in, .act { opacity: 1 !important; } .typed { width: 292px; } .pf, .pb, .phase { opacity: 0 !important; } .loss { stroke-dashoffset: 0; }
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
    <clipPath id="epclip"><rect x="596" y="210" width="30" height="14"/></clipPath>
  </defs>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="url(#grid)"/>
  <circle cx="30" cy="28" r="5.5" fill="#ff5f57"/>
  <circle cx="48" cy="28" r="5.5" fill="#febc2e"/>
  <circle cx="66" cy="28" r="5.5" fill="#28c840"/>

  <!-- Left: prompt, name, role, tagline -->
  <text class="mono in d1" x="48" y="72" font-size="15" fill="#9aa4ae">~/rayen <tspan fill="#7fd1a8">$</tspan> <tspan fill="#d7dde3">python train.py</tspan></text>
  <text class="sans in d2" x="46" y="122" font-size="42" font-weight="700" fill="#f1efe9" letter-spacing="-.5">Mohamed Rayen Sansa</text>
  <g clip-path="url(#typeclip)"><text class="mono" x="48" y="160" font-size="16" fill="#d7dde3">AI · Full-stack · IoT Engineer</text></g>
  <rect class="cursor" x="342" y="146" width="9" height="17" fill="#8db3f3"/>
  <text class="mono in d6" x="48" y="198" font-size="13" fill="#8db3f3">ESPRIT engineering student · PFE from Feb 2027</text>
  <text class="mono in d7" x="48" y="226" font-size="12" fill="#6b7682">mohamedrayensansa.me</text>

  <!-- Right: the network -->
  <rect x="512" y="22" width="364" height="226" rx="12" fill="#12161b" stroke="#2a3038"/>
  <text class="mono" x="528" y="42" font-size="10.5" fill="#6b7682">model.fit(X, y)</text>
  <g class="mono" font-size="10.5" text-anchor="end">
    <text class="phase ph-f" x="860" y="42" fill="#9cc3ff">→ forward pass</text>
    <text class="phase ph-b" x="860" y="42" fill="#ffb37a">← backprop</text>
    <text class="phase ph-u" x="860" y="42" fill="#7fd1a8">update weights</text>
  </g>
  <g class="net">${edgeSvg.join('')}</g>
  <g>${nodeSvg}</g>
  <g class="mono" font-size="10" fill="#9aa4ae">${labels}</g>

  <!-- epoch counter and loss -->
  <line x1="528" y1="202" x2="860" y2="202" stroke="#22292f"/>
  <text class="mono" x="528" y="221" font-size="10.5" fill="#6b7682">epoch</text>
  <g clip-path="url(#epclip)"><g class="ep mono" font-size="10.5" fill="#f1efe9">
    <text x="598" y="221">12</text><text x="598" y="235">24</text><text x="598" y="249">37</text><text x="598" y="263">50</text>
  </g></g>
  <text class="mono" x="528" y="238" font-size="10.5" fill="#6b7682">loss</text>
  <path class="loss" d="${lossPath}" transform="translate(84 0)"/>
</svg>
`;

fs.writeFileSync(new URL('../assets/header.svg', import.meta.url), svg);
console.log(`header.svg: ${edges.length} weights, ${(svg.length / 1024).toFixed(0)} KB`);
