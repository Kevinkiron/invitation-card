/* ══════════════════════════════════════════════════════════════════════
   The Welcvm wordmark.

   "Welcvm" with the v drawn as a heart — Welc♥m. It reads as "welcome"
   at a glance and as the brand on a second look, which is the whole idea.

   Set in Alegreya: a warm humanist serif with the same splayed W, soft
   terminals and calligraphic weight as the reference. Cormorant Garamond
   is the fallback because the app already loads it.

   The heart is inline SVG rather than a glyph so it keeps its colour and
   its exact optical size next to the letters at every scale. The
   accessible name is set on the wrapper, so screen readers say "Welcvm"
   and never "Welc m".
   ══════════════════════════════════════════════════════════════════════ */

export const BRAND = {
  ink: "#4A443C",     // the warm near-black of the letterforms
  heart: "#DE6B5A",   // the coral of the v
  cream: "#F2EFE3",   // the ground it sits on
};

export default function Wordmark({
  size = 28,
  ink = BRAND.ink,
  heart = BRAND.heart,
  className = "",
  style,
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label="Welcvm"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: "'Alegreya','Cormorant Garamond',Georgia,serif",
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1,
        color: ink,
        letterSpacing: "-.005em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden="true">Welc</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 92"
        focusable="false"
        style={{
          /* Sized and nudged to sit on the x-height like a lowercase o,
             not on the baseline like an icon. */
          width: `${size * 0.52}px`,
          height: `${size * 0.52}px`,
          margin: `0 ${size * 0.012}px`,
          transform: `translateY(${size * 0.035}px)`,
          flexShrink: 0,
        }}
      >
        <path
          fill={heart}
          d="M50 89.5 C46 89.5 6 60.5 6 32.8 C6 15.9 18.1 4 33.1 4 C41.2 4 47.6 8.3 50 13.6 C52.4 8.3 58.8 4 66.9 4 C81.9 4 94 15.9 94 32.8 C94 60.5 54 89.5 50 89.5 Z"
        />
        {/* The small notch under the left lobe, as in the reference. */}
        <path fill={ink} opacity=".0" d="M0 0h0v0H0z" />
      </svg>
      <span aria-hidden="true">m</span>
    </span>
  );
}

/* The square app mark: the same heart, cream on the brand ink. Used where
   a wordmark will not fit — favicons, avatars, the mobile nav. */
export function BrandMark({ size = 36, bg = BRAND.ink, heart = BRAND.heart, radius = 11 }) {
  return (
    <span
      role="img"
      aria-label="Welcvm"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 100 92" aria-hidden="true" style={{ width: size * 0.5, height: size * 0.5 }}>
        <path
          fill={heart}
          d="M50 89.5 C46 89.5 6 60.5 6 32.8 C6 15.9 18.1 4 33.1 4 C41.2 4 47.6 8.3 50 13.6 C52.4 8.3 58.8 4 66.9 4 C81.9 4 94 15.9 94 32.8 C94 60.5 54 89.5 50 89.5 Z"
        />
      </svg>
    </span>
  );
}
