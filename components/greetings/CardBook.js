"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GreetingLottie from "@/components/greetings/GreetingLottie";
import FrameBorder from "@/components/greetings/FrameBorder";
import { cardTheme } from "@/lib/greetings/card-themes";
import { cardWords } from "@/lib/greetings/verses";
import { getLottie } from "@/lib/greetings/lottie";
import { getOccasion } from "@/lib/greetings/occasions";
import { coverPhoto, photoAlt } from "@/lib/greetings/photos";
import "@/app/greeting-book.css";

/* ══════════════════════════════════════════════════════════════════════
   CARD BOOK — the card that is left once the envelope has gone
   (components/GreetingCard.js). Built to Kevin's reference: a folded
   greeting card that opens like a little book.

   Three pages:
     1. the cover — a full-bleed photograph of the occasion with its
        title in gold ("Merry Christmas · & a happy new year")
     2. a verse — a short printed verse under an animated character,
        inside a decorated border (lib/greetings/verses.js)
     3. the letter — "Dear Anna,", the sender's photo with their
        message written over it, and "From David & Family"

   Wide screens see a real card: the cover swings open on its spine and
   the verse and the letter lie side by side as a two-page spread. On a
   phone a spread will not fit, so the pages turn one at a time, like a
   booklet, with Back / Next buttons, a page count and swipe.

   The border round the inside pages (FrameBorder.js) and the colours
   come from the occasion's card theme (lib/greetings/card-themes.js).
   `preview` (the create-page phone) opens straight onto the letter.
   ══════════════════════════════════════════════════════════════════════ */

function messageSize(len, photo) {
  const base = photo ? 0.92 : 1;
  const s = len > 300 ? 4.2 : len > 200 ? 4.9 : len > 120 ? 5.6 : 6.4;
  return `${(s * base).toFixed(2)}cqw`;
}

/* The cover title: as big as it can be while its longest word still
   fits across the cover. */
function titleSize(text) {
  const longest = Math.max(...text.split(" ").map((w) => w.length));
  return longest > 12 ? "11.5cqw" : longest > 9 ? "13.5cqw" : "16cqw";
}

function useWide(disabled) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (disabled) return;
    const mq = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [disabled]);
  return wide;
}

