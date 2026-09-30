"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { cardMotif } from "@/lib/design/showcase";
import ParticleField from "@/components/greetings/ParticleField";
import Envelope from "@/components/greetings/Envelope";
import { getScene } from "@/components/greetings/scenes";
import "@/app/greeting-card.css";
import "@/app/greeting-scenes.css";
import "@/app/greeting-envelope.css";

/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD RENDERER

   A greeting card is one message to one recipient, so this is much
   smaller than WeddingCinema.js or CelebrationCinema.js: no scroll-driven
   scenes, no RSVP. What it does borrow from the wedding template is the
   ceremony of opening it — the guest sees a closed cover first and the
   card flips open on tap to reveal the message, with particles (snow,
   petals, confetti — see lib/greetings/occasions.js) drifting behind it
   and a soft gold shimmer across the occasion name, the same
   foil-catching-light trick the wedding cinema's monogram uses.

   The closed cover itself is either a hand-built animated scene (Santa's
   sleigh flying past a shining star for Christmas, a blooming pookalam
   and a gliding boat for Onam — components/greetings/scenes/) for the
   occasions that have one, or the plain parametric motif from
   lib/design/showcase.js for every other occasion. See
   components/greetings/scenes/index.js for which is which — that list
   grows over time rather than every occasion getting a thinner version
   of the same treatment at once.

   `preview` (the create-page phone) starts already open and silent, the
   same convention WeddingCinema/CelebrationCinema use, and for the same
   reason: the sender is editing their own card, not being surprised by
   it.

   Before any of that, the guest sees the card as a sealed envelope
   (components/greetings/Envelope.js) addressed to them, postmarked with
   that occasion's own stamp (lib/greetings/occasions.js). Breaking the
   seal is its own small ceremony — the flap folds back and the envelope
   fades away — before the card underneath is even tappable, so opening a
   card is two small moments instead of one.
   ══════════════════════════════════════════════════════════════════════ */
export default function GreetingCard({ tokens, preview = false }) {
  const p = tokens?.palette || {};
  const to = tokens?.to || "Someone lovely";
  const from = tokens?.from || "";
  const message = tokens?.message || "";
  const photoUrl = tokens?.media?.photoUrl || null;
  const musicUrl = tokens?.media?.musicUrl || null;

  const [opened, setOpened] = useState(preview);
  const [envelopeOpening, setEnvelopeOpening] = useState(preview);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const openEnvelope = useCallback(() => setEnvelopeOpening(true), []);

  useEffect(() => {
    if (preview || !musicUrl) return;
    const el = new Audio(musicUrl);
    el.loop = true;
    el.preload = "none";
    el.volume = 0.55;
    audioRef.current = el;
    return () => { el.pause(); el.src = ""; audioRef.current = null; };
  }, [preview, musicUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const open = useCallback(() => {
    setOpened(true);
    if (!preview && audioRef.current && !started) {
      setStarted(true);
      audioRef.current.play().catch(() => {});
    }
  }, [preview, started]);

  /* ── The tilt — a fine-pointer flourish, never the whole story ──
     The card leans toward the cursor and a soft glare tracks it, the same
     "catching the light" trick real foil stationery has. It never runs in
     the sender's own preview (nothing to tilt toward while they're
     editing), on a touch device (no hover to ask for it), or with reduced
     motion requested — the foil sweep and shimmer already carry the
     premium feel with no pointer at all. */
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  useEffect(() => {
    if (preview) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrap = wrapRef.current, stage = stageRef.current;
    if (!wrap || !stage) return;

    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 12;
      const ry = (px - 0.5) * 16;
      stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      stage.style.setProperty("--gc-gx", `${px * 100}%`);
      stage.style.setProperty("--gc-gy", `${py * 100}%`);
      stage.classList.add("gc-tilting");
    };
    const onLeave = () => {
      stage.style.transform = "";
      stage.classList.remove("gc-tilting");
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [preview]);

  const style = {
    "--gc-bg": p.bg || "#1c1420",
    "--gc-surface": p.surface || "#241a2b",
    "--gc-accent": p.accent || "#c69a55",
    "--gc-deep": p.deep || "#8f294e",
    "--gc-ink": p.ink || "#fdf6ea",
    "--gc-muted": p.muted || "#c9b9c6",
  };

  const motifUrl = cardMotif(tokens?.motif || "botanical", p.accent || "#c69a55");
  const Scene = getScene(tokens?.occasion);
  // Every occasion resolves to some Scene now (a bespoke one for
  // Christmas/Onam, GenericScene — motif + Lottie — for the rest), so the
  // closed cover always has something animated on it, never a flat motif.

  return (
    <div className={`gc ${preview ? "gc-preview" : ""}`} style={style}>
      {opened && <ParticleField kind={tokens?.particle || "petals"} count={preview ? 8 : 18} />}

      {!preview && musicUrl && opened && (
        <button
          type="button"
          className="gc-mute"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={!muted}
          aria-label={muted ? "Turn music on" : "Turn music off"}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}

      <div className="gc-envelope-wrap" ref={wrapRef}>
        <div className="gc-stage" ref={stageRef}>
          <div className={`gc-card ${opened ? "gc-open" : ""}`}>
            <div className="gc-card-inner">

              {/* ── Front: the closed cover ── */}
              <div className="gc-face gc-face-front">
                <span className="gc-front-glow" aria-hidden="true" />
                <span className="gc-glare" aria-hidden="true" />
                <Scene occasion={tokens?.occasion} accent={p.accent || "#c69a55"} palette={p} />
                <div className="gc-front-frame" aria-hidden="true" />
                <div className="gc-front-body">
                  <p className="gc-front-eyebrow">A card for</p>
                  <h2 className="gc-front-to">{to}</h2>
                  <p className="gc-front-occasion">{tokens?.occasionName || "A little something"}</p>
                  <button type="button" className="gc-open-btn" onClick={open}>
                    <Sparkles size={13} className="gc-open-spark" />
                    <span>Tap to open</span>
                  </button>
                </div>
              </div>

              {/* ── Back: the message, revealed on flip ── */}
              <div className="gc-face gc-face-back">
                <div className="gc-back-motif" style={{ backgroundImage: `url("${motifUrl}")` }} aria-hidden="true" />
                <span className="gc-glare" aria-hidden="true" />
                {photoUrl && (
                  <div className="gc-photo">
                    <img src={photoUrl} alt="" />
                  </div>
                )}
                <p className="gc-back-eyebrow">{tokens?.occasionName || "A little something"}</p>
                <p className="gc-back-to">To {to},</p>
                <p className="gc-back-message">{message || "Wishing you all the good things."}</p>
                {from && <p className="gc-back-from">— {from}</p>}
              </div>
            </div>
          </div>
        </div>

        {!preview && (
          <Envelope to={to} from={from} stamp={tokens?.stamp} opening={envelopeOpening} onOpen={openEnvelope} />
        )}
      </div>
    </div>
  );
}
