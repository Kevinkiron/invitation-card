/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD OCCASIONS

   The registry for the greetings portal — the equivalent of
   lib/design/showcase.js's EVENTS for invitations. Each entry is one card
   on /greetings and one starting point for /greetings/create.

   `motif` names a case in `cardMotif()` (lib/design/showcase.js) — the
   same parametric-SVG approach the invitation cards already use, so a
   new occasion is a new list entry plus, at most, one new motif case,
   never a bespoke illustration to commission.

   `particle` picks which floating-particle shape GreetingCard.js scatters
   behind the open card (see components/greetings/ParticleField.js) —
   snow, petals, confetti, or none.

   `photo` names a file in lib/greetings/photos.js (GREETING_PHOTOS) — a
   real photograph of the occasion, shown as the background of that
   occasion's tile on the /greetings landing grid (app/greetings/page.js)
   instead of a flat colour.

   `lottie` names a key in lib/greetings/lottie.js (LOTTIE) — the Lottie
   animation GenericScene (components/greetings/scenes/GenericScene.js)
   plays on the closed cover of the card itself, for every occasion below
   that doesn't have a fully bespoke scene (see
   components/greetings/scenes/index.js — today that's every one except
   Christmas and Onam).
   ══════════════════════════════════════════════════════════════════════ */

