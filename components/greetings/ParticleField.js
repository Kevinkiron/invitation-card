"use client";

import { useMemo } from "react";

/* ══════════════════════════════════════════════════════════════════════
   A field of drifting particles behind an open greeting card — snow for
   Christmas, petals for Diwali/Onam/anniversaries, confetti for
   birthdays/New Year, or nothing at all for a quieter card like a thank
   you. Same falling-and-drifting technique as WeddingCinema's PetalField,
   generalised over shape so one component covers all three. `kind: "none"`
   renders nothing — a real branch, not a zero count, so a caller never
   has to guard the import.
   ══════════════════════════════════════════════════════════════════════ */
export default function ParticleField({ kind = "petals", count = 16 }) {
  const items = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: ((i * 100) / count + (Math.random() * 6 - 3)) + "%",
      delay: (i * 0.55) + "s",
      dur: (kind === "snow" ? 9 + Math.random() * 7 : 7 + Math.random() * 6) + "s",
      drift: Math.round(-28 + i * 4.5) + "px",
      spin: Math.round(360 + i * 20) + "deg",
      scale: (0.7 + Math.random() * 0.7).toFixed(2),
    })),
  [count, kind]);

  if (kind === "none") return null;

  return (
    <div className={`gc-particles gc-particles-${kind}`} aria-hidden="true">
      {items.map((p, i) => (
        <i
          key={i}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.dur,
            "--gc-drift": p.drift,
            "--gc-spin": p.spin,
            "--gc-scale": p.scale,
          }}
        />
      ))}
    </div>
  );
}
