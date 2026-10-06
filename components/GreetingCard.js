"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ParticleField from "@/components/greetings/ParticleField";
import Envelope from "@/components/greetings/Envelope";
import CardBook from "@/components/greetings/CardBook";
import "@/app/greeting-card.css";
import "@/app/greeting-envelope.css";

/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD RENDERER

   What the recipient opens, in two small ceremonies:

   1. a sealed envelope addressed to them (components/greetings/
      Envelope.js) — tapping the wax seal splits the ribbon, folds back
      the flap and drops the envelope away;
   2. the card it held (components/greetings/CardBook.js) — a photo
      cover that opens like a little book onto a printed verse and the
      sender's own letter: "Dear Anna," their photo and message, "From
      David & Family". On a wide screen it opens into a two-page spread;
      on a phone the pages turn one at a time.

   Particles (snow, petals, confetti — lib/greetings/occasions.js) start
   drifting once the envelope has gone, and the sender's music, if any,
   starts on the tap that breaks the seal (browsers only allow sound
   that begins inside a user gesture).

   `preview` (the create-page phone) skips the envelope and opens
   straight onto the letter page, silent: the sender is editing their
   own card, not being surprised by it.
   ══════════════════════════════════════════════════════════════════════ */
export default function GreetingCard({ tokens, preview = false, focusPage = null }) {
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

  /* The card underneath becomes usable once the envelope has dropped
     away (app/greeting-envelope.css: seal at 0s, gone from 1.45s). */
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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

  const openEnvelope = useCallback(() => {
    if (envelopeOpening) return;
    setEnvelopeOpening(true);
    /* Music starts on the tap itself — browsers only allow sound that
       begins inside a user gesture. */
    if (audioRef.current && !started) {
      setStarted(true);
      audioRef.current.play().catch(() => {});
    }
    const quick = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(setTimeout(() => setOpened(true), quick ? 0 : 1500));
  }, [envelopeOpening, started]);

  const style = {
    "--gc-bg": p.bg || "#1c1420",
    "--gc-surface": p.surface || "#241a2b",
    "--gc-accent": p.accent || "#c69a55",
    "--gc-deep": p.deep || "#8f294e",
    "--gc-ink": p.ink || "#fdf6ea",
    "--gc-muted": p.muted || "#c9b9c6",
  };


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

      <div className="gc-envelope-wrap">
        <div className="gc-stage">
          {/* The card itself — a cover, a verse and the letter, opening
              like a little book: components/greetings/CardBook.js. */}
          <CardBook
            occasion={tokens?.occasion}
            occasionName={tokens?.occasionName}
            palette={p}
            to={to}
            from={from}
            message={message}
            photoUrl={photoUrl}
            ready={opened}
            preview={preview}
            background={tokens?.background}
            look={tokens?.style}
            verse={tokens?.verse}
            cover={tokens?.cover}
            focusPage={focusPage}
          />
        </div>

        {!preview && (
          <Envelope
            to={to}
            from={from}
            stamp={tokens?.stamp}
            occasion={tokens?.occasion}
            occasionName={tokens?.occasionName}
            palette={p}
            opening={envelopeOpening}
            onOpen={openEnvelope}
          />
        )}
      </div>
    </div>
  );
}
