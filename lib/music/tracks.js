/* ══════════════════════════════════════════════════════════════════════
   BACKGROUND MUSIC — the track library.

   Every invitation gets ambient music matched to its occasion, picked
   automatically so nobody has to choose a track. This file only names
   which tracks exist; it does not fetch them and never ships them as
   `data:` URIs.

   Two tracks, supplied directly rather than sourced from Pixabay:
   `wedding-01.mp3` plays for weddings, `general-01.mp3` plays for every
   other occasion (birthday, naming, housewarming). `pickTrack()` below
   still supports a pool of several tracks per occasion — add more later
   by adding more entries to a list, no other code changes needed. */

export const MUSIC_DIR = "music";

/* kind        — matches `_cinema` (wedding) or `_premium` (the others)
   file        — saved as, under public/music/
   title/artist — free-form label, shown nowhere but kept for reference
   seconds     — approximate duration, so the player can loop cleanly
                 rather than guessing */
export const MUSIC_TRACKS = {
  wedding: [
    { id: "wed-1", file: "wedding-01.mp3", title: "Wedding track", artist: "Kevin" },
  ],
  birthday: [
    { id: "gen-1", file: "general-01.mp3", title: "General track", artist: "Kevin" },
  ],
  naming: [
    { id: "gen-1", file: "general-01.mp3", title: "General track", artist: "Kevin" },
  ],
  housewarming: [
    { id: "gen-1", file: "general-01.mp3", title: "General track", artist: "Kevin" },
  ],
};

/* `/music/wedding-01.mp3` from `wedding-01.mp3`. */
export const trackUrl = (file) => `/${MUSIC_DIR}/${file}`;

/* Which pool an event kind draws from. Wedding functions (haldi, mehendi,
   sangeet) are folded into the wedding invitation itself — see
   WEDDING_FUNCTIONS in the design route — so they never reach this map
   as their own kind. Anything unrecognised falls back to the birthday
   pool rather than throwing: a silent invitation is a worse failure than
   a slightly mismatched one. */
const POOL_FOR_KIND = {
  wedding: "wedding",
  birthday: "birthday",
  naming: "naming",
  housewarming: "housewarming",
};

/* A small, fast, non-cryptographic string hash (FNV-1a). It only has to
   spread similar strings apart, not resist an attacker — its one job is
   turning "Meera-Rohan-2027-02-06" into a number that picks a track. */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* Pick a track for this invitation. The pick is DETERMINISTIC on the
   seed, not re-rolled on every render or every visit — a guest who opens
   the link twice, and the couple looking at their own preview, all hear
   the same track. That is what "designed for you" has to mean here: one
   invitation, one music choice, not a slot machine. Two invitations for
   two different couples land on different tracks from the pool because
   their seeds differ, which is the only sense in which this is "random"
   — automatic and varied across invitations, not inconsistent within
   one. */
export function pickTrack(kind, seed) {
  const pool = MUSIC_TRACKS[POOL_FOR_KIND[kind] || "birthday"];
  if (!pool?.length) return null;
  const s = String(seed || "welcvm");
  return pool[hash(s) % pool.length];
}

/* A stable seed built from content that will not change turn to turn —
   names and the date, not anything the AI is still drafting. Falling
   back to the kind alone (same track for every untitled draft) is fine:
   the moment a couple gives their names the pick becomes theirs and
   never moves again, because `hash()` is pure. */
export function seedFor(tokens) {
  const bits = [
    tokens?.couple?.bride, tokens?.couple?.groom,        // wedding
    tokens?.host?.name, tokens?.host?.secondName,        // celebration
    tokens?.invitation?.displayDate,
  ].filter(Boolean);
  return bits.join("-") || tokens?.eventKind || "";
}

/* Every track in the library, deduplicated by id, regardless of which
   occasion pool(s) it appears in. The chooser (components/MusicPicker.js)
   shows this full list — the two tracks Kevin supplied should both be
   pickable on any occasion, not only the one they were seeded for by
   default. */
export function allTracks() {
  const seen = new Map();
  for (const pool of Object.values(MUSIC_TRACKS)) {
    for (const t of pool) if (!seen.has(t.id)) seen.set(t.id, t);
  }
  return [...seen.values()];
}

/* The track actually playing for this invitation:
     1. a track the couple/host uploaded themselves (`media.musicUrl`)
     2. a track they picked from the chooser (`media.musicTrackId`)
     3. the deterministic automatic pick, same as always

   This is the one place that decides "which track", so the chooser UI,
   the guest page and the create-page preview can never disagree about
   what is currently selected. */
export function resolveTrack(kind, tokens) {
  const media = tokens?.media || {};
  if (media.musicUrl) {
    return { id: "custom", file: null, url: media.musicUrl, title: media.musicLabel || "Your own track", artist: "" };
  }
  if (media.musicTrackId) {
    const found = allTracks().find((t) => t.id === media.musicTrackId);
    if (found) return found;
  }
  return pickTrack(kind, seedFor(tokens));
}

/* A track's actual playable URL, whether it is one of ours (relative,
   under public/music/) or an uploaded one (already an absolute
   https:// URL from Supabase Storage). */
export function trackSrc(track) {
  if (!track) return null;
  return track.url || trackUrl(track.file);
}
