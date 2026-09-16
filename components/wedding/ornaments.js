/* ══════════════════════════════════════════════════════════════════════
   WEDDING ORNAMENTS

   The reference invitation is expensive-looking mostly because of what
   surrounds the words: a border of gold bulbs, hanging lanterns, blooms
   in the corners, a medallion above the names. None of that is
   photography — it is ornament, and ornament is geometry, so it can be
   drawn rather than licensed.

   Everything here is inline SVG with no external asset and no network
   request. It takes its colours from the palette, so a crimson-and-gold
   wedding and a sage-and-ivory one get the same craft in their own hues.

   Each piece is `aria-hidden`: it is decoration, and a screen reader
   should hear the invitation, not the frame around it.
   ══════════════════════════════════════════════════════════════════════ */

/* ── The bulb border ───────────────────────────────────────────────────
   A string of festoon lights running the full frame. Drawn as circles on
   a path rather than a repeating background so the corners turn properly
   and every bulb gets its own glow and its own beat in the twinkle. */
export function BulbFrame({ gold = "#c69a55", glow = "#ffd88a", inset = 10, bulb = 5.2, gap = 17 }) {
  const W = 300, H = 520;
  const x0 = inset, y0 = inset, x1 = W - inset, y1 = H - inset;

  const pts = [];
  const along = (ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    const n = Math.max(2, Math.round(len / gap));
    for (let i = 0; i < n; i++) pts.push([ax + (dx * i) / n, ay + (dy * i) / n]);
  };
  along(x0, y0, x1, y0);
  along(x1, y0, x1, y1);
  along(x1, y1, x0, y1);
  along(x0, y1, x0, y0);

  return (
    <svg
      className="wc-bulbframe"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="wc-bulb-g">
          <stop offset="0%" stopColor="#fff6dd" />
          <stop offset="45%" stopColor={glow} />
          <stop offset="100%" stopColor={gold} />
        </radialGradient>
        <filter id="wc-bulb-blur" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="3.4" />
        </filter>
      </defs>

      {/* the flex the bulbs are strung on */}
      <rect
        x={x0} y={y0} width={x1 - x0} height={y1 - y0}
        fill="none" stroke={gold} strokeOpacity=".34" strokeWidth=".8"
        vectorEffect="non-scaling-stroke"
      />

      {pts.map(([cx, cy], i) => (
        <g key={i} className="wc-bulb" style={{ animationDelay: `${(i % 9) * 0.26}s` }}>
          <circle cx={cx} cy={cy} r={bulb * 1.9} fill={glow} opacity=".24" filter="url(#wc-bulb-blur)" />
          <circle cx={cx} cy={cy} r={bulb} fill="url(#wc-bulb-g)" />
        </g>
      ))}
    </svg>
  );
}

/* ── Hanging lanterns ──────────────────────────────────────────────────
   Two on each side, on cords of different lengths so they do not read as
   a matched pair, swinging very slightly out of step. */
export function Lantern({ gold = "#c69a55", glow = "#ffd88a", cord = 46 }) {
  return (
    <svg className="wc-lantern" viewBox="0 0 40 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wc-lan-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={gold} stopOpacity=".55" />
          <stop offset="45%" stopColor={glow} stopOpacity=".95" />
          <stop offset="100%" stopColor={gold} stopOpacity=".55" />
        </linearGradient>
        <radialGradient id="wc-lan-halo">
          <stop offset="0%" stopColor={glow} stopOpacity=".5" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="20" y1="0" x2="20" y2={cord} stroke={gold} strokeOpacity=".5" strokeWidth="1" />
      <circle cx="20" cy={cord + 30} r="30" fill="url(#wc-lan-halo)" />
      <path
        d={`M20 ${cord + 2} l9 7 v26 l-9 8 l-9 -8 v-26 z`}
        fill="url(#wc-lan-body)" stroke={gold} strokeOpacity=".7" strokeWidth=".9"
      />
      <path d={`M11 ${cord + 16} h18`} stroke={gold} strokeOpacity=".45" strokeWidth=".7" />
      <path d={`M20 ${cord + 43} v7`} stroke={gold} strokeOpacity=".6" strokeWidth="1" />
      <circle cx="20" cy={cord + 52} r="2.2" fill={gold} />
    </svg>
  );
}

/* ── Corner blooms ─────────────────────────────────────────────────────
   Layered petals rather than line art: a flat outline reads as clip-art,
   while overlapping shapes with soft gradients read as painted. Rotated
   per corner by the caller. */
