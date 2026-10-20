"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   The wall — invitations AND greeting cards, passing by in one endless row.

   It used to mount a live iframe per card (8 small copies of the whole
   app). On a real connection most of them were still painting their
   background colour when they scrolled past, so visitors saw a row of
   plain coloured boxes. Now every card is a picture of the real thing —
   taken from the actual demo pages (/demo/<slug>, /demo/card/<occasion>):
   the doors closed, the invitation opened, a card's cover, its message —
   so the row is always full and always looks its best. Each card still
   opens the live demo.

   SEAMLESS LOOP: `@keyframes w-marquee` slides the track by -50%, so the
   track holds the set twice. The set is 18 cards (~4,800px) — wider than
   any screen — so there is never an empty stretch before it comes round.

   To refresh a picture: open the demo at 390×547, screenshot, resize to
   496×696 and save as public/showcase/<name>.webp.
   ══════════════════════════════════════════════════════════════════════ */

const CARD_W = 248;
const CARD_H = 348;

const INV = { wedding: "Wedding", birthday: "Birthday", naming: "Naming Ceremony", housewarming: "Housewarming" };
const CARD = { christmas: "Christmas", diwali: "Diwali", eid: "Eid", "birthday-wish": "Birthday wish", onam: "Onam" };

const inv = (slug, shot) => ({
  key: `inv-${slug}-${shot}`, src: `/showcase/inv-${slug}-${shot}.webp`, kind: "Invitation", label: INV[slug],
  live: `/demo/${slug}?embed=1`, full: `/demo/${slug}`, make: "/create", makeLabel: "Create an invite like this",
});
const card = (occ, shot) => ({
  key: `card-${occ}-${shot}`, src: `/showcase/card-${occ}-${shot}.webp`, kind: "Greeting card", label: `${CARD[occ]} card`,
  live: `/demo/card/${occ}`, full: `/demo/card/${occ}`, make: `/greetings/create?occasion=${occ}`, makeLabel: "Send a card like this",
});

/* Interleaved, so an invitation is always next to a card. */
const WALL = [
  inv("wedding", "door"), card("christmas", "cover"), inv("birthday", "open"), card("diwali", "inside"),
  inv("housewarming", "door"), card("eid", "cover"), inv("naming", "open"), card("birthday-wish", "inside"),
  inv("wedding", "open"), card("onam", "cover"), inv("birthday", "door"), card("christmas", "inside"),
  inv("naming", "door"), card("diwali", "cover"), inv("housewarming", "open"), card("eid", "inside"),
  card("onam", "inside"), card("birthday-wish", "cover"),
];

/* Tapping a card used to navigate to the demo page itself — a page built
   for a phone, stretched across a laptop screen. Now it opens right here,
   over the wall: the live invitation or card in a phone, running (doors,
   pages turning), scrollable with a finger, with "make one like this"
   underneath and arrows to step through the rest of the wall. */
function PreviewModal({ index, onClose, onStep }) {
  const item = WALL[index];
  const [w, setW] = useState(340);

  useEffect(() => {
    const fit = () => {
      const byH = (window.innerHeight - 190) * (390 / 800);
      setW(Math.round(Math.max(220, Math.min(360, window.innerWidth - 48, byH))));
    };
    fit();
    window.addEventListener("resize", fit);
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  const scale = w / 390;
  const h = Math.round(w * (800 / 390));
  return (
    <div className="w-pv" role="dialog" aria-modal="true" aria-label={`${item.label} — live preview`} onClick={onClose}>
      <div className="w-pv-in" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="w-pv-x" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        <p className="w-pv-tag"><span className={item.kind === "Greeting card" ? "is-card" : ""}>{item.kind}</span> {item.label}</p>

        <div className="w-pv-stage">
          <button type="button" className="w-pv-nav" onClick={() => onStep(-1)} aria-label="Previous"><ChevronLeft size={20} /></button>
          <div className="w-pv-phone" style={{ width: w, height: h }}>
            <div className="w-pv-notch" />
            <div className="w-pv-screen">
              <iframe
                key={item.key}
                src={item.live}
                title={`${item.label} — live preview`}
                sandbox="allow-scripts"
                style={{ width: 390, height: Math.round(h / scale), transform: `scale(${scale})` }}
              />
            </div>
          </div>
          <button type="button" className="w-pv-nav" onClick={() => onStep(1)} aria-label="Next"><ChevronRight size={20} /></button>
        </div>

        <div className="w-pv-actions">
          <Link href={item.make} className="btn btn-primary">{item.makeLabel} <ArrowRight size={15} /></Link>
          <a href={item.full} target="_blank" rel="noreferrer" className="w-pv-full"><ExternalLink size={13} /> Open full screen</a>
        </div>
      </div>
    </div>
  );
}

function WallCard({ item, hidden, onOpen }) {
  return (
    <figure className={`w-wallcard ${item.kind === "Greeting card" ? "is-card" : "is-inv"}`}>
      <a href={item.full} className="w-wallcard-inner" tabIndex={hidden ? -1 : undefined} aria-label={`${item.label} — preview`}
        onClick={(e) => { e.preventDefault(); onOpen(); }}>
        <img src={item.src} alt="" width={CARD_W} height={CARD_H} loading="eager" fetchPriority="low" decoding="async" draggable="false" />
        <span className="w-wallcard-kind">{item.kind} · Preview</span>
      </a>
      <figcaption className="w-wallcap">{item.label}</figcaption>
    </figure>
  );
}

export default function InvitationWall() {
  const [open, setOpen] = useState(-1);
  const close = useCallback(() => setOpen(-1), []);
  const step = useCallback((d) => setOpen((i) => (i + d + WALL.length) % WALL.length), []);
  return (
    <div className="w-wall" style={{ "--card-w": `${CARD_W}px`, "--card-h": `${CARD_H}px` }}>
      <div className="w-wallrow">
        <div className="w-walltrack" style={{ animationDuration: `${WALL.length * 6.5}s` }}>
          {[0, 1].map((copy) => (
            <div className="w-wallset" key={copy} aria-hidden={copy === 1 || undefined}>
              {WALL.map((item, i) => (
                <WallCard key={`${copy}-${item.key}`} item={item} hidden={copy === 1} onOpen={() => setOpen(i)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Portalled to <body>: a transformed ancestor (the section's reveal
          animation) would otherwise trap a position: fixed overlay. */}
      {open >= 0 && typeof document !== "undefined" && createPortal(<PreviewModal index={open} onClose={close} onStep={step} />, document.body)}
    </div>
  );
}
