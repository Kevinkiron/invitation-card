import { rng, pineBranch, berries, hollyLeaf, marigold, DEFS } from "@/components/greetings/Garland";

/* ══════════════════════════════════════════════════════════════════════
   FRAME BORDER — the decorated border all the way round each inside page
   of the card book (components/greetings/CardBook.js).

   Three kinds, chosen by the occasion's garland in
   lib/greetings/card-themes.js:

   pine      Christmas: pine boughs along every edge with red berries,
             holly, glass baubles and pinecones gathered at the corners,
             and a string of warm fairy lights that twinkle
   marigold  Diwali / Onam / Pongal: a marigold chain with mango leaves
             and a big bloom at each corner
   floral    everything else: a climbing vine with leaves and flowers in
             the occasion's own colours

   Same rules as Garland.js: drawn from fixed numbers and a seeded random
   generator so server and browser agree, never anything user-written in
   the markup, built once per theme and cached. The page is always
   3 : 4.3, so the frame is drawn on a 300 × 430 grid that matches it
   exactly.
   ══════════════════════════════════════════════════════════════════════ */

const W = 300, H = 430;
const rad = (d) => (d * Math.PI) / 180;
const f = (n) => n.toFixed(1);

const FRAME_DEFS = `<defs>
 <radialGradient id="cb-bred" cx="35%" cy="30%"><stop offset="0%" stop-color="#ff8a80"/><stop offset="45%" stop-color="#c62828"/><stop offset="100%" stop-color="#5c0b12"/></radialGradient>
 <radialGradient id="cb-bgold" cx="35%" cy="30%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="45%" stop-color="#d4a73a"/><stop offset="100%" stop-color="#6e4b10"/></radialGradient>
 <radialGradient id="cb-cone" cx="40%" cy="35%"><stop offset="0%" stop-color="#a0703f"/><stop offset="100%" stop-color="#4a2c14"/></radialGradient>
 <radialGradient id="cb-glow"><stop offset="0%" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="100%" stop-color="#ffd56b" stop-opacity="0"/></radialGradient>
</defs>`;

/* Points along the four edges, each with the direction of travel along
   that edge (d) — the inward normal is always d + 90. */
function edgePoints(step, inset = 0) {
  const pts = [];
  for (let x = step * 0.8; x < W - step * 0.5; x += step) pts.push({ x, y: inset, d: 0 });
  for (let y = step * 0.8; y < H - step * 0.5; y += step) pts.push({ x: W - inset, y, d: 90 });
  for (let x = W - step * 0.8; x > step * 0.5; x -= step) pts.push({ x, y: H - inset, d: 180 });
  for (let y = H - step * 0.8; y > step * 0.5; y -= step) pts.push({ x: inset, y, d: 270 });
  return pts;
}
const CORNERS = [
  { x: 0, y: 0, a: 45 }, { x: W, y: 0, a: 135 }, { x: W, y: H, a: 225 }, { x: 0, y: H, a: 315 },
];
const inward = (p, k) => ({ x: p.x + Math.cos(rad(p.d + 90)) * k, y: p.y + Math.sin(rad(p.d + 90)) * k });

function bauble(x, y, r, grad, hang = 10) {
  return `<line x1="${f(x)}" y1="${f(y - r - hang)}" x2="${f(x)}" y2="${f(y - r)}" stroke="#b8963e" stroke-width=".8"/>`
    + `<rect x="${f(x - r * 0.32)}" y="${f(y - r - 2.6)}" width="${f(r * 0.64)}" height="3.2" rx=".8" fill="#c9a24a"/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#${grad})"/>`
    + `<ellipse cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.4)}" rx="${f(r * 0.32)}" ry="${f(r * 0.2)}" fill="#fff" opacity=".65" transform="rotate(-30 ${f(x - r * 0.35)} ${f(y - r * 0.4)})"/>`;
}

function pinecone(x, y, rot, s = 1) {
  let o = `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="0" rx="6.5" ry="10.5" fill="url(#cb-cone)"/>`;
  for (let row = -7; row <= 7; row += 3.4) {
    const w = 6.5 * Math.sqrt(1 - (row / 10.5) ** 2);
    o += `<path d="M${f(-w)} ${f(row)} Q0 ${f(row + 3)} ${f(w)} ${f(row)}" stroke="#2e1a0b" stroke-width=".8" fill="none" opacity=".7"/>`;
  }
  return o + `</g>`;
}

