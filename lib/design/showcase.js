/* ══════════════════════════════════════════════════════════════════════
   Landing-page showcase data.

   These are the SAME token objects the AI produces, run through the SAME
   renderer that powers /create and the guest page. The hero phone is not
   a video or a screenshot — it is the product designing in front of the
   visitor. That is what makes "no templates" believable in about four
   seconds, and it is the one claim a competitor with a template library
   cannot copy.

   Keep these in step with lib/design/tokens.js: every `fonts` stack here
   must correspond to a real TYPE_SETS entry, and every face must be
   loaded in app/layout.js.
   ══════════════════════════════════════════════════════════════════════ */

const T = {
  script: { display: "'Cormorant Garamond',Georgia,serif", body: "'Jost',sans-serif", script: "'Pinyon Script',cursive" },
  serif:  { display: "'Playfair Display',Georgia,serif",   body: "'DM Sans',sans-serif", script: "'Playfair Display',serif" },
  sans:   { display: "'Space Grotesk',sans-serif",         body: "'DM Sans',sans-serif", script: "'Space Grotesk',sans-serif" },
  poster: { display: "'Bebas Neue',Impact,sans-serif",     body: "'Space Grotesk',sans-serif", script: "'Bebas Neue',sans-serif" },
};

/* A stand-in for the customer's photograph. The hero frame is one of the
   nicest things the renderer does and we want it on screen — but a camera
   placeholder icon in a marketing hero reads as a broken image. So the
   showcase supplies a soft abstract wash in the invitation's own palette:
   it fills the arch, it is unmistakably not a real couple, and it costs
   no network request. */
