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
         overrides exist only for the showcase.

         Every selector is doubled (`.inv-root.inv-root`). Appending the
         sheet last is not enough on its own: the renderer sizes a
         populated portrait with `.inv-root .hero.hasphoto .frame`, which
         is one class more specific than a plain `.inv-root .hero .frame`.
         With the old selector the wedding portrait rendered at its full
         300px inside a 284px screen — a blurred slab that filled the phone
         and pushed the couple's names below the fold. */
      const frameless = s.design.frame === "none";
      const fit = document.createElement("style");
      fit.textContent = `
        .inv-root.inv-root{height:100%;overflow-y:auto;scrollbar-width:none;background:var(--bg)}
        .inv-root.inv-root::-webkit-scrollbar{display:none}
        /* The phone screen IS the sheet, so the sheet box is dissolved
           entirely. display:contents rather than max-width:none, because
           the hero's min-height:100% has to resolve against .inv-root's
           definite height — through an auto-height sheet it computes to
           nothing and the hero collapses to its text. */
        .inv-root.inv-root .sheet{display:contents}
        /* Every measure in the renderer is a fraction of --m, which is
           min(100vw, --sheet). Inside a 284px mock-up the viewport is the
           wrong ruler, so the sheet is redeclared at roughly phone width —
           one line that resizes type, ornaments and rules together. */
        .inv-root.inv-root{--sheet:330px}
        .inv-root.inv-root .hero{min-height:100%;padding:30px 14px}
        .inv-root.inv-root .hero .frame,
        .inv-root.inv-root .hero.hasphoto .frame{width:104px;margin-top:18px;margin-bottom:0;
          box-shadow:0 10px 24px -10px rgba(0,0,0,.22),0 0 0 4px var(--bg),0 0 0 5px var(--accent-soft)}
        .inv-root.inv-root .hero .epigraph{font-size:12.5px;margin-bottom:14px;max-width:230px}
        .inv-root.inv-root .hero .subhead{font-size:16.5px;margin-top:12px}
        .inv-root.inv-root .hero .place{font-size:9.5px;margin-top:7px}
        .inv-root.inv-root .hero .kicker{font-size:9px;margin-bottom:9px}
        .inv-root.inv-root .hero .orn{margin-top:14px}
        .inv-root.inv-root .hero .edge{inset:10px}
        .inv-root.inv-root .crest{width:40px;height:40px;margin-bottom:12px}
        .inv-root.inv-root .crest span{font-size:13px}
        .inv-root.inv-root .scrollcue{display:none}
        .inv-root.inv-root .hero .deco{width:${frameless ? 170 : 104}px;height:${frameless ? 170 : 104}px;
          opacity:${frameless ? 0.9 : 0.4}}
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