function framePine() {
  const r = rng(21);
  let boughs = "", decor = "", lights = "";

  // boughs along the edges
  edgePoints(46).forEach((p, i) => {
    const b = inward(p, -5);
    const len = 36 + r() * 12;
    let g = pineBranch(r, b.x, b.y, len, p.d + 12, 6, 0.85)
      + pineBranch(r, b.x, b.y, len * 0.9, p.d + 168, -6, 0.85)
      + pineBranch(r, b.x, b.y, 22 + r() * 8, p.d + 90 + (r() - 0.5) * 50, 4, 0.7);
    const bb = inward(p, 13);
    if (i % 2 === 0) g += berries(r, bb.x, bb.y, 3, 3.6);
    else if (i % 4 === 1) g += hollyLeaf(bb.x - 8, bb.y - 4, p.d + 60, 0.75) + berries(r, bb.x + 2, bb.y, 2, 3.4);
    boughs += `<g class="cb-sway" style="--d:${f((i % 7) * 0.6)}s">${g}</g>`;
    // a glass bauble on every third cluster
    if (i % 3 === 2) {
      const h = inward(p, 22);
      decor += `<g class="cb-swing" style="--d:${f((i % 5) * 0.7)}s">${bauble(h.x, h.y, 6.2, i % 2 ? "cb-bgold" : "cb-bred")}</g>`;
    }
  });

  // heavier clusters in the corners
  CORNERS.forEach((c, i) => {
    let g = "";
    for (const off of [-40, -14, 14, 40]) g += pineBranch(r, c.x, c.y, 52 + r() * 10, c.a + off, off / 6, 1);
    const ix = c.x + Math.cos(rad(c.a)) * 20, iy = c.y + Math.sin(rad(c.a)) * 20;
    g += hollyLeaf(ix - 6, iy - 6, c.a - 40, 1.05) + hollyLeaf(ix, iy, c.a + 30, 1);
    g += pinecone(ix + Math.cos(rad(c.a + 35)) * 10, iy + Math.sin(rad(c.a + 35)) * 10, c.a + 90, 1.1);
    g += pinecone(ix + Math.cos(rad(c.a - 35)) * 12, iy + Math.sin(rad(c.a - 35)) * 12, c.a + 60, 0.95);
    g += berries(r, ix + 4, iy + 2, 4, 4.2);
    g += bauble(ix + Math.cos(rad(c.a)) * 12, iy + Math.sin(rad(c.a)) * 12 + 6, 8, i % 2 ? "cb-bred" : "cb-bgold", 4);
    boughs += `<g class="cb-sway" style="--d:${i * 0.9}s">${g}</g>`;
  });

  // a string of fairy lights, just inside the boughs
  let wire = "", k = 0;
  for (const p of edgePoints(15, 18)) {
    const q = inward(p, Math.sin(k * 1.3) * 3);
    wire += `${wire ? "L" : "M"}${f(q.x)} ${f(q.y)} `;
    if (k % 2 === 0) {
      lights += `<circle class="cb-light" style="--d:${f((k * 0.37) % 2.4)}s" cx="${f(q.x)}" cy="${f(q.y)}" r="5.5" fill="url(#cb-glow)"/>`
        + `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="1.9" fill="#fff4cc"/>`;
    }
    k++;
  }
  const wirePath = `<path d="${wire}Z" stroke="#3b2a1a" stroke-width=".6" fill="none" opacity=".45"/>`;

  return DEFS + FRAME_DEFS + wirePath + boughs + decor + lights;
}

function frameMarigold() {
  const r = rng(13);
  let g = "";
  // marigold chain along every edge
  edgePoints(15, 7).forEach((p, i) => {
    if (i % 3 === 1) {
      const l = inward(p, 6);
      const a = p.d + 90 + (i % 2 ? 22 : -22);
      g += `<path transform="translate(${f(l.x)} ${f(l.y)}) rotate(${f(a - 90)})" d="M0 0 q-7 12 0 24 q7 -12 0 -24z" fill="#2e7d32" stroke="#1b5e20" stroke-width=".6"/>`;
    }
    g += marigold(r, p.x, p.y, 7, i % 2 ? "ic-mari" : "ic-mari2");
  });
  // a big bloom with a little bell at each corner
  CORNERS.forEach((c) => {
    const x = c.x + Math.cos(rad(c.a)) * 16, y = c.y + Math.sin(rad(c.a)) * 16;
    g += marigold(r, x, y, 13, "ic-mari") + marigold(r, x, y, 7, "ic-mari2");
    const bx = x + Math.cos(rad(c.a)) * 18, by = y + Math.sin(rad(c.a)) * 18;
    g += `<path d="M${f(bx)} ${f(by - 6)} q-6 2 -6 9 h12 q0 -7 -6 -9z" fill="#d4a73a" stroke="#8a6420" stroke-width=".6"/><circle cx="${f(bx)}" cy="${f(by + 4.5)}" r="1.6" fill="#8a6420"/>`;
  });
  return DEFS + `<g class="cb-sway" style="--d:0s">${g}</g>`;
}

