/* ══════════════════════════════════════════════════════════════════════
   THE RENDERER

   One function. Tokens in, finished invitation out. No templates.

   The AI never writes markup — it writes the token object below, which is
   about 400 tokens of JSON. Everything visual is composed here from
   primitives, so every possible output is responsive, on-brand and
   guaranteed to render. The combinatorial space (frames × motifs × type
   pairings × palettes × section orders) is in the tens of thousands, but
   the quality floor is set by this file, not by the model.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Motif generators ───────────────────────────────────────────────────
   Parametric SVG, tinted from the palette. Not fixed asset files — the
   same generator gives a different result per event. */
const MOTIFS = {
  botanical: (c) => `
    <g fill="none" stroke="${c.accent}" stroke-width="1.1" stroke-linecap="round">
      <path d="M18 182C42 150 70 118 108 92c22-15 44-26 66-32"/>
      ${[40, 66, 94, 124, 154].map((y, i) => {
        const x = 40 + i * 28.5, yy = 158 - i * 22;
        return `<path d="M${x} ${yy}c-7-13-6-26 1-35 8 11 8 25-1 35z" fill="${c.accentSoft}" fill-opacity=".55"/>
                <path d="M${x} ${yy}c14-3 25-11 29-22-13-2-25 6-29 22z" fill="${c.accentSoft}" fill-opacity=".55"/>`;
      }).join("")}
    </g>
    <g fill="${c.accent}" opacity=".5">
      <circle cx="72" cy="160" r="3.2"/><circle cx="116" cy="99" r="2.8"/><circle cx="146" cy="82" r="2.4"/>
    </g>`,

  geometric: (c) => `
    <g fill="none" stroke="${c.accent}" stroke-width="1.1">
      <path d="M100 12 L176 56 L176 144 L100 188 L24 144 L24 56 Z"/>
      <path d="M100 40 L152 70 L152 130 L100 160 L48 130 L48 70 Z" opacity=".6"/>
      <circle cx="100" cy="100" r="34" opacity=".45"/>
      <path d="M100 12 V188 M24 56 L176 144 M176 56 L24 144" opacity=".2"/>
    </g>
    <circle cx="100" cy="100" r="9" fill="${c.accentSoft}" opacity=".7"/>`,

  waves: (c) => `
    <g fill="none" stroke="${c.accent}" stroke-linecap="round">
      ${[0, 1, 2, 3, 4, 5].map((i) => {
        const y = 46 + i * 22, o = (0.7 - i * 0.09).toFixed(2);
        return `<path d="M-6 ${y}c34-20 62 20 96 0s62-20 116 0" stroke-width="${1.4 - i * 0.12}" opacity="${o}"/>`;
      }).join("")}
    </g>`,

  confetti: (c) => {
    let s = "";
    for (let i = 0; i < 26; i++) {
      const x = (i * 47) % 190 + 6, y = (i * 71) % 186 + 8, r = (i * 37) % 360;
      const fill = i % 3 === 0 ? c.accent : i % 3 === 1 ? c.accentSoft : c.deep;
      s += i % 2
        ? `<rect x="${x}" y="${y}" width="6" height="3" rx="1.5" fill="${fill}" opacity=".55" transform="rotate(${r} ${x} ${y})"/>`
        : `<circle cx="${x}" cy="${y}" r="2.6" fill="${fill}" opacity=".5"/>`;
    }
    return s;
  },

  grid: (c) => {
    let s = `<g stroke="${c.accent}" stroke-width=".6" opacity=".35">`;
    for (let i = 0; i <= 10; i++) {
      s += `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="200"/><line x1="0" y1="${i * 20}" x2="200" y2="${i * 20}"/>`;
    }
    s += `</g><g fill="${c.accent}" opacity=".8">`;
    [[40,60],[120,40],[160,120],[60,140],[100,100]].forEach(([x,y]) => { s += `<circle cx="${x}" cy="${y}" r="2.6"/>`; });
    return s + `</g>`;
  },

  rings: (c) => `
    <g fill="none" stroke="${c.accent}">
      ${[88, 68, 48, 28].map((r, i) => `<circle cx="100" cy="100" r="${r}" stroke-width="${1.3 - i * 0.15}" opacity="${0.75 - i * 0.13}" ${i % 2 ? 'stroke-dasharray="3 7"' : ""}/>`).join("")}
    </g>
    <circle cx="100" cy="100" r="10" fill="${c.accentSoft}" opacity=".6"/>`,

  none: () => "",
};

const ICONS = {
  ring:    '<circle cx="12" cy="14" r="6"/><path d="M8.5 8.5 12 3l3.5 5.5"/>',
  church:  '<path d="M12 2v6M9.5 4.5h5"/><path d="M5 21V11l7-5 7 5v10"/><path d="M10 21v-5h4v5"/>',
  glass:   '<path d="M8 3h8l-1 6a3 3 0 0 1-6 0z"/><path d="M12 12v8M9 21h6"/>',
  home:    '<path d="M4 20V9l8-5 8 5v11"/><path d="M3 20h18"/><path d="M9 20v-6h6v6"/>',
  mic:     '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
  talk:    '<path d="M3 5h18v12H8l-5 4z"/>',
  code:    '<path d="m9 8-5 4 5 4M15 8l5 4-5 4"/>',
  users:   '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 20a5 5 0 0 1 5.5-5"/>',
  cake:    '<path d="M4 21v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6z"/><path d="M3 21h18M12 8V5"/><circle cx="12" cy="3.4" r="1.2"/>',
  ticket:  '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4z"/><path d="M14 6v12" stroke-dasharray="2 3"/>',
  pin:     '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  star:    '<path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.1L12 17l-5.6 3 1.3-6.1L3 9.6l6.3-.7z"/>',
  camera:  '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.1-2h7.4l1.1 2h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><circle cx="12" cy="12.2" r="3.6"/>',
};