export function FloralCorner({ bloom = "#d9738c", leaf = "#7d9a6d", deep = "#a84763", id = "a" }) {
  const petals = [
    [0, 1], [52, 0.94], [104, 0.9], [156, 0.96], [208, 0.88], [260, 0.92], [312, 0.86],
  ];
  return (
    <svg className="wc-floral" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`wc-pet-${id}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".72" />
          <stop offset="48%" stopColor={bloom} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
        <linearGradient id={`wc-leaf-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={leaf} stopOpacity=".92" />
          <stop offset="100%" stopColor={leaf} stopOpacity=".42" />
        </linearGradient>
      </defs>

      {/* foliage behind */}
      {[18, 62, 108, 150].map((a, i) => (
        <ellipse
          key={i} cx="24" cy="24" rx="46" ry="15"
          fill={`url(#wc-leaf-${id})`}
          transform={`rotate(${a} 24 24) translate(30 0)`}
          opacity=".75"
        />
      ))}

      {/* the main bloom */}
      {petals.map(([a, s], i) => (
        <ellipse
          key={i} cx="42" cy="42" rx={21 * s} ry={13 * s}
          fill={`url(#wc-pet-${id})`}
          transform={`rotate(${a} 42 42) translate(15 0)`}
          opacity=".95"
        />
      ))}
      <circle cx="42" cy="42" r="7.5" fill="#f6dda6" />
      <circle cx="42" cy="42" r="3.4" fill={deep} opacity=".6" />

      {/* two smaller buds, offset so the cluster is not symmetrical */}
      {[[96, 30, 0.58], [34, 96, 0.46]].map(([cx, cy, s], i) => (
        <g key={i}>
          {petals.slice(0, 5).map(([a, p], j) => (
            <ellipse
              key={j} cx={cx} cy={cy} rx={20 * s * p} ry={12 * s * p}
              fill={`url(#wc-pet-${id})`}
              transform={`rotate(${a} ${cx} ${cy}) translate(${13 * s} 0)`}
              opacity=".9"
            />
          ))}
          <circle cx={cx} cy={cy} r={6 * s} fill="#f6dda6" />
        </g>
      ))}
    </svg>
  );
}

/* ── The medallion above the names ─────────────────────────────────────
   A lotus in engraved gold with the tradition's mark at its centre. A
   painted deity is a commissioned illustration and not ours to copy; a
   lotus is the shared vocabulary of the same stationery, and it carries
   whichever glyph the couple's faith calls for. */
export function DeityMedallion({ mark = "✦", gold = "#c69a55", size = 86 }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      className="wc-medallion"
      viewBox="0 0 120 120"
      width={size} height={size}
      aria-hidden="true" focusable="false"
    >
      <defs>
        <linearGradient id="wc-med-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gold} stopOpacity=".95" />
          <stop offset="50%" stopColor="#f2ddb0" />
          <stop offset="100%" stopColor={gold} stopOpacity=".85" />
        </linearGradient>
      </defs>

      {petals.map((a, i) => (
        <path
          key={i}
          d="M60 22 C68 34 68 44 60 54 C52 44 52 34 60 22 Z"
          fill="url(#wc-med-g)"
          opacity={i % 2 ? 0.42 : 0.72}
          transform={`rotate(${a} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="31" fill="none" stroke={gold} strokeOpacity=".55" strokeWidth="1" />
      <circle cx="60" cy="60" r="26" fill="none" stroke={gold} strokeOpacity=".3" strokeWidth=".7" />
      <text
        x="60" y="60" textAnchor="middle" dominantBaseline="central"
        fontSize="26" fill={gold} opacity=".95"
      >
        {mark}
      </text>
    </svg>
  );
}

/* ── A ruled divider with a centred diamond ── */
export function RuleOrnament({ gold = "#c69a55" }) {
  return (
    <svg className="wc-ruleorn" viewBox="0 0 220 12" aria-hidden="true" focusable="false">
      <line x1="0" y1="6" x2="88" y2="6" stroke={gold} strokeOpacity=".45" strokeWidth="1" />
      <line x1="132" y1="6" x2="220" y2="6" stroke={gold} strokeOpacity=".45" strokeWidth="1" />
      <path d="M110 1 L115 6 L110 11 L105 6 Z" fill={gold} opacity=".85" />
      <circle cx="96" cy="6" r="1.6" fill={gold} opacity=".6" />
      <circle cx="124" cy="6" r="1.6" fill={gold} opacity=".6" />
    </svg>
  );
}
