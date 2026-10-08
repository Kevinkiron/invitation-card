"use client";

import { useId } from "react";

/* ══════════════════════════════════════════════════════════════════════
   FAITH ART — the decoration on the wedding invitation card
   (components/WeddingCinema.js → InvitationCard), drawn in gold foil to
   suit the couple's own tradition.

   This replaces the animated LottieFiles stickers (a cartoon dove, a
   cartoon couple, a cartoon mosque) and the emoji-like glyphs that used
   to sit on the card. Everything here is drawn as SVG in the same gold
   as the rest of the invitation, in the style of printed foil stationery:

     FaithCrest   the centrepiece above the names
       hindu      Om in a lotus with a radiant halo and two diyas
       jain       the same lotus and halo with Om
       christian  a cross with trefoil ends in an olive wreath, with two
       catholic   wedding rings linked beneath it
       muslim     a pointed arch with a crescent and star at its apex,
                  Bismillah in Arabic calligraphy inside it
       sikh       Ik Onkar in a ring of petals
       buddhist   a dharma wheel resting on a lotus
       (other)    two linked rings inside a laurel wreath

     FaithTopper  the garland across the top of the card
       hindu/jain/sikh  a toran: marigold swags with mango leaves
       christian        a swag of ivy and white roses with two bells
       muslim           (none — the hanging lanterns already do this)
       buddhist         a strand of lotus buds

     GoldFrame    a fine double rule with knotted corners, in place of
                  the old ring of festoon bulbs

   Scripts (Om, Ik Onkar, Bismillah) are set in Google Fonts loaded only
   when they are needed (Noto Serif Devanagari, Noto Sans Gurmukhi,
   Amiri), so the glyphs are drawn properly on every phone.
   ══════════════════════════════════════════════════════════════════════ */

const FONT_LINKS = {
  hindu: "https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@600&display=swap",
  jain: "https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@600&display=swap",
  sikh: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@600&display=swap",
  muslim: "https://fonts.googleapis.com/css2?family=Amiri:wght@700&display=swap",
};

export function faithKey(religion) {
  const k = String(religion || "").trim().toLowerCase();
  if (k === "catholic") return "christian";
  return ["hindu", "jain", "christian", "muslim", "sikh", "buddhist"].includes(k) ? k : "other";
}

/* The gold: a foil gradient, light catching the top-left. */
/* userSpaceOnUse (in the drawing's own units), not the default
   objectBoundingBox: a perfectly straight line has a zero-width box, and
   a bounding-box gradient on it paints nothing — the dharma wheel's
   spokes vanished that way. */
function Foil({ id, gold, w = 160, h = 136 }) {
  /* repeating diagonal sheen bands, so every piece — large or small —
     has its own highlight like stamped foil */
  const span = Math.max(w, h) * 0.28;
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={span} y2={span} spreadMethod="reflect">
        <stop offset="0" stopColor="#9a7128" />
        <stop offset=".35" stopColor={gold} />
        <stop offset=".6" stopColor="#f6e2a6" />
        <stop offset=".8" stopColor={gold} />
        <stop offset="1" stopColor="#b08433" />
      </linearGradient>
    </defs>
  );
}

const leaf = (x, y, rot, len = 9, w = 3.6) =>
  `M${x} ${y} q${w} ${-len / 2} 0 ${-len} q${-w} ${len / 2} 0 ${len}Z`;

/* A branch of olive / laurel leaves along an arc, for wreaths. */
function Branch({ cx, cy, r, from, to, side, fill, count = 9 }) {
  const out = [];
  for (let i = 0; i <= count; i++) {
    const a = ((from + ((to - from) * i) / count) * Math.PI) / 180;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const deg = (a * 180) / Math.PI + 90 + side * 38;
    const s = 1 - i / (count * 1.6);
    out.push(
      <path key={i} d={leaf(0, 0, 0, 10 * s, 3.8 * s)} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`} fill={fill} />,
      <path key={`o${i}`} d={leaf(0, 0, 0, 10 * s, 3.8 * s)} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(deg - side * 76).toFixed(1)})`} fill={fill} opacity=".85" />,
    );
  }
  const a0 = (from * Math.PI) / 180, a1 = (to * Math.PI) / 180;
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  out.unshift(
    <path key="stem" d={`M${(cx + Math.cos(a0) * r).toFixed(1)} ${(cy + Math.sin(a0) * r).toFixed(1)} A${r} ${r} 0 ${large} ${sweep} ${(cx + Math.cos(a1) * r).toFixed(1)} ${(cy + Math.sin(a1) * r).toFixed(1)}`} fill="none" stroke={fill} strokeWidth="1.1" />,
  );
  return <g>{out}</g>;
}

