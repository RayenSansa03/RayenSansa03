// White, black-ink, hand-drawn style pieces for the profile README (same look as the banner):
//   assets/portfolio.svg      "visit my portfolio" button
//   assets/model-card.svg     "about me" as a model card
//   assets/stack.svg          tech stack, icons popping in then floating
//   assets/projects/<id>.svg  project cards with icons
// Icons come from skillicons.dev at build time and are embedded in the SVGs
// (GitHub README images cannot load external resources from inside an SVG).
//
// Usage (from this folder): node scripts/gen-showcase.mjs
import fs from 'node:fs';

const FONT = `font-family="Poppins, 'Segoe UI', Inter, Helvetica, Arial, sans-serif"`;
const MONO = `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"`;
const INK = '#111', GREY = '#555';
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
    const svg = await (await fetch(`https://skillicons.dev/icons?i=${id}&theme=light`)).text();
    cache[id] = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  return cache[id];
};

// Hand-drawn doodles: a star drawn twice with a slight wobble, plus sparkle dashes.
const starPath = (cx, cy, r, rot = 0, wob = 0) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2, rr = (i % 2 ? r * 0.45 : r) + (i % 3) * wob;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};
const star = (cx, cy, r, delay = 0) => `<g class="twinkle" style="animation-delay:${delay}s"><path d="${starPath(cx, cy, r)}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="${starPath(cx + 1.5, cy + 1, r, 0.12, 1.2)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
const sparks = (cx, cy, r) => [-2.4, -1.5, 0.3].map((a) => `<path d="M${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}l${(Math.cos(a) * 9).toFixed(1)} ${(Math.sin(a) * 9).toFixed(1)}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`).join('');

const BASE_CSS = `
    .pop { opacity: 0; transform-box: fill-box; transform-origin: center; animation: pop .55s cubic-bezier(.2,1.4,.4,1) forwards; }
    @keyframes pop { from { opacity: 0; transform: scale(.2) translateY(14px) } to { opacity: 1; transform: none } }
    .float { animation: float 3.4s ease-in-out infinite; }
    @keyframes float { 50% { transform: translateY(-4px) } }
    .twinkle { transform-box: fill-box; transform-origin: center; animation: twinkle 2.6s ease-in-out infinite; }
    @keyframes twinkle { 50% { transform: scale(1.18) rotate(8deg) } }
    .row { opacity: 0; animation: row .5s ease-out forwards; }
    @keyframes row { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
    .rise { opacity: 0; animation: rise .7s ease-out forwards; }
    @keyframes rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
    .go { animation: go 1.8s ease-in-out infinite; }
    @keyframes go { 50% { transform: translate(3px, -3px) } }
    .scan { animation: scan 3.2s ease-in-out infinite; }
    @keyframes scan { 0% { transform: translateX(-160px) } 60%, 100% { transform: translateX(520px) } }
    .arrow { animation: nudge 1.6s ease-in-out infinite; }
    @keyframes nudge { 50% { transform: translateX(4px) } }
    .caret { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) { .pop, .row, .rise { animation: none; opacity: 1 } .float, .twinkle, .go, .arrow, .caret { animation: none } .scan { display: none } }`;
const frame = (w, h, rx = 18) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${rx}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`;
const svg = (w, h, label, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
  <style>${BASE_CSS}
  </style>
  ${inner}
</svg>
`;

// ── Portfolio button ─────────────────────────────────────────────────────────────
out('portfolio.svg', svg(460, 64, 'Visit my portfolio: mohamedrayensansa.me', `
  <defs>
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <clipPath id="pill"><rect x="2" y="2" width="456" height="60" rx="30"/></clipPath>
  </defs>
  <rect x="2" y="2" width="456" height="60" rx="30" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
  <g clip-path="url(#pill)"><rect class="scan" x="0" y="0" width="140" height="64" fill="url(#shine)"/></g>
  ${star(34, 32, 10)}
  <text x="58" y="27" ${FONT} font-size="11" font-weight="600" letter-spacing="2" fill="${GREY}">VISIT MY PORTFOLIO</text>
  <text x="58" y="47" ${FONT} font-size="18" font-weight="800" fill="${INK}">mohamedrayensansa.me</text>
  <g class="arrow"><circle cx="420" cy="32" r="17" fill="${INK}"/><path d="M413 32h13M421 26l6 6-6 6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`));

