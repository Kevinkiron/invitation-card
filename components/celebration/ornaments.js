/* ══════════════════════════════════════════════════════════════════════
   CELEBRATION ORNAMENTS

   The wedding template is expensive-looking mostly because of what
   surrounds the words — bulbs, lanterns, blooms, a medallion. The same
   argument holds for the other three celebrations, but the vocabulary is
   different: a birthday wants candles and bunting, a naming ceremony
   wants a cradle and a moon, a griha pravesh wants a doorway, a diya and
   a rangoli. Recolouring the wedding ornaments would give three pages
   that are the same page, which is the one outcome worth avoiding.

   Everything here is inline SVG. No external asset, no network request,
   no icon font, and nothing traced from an existing artwork — a candle,
   a cradle, a key and a lamp are geometry, and geometry can be drawn.
   Each piece takes its colours from the palette, so a plum-and-amber
   birthday and a powder-blue naming get the same craft in their own hues.

   Every piece is `aria-hidden`: it is decoration, and a screen reader
   should hear the invitation, not the frame around it.

   ── On gradient ids ──
   Two instances of the same ornament in different colours would share a
   `<defs>` id and the second would silently inherit the first one's
   gradient — the classic "both lanterns went gold" bug. Every piece that
   defines a gradient therefore takes an `id` prop and suffixes with it.
   ══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════
   SHARED GEOMETRY
   ══════════════════════════════════════════════════════════════════════ */

/* A four-point sparkle. Concave sides are what separate a sparkle from a
   plus sign, so the control points sit well inside the radius. */
function star4(cx, cy, r, waist = 0.2) {
  const w = r * waist;
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + w} ${cy - w} ${cx + r} ${cy}`,
    `Q${cx + w} ${cy + w} ${cx} ${cy + r}`,
    `Q${cx - w} ${cy + w} ${cx - r} ${cy}`,
    `Q${cx - w} ${cy - w} ${cx} ${cy - r}`,
    "Z",
  ].join(" ");
}

/* A five-point star, for the party frame's corners. */
function star5(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.42 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/* A flame: a teardrop with a pinched tip, drawn from its base so the
   caller only has to say where the wick is. */
function flamePath(x, y, h = 20, w = 7) {
  return `M${x} ${y - h} C${x + w} ${y - h * 0.55} ${x + w * 0.85} ${y} ${x} ${y} C${x - w * 0.85} ${y} ${x - w} ${y - h * 0.55} ${x} ${y - h} Z`;
}

/* ══════════════════════════════════════════════════════════════════════
   BIRTHDAY — candles, bunting, sparklers, the age
   ══════════════════════════════════════════════════════════════════════ */

/* ── Bunting ───────────────────────────────────────────────────────────
   Flags on a sagging thread. The flags are laid along a quadratic curve
   and rotated to its tangent, rather than hung straight down from a
   curved line: a flag that ignores the tangent reads as a row of
   triangles that happen to sit under a wire, which is exactly how cheap
   bunting clip-art looks. */
export function BuntingGarland({
  colors = ["#f0a63c", "#a8385c", "#fff4e2"],
  thread = "#c98b43",
  flags = 11,
  id = "a",
}) {
  const P0 = [4, 7], P1 = [150, 44], P2 = [296, 7];
  const at = (t) => {
    const u = 1 - t;
    return [
      u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
      u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
    ];
  };
  const slope = (t) => {
    const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  return (
    <svg className="cc-bunting" viewBox="0 0 300 62" aria-hidden="true" focusable="false">
      <path
        d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
        fill="none"
        stroke={thread}
        strokeOpacity=".7"
        strokeWidth="1.4"
      />
      {Array.from({ length: flags }, (_, i) => {
        const t = 0.05 + (i * 0.9) / (flags - 1);
        const [x, y] = at(t);
        const fill = colors[i % colors.length];
        return (
          <g
            key={i}
            className="cc-bunting-flag"
            transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${slope(t).toFixed(2)})`}
            style={{ animationDelay: `${(i % 5) * 0.34}s` }}
          >
            <path d="M-9 0 L9 0 L0 21 Z" fill={fill} opacity=".92" />
            <path d="M-9 0 L9 0 L0 21 Z" fill="none" stroke="#00000022" strokeWidth=".6" />
            <path d="M-9 0 L0 21 L-3 0 Z" fill="#ffffff" opacity=".16" />
          </g>
        );
      })}
    </svg>
  );
}

