/* ══════════════════════════════════════════════════════════════════════
   ILLUSTRATED CARD THEMES — the inside of every greeting card
   (components/greetings/IllustratedCard.js)

   Kevin's reference was a printed-style Christmas card: cream paper, a
   big script "Merry Christmas!", pine boughs across the top, a red panel
   down one side and a whole illustrated cast (Santa, a tree, a reindeer)
   standing in the corner. This file is that design, per occasion: the
   paper and ink colours, which garland is drawn across the top
   (components/greetings/Garland.js), what drifts down the coloured panel,
   and which animated characters stand in which slot.

   Every character is a free LottieFiles animation from
   lib/greetings/lottie.js (Lottie Simple License), each one rendered and
   checked by eye before it went in here — not a guessed asset URL.

   Slots (positions live in app/greeting-illustrated.css):
     back  — tall, behind everything, standing in the coloured panel
     hang  — hanging from the top of the coloured panel
     hero  — the big one, bottom right, overlapping panel and paper
     side  — small, far right, in front of the hero
     front — small, bottom middle, between the sprig and the hero
   `slotStyle` nudges a slot for one occasion when a particular
   animation's framing needs it.

   An occasion missing from CARD_THEMES still gets the full layout — see
   cardTheme() at the bottom, which builds one from the occasion's own
   palette and its existing single Lottie.
   ══════════════════════════════════════════════════════════════════════ */

export const CARD_THEMES = {
  christmas: {
    kicker: "Merry", script: "Christmas!",
    paper: "#fbf1e6", ink: "#b3232b", panel: "#8e1212", leaf: "#3c5a24", ground: "#ffffff",
    garland: "pine", specks: "snow", emblem: "giftBox",
    cast: { back: "pineTree", hero: "santaGift", side: "reindeer", front: "snowman" },
  },
  diwali: {
    kicker: "Happy", script: "Diwali",
    paper: "#fff5e6", ink: "#b8321a", panel: "#6d1640", leaf: "#7a4a12",
    garland: "marigold", specks: "sparkle", emblem: "rangoli",
    cast: { hang: "hangingLamp", hero: "diyaBoy", front: "diya" },
  },
  onam: {
    kicker: "Happy", script: "Onam",
    paper: "#fbf6e9", ink: "#8a1c1c", panel: "#1f4d2c", leaf: "#7a4a12",
    garland: "marigold", specks: "petals", emblem: "flowerBloom",
    cast: { hang: "hangingLamp", hero: "rangoli", front: "diya" },
    slotStyle: { hero: { right: "4%", bottom: "4%", width: "54%" } },
  },
  pongal: {
    kicker: "Happy", script: "Pongal",
    paper: "#fff6e3", ink: "#a6461a", panel: "#7a4a1f", leaf: "#2e6b2e",
    garland: "marigold", specks: "petals", emblem: "rangoli",
    cast: { hang: "hangingLamp", hero: "flowerBloom", front: "diya" },
  },
  "raksha-bandhan": {
    kicker: "Happy", script: "Raksha Bandhan",
    paper: "#fff6ee", ink: "#a3123a", panel: "#4a1a22", leaf: "#8a5a12",
    garland: "marigold", specks: "petals", emblem: "rangoli",
    cast: { hang: "hangingLamp", hero: "heart" },
  },
  eid: {
    kicker: "", script: "Eid Mubarak",
    paper: "#f8f4e8", ink: "#0f5e4f", panel: "#0d3b35", leaf: "#8a6d2e",
    garland: "bunting", bunting: ["#d4af6a", "#0f5e4f", "#e9d8a6", "#1c4a41"], specks: "sparkle", emblem: "moon",
    cast: { hang: "eidMoonGirl", hero: "ramadanLantern" },
    slotStyle: { hero: { width: "54%", right: "4%" } },
  },
  "birthday-wish": {
    kicker: "Happy", script: "Birthday!",
    paper: "#fff4f7", ink: "#c2185b", panel: "#4a2378", leaf: "#6a3d9a",
    garland: "bunting", bunting: ["#c2185b", "#f6b93b", "#4a2378", "#38ada9"], specks: "confetti", emblem: "balloon",
    cast: { back: "birthdayBalloons", hero: "birthdayCake", front: "giftPurple" },
  },
  "new-year": {
    kicker: "Happy", script: "New Year!",
    paper: "#f6f3ec", ink: "#1f2a5c", panel: "#141d47", leaf: "#a87a1e",
    garland: "bunting", bunting: ["#e8b84b", "#1f2a5c", "#c9a24a", "#3b4a8c"], specks: "sparkle", emblem: "twinkle",
    cast: { back: "fireworks", hero: "cheers", front: "confettiBurst" },
  },
  holi: {
    kicker: "Happy", script: "Holi",
    paper: "#fff7fb", ink: "#c2185b", panel: "#4a1554", leaf: "#2e7d32",
    garland: "bunting", bunting: ["#e91e63", "#ffb300", "#00acc1", "#7cb342", "#8e24aa"], specks: "confetti", emblem: "flowerBloom",
    cast: { back: "confettiBurst", hero: "flowerBloom" },
  },
  "anniversary-wish": {
    kicker: "Happy", script: "Anniversary",
    paper: "#fdf3f1", ink: "#8f294e", panel: "#3a2229", leaf: "#6b7f4a",
    garland: "floral", specks: "petals", emblem: "flowerBloom",
    cast: { back: "twinkle", hero: "heart" },
  },
  "thank-you": {
    kicker: "", script: "Thank You",
    paper: "#f5f7f2", ink: "#0e5c63", panel: "#182a29", leaf: "#5f7f4a",
    garland: "floral", specks: "sparkle", emblem: "twinkle",
    cast: { hero: "flowerBloom", back: "twinkle" },
  },
  "get-well": {
    kicker: "", script: "Get Well Soon",
    paper: "#f4f8f1", ink: "#3f7d53", panel: "#182f28", leaf: "#5f7f4a",
    garland: "floral", specks: "petals", emblem: "heart",
    cast: { hero: "flowerBloom", back: "twinkle" },
  },
  congratulations: {
    kicker: "", script: "Congratulations!",
    paper: "#f4f6fa", ink: "#1d3557", panel: "#16223e", leaf: "#a87a1e",
    garland: "bunting", bunting: ["#e8b84b", "#1d3557", "#0e5c63", "#c9a24a"], specks: "confetti", emblem: "twinkle",
    cast: { back: "fireworks", hero: "trophy", front: "confettiBurst" },
  },
  farewell: {
    kicker: "", script: "Farewell",
    paper: "#f3f5f6", ink: "#2b4433", panel: "#1e2e38", leaf: "#8a6d2e",
    garland: "floral", specks: "petals", emblem: "twinkle",
    cast: { hero: "balloon", back: "twinkle" },
  },
};

/* Any occasion without a hand-tuned theme above still gets the whole
   illustrated layout, built from the colours and single Lottie it
   already has in lib/greetings/occasions.js. */
export function cardTheme(slug, { palette = {}, name = "", lottie = null } = {}) {
  const t = CARD_THEMES[slug];
  if (t) return t;
  return {
    kicker: "", script: name || "With love",
    paper: "#fbf6ee", ink: palette.deep || "#8f294e", panel: palette.bg || "#2b1a1f", leaf: "#6b7f4a",
    garland: "floral", specks: "petals", emblem: lottie || "twinkle",
    cast: lottie ? { hero: lottie } : {},
  };
}