function Lotus({ cx, cy, w, fill, stroke }) {
  const petals = [
    { a: 0, s: 1 }, { a: -24, s: .86 }, { a: 24, s: .86 }, { a: -50, s: .7 }, { a: 50, s: .7 }, { a: -74, s: .52 }, { a: 74, s: .52 },
  ];
  const h = w * 0.62;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {petals.slice().reverse().map((p, i) => (
        <path
          key={i}
          d={`M0 0 C${w * 0.18} ${-h * 0.35} ${w * 0.16} ${-h * 0.8} 0 ${-h} C${-w * 0.16} ${-h * 0.8} ${-w * 0.18} ${-h * 0.35} 0 0Z`}
          transform={`rotate(${p.a}) scale(${p.s})`}
          fill={fill} stroke={stroke} strokeWidth=".6" opacity={p.a === 0 ? 1 : 0.92}
        />
      ))}
      <path d={`M${-w * 0.5} 1 Q0 ${w * 0.14} ${w * 0.5} 1`} fill="none" stroke={fill} strokeWidth="1.2" />
    </g>
  );
}

function Diya({ x, y, s = 1, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -13 C3.6 -8 3.6 -3.6 0 -1 C-3.6 -3.6 -3.6 -8 0 -13Z" fill="#f6c453" />
      <path d="M0 -10 C1.6 -7.4 1.6 -4.4 0 -2.6 C-1.6 -4.4 -1.6 -7.4 0 -10Z" fill="#fff4cf" />
      <path d="M-11 0 Q0 9 11 0 Q8 6 0 7 Q-8 6 -11 0Z" fill={fill} />
      <path d="M-11 0 Q0 3 11 0" fill="none" stroke={fill} strokeWidth="1" />
    </g>
  );
}

function Halo({ cx, cy, r1, r2, n, fill, op = 0.55 }) {
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const long = i % 2 === 0;
        const r = long ? r2 : r1 + (r2 - r1) * 0.6;
        return (
          <line key={i}
            x1={(cx + Math.cos(a) * r1).toFixed(1)} y1={(cy + Math.sin(a) * r1).toFixed(1)}
            x2={(cx + Math.cos(a) * r).toFixed(1)} y2={(cy + Math.sin(a) * r).toFixed(1)}
            stroke={fill} strokeWidth={long ? 1 : 0.6} strokeLinecap="round" />
        );
      })}
    </g>
  );
}

function Rings({ cx, cy, r, fill }) {
  return (
    <g fill="none" stroke={fill}>
      <circle cx={cx - r * 0.55} cy={cy} r={r} strokeWidth="2.4" />
      <circle cx={cx + r * 0.55} cy={cy} r={r} strokeWidth="2.4" />
      <circle cx={cx - r * 0.55} cy={cy} r={r - 2.2} strokeWidth=".5" opacity=".6" />
      <path d={`M${cx + r * 0.55 - r} ${cy} a${r} ${r} 0 0 1 ${r * 0.62} ${-r * 0.78}`} strokeWidth="2.4" />
      <path d={`M${cx + r * 0.55} ${cy - r - 4} l3 -4 l3 4 l-3 3z`} fill={fill} stroke="none" />
    </g>
  );
}

function Star8({ cx, cy, r, fill }) {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.55 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} />;
}

