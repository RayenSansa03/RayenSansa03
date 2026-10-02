// Generates the custom pieces of the profile README, in the banner's style:
//   assets/portfolio.svg      the "visit my portfolio" button (soft scanning light)
//   assets/model-card.svg     "About me" as an ML model card, lines typing in
//   assets/projects/<id>.svg  one clickable card per featured project
// GitHub README pages accept no CSS, so the design lives in these SVGs.
//
// Usage (from this folder): node scripts/gen-cards.mjs
import fs from 'node:fs';

const out = (name, svg) => {
  const url = new URL(`../assets/${name}`, import.meta.url);
  fs.mkdirSync(new URL('.', url), { recursive: true });
  fs.writeFileSync(url, svg);
  console.log(`${name}: ${(svg.length / 1024).toFixed(1)} KB`);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const MONO = `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"`;
const SANS = `font-family="'Segoe UI', Inter, Helvetica, Arial, sans-serif"`;
const BG = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15191e"/><stop offset="1" stop-color="#0e1115"/></linearGradient>`;

// ── Portfolio button ─────────────────────────────────────────────────────────────
out('portfolio.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="64" viewBox="0 0 460 64" role="img" aria-label="Visit my portfolio: mohamedrayensansa.me">
  <style>
    .scan { animation: scan 3.2s ease-in-out infinite; }
    @keyframes scan { 0% { transform: translateX(-160px) } 60%, 100% { transform: translateX(520px) } }
    .arrow { animation: nudge 1.6s ease-in-out infinite; }
    @keyframes nudge { 50% { transform: translateX(4px) } }
    .dot { animation: pulse 1.6s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .3 } }
    @media (prefers-reduced-motion: reduce) { .scan, .arrow, .dot { animation: none } .scan { display: none } }
  </style>
  <defs>${BG}
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#39d353" stop-opacity="0"/><stop offset=".5" stop-color="#39d353" stop-opacity=".22"/><stop offset="1" stop-color="#39d353" stop-opacity="0"/></linearGradient>
    <clipPath id="pill"><rect x="1" y="1" width="458" height="62" rx="31"/></clipPath>
  </defs>
  <rect x="1" y="1" width="458" height="62" rx="31" fill="url(#bg)" stroke="#2ea043" stroke-width="1.5"/>
  <g clip-path="url(#pill)"><rect class="scan" x="0" y="0" width="140" height="64" fill="url(#shine)"/></g>
  <circle class="dot" cx="34" cy="32" r="5" fill="#39d353"/>
  <text x="52" y="27" ${MONO} font-size="11" fill="#7d8590">VISIT MY PORTFOLIO</text>
  <text x="52" y="46" ${SANS} font-size="18" font-weight="700" fill="#e6edf3">mohamedrayensansa.me</text>
  <g class="arrow"><circle cx="420" cy="32" r="17" fill="#238636"/><path d="M413 32h13M421 26l6 6-6 6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>
`);

// ── Model card ───────────────────────────────────────────────────────────────────
const fields = [
  ['model', 'rayen-sansa', '#e6edf3'],
  ['task', 'AI & Machine Learning engineering', '#e6edf3'],
  ['training data', 'ESPRIT engineering cycle · 4 internships', '#e6edf3'],
  ['', 'Sagemcom · Sofrecom · Inveep · Poulina Group', '#7d8590'],
  ['fine-tuned on', 'RAG · LLM agents · ML pipelines · computer vision', '#8db3f3'],
  ['also runs on', 'full-stack web · mobile · IoT', '#e6edf3'],
  ['evaluation', '10 projects documented → mohamedrayensansa.me', '#39d353'],
  ['intended use', 'end-of-studies (PFE) internship · from Feb 2027', '#e6edf3'],
  ['languages', 'Arabic · French · English', '#e6edf3'],
  ['limitations', 'still learning MLOps at scale — and enjoying it', '#d29922'],
];
const rows = fields.map(([k, v, c], i) => {
  const y = 66 + i * 21, d = (0.25 + i * 0.18).toFixed(2);
  return `<g class="row" style="animation-delay:${d}s"><text x="28" y="${y}" fill="#7d8590">${esc(k)}</text><text x="170" y="${y}" fill="${c}">${esc(v)}</text></g>`;
}).join('\n    ');
out('model-card.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="290" viewBox="0 0 900 290" role="img" aria-labelledby="t d">
  <title id="t">About me, as a machine-learning model card</title>
  <desc id="d">${esc(fields.map(([k, v]) => `${k}: ${v}`).join('. '))}</desc>
  <style>
    .row { opacity: 0; animation: row .5s ease-out forwards; }
    @keyframes row { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
    .caret { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) { .row { animation: none; opacity: 1 } .caret { animation: none } }
  </style>
  <defs>${BG}</defs>
  <rect x="1" y="1" width="898" height="288" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <text x="28" y="34" ${MONO} font-size="12" fill="#39d353">MODEL CARD</text>
  <text x="122" y="34" ${MONO} font-size="12" fill="#7d8590">· about me</text>
  <rect x="790" y="20" width="84" height="22" rx="11" fill="none" stroke="#2ea043"/>
  <text x="832" y="35" ${MONO} font-size="11" fill="#39d353" text-anchor="middle">v2026</text>
  <line x1="28" y1="46" x2="872" y2="46" stroke="#21262d"/>
  <g ${MONO} font-size="13">
    ${rows}
  </g>
  <rect class="caret" x="28" y="${66 + fields.length * 21 - 12}" width="8" height="15" fill="#8db3f3"/>
</svg>
`);