const photo = (a, b, c) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
         </linearGradient>
         <filter id="s"><feGaussianBlur stdDeviation="34"/></filter>
       </defs>
       <rect width="300" height="400" fill="url(#g)"/>
       <g filter="url(#s)" opacity=".55">
         <circle cx="96" cy="300" r="86" fill="${c}"/>
         <circle cx="214" cy="330" r="70" fill="${b}"/>
         <circle cx="150" cy="118" r="62" fill="${a}"/>
       </g>
       <g opacity=".35"><circle cx="150" cy="118" r="62" fill="none" stroke="${c}" stroke-width="1.5"/></g>
     </svg>`
  );

/* Each entry is one turn of the hero carousel. */
export const SHOWCASE = [
  {
    key: "wedding",
    label: "A wedding",
    design: {
      palette: { bg: "#fdf9f1", surface: "#f7efe0", ink: "#334034", muted: "#7d8a7c", accent: "#b8912f", accentSoft: "#e2d4ac", deep: "#2b4433", onDeep: "#fdf9f1" },
      fonts: T.script, frame: "arch", motif: "botanical", density: 0.85, reveal: "none", corner: "soft",
      displayWeight: 600, h1Scale: 9, h1Max: 44, ornament: "&#10047;",
    },
    content: {
      epigraph: { text: "“Two hearts, one journey.”" },
      heroPhoto: photo("#f7efe0", "#e2d4ac", "#b8912f"),
      kicker: "Together with their families",
      headline: "Aarav", headlineB: "Diya", joiner: "with", headlineScript: true,
      subhead: "6th February 2027 · 5:00 PM", place: "St Andrew's, Kochi",
      sections: [{
        type: "cards", invert: true, eyebrow: "The day", title: "Order of the Day",
        items: [
          { icon: "church", heading: "Ceremony", meta: "5:00 PM", body: "St Andrew's Church" },
          { icon: "home", heading: "Reception", meta: "After", body: "Parish Hall" },
        ],
      }],
    },
  },
  {
    key: "concert",
    label: "A concert",
    design: {
      palette: { bg: "#120a1f", surface: "#1e1033", ink: "#e6dcf5", muted: "#9b8bb8", accent: "#ff2e88", accentSoft: "#4a1f52", deep: "#ffd93d", onDeep: "#120a1f" },
      fonts: T.poster, frame: "none", motif: "waves", density: 1, reveal: "none", corner: "sharp",
      displayWeight: 400, displayCase: "uppercase", h1Scale: 16, h1Max: 64, ornament: "&#9650;",
    },
    content: {
      kicker: "One night only",
      headline: "Neon Monsoon",
      subhead: "5 December · Doors 7 PM", place: "Fort Kochi",
      sections: [{
        type: "cards", eyebrow: "The bill", title: "Line-up",
        items: [
          { icon: "mic", heading: "Parvaaz", meta: "21:45" },
          { icon: "mic", heading: "Chai Met Toast", meta: "20:30" },
        ],
      }],
    },
  },
  {
    key: "conference",
    label: "A conference",
    design: {
      palette: { bg: "#0e1116", surface: "#171c24", ink: "#c9d2de", muted: "#7d8899", accent: "#7ee787", accentSoft: "#2b4636", deep: "#f0f4f8", onDeep: "#0e1116" },
      fonts: T.sans, frame: "none", motif: "grid", density: 0.55, reveal: "none", corner: "sharp",
      displayWeight: 700, displayCase: "uppercase", h1Scale: 10, h1Max: 46, ornament: "&#9670;",
    },
    content: {
      kicker: "Kochi · 12–13 March",
      headline: "Buildstack",
      subhead: "Two days on shipping AI products", place: "Lulu ICC",
      sections: [{
        type: "detail", invert: true, eyebrow: "Practical", title: "Details",
        rows: [
          { label: "Dates", value: "12–13 Mar" },
          { label: "Seats", value: "400" },
          { label: "Early bird", value: "₹6,500" },
        ],
      }],
    },
  },
  {
    key: "birthday",
    label: "A 60th birthday",
    design: {
      palette: { bg: "#fdf6ee", surface: "#f7e7d5", ink: "#3d2b21", muted: "#8d7461", accent: "#c26b3c", accentSoft: "#eccdb0", deep: "#5c3a24", onDeep: "#fdf6ee" },
      fonts: T.serif, frame: "circle", motif: "rings", density: 0.7, reveal: "none", corner: "soft",
      displayWeight: 700, h1Scale: 9.5, h1Max: 44, ornament: "&#10047;",
    },
    content: {
      epigraph: { text: "“Count your age by friends, not years.”" },
      heroPhoto: photo("#f7e7d5", "#eccdb0", "#c26b3c"),
      kicker: "Please join us for",
      headline: "Sixty Years", headlineB: "Thomas", joiner: "of",
      subhead: "7th February · 12:30 PM", place: "Alleppey",
      sections: [{
        type: "cards", invert: true, eyebrow: "The afternoon", title: "How the Day Runs",
        items: [
          { icon: "glass", heading: "Arrival", meta: "12:30" },
          { icon: "cake", heading: "Lunch", meta: "1:30" },
        ],
      }],
    },
  },
  {
    key: "engagement",
    label: "An engagement",
    design: {
      palette: { bg: "#fffaf8", surface: "#fdeeea", ink: "#4a3438", muted: "#9c7f81", accent: "#c4788a", accentSoft: "#f2cfd4", deep: "#6d3b4a", onDeep: "#fffaf8" },
      fonts: T.script, frame: "circle", motif: "confetti", density: 0.9, reveal: "none", corner: "soft",
      displayWeight: 600, h1Scale: 9, h1Max: 42, ornament: "&#10047;",
    },
    content: {
      epigraph: { text: "“And so the adventure begins.”" },
      heroPhoto: photo("#fdeeea", "#f2cfd4", "#c4788a"),
      kicker: "Two families, one happy yes",
      headline: "Meera", headlineB: "Rohan", joiner: "&", headlineScript: true,
      subhead: "14th November · 6:30 PM", place: "Taj Malabar, Kochi",
      sections: [{
        type: "cards", invert: true, eyebrow: "The evening", title: "How the Night Runs",
        items: [
          { icon: "glass", heading: "Drinks", meta: "6:30" },
          { icon: "ring", heading: "Rings", meta: "7:30" },
        ],
      }],
    },
  },
];

/* The eight entry points on the landing page. Each card wears its own
   event's palette and motif, so the grid demonstrates the range rather
   than describing it. `slug` is passed to /create?event=… so the AI opens
   already knowing what it is designing. */
export const EVENTS = [
  { slug: "wedding",      name: "Wedding",         tag: "Two hearts, one journey",      icon: "church", palette: ["#fdf9f1", "#b8912f", "#2b4433"], motif: "botanical" },
  { slug: "engagement",   name: "Engagement",      tag: "The happy yes",                icon: "ring",   palette: ["#fffaf8", "#c4788a", "#6d3b4a"], motif: "confetti" },
  { slug: "birthday",     name: "Birthday",        tag: "Another year worth marking",   icon: "cake",   palette: ["#fdf6ee", "#c26b3c", "#5c3a24"], motif: "rings" },
  { slug: "housewarming", name: "Housewarming",    tag: "Beginning life in a new home", icon: "home",   palette: ["#f6f7f2", "#7a8b5a", "#33402b"], motif: "botanical" },
  { slug: "naming",       name: "Naming Ceremony", tag: "A name given with love",       icon: "star",   palette: ["#fff9f4", "#d69a5c", "#5e4028"], motif: "rings" },
  { slug: "baptism",      name: "Baptism",         tag: "Blessed beginnings",           icon: "church", palette: ["#f5f8fb", "#6f93b8", "#28405c"], motif: "geometric" },
  { slug: "concert",      name: "Concert",         tag: "One night, full volume",       icon: "mic",    palette: ["#120a1f", "#ff2e88", "#ffd93d"], motif: "waves" },
  { slug: "conference",   name: "Conference",      tag: "Two days, no filler",          icon: "code",   palette: ["#0e1116", "#7ee787", "#f0f4f8"], motif: "grid" },
];

/* Card artwork. Small parametric SVGs tinted from each event's accent —
   the same motif vocabulary the renderer uses, drawn flat for a card. */
export function cardMotif(motif, accent) {
  const g =
    {
      botanical: `<g fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"><path d="M18 182C42 150 70 118 108 92c22-15 44-26 66-32"/>${[0, 1, 2, 3, 4]
        .map((i) => {
          const x = 40 + i * 28.5, y = 158 - i * 22;
          return `<path d="M${x} ${y}c-7-13-6-26 1-35 8 11 8 25-1 35z" fill="${accent}" fill-opacity=".45"/><path d="M${x} ${y}c14-3 25-11 29-22-13-2-25 6-29 22z" fill="${accent}" fill-opacity=".45"/>`;
        })
        .join("")}</g>`,
      confetti: Array.from({ length: 30 }, (_, i) => {
        const x = (i * 47) % 190 + 6, y = (i * 61) % 186 + 8, r = (i * 37) % 360;
        return i % 2
          ? `<rect x="${x}" y="${y}" width="7" height="3.4" rx="1.7" fill="${accent}" opacity=".55" transform="rotate(${r} ${x} ${y})"/>`
          : `<circle cx="${x}" cy="${y}" r="3" fill="${accent}" opacity=".45"/>`;
      }).join(""),
      rings: `<g fill="none" stroke="${accent}">${[88, 66, 44, 24]
        .map((r, i) => `<circle cx="100" cy="100" r="${r}" stroke-width="${1.4 - i * 0.15}" opacity="${0.75 - i * 0.13}" ${i % 2 ? 'stroke-dasharray="3 7"' : ""}/>`)
        .join("")}</g>`,
      waves: `<g fill="none" stroke="${accent}" stroke-linecap="round">${[0, 1, 2, 3, 4, 5, 6]
        .map((i) => `<path d="M-6 ${34 + i * 22}c34-20 62 20 96 0s62-20 116 0" stroke-width="${1.6 - i * 0.13}" opacity="${0.8 - i * 0.09}"/>`)
        .join("")}</g>`,
      grid: `<g stroke="${accent}" stroke-width=".7" opacity=".4">${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="200"/><line x1="0" y1="${i * 20}" x2="200" y2="${i * 20}"/>`).join(
        ""
      )}</g><g fill="${accent}" opacity=".9">${[[40, 60], [120, 40], [160, 120], [60, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join("")}</g>`,
      geometric: `<g fill="none" stroke="${accent}" stroke-width="1.2"><path d="M100 12 L176 56 L176 144 L100 188 L24 144 L24 56 Z"/><path d="M100 40 L152 70 L152 130 L100 160 L48 130 L48 70 Z" opacity=".6"/><circle cx="100" cy="100" r="34" opacity=".5"/></g>`,
    }[motif] || "";
  return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${g}</svg>`);
}

/* Some events use a light or bright `deep` colour — a white icon on the
   concert's yellow chip was invisible. Pick the readable one. */
export function readableOn(hex) {
  const h = String(hex).replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140 ? "#ffffff" : "#1b1216";
}