function frameFloral(petals, leaf) {
  const r = rng(9);
  const flower = (x, y, s, c) => {
    let o = "";
    for (let k = 0; k < 5; k++) o += `<ellipse cx="${f(x)}" cy="${f(y - s)}" rx="${f(s * 0.62)}" ry="${f(s)}" fill="${c}" opacity=".92" transform="rotate(${f(k * 72 + r() * 10)} ${f(x)} ${f(y)})"/>`;
    return o + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.42)}" fill="#f6c453"/>`;
  };
  const leafAt = (x, y, rot, s) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s * 0.42)}" ry="${f(s * 1.25)}" fill="${leaf}" transform="rotate(${f(rot)} ${f(x)} ${f(y)})"/>`;

  let vine = "", g = "", k = 0;
  for (const p of edgePoints(12, 10)) {
    const q = inward(p, Math.sin(k * 0.9) * 4);
    vine += `${vine ? "L" : "M"}${f(q.x)} ${f(q.y)} `;
    g += leafAt(q.x, q.y, p.d + (k % 2 ? 50 : -50) + 90, 6.5);
    if (k % 4 === 2) g += flower(q.x, q.y, 6.5, petals[k % petals.length]);
    k++;
  }
  CORNERS.forEach((c, i) => {
    const x = c.x + Math.cos(rad(c.a)) * 18, y = c.y + Math.sin(rad(c.a)) * 18;
    g += leafAt(x - 10, y, c.a + 20, 11) + leafAt(x + 10, y, c.a - 20, 11);
    g += flower(x, y, 12, petals[i % petals.length]) + flower(x + Math.cos(rad(c.a + 60)) * 18, y + Math.sin(rad(c.a + 60)) * 18, 7.5, petals[(i + 1) % petals.length]);
  });
  return `<path d="${vine}Z" stroke="${leaf}" stroke-width="1.4" fill="none" opacity=".7"/><g class="cb-sway" style="--d:.4s">${g}</g>`;
}

/* The frame's own animation, carried inside the SVG so it keeps moving
   when the SVG is shown as an image (see FrameBorder below). */
const FRAME_STYLE = `<style>
.cb-sway{transform-box:fill-box;transform-origin:50% 0;animation:s 6s ease-in-out infinite;animation-delay:var(--d,0s)}
.cb-swing{transform-box:fill-box;transform-origin:50% 0;animation:w 4.5s ease-in-out infinite;animation-delay:var(--d,0s)}
.cb-light{animation:g 2.4s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes s{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
@keyframes w{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
@keyframes g{0%,100%{opacity:.35}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;

const cache = new Map();
function frameUri(theme) {
  const kind = theme.garland === "pine" ? "pine" : theme.garland === "marigold" ? "marigold" : "floral";
  const petals = theme.bunting || [theme.ink || "#c2185b", "#f6b93b", theme.panel || "#8f294e"];
  const key = kind === "floral" ? `floral|${petals.join()}|${theme.leaf}` : kind;
  if (!cache.has(key)) {
    const body = kind === "pine" ? framePine() : kind === "marigold" ? frameMarigold() : frameFloral(petals, theme.leaf || "#6b7f4a");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${FRAME_STYLE}${body}</svg>`
      // one decimal place is plenty at this size, and halves the markup
      .replace(/(\d\.\d)\d+/g, "$1")
      .replace(/\s{2,}/g, " ");
    // minimal escaping for a data URI: quotes swapped, only the
    // characters that would break it encoded
    const uri = svg.replace(/"/g, "'").replace(/[<>#%{}\n]/g, (c) => encodeURIComponent(c));
    cache.set(key, `data:image/svg+xml;charset=utf-8,${uri}`);
  }
  return cache.get(key);
}

/* Shown as an <img>, not inline SVG: the Christmas frame alone is a few
   thousand needles, and as one image the browser draws it once as a
   single layer instead of keeping every needle in the page — what keeps
   the card smooth on a phone. The sway and the twinkling lights still
   run, from the <style> inside the SVG. */
export default function FrameBorder({ theme }) {
  return <img className="cb-frame" src={frameUri(theme)} alt="" aria-hidden="true" draggable="false" />;
}