const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.star}</svg>`;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ── Section renderers ────────────────────────────────────────────────── */
const SECTIONS = {
  prose: (s) => `
    <section class="sec ${s.invert ? "invert" : ""}" id="${esc(s.id || "")}">
      ${motifCorners(s.invert)}
      <div class="wrap reveal">
        ${head(s)}
        <p class="lede">${esc(s.body)}</p>
      </div>
    </section>`,

  cards: (s) => `
    <section class="sec ${s.invert ? "invert" : ""}" id="${esc(s.id || "")}">
      ${motifCorners(s.invert)}
      <div class="wrap reveal">
        ${head(s)}
        <div class="cards" style="--cols:${s.items.length >= 4 ? 4 : s.items.length}">
          ${s.items.map((it, i) => `
            <article class="card" style="--i:${i}">
              <span class="num">${String(i + 1).padStart(2, "0")}</span>
              ${it.icon ? `<div class="ic">${icon(it.icon)}</div>` : ""}
              <h3>${esc(it.heading)}</h3>
              ${it.meta ? `<div class="meta">${esc(it.meta)}</div>` : ""}
              ${it.body ? `<p>${esc(it.body)}</p>` : ""}
              ${it.link ? `<a class="cardlink" href="${esc(it.link.href)}" target="_blank" rel="noopener">${esc(it.link.label)}</a>` : ""}
            </article>`).join("")}
        </div>
      </div>
    </section>`,

  detail: (s) => `
    <section class="sec ${s.invert ? "invert" : ""}" id="${esc(s.id || "")}">
      ${motifCorners(s.invert)}
      <div class="wrap reveal">
        ${head(s)}
        <dl class="rows">
          ${s.rows.map((r, i) => `<div class="row" style="--i:${i}"><dt>${esc(r.label)}</dt><i class="leader"></i><dd>${esc(r.value)}</dd></div>`).join("")}
        </dl>
      </div>
    </section>`,

  gallery: (s) => `
    <section class="sec" id="${esc(s.id || "gallery")}">
      <div class="wrap reveal">
        ${head(s)}
        ${(() => {
          const ph = s.photos && s.photos.length ? s.photos : [0, 1, 2];
          /* Columns from the count, so four photos are a clean 2x2 rather
             than three-across with a hole in it. A tall tile only earns its
             place when there are enough others to fill the column beside
             it. */
          const cols = ph.length <= 2 ? ph.length : ph.length === 4 ? 2 : 3;
          const tallAt = ph.length >= 5 ? 0 : -1;
          return `<div class="grid" style="--gcols:${cols}">
          ${ph.map((p, i) => `
            <figure class="tile ${i === tallAt ? "tall" : ""}" style="--i:${i}">
              ${typeof p === "string"
                ? `<img src="${p}" alt="" loading="lazy"/>`
                : `<div class="slot">${icon("camera")}</div>`}
            </figure>`).join("")}
        </div>`;
        })()}
        ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
      </div>
    </section>`,

  cta: (s) => `
    <section class="sec cta ${s.invert ? "invert" : ""}" id="${esc(s.id || "rsvp")}">
      ${motifCorners(s.invert)}
      <div class="wrap reveal">
        ${head(s)}
        ${s.button ? `<a class="btn" href="${esc(s.button.href || "#")}"><span>${esc(s.button.label)}</span></a>` : ""}
        ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
      </div>
    </section>`,
};

function head(s) {
  return `
    ${s.eyebrow ? `<div class="eyebrow"><i></i><span>${esc(s.eyebrow)}</span><i></i></div>` : ""}
    ${s.title ? `<h2 class="h2 ${s.script ? "scriptface" : ""}">${esc(s.title)}</h2>` : ""}
    <div class="rule"><i></i><b></b><i></i></div>
    ${s.lede ? `<p class="lede">${esc(s.lede)}</p>` : ""}`;
}

const motifCorners = (invert) =>
  `<div class="deco tl ${invert ? "inv" : ""}"></div><div class="deco br ${invert ? "inv" : ""}"></div>`;

/* A very fine paper grain. Two things it buys: it kills the flatness of a
   large single-colour field on a phone screen, and it stops wide gradients
   banding. Cheap — one tiny tiled SVG, no network request. */
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/></filter>
       <rect width="140" height="140" filter="url(#n)" opacity="0.5"/>
     </svg>`
  );

/* ── Colour safety ─────────────────────────────────────────────────────
   The AI invents palettes. Most are fine; some are not, and the failures
   are the quiet kind — a gold kicker on cream at 2.8:1, or a headline that
   uses `deep` for its colour when `deep` happens to be bright yellow. The
   renderer therefore derives its TEXT colours rather than trusting the
   palette, and the derivation is done once, here, in one place. */
