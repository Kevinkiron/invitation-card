"use client";

import { useEffect, useRef, useState } from "react";
import { DEMOS } from "@/lib/demo/fixtures";
import "@/app/demo.css"; // reuses .dp-poster for the loading state — see below

/* ══════════════════════════════════════════════════════════════════════
   The hero phone.

   This used to draw five invented, generic designs straight into a
   shadow root via lib/design/renderer.js (see the old ShowcasePhone.js,
   still in the repo but no longer imported anywhere) — a fair way to
   prove "no templates" in the abstract, but it meant the very first
   thing a visitor saw was not actually one of Welcvm's four real
   templates. This cycles through the same four fixtures the "See it
   built" section below uses (lib/demo/fixtures.js), rendered by the
   exact same components a customer's invitation is rendered by.

   It reuses the `/demo/<slug>?embed=1` route in a sandboxed iframe for
   the same reason DemoPhone.js does (see that file's note): the cinema
   and celebration templates are built on `position: fixed` layers and
   `100dvh`, which only behave correctly inside their own document. That
   route already renders "already opened" rather than gated behind
   "Tap to open" — nobody can tap a phone mockup embedded in another
   page, so the gate that exists for the real guest experience's audio
   permission has no reason to appear here.

   Only ONE iframe is ever mounted, not four — cycling swaps its `src`
   rather than loading all four demo pages on every landing-page visit.
   The phone frame itself (.w-phone/.w-notch/.w-screen/.w-cycler) is
   app/landing.css's existing hero markup, unchanged, so no CSS moved for
   this — only what fills the screen did. */

const INTERVAL_MS = 4600;
/* Rendered wide, then scaled down to whatever width the phone frame is
   actually laid out at — same reasoning as DemoPhone.js: a real
   invitation laying out at ~390px reads correctly; laying it out at a
   true ~260px sliver does not. */
const FRAME_WIDTH = 390;
const FRAME_ASPECT = 620 / 302; // matches .w-phone's own aspect-ratio: 302 / 620
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * FRAME_ASPECT);

export default function HeroPhone() {
  const wrapRef = useRef(null);
  const screenRef = useRef(null);
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(0.72);

  /* Nothing loads until the hero is actually about to be on screen. It
     normally is immediately — this is the hero — but the same guard as
     everywhere else on the page costs nothing and covers the case of a
     deep link straight to a lower section. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* .w-phone's width is a fluid `clamp()`, not a fixed pixel value, so
     the scale that fits the 390px iframe into it has to be recomputed on
     resize rather than calculated once. */
  useEffect(() => {
    const el = screenRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setScale(w / FRAME_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!active || DEMOS.length < 2) return;
    const timer = setInterval(() => {
      setLoaded(false);
      setIdx((i) => (i + 1) % DEMOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active]);

  const demo = DEMOS[idx];

  return (
    <div className="w-phonewrap" ref={wrapRef}>
      <div className="w-phone">
        <div className="w-notch" />
        <div className="w-screen" ref={screenRef}>
          {active && (
            <iframe
              key={demo.slug}
              src={`/demo/${demo.slug}?embed=1`}
              title={`${demo.label} — a Welcvm invitation`}
              loading="eager"
              tabIndex={-1}
              aria-hidden="true"
              /* No `allow-same-origin` — this preview has no business
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
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          )}

          {/* Same loading treatment as the "See it built" phones below —
              a soft wash of that template's own colour and its name,
              rather than a blank rectangle, until the iframe reports
              itself painted (or, on a cycle, every time it swaps). */}
          <div
            className={`dp-poster ${loaded ? "dp-gone" : ""}`}
            style={{ "--dp-accent": demo.accent }}
          >
            <span className="dp-poster-label">{demo.label}</span>
            <span className="dp-poster-names">{demo.names}</span>
          </div>
        </div>
      </div>

      <div className="w-cycler" aria-hidden="true">
        {DEMOS.map((d, i) => (
          <span key={d.slug} className={i === idx ? "on" : undefined} />
        ))}
      </div>
      <div className="w-cyclabel" aria-live="polite">
        {demo.label}
      </div>
    </div>
  );
}