/* ── Candles ───────────────────────────────────────────────────────────
   Three or five, never an even number: an even row reads as a fence.
   Heights are staggered from a fixed table rather than randomised so the
   cluster is identical on the server and on the client — a random height
   here is a hydration mismatch, and React will warn about it on every
   guest's first paint. */
const CANDLE_LIFT = [0, 10, -6, 14, 4, -3, 8];

export function CandleCluster({
  wax = "#fff4e2",
  stripe = "#a8385c",
  flame = "#f0a63c",
  glow = "#ffd88a",
  count = 3,
  id = "a",
}) {
  const n = Math.max(1, Math.min(7, count));
  const step = 150 / (n + 1);
  return (
    <svg className="cc-candles" viewBox="0 0 150 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-wax-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={wax} stopOpacity=".55" />
          <stop offset="42%" stopColor={wax} />
          <stop offset="100%" stopColor={wax} stopOpacity=".6" />
        </linearGradient>
        <radialGradient id={`cc-flamehalo-${id}`}>
          <stop offset="0%" stopColor={glow} stopOpacity=".55" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cc-flame-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={flame} />
          <stop offset="55%" stopColor={glow} />
          <stop offset="100%" stopColor="#fff6dd" />
        </linearGradient>
      </defs>

      {Array.from({ length: n }, (_, i) => {
        const x = step * (i + 1);
        const top = 52 - CANDLE_LIFT[i % CANDLE_LIFT.length];
        return (
          <g key={i}>
            {/* body */}
            <rect
              x={x - 6.5} y={top} width="13" height={108 - top}
              rx="4" fill={`url(#cc-wax-${id})`}
            />
            {/* two barber stripes, clipped to the body by simply being
                shorter than it — a clipPath per candle is four extra
                defs for a detail nobody will zoom into */}
            <path d={`M${x - 6.5} ${top + 14} l13 -7`} stroke={stripe} strokeOpacity=".55" strokeWidth="3.2" />
            <path d={`M${x - 6.5} ${top + 30} l13 -7`} stroke={stripe} strokeOpacity=".4" strokeWidth="3.2" />
            {/* wick */}
            <path d={`M${x} ${top} v-5`} stroke="#4a3426" strokeOpacity=".75" strokeWidth="1.4" />
            {/* flame */}
            <circle cx={x} cy={top - 16} r="17" fill={`url(#cc-flamehalo-${id})`} />
            <g className="cc-flame" style={{ animationDelay: `${i * 0.37}s`, transformOrigin: `${x}px ${top - 5}px` }}>
              <path d={flamePath(x, top - 5, 21, 6.4)} fill={`url(#cc-flame-${id})`} />
              <path d={flamePath(x, top - 7, 10, 2.8)} fill="#fff8e6" opacity=".8" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Sparkler burst ────────────────────────────────────────────────────
   Rays of three different lengths with a bead on each tip. Uniform rays
   read as a sun; it is the unevenness that makes it a sparkler. */
export function SparklerBurst({ color = "#f0a63c", glow = "#ffd88a", rays = 18, id = "a" }) {
  const LEN = [34, 20, 27, 16, 31];
  return (
    <svg className="cc-sparkler" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`cc-spark-${id}`}>
          <stop offset="0%" stopColor="#fff6dd" />
          <stop offset="55%" stopColor={glow} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="26" fill={`url(#cc-spark-${id})`} opacity=".55" />
      {Array.from({ length: rays }, (_, i) => {
        const a = ((Math.PI * 2) / rays) * i;
        const len = LEN[i % LEN.length];
        const x0 = 60 + Math.cos(a) * 12, y0 = 60 + Math.sin(a) * 12;
        const x1 = 60 + Math.cos(a) * (12 + len), y1 = 60 + Math.sin(a) * (12 + len);
        return (
          <g key={i} className="cc-spark-ray" style={{ animationDelay: `${(i % 6) * 0.22}s` }}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeOpacity=".75" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx={x1} cy={y1} r={i % 3 ? 1.6 : 2.4} fill={glow} />
          </g>
        );
      })}
      <circle cx="60" cy="60" r="5.5" fill="#fff6dd" />
    </svg>
  );
}

/* ── The age ───────────────────────────────────────────────────────────
   A birthday is the one invitation where a number is the hero, so it gets
   a lockup of its own rather than a line of body text. `value` arrives as
   an ordinal string ("7th", "60th"); the digits are set large and the
   suffix rides up beside them.

   A number of unknown length in a fixed circle is how a "100th" ends up
   spilling past the ring, so the type scale steps down with the digit
   count instead of being one fixed size. */
export function AgeBadge({ value = "", ink = "#fff4e2", ring = "#f0a63c", glow = "#ffd88a", id = "a" }) {
  const digits = String(value).match(/\d+/)?.[0] || "";
  const suffix = String(value).replace(digits, "").trim().slice(0, 3);
  if (!digits) return null;
  const size = digits.length >= 3 ? 44 : digits.length === 2 ? 56 : 66;

  return (
    <svg className="cc-agebadge" viewBox="0 0 140 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-age-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ring} />
          <stop offset="50%" stopColor={glow} />
          <stop offset="100%" stopColor={ring} />
        </linearGradient>
      </defs>
      {/* scalloped outer edge */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = ((Math.PI * 2) / 22) * i;
        return <circle key={i} cx={70 + Math.cos(a) * 62} cy={70 + Math.sin(a) * 62} r="4.6" fill={`url(#cc-age-${id})`} opacity={i % 2 ? 0.5 : 0.9} />;
      })}
      <circle cx="70" cy="70" r="56" fill="none" stroke={`url(#cc-age-${id})`} strokeWidth="1.6" strokeOpacity=".8" />
      <circle cx="70" cy="70" r="49" fill="none" stroke={ring} strokeWidth=".8" strokeOpacity=".4" />
      <text
        x={suffix ? 64 : 70} y="72" textAnchor="middle" dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif" fontSize={size} fill={ink}
      >
        {digits}
      </text>
      {suffix && (
        <text
          x={64 + size * 0.34} y={70 - size * 0.28} textAnchor="start" dominantBaseline="central"
          fontFamily="Georgia, 'Times New Roman', serif" fontSize={size * 0.32} fill={ring}
        >
          {suffix}
        </text>
      )}
    </svg>
  );
}

/* ── The card frame ────────────────────────────────────────────────────
   A double rule with a dotted inner line. It stretches to whatever the
   card turns out to be, so `preserveAspectRatio` is off and every stroke
   is non-scaling — without that the vertical rules come out three times
   heavier than the horizontal ones on a tall card. The corner stars are
   NOT in here: a circle in a stretched viewBox is an ellipse, and five
   squashed stars is worse than none. They are separate square SVGs the
   component parks in the corners. */
export function PartyFrame({ color = "#f0a63c", inset = 9 }) {
  const W = 300, H = 520;
  const x0 = inset, y0 = inset, x1 = W - inset, y1 = H - inset;
  return (
    <svg className="cc-frame" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect
        x={x0} y={y0} width={x1 - x0} height={y1 - y0}
        fill="none" stroke={color} strokeOpacity=".62" strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={x0 + 6} y={y0 + 6} width={x1 - x0 - 12} height={y1 - y0 - 12}
        fill="none" stroke={color} strokeOpacity=".34" strokeWidth="1"
        strokeDasharray="2 6" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* A corner star, square viewBox so it keeps its shape whatever the card
   does. Rotated per corner by the caller. */
export function CornerStar({ color = "#f0a63c", glow = "#ffd88a", id = "a" }) {
  return (
    <svg className="cc-cornerstar" viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`cc-cs-${id}`}>
          <stop offset="0%" stopColor={glow} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <path d={star5(30, 30, 18)} fill={`url(#cc-cs-${id})`} opacity=".9" />
      <path d={star4(12, 13, 7)} fill={color} opacity=".55" />
      <path d={star4(48, 46, 5)} fill={color} opacity=".4" />
    </svg>
  );
}

/* A divider: two hairlines with a star and two beads between them. */
export function StarRule({ color = "#f0a63c" }) {
  return (
    <svg className="cc-rule" viewBox="0 0 220 16" aria-hidden="true" focusable="false">
      <line x1="0" y1="8" x2="86" y2="8" stroke={color} strokeOpacity=".45" strokeWidth="1" />
      <line x1="134" y1="8" x2="220" y2="8" stroke={color} strokeOpacity=".45" strokeWidth="1" />
      <path d={star5(110, 8, 7)} fill={color} opacity=".9" />
      <circle cx="95" cy="8" r="1.7" fill={color} opacity=".6" />
      <circle cx="125" cy="8" r="1.7" fill={color} opacity=".6" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NAMING CEREMONY — cradle, moon, small feet
   ══════════════════════════════════════════════════════════════════════ */

/* ── The cradle ────────────────────────────────────────────────────────
   A rocker, a basket, a hood and a star on a thread. Rocking is left to
   CSS on `.cc-cradle`, which transforms the whole SVG — safe here
   because nothing `position: fixed` lives inside a scene. */
export function CradleMotif({
  wood = "#d9c089",
  cloth = "#d99aa6",
  hood = "#fbf7f2",
  star = "#d9c089",
  id = "a",
}) {
  return (
    <svg className="cc-cradle" viewBox="0 0 200 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-cloth-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hood} />
          <stop offset="100%" stopColor={cloth} />
        </linearGradient>
      </defs>

      {/* the star on its thread, hung above the hood */}
      <path d="M150 16 V38" stroke={star} strokeOpacity=".45" strokeWidth="1" />
      <path d={star4(150, 46, 9)} fill={star} opacity=".85" />

      {/* rocker */}
      <path d="M32 132 Q100 162 168 132" fill="none" stroke={wood} strokeWidth="4" strokeLinecap="round" strokeOpacity=".8" />
      {/* basket */}
      <path d="M36 92 L164 92 L150 128 Q100 142 50 128 Z" fill={`url(#cc-cloth-${id})`} />
      <path d="M36 92 L164 92" stroke={wood} strokeWidth="3" strokeLinecap="round" strokeOpacity=".85" />
      {/* a fold in the blanket, so the basket is not a flat slab */}
      <path d="M48 104 Q100 120 152 104" fill="none" stroke={hood} strokeOpacity=".7" strokeWidth="2" />
      {/* hood over the head end */}
      <path d="M40 92 A38 38 0 0 1 116 92 Z" fill={hood} opacity=".92" />
      <path d="M40 92 A38 38 0 0 1 116 92" fill="none" stroke={wood} strokeOpacity=".7" strokeWidth="2" />
      <path d="M56 92 A22 22 0 0 1 100 92" fill="none" stroke={cloth} strokeOpacity=".6" strokeWidth="1.4" />
      {/* the legs that meet the rocker */}
      <path d="M62 128 L58 138 M138 128 L142 138" stroke={wood} strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── Moon and stars ────────────────────────────────────────────────────
   The crescent is a masked circle rather than two stacked fills, so it
   works over a photograph: two fills only look like a crescent when the
   top one exactly matches the background behind it, which on a hero
   image it never does. */
export function MoonStars({ moon = "#d9c089", star = "#fbf7f2", glow = "#d9c089", id = "a" }) {
  const dust = [
    [26, 34, 6], [150, 28, 8], [168, 96, 5], [42, 122, 5.5], [122, 148, 4.5], [14, 84, 4],
  ];
  return (
    <svg className="cc-moon" viewBox="0 0 190 170" aria-hidden="true" focusable="false">
      <defs>
        <mask id={`cc-moonmask-${id}`}>
          <circle cx="86" cy="82" r="46" fill="#fff" />
          <circle cx="110" cy="66" r="40" fill="#000" />
        </mask>
        <radialGradient id={`cc-moonglow-${id}`}>
          <stop offset="0%" stopColor={glow} stopOpacity=".38" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="86" cy="82" r="66" fill={`url(#cc-moonglow-${id})`} />
      <circle cx="86" cy="82" r="46" fill={moon} mask={`url(#cc-moonmask-${id})`} />
      {dust.map(([cx, cy, r], i) => (
        <path
          key={i} d={star4(cx, cy, r)} fill={star}
          className="cc-twinkle" style={{ animationDelay: `${i * 0.6}s` }}
          opacity=".8"
        />
      ))}
    </svg>
  );
}

/* ── Two small footprints ──────────────────────────────────────────────
   A pad and five toes, mirrored and offset so they read as a step rather
   than a pair of stamps. */
function OneFoot({ cx, cy, rot, flip, fill }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`} fill={fill}>
      <ellipse cx="0" cy="5" rx="11" ry="15" />
      <circle cx="-8.5" cy="-12.5" r="3.4" />
      <circle cx="-2" cy="-16.5" r="3.8" />
      <circle cx="4.5" cy="-16.5" r="3.4" />
      <circle cx="9.8" cy="-13.5" r="2.8" />
      <circle cx="13.6" cy="-9.4" r="2.2" />
    </g>
  );
}

export function TinyFeet({ color = "#d99aa6" }) {
  return (
    <svg className="cc-feet" viewBox="0 0 130 96" aria-hidden="true" focusable="false">
      <OneFoot cx={40} cy={40} rot={-14} flip={false} fill={color} />
      <OneFoot cx={86} cy={58} rot={12} flip fill={color} />
    </svg>
  );
}

/* ── The soft arch frame ───────────────────────────────────────────────
   The naming card is an arch, not a rectangle: it is the shape of a
   window over a cot. Stretched with the card like PartyFrame, and for
   the same reason every stroke is non-scaling. */
export function ArchFrame({ color = "#d9c089", inset = 10 }) {
  const W = 300, H = 520;
  const a = inset, b = W - inset, bot = H - inset;
  const arch = (o) =>
    `M${a + o} ${bot} L${a + o} ${150} Q${a + o} ${inset + o} ${W / 2} ${inset + o} Q${b - o} ${inset + o} ${b - o} ${150} L${b - o} ${bot}`;
  return (
    <svg className="cc-frame" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={arch(0)} fill="none" stroke={color} strokeOpacity=".6" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
      <path d={arch(8)} fill="none" stroke={color} strokeOpacity=".3" strokeWidth=".9" vectorEffect="non-scaling-stroke" />
      <line x1={a} y1={bot} x2={b} y2={bot} stroke={color} strokeOpacity=".6" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* A divider: a small cloud between two hairlines, with a sparkle either
   side. */
export function CloudRule({ color = "#d9c089", cloud = "#fbf7f2" }) {
  return (
    <svg className="cc-rule" viewBox="0 0 220 24" aria-hidden="true" focusable="false">
      <line x1="0" y1="14" x2="80" y2="14" stroke={color} strokeOpacity=".4" strokeWidth="1" />
      <line x1="140" y1="14" x2="220" y2="14" stroke={color} strokeOpacity=".4" strokeWidth="1" />
      <g opacity=".95">
        <circle cx="100" cy="13" r="6.5" fill={cloud} />
        <circle cx="110" cy="9.5" r="8.5" fill={cloud} />
        <circle cx="121" cy="13" r="6" fill={cloud} />
        <rect x="93" y="13" width="34" height="6" rx="3" fill={cloud} />
      </g>
      <path d={star4(88, 8, 4)} fill={color} opacity=".7" />
      <path d={star4(133, 18, 3.4)} fill={color} opacity=".6" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HOUSEWARMING — doorway, diya, rangoli, key
   ══════════════════════════════════════════════════════════════════════ */

/* ── The doorway ───────────────────────────────────────────────────────
   An arched door with two leaves, a threshold step and a torana over the
   lintel. It is the motif for the opening scene, where the leaves are
   swung open by CSS — `.cc-door-l` / `.cc-door-r` are the hinges, and
   they are transformed, which is safe because nothing fixed lives inside
   a scene. */
export function DoorwayArch({
  wood = "#b45a35",
  brass = "#c2913f",
  deep = "#2f5d4a",
  open = false,
  id = "a",
}) {
  return (
    <svg className={`cc-doorway ${open ? "cc-doorway-open" : ""}`} viewBox="0 0 170 210" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-door-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={wood} stopOpacity=".95" />
          <stop offset="60%" stopColor={wood} stopOpacity=".7" />
          <stop offset="100%" stopColor={wood} stopOpacity=".95" />
        </linearGradient>
        <clipPath id={`cc-doorclip-${id}`}>
          <path d="M26 190 L26 78 Q26 26 85 26 Q144 26 144 78 L144 190 Z" />
        </clipPath>
      </defs>

      {/* the dark of the room behind the leaves */}
      <path d="M26 190 L26 78 Q26 26 85 26 Q144 26 144 78 L144 190 Z" fill={deep} opacity=".5" />

      <g clipPath={`url(#cc-doorclip-${id})`}>
        <g className="cc-door-l">
          <rect x="26" y="26" width="59" height="164" fill={`url(#cc-door-${id})`} />
          <rect x="35" y="52" width="41" height="52" rx="4" fill="none" stroke={brass} strokeOpacity=".5" strokeWidth="1.2" />
          <rect x="35" y="116" width="41" height="58" rx="4" fill="none" stroke={brass} strokeOpacity=".4" strokeWidth="1.2" />
          <circle cx="78" cy="118" r="3.4" fill={brass} />
        </g>
        <g className="cc-door-r">
          <rect x="85" y="26" width="59" height="164" fill={`url(#cc-door-${id})`} />
          <rect x="94" y="52" width="41" height="52" rx="4" fill="none" stroke={brass} strokeOpacity=".5" strokeWidth="1.2" />
          <rect x="94" y="116" width="41" height="58" rx="4" fill="none" stroke={brass} strokeOpacity=".4" strokeWidth="1.2" />
          <circle cx="92" cy="118" r="3.4" fill={brass} />
        </g>
      </g>

      {/* the jamb and the arch above it */}
      <path
        d="M20 192 L20 78 Q20 20 85 20 Q150 20 150 78 L150 192"
        fill="none" stroke={brass} strokeOpacity=".8" strokeWidth="3.4" strokeLinecap="round"
      />
      {/* the threshold — the line the family steps over */}
      <path d="M10 192 L160 192" stroke={brass} strokeWidth="4" strokeLinecap="round" />
      <path d="M18 199 L152 199" stroke={brass} strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
      {/* keystone mark */}
      <path d={star4(85, 30, 7)} fill={brass} opacity=".8" />
    </svg>
  );
}

/* ── A lit diya ────────────────────────────────────────────────────────
   Shallow clay bowl, oil, a wick at the near lip and a flame that leans.
   The glow is a radial fill rather than a blur filter — an SVG filter on
   a repeated ornament is the one thing on this page that makes an old
   Android phone drop frames. */
export function Diya({ clay = "#b45a35", oil = "#c2913f", flame = "#f0a63c", glow = "#ffd88a", id = "a" }) {
  return (
    <svg className="cc-diya" viewBox="0 0 130 110" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-clay-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={clay} />
          <stop offset="100%" stopColor={clay} stopOpacity=".55" />
        </linearGradient>
        <radialGradient id={`cc-diyaglow-${id}`}>
          <stop offset="0%" stopColor={glow} stopOpacity=".6" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cc-diyaflame-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={flame} />
          <stop offset="60%" stopColor={glow} />
          <stop offset="100%" stopColor="#fff6dd" />
        </linearGradient>
      </defs>

      <circle cx="96" cy="44" r="40" fill={`url(#cc-diyaglow-${id})`} />
      {/* the bowl */}
      <path d="M16 62 Q65 104 114 62 Z" fill={`url(#cc-clay-${id})`} />
      <ellipse cx="65" cy="62" rx="49" ry="9" fill={clay} />
      <ellipse cx="65" cy="61" rx="41" ry="6" fill={oil} opacity=".85" />
      {/* the pinched lip and its wick */}
      <path d="M104 56 L124 50 L110 64 Z" fill={clay} />
      <path d="M110 54 l6 -8" stroke="#4a3426" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
      <g className="cc-flame" style={{ transformOrigin: "116px 48px" }}>
        <path d={flamePath(116, 46, 26, 8)} fill={`url(#cc-diyaflame-${id})`} />
        <path d={flamePath(116, 43, 12, 3.4)} fill="#fff8e6" opacity=".85" />
      </g>
      {/* the base it sits on */}
      <path d="M38 88 Q65 96 92 88" fill="none" stroke={clay} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Rangoli ───────────────────────────────────────────────────────────
   Geometric, not floral: diamonds, dots and two rings, the vocabulary of
   a powder pattern laid at a doorstep. Stands where the wedding template
   puts its lotus medallion. */
export function RangoliMedallion({ color = "#b45a35", accent = "#c2913f", petals = 12, size = 96, id = "a" }) {
  const n = Math.max(6, Math.min(16, petals));
  return (
    <svg
      className="cc-rangoli" viewBox="0 0 120 120" width={size} height={size}
      aria-hidden="true" focusable="false"
    >
      <defs>
        <linearGradient id={`cc-rang-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / n) * i} 60 60)`}>
          <path d="M60 10 L66 28 L60 46 L54 28 Z" fill={`url(#cc-rang-${id})`} opacity={i % 2 ? 0.45 : 0.85} />
          <circle cx="60" cy="52" r="2" fill={accent} opacity=".7" />
        </g>
      ))}
      <circle cx="60" cy="60" r="30" fill="none" stroke={accent} strokeOpacity=".6" strokeWidth="1.1" />
      <circle cx="60" cy="60" r="24" fill="none" stroke={color} strokeOpacity=".45" strokeWidth=".8" strokeDasharray="3 5" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M60 38 L67 60 L60 82 L53 60 Z" transform={`rotate(${45 * i} 60 60)`} fill={color} opacity=".3" />
      ))}
      <circle cx="60" cy="60" r="7.5" fill={accent} opacity=".9" />
      <circle cx="60" cy="60" r="3.2" fill={color} />
    </svg>
  );
}

/* ── A key ─────────────────────────────────────────────────────────────
   The small ornament for the date reveal: the thing actually handed over
   at a griha pravesh. */
export function HouseKey({ metal = "#c2913f", id = "a" }) {
  return (
    <svg className="cc-key" viewBox="0 0 130 54" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-key-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2ddb0" />
          <stop offset="55%" stopColor={metal} />
          <stop offset="100%" stopColor={metal} stopOpacity=".7" />
        </linearGradient>
      </defs>
      <circle cx="26" cy="27" r="17" fill="none" stroke={`url(#cc-key-${id})`} strokeWidth="6" />
      <circle cx="26" cy="27" r="6" fill="none" stroke={metal} strokeOpacity=".5" strokeWidth="2" />
      <rect x="42" y="24" width="72" height="6" rx="3" fill={`url(#cc-key-${id})`} />
      <path d="M96 30 h6 v11 h-6 z M108 30 h6 v8 h-6 z" fill={`url(#cc-key-${id})`} />
      <path d={star4(120, 14, 5)} fill={metal} opacity=".55" />
    </svg>
  );
}

/* ── Torana ────────────────────────────────────────────────────────────
   The string of mango leaves hung over a doorway. Leaves are laid along
   the sag and rotated to it, same argument as the bunting. */
export function ToranaRule({ leaf = "#2f5d4a", thread = "#c2913f", bud = "#f0a63c", count = 13, id = "a" }) {
  const P0 = [4, 6], P1 = [140, 34], P2 = [276, 6];
  const at = (t) => {
    const u = 1 - t;
    return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
  };
  const slope = (t) => {
    const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  return (
    <svg className="cc-torana" viewBox="0 0 280 58" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`cc-leaf-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={leaf} />
          <stop offset="100%" stopColor={leaf} stopOpacity=".55" />
        </linearGradient>
      </defs>
      <path d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke={thread} strokeOpacity=".7" strokeWidth="1.3" />
      {Array.from({ length: count }, (_, i) => {
        const t = 0.04 + (i * 0.92) / (count - 1);
        const [x, y] = at(t);
        const marigold = i % 3 === 1;
        return (
          <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${slope(t).toFixed(2)})`}>
            {marigold ? (
              <circle cx="0" cy="9" r="4.4" fill={bud} opacity=".9" />
            ) : (
              <>
                <path d="M0 2 C7 12 7 24 0 32 C-7 24 -7 12 0 2 Z" fill={`url(#cc-leaf-${id})`} />
                <path d="M0 4 V30" stroke={thread} strokeOpacity=".4" strokeWidth=".7" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── The threshold frame ───────────────────────────────────────────────
   A squared-shouldered arch with a lintel, for the housewarming card.
   Stretched, non-scaling strokes — see PartyFrame. */
export function ThresholdFrame({ color = "#c2913f", inset = 10 }) {
  const W = 300, H = 520;
  const a = inset, b = W - inset, bot = H - inset;
  return (
    <svg className="cc-frame" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d={`M${a} ${bot} L${a} 118 Q${a} ${inset} ${W / 2} ${inset} Q${b} ${inset} ${b} 118 L${b} ${bot} Z`}
        fill="none" stroke={color} strokeOpacity=".62" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${a + 9} ${bot - 9} L${a + 9} 124 Q${a + 9} ${inset + 9} ${W / 2} ${inset + 9} Q${b - 9} ${inset + 9} ${b - 9} 124 L${b - 9} ${bot - 9}`}
        fill="none" stroke={color} strokeOpacity=".28" strokeWidth=".9" vectorEffect="non-scaling-stroke"
      />
      {/* the lintel */}
      <line x1={a} y1="118" x2={b} y2="118" stroke={color} strokeOpacity=".4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
