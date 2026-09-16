/* ══════════════════════════════════════════════════════════════════════
   BACKGROUND MUSIC — the track library.

   Every invitation gets ambient music matched to its occasion, picked
   automatically so nobody has to choose a track. This file only names
   which tracks exist; it does not fetch them and never ships them as
   `data:` URIs — see NOTICE at the bottom before adding anything here.

   LICENCE

   All tracks are from Pixabay Music, same platform and same licence as
   the demo photographs: free for commercial use, no attribution required
   (giving credit is welcomed, not owed). The one restriction that
   matters here — no reselling the track itself as a standalone file — is
   not something background music on an invitation page does.

   Pixabay gates the actual download behind a free account, unlike their
   images, so unlike `lib/demo/photos.js` there is no one-command fetch
   script here. `scripts/check-music.mjs` tells you exactly what is
   missing and exactly which page to get it from — see MUSIC-SETUP.md.
   ══════════════════════════════════════════════════════════════════════ */

export const MUSIC_DIR = "music";

/* kind        — matches `_cinema` (wedding) or `_premium` (the others)
   file        — saved as, under public/music/
   title/artist — as credited on the track page
   source      — the exact Pixabay page to download it from
   seconds     — approximate duration, so the player can loop cleanly
                 rather than guessing */
export const MUSIC_TRACKS = {
  wedding: [
    { id: "wed-1", file: "wedding-01.mp3", title: "Wedding Piano", artist: "PaulYudin",
      source: "https://pixabay.com/music/wedding-wedding-piano-162472/", seconds: 130 },
    { id: "wed-2", file: "wedding-02.mp3", title: "Wedding Romantic Love Music", artist: "andriig",
      source: "https://pixabay.com/music/wedding-wedding-romantic-love-music-471301/", seconds: 124 },
    { id: "wed-3", file: "wedding-03.mp3", title: "Wedding Garden Ceremony Glow", artist: "alex-morgan",
      source: "https://pixabay.com/music/wedding-wedding-garden-ceremony-glow-578500/", seconds: 178 },
  ],
  birthday: [
    { id: "bday-1", file: "birthday-01.mp3", title: "Birthday Celebration Tune", artist: "alex-morgan",
      source: "https://pixabay.com/music/introoutro-birthday-celebration-tune-579468/", seconds: 59 },
    { id: "bday-2", file: "birthday-02.mp3", title: "Birthday (Instrumental)", artist: "Pixabay",
      source: "https://pixabay.com/music/instrumental-birthday-584568/", seconds: 150 },
    { id: "bday-3", file: "birthday-03.mp3", title: "Birthday", artist: "The_Mountain",
      source: "https://pixabay.com/music/happy-childrens-tunes-birthday-490600/", seconds: 73 },
  ],
  naming: [
    { id: "nam-1", file: "naming-01.mp3", title: "Lullaby Music", artist: "Pixabay",
      source: "https://pixabay.com/music/lullabies-lullaby-lullaby-music-576578/", seconds: 102 },
    { id: "nam-2", file: "naming-02.mp3", title: "Gentle Baby Sleep Lullaby Dream", artist: "alex-morgan",
      source: "https://pixabay.com/music/lullabies-gentle-baby-sleep-lullaby-dream-530944/", seconds: 178 },
    { id: "nam-3", file: "naming-03.mp3", title: "Lullaby Music", artist: "MarloweMusic",
      source: "https://pixabay.com/music/modern-classical-lullaby-music-581507/", seconds: 159 },
  ],
  housewarming: [
    { id: "house-1", file: "housewarming-01.mp3", title: "Warm Acoustic Music", artist: "andriig",
      source: "https://pixabay.com/music/folk-warm-warm-acoustic-music-573245/", seconds: 140 },
    { id: "house-2", file: "housewarming-02.mp3", title: "Warm Acoustic Guitar", artist: "Universfield",
      source: "https://pixabay.com/music/acoustic-group-warm-acoustic-guitar-232912/", seconds: 94 },
    { id: "house-3", file: "housewarming-03.mp3", title: "Acoustic Folk", artist: "JonasBlakewood",
      source: "https://pixabay.com/music/folk-acoustic-folk-580577/", seconds: 146 },
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
