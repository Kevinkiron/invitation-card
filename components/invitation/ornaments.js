"use client";

/* Original decorative vector art, authored as inline SVG components so
   every ornament inherits the active template's palette via props rather
   than shipping a recoloured image per template. */

export function ArchFrame({ color, width = "100%", height = 300, stroke = 1 }) {
  return (
    <svg viewBox="0 0 200 300" width={width} height={height} fill="none" preserveAspectRatio="none" style={{ display: "block" }}>
      <path d="M12 296V104C12 55 51 16 100 16s88 39 88 88v192" stroke={color} strokeWidth={stroke} opacity="0.85" />
      <path d="M20 296V106c0-44 36-80 80-80s80 36 80 80v190" stroke={color} strokeWidth={stroke * 0.6} opacity="0.4" />
    </svg>
  );
}

/* Concentric petal mandala — used as a royal emblem. */
export function Mandala({ color, size = 120, rings = 3 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none">
      {Array.from({ length: rings }).map((_, r) => {
        const count = 8 + r * 4;
        const rx = 5 - r * 0.7;
        const ry = 20 + r * 12;
        return Array.from({ length: count }).map((_, i) => (
          <ellipse
            key={`${r}-${i}`}
            cx="60" cy={60 - ry / 2} rx={rx} ry={ry / 2}
            stroke={color} strokeWidth="0.85" opacity={0.75 - r * 0.18}
            transform={`rotate(${(360 / count) * i} 60 60)`}
          />
        ));
      })}
      <circle cx="60" cy="60" r="7" stroke={color} strokeWidth="0.9" />
      <circle cx="60" cy="60" r="2.6" fill={color} />
    </svg>
  );
}