export function FaithCrest({ faith, gold = "#c69a55" }) {
  const key = faithKey(faith);
  const id = `fc${useId().replace(/:/g, "")}`;
  const F = `url(#${id})`;
  const link = FONT_LINKS[key];

  let art;
  if (key === "christian") {
    art = (
      <>
        <Branch cx={80} cy={70} r={50} from={115} to={235} side={1} fill={F} />
        <Branch cx={80} cy={70} r={50} from={65} to={-55} side={-1} fill={F} />
        <Halo cx={80} cy={56} r1={20} r2={34} n={28} fill={F} op={0.4} />
        {/* cross with trefoil (botonnée) ends */}
        <g fill={F}>
          <rect x="77" y="22" width="6" height="62" rx="1" />
          <rect x="60" y="40" width="40" height="6" rx="1" />
          {[[80, 20], [58, 43], [102, 43]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" />
              <circle cx={x + (i === 0 ? -4 : 0)} cy={y + (i === 0 ? 4 : -4)} r="3" />
              <circle cx={x + (i === 0 ? 4 : 0)} cy={y + (i === 0 ? 4 : 4)} r="3" />
            </g>
          ))}
          <circle cx="80" cy="43" r="6" />
          <circle cx="80" cy="43" r="3" fill="#fff6dc" />
        </g>
        <Rings cx={80} cy={100} r={10} fill={F} />
      </>
    );
  } else if (key === "muslim") {
    const arch = "M42 118 L42 66 C42 40 62 28 80 14 C98 28 118 40 118 66 L118 118";
    art = (
      <>
        <path d={arch} fill="none" stroke={F} strokeWidth="2.2" />
        <path d="M48 118 L48 67 C48 45 65 35 80 23 C95 35 112 45 112 67 L112 118" fill="none" stroke={F} strokeWidth=".8" />
        {/* crescent and star at the apex */}
        <path d="M84 -2 A9 9 0 1 0 84 14 A7 7 0 1 1 84 -2Z" fill={F} transform="translate(-6 -2)" />
        <Star8 cx={86} cy={4} r={3.2} fill={F} />
        <Star8 cx={26} cy={86} r={7} fill={F} />
        <Star8 cx={134} cy={86} r={7} fill={F} />
        <text x="80" y="86" textAnchor="middle" fontFamily="'Amiri', 'Noto Naskh Arabic', serif" fontWeight="700" fontSize="17" fill={F} direction="rtl">
          بِسْمِ ٱللَّٰهِ
        </text>
        <text x="80" y="106" textAnchor="middle" fontFamily="'Amiri', 'Noto Naskh Arabic', serif" fontWeight="700" fontSize="11.5" fill={F} direction="rtl">
          ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </text>
      </>
    );
  } else if (key === "hindu" || key === "jain") {
    art = (
      <>
        <Halo cx={80} cy={56} r1={30} r2={46} n={36} fill={F} op={0.45} />
        <circle cx="80" cy="56" r="27" fill="none" stroke={F} strokeWidth="1.4" />
        <circle cx="80" cy="56" r="23.5" fill="none" stroke={F} strokeWidth=".6" />
        <text x="80" y="57" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Serif Devanagari', serif" fontWeight="600" fontSize="34" fill={F}>ॐ</text>
        <Lotus cx={80} cy={112} w={54} fill={F} stroke="#fff6dc" />
        <Diya x={28} y={108} s={1} fill={F} />
        <Diya x={132} y={108} s={1} fill={F} />
      </>
    );
  } else if (key === "sikh") {
    art = (
      <>
        <Halo cx={80} cy={62} r1={34} r2={48} n={40} fill={F} op={0.4} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M80 28 C85 33 85 38 80 42 C75 38 75 33 80 28Z" fill={F} opacity={i % 2 ? 0.55 : 0.85} transform={`rotate(${i * 30} 80 62)`} />
        ))}
        <circle cx="80" cy="62" r="20" fill="#fffaf0" stroke={F} strokeWidth="1.2" />
        <text x="80" y="63" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Sans Gurmukhi', serif" fontWeight="600" fontSize="24" fill={F}>ੴ</text>
        <Branch cx={80} cy={62} r={52} from={120} to={170} side={1} fill={F} count={5} />
        <Branch cx={80} cy={62} r={52} from={60} to={10} side={-1} fill={F} count={5} />
      </>
    );
  } else if (key === "buddhist") {
    const spokes = Array.from({ length: 8 }, (_, i) => i * 45);
    art = (
      <>
        <Halo cx={80} cy={54} r1={28} r2={42} n={32} fill={F} op={0.4} />
        <g fill="none" stroke={F}>
          <circle cx="80" cy="54" r="24" strokeWidth="2.4" />
          <circle cx="80" cy="54" r="20" strokeWidth=".7" />
          <circle cx="80" cy="54" r="6" strokeWidth="2" />
          {spokes.map((a) => (
            <line key={a} x1="80" y1="48" x2="80" y2="31" strokeWidth="2" transform={`rotate(${a} 80 54)`} />
          ))}
        </g>
        {spokes.map((a) => (
          <circle key={a} cx="80" cy="27" r="2.4" fill={F} transform={`rotate(${a + 22.5} 80 54)`} />
        ))}
        <circle cx="80" cy="54" r="2.5" fill={F} />
        <Lotus cx={80} cy={112} w={60} fill={F} stroke="#fff6dc" />
      </>
    );
  } else {
    art = (
      <>
        <Branch cx={80} cy={66} r={46} from={120} to={235} side={1} fill={F} />
        <Branch cx={80} cy={66} r={46} from={60} to={-55} side={-1} fill={F} />
        <Halo cx={80} cy={64} r1={22} r2={34} n={28} fill={F} op={0.35} />
        <Rings cx={80} cy={68} r={15} fill={F} />
      </>
    );
  }

  return (
    <>
      {link && <link rel="stylesheet" href={link} />}
      <svg className={`wc-crest wc-crest-${key}`} viewBox="0 -8 160 136" aria-hidden="true" focusable="false">
        <Foil id={id} gold={gold} />
        {art}
      </svg>
    </>
  );
}

