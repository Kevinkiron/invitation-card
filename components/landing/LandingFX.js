"use client";

import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════════
   LANDING FX — the small interactive touches on the homepage, wired up
   once for the whole page rather than as a wrapper around every card:

   - a thin gold reading-progress line along the top of the window
   - a soft spotlight in the hero that follows the cursor (--mx / --my)
   - the hero phone and its feature chips drifting in depth with the
     cursor ([data-depth] — bigger number, more movement)
   - 3D tilt with a moving glare on cards ([data-tilt], and every
     occasion card .w-ecard)
   - "magnetic" buttons ([data-magnetic]) that lean towards the cursor

   Everything pointer-driven only runs on a real mouse or trackpad
   ((hover: hover) and (pointer: fine)); on a phone there is nothing to
   follow. Under prefers-reduced-motion none of it runs except the
   progress line, which is information, not decoration. All writes are
   batched into one requestAnimationFrame per event.
   ══════════════════════════════════════════════════════════════════════ */
export default function LandingFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups = [];

    /* ── reading progress ── */
    const bar = document.createElement("div");
    bar.className = "w-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => { window.removeEventListener("scroll", onScroll); bar.remove(); });

    if (reduce || !fine) return () => cleanups.forEach((f) => f());

    /* ── hero spotlight + depth parallax ── */
    const hero = document.querySelector(".w-hero");
    if (hero) {
      const layers = [...hero.querySelectorAll("[data-depth]")];
      let hraf = 0;
      const move = (e) => {
        cancelAnimationFrame(hraf);
        hraf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          hero.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
          hero.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
          for (const el of layers) {
            const d = parseFloat(el.dataset.depth) || 0;
            el.style.transform = `translate3d(${((x - .5) * d * 40).toFixed(1)}px, ${((y - .5) * d * 30).toFixed(1)}px, 0)`;
          }
        });
      };
      const leave = () => layers.forEach((el) => { el.style.transform = ""; });
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
      cleanups.push(() => { hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); });
    }

    /* ── tilt + glare, delegated so it covers every card ── */
    const TILT = "[data-tilt], .w-ecard, .w-qrcard";
    let tiltEl = null, traf = 0;
    const tiltMove = (e) => {
      const el = e.target.closest?.(TILT);
      if (tiltEl && tiltEl !== el) { tiltEl.style.transform = ""; tiltEl.classList.remove("is-tilting"); }
      tiltEl = el;
      if (!el) return;
      cancelAnimationFrame(traf);
      traf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const max = parseFloat(el.dataset.tilt) || 7;
        el.style.transform = `perspective(900px) rotateX(${((.5 - y) * max).toFixed(2)}deg) rotateY(${((x - .5) * max).toFixed(2)}deg) translateY(-4px)`;
        el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
        el.classList.add("is-tilting");
      });
    };
    const tiltOut = () => { if (tiltEl) { tiltEl.style.transform = ""; tiltEl.classList.remove("is-tilting"); tiltEl = null; } };
    document.addEventListener("pointermove", tiltMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", tiltOut);
    cleanups.push(() => { document.removeEventListener("pointermove", tiltMove); document.documentElement.removeEventListener("pointerleave", tiltOut); });

    /* ── magnetic buttons ── */
    for (const el of document.querySelectorAll("[data-magnetic]")) {
      const m = (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * .18).toFixed(1)}px, ${(dy * .28).toFixed(1)}px)`;
      };
      const out = () => { el.style.transform = ""; };
      el.addEventListener("pointermove", m);
      el.addEventListener("pointerleave", out);
      cleanups.push(() => { el.removeEventListener("pointermove", m); el.removeEventListener("pointerleave", out); });
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return null;
}
