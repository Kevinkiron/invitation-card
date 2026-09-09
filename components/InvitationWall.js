"use client";

import { useEffect, useRef, useState } from "react";
import { render } from "@/lib/design/renderer";
import { WALL } from "@/lib/design/showcase";

/* ══════════════════════════════════════════════════════════════════════
   The invitation wall.

   Twelve invitations drifting past in two rows, every one drawn live by
   lib/design/renderer.js. A competitor can put a wall of screenshots on
   their site; the difference here is that these are generated, so the
   wall is evidence rather than decoration.

   Three things this has to get right:

   1. ISOLATION. Each invitation gets its own shadow root. The renderer
      scopes its CSS to `.inv-root`, so twelve of them in one document
      would otherwise all take the last one's styling — and the page's own
      CSS would bleed in on top.
   2. COST. Twelve renders is real work, so nothing is drawn until the
      wall is close to the viewport. Below the fold it is twelve empty
      boxes.
   3. RESTRAINT. Only each invitation's hero is shown, sized for a card
      rather than a viewport. The renderer measures in `vw`, which is
      correct on a real invitation page and enormous inside a 232px card.
   ══════════════════════════════════════════════════════════════════════ */

const CARD_W = 232;
const CARD_H = 326;

function fitCss(frameless) {
  /* Tuned so the tallest combination a design can produce — epigraph plus
     framed portrait plus kicker plus two-line headline plus subhead plus
     venue — still clears the bottom of a 326px card. The anniversary
     design overflowed at the first set of numbers. */
  return `
    .inv-root{height:100%;overflow:hidden;border-radius:0}
    .inv-root .hero{min-height:100%;padding:18px 13px}
    .inv-root .hero .frame{width:${frameless ? 0 : 82}px;margin-bottom:8px;
      box-shadow:0 6px 16px rgba(0,0,0,.13),0 0 0 3px var(--bg),0 0 0 4px var(--accent-soft)}
    .inv-root .hero .epigraph{font-size:8.5px;margin-bottom:7px;max-width:165px;line-height:1.5}
    .inv-root .hero .kicker{font-size:6.5px;letter-spacing:.24em;margin-bottom:6px}
    .inv-root .hero .h1{font-size:${frameless ? "clamp(24px,9vw,38px)" : "clamp(17px,5.4vw,25px)"}}
    .inv-root .hero .joiner{font-size:.42em}
    .inv-root .hero .subhead{font-size:10px;margin-top:7px}
    .inv-root .hero .place{font-size:6.5px;margin-top:5px}
    .inv-root .hero .orn{margin-top:8px;max-width:120px}
        .inv-root .hero .edge{inset:8px}
    .inv-root .crest{display:none}
    .inv-root .scrollcue{display:none}
.inv-root .hero .deco{width:${frameless ? 150 : 108}px;height:${frameless ? 150 : 108}px;
      opacity:${frameless ? 0.85 : 0.4}}
    .inv-root section:not(.hero), .inv-root footer{display:none}
  `;
}

function WallCard({ item, active }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const host = hostRef.current;
    if (!host || host.dataset.drawn === "1") return;

    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    try {
      render(item, shadow);
    } catch (e) {
      console.error("[InvitationWall] render failed for", item.key, e);
      return;
    }
    const fit = document.createElement("style");
    fit.textContent = fitCss(item.design.frame === "none");
    shadow.appendChild(fit);
    host.dataset.drawn = "1";

    return () => {
      const r = shadow.querySelector(".inv-root");
      if (r?._cd) clearInterval(r._cd);
    };
  }, [item, active]);

  return (
    <figure className="w-wallcard" aria-label={item.label}>
      <div className="w-wallcard-inner" ref={hostRef} />
      <figcaption className="w-wallcap">{item.label}</figcaption>
    </figure>
  );
}

export default function InvitationWall() {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "320px 0px" } // start drawing just before it is needed
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const half = Math.ceil(WALL.length / 2);
  const rows = [WALL.slice(0, half), WALL.slice(half)];

  return (
    <div
      className="w-wall"
      ref={wrapRef}
      style={{ "--card-w": `${CARD_W}px`, "--card-h": `${CARD_H}px` }}
    >
      {rows.map((row, r) => (
        <div className="w-wallrow" key={r}>
          {/* Duplicated once so the marquee can loop without a seam. The
              copy is hidden from screen readers. */}
          <div className={`w-walltrack ${r === 1 ? "rev" : ""}`}>
            {[0, 1].map((copy) => (
              <div className="w-wallset" key={copy} aria-hidden={copy === 1 || undefined}>
                {row.map((item) => (
                  <WallCard key={`${copy}-${item.key}`} item={item} active={active} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
