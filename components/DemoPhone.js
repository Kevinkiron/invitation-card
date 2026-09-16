"use client";

import { useEffect, useRef, useState } from "react";
import "@/app/demo.css";

/* ══════════════════════════════════════════════════════════════════════
   A demo invitation, running, inside a phone.

   The invitation is loaded in an iframe rather than rendered inline, and
   that is deliberate. These templates use `position: fixed` layers, full
   viewport units and IntersectionObservers against the document. Dropped
   into the middle of the landing page and scaled with a transform, every
   one of those breaks — `100dvh` becomes the landing page's height, and
   a transformed ancestor turns every fixed layer into a child of this
   card. That exact bug has already shipped here once. An iframe gives
   each preview its own viewport and its own document, which is what the
   template was written against.

   The cost is a page load per preview, so nothing loads until it is
   nearly on screen, and each one is only mounted once.
   ══════════════════════════════════════════════════════════════════════ */

/* Wider than a real phone, then scaled down. Rendering at a true 390px
   and scaling up would soften the type; rendering wide and scaling down
   keeps it crisp and, more importantly, makes the template lay out as it
   would on a real handset rather than in a 250px sliver. */
const FRAME_WIDTH = 390;

export default function DemoPhone({ demo, height = 560, className = "" }) {
  const hostRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    /* No IntersectionObserver — an old browser, or a test environment —
       is not a reason to show an empty rectangle. Load it. */
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* An iframe that never fires `load` leaves a spinner on the page for
     ever. After eight seconds, show the poster instead. */
  useEffect(() => {
    if (!visible || loaded) return;
    const t = setTimeout(() => setFailed(true), 8000);
    return () => clearTimeout(t);
  }, [visible, loaded]);

  const scale = height / (FRAME_WIDTH * (19.5 / 9));
  const frameHeight = Math.round(FRAME_WIDTH * (19.5 / 9));

  return (
    <div
      ref={hostRef}
      className={`dp ${className}`}
      style={{
        "--dp-accent": demo.accent,
        "--dp-h": `${height}px`,
        "--dp-w": `${Math.round(FRAME_WIDTH * scale)}px`,
      }}
    >
      <div className="dp-shell" aria-hidden={!loaded ? "true" : undefined}>
        <div className="dp-notch" />
        <div className="dp-screen">
          {visible && !failed ? (
            <iframe
              /* `loading="lazy"` as well as the observer: the observer
                 decides when to mount it, the attribute stops a browser
                 that restores scroll position from fetching all four at
                 once on a reload. */
              loading="lazy"
              src={`${demo.href}?embed=1`}
              title={`${demo.label} invitation demonstration — ${demo.names}`}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              /* No `allow-same-origin`: the preview needs to run scripts
                 to scroll and reveal itself, but it has no business
                 touching this page, its storage or its cookies. */
              sandbox="allow-scripts"
              scrolling="no"
              style={{
                width: `${FRAME_WIDTH}px`,
                height: `${frameHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          ) : null}

          {/* Until the frame reports itself loaded — and permanently, if
              it never does — the screen carries the event's colour rather
              than a white hole in the layout. */}
          <div className={`dp-poster ${loaded ? "dp-gone" : ""}`}>
            <span className="dp-poster-label">{demo.label}</span>
            <span className="dp-poster-names">{demo.names}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
