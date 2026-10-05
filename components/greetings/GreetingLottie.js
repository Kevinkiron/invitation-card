"use client";

import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════════════════════════════════
   GREETING LOTTIE — plays one animation from lib/greetings/lottie.js.

   Backed by @lottiefiles/dotlottie-wc, LottieFiles' own web component for
   both plain Lottie JSON and the ".lottie" (dotLottie, a zip archive)
   files every animation in lib/greetings/lottie.js actually is. Loaded
   once from a CDN — <script type="module">, not an npm dependency — the
   same "one script tag, no build step" choice already made for anything
   in this app that only a browser needs (see app/greetings.css's
   comments on why fetched assets never enter the git repo either).

   The element itself (<dotlottie-wc>) is a genuine custom element; React
   passes unrecognised props straight through as DOM attributes, so this
   component is mostly just "load the script once, then render the tag."
   ══════════════════════════════════════════════════════════════════════ */

const SCRIPT_SRC = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.28/dist/dotlottie-wc.js";
let loadPromise = null;

function loadDotLottie() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.customElements?.get("dotlottie-wc")) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      return;
    }
    const el = document.createElement("script");
    el.type = "module";
    el.src = SCRIPT_SRC;
    el.onload = resolve;
    /* A blocked or offline CDN should not crash the card — the front
       cover keeps its motif/gradient background either way, just
       without the animation on top of it. */
    el.onerror = resolve;
    document.head.appendChild(el);
  });
  return loadPromise;
}

export default function GreetingLottie({ src, className = "", style, loop = true, speed = 1 }) {
  const ref = useRef(null);
  /* `animate` starts true so the server-rendered markup and the client's
     first render match (no hydration mismatch); the reduced-motion check
     needs `window`, so it runs after mount, in the effect below. Under
     prefers-reduced-motion the animation still renders, but holds still
     on its first frame instead of looping — the characters on the inside
     of the card (components/greetings/IllustratedCard.js) are the
     picture, so hiding them outright would leave an empty corner. */
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    loadDotLottie();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!mq.matches);
    const onChange = () => setAnimate(!mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  if (!src) return null;

  return (
    <dotlottie-wc
      ref={ref}
      src={src}
      autoplay={animate ? "true" : undefined}
      loop={animate && loop ? "true" : undefined}
      speed={String(speed)}
      // `class`, not `className`: React 18 passes props to custom
      // elements as literal attribute names, so className would land as
      // an attribute called "className" and no CSS class would apply.
      class={`gc-lottie ${className}`.trim()}
      style={{ display: "block", pointerEvents: "none", ...style }}
      aria-hidden="true"
    />
  );
}