// ── Model card ───────────────────────────────────────────────────────────────────
const fields = [
  ['model', 'rayen-sansa'],
  ['task', 'AI & Machine Learning engineering'],
  ['training data', 'ESPRIT engineering cycle · 4 internships'],
  ['', 'Sagemcom · Sofrecom · Inveep · Poulina Group'],
  ['fine-tuned on', 'RAG · LLM agents · ML pipelines · computer vision'],
  ['also runs on', 'full-stack web · mobile · IoT'],
  ['evaluation', '10 projects documented → mohamedrayensansa.me'],
  ['intended use', 'end-of-studies (PFE) internship · from Feb 2027'],
  ['languages', 'Arabic · French · English'],
  ['limitations', 'still learning MLOps at scale — and enjoying it'],
];
const rows = fields.map(([k, v], i) => {
  const y = 92 + i * 22;
  return `<g class="row" style="animation-delay:${(0.25 + i * 0.18).toFixed(2)}s"><text x="32" y="${y}" fill="${GREY}">${esc(k)}</text><text x="180" y="${y}" fill="${INK}" font-weight="600">${esc(v)}</text></g>`;
}).join('\n    ');
out('model-card.svg', svg(900, 330, 'About me, as a machine-learning model card: ' + fields.map(([k, v]) => `${k}: ${v}`).join('. '), `
  ${frame(900, 330)}
  <text x="32" y="46" ${FONT} font-size="15" font-weight="800" letter-spacing="2" fill="${INK}">MODEL CARD</text>
  <text x="160" y="46" ${FONT} font-size="13" fill="${GREY}">· about me</text>
  ${star(846, 40, 14, 0.4)}
  <line x1="32" y1="62" x2="868" y2="62" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round"/>
  <g ${MONO} font-size="13">
    ${rows}
  </g>
  <rect class="caret" x="32" y="${92 + fields.length * 22 - 12}" width="8" height="15" fill="${INK}"/>`));

// ── Tech stack ───────────────────────────────────────────────────────────────────
const groups = [
  ['AI & ML', ['py', 'tensorflow', 'pytorch', 'sklearn', 'opencv']],
  ['DEVELOPMENT', ['fastapi', 'flask', 'nodejs', 'express', 'angular', 'react', 'symfony', 'php', 'java', 'kotlin', 'flutter', 'cpp']],
  ['DATA & TOOLS', ['mongodb', 'mysql', 'sqlite', 'firebase', 'docker', 'git', 'github', 'linux']],
  ['IOT', ['arduino', 'raspberrypi']],
];
const extra = { 'AI & ML': 'LangChain · LangGraph · RAG · LightGBM · XGBoost · YOLO · Gemini · MLflow · SHAP', IOT: 'ESP32 · MQTT · Node-RED' };
const T = 54, GAP = 12, X0 = 190;
let y = 78, n = 0, body = '';
for (const [label, ids] of groups) {
  body += `<text x="32" y="${y + 33}" ${FONT} font-size="12" font-weight="700" letter-spacing="2" fill="${INK}">${esc(label)}</text>`;
  const PER = 9, lines = Math.ceil(ids.length / PER);
  for (let i = 0; i < ids.length; i++) {
    const x = X0 + (i % PER) * (T + GAP), yy = y + Math.floor(i / PER) * (T + GAP), d = (n++ * 0.07).toFixed(2);
    body += `<g transform="translate(${x} ${yy})"><g class="pop" style="animation-delay:${d}s"><g class="float" style="animation-delay:${(n % 5) * 0.4}s"><image href="${await icon(ids[i])}" width="${T}" height="${T}"/></g></g></g>`;
  }
  const extraH = (lines - 1) * (T + GAP);
  if (extra[label]) body += `<text x="${X0}" y="${y + extraH + T + 18}" ${MONO} font-size="11.5" fill="${GREY}">${esc(extra[label])}</text>`;
  y += extraH + T + (extra[label] ? 38 : 24);
}
const H = y + 14;
out('stack.svg', svg(900, H, 'Tech stack: ' + groups.flatMap((g) => g[1]).join(', '), `
  ${frame(900, H)}
  <text x="32" y="46" ${FONT} font-size="15" font-weight="800" letter-spacing="2" fill="${INK}">TECH STACK</text>
  <text x="160" y="46" ${FONT} font-size="13" fill="${GREY}">· click to see the projects</text>
  ${star(846, 40, 14, 0.3)}${star(812, 62, 7, 1)}
  <line x1="32" y1="62" x2="780" y2="62" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 6" stroke-linecap="round"/>
  ${body}`));