/* Corner flourish — mirrors via the `flip` props. */
export function CornerFlourish({ color, size = 76, flipX = false, flipY = false }) {
  return (
    <svg
      viewBox="0 0 80 80" width={size} height={size} fill="none"
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`, display: "block" }}
    >
      <path d="M2 78C2 40 20 6 78 2" stroke={color} strokeWidth="1" opacity="0.7" />
      <path d="M2 66C4 40 22 18 66 12" stroke={color} strokeWidth="0.7" opacity="0.45" />
      <path d="M22 54c-6-12 2-24 14-22s14 16 4 22-14-2-10-8" stroke={color} strokeWidth="0.9" />
      <circle cx="46" cy="28" r="2.4" fill={color} opacity="0.8" />
      <circle cx="16" cy="60" r="1.8" fill={color} opacity="0.6" />
    </svg>
  );
}

/* Date medallion ring with tick marks. */
export function Medallion({ color, size = 108, children }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <svg viewBox="0 0 108 108" width={size} height={size} fill="none" style={{ position: "absolute", inset: 0 }}>
        <circle cx="54" cy="54" r="51" stroke={color} strokeWidth="0.8" opacity="0.55" />
        <circle cx="54" cy="54" r="45" stroke={color} strokeWidth="1.4" opacity="0.9" />
        {Array.from({ length: 36 }).map((_, i) => (
          <line
            key={i} x1="54" y1="4.5" x2="54" y2={i % 3 === 0 ? 10 : 7.5}
            stroke={color} strokeWidth="0.7" opacity="0.5"
            transform={`rotate(${i * 10} 54 54)`}
          />
        ))}
      </svg>
      <span style={{ position: "relative", zIndex: 2, textAlign: "center" }}>{children}</span>
    </span>
  );
}

/* Botanical sprig — eucalyptus-like leaf pairs along a stem. */
export function Sprig({ color, size = 90, rotate = 0 }) {
  return (
    <svg viewBox="0 0 60 120" width={size * 0.5} height={size} fill="none" style={{ transform: `rotate(${rotate}deg)`, display: "block" }}>
      <path d="M30 118C30 84 30 46 30 4" stroke={color} strokeWidth="1" opacity="0.75" />
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 14 + i * 14;
        return (
          <g key={i}>
            <ellipse cx="20" cy={y} rx="9" ry="5.2" stroke={color} strokeWidth="0.85" opacity="0.8" transform={`rotate(-28 20 ${y})`} />
            <ellipse cx="40" cy={y + 6} rx="9" ry="5.2" stroke={color} strokeWidth="0.85" opacity="0.8" transform={`rotate(28 40 ${y + 6})`} />
          </g>
        );
      })}
    </svg>
  );
}

/* Wax seal with monogram. */
export function WaxSeal({ color = "#8E2B3F", initials = "S&D", size = 74 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="waxg" cx="36%" cy="30%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
          </radialGradient>
        </defs>
        <path
          d="M40 3c7 0 9 6 15 8s11-2 15 4-1 11 1 17 7 8 5 15-8 7-11 12-2 12-8 14-10-3-17-3-11 5-17 3-5-9-8-14-9-5-11-12 3-9 5-15-2-11 1-17 9-2 15-4 8-8 15-8Z"
          fill="url(#waxg)"
        />
      </svg>
      <span
        className="inv-script"
        style={{ position: "relative", zIndex: 2, color: "rgba(255,255,255,.94)", fontSize: size * 0.24, letterSpacing: ".04em", textShadow: "0 1px 2px rgba(0,0,0,.35)" }}
      >
        {initials}
      </span>
    </span>
  );
}

/* Line-art bloom for dark luxury templates. */
export function LineBloom({ color, size = 110, opacity = 0.55 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" style={{ opacity }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d="M60 60C60 44 52 30 60 14c8 16 0 30 0 46"
          stroke={color} strokeWidth="0.9"
          transform={`rotate(${i * 60} 60 60)`}
        />
      ))}
      <path d="M60 60c14 0 26 6 38 16" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <path d="M60 60c-14 0-26 6-38 16" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <circle cx="60" cy="60" r="4" stroke={color} strokeWidth="0.9" />
    </svg>
  );
}

/* Butterfly used by the cinematic template's ambience. */
export function Butterfly({ color, size = 22, opacity = 0.8 }) {
  return (
    <svg viewBox="0 0 32 28" width={size} height={size * 0.875} fill="none" style={{ opacity }}>
      <path d="M16 14c-3-9-13-13-15-6s6 12 15 6Z" fill={color} opacity="0.55" />
      <path d="M16 14c3-9 13-13 15-6s-6 12-15 6Z" fill={color} opacity="0.75" />
      <path d="M16 14c-2 6-9 10-12 6s4-8 12-6Z" fill={color} opacity="0.4" />
      <path d="M16 14c2 6 9 10 12 6s-4-8-12-6Z" fill={color} opacity="0.55" />
      <ellipse cx="16" cy="14" rx="1.1" ry="5" fill={color} />
    </svg>
  );
}

/* Watercolour wash blob — layered translucent shapes. */
export function Wash({ color, size = 190, opacity = 0.5, seed = 0 }) {
  const paths = [
    "M42 8c34-9 62 12 74 42s-4 66-38 78S18 122 12 92 8 17 42 8Z",
    "M56 14c30 2 56 30 58 62s-26 60-58 60S2 108 4 76 26 12 56 14Z",
    "M38 22c30-14 68 4 78 38s-10 62-42 72S12 118 8 86 8 36 38 22Z",
  ];
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} style={{ opacity, display: "block" }}>
      <path d={paths[seed % 3]} fill={color} opacity="0.5" />
      <path d={paths[(seed + 1) % 3]} fill={color} opacity="0.32" transform="translate(8 6) scale(0.9)" />
      <path d={paths[(seed + 2) % 3]} fill={color} opacity="0.22" transform="translate(-6 10) scale(0.84)" />
    </svg>
  );
}

/* Repeating lace scallop edge. */
export function LaceEdge({ color, height = 18, flip = false }) {
  return (
    <svg
      viewBox="0 0 120 18" width="100%" height={height} preserveAspectRatio="none" fill="none"
      style={{ display: "block", transform: flip ? "scaleY(-1)" : "none" }}
    >
      <path d="M0 0h120v6c-8 0-8 8-16 8s-8-8-16-8-8 8-16 8-8-8-16-8-8 8-16 8-8-8-16-8-8 8-16 8-8-8-8-8V0Z" fill={color} opacity="0.9" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={7.5 + i * 15} cy="4" r="1.6" fill="#fff" opacity="0.5" />
      ))}
    </svg>
  );
}

/* Hanging marigold strand for the floral template. */
export function MarigoldStrand({ color, accent, count = 7, size = 15 }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{ width: 1, height: 14, background: color, opacity: 0.5 }} />
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} style={{ animation: `invFloat ${5 + (i % 3)}s ease-in-out ${i * 0.2}s infinite` }}>
          {Array.from({ length: 9 }).map((_, k) => (
            <ellipse key={k} cx="12" cy="6" rx="2.6" ry="5.2" fill={i % 2 ? accent : color} opacity="0.85" transform={`rotate(${k * 40} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="2.4" fill={i % 2 ? color : accent} />
        </svg>
      ))}
    </span>
  );
}
