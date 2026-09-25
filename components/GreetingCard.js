"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { cardMotif } from "@/lib/design/showcase";
import ParticleField from "@/components/greetings/ParticleField";
import { getScene } from "@/components/greetings/scenes";
import "@/app/greeting-card.css";
import "@/app/greeting-scenes.css";

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
   ══════════════════════════════════════════════════════════════════════ */
export default function GreetingCard({ tokens, preview = false }) {
  const p = tokens?.palette || {};
  const to = tokens?.to || "Someone lovely";
  const from = tokens?.from || "";
  const message = tokens?.message || "";
  const photoUrl = tokens?.media?.photoUrl || null;
  const musicUrl = tokens?.media?.musicUrl || null;

  const [opened, setOpened] = useState(preview);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

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

      <div className="gc-stage">
        <div className={`gc-card ${opened ? "gc-open" : ""}`}>
          <div className="gc-card-inner">

            {/* ── Front: the closed cover ── */}
            <div className="gc-face gc-face-front">
              <span className="gc-front-glow" aria-hidden="true" />
              {Scene ? (
                <Scene accent={p.accent || "#c69a55"} palette={p} />
              ) : (
                <div className="gc-front-motif" style={{ backgroundImage: `url("${motifUrl}")` }} aria-hidden="true" />
              )}
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
    </div>
  );
}
