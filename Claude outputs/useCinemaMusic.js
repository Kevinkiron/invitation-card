"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pickTrack, seedFor, trackUrl } from "@/lib/music/tracks";

/* ══════════════════════════════════════════════════════════════════════
   Background music for one invitation.

   Every browser blocks audio with sound from starting on page load —
   the guest has to do something first. The "Tap to open" gesture that
   already exists on every cinema template IS that something: it is a
   real click, on every device, before a single scene is visible. Music
   starts inside that same handler, so there is no separate "turn on
   music" step for a guest to notice or skip.

   `preview` (the create-page and dashboard preview) never starts audio
   at all — the couple are looking at their own invitation over and over
   while editing it; looping music under that would be exhausting rather
   than atmospheric, and it is not what a guest will experience.
   ══════════════════════════════════════════════════════════════════════ */

export function useCinemaMusic(kind, tokens, { preview = false } = {}) {
  const track = useMemo(() => pickTrack(kind, seedFor(tokens)), [kind, tokens]);
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [missing, setMissing] = useState(false);

  /* The mute choice is a guest's own, remembered for their next visit to
     any invitation, not the couple's to set. It only ever silences — it
     cannot start audio outside a real gesture, so it cannot be used to
     route around the autoplay rule above. */
  useEffect(() => {
    try {
      setMuted(window.localStorage.getItem("welcvm:muted") === "1");
    } catch {
      /* Private browsing, or storage disabled. Defaults to unmuted. */
    }
  }, []);

  useEffect(() => {
    if (preview || !track) return;
    const el = new Audio(trackUrl(track.file));
    el.loop = true;
    el.preload = "none"; // nothing fetched until the guest actually opens the card
    el.volume = 0.55;
    /* A track that has not been downloaded yet (see MUSIC-SETUP.md) 404s
       quietly here rather than surfacing a console error on every guest's
       phone — the invitation is not broken for lack of a song. */
    el.onerror = () => setMissing(true);
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, [preview, track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  /* Called from the SAME click handler that opens the invitation. Called
     anywhere else, most browsers ignore it — which is the point: this
     hook cannot be used to sneak audio in without a gesture. */
  const startOnGesture = useCallback(() => {
    if (preview || !audioRef.current || started) return;
    setStarted(true);
    audioRef.current.play().catch(() => {
      /* A handful of browsers still refuse this even from a real click
         (autoplay policy quirks, a device on silent mode intercepting
         it). The invitation does not depend on it — it opens either
         way — so this is swallowed rather than shown to a guest as an
         error about a song they never asked to hear. */
    });
  }, [preview, started]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        window.localStorage.setItem("welcvm:muted", next ? "1" : "0");
      } catch {
        /* Nothing to fall back to — the toggle still works for this
           visit, it just will not be remembered next time. */
      }
      return next;
    });
  }, []);

  return {
    track,
    hasTrack: Boolean(track) && !missing,
    started,
    muted,
    startOnGesture,
    toggleMuted,
  };
}
