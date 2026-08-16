"use client";

/* Decorative SVG motifs — drawn, not imported, so they inherit the palette.
   Shared across every template variant (classic / editorial / noir) so a
   new template variant can reuse them instead of redrawing its own. */
export default function Motif({ kind = "marigold", color, size = 46, style }) {
  const s = { display: "block", ...style };

  if (kind === "peacock")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
        <path d="M24 44c0-12-9-16-9-24a9 9 0 1118 0c0 8-9 12-9 24z" stroke={color} strokeWidth="1.1" />
        <circle cx="24" cy="17" r="4.4" stroke={color} strokeWidth="1.1" />
        <circle cx="24" cy="17" r="1.6" fill={color} />
        <path d="M13 26c-4 2-7 6-8 11M35 26c4 2 7 6 8 11" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );

  if (kind === "paisley")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
        <path d="M30 6c8 5 11 15 6 23s-16 11-21 5c-4-5-1-12 5-13s10 4 8 9" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="27" cy="20" r="2.4" stroke={color} strokeWidth="1.1" />
      </svg>
    );

  if (kind === "line")
    return (
      <svg width={size * 2} height={12} viewBox="0 0 96 12" fill="none" style={s}>
        <path d="M0 6h34M62 6h34" stroke={color} strokeWidth="1" />
        <path d="M48 1l4.5 5-4.5 5-4.5-5z" stroke={color} strokeWidth="1" />
      </svg>
    );

  if (kind === "stars")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
        <path d="M24 6l2.4 12.6L38 21l-11.6 2.4L24 36l-2.4-12.6L10 21l11.6-2.4z" fill={color} opacity="0.95" />
        <path d="M40 8l1 5 5 1-5 1-1 5-1-5-5-1 5-1z" fill={color} opacity="0.7" />
        <path d="M7 30l.9 4.4L12 35l-4.1.9L7 40l-.9-4.1L2 35l4.1-.6z" fill={color} opacity="0.7" />
      </svg>
    );

  /* default: marigold rosette */
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="24" cy="13" rx="4.4" ry="8.6"
          stroke={color} strokeWidth="1.05"
          transform={`rotate(${i * 45} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="3.4" stroke={color} strokeWidth="1.05" />
    </svg>
  );
}
