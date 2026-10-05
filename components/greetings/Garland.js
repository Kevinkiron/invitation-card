/* ══════════════════════════════════════════════════════════════════════
   GARLANDS — the decoration across the top of the illustrated card
   (components/greetings/IllustratedCard.js).

   Drawn, not licensed: pine boughs with red berries and a holly sprig
   for Christmas, a marigold toran with mango leaves for Diwali / Onam /
   Pongal, bunting flags for birthdays and celebrations, and a soft
   floral spray for everything else. Same "ornament is geometry" idea as
   components/wedding/ornaments.js.

   Each generator builds SVG markup from fixed numbers and a seeded random
   generator (rng below), never Math.random, so the server render and the
   browser's first render produce exactly the same needles and berries
   and React never sees a hydration mismatch. Nothing user-written ever
   goes into this markup, which is why setting it as innerHTML is safe.

   Every bough sits in a <g class="ic-sway">, which
   app/greeting-illustrated.css rocks gently on a staggered delay.
   ══════════════════════════════════════════════════════════════════════ */


export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ── pine branch: a curved stem with needles fanned off both sides ──
export function pineBranch(r, x0, y0, len, angDeg, bend, scale = 1) {
  const a = (angDeg * Math.PI) / 180;
  const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
  const nx = -Math.sin(a), ny = Math.cos(a);
  const cx = (x0 + x1) / 2 + nx * bend, cy = (y0 + y1) / 2 + ny * bend;
  const greens = ["#1d4f31", "#265f3a", "#2f6e42", "#3a7d4b", "#1a4a2e"];
  let out = `<path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" stroke="#4a3322" stroke-width="${2.2 * scale}" fill="none" stroke-linecap="round"/>`;
  const steps = Math.round(len / 3.2);
  for (let i = 2; i <= steps; i++) {
    const t = i / steps;
    const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const ta = Math.atan2(ty, tx);
    const L = (16 - t * 7) * scale * (0.8 + r() * 0.4);
    for (const side of [-1, 1]) {
      const na = ta + side * (0.95 + r() * 0.25);
      const ex = px + Math.cos(na) * L, ey = py + Math.sin(na) * L;
      out += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${greens[Math.floor(r() * greens.length)]}" stroke-width="${(1.7 * scale).toFixed(2)}" stroke-linecap="round"/>`;
    }
  }
  // tip tuft
  out += `<line x1="${x1}" y1="${y1}" x2="${x1 + Math.cos(a) * 8 * scale}" y2="${y1 + Math.sin(a) * 8 * scale}" stroke="#2f6e42" stroke-width="${1.8 * scale}" stroke-linecap="round"/>`;
  return out;
}

export function berries(r, x, y, n = 3, size = 5.4) {
  let out = "";
  const pts = [[0, 0], [size * 1.7, size * 0.5], [size * 0.6, size * 1.6], [-size * 1.2, size * 1.1], [size * 1.9, size * 2]].slice(0, n);
  for (const [dx, dy] of pts) {
    const s = size * (0.85 + r() * 0.3);
    out += `<circle cx="${x + dx}" cy="${y + dy}" r="${s}" fill="url(#ic-berry)"/>`;
    out += `<circle cx="${x + dx - s * 0.35}" cy="${y + dy - s * 0.35}" r="${s * 0.28}" fill="#fff" opacity=".7"/>`;
  }
  return out;
}

export function hollyLeaf(x, y, rot, s = 1) {
  return `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C6 -6 10 -4 14 -9 C15 -4 20 -3 24 -6 C23 -1 27 2 32 1 C28 5 29 9 33 12 C27 12 24 15 22 19 C19 14 14 15 10 17 C11 12 7 9 3 9 C5 5 2 3 0 0 Z" fill="url(#ic-holly)" stroke="#164a2a" stroke-width=".8"/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M2 2 Q16 6 30 9" stroke="#8fc39a" stroke-width=".9" fill="none" opacity=".7"/>`;
}

export const DEFS = `<defs>
 <radialGradient id="ic-berry" cx="35%" cy="30%"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="55%" stop-color="#c8102e"/><stop offset="100%" stop-color="#7a0a1c"/></radialGradient>
 <linearGradient id="ic-holly" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3f8a52"/><stop offset="100%" stop-color="#1c5332"/></linearGradient>
 <radialGradient id="ic-mari" cx="40%" cy="35%"><stop offset="0%" stop-color="#ffd54a"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d9480f"/></radialGradient>
 <radialGradient id="ic-mari2" cx="40%" cy="35%"><stop offset="0%" stop-color="#fff176"/><stop offset="60%" stop-color="#fbc02d"/><stop offset="100%" stop-color="#e08a00"/></radialGradient>
</defs>`;