// ── Project cards ────────────────────────────────────────────────────────────────
const projects = [
  { id: 'sagemcom', title: 'Industrial Data Analytics Platform', tag: 'Internship · Sagemcom',
    line: ['Anomaly detection, risk prediction and a', 'multi-agent assistant over industrial data.'], icons: ['py', 'fastapi', 'react', 'docker'] },
  { id: 'sofrecom', title: 'RAG Low-code UI Generator', tag: 'Internship · Sofrecom',
    line: ['A RAG system that turns a request written', 'in plain language into a GrapesJS interface.'], icons: ['py', 'flask', 'react', 'docker'] },
  { id: 'footballanalysis', title: 'FootBallAnalysis', tag: 'Academic · live model in the browser',
    line: ['Player market value estimation from', 'Transfermarkt data — R² 0.74 on test.'], icons: ['py', 'sklearn', 'fastapi', 'react'] },
  { id: 'noorcity', title: 'NoorCity', tag: 'Academic · computer vision + IoT',
    line: ['Smart street lighting: YOLO traffic', 'detection and real-time sensors.'], icons: ['py', 'opencv', 'arduino', 'symfony'] },
  { id: 'agrismart', title: 'AgriSmart', tag: 'Academic · with INNOVUP',
    line: ['Plant disease detection and advice', 'for farmers, on mobile and in the field.'], icons: ['pytorch', 'flutter', 'arduino', 'firebase'] },
  { id: 'neurahome', title: 'NeuraHome', tag: 'Academic · presented at Wajahni',
    line: ['A smart home driven by a natural-language', 'voice assistant and live dashboards.'], icons: ['py', 'nodejs', 'raspberrypi', 'mongodb'] },
];
for (const [pi, p] of projects.entries()) {
  let tiles = '';
  for (const [i, id] of p.icons.entries()) {
    tiles += `<g transform="translate(${26 + i * 40} 114)"><g class="pop" style="animation-delay:${(0.5 + i * 0.12 + pi * 0.05).toFixed(2)}s"><g class="float" style="animation-delay:${i * 0.35}s"><image href="${await icon(id)}" width="32" height="32"/></g></g></g>`;
  }
  out(`projects/${p.id}.svg`, svg(440, 160, `${p.title} — ${p.line.join(' ')}`, `
  <g class="rise" style="animation-delay:${(pi * 0.1).toFixed(1)}s">
  ${frame(440, 160, 16)}
  <text x="26" y="32" ${FONT} font-size="10.5" font-weight="600" letter-spacing="1.5" fill="${GREY}">${esc(p.tag.toUpperCase())}</text>
  <text x="26" y="60" ${FONT} font-size="19" font-weight="800" fill="${INK}">${esc(p.title)}</text>
  <text ${FONT} font-size="12.5" fill="#333"><tspan x="26" y="84">${esc(p.line[0])}</tspan><tspan x="26" y="102">${esc(p.line[1])}</tspan></text>
  ${tiles}
  <text x="400" y="142" ${FONT} font-size="10.5" font-weight="600" fill="${GREY}" text-anchor="end">view on portfolio</text>
  <g class="go"><path d="M402 28l10-10M404 18h8v8" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
  ${star(414, 134, 9, pi * 0.3)}
  </g>`));
}
