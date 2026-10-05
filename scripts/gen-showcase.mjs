// Animated, clickable showcase pieces for the profile README:
//   assets/stack.svg          the tech stack, icons popping in then floating
//   assets/projects/<id>.svg  project cards with icons (replaces gen-cards output)
// Icons come from skillicons.dev at build time and are embedded in the SVGs
// (GitHub README images cannot load external resources from inside an SVG).
//
// Usage (from this folder): node scripts/gen-showcase.mjs
import fs from 'node:fs';

const MONO = `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"`;
const SANS = `font-family="'Segoe UI', Inter, Helvetica, Arial, sans-serif"`;
const BG = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#15191e"/><stop offset="1" stop-color="#0e1115"/></linearGradient>`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const out = (name, svg) => {
  const url = new URL(`../assets/${name}`, import.meta.url);
  fs.mkdirSync(new URL('.', url), { recursive: true });
  fs.writeFileSync(url, svg);
  console.log(`${name}: ${(svg.length / 1024).toFixed(1)} KB`);
};

const cache = {};
const icon = async (id) => {
  if (!cache[id]) {
    const svg = await (await fetch(`https://skillicons.dev/icons?i=${id}`)).text();
    cache[id] = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  return cache[id];
};

// ── Tech stack ───────────────────────────────────────────────────────────────────
const groups = [
  ['AI & ML', '#39d353', ['py', 'tensorflow', 'pytorch', 'sklearn', 'opencv']],
  ['DEVELOPMENT', '#8db3f3', ['fastapi', 'flask', 'nodejs', 'express', 'angular', 'react', 'symfony', 'php', 'java', 'kotlin', 'flutter', 'cpp']],
  ['DATA & TOOLS', '#bc8cff', ['mongodb', 'mysql', 'sqlite', 'firebase', 'docker', 'git', 'github', 'linux']],
  ['IOT', '#d29922', ['arduino', 'raspberrypi']],
];
const extra = { 'AI & ML': 'LangChain · LangGraph · RAG · LightGBM · XGBoost · YOLO · Gemini · MLflow · SHAP', IOT: 'ESP32 · MQTT · Node-RED' };
const T = 54, GAP = 12, X0 = 190;
let y = 56, n = 0, body = '';
for (const [label, color, ids] of groups) {
  body += `<text x="28" y="${y + 32}" ${MONO} font-size="11.5" fill="${color}">${esc(label)}</text>`;
  for (let i = 0; i < ids.length; i++) {
    const x = X0 + i * (T + GAP), d = (n++ * 0.07).toFixed(2);
    body += `<g transform="translate(${x} ${y})"><g class="pop" style="animation-delay:${d}s"><g class="float" style="animation-delay:${(n % 5) * 0.4}s"><image href="${await icon(ids[i])}" width="${T}" height="${T}"/></g></g></g>`;
  }
  if (extra[label]) body += `<text x="${X0}" y="${y + T + 18}" ${MONO} font-size="11" fill="#7d8590">${esc(extra[label])}</text>`;
  y += T + (extra[label] ? 36 : 22);
}
const H = y + 18;
out('stack.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${H}" viewBox="0 0 900 ${H}" role="img" aria-label="Tech stack: ${esc(groups.flatMap((g) => g[2]).join(', '))}">
  <style>
    .pop { opacity: 0; transform-box: fill-box; transform-origin: center; animation: pop .55s cubic-bezier(.2,1.4,.4,1) forwards; }
    @keyframes pop { from { opacity: 0; transform: scale(.2) translateY(14px) } to { opacity: 1; transform: none } }
    .float { animation: float 3.4s ease-in-out infinite; }
    @keyframes float { 50% { transform: translateY(-4px) } }
    @media (prefers-reduced-motion: reduce) { .pop { animation: none; opacity: 1 } .float { animation: none } }
  </style>
  <defs>${BG}</defs>
  <rect x="1" y="1" width="898" height="${H - 2}" rx="16" fill="url(#bg)" stroke="#2a3038"/>
  <text x="28" y="34" ${MONO} font-size="12" fill="#39d353">TECH STACK</text>
  <text x="122" y="34" ${MONO} font-size="12" fill="#7d8590">· click to see the projects</text>
  ${body}
</svg>
`);

// ── Project cards ────────────────────────────────────────────────────────────────
const projects = [
  { id: 'sagemcom', title: 'Industrial Data Analytics Platform', tag: 'Internship · Sagemcom', accent: '#8db3f3',
    line: ['Anomaly detection, risk prediction and a', 'multi-agent assistant over industrial data.'], icons: ['py', 'fastapi', 'react', 'docker'] },
  { id: 'sofrecom', title: 'RAG Low-code UI Generator', tag: 'Internship · Sofrecom', accent: '#bc8cff',
    line: ['A RAG system that turns a request written', 'in plain language into a GrapesJS interface.'], icons: ['py', 'flask', 'react', 'docker'] },
  { id: 'footballanalysis', title: 'FootBallAnalysis', tag: 'Academic · live model in the browser', accent: '#39d353',
    line: ['Player market value estimation from', 'Transfermarkt data — R² 0.74 on test.'], icons: ['py', 'sklearn', 'fastapi', 'react'] },
  { id: 'noorcity', title: 'NoorCity', tag: 'Academic · computer vision + IoT', accent: '#d29922',
    line: ['Smart street lighting: YOLO traffic', 'detection and real-time sensors.'], icons: ['py', 'opencv', 'arduino', 'symfony'] },
  { id: 'agrismart', title: 'AgriSmart', tag: 'Academic · with INNOVUP', accent: '#3fb950',
    line: ['Plant disease detection and advice', 'for farmers, on mobile and in the field.'], icons: ['pytorch', 'flutter', 'arduino', 'firebase'] },
  { id: 'neurahome', title: 'NeuraHome', tag: 'Academic · presented at Wajahni', accent: '#f778ba',
    line: ['A smart home driven by a natural-language', 'voice assistant and live dashboards.'], icons: ['py', 'nodejs', 'raspberrypi', 'mongodb'] },
];
for (const [pi, p] of projects.entries()) {
  let tiles = '';
  for (const [i, id] of p.icons.entries()) {
    tiles += `<g transform="translate(${24 + i * 40} 112)"><g class="pop" style="animation-delay:${(0.5 + i * 0.12 + pi * 0.05).toFixed(2)}s"><g class="float" style="animation-delay:${i * 0.35}s"><image href="${await icon(id)}" width="32" height="32"/></g></g></g>`;
  }
  out(`projects/${p.id}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="160" viewBox="0 0 440 160" role="img" aria-label="${esc(p.title)} — ${esc(p.line.join(' '))}">
  <style>
    .card { opacity: 0; animation: rise .7s ease-out ${(pi * 0.1).toFixed(1)}s forwards; }
    @keyframes rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
    .glow { animation: glow 3s ease-in-out infinite; }
    @keyframes glow { 50% { opacity: .35 } }
    .go { animation: go 1.8s ease-in-out infinite; }
    @keyframes go { 50% { transform: translate(3px, -3px) } }
    .pop { opacity: 0; transform-box: fill-box; transform-origin: center; animation: pop .5s cubic-bezier(.2,1.4,.4,1) forwards; }
    @keyframes pop { from { opacity: 0; transform: scale(.2) } to { opacity: 1; transform: none } }
    .float { animation: float 3s ease-in-out infinite; }
    @keyframes float { 50% { transform: translateY(-3px) } }
    @media (prefers-reduced-motion: reduce) { .card, .pop { animation: none; opacity: 1 } .glow, .go, .float { animation: none } }
  </style>
  <defs>${BG}</defs>
  <g class="card">
  <rect x="1" y="1" width="438" height="158" rx="14" fill="url(#bg)" stroke="#2a3038"/>
  <rect class="glow" x="1" y="1" width="4" height="158" rx="2" fill="${p.accent}"/>
  <text x="24" y="30" ${MONO} font-size="10.5" fill="${p.accent}">${esc(p.tag.toUpperCase())}</text>
  <text x="24" y="58" ${SANS} font-size="19" font-weight="700" fill="#e6edf3">${esc(p.title)}</text>
  <text ${SANS} font-size="12.5" fill="#9aa4ae"><tspan x="24" y="84">${esc(p.line[0])}</tspan><tspan x="24" y="102">${esc(p.line[1])}</tspan></text>
  ${tiles}
  <text x="416" y="140" ${MONO} font-size="10" fill="#7d8590" text-anchor="end">view on portfolio</text>
  <g class="go"><path d="M408 26l8-8M410 18h6v6" fill="none" stroke="#7d8590" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>
  </g>
</svg>
`);
}
