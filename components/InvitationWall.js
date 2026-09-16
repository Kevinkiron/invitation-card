"use client";

import { useEffect, useRef, useState } from "react";
import { DEMOS } from "@/lib/demo/fixtures";
import "@/app/demo.css"; // reuses .dp-poster for the loading state — see below

/* ══════════════════════════════════════════════════════════════════════
   The invitation wall.

   This used to draw twelve invented, generic designs live via
   lib/design/renderer.js into shadow roots — a fair proof of "no
   templates" in the abstract, but none of it was one of Welcvm's four
   real templates, and lib/design/showcase.js's WALL has since been
   trimmed to exactly those four anyway. Now every card is a sandboxed
   iframe onto `/demo/<slug>?embed=1` — the same real, already-opened
   invitation HeroPhone and the "See it built" section show, just small
   and in motion. What passes through this wall is the product, not a
   diagram of it.

   Same reasoning as HeroPhone.js/DemoPhone.js for the iframe: the cinema
   and celebration templates are built on `position: fixed` and `100dvh`,
   which only behave correctly inside their own document — a
   `transform: scale()` has to land on the iframe element, not on content
   rendered inline.

   Unlike HeroPhone's `.w-phone` (a fluid `clamp()` width needing a
   ResizeObserver), `.w-wallcard-inner` is drawn at fixed CARD_W/CARD_H
   pixel constants (see app/landing.css — no responsive override exists),
   so the scale from the 390px iframe down to the card is a constant,
   computed once.

   Two things kept from the old version:

   1. COST. Nothing loads until the wall is close to the viewport, same
      IntersectionObserver gate as before.
   2. The CSS's `@keyframes w-marquee` animates `translateX(-50%)`, which
      only loops seamlessly with exactly two duplicated copies of a row's
      card set — that structure is unchanged. What DID change: this now
      renders a single row (one marquee track) instead of two, so a
      four-demo wall mounts 8 iframes total rather than 16 — a full React
      app in every card adds up fast, and one row moving is exactly what
      "passing through" asked for. ══════════════════════════════════════════════════════════════════════ */

const CARD_W = 248;
const CARD_H = 348;
const FRAME_WIDTH = 390;
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * (CARD_H / CARD_W));
const SCALE = CARD_W / FRAME_WIDTH;

function WallCard({ demo, active }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="w-wallcard" aria-label={demo.label}>
      <div className="w-wallcard-inner" style={{ position: "relative" }}>
        {active && (
          <iframe
            src={`/demo/${demo.slug}?embed=1`}
            title={`${demo.label} — a Welcvm invitation`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            /* No `allow-same-origin` — a decorative card has no business
               touching the landing page's storage or cookies. */
            sandbox="allow-scripts"
            scrolling="no"
            onLoad={() => setLoaded(true)}
            style={{
              width: `${FRAME_WIDTH}px`,
              height: `${FRAME_HEIGHT}px`,
              border: 0,
              display: "block",
              pointerEvents: "none",
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
            }}
          />
        )}
        <div
          className={`dp-poster ${loaded ? "dp-gone" : ""}`}
          style={{ "--dp-accent": demo.accent, position: "absolute", inset: 0 }}
        >
          <span className="dp-poster-label">{demo.label}</span>
          <span className="dp-poster-names">{demo.names}</span>
        </div>
      </div>
      <figcaption className="w-wallcap">{demo.label}</figcaption>
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
      { rootMargin: "320px 0px" } // start loading just before it is needed
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="w-wall"
      ref={wrapRef}
      style={{ "--card-w": `${CARD_W}px`, "--card-h": `${CARD_H}px` }}
    >
      <div className="w-wallrow">
        {/* Duplicated once so the marquee can loop without a seam — the
            copy is hidden from screen readers. */}
        <div className="w-walltrack">
          {[0, 1].map((copy) => (
            <div className="w-wallset" key={copy} aria-hidden={copy === 1 || undefined}>
              {DEMOS.map((demo) => (
                <WallCard key={`${copy}-${demo.slug}`} demo={demo} active={active} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
