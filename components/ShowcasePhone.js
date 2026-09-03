"use client";

import { useEffect, useRef, useState } from "react";
import { render } from "@/lib/design/renderer";
import { SHOWCASE } from "@/lib/design/showcase";

/* ══════════════════════════════════════════════════════════════════════
   The hero phone.

   Runs the real renderer over five real token sets and cycles through
   them. Nothing here is a screenshot — if the renderer regresses, this
   breaks, which is exactly what we want from a claim like "no templates".

   Each invitation gets its OWN SHADOW ROOT. Two reasons, both learned the
   hard way:

     1. The renderer scopes its CSS to `.inv-root`. With five invitations
        in one document the last style block repaints all five, and every
        design comes out identical.
     2. This page and the renderer both use class names like `hero`,
        `eyebrow` and `lede`. Without isolation the landing page's
        `.w-hero` gradients land on top of every invitation — which turned
        a black concert poster grey.

   A shadow root solves both, and it matches production: a real invitation
   is a page of its own. @font-face is document-global, so the fonts
   loaded in app/layout.js still apply inside.
   ══════════════════════════════════════════════════════════════════════ */

const INTERVAL_MS = 3800;

export default function ShowcasePhone() {
  const screenRef = useRef(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const stages = SHOWCASE.map((s, i) => {
      const st = document.createElement("div");
      st.className = "w-stage" + (i === 0 ? " on" : "");
      screen.appendChild(st);

      const shadow = st.attachShadow({ mode: "open" });
      try {
        render(s, shadow);
      } catch (e) {
        // One bad token set must not take the landing page down.
        console.error("[ShowcasePhone] render failed for", s.key, e);
        return st;
      }

      /* Fit the invitation to the phone rather than the browser viewport.
         The renderer sizes its hero in `vw`, which is right on a real
         invitation page and far too big inside a ~286px mock-up. These
         overrides exist only for the showcase. Selectors must match the
         renderer's own specificity (`.inv-root .hero …`) and this sheet
         is appended last, so it wins. */
      const frameless = s.design.frame === "none";
      const fit = document.createElement("style");
      fit.textContent = `
        .inv-root{height:100%;overflow-y:auto;scrollbar-width:none}
        .inv-root::-webkit-scrollbar{display:none}
        .inv-root .hero{min-height:100%;padding:34px 14px}
        .inv-root .hero .frame{width:132px;margin-bottom:14px;
          box-shadow:0 12px 30px rgba(0,0,0,.14),0 0 0 5px var(--bg),0 0 0 6px var(--accent-soft)}
        .inv-root .hero .epigraph{font-size:12.5px;margin-bottom:14px;max-width:230px}
        .inv-root .hero .subhead{font-size:16.5px;margin-top:12px}
        .inv-root .hero .place{font-size:9.5px;margin-top:7px}
        .inv-root .hero .kicker{font-size:9px;margin-bottom:9px}
        .inv-root .hero .orn{margin-top:14px}
        .inv-root .hero .deco{width:${frameless ? 200 : 165}px;height:${frameless ? 200 : 165}px;
          opacity:${frameless ? 0.9 : 0.45}}
      `;
      shadow.appendChild(fit);
      return st;
    });

    let i = 0;
    const timer = setInterval(() => {
      stages[i]?.classList.remove("on");
      i = (i + 1) % stages.length;
      stages[i]?.classList.add("on");
      setIdx(i);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timer);
      stages.forEach((st) => st.remove());
    };
  }, []);

  return (
    <div className="w-phonewrap">
      <div className="w-phone">
        <div className="w-notch" />
        <div className="w-screen" ref={screenRef} />
      </div>

      <div className="w-cycler" aria-hidden="true">
        {SHOWCASE.map((s, i) => (
          <span key={s.key} className={i === idx ? "on" : undefined} />
        ))}
      </div>
      <div className="w-cyclabel" aria-live="polite">
        {SHOWCASE[idx].label}
      </div>
    </div>
  );
}
