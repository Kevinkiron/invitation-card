/* ══════════════════════════════════════════════════════════════════════
   ONAM SCENE — the card's closed cover, for occasion "onam".

   Two pieces, both drawn rather than photographed for the same reason as
   ChristmasScene.js: a pookalam (the flower rangoli laid at every
   Onam doorstep) blooming ring by ring in the lower half of the cover,
   and a snake boat (the vallam of Vallam Kali, Onam's boat race) gliding
   past behind it on a loop.
   ══════════════════════════════════════════════════════════════════════ */

const RING_COLORS = (accent, deep) => [accent, deep, "#e8912d", accent];

export default function OnamScene({ accent = "#e8b84b", palette = {} }) {
  const deep = palette.deep || "#7a1f1f";
  const ink = palette.ink || "#fdf6ea";
  const colors = RING_COLORS(accent, deep);

  const rings = colors.map((color, i) => {
    const radius = 9 + i * 8;
    const petals = 9 + i * 3;
    const dotR = Math.max(1.6, 3.4 - i * 0.4);
    const points = Array.from({ length: petals }, (_, p) => {
      const angle = (p / petals) * Math.PI * 2;
      return {
        x: (40 + Math.cos(angle) * radius).toFixed(2),
        y: (40 + Math.sin(angle) * radius).toFixed(2),
      };
    });
    return { color, dotR, points, delay: i * 0.32 };
  });

  return (
    <div className="gc-scene gc-scene-onam" aria-hidden="true">
      <div className="gc-scene-pookalam">
        <svg viewBox="0 0 80 80" overflow="visible">
          {rings.map((ring, i) => (
            <g key={i} className="gc-pookalam-ring" style={{ animationDelay: `${ring.delay}s` }}>
              {ring.points.map((pt, p) => (
                <circle key={p} cx={pt.x} cy={pt.y} r={ring.dotR} fill={ring.color} opacity=".88" />
              ))}
            </g>
          ))}
          <circle cx="40" cy="40" r="5.5" fill={ink} opacity=".92" />
        </svg>
      </div>

      <div className="gc-scene-boat">
        <svg viewBox="0 0 140 30">
          <path
            d="M2 22 Q10 9 30 9 h68 q24 0 38 11 q-16 7 -54 7 h-64 q-18 0 -18 -18 Z"
            fill={deep}
            opacity=".9"
          />
          <path d="M104 9 q11 -15 3 -9" stroke={deep} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".9" />
        </svg>
      </div>
    </div>
  );
}