// ── Christmas: pine boughs + berries hanging off the top edge ──
function garlandPine(seed = 7) {
  const r = rng(seed);
  const sway = (i, inner) => `<g class="ic-sway" style="--d:${(i * 0.7).toFixed(1)}s">${inner}</g>`;
  let top = "";
  top += sway(0, pineBranch(r, 150, -6, 70, 165, -10, 1.0) + pineBranch(r, 150, -6, 56, 120, 6, 0.9));
  top += sway(1, pineBranch(r, 205, -6, 78, 30, 12, 1.05) + pineBranch(r, 205, -6, 60, 95, -6, 0.85));
  top += sway(2, pineBranch(r, 290, -6, 80, 160, 10, 1.05) + pineBranch(r, 290, -6, 66, 70, -8, 0.95));
  top += sway(3, pineBranch(r, 360, -6, 66, 25, -8, 1.0) + pineBranch(r, 380, -6, 50, 115, 6, 0.85));
  top += sway(4, berries(r, 196, 14, 3) + berries(r, 268, 22, 4) + berries(r, 338, 12, 3) + berries(r, 142, 26, 2));
  const topSvg = `<svg class="ic-garland-top" viewBox="0 0 400 110" preserveAspectRatio="xMidYMin meet">${DEFS}${top}</svg>`;

  const r2 = rng(seed + 3);
  let bl = "";
  bl += sway(0, pineBranch(r2, -6, 150, 120, -20, -8, 1.0));
  bl += sway(1, pineBranch(r2, -6, 120, 70, -55, 6, 0.9));
  bl += hollyLeaf(6, 112, -40, 1.25) + hollyLeaf(14, 128, 10, 1.15) + hollyLeaf(-2, 132, -80, 1.1);
  bl += berries(r2, 18, 118, 4, 6);
  bl += sway(2, pineBranch(r2, 40, 152, 60, -75, 6, 0.8));
  const blSvg = `<svg class="ic-garland-bl" viewBox="0 0 160 150" preserveAspectRatio="xMinYMax meet">${DEFS}${bl}</svg>`;
  return topSvg + blSvg;
}

// ── Diwali / Onam / Pongal: a marigold toran with mango leaves ──
export function marigold(r, x, y, s, grad) {
  let out = `<circle cx="${x}" cy="${y}" r="${s}" fill="url(#${grad})"/>`;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2 + r();
    out += `<path d="M${x} ${y} L${(x + Math.cos(a) * s * 0.95).toFixed(1)} ${(y + Math.sin(a) * s * 0.95).toFixed(1)}" stroke="#c2410c" stroke-width=".7" opacity=".45"/>`;
  }
  out += `<circle cx="${x - s * 0.3}" cy="${y - s * 0.35}" r="${s * 0.3}" fill="#fff8c4" opacity=".55"/>`;
  return out;
}
function garlandMarigold(seed = 11) {
  const r = rng(seed);
  const anchors = [-10, 100, 210, 310, 410];
  let swags = "";
  anchors.slice(0, -1).forEach((ax, i) => {
    const bx = anchors[i + 1], sag = 34;
    let g = `<path d="M${ax} 2 Q${(ax + bx) / 2} ${2 + sag * 2} ${bx} 2" stroke="#7c4a1e" stroke-width="1" fill="none" opacity=".5"/>`;
    const n = 9;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * ((ax + bx) / 2) + t * t * bx;
      const y = (1 - t) * (1 - t) * 2 + 2 * (1 - t) * t * (2 + sag * 2) + t * t * 2;
      if (k % 3 === 1) g += `<path d="M${x} ${y + 4} q-7 12 0 26 q7 -14 0 -26z" fill="#2e7d32" stroke="#1b5e20" stroke-width=".6"/>`;
      g += marigold(r, x, y, 8.5, k % 2 ? "ic-mari" : "ic-mari2");
    }
    // a hanging strand from each anchor
    let hy = 6;
    for (let k = 0; k < 4; k++) { g += marigold(r, ax, hy, 6.5, k % 2 ? "ic-mari2" : "ic-mari"); hy += 12; }
    g += `<path d="M${ax} ${hy} l-4 10 h8z" fill="#c2185b"/>`;
    swags += `<g class="ic-sway" style="--d:${i * 0.6}s">${g}</g>`;
  });
  return `<svg class="ic-garland-top" viewBox="0 0 400 110" preserveAspectRatio="xMidYMin meet">${DEFS}${swags}</svg>`;
}

