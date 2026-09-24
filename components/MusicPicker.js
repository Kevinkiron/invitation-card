"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Play, Pause, Upload, Check, Loader2, RotateCcw } from "lucide-react";
import { C } from "@/lib/theme";
import { allTracks, resolveTrack, trackSrc } from "@/lib/music/tracks";
import { uploadAudio, describeAudioFile } from "@/lib/music/upload";

/* ══════════════════════════════════════════════════════════════════════
   BACKGROUND MUSIC PICKER

   Sits in the chat column once the invitation has an occasion, next to
   the "add photos" affordance. Every invitation already gets a track
   automatically (lib/music/tracks.js `pickTrack`) — this lets the couple
   or host either preview and pick a different one from the library, or
   upload a track of their own. Both choices are written straight onto
   `tokens.media` from the browser, the same way photos are: the model
   never has to know or care which track is playing.
   ══════════════════════════════════════════════════════════════════════ */
export default function MusicPicker({ tokens, eventKind, userId, onChoose, disabled }) {
  const tracks = allTracks();
  const active = resolveTrack(eventKind, tokens);
  const isCustom = Boolean(tokens?.media?.musicUrl);
  const isAuto = !isCustom && !tokens?.media?.musicTrackId;

  const [playingId, setPlayingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const audioRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const preview = (track) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const el = new Audio(trackSrc(track));
    el.volume = 0.6;
    el.onended = () => setPlayingId(null);
    el.play().catch(() => setErr("Could not play that preview — the file may still be missing on the server."));
    audioRef.current = el;
    setPlayingId(track.id);
  };

  const choose = (track) => {
    audioRef.current?.pause();
    setPlayingId(null);
    onChoose({ musicTrackId: track.id, musicUrl: null, musicLabel: track.title });
  };

  const resetToAuto = () => {
    audioRef.current?.pause();
    setPlayingId(null);
    onChoose({ musicTrackId: null, musicUrl: null, musicLabel: null });
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!userId) { setErr("Please sign in again before uploading music."); return; }
    const problem = describeAudioFile(file);
    if (problem) { setErr(problem); return; }
    setErr("");
    setUploading(true);
    try {
      const url = await uploadAudio(file, userId);
      const label = (file.name || "Your track").replace(/\.[a-z0-9]+$/i, "");
      onChoose({ musicUrl: url, musicTrackId: null, musicLabel: label });
    } catch (ex) {
      setErr(ex.message || "That upload did not go through.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 14px",
        marginBottom: 10, background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(140deg, ${C.gold}, ${C.marigold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Music2 size={13} color="#fff" />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>Background music</div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {isCustom
              ? `Playing your track — "${tokens.media.musicLabel || "uploaded"}"`
              : isAuto
                ? `Matched for you — "${active?.title || "a track"}". Pick a different one, or upload your own.`
                : `Set to "${active?.title || "a track"}".`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tracks.map((t) => {
          const isSelected = !isCustom && active?.id === t.id;
          const isPlaying = playingId === t.id;
          return (
            <div
              key={t.id}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: `1.5px solid ${isSelected ? C.gold : C.line}`,
                background: isSelected ? "rgba(200,162,74,.09)" : "#fff",
                borderRadius: 999, padding: "5px 6px 5px 5px",
              }}
            >
              <button
                type="button"
                onClick={() => preview(t)}
                disabled={disabled}
                aria-label={isPlaying ? `Pause preview of ${t.title}` : `Preview ${t.title}`}
                title={isPlaying ? "Pause preview" : "Preview"}
                style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: isSelected ? C.gold : C.ivory, color: isSelected ? "#fff" : C.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                {isPlaying ? <Pause size={11} /> : <Play size={11} style={{ marginLeft: 1 }} />}
              </button>
              <button
                type="button"
                onClick={() => choose(t)}
                disabled={disabled}
                style={{
                  border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: 700, color: C.ink, padding: "0 5px 0 0",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                {t.title}
                {isSelected && <Check size={12} color={C.gold} />}
              </button>
            </div>
          );
        })}

        <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" hidden onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            border: `1.5px dashed ${C.line}`, background: "#fff", borderRadius: 999,
            padding: "6px 12px", fontSize: 12, fontWeight: 700, color: C.heart,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {uploading ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
          {uploading ? "Uploading…" : "Upload your own"}
        </button>

        {(isCustom || tokens?.media?.musicTrackId) && (
          <button
            type="button"
            onClick={resetToAuto}
            disabled={disabled}
            title="Go back to the automatic pick"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 11.5, color: C.muted, padding: "6px 4px",
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {err && <div style={{ marginTop: 8, fontSize: 11.5, color: C.red }}>{err}</div>}
    </div>
  );
}