/* ── Garland across the top of the card ── */
function Marigold({ x, y, r, hi = "#ffd54a", lo = "#e8891a" }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={lo} />
      <circle cx={x - r * 0.15} cy={y - r * 0.15} r={r * 0.72} fill={hi} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.25} fill="#fff3b0" opacity=".8" />
    </g>
  );
}

export function FaithTopper({ faith, gold = "#c69a55" }) {
  const key = faithKey(faith);
  const id = `ft${useId().replace(/:/g, "")}`;
  const F = `url(#${id})`;
  const W = 300;

  if (key === "muslim" || key === "other") return null;

  let art;
  if (key === "hindu" || key === "jain" || key === "sikh") {
    /* toran: three marigold swags, mango leaves hanging between, small bells */
    const anchors = [0, 75, 150, 225, 300];
    const swags = [];
    anchors.slice(0, -1).forEach((ax, s) => {
      const bx = anchors[s + 1], sag = 26;
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * ((ax + bx) / 2) + t * t * bx;
        const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * (4 + sag * 2) + t * t * 4;
        swags.push(<Marigold key={`${s}-${k}`} x={x} y={y} r={k % 2 ? 4.6 : 5.4} hi={k % 2 ? "#ffd54a" : "#ffb300"} lo={k % 2 ? "#e8891a" : "#d9480f"} />);
      }
    });
    const leaves = anchors.map((ax, i) => (
      <g key={i} transform={`translate(${ax} 4)`}>
        {[-14, 0, 14].map((r) => (
          <path key={r} d="M0 0 q6 10 0 22 q-6 -12 0 -22Z" fill="#3f7a3a" stroke="#2c5a28" strokeWidth=".5" transform={`rotate(${r})`} />
        ))}
        <path d="M-4 22 q4 -3 8 0 l-1 6 h-6z" fill={F} />
        <circle cx="0" cy="29" r="1.6" fill={F} />
      </g>
    ));
    art = <>{leaves}{swags}</>;
  } else if (key === "christian") {
    /* a swag of ivy and white roses, two bells tied at the centre */
    const vine = [];
    [[0, 150], [150, 300]].forEach(([ax, bx], s) => {
      for (let k = 0; k <= 18; k++) {
        const t = k / 18;
        const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * ((ax + bx) / 2) + t * t * bx;
        const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 48 + t * t * 4;
        vine.push(<path key={`l${s}${k}`} d="M0 0 q6 -5 11 0 q-5 5 -11 0Z" fill={k % 2 ? "#6f8f5e" : "#88a374"} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(k * 47) % 360})`} />);
        vine.push(<path key={`m${s}${k}`} d="M0 0 q6 -5 11 0 q-5 5 -11 0Z" fill="#5c7d4d" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(k * 47 + 140) % 360})`} />);
        if (k % 3 === 1) {
          vine.push(
            <g key={`r${s}${k}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <circle r="6.6" fill="#fffaf1" stroke="#e2d3b6" strokeWidth=".8" />
              <circle r="4.2" fill="none" stroke="#e8dcc4" strokeWidth=".8" />
              <path d="M-3 0.5 a3 3 0 1 1 6 0 a1.8 1.8 0 1 1 -3.6 0" fill="none" stroke="#cdb994" strokeWidth=".8" />
            </g>,
          );
        }
      }
    });
    const bell = (x, rot) => (
      <g transform={`translate(${x} 14) rotate(${rot})`}>
        <path d="M0 0 C-8 2 -8 14 -11 20 H11 C8 14 8 2 0 0Z" fill={F} />
        <circle cx="0" cy="22" r="2.4" fill={F} />
      </g>
    );
    art = (
      <>
        {vine}
        {bell(141, 12)}
        {bell(159, -12)}
        <path d="M150 8 c-10 -8 -18 0 -6 4 M150 8 c10 -8 18 0 6 4 M150 8 l-6 14 M150 8 l6 14" fill="none" stroke={F} strokeWidth="1.4" strokeLinecap="round" />
      </>
    );
  } else if (key === "buddhist") {
    const buds = [];
    for (let k = 0; k <= 14; k++) {
      const t = k / 14, x = t * W, y = 6 + Math.sin(t * Math.PI) * 26;
      buds.push(
        <path key={k} d="M0 0 C4 -4 4 -9 0 -13 C-4 -9 -4 -4 0 0Z" fill={k % 2 ? "#f2b8c6" : "#f7d3dc"} stroke="#d98aa0" strokeWidth=".5" transform={`translate(${x.toFixed(1)} ${(y + 10).toFixed(1)})`} />,
      );
    }
    art = <><path d={`M0 6 Q150 70 300 6`} fill="none" stroke={F} strokeWidth="1" />{buds}</>;
  }

  return (
    <svg className={`wc-topper wc-topper-${key}`} viewBox={`0 0 ${W} 64`} preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
      <Foil id={id} gold={gold} w={300} h={64} />
      {art}
    </svg>
  );
}

/* ── Fine gold double rule with knotted corners ── */
export function GoldFrame({ gold = "#c69a55" }) {
  const id = `gf${useId().replace(/:/g, "")}`;
  const F = `url(#${id})`;
  const knot = "M0 0 C10 0 14 6 14 14 M0 0 C0 10 6 14 14 14 M6 6 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0";
  return (
    <svg className="wc-goldframe" viewBox="0 0 300 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <Foil id={id} gold={gold} w={300} h={600} />
      <rect x="7" y="7" width="286" height="586" rx="10" fill="none" stroke={F} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <rect x="12" y="12" width="276" height="576" rx="7" fill="none" stroke={F} strokeWidth=".7" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* Corner knots drawn at a fixed size (not stretched with the card). */
const KNOT_TF = { tl: "", tr: "translate(40 0) scale(-1 1)", bl: "translate(0 40) scale(1 -1)", br: "translate(40 40) scale(-1 -1)" };

export function FrameKnots({ gold = "#c69a55" }) {
  const base = `fk${useId().replace(/:/g, "")}`;
  return (
    <>
      {Object.entries(KNOT_TF).map(([pos, tf]) => {
        const gid = `${base}${pos}`;
        return (
          <svg key={pos} className={`wc-knot wc-knot-${pos}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <Foil id={gid} gold={gold} w={40} h={40} />
            <g transform={tf} fill="none" stroke={`url(#${gid})`} strokeWidth="1.3" strokeLinecap="round">
              <path d="M4 30 C4 14 14 4 30 4" />
              <path d="M10 34 C10 20 20 10 34 10" />
              <circle cx="13" cy="13" r="3.4" fill={`url(#${gid})`} stroke="none" />
              <path d="M30 4 c6 0 8 4 6 7 c-2 3 -6 1 -5 -2 M4 30 c0 6 4 8 7 6 c3 -2 1 -6 -2 -5" />
            </g>
          </svg>
        );
      })}
    </>
  );
}