// ── Project cards ────────────────────────────────────────────────────────────────
const projects = [
  { id: 'sagemcom', title: 'Industrial Data Analytics Platform', tag: 'Internship · Sagemcom', accent: '#8db3f3',
    line: ['Anomaly detection, risk prediction and a', 'multi-agent assistant over industrial data.'], stack: ['LightGBM', 'LangGraph', 'FastAPI', 'React'] },
  { id: 'sofrecom', title: 'RAG Low-code UI Generator', tag: 'Internship · Sofrecom', accent: '#bc8cff',
    line: ['A RAG system that turns a request written', 'in plain language into a GrapesJS interface.'], stack: ['RAG', 'Vertex AI', 'Gemini', 'Flask'] },
  { id: 'footballanalysis', title: 'FootBallAnalysis', tag: 'Academic · live model in the browser', accent: '#39d353',
    line: ['Player market value estimation from', 'Transfermarkt data — R² 0.74 on test.'], stack: ['scikit-learn', 'LightGBM', 'FastAPI'] },
  { id: 'noorcity', title: 'NoorCity', tag: 'Academic · computer vision + IoT', accent: '#d29922',
    line: ['Smart street lighting: YOLO traffic', 'detection and real-time sensors.'], stack: ['YOLO', 'OpenCV', 'ESP32', 'Symfony'] },
  { id: 'agrismart', title: 'AgriSmart', tag: 'Academic · with INNOVUP', accent: '#3fb950',
    line: ['Plant disease detection and advice', 'for farmers, on mobile and in the field.'], stack: ['PyTorch', 'LangGraph', 'Flutter', 'ESP32'] },
  { id: 'neurahome', title: 'NeuraHome', tag: 'Academic · presented at Wajahni', accent: '#f778ba',
    line: ['A smart home driven by a natural-language', 'voice assistant and live dashboards.'], stack: ['Python', 'Node-RED', 'MQTT', 'ThingsBoard'] },
];
for (const p of projects) {
  let x = 24;
  const chips = p.stack.map((s) => {
    const w = s.length * 7 + 16, chip = `<rect x="${x}" y="122" width="${w}" height="20" rx="10" fill="none" stroke="#30363d"/><text x="${x + w / 2}" y="136" text-anchor="middle">${esc(s)}</text>`;
    x += w + 6;
    return chip;
  }).join('');
  out(`projects/${p.id}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="160" viewBox="0 0 440 160" role="img" aria-label="${esc(p.title)} — ${esc(p.line.join(' '))}">
  <style>
    .glow { animation: glow 3s ease-in-out infinite; }
    @keyframes glow { 50% { opacity: .35 } }
    .go { animation: go 1.8s ease-in-out infinite; }
    @keyframes go { 50% { transform: translate(3px, -3px) } }
    @media (prefers-reduced-motion: reduce) { .glow, .go { animation: none } }
  </style>
  <defs>${BG}</defs>
  <rect x="1" y="1" width="438" height="158" rx="14" fill="url(#bg)" stroke="#2a3038"/>
  <rect class="glow" x="1" y="1" width="4" height="158" rx="2" fill="${p.accent}"/>
  <text x="24" y="30" ${MONO} font-size="10.5" fill="${p.accent}">${esc(p.tag.toUpperCase())}</text>
  <text x="24" y="58" ${SANS} font-size="19" font-weight="700" fill="#e6edf3">${esc(p.title)}</text>
  <text ${SANS} font-size="12.5" fill="#9aa4ae"><tspan x="24" y="84">${esc(p.line[0])}</tspan><tspan x="24" y="102">${esc(p.line[1])}</tspan></text>
  <g ${MONO} font-size="10.5" fill="#c9d1d9">${chips}</g>
  <g class="go"><path d="M408 26l8-8M410 18h6v6" fill="none" stroke="#7d8590" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>
`);
}
