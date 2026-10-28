"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMOS } from "@/lib/demo/fixtures";
import { CARD_DEMOS, cardDemo } from "@/lib/demo/cards";
import "@/app/demo.css"; // .dp-poster for the very first load
import OpeningPoster from "@/components/OpeningPoster";

/* ══════════════════════════════════════════════════════════════════════
   The hero phone — real Welcvm pages, not pictures of them.

   The hero shows ONE of these, kind="showcase": the wedding invitation
   and the Christmas card taking turns, forever. (kind="invites" cycles the
   four demo invitations (/demo/<slug>?embed=1, lib/demo/fixtures.js) and
   kind="cards" cycles demo greeting cards (/demo/card/<occasion>,
   lib/demo/cards.js).) Each is rendered by the same components a customer's page uses, in a
   sandboxed iframe (they are built on position: fixed / 100dvh layers,
   which only behave inside their own document).

   WHY IT IS DOUBLE-BUFFERED: it used to swap one iframe's src every
   4.6s and hide it behind a coloured "poster" until the new page
   reported loaded. A whole invitation (photos, fonts, scripts) takes
   longer than that on a phone connection, so the poster came back
   before the page ever showed — visitors saw only "HOUSEWARMING / 11
   Champa Road" on a blank screen, never a template. Now the next page
   loads in a hidden iframe BEHIND the current one, and the phone only
   cross-fades once it has painted; the clock for the next change starts
   when a page becomes visible. The poster only covers the very first
   load. At most two iframes exist at a time.
   ══════════════════════════════════════════════════════════════════════ */

const FRAME_WIDTH = 390;
const FRAME_ASPECT = 620 / 302; // .w-phone's aspect-ratio: 302 / 620
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * FRAME_ASPECT);
const SETTLE_MS = 700;   // after `load`, let the page paint its first scene
const FADE_MS = 650;

const MODES = {
  invites: {
    tab: "Invitations",
    dwell: 10000, // the doors (1.6s + 2.7s), then a few seconds of the page
    items: DEMOS.map((d) => ({ key: `i-${d.slug}`, src: `/demo/${d.slug}?embed=1`, label: d.label, names: d.names, accent: d.accent })),
  },
  cards: {
    tab: "Greeting cards",
    dwell: 11200, // long enough for the card to turn all three pages (CardDemo PAGE_MS)
    items: CARD_DEMOS.map((c) => {
      const d = cardDemo(c.occasion);
      return { key: `c-${c.occasion}`, src: `/demo/card/${c.occasion}`, label: `${d.name} card`, names: `For ${d.to}`, accent: d.accent };
    }),
  },
  /* The hero's ONE phone: the best of each product, taking turns and
     repeating — the wedding invitation (doors, then the whole story
     scrolling past at hero speed), then the Christmas card turning its
     pages. Each item carries its own dwell and its own tag. */
  showcase: {
    tab: "Invitation",
    dwell: 9000,
    items: (() => {
      const w = DEMOS.find((d) => d.slug === "wedding") || DEMOS[0];
      const c = cardDemo("christmas");
      return [
        { key: "s-wedding", src: `/demo/${w.slug}?embed=1&speed=150`, label: `${w.label} invitation`, names: w.names, accent: w.accent,
          tag: "Invitation", card: false, dwell: 28000 },
        { key: "s-christmas", src: "/demo/card/christmas", label: `${c.name} card`, names: `For ${c.to}`, accent: c.accent,
          tag: "Greeting card", card: true, dwell: 11200 },
      ];
    })(),
  },
};

export default function HeroPhone({ kind = "invites", tag, className = "" }) {
  const wrapRef = useRef(null);
  const screenRef = useRef(null);
  const [active, setActive] = useState(false);
  const [scale, setScale] = useState(0.72);
  const [frameH, setFrameH] = useState(FRAME_HEIGHT);
  const mode = MODES[kind] ? kind : "invites";
  const [idx, setIdx] = useState(0);              // the page on show
  const [layers, setLayers] = useState([]);       // [{ i, ready, shown }]
  const timers = useRef([]);

  const items = MODES[mode].items;
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  /* Start loading only when the hero is near the screen. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setActive(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } }, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* .w-phone is a fluid width; refit the 390px page into it. */
  useEffect(() => {
    const el = screenRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0]?.contentRect || {};
      if (w) {
        setScale(w / FRAME_WIDTH);
        /* the screen can be a touch taller than the 302:620 ratio; make
           the page fill it so no strip shows under it */
        if (h) setFrameH(Math.max(FRAME_HEIGHT, Math.ceil(h / (w / FRAME_WIDTH))));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* (Re)start a mode on its first page. */
  useEffect(() => {
    if (!active) return;
    clearTimers();
    setIdx(0);
    setLayers([{ i: 0, ready: false, shown: false }]);
    return clearTimers;
  }, [active, mode]);

  const onLoaded = useCallback((i) => {
    later(() => {
      setLayers((ls) => {
        const target = ls.find((l) => l.i === i);
        if (!target || target.ready) return ls;
        return ls.map((l) => (l.i === i ? { ...l, ready: true, shown: true } : l));
      });
      setIdx(i);
      /* the page underneath goes once the fade has finished */
      later(() => setLayers((ls) => ls.filter((l) => l.i === i)), FADE_MS + 50);
      /* and the next one starts loading after this one has been seen */
      if (items.length > 1) {
        later(() => {
          const next = (i + 1) % items.length;
          setLayers((ls) => (ls.some((l) => l.i === next) ? ls : [...ls, { i: next, ready: false, shown: false }]));
        }, items[i]?.dwell || MODES[mode].dwell);
      }
    }, SETTLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mode]);

  const current = items[idx] || items[0];
  const firstLoad = !layers.some((l) => l.shown);

  return (
    <div className={`w-phonewrap ${className}`.trim()} ref={wrapRef}>
      <div className={`w-phonetag ${current.card ? "is-card" : ""}`.trim()}>{tag || current.tag || MODES[mode].tab}</div>

      <div className="w-phone">
        <div className="w-notch" />
        <div className="w-screen" ref={screenRef}>
          {active && layers.map((l) => {
            const it = items[l.i];
            if (!it) return null;
            return (
              <iframe
                key={`${mode}-${it.key}`}
                src={it.src}
                title={`${it.label} — a Welcvm demo`}
                loading="eager"
                tabIndex={-1}
                aria-hidden="true"
                sandbox="allow-scripts"
                scrolling="no"
                onLoad={() => onLoaded(l.i)}
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: `${FRAME_WIDTH}px`, height: `${frameH}px`,
                  border: 0, display: "block", pointerEvents: "none",
                  transform: `scale(${scale})`, transformOrigin: "top left",
                  opacity: l.shown ? 1 : 0,
                  zIndex: l.shown ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease`,
                }}
              />
            );
          })}

          <OpeningPoster
            label={current.label}
            names={current.names}
            accent={current.accent}
            variant={mode === "cards" || current.card ? "envelope" : "doors"}
            gone={!firstLoad}
            style={{ zIndex: 2 }}
          />
        </div>
      </div>

      <div className="w-cycler" aria-hidden="true">
        {items.map((d, i) => (
          <span key={d.key} className={i === idx ? "on" : undefined} />
        ))}
      </div>
      <div className="w-cyclabel" aria-live="polite">
        {current.label}
      </div>
    </div>
  );
}
