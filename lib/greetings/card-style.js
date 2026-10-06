import { backgroundIsLight } from "@/lib/greetings/backgrounds";

/* ══════════════════════════════════════════════════════════════════════
   CARD STYLE — the sender's choices for the inside of the card
   (components/greetings/CardBook.js), picked in the chat on
   /greetings/create:

   tokens.background  the colour of the inside pages: a gradient from
                      lib/greetings/backgrounds.js, or null for the
                      occasion's own paper
   tokens.style.ink   the text colour, or null for "automatic" (dark
                      text on light paper, cream and gold on dark)
   tokens.style.font  one of FONTS below

   cardStyleVars() turns those into the CSS custom properties the card
   reads. Only known ids and plain hex colours get through.
   ══════════════════════════════════════════════════════════════════════ */

export const INKS = [
  { id: "espresso", name: "Espresso", hex: "#3b2c26" },
  { id: "burgundy", name: "Burgundy", hex: "#7a1630" },
  { id: "crimson",  name: "Crimson",  hex: "#b3232b" },
  { id: "plum",     name: "Plum",     hex: "#5a1d4f" },
  { id: "forest",   name: "Forest",   hex: "#1f5135" },
  { id: "navy",     name: "Navy",     hex: "#1d2f5c" },
  { id: "gold",     name: "Gold",     hex: "#a87a2a" },
  { id: "ivory",    name: "Ivory",    hex: "#fff6e3" },
];

/* display = headings ("Dear Anna," the page title, the signature);
   body = the verse and the message. Every face here is already loaded
   for the whole site in app/layout.js, except Caveat, which CardBook
   loads only when it is chosen. `scale` evens out faces that run small. */
export const FONTS = [
  { id: "classic",     name: "Classic",     display: "'Cormorant Garamond', Georgia, serif", body: "'Cormorant Garamond', Georgia, serif", style: "italic", weight: 500 },
  { id: "elegant",     name: "Elegant",     display: "'Playfair Display', Georgia, serif",    body: "'Playfair Display', Georgia, serif",    style: "normal", weight: 400, bodyScale: .86 },
  { id: "calligraphy", name: "Calligraphy", display: "'Great Vibes', cursive",                body: "'Cormorant Garamond', Georgia, serif", style: "normal", weight: 400, scale: 1.2 },
  { id: "storybook",   name: "Storybook",   display: "'Alegreya', Georgia, serif",            body: "'Alegreya', Georgia, serif",            style: "italic", weight: 500, bodyScale: .9 },
  { id: "modern",      name: "Modern",      display: "'DM Sans', system-ui, sans-serif",      body: "'DM Sans', system-ui, sans-serif",      style: "normal", weight: 600, scale: .9, bodyScale: .84 },
  { id: "handwritten", name: "Handwritten", display: "'Caveat', cursive",                     body: "'Caveat', cursive",                     style: "normal", weight: 600, scale: 1.12, bodyScale: 1.12 },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function cardStyleVars(tokens, theme) {
  const bg = tokens?.background;
  const custom = bg && HEX.test(bg.from || "") && HEX.test(bg.to || "");
  const dark = custom && !backgroundIsLight(bg);
  const vars = {};

  if (custom) {
    vars["--cb-page-bg"] = `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.14), transparent 60%), linear-gradient(165deg, ${bg.from} 0%, ${bg.to} 100%)`;
    vars["--cb-wash"] = dark ? bg.from : bg.from;
  }

  const ink = INKS.find((i) => i.id === tokens?.style?.ink);
  if (ink) {
    vars["--cb-text"] = ink.hex;
    vars["--cb-ink"] = ink.hex;
  } else if (dark) {
    vars["--cb-text"] = "#fbf1de";
    vars["--cb-ink"] = "#f0d38a";
  }

  const font = FONTS.find((f) => f.id === tokens?.style?.font);
  if (font) {
    vars["--cb-display"] = font.display;
    vars["--cb-body"] = font.body;
    vars["--cb-display-style"] = font.style;
    vars["--cb-display-weight"] = font.weight;
    vars["--cb-fs"] = font.scale || 1;
    vars["--cb-bs"] = font.bodyScale || 1;
  }
  return { vars, dark, font: font?.id || "classic" };
}

/* What the sender wrote for the verse page, if anything: a title and up
   to eight lines. Empty means "use the occasion's own verse". */
export function customVerse(tokens) {
  const v = tokens?.verse;
  const lines = (v?.lines || []).map((l) => String(l).trim()).filter(Boolean).slice(0, 8);
  const title = String(v?.title || "").trim().slice(0, 60);
  if (!lines.length && !title) return null;
  return { title, lines };
}
