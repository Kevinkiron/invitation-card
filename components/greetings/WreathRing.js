/* ══════════════════════════════════════════════════════════════════════
   WREATH RING — components/GreetingCard.js (the message face)

   Kevin's reference: a Christmas card with the greeting set inside a ring
   of leaves and berries, a small illustrated scene beside it, and a bar
   along the bottom edge. The ring is the piece of that worth generalising
   to every occasion, not just Christmas — the same "draw it, don't
   license it" approach the wedding ornaments (components/wedding/
   ornaments.js) already use, so this is one new component rather than a
   commissioned illustration per occasion.

   A classic wreath is evergreen regardless of what it is celebrating (a
   laurel wreath is the same idea, older than Christmas), so the leaves
   stay a fixed sage green here and only the berries and ribbon take each
   occasion's own accent/deep colours — that is what makes the same ring
   read as "Christmas" in green-gold-crimson and "Diwali" in green-gold-
   maroon without needing a second component.

   Procedural, like BulbFrame/FloralCorner: a loop places leaves and
   berries around a circle rather than a hand-drawn path per occasion.
   ══════════════════════════════════════════════════════════════════════ */
export default function WreathRing({ accent = "#c69a55", deep = "#8f294e", size = 190, id = "a" }) {
  const R = 78, cx = 100, cy = 100;
  const leafCount = 26;
  const leaves = [];
  for (let i = 0; i < leafCount; i++) {
    const angle = (360 / leafCount) * i;
    leaves.push({ angle, big: i % 2 === 0 });
  }
  const berries = [];
  for (let i = 0; i < 9; i++) {
    berries.push((360 / 9) * i + 12);
  }

  return (
    <svg
      className="gc-wreath-ring"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`gc-wr-leaf-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fae72" />
          <stop offset="100%" stopColor="#3f6a45" />
        </linearGradient>
        <radialGradient id={`gc-wr-berry-${id}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="55%" stopColor={accent} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
      </defs>

      {/* the foliage ring */}
      {leaves.map(({ angle, big }, i) => (
        <ellipse
          key={i}
          cx={cx} cy={cy - R}
          rx={big ? 10.5 : 8}
          ry={big ? 20 : 15}
          fill={`url(#gc-wr-leaf-${id})`}
          opacity={big ? 0.95 : 0.8}
          transform={`rotate(${angle} ${cx} ${cy})`}
        />
      ))}

      {/* berries scattered through the greenery */}
      {berries.map((angle, i) => (
        <circle
          key={i}
          cx={cx} cy={cy - R + 2}
          r={4.4}
          fill={`url(#gc-wr-berry-${id})`}
          transform={`rotate(${angle} ${cx} ${cy})`}
        />
      ))}

      {/* a small bow at the base, where the ring is tied off */}
      <g transform={`translate(${cx} ${cy + R - 4})`}>
        <path d="M0 0 L-16 10 L-11 16 L0 6 Z" fill={deep} />
        <path d="M0 0 L16 10 L11 16 L0 6 Z" fill={deep} />
        <path d="M-10 -1 L-2 -6 L0 0 L-2 4 Z" fill={accent} opacity=".9" />
        <path d="M10 -1 L2 -6 L0 0 L2 4 Z" fill={accent} opacity=".9" />
        <ellipse cx="0" cy="-1" rx="4.6" ry="3.6" fill={accent} />
      </g>
    </svg>
  );
}
