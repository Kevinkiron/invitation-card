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
          ${s.items.map((it) => `
            <article class="card">
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
          ${s.rows.map((r) => `<div class="row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join("")}
        </dl>
      </div>
    </section>`,

  gallery: (s) => `
    <section class="sec" id="${esc(s.id || "gallery")}">
      <div class="wrap reveal">
        ${head(s)}
        <div class="grid">
          ${(s.photos && s.photos.length ? s.photos : [0, 1, 2]).map((p, i) => `
            <figure class="tile ${i === 0 ? "tall" : ""}">
              ${typeof p === "string"
                ? `<img src="${p}" alt="" loading="lazy"/>`
                : `<div class="slot">${icon("camera")}</div>`}
            </figure>`).join("")}
        </div>
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
    ${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ""}
    ${s.title ? `<h2 class="h2 ${s.script ? "scriptface" : ""}">${esc(s.title)}</h2>` : ""}
    <div class="rule"></div>
    ${s.lede ? `<p class="lede">${esc(s.lede)}</p>` : ""}`;
}

const motifCorners = (invert) =>
  `<div class="deco tl ${invert ? "inv" : ""}"></div><div class="deco br ${invert ? "inv" : ""}"></div>`;

/* ── The renderer ─────────────────────────────────────────────────────── */
export function render(tok, mount) {
  const d = tok.design, c = d.palette, ct = tok.content;
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
        background:var(--bg); color:var(--ink); font-family:var(--body); font-weight:300;
        position:relative; overflow-x:hidden;
      }
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
        text-align:center;padding:78px 22px;overflow:hidden;
        background:${d.heroBg || "radial-gradient(700px 480px at 50% 24%, var(--surface), transparent 70%)"};
      }
      .inv-root .hero .deco{position:absolute;background-image:var(--motif);background-size:contain;background-repeat:no-repeat;
        width:min(300px,40vw);height:min(300px,40vw);opacity:calc(var(--density)*.9);pointer-events:none;}
      .inv-root .hero .deco.tl{top:10px;left:-26px}
      .inv-root .hero .deco.tr{top:10px;right:-26px;transform:scaleX(-1)}
      .inv-root .hero .deco.bl{bottom:-16px;left:-30px;transform:scaleY(-1);opacity:calc(var(--density)*.6)}
      .inv-root .hero .deco.br{bottom:-16px;right:-30px;transform:scale(-1,-1);opacity:calc(var(--density)*.6)}

      .inv-root .epigraph{max-width:520px;z-index:2;margin-bottom:20px;font-family:var(--display);font-style:italic;
        font-size:clamp(14px,1.9vw,17px);line-height:1.75;color:var(--muted)}
      .inv-root .epigraph .src{display:block;margin-top:9px;font-style:normal;font-family:var(--body);
        font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}

      .inv-root .frame{position:relative;z-index:2;width:clamp(150px,28vw,196px);aspect-ratio:3/4;overflow:hidden;
        margin-bottom:22px;border:1px solid var(--accent);background:var(--surface);
        box-shadow:0 20px 52px rgba(0,0,0,.16), 0 0 0 6px var(--bg), 0 0 0 7px var(--accent-soft)}
      .inv-root .frame.arch{border-radius:999px 999px var(--radius) var(--radius)}
      .inv-root .frame.circle{border-radius:50%;aspect-ratio:1}
      .inv-root .frame.rect{border-radius:var(--radius)}
      .inv-root .frame.wide{border-radius:var(--radius);width:clamp(240px,52vw,460px);aspect-ratio:16/9}
      .inv-root .frame.none{display:none}
      .inv-root .frame img{width:100%;height:100%;object-fit:cover;animation:kb 20s ease-in-out infinite alternate}
      @keyframes kb{from{transform:scale(1)}to{transform:scale(1.08)}}
      .inv-root .frame .slot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);opacity:.5}
      .inv-root .frame .slot svg{width:30px;height:30px}

      .inv-root .kicker{z-index:2;font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
      .inv-root .h1{z-index:2;font-family:var(--display);font-weight:${d.displayWeight || 600};
        font-size:clamp(34px,${d.h1Scale || 7}vw,${d.h1Max || 72}px);line-height:1.12;color:var(--deep);
        text-transform:${d.displayCase || "none"};letter-spacing:${d.displayTracking || "0"}}
      .inv-root .h1.scriptface{font-family:var(--script);font-weight:400;text-transform:none;letter-spacing:0}
      .inv-root .joiner{display:block;font-family:var(--display);font-style:italic;font-size:.38em;color:var(--accent);margin:2px 0;text-transform:none;letter-spacing:0}
      .inv-root .subhead{z-index:2;margin-top:16px;font-family:var(--display);font-size:clamp(16px,2.3vw,22px);color:var(--ink)}
      .inv-root .place{z-index:2;margin-top:8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}

      .inv-root .orn{display:flex;align-items:center;justify-content:center;gap:11px;margin:18px auto 0;max-width:250px;z-index:2}
      .inv-root .orn i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--accent-soft))}
      .inv-root .orn i:last-child{background:linear-gradient(270deg,transparent,var(--accent-soft))}
      .inv-root .orn b{color:var(--accent);font-size:11px;font-weight:400}

      .inv-root .cd{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(7px,2.2vw,16px);margin-top:26px;z-index:2}
      .inv-root .cd div{min-width:66px;padding:11px 8px;border-radius:var(--radius);border:1px solid var(--accent-soft);background:var(--surface)}
      .inv-root .cd .n{font-family:var(--display);font-size:25px;font-weight:${d.displayWeight || 600};color:var(--deep);line-height:1}
      .inv-root .cd .l{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:5px}

      /* ── sections ── */
      .inv-root .sec{position:relative;padding:clamp(64px,9vw,104px) 22px;overflow:hidden}
      .inv-root .sec.invert{background:var(--deep);color:var(--on-deep)}
      .inv-root .sec .deco{position:absolute;background-image:var(--motif);background-size:contain;background-repeat:no-repeat;
        width:230px;height:230px;opacity:calc(var(--density)*.5);pointer-events:none}
      .inv-root .sec .deco.tl{top:-30px;left:-40px}
      .inv-root .sec .deco.br{bottom:-30px;right:-40px;transform:scale(-1,-1)}
      .inv-root .sec .deco.inv{opacity:calc(var(--density)*.28);filter:brightness(0) invert(1)}
      .inv-root .wrap{max-width:1000px;margin:0 auto;position:relative;z-index:2}

      .inv-root .eyebrow{text-align:center;font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
      .inv-root .sec.invert .eyebrow{color:var(--accent-soft)}
      .inv-root .h2{text-align:center;font-family:var(--display);font-weight:${d.displayWeight || 600};
        font-size:clamp(26px,4.6vw,42px);color:var(--deep);text-transform:${d.displayCase || "none"};letter-spacing:${d.displayTracking || "0"}}
      .inv-root .h2.scriptface{font-family:var(--script);font-weight:400;text-transform:none;letter-spacing:0;font-size:clamp(30px,5.2vw,48px)}
      .inv-root .sec.invert .h2{color:var(--on-deep)}
      .inv-root .rule{width:0;height:1px;margin:14px auto 18px;background:linear-gradient(90deg,transparent,var(--accent),transparent);transition:width 1.1s ease .2s}
      .inv-root .reveal.in .rule{width:110px}
      .inv-root .lede{max-width:620px;margin:0 auto;text-align:center;color:var(--muted);font-size:15px;line-height:1.9}
      .inv-root .sec.invert .lede{color:rgba(255,255,255,.7)}

      .inv-root .reveal{opacity:0;transform:translateY(24px);transition:opacity .85s ease,transform .85s cubic-bezier(.19,.86,.32,1)}
      .inv-root .reveal.in{opacity:1;transform:none}

      .inv-root .cards{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:20px;margin-top:40px}
      @media(max-width:900px){.inv-root .cards{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:560px){.inv-root .cards{grid-template-columns:1fr}}
      .inv-root .card{background:var(--surface);border:1px solid var(--accent-soft);border-radius:var(--radius);
        padding:32px 24px;text-align:center;transition:transform .45s cubic-bezier(.2,.7,.3,1),box-shadow .45s ease}
      .inv-root .card:hover{transform:translateY(-5px);box-shadow:0 18px 38px rgba(0,0,0,.12)}
      .inv-root .sec.invert .card{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}
      .inv-root .card .ic{width:30px;height:30px;margin:0 auto 14px;color:var(--accent)}
      .inv-root .sec.invert .card .ic{color:var(--accent-soft)}
      .inv-root .card .ic svg{width:100%;height:100%}
      .inv-root .card h3{font-family:var(--display);font-size:21px;font-weight:${d.displayWeight || 600};color:var(--deep);margin-bottom:6px}
      .inv-root .sec.invert .card h3{color:var(--on-deep)}
      .inv-root .card .meta{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
      .inv-root .card p{font-size:13.5px;line-height:1.8;color:var(--muted)}
      .inv-root .sec.invert .card p{color:rgba(255,255,255,.72)}
      .inv-root .cardlink{display:inline-block;margin-top:14px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;
        color:var(--accent);border-bottom:1px solid var(--accent-soft);padding-bottom:2px}

      .inv-root .rows{max-width:620px;margin:34px auto 0;border-top:1px solid var(--accent-soft)}
      .inv-root .row{display:flex;justify-content:space-between;gap:20px;padding:15px 4px;border-bottom:1px solid var(--accent-soft)}
      .inv-root .row dt{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);padding-top:3px}
      .inv-root .row dd{font-family:var(--display);font-size:17px;color:var(--deep);text-align:right}
      .inv-root .sec.invert .row dd{color:var(--on-deep)}

      .inv-root .grid{display:grid;grid-template-columns:1fr 1.25fr;grid-auto-rows:190px;gap:13px;margin-top:40px}
      .inv-root .tile{position:relative;overflow:hidden;border-radius:var(--radius);border:1px solid var(--accent-soft);
        background:linear-gradient(150deg,var(--surface),var(--accent-soft));transition:transform .5s cubic-bezier(.2,.7,.3,1)}
      .inv-root .tile.tall{grid-row:span 2}
      .inv-root .tile:hover{transform:translateY(-5px)}
      .inv-root .tile img{width:100%;height:100%;object-fit:cover;object-position:center 25%;transition:transform .8s ease}
      .inv-root .tile:hover img{transform:scale(1.06)}
      .inv-root .tile .slot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);opacity:.45}
      .inv-root .tile .slot svg{width:26px;height:26px}

      .inv-root .cta{text-align:center}
      .inv-root .btn{position:relative;display:inline-block;margin-top:26px;padding:14px 42px;border-radius:${d.corner === "sharp" ? "2px" : "40px"};
        background:var(--deep);color:var(--on-deep);font-size:11px;letter-spacing:.2em;text-transform:uppercase;overflow:hidden;
        box-shadow:0 12px 28px rgba(0,0,0,.2);transition:transform .35s ease}
      .inv-root .sec.invert .btn{background:var(--accent);color:var(--deep)}
      .inv-root .btn:hover{transform:translateY(-3px)}
      .inv-root .btn span{position:relative;z-index:2}
      .inv-root .btn::before{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);animation:sw 3.4s ease-in-out infinite}
      @keyframes sw{0%{left:-60%}55%,100%{left:120%}}
      .inv-root .note{margin-top:18px;font-size:12px;font-style:italic;color:var(--muted);font-family:var(--display)}

      .inv-root footer{background:var(--deep);color:rgba(255,255,255,.62);text-align:center;padding:48px 22px 40px;position:relative;overflow:hidden}
      .inv-root footer .fmark{font-family:var(--script);font-size:29px;color:var(--accent-soft);margin-bottom:7px}
      .inv-root footer .fline{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase}

      @media(max-width:640px){
        .inv-root .grid{grid-template-columns:1fr;grid-auto-rows:210px}
        .inv-root .tile.tall{grid-row:span 1}
        .inv-root .sec{padding:56px 18px}
      }
      @media(prefers-reduced-motion:reduce){
        .inv-root *{animation-duration:.01ms!important;transition-duration:.01ms!important}
      }
    </style>

    <div class="inv-root">
      ${d.reveal === "veil" ? `<div class="veil"><div class="pane l"></div><div class="pane r"></div><div class="mark">${esc(ct.monogram || "")}</div></div>` : ""}

      <div class="hero">
        <div class="deco tl"></div><div class="deco tr"></div>
        <div class="deco bl"></div><div class="deco br"></div>

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
          <div><div class="n" data-cd="h">00</div><div class="l">Hours</div></div>
          <div><div class="n" data-cd="m">00</div><div class="l">Mins</div></div>
          <div><div class="n" data-cd="s">00</div><div class="l">Secs</div></div>
        </div>` : ""}
      </div>

      ${(ct.sections || []).map((s) => (SECTIONS[s.type] ? SECTIONS[s.type](s) : "")).join("")}

      <footer>
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