function rgb(hex) {
  const h = String(hex || "").replace("#", "");
  const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  if (v.length < 6) return [0, 0, 0];
  const n = parseInt(v.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

function relLum(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const [r, g, b] = rgb(c);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const mix = (a, b, t) => {
  const A = rgb(a), B = rgb(b);
  return hex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t));
};
/* Walk `fg` towards `towards` until it is legible on `bg`. Returns the
   first step that clears `target`, or the fully-mixed colour. */
function legible(fg, bg, towards, target = 3.5) {
  if (contrast(fg, bg) >= target) return fg;
  for (let t = 0.15; t <= 1.0001; t += 0.15) {
    const c = mix(fg, towards, t);
    if (contrast(c, bg) >= target) return c;
  }
  return towards;
}

/* Perceived lightness of a hex colour, 0–1. */
function lum(hex) {
  const h = String(hex || "").replace("#", "");
  const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  if (v.length < 6) return 0;
  const n = parseInt(v.slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/* ── The renderer ─────────────────────────────────────────────────────── */
export function render(tok, mount) {
  const d = tok.design, c = d.palette, ct = tok.content;

  /* `deep` is the full-bleed band colour. It is USUALLY dark — but a
     concert sets it to yellow and a launch to orange, and every rule that
     hard-coded rgba(255,255,255,…) for secondary text on that band then
     rendered white on yellow. Derive the ink instead of assuming it. */
  /* Motion has to belong to the event. The tokens already say enough to
     tell them apart without a new field: a veil reveal and soft corners
     mean a personal celebration; sharp corners with no frame and a poster
     face mean a stage; `fade` with almost no density means a memorial.
       ceremonial — a slow veil, drifting petals, a breathing portrait
       stage      — a pulsing glow, a marquee shimmer on the headline
       editorial  — crisp, quick, no ornament in motion
       solemn     — barely anything, and nothing that bounces          */
  const bigType = (d.h1Scale || 7) >= 10;
  const motion =
    d.reveal === "fade" && (d.density ?? 0.6) <= 0.35 ? "solemn"
    : d.corner === "sharp" && bigType ? "stage"
    : d.corner === "sharp" ? "editorial"
    : "ceremonial";

  const deepIsLight = lum(c.deep) > 0.55;
  const onDeepSoft = deepIsLight ? "rgba(0,0,0,.66)" : "rgba(255,255,255,.70)";
  const onDeepLine = deepIsLight ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.24)";
  const onDeepFaint = deepIsLight ? "rgba(0,0,0,.10)" : "rgba(255,255,255,.06)";

  /* Headlines are set in `deep`, which is also the full-bleed band colour.
     When a palette makes `deep` bright AND `bg` light, that headline is
     invisible — measured at 1.31:1 on a test palette. Fall back to `ink`. */
  const headline = contrast(c.deep, c.bg) >= 3 ? c.deep : c.ink;
  /* `accent` carries the small uppercase text — kickers, eyebrows, times.
     At 10px it needs more contrast than a hairline does. */
  const accentInk = legible(c.accent, c.bg, c.ink, 3.5);
  const accentOnSurface = legible(c.accent, c.surface, c.ink, 3.5);
  const accentOnDeep = legible(c.accent, c.deep, c.onDeep, 3.5);
  const motifSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${(MOTIFS[d.motif] || MOTIFS.none)(c)}</svg>`;
  const motifUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(motifSvg)}")`;

  mount.innerHTML = `
    <style>
      .inv-root{
        --bg:${c.bg}; --surface:${c.surface}; --ink:${c.ink}; --muted:${c.muted};
        --accent:${c.accent}; --accent-soft:${c.accentSoft}; --deep:${c.deep}; --on-deep:${c.onDeep};
        --display:${d.fonts.display}; --body:${d.fonts.body}; --script:${d.fonts.script || d.fonts.display};
        --radius:${d.corner === "sharp" ? "0px" : "8px"};
        --density:${d.density};
        --motif:${motifUrl};
        --grain:url("${GRAIN}");
        --on-deep-soft:${onDeepSoft}; --on-deep-line:${onDeepLine}; --on-deep-faint:${onDeepFaint};
        --headline:${headline}; --accent-ink:${accentInk};
        --accent-on-surface:${accentOnSurface}; --accent-on-deep:${accentOnDeep};
        --edge:${d.corner === "sharp" ? "18px" : "22px"};
        background:var(--bg); color:var(--ink); font-family:var(--body); font-weight:300;
        position:relative; overflow-x:hidden;
        text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased;
      }
      /* Paper. A single fixed tile over everything, well under the
         threshold of being noticed — but the field stops looking like flat
         #RGB and starts looking like stock. */
      .inv-root::after{content:"";position:fixed;inset:0;z-index:70;pointer-events:none;
        background-image:var(--grain);background-size:140px 140px;opacity:.055;mix-blend-mode:multiply}
      .inv-root *{box-sizing:border-box;margin:0;padding:0;}
      .inv-root img{max-width:100%;display:block;}
      .inv-root a{color:inherit;text-decoration:none;}

      /* ── veil ── */
      .inv-root .veil{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;pointer-events:none;}
      .inv-root .veil .pane{position:absolute;top:0;bottom:0;width:50.6%;background:var(--surface);transition:transform 1.5s cubic-bezier(.76,0,.24,1);}
      .inv-root .veil .pane.l{left:0} .inv-root .veil .pane.r{right:0}
      .inv-root .veil.go .pane.l{transform:translateX(-101%)}
      .inv-root .veil.go .pane.r{transform:translateX(101%)}
      .inv-root .veil .mark{position:relative;z-index:2;font-family:var(--script);font-size:44px;color:var(--accent);transition:opacity .6s ease,transform .9s ease;}
      .inv-root .veil.go .mark{opacity:0;transform:scale(1.16)}
      .inv-root .veil.done{display:none}

      /* ── hero ── */
      .inv-root .hero{
        position:relative;min-height:${d.heroFull === false ? "auto" : "100vh"};
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        text-align:center;padding:clamp(64px,10vh,110px) clamp(26px,6vw,54px);overflow:hidden;
        background:${d.heroBg || "radial-gradient(700px 480px at 50% 24%, var(--surface), transparent 70%)"};
      }
      /* Ornaments are pinned INSIDE the stationery edge and kept small.
         At 40vw they read as clip-art dropped in the corners; at this size
         they read as an engraved border. */
      .inv-root .hero .deco{position:absolute;background-image:var(--motif);background-size:contain;background-repeat:no-repeat;
        width:clamp(96px,17vw,190px);height:clamp(96px,17vw,190px);
        opacity:calc(var(--density)*.55);pointer-events:none;
        will-change:transform;}
      .inv-root .hero .deco.tl{top:calc(var(--edge) + 4px);left:calc(var(--edge) + 4px)}
      .inv-root .hero .deco.tr{top:calc(var(--edge) + 4px);right:calc(var(--edge) + 4px);transform:scaleX(-1)}
      .inv-root .hero .deco.bl{bottom:calc(var(--edge) + 4px);left:calc(var(--edge) + 4px);transform:scaleY(-1)}
      .inv-root .hero .deco.br{bottom:calc(var(--edge) + 4px);right:calc(var(--edge) + 4px);transform:scale(-1,-1)}

      /* The stationery edge. */
      .inv-root .hero .edge{position:absolute;inset:var(--edge);pointer-events:none;z-index:1;
        border:1px solid var(--accent-soft);border-radius:${d.corner === "sharp" ? "0" : "3px"}}
      ${d.corner === "sharp" ? "" : `.inv-root .hero .edge::before{content:"";position:absolute;inset:6px;
        border:1px solid var(--accent-soft);opacity:.55;border-radius:2px}`}

      .inv-root .heroin{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;
        width:100%;max-width:640px}
      /* Everything in the hero arrives in sequence rather than all at once. */
      .inv-root .heroin > *{animation:rise .9s cubic-bezier(.19,1,.22,1) both}
      .inv-root .heroin > *:nth-child(1){animation-delay:.10s}
      .inv-root .heroin > *:nth-child(2){animation-delay:.20s}
      .inv-root .heroin > *:nth-child(3){animation-delay:.30s}
      .inv-root .heroin > *:nth-child(4){animation-delay:.40s}
      .inv-root .heroin > *:nth-child(5){animation-delay:.48s}
      .inv-root .heroin > *:nth-child(6){animation-delay:.56s}
      .inv-root .heroin > *:nth-child(7){animation-delay:.64s}
      .inv-root .heroin > *:nth-child(8){animation-delay:.72s}
      @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

      /* Monogram crest. */
      .inv-root .crest{display:flex;align-items:center;justify-content:center;
        width:64px;height:64px;margin-bottom:26px;border:1px solid var(--accent-soft);border-radius:50%;
        position:relative}
      .inv-root .crest::before{content:"";position:absolute;inset:5px;border:1px solid var(--accent-soft);
        border-radius:50%;opacity:.5}
      .inv-root .crest span{font-family:var(--script);font-size:20px;color:var(--accent-ink);line-height:1}

      .inv-root .scrollcue{position:absolute;left:50%;bottom:calc(var(--edge) + 16px);transform:translateX(-50%);
        width:1px;height:40px;overflow:hidden;opacity:.5;z-index:2}
      .inv-root .scrollcue i{display:block;width:1px;height:40px;background:linear-gradient(var(--accent),transparent);
        animation:cue 2.4s ease-in-out infinite}
      @keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(100%)}}

      .inv-root .epigraph{max-width:520px;z-index:2;margin-bottom:20px;font-family:var(--display);font-style:italic;
        font-size:clamp(14px,1.9vw,17px);line-height:1.75;color:var(--muted)}
      .inv-root .epigraph .src{display:block;margin-top:9px;font-style:normal;font-family:var(--body);
        font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent-ink)}

      /* When there is an actual photograph the frame earns more room; an
         empty placeholder should not dominate the page. */
      .inv-root .hero.hasphoto .frame{width:clamp(210px,38vw,300px)}
      .inv-root .frame{position:relative;z-index:2;width:clamp(178px,32vw,248px);aspect-ratio:3/4;overflow:hidden;
        margin-bottom:30px;border:1px solid var(--accent);background:var(--surface);
        box-shadow:0 26px 64px rgba(0,0,0,.20), 0 0 0 7px var(--bg), 0 0 0 8px var(--accent-soft)}
      /* A soft vignette so a bright snapshot still sits inside the palette
         instead of punching a hole through it. */
      .inv-root .frame::after{content:"";position:absolute;inset:0;pointer-events:none;
        background:radial-gradient(120% 90% at 50% 30%, transparent 52%, rgba(0,0,0,.20));
        border-radius:inherit}
      .inv-root .frame.arch{border-radius:999px 999px var(--radius) var(--radius)}
      .inv-root .frame.circle{border-radius:50%;aspect-ratio:1}
      .inv-root .frame.rect{border-radius:var(--radius)}
      .inv-root .frame.wide{border-radius:var(--radius);width:clamp(240px,52vw,460px);aspect-ratio:16/9}
      .inv-root .frame.none{display:none}
      .inv-root .frame img{width:100%;height:100%;object-fit:cover;animation:kb 20s ease-in-out infinite alternate}
      @keyframes kb{from{transform:scale(1)}to{transform:scale(1.08)}}
      .inv-root .frame .slot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);opacity:.5}
      .inv-root .frame .slot svg{width:30px;height:30px}

      .inv-root .kicker{z-index:2;font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--accent-ink);margin-bottom:12px}
      .inv-root .h1{z-index:2;font-family:var(--display);font-weight:${d.displayWeight || 600};
        font-size:clamp(34px,${d.h1Scale || 7}vw,${d.h1Max || 72}px);line-height:1.12;color:var(--headline);
        text-transform:${d.displayCase || "none"};letter-spacing:${d.displayTracking || "0"}}
      .inv-root .h1.scriptface{font-family:var(--script);font-weight:400;text-transform:none;letter-spacing:0}
      .inv-root .joiner{display:block;font-family:var(--display);font-style:italic;font-size:.38em;color:var(--accent);margin:2px 0;text-transform:none;letter-spacing:0}
      .inv-root .subhead{z-index:2;margin-top:16px;font-family:var(--display);font-size:clamp(16px,2.3vw,22px);color:var(--ink)}
      .inv-root .place{z-index:2;margin-top:8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}

      .inv-root .orn{display:flex;align-items:center;justify-content:center;gap:14px;margin:26px auto 0;
        width:min(300px,72%);z-index:2}
      .inv-root .orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--accent-soft))}
      .inv-root .orn i:last-child{background:linear-gradient(270deg,transparent,var(--accent-soft))}
      .inv-root .orn b{color:var(--accent);font-size:12px;font-weight:400;line-height:1}

      /* Numerals with hairline separators. The boxed version read as app
         chrome; this reads as an engraved date panel. */
      .inv-root .cd{display:flex;align-items:flex-start;justify-content:center;gap:clamp(10px,2.4vw,22px);
        margin-top:34px;padding-top:22px;border-top:1px solid var(--accent-soft);z-index:2;
        width:min(420px,92%)}
      .inv-root .cd > div{min-width:52px}
      .inv-root .cd .n{font-family:var(--display);font-size:clamp(26px,4.4vw,38px);
        font-weight:${d.displayWeight || 600};color:var(--headline);line-height:1;font-variant-numeric:tabular-nums}
      .inv-root .cd .l{font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:8px}
      .inv-root .cd .sep{min-width:0;font-family:var(--display);font-size:clamp(20px,3.2vw,28px);
        color:var(--accent-soft);line-height:1.15}

      /* ── sections ── */
      .inv-root .sec{position:relative;padding:clamp(72px,10vw,124px) 22px;overflow:hidden}
      /* Alternating grounds. Five sections on one flat colour is what made
         the page feel like a form; this gives it a rhythm. */
      .inv-root .sec:nth-of-type(even):not(.invert){background:var(--surface)}
      .inv-root .sec:nth-of-type(even):not(.invert) .eyebrow,
      .inv-root .sec:nth-of-type(even):not(.invert) .card .meta{color:var(--accent-on-surface)}
      .inv-root .sec.invert{background:var(--deep);color:var(--on-deep)}
      /* A hairline where two like-coloured bands meet. */
      .inv-root .sec + .sec:not(.invert)::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);
        width:min(880px,86%);height:1px;background:linear-gradient(90deg,transparent,var(--accent-soft),transparent)}
      .inv-root .sec .deco{position:absolute;background-image:var(--motif);background-size:contain;background-repeat:no-repeat;
        width:clamp(120px,16vw,190px);height:clamp(120px,16vw,190px);opacity:calc(var(--density)*.3);pointer-events:none}
      .inv-root .sec .deco.tl{top:16px;left:16px}
      .inv-root .sec .deco.br{bottom:16px;right:16px;transform:scale(-1,-1)}
      .inv-root .sec .deco.inv{opacity:calc(var(--density)*.2);
        filter:brightness(0)${deepIsLight ? "" : " invert(1)"}}
      .inv-root .wrap{max-width:1000px;margin:0 auto;position:relative;z-index:2}

      .inv-root .eyebrow{display:flex;align-items:center;justify-content:center;gap:14px;
        font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:var(--accent-ink);margin-bottom:16px}
      .inv-root .eyebrow i{width:clamp(18px,5vw,44px);height:1px;background:var(--accent-soft)}
      .inv-root .sec.invert .eyebrow{color:${deepIsLight ? "rgba(0,0,0,.55)" : "var(--accent-soft)"}}
      .inv-root .sec.invert .eyebrow i{background:var(--on-deep-line)}
      .inv-root .h2{text-align:center;font-family:var(--display);font-weight:${d.displayWeight || 600};
        font-size:clamp(26px,4.6vw,42px);color:var(--headline);text-transform:${d.displayCase || "none"};letter-spacing:${d.displayTracking || "0"}}
      .inv-root .h2.scriptface{font-family:var(--script);font-weight:400;text-transform:none;letter-spacing:0;font-size:clamp(30px,5.2vw,48px)}
      .inv-root .sec.invert .h2{color:var(--on-deep)}
      /* The rule draws itself open from the centre when the section
         arrives, with a lozenge in the middle. */
      .inv-root .rule{display:flex;align-items:center;justify-content:center;gap:9px;margin:18px auto 22px;
        width:0;overflow:hidden;transition:width 1.2s cubic-bezier(.19,1,.22,1) .15s}
      .inv-root .reveal.in .rule{width:168px}
      .inv-root .rule i{flex:1;height:1px;background:var(--accent-soft)}
      .inv-root .rule b{width:5px;height:5px;flex-shrink:0;background:var(--accent);
        transform:rotate(45deg);border-radius:${d.corner === "sharp" ? "0" : "1px"}}
      .inv-root .sec.invert .rule i{background:var(--on-deep-line)}
      .inv-root .sec.invert .rule b{background:var(--accent-soft)}
      .inv-root .lede{max-width:620px;margin:0 auto;text-align:center;color:var(--muted);font-size:15px;line-height:1.9}
      .inv-root .sec.invert .lede{color:var(--on-deep-soft)}

      .inv-root .reveal{opacity:0;transform:translateY(24px);transition:opacity .85s ease,transform .85s cubic-bezier(.19,.86,.32,1)}
      .inv-root .reveal.in{opacity:1;transform:none}

      .inv-root .cards{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:20px;margin-top:40px}
      @media(max-width:900px){.inv-root .cards{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:560px){.inv-root .cards{grid-template-columns:1fr}}
      .inv-root .card{position:relative;background:var(--bg);border:1px solid var(--accent-soft);border-radius:var(--radius);
        padding:38px 24px 30px;text-align:center;overflow:hidden;
        transition:transform .5s cubic-bezier(.2,.7,.3,1),box-shadow .5s ease,border-color .5s ease}
      .inv-root .sec:nth-of-type(even):not(.invert) .card{background:var(--bg)}
      /* A hairline of accent along the top edge, drawn on hover. */
      .inv-root .card::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;
        background:var(--accent);transform:scaleX(0);transform-origin:50%;transition:transform .55s cubic-bezier(.19,1,.22,1)}
      .inv-root .card:hover::before{transform:scaleX(1)}
      .inv-root .card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.14);border-color:var(--accent)}
      .inv-root .sec.invert .card{background:var(--on-deep-faint);border-color:var(--on-deep-line)}
      .inv-root .sec.invert .card:hover{border-color:var(--accent-soft)}
      /* The step number, set large and faint behind the heading. */
      .inv-root .card .num{position:absolute;top:10px;right:14px;font-family:var(--display);
        font-size:34px;line-height:1;color:var(--accent);opacity:.16;font-variant-numeric:tabular-nums}
      .inv-root .sec.invert .card .num{color:${deepIsLight ? "rgba(0,0,0,.5)" : "var(--accent-soft)"};opacity:.24}
      .inv-root .card .ic{width:26px;height:26px;margin:0 auto 16px;color:var(--accent)}
      .inv-root .sec.invert .card .ic{color:${deepIsLight ? "rgba(0,0,0,.6)" : "var(--accent-soft)"}}
      .inv-root .card .ic svg{width:100%;height:100%}
      .inv-root .card h3{font-family:var(--display);font-size:20px;font-weight:${d.displayWeight || 600};
        color:var(--headline);margin-bottom:10px;letter-spacing:${d.displayTracking || "0"}}
      .inv-root .sec.invert .card h3{color:var(--on-deep)}
      /* The time is the thing a guest scans for, so it is set as a numeral
         rather than a caption. */
      .inv-root .card .meta{font-family:var(--display);font-size:13px;letter-spacing:.1em;
        text-transform:uppercase;color:var(--accent-ink);margin-bottom:14px;font-variant-numeric:tabular-nums}
      .inv-root .sec.invert .card .meta{color:var(--accent-on-deep)}
      .inv-root .card p{font-size:13.5px;line-height:1.8;color:var(--muted)}
      .inv-root .sec.invert .card p{color:var(--on-deep-soft)}
      .inv-root .cardlink{display:inline-block;margin-top:14px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;
        color:var(--accent-ink);border-bottom:1px solid var(--accent-soft);padding-bottom:2px}

      .inv-root .rows{max-width:600px;margin:40px auto 0}
      .inv-root .row{display:flex;align-items:baseline;gap:14px;padding:17px 2px}
      .inv-root .row + .row{border-top:1px solid var(--accent-soft)}
      .inv-root .sec.invert .row + .row{border-top-color:var(--on-deep-line)}
      .inv-root .row dt{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);flex-shrink:0}
      .inv-root .sec.invert .row dt{color:var(--on-deep-soft)}
      /* A dotted leader, the way a printed order of service sets it. */
      .inv-root .row .leader{flex:1;height:1px;min-width:18px;
        background-image:radial-gradient(currentColor 42%, transparent 43%);
        background-size:5px 1px;background-repeat:repeat-x;color:var(--accent-soft);opacity:.9;
        transform:translateY(-3px)}
      .inv-root .sec.invert .row .leader{color:var(--on-deep-line)}
      .inv-root .row dd{font-family:var(--display);font-size:18px;color:var(--headline);text-align:right;flex-shrink:0}
      .inv-root .sec.invert .row dd{color:var(--on-deep)}

      .inv-root .grid{display:grid;grid-template-columns:repeat(var(--gcols,3),1fr);
        grid-auto-rows:clamp(150px,17vw,210px);grid-auto-flow:dense;gap:14px;margin-top:44px;
        max-width:900px;margin-left:auto;margin-right:auto}
      .inv-root .tile{position:relative;overflow:hidden;border-radius:var(--radius);
        background:linear-gradient(150deg,var(--surface),var(--accent-soft));
        box-shadow:0 2px 4px rgba(0,0,0,.05);
        transition:transform .55s cubic-bezier(.2,.7,.3,1),box-shadow .55s ease}
      /* A hairline drawn just inside the tile, so a photo reads as mounted
         rather than pasted. */
      .inv-root .tile::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
        box-shadow:inset 0 0 0 1px var(--accent-soft), inset 0 0 44px rgba(0,0,0,.10)}
      .inv-root .tile.tall{grid-row:span 2}
      .inv-root .tile:hover{transform:translateY(-6px);box-shadow:0 24px 44px rgba(0,0,0,.18)}
      /* Tiles arrive in sequence rather than all together. */
      .inv-root .reveal.in .tile{animation:tilein .8s cubic-bezier(.19,1,.22,1) both;
        animation-delay:calc(var(--i,0) * 90ms)}
      @keyframes tilein{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}
      /* A single photograph is a portrait, not a banner. */
      .inv-root .grid[style*="--gcols:1"]{max-width:420px}
      .inv-root .tile img{width:100%;height:100%;object-fit:cover;object-position:center 30%;transition:transform 1s cubic-bezier(.2,.7,.3,1)}
      .inv-root .tile:hover img{transform:scale(1.07)}
      .inv-root .tile .slot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);opacity:.45}
      .inv-root .tile .slot svg{width:26px;height:26px}

      .inv-root .cta{text-align:center}
      .inv-root .btn{position:relative;display:inline-block;margin-top:34px;padding:18px 54px;
        border-radius:${d.corner === "sharp" ? "2px" : "44px"};
        background:var(--deep);color:var(--on-deep);font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;
        overflow:hidden;box-shadow:0 16px 34px rgba(0,0,0,.24);
        transition:transform .4s cubic-bezier(.2,.7,.3,1),box-shadow .4s ease}
      .inv-root .sec.invert .btn{background:var(--accent);color:var(--deep)}
      .inv-root .btn:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.3)}
      .inv-root .btn span{position:relative;z-index:2}
      .inv-root .btn::before{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);animation:sw 3.4s ease-in-out infinite}
      @keyframes sw{0%{left:-60%}55%,100%{left:120%}}
      .inv-root .note{margin:22px auto 0;max-width:520px;text-align:center;font-size:13px;font-style:italic;
        color:var(--muted);font-family:var(--display)}
      .inv-root .sec.invert .note{color:var(--on-deep-soft)}

      .inv-root footer{background:var(--deep);color:var(--on-deep);text-align:center;
        padding:60px 22px 52px;position:relative;overflow:hidden}
      .inv-root footer .forn{display:flex;align-items:center;justify-content:center;gap:13px;
        width:min(220px,60%);margin:0 auto 22px;opacity:.75}
      .inv-root footer .forn i{flex:1;height:1px;background:var(--on-deep-line)}
      .inv-root footer .forn b{color:var(--accent-soft);font-size:11px;font-weight:400;line-height:1}
      .inv-root footer .fmark{font-family:var(--script);font-size:32px;color:var(--accent-soft);margin-bottom:9px;line-height:1.2}
      .inv-root footer .fline{font-size:10px;letter-spacing:.26em;text-transform:uppercase;opacity:.72}

      @media(max-width:860px){
        .inv-root .grid{grid-template-columns:repeat(2,1fr)}
      }
      @media(max-width:640px){
        .inv-root .grid{grid-template-columns:1fr!important}
      }
      @media(max-width:640px){
        .inv-root .grid{grid-template-columns:1fr;grid-auto-rows:230px}
        .inv-root .tile.tall{grid-row:span 1}
        .inv-root .sec{padding:64px 18px}
        .inv-root .hero{padding:72px 22px}
        /* On a narrow screen the corner ornaments sit close enough to the
           text to read as smudges behind it. Smaller and fainter. */
        .inv-root .hero .deco{width:86px;height:86px;opacity:calc(var(--density)*.32)}
        .inv-root .sec .deco{width:96px;height:96px;opacity:calc(var(--density)*.18)}
        .inv-root .cd{gap:8px}
        .inv-root .cd .l{font-size:7.5px;letter-spacing:.14em}
        .inv-root .row{flex-wrap:wrap;gap:6px}
        .inv-root .row .leader{display:none}
        .inv-root .row dd{text-align:left;width:100%}
      }
      /* ── motion: ${motion} ───────────────────────────────────────── */
      ${motion === "ceremonial" ? `
      /* Petals drift down the hero, slowly and never in step. */
      .inv-root .petals{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
      .inv-root .petals i{position:absolute;top:-8%;width:9px;height:7px;border-radius:60% 20% 55% 25%;
        background:var(--accent-soft);opacity:.55;animation:fall linear infinite}
      @keyframes fall{
        0%{transform:translate3d(0,-10vh,0) rotate(0deg);opacity:0}
        12%{opacity:.6}
        100%{transform:translate3d(26px,110vh,0) rotate(420deg);opacity:0}}
      /* The portrait breathes rather than sitting still. */
      .inv-root .frame{animation:breathe 9s ease-in-out 1.6s infinite}
      @keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      .inv-root .crest{animation:crestin 1.6s cubic-bezier(.19,1,.22,1) both}
      @keyframes crestin{from{opacity:0;transform:scale(.72) rotate(-12deg)}to{opacity:1;transform:none}}
      ` : ""}

      ${motion === "stage" ? `
      /* A slow glow behind the act name, and a shimmer across it. */
      .inv-root .hero::after{content:"";position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);
        width:min(760px,120%);height:min(420px,70%);pointer-events:none;z-index:0;
        background:radial-gradient(closest-side, var(--accent), transparent 70%);
        opacity:.22;filter:blur(18px);animation:throb 4.6s ease-in-out infinite}
      @keyframes throb{0%,100%{opacity:.16;transform:translate(-50%,-50%) scale(.94)}
        50%{opacity:.30;transform:translate(-50%,-50%) scale(1.04)}}
      /* The shimmer paints the headline through the text itself. Only make
         the fill transparent where that is actually supported — otherwise
         the act name would vanish completely. */
      @supports ((-webkit-background-clip:text) or (background-clip:text)){
        .inv-root .h1{position:relative;background:linear-gradient(100deg,
          var(--headline) 0%, var(--headline) 38%, var(--accent) 50%, var(--headline) 62%, var(--headline) 100%);
          background-size:280% 100%;-webkit-background-clip:text;background-clip:text;
          -webkit-text-fill-color:transparent;animation:sweep 6s ease-in-out 1s infinite}
      }
      @keyframes sweep{0%{background-position:190% 0}55%,100%{background-position:-60% 0}}
      .inv-root .cd .n{animation:tick .4s cubic-bezier(.19,1,.22,1)}
      ` : ""}

      ${motion === "editorial" ? `
      /* Nothing decorative moves. The rules draw themselves, once. */
      .inv-root .hero .edge{clip-path:inset(0 0 0 0);animation:drawedge 1.4s cubic-bezier(.19,1,.22,1) .2s both}
      @keyframes drawedge{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0 0 0 0);opacity:1}}
      ` : ""}

      ${motion === "solemn" ? `
      /* One slow fade for the whole page. Nothing repeats, nothing bounces. */
      .inv-root .heroin > *{animation-duration:1.9s!important}
      .inv-root .frame{animation:none}
      ` : ""}

      @media(prefers-reduced-motion:reduce){
        .inv-root *{animation-duration:.01ms!important;transition-duration:.01ms!important;
          animation-iteration-count:1!important}
        .inv-root .petals,.inv-root .hero::after{display:none}
        .inv-root .h1{-webkit-text-fill-color:var(--headline);color:var(--headline)}
      }
    </style>

    <div class="inv-root">
      ${d.reveal === "veil" ? `<div class="veil"><div class="pane l"></div><div class="pane r"></div><div class="mark">${esc(ct.monogram || "")}</div></div>` : ""}

      <div class="hero${ct.heroPhoto ? " hasphoto" : ""}">
        <div class="deco tl"></div><div class="deco tr"></div>
        <div class="deco bl"></div><div class="deco br"></div>

        <!-- The stationery edge. A hairline inset from the page, doubled on
             soft-cornered (personal) designs. More than anything else on
             this page, this is what reads as "printed", not "web". -->
        <div class="edge" aria-hidden="true"></div>

        <div class="heroin">
          ${ct.monogram ? `<div class="crest"><span>${esc(ct.monogram)}</span></div>` : ""}

          ${ct.epigraph ? `<div class="epigraph">${esc(ct.epigraph.text)}${ct.epigraph.source ? `<span class="src">${esc(ct.epigraph.source)}</span>` : ""}</div>` : ""}

          ${d.frame !== "none" ? `
            <div class="frame ${d.frame}">
              ${ct.heroPhoto ? `<img src="${ct.heroPhoto}" alt=""/>` : `<div class="slot">${icon("camera")}</div>`}
            </div>` : ""}

          ${ct.kicker ? `<div class="kicker">${esc(ct.kicker)}</div>` : ""}
          <h1 class="h1 ${ct.headlineScript ? "scriptface" : ""}">
            ${ct.headlineB
              ? `${esc(ct.headline)}<span class="joiner">${esc(ct.joiner || "&")}</span>${esc(ct.headlineB)}`
              : esc(ct.headline)}
          </h1>
          ${ct.subhead ? `<div class="subhead">${esc(ct.subhead)}</div>` : ""}
          ${ct.place ? `<div class="place">${esc(ct.place)}</div>` : ""}
          ${d.ornament === "none" ? "" : `<div class="orn"><i></i><b>${d.ornament || "&#10047;"}</b><i></i></div>`}
          ${ct.countdownTo ? `<div class="cd">
            <div><div class="n" data-cd="d">00</div><div class="l">Days</div></div>
            <div class="sep">:</div>
            <div><div class="n" data-cd="h">00</div><div class="l">Hours</div></div>
            <div class="sep">:</div>
            <div><div class="n" data-cd="m">00</div><div class="l">Minutes</div></div>
            <div class="sep">:</div>
            <div><div class="n" data-cd="s">00</div><div class="l">Seconds</div></div>
          </div>` : ""}
        </div>

        ${motion === "ceremonial" && (d.density ?? 0.6) > 0.4 ? `<div class="petals" aria-hidden="true">${
          Array.from({ length: 12 }, (_, i) => {
            const left = (i * 8.3 + (i % 3) * 4) % 96;
            const dur = 13 + ((i * 7) % 11);
            const delay = (i * 1.9) % 14;
            const size = 7 + ((i * 3) % 6);
            return `<i style="left:${left}%;width:${size}px;height:${size * 0.78}px;animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
          }).join("")
        }</div>` : ""}

        <div class="scrollcue" aria-hidden="true"><i></i></div>
      </div>

      ${(ct.sections || []).map((s) => (SECTIONS[s.type] ? SECTIONS[s.type](s) : "")).join("")}

      <footer>
        <div class="forn"><i></i><b>${d.ornament && d.ornament !== "none" ? d.ornament : "&#10047;"}</b><i></i></div>
        ${ct.footerMark ? `<div class="fmark">${esc(ct.footerMark)}</div>` : ""}
        ${ct.footerLine ? `<div class="fline">${esc(ct.footerLine)}</div>` : ""}
      </footer>
    </div>`;

  /* ── behaviour ── */
  const root = mount.querySelector(".inv-root");

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  root.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  if (ct.countdownTo) {
    const target = new Date(ct.countdownTo).getTime();
    const pad = (n) => String(n).padStart(2, "0");
    const box = root.querySelector(".cd");
    if (target <= Date.now() && box) box.remove();   // event is over
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const set = (k, v) => { const el = root.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = pad(v); };
      set("d", Math.floor(diff / 864e5)); set("h", Math.floor(diff / 36e5) % 24);
      set("m", Math.floor(diff / 6e4) % 60); set("s", Math.floor(diff / 1e3) % 60);
    };
    tick(); clearInterval(root._cd); root._cd = setInterval(tick, 1000);
  }

  const veil = root.querySelector(".veil");
  if (veil) {
    setTimeout(() => veil.classList.add("go"), 1400);
    setTimeout(() => veil.classList.add("done"), 3100);
  }
  return root;
}