function Cover({ words, photo, alt, onOpen, label }) {
  return (
    <div className="cb-cover">
      {photo && <img className="cb-cover-photo" src={photo} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />}
      <span className="cb-cover-shade" aria-hidden="true" />
      <span className="cb-cover-frame" aria-hidden="true" />
      {[[14, 22, 0], [82, 30, 1.1], [24, 64, 2], [76, 58, .5], [50, 40, 1.6], [88, 78, 2.6], [12, 84, .9]].map(([x, y, d], i) => (
        <i key={i} className="cb-spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} aria-hidden="true" />
      ))}
      <div className="cb-cover-title">
        <h2 style={{ fontSize: titleSize(words.cover[0]) }}>{words.cover[0]}</h2>
        <p>{words.cover[1]}</p>
      </div>
      <button type="button" className="cb-cover-cta" onClick={onOpen}>
        {label} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

function VersePage({ theme, words, art }) {
  return (
    <div className="cb-page cb-verse">
      <FrameBorder theme={theme} />
      <div className="cb-inner">
        <p className="cb-kicker">{words.kicker}</p>
        <h3 className="cb-title">{words.title}</h3>
        {art && <div className="cb-art" aria-hidden="true"><GreetingLottie src={art.src} /></div>}
        <div className="cb-lines">
          {words.verse.map((l, i) => <span key={i} style={{ "--i": i }}>{l}</span>)}
        </div>
        <div className="cb-close">
          {words.close.map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <span className="cb-orn" aria-hidden="true">✦</span>
      </div>
    </div>
  );
}

function WishPage({ theme, words, to, from, message, photoUrl, emblem }) {
  const text = message || "Wishing you all the good things.";
  return (
    <div className="cb-page cb-wish" style={{ "--cb-msg": messageSize(text.length, !!photoUrl) }}>
      <FrameBorder theme={theme} />
      <div className="cb-inner">
        <p className="cb-kicker">{words.wish}</p>
        <h3 className="cb-dear">Dear {to},</h3>
        <span className="cb-orn" aria-hidden="true">✦</span>
        <div className={`cb-note ${photoUrl ? "has-photo" : ""}`}>
          {photoUrl && <img src={photoUrl} alt={`A photo from ${from || "the sender"}`} />}
          <span className="cb-note-label">Your wish</span>
          <p className="cb-msg">{text}</p>
          {!photoUrl && emblem && <div className="cb-note-art" aria-hidden="true"><GreetingLottie src={emblem.src} /></div>}
        </div>
        <p className="cb-from">From {from || "me"}</p>
      </div>
    </div>
  );
}

export default function CardBook({
  occasion, occasionName, palette = {}, to, from, message, photoUrl, ready = true, preview = false,
}) {
  const o = getOccasion(occasion);
  const theme = cardTheme(occasion, { palette, name: occasionName, lottie: o?.lottie });
  const words = cardWords(occasion, occasionName);
  const art = getLottie(theme.cast?.hero) || getLottie(theme.emblem);
  const emblem = getLottie(theme.emblem) || art;
  const cover = coverPhoto(o?.photo);

  const wide = useWide(preview);
  const [page, setPage] = useState(preview ? 2 : 0);
  const last = wide ? 1 : 2;
  /* Switching to the wide layout mid-read: the spread has two states
     (closed / open), so any inside page means open. */
  useEffect(() => { if (wide) setPage((p) => (p > 0 ? 1 : 0)); }, [wide]);

  const go = useCallback((n) => setPage((p) => Math.max(0, Math.min(last, p + n))), [last]);

  /* keyboard and swipe */
  useEffect(() => {
    if (!ready || preview) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, preview, go]);
  const swipe = useRef(null);
  const onDown = (e) => { swipe.current = e.clientX; };
  const onUp = (e) => {
    if (swipe.current == null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  const style = {
    "--cb-paper": theme.paper || "#fbf6ee",
    "--cb-ink": theme.ink || "#8f294e",
    "--cb-leaf": theme.leaf || "#6b7f4a",
    "--cb-panel": theme.panel || "#2b1a1f",
  };

  const coverEl = (
    <Cover
      words={words}
      photo={cover}
      alt={photoAlt(o?.photo)}
      onOpen={() => go(1)}
      label={`Open your ${(occasionName || "").replace(/ (Wishes|Mubarak)$/, "") || "card"} wish`}
    />
  );
  const verseEl = <VersePage theme={theme} words={words} art={art} />;
  const wishEl = <WishPage theme={theme} words={words} to={to} from={from} message={message} photoUrl={photoUrl} emblem={emblem} />;

  const labels = wide
    ? [["", "Open card →"], ["← Close", ""]]
    : [["", "Open card →"], ["← Cover", "Your wish →"], ["← Back", ""]];
  const [back, next] = labels[page] || ["", ""];

  const nav = (
    <nav className="cb-nav" aria-label="Card pages">
      <button type="button" className="cb-nav-btn" onClick={() => go(-1)} disabled={!back} tabIndex={back ? 0 : -1}>{back || "←"}</button>
      <span className="cb-count">{wide ? (page ? "Inside" : "Cover") : `${page + 1} / 3`}</span>
      <button type="button" className="cb-nav-btn cb-nav-next" onClick={() => go(1)} disabled={!next} tabIndex={next ? 0 : -1}>{next || "→"}</button>
    </nav>
  );

  if (wide) {
    return (
      <div className={`cb cb-spread ${page ? "is-open" : ""} ${ready ? "is-ready" : ""}`} style={style}>
        <div className="cb-book" onPointerDown={onDown} onPointerUp={onUp}>
          <div className={`cb-right ${page ? "is-shown" : ""}`}>{wishEl}</div>
          <div className="cb-leaf cb-spine-leaf">
            <div className="cb-face cb-front">{coverEl}</div>
            <div className={`cb-face cb-back ${page ? "is-shown" : ""}`}>{verseEl}</div>
          </div>
        </div>
        {nav}
      </div>
    );
  }

  const pages = [coverEl, verseEl, wishEl];
  return (
    <div className={`cb cb-stack ${ready ? "is-ready" : ""} ${preview ? "cb-instant" : ""}`} style={style}>
      <div className="cb-book" onPointerDown={onDown} onPointerUp={onUp}>
        {pages.map((el, k) => (
          <div
            key={k}
            className={`cb-leaf ${k < page ? "is-turned" : ""} ${k === page ? "is-shown" : ""}`}
            style={{ zIndex: 10 - k }}
            aria-hidden={k === page ? undefined : "true"}
          >
            <div className="cb-face cb-front">{el}</div>
            <div className="cb-face cb-back cb-paperback" />
          </div>
        ))}
      </div>
      {nav}
    </div>
  );
}