export const OCCASIONS = [
  {
    slug: "christmas",
    name: "Christmas",
    tag: "Warmth, lights and good company",
    motif: "holly",
    particle: "snow",
    photo: "christmas.jpg",
    lottie: "snow",
    palette: { bg: "#0f2a20", surface: "#153a2c", accent: "#c9a24a", deep: "#7a1f2b", ink: "#fdf6ea", muted: "#bcd3c4" },
    greeting: "Wishing you a Christmas as warm and bright as the lights on the tree.",
  },
  {
    slug: "new-year",
    name: "New Year",
    tag: "A fresh page, a bright one",
    motif: "firework",
    particle: "confetti",
    photo: "new-year.jpg",
    lottie: "fireworks",
    palette: { bg: "#0b1330", surface: "#141d47", accent: "#e8b84b", deep: "#1f2a5c", ink: "#fdf6ea", muted: "#b9c0e0" },
    greeting: "Here's to new beginnings and everything the new year has in store.",
  },
  {
    slug: "diwali",
    name: "Diwali",
    tag: "Light, over everything else",
    motif: "diya",
    particle: "petals",
    photo: "diwali.jpg",
    lottie: "diya",
    palette: { bg: "#2a0f14", surface: "#3a141b", accent: "#e8912d", deep: "#8f294e", ink: "#fff3e0", muted: "#e3bfa8" },
    greeting: "May this Diwali light up your home with joy, warmth and good fortune.",
  },
  {
    slug: "onam",
    name: "Onam",
    tag: "A homecoming, a harvest, a feast",
    motif: "pookalam",
    particle: "petals",
    photo: "onam.jpg",
    lottie: "flowerBloom",
    palette: { bg: "#123321", surface: "#194229", accent: "#e8b84b", deep: "#7a1f1f", ink: "#fdf6ea", muted: "#bcd3c4" },
    greeting: "Onam ashamsakal — may this season of harvest bring you abundance and joy.",
  },
  {
    slug: "eid",
    name: "Eid Mubarak",
    tag: "A gentle, generous morning",
    motif: "crescent",
    particle: "confetti",
    photo: "eid.jpg",
    lottie: "moon",
    palette: { bg: "#0d2b26", surface: "#123a33", accent: "#d4af6a", deep: "#1c4a41", ink: "#fdf6ea", muted: "#bcd6ce" },
    greeting: "Eid Mubarak — may this day bring peace, joy and blessings to you and yours.",
  },
  {
    slug: "holi",
    name: "Holi",
    tag: "Colour, thrown generously",
    motif: "splash",
    particle: "confetti",
    photo: "holi.jpg",
    lottie: "confettiBurst",
    palette: { bg: "#3a1042", surface: "#4a1554", accent: "#e8912d", deep: "#0e5c63", ink: "#fff8ea", muted: "#dcc3e0" },
    greeting: "Happy Holi! May your year be as colourful as the day ahead.",
  },
  {
    slug: "raksha-bandhan",
    name: "Raksha Bandhan",
    tag: "A thread, and everything it means",
    motif: "thread",
    particle: "petals",
    photo: "raksha-bandhan.jpg",
    lottie: "heart",
    palette: { bg: "#3a141b", surface: "#4a1a22", accent: "#e8b84b", deep: "#8f294e", ink: "#fdf6ea", muted: "#e3bfa8" },
    greeting: "Happy Raksha Bandhan — grateful for a bond that time only makes stronger.",
  },
  {
    slug: "pongal",
    name: "Pongal",
    tag: "Sun, harvest, gratitude",
    motif: "sun",
    particle: "petals",
    photo: "pongal.jpg",
    lottie: "flowerBloom",
    palette: { bg: "#2a1f10", surface: "#3a2a16", accent: "#e8b84b", deep: "#7a4a1f", ink: "#fff3e0", muted: "#e3d3a8" },
    greeting: "Wishing you a Pongal filled with warmth, plenty and good company.",
  },
  {
    slug: "birthday-wish",
    name: "Birthday Wishes",
    tag: "One more year, celebrated properly",
    motif: "confetti",
    particle: "confetti",
    photo: "birthday-wish.jpg",
    lottie: "balloon",
    palette: { bg: "#2a1030", surface: "#3a1640", accent: "#de6b5a", deep: "#c8a24a", ink: "#fff8ea", muted: "#dcc3e0" },
    greeting: "Wishing you a birthday as wonderful as you are.",
  },
  {
    slug: "anniversary-wish",
    name: "Anniversary Wishes",
    tag: "Another year, together",
    motif: "botanical",
    particle: "petals",
    photo: "anniversary-wish.jpg",
    lottie: "heart",
    palette: { bg: "#2b1a1f", surface: "#3a2229", accent: "#c69a55", deep: "#8f294e", ink: "#fdf6ea", muted: "#e0c3ca" },
    greeting: "Happy anniversary — here's to many more years written together.",
  },
  {
    slug: "thank-you",
    name: "Thank You",
    tag: "Said properly, for once",
    motif: "rings",
    particle: "none",
    photo: "thank-you.jpg",
    lottie: "twinkle",
    palette: { bg: "#12201f", surface: "#182a29", accent: "#c9a24a", deep: "#0e5c63", ink: "#fdf6ea", muted: "#bcd0cf" },
    greeting: "Just a note to say — thank you. It meant more than I've said.",
  },
  {
    slug: "get-well",
    name: "Get Well Soon",
    tag: "A little light while you rest",
    motif: "botanical",
    particle: "petals",
    photo: "get-well.jpg",
    lottie: "flowerBloom",
    palette: { bg: "#12241f", surface: "#182f28", accent: "#8faa7a", deep: "#3f7d53", ink: "#fdf6ea", muted: "#c3d3c0" },
    greeting: "Sending you strength and sunshine — get well soon, we're all rooting for you.",
  },
  {
    slug: "congratulations",
    name: "Congratulations",
    tag: "You earned every bit of this",
    motif: "firework",
    particle: "confetti",
    photo: "congratulations.jpg",
    lottie: "trophy",
    palette: { bg: "#101b30", surface: "#16223e", accent: "#e8b84b", deep: "#0e5c63", ink: "#fdf6ea", muted: "#bcc6d6" },
    greeting: "Congratulations! So proud of what you've built and where it's taking you.",
  },
  {
    slug: "farewell",
    name: "Farewell",
    tag: "Not goodbye, just see-you-later",
    motif: "waves",
    particle: "petals",
    photo: "farewell.jpg",
    lottie: "twinkle",
    palette: { bg: "#16232c", surface: "#1e2e38", accent: "#c69a55", deep: "#2b4433", ink: "#fdf6ea", muted: "#c0ccd3" },
    greeting: "Wishing you every good thing ahead — you'll be missed more than you know.",
  },
];

export function getOccasion(slug) {
  return OCCASIONS.find((o) => o.slug === slug) || null;
}
