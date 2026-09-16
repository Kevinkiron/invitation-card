"use client";

import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════════
   Scrolls the embedded demo slowly down the page and back to the top.

   This runs INSIDE the iframe rather than in the landing page, for two
   reasons. The parent cannot scroll a cross-document iframe, and — more
   importantly — the invitation templates reveal their scenes with an
   IntersectionObserver against the scrolling element. Faking the motion
   from outside would move the pixels without ever firing a reveal, so
   the preview would show a column of invisible scenes.
   ══════════════════════════════════════════════════════════════════════ */

const PIXELS_PER_SECOND = 34;   // slow enough to read a heading in passing
const PAUSE_AT_TOP_MS = 2600;   // long enough to take in the opening scene
const PAUSE_AT_END_MS = 2200;

export default function DemoAutoScroll() {
  useEffect(() => {
    /* Somebody who has asked for less motion is not asking to watch a
       page scroll itself for the rest of their visit. They get the
       opening scene, held still. */
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (still?.matches) return;

    let raf = 0;
    let timer = 0;
    let last = 0;
    let offset = 0;
    let phase = "waiting";
    let cancelled = false;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const after = (ms, fn) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const step = (now) => {
      if (cancelled) return;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;

      const limit = maxScroll();

      /* A template whose photographs have not loaded is shorter than it
         will be in a moment. Scrolling to the bottom of that shorter
         page and stopping would strand the preview halfway down the
         real one, so the limit is read fresh on every frame. */
      if (limit <= 0) {
        raf = requestAnimationFrame(step);
        return;
      }

      offset = Math.min(limit, offset + dt * PIXELS_PER_SECOND);
      window.scrollTo(0, offset);

      if (offset >= limit - 0.5) {
        phase = "resetting";
        after(PAUSE_AT_END_MS, () => {
          /* Jump, do not animate. A smooth scroll back up re-fires every
             reveal in reverse and looks like a fault. */
          offset = 0;
          window.scrollTo(0, 0);
          last = 0;
          after(PAUSE_AT_TOP_MS, () => {
            phase = "running";
            raf = requestAnimationFrame(step);
          });
        });
        return;
      }
      raf = requestAnimationFrame(step);
    };

    after(PAUSE_AT_TOP_MS, () => {
      phase = "running";
      raf = requestAnimationFrame(step);
    });

    /* If a visitor touches the preview, it is theirs. Stop driving it
       rather than fighting their finger for control of the scrollbar. */
    const surrender = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    const opts = { passive: true, once: true };
    window.addEventListener("wheel", surrender, opts);
    window.addEventListener("touchstart", surrender, opts);
    window.addEventListener("keydown", surrender, opts);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("wheel", surrender);
      window.removeEventListener("touchstart", surrender);
      window.removeEventListener("keydown", surrender);
      void phase;
    };
  }, []);

  return null;
}
