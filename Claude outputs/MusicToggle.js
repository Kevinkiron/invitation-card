"use client";

import "@/app/music.css";

/* A small floating pill, present once the invitation is open, that lets
   a guest turn the music off — or back on, since muting is a toggle, not
   a one-way door. It never appears in `preview`: the hook returns
   `started: false` for the lifetime of a preview render, and this stays
   hidden until `started` is true, which mirrors that a preview never
   plays anything to silence in the first place. */
export default function MusicToggle({ music, className = "" }) {
  if (!music.hasTrack || !music.started) return null;

  return (
    <button
      type="button"
      className={`music-toggle ${className}`}
      onClick={music.toggleMuted}
      aria-pressed={!music.muted}
      aria-label={music.muted ? "Turn music on" : "Turn music off"}
      title={music.muted ? "Turn music on" : "Turn music off"}
    >
      {music.muted ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}
