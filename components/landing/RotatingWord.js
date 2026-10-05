"use client";

import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════════════════
   ROTATING WORD — the occasion in the hero headline ("Invitations made
   for your wedding." → "…for a griha pravesh." → …), rolling up into
   place one after another.

   Every word sits in the same grid cell, so the line is always exactly
   as wide as the longest word: the headline never jumps sideways as the
   word changes. Only the current one is visible; the one before it rolls
   out upwards as the next rolls in from below. Under reduced motion it
   simply stays on the first word.
   ══════════════════════════════════════════════════════════════════════ */
export default function RotatingWord({ words, interval = 2600 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const prev = (i - 1 + words.length) % words.length;

  return (
    <span className="w-rot" aria-live="polite">
      {words.map((w, k) => (
        <span
          key={w}
          className={`w-rot-w ${k === i ? "is-in" : k === prev ? "is-out" : ""}`}
          aria-hidden={k === i ? undefined : "true"}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
