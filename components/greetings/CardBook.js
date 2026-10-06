"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GreetingLottie from "@/components/greetings/GreetingLottie";
import FrameBorder from "@/components/greetings/FrameBorder";
import { cardTheme } from "@/lib/greetings/card-themes";
import { cardWords } from "@/lib/greetings/verses";
import { getLottie } from "@/lib/greetings/lottie";
import { getOccasion } from "@/lib/greetings/occasions";
import { coverPhoto, photoAlt } from "@/lib/greetings/photos";
import { cardStyleVars, customVerse } from "@/lib/greetings/card-style";
import { coverChoice } from "@/lib/greetings/covers";
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

const CAVEAT = "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap";

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

/* A small foil flourish for each inside corner of the cover frame,
   drawn for the top-left and mirrored for the other three. */
const FLOURISH =
  "M16 40 C16 26 26 16 40 16 M22 52 C22 34 34 22 52 22 M26 26 C34 30 38 36 38 44 C38 50 33 53 29 51 C25 49 26 44 30 44 " +
  "M26 26 C30 34 36 38 44 38 C50 38 53 33 51 29 C49 25 44 26 44 30 M58 22 L70 22 M22 58 L22 70";

function Cover({ words, photo, alt, onOpen, label, own = false }) {
  return (
    <div className="cb-cover">
      {photo && own && (
        /* The sender's own photo is never cropped to fill the cover: a
           soft, blurred copy fills the card and the whole photo sits on
           top of it, so nobody's face is cut off. */
        <>
          <img className="cb-cover-photo cb-cover-blur" src={photo} alt="" aria-hidden="true" />
          <img className="cb-cover-whole" src={photo} alt={alt || "The sender's photo"} />
        </>
      )}
      {photo && !own && <img className="cb-cover-photo" src={photo} alt={alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />}
      <span className="cb-cover-shade" aria-hidden="true" />
      <svg className="cb-foil-frame" viewBox="0 0 300 430" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="cb-foil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a8752a" /><stop offset=".22" stopColor="#f6e2a0" /><stop offset=".4" stopColor="#c08b34" />
            <stop offset=".58" stopColor="#fff2c8" /><stop offset=".78" stopColor="#b27d2b" /><stop offset="1" stopColor="#ecd08a" />
          </linearGradient>
        </defs>
        <rect x="11" y="11" width="278" height="408" rx="4" fill="none" stroke="url(#cb-foil)" strokeWidth="1.6" />
        <rect x="16" y="16" width="268" height="398" rx="2.5" fill="none" stroke="url(#cb-foil)" strokeWidth=".7" />
        {[[0, 0, 1, 1], [300, 0, -1, 1], [300, 430, -1, -1], [0, 430, 1, -1]].map(([x, y, sx, sy], i) => (
          <path
            key={i}
            transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
            d={FLOURISH}
            fill="none" stroke="url(#cb-foil)" strokeWidth="1.3" strokeLinecap="round"
          />
        ))}
      </svg>
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

/* `own` is the sender's own title and lines (lib/greetings/card-style.js
   customVerse), which replace the printed verse and its closing couplet;
   a blank title keeps the occasion's. */
function VersePage({ theme, words, art, own }) {
  const lines = own?.lines?.length ? own.lines : words.verse;
  const close = own?.lines?.length ? [] : words.close;
  return (
    <div className={`cb-page cb-verse ${lines.length > 5 ? "is-long" : ""}`}>
      <FrameBorder theme={theme} />
      <div className="cb-inner">
        <p className="cb-kicker">{words.kicker}</p>
        <h3 className="cb-title">{own?.title || words.title}</h3>
        {art && <div className="cb-art" aria-hidden="true"><GreetingLottie src={art.src} /></div>}
        <div className="cb-lines">
          {lines.map((l, i) => <span key={i} style={{ "--i": i }}>{l}</span>)}
        </div>
        {close.length > 0 && (
          <div className="cb-close">
            {close.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        )}
        <span className="cb-orn" aria-hidden="true">✦</span>
      </div>
    </div>
  );
}

/* The sender's photo is the background of the message box, as it has
   always been, but CONTAINED rather than cropped: the whole photo shows,
   centred, over a soft blurred copy of itself that fills the rest of the
   box — so nobody's face is ever cut off. The message is written over
   it with a light veil at the top for legibility. */
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
          {photoUrl && (
            /* the photo layers in one wrapper, so their outer edges can
               melt into the card paper without fading the writing */
            <span className="cb-note-bg">
              <img className="cb-note-fill" src={photoUrl} alt="" aria-hidden="true" />
              <span className="cb-note-photo-wrap">
                <img className="cb-note-photo" src={photoUrl} alt={`A photo from ${from || "the sender"}`} />
              </span>
            </span>
          )}
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
  background = null, look = null, verse = null, cover = null, focusPage = null,
}) {
  const o = getOccasion(occasion);
  const theme = cardTheme(occasion, { palette, name: occasionName, lottie: o?.lottie });
  const words = cardWords(occasion, occasionName);
  const art = getLottie(theme.cast?.hero) || getLottie(theme.emblem);
  const emblem = getLottie(theme.emblem) || art;
  const chosen = coverChoice(occasion, cover);
  const coverSrc = chosen?.url || coverPhoto(o?.photo);
  const coverAlt = chosen?.alt ?? photoAlt(o?.photo);
  const own = customVerse({ verse });
  const { vars, dark, font } = cardStyleVars({ background, style: look }, theme);

  const wide = useWide(preview);
  const [page, setPage] = useState(preview ? 2 : 0);
  const last = wide ? 1 : 2;
  /* Switching to the wide layout mid-read: the spread has two states
     (closed / open), so any inside page means open. */
  useEffect(() => { if (wide) setPage((p) => (p > 0 ? 1 : 0)); }, [wide]);
  /* The create page turns the preview to the page being edited: the
     cover while choosing a cover, the verse while writing it, and so on. */
  useEffect(() => { if (focusPage != null) setPage(focusPage); }, [focusPage]);

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
    ...vars,
  };

  const coverEl = (
    <Cover
      words={words}
      photo={coverSrc}
      alt={coverAlt}
      own={Boolean(cover?.photoUrl && chosen)}
      onOpen={() => go(1)}
      label={`Open your ${(occasionName || "").replace(/ (Wishes|Mubarak)$/, "") || "card"} wish`}
    />
  );
  const verseEl = <VersePage theme={theme} words={words} art={art} own={own} />;
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
      <div className={`cb cb-spread ${page ? "is-open" : ""} ${ready ? "is-ready" : ""} ${dark ? "cb-dark" : ""}`} style={style}>
        {font === "handwritten" && <link rel="stylesheet" href={CAVEAT} />}
        <div className="cb-book" onPointerDown={onDown} onPointerUp={onUp}>
          <div className={`cb-right ${page ? "is-shown" : ""}`}>{wishEl}</div>
          <div className="cb-leaf cb-spine-leaf">
            <div className="cb-face cb-front">{coverEl}</div>
            <i className="cb-edge" aria-hidden="true" />
            <div className={`cb-face cb-back ${page ? "is-shown" : ""}`}>{verseEl}</div>
          </div>
        </div>
        {nav}
      </div>
    );
  }

  const pages = [coverEl, verseEl, wishEl];
  return (
    <div className={`cb cb-stack ${ready ? "is-ready" : ""} ${preview ? "cb-instant" : ""} ${page < 2 ? "has-under" : ""} ${dark ? "cb-dark" : ""}`} style={style}>
      {font === "handwritten" && <link rel="stylesheet" href={CAVEAT} />}
      <div className="cb-book" onPointerDown={onDown} onPointerUp={onUp}>
        {pages.map((el, k) => (
          <div
            key={k}
            className={`cb-leaf ${k < page ? "is-turned" : ""} ${k === page ? "is-shown" : ""}`}
            style={{ zIndex: 10 - k, "--k": k }}
            aria-hidden={k === page ? undefined : "true"}
          >
            <div className="cb-face cb-front">{el}</div>
            <i className="cb-edge" aria-hidden="true" />
            <div className="cb-face cb-back cb-paperback" />
          </div>
        ))}
      </div>
      {nav}
    </div>
  );
}