// ── Birthday / New Year / celebrations: bunting flags on a string ──
function garlandBunting(colors, seed = 5) {
  const anchors = [-10, 140, 280, 410];
  let out = "";
  anchors.slice(0, -1).forEach((ax, i) => {
    const bx = anchors[i + 1], sag = 26;
    let g = `<path d="M${ax} 4 Q${(ax + bx) / 2} ${4 + sag * 2} ${bx} 4" stroke="#6b5b4b" stroke-width="1.2" fill="none"/>`;
    const n = 7;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * ((ax + bx) / 2) + t * t * bx;
      const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * (4 + sag * 2) + t * t * 4;
      const c = colors[(k + i) % colors.length];
      g += `<path d="M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 22} Z" fill="${c}"/><path d="M${x - 9} ${y} L${x + 9} ${y} L${x + 6} ${y + 5} L${x - 6} ${y + 5}Z" fill="#000" opacity=".12"/>`;
    }
    out += `<g class="ic-sway" style="--d:${i * 0.8}s">${g}</g>`;
  });
  return `<svg class="ic-garland-top" viewBox="0 0 400 110" preserveAspectRatio="xMidYMin meet">${out}</svg>`;
}

// ── everything else: a soft floral spray in the top corners ──
function garlandFloral(petal, leaf, seed = 3) {
  const r = rng(seed);
  const flower = (x, y, s) => {
    let o = "";
    for (let k = 0; k < 5; k++) o += `<ellipse cx="${x}" cy="${y - s}" rx="${s * 0.62}" ry="${s}" fill="${petal}" opacity=".92" transform="rotate(${k * 72 + r() * 10} ${x} ${y})"/>`;
    return o + `<circle cx="${x}" cy="${y}" r="${s * 0.45}" fill="#f6c453"/>`;
  };
  const leafAt = (x, y, rot, s) => `<ellipse cx="${x}" cy="${y}" rx="${s * 0.45}" ry="${s * 1.3}" fill="${leaf}" transform="rotate(${rot} ${x} ${y})"/>`;
  let g = "";
  g += `<g class="ic-sway" style="--d:0s">${leafAt(150, 16, 60, 14)}${leafAt(178, 30, -30, 12)}${flower(160, 22, 13)}${flower(196, 12, 9)}</g>`;
  g += `<g class="ic-sway" style="--d:1.1s">${leafAt(300, 20, 120, 14)}${leafAt(350, 28, 40, 13)}${flower(320, 18, 14)}${flower(372, 10, 10)}${flower(262, 10, 8)}</g>`;
  return `<svg class="ic-garland-top" viewBox="0 0 400 110" preserveAspectRatio="xMidYMin meet">${g}</svg>`;
}

const BUILDERS = {
  pine: () => garlandPine(),
  marigold: () => garlandMarigold(),
  bunting: (t) => garlandBunting(t.bunting || [t.ink, t.leaf, "#e8b84b", t.panel]),
  floral: (t) => garlandFloral(t.ink, t.leaf),
};

/* Returns the garland(s) for a card theme (lib/greetings/card-themes.js)
   as real <svg> elements. Pine also adds the bottom-left sprig. */
export default function Garland({ theme }) {
  const html = (BUILDERS[theme.garland] || BUILDERS.floral)(theme);
  // One wrapper per generated <svg>: split on the outer tags so each
  // keeps its own class (ic-garland-top / ic-garland-bl).
  const parts = html.split("</svg>").filter(Boolean).map((s) => s + "</svg>");
  return parts.map((p, i) => {
    const open = p.match(/^<svg ([^>]*)>/);
    const attrs = Object.fromEntries([...open[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const inner = p.slice(open[0].length, -"</svg>".length);
    return (
      <svg
        key={i}
        className={attrs.class}
        viewBox={attrs.viewBox}
        preserveAspectRatio={attrs.preserveAspectRatio}
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    );
  });
}
