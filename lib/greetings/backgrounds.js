/* ══════════════════════════════════════════════════════════════════════
   CARD PAPER COLOURS — the gradient the inside pages of the greeting
   card are printed on (components/greetings/CardBook.js, via
   lib/greetings/card-style.js), picked in the chat on /greetings/create.

   `null` means "the occasion's own paper" (lib/greetings/card-themes.js),
   which is what every card had before.
   A custom pick stores two hex colours the sender chose themselves.

   Stored on the card's tokens as `background: { id, from, to }`.
   backgroundCss() only ever builds a gradient from values that pass the
   hex check, so a hand-edited design_config cannot inject anything into
   the style attribute.
   ══════════════════════════════════════════════════════════════════════ */

export const BACKGROUNDS = [
  { id: "midnight",  name: "Midnight velvet", from: "#140d1c", to: "#3b1d3f" },
  { id: "plum",      name: "Royal plum",      from: "#26091f", to: "#7a1f55" },
  { id: "noel",      name: "Crimson",         from: "#2e0409", to: "#9b1520" },
  { id: "emerald",   name: "Emerald",         from: "#041f19", to: "#0f6b55" },
  { id: "sapphire",  name: "Sapphire",        from: "#08142e", to: "#1f4e8c" },
  { id: "ocean",     name: "Deep ocean",      from: "#0f2027", to: "#2c5364" },
  { id: "saffron",   name: "Saffron sunset",  from: "#f7b733", to: "#e0431a" },
  { id: "rosegold",  name: "Rose gold",       from: "#f7d9cc", to: "#c4776a" },
  { id: "champagne", name: "Champagne",       from: "#f8efdf", to: "#cfac74" },
  { id: "blush",     name: "Peach blush",     from: "#ffe0d2", to: "#ef8f97" },
  { id: "lavender",  name: "Lavender mist",   from: "#ece4f7", to: "#9479c4" },
  { id: "mint",      name: "Mint",            from: "#e3f6ee", to: "#5fae95" },
  { id: "gold",      name: "Gold dust",       from: "#2a1d0b", to: "#b8862f" },
  { id: "coral",     name: "Welcvm coral",    from: "#DE6B5A", to: "#E8912D" },
  { id: "pearl",     name: "Pearl",           from: "#ffffff", to: "#e4ddd0" },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function backgroundCss(bg, fallback = "#1c1420") {
  if (bg && HEX.test(bg.from || "") && HEX.test(bg.to || "")) {
    return `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.10), transparent 60%), linear-gradient(160deg, ${bg.from} 0%, ${bg.to} 100%)`;
  }
  return HEX.test(fallback) ? fallback : "#1c1420";
}

/* Is this background light enough that dark text/status-bar is needed? */
export function backgroundIsLight(bg, fallback) {
  const hex = bg && HEX.test(bg.from || "") && HEX.test(bg.to || "") ? mix(bg.from, bg.to) : fallback;
  if (!HEX.test(hex || "")) return false;
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return l > 0.6;
}

function mix(a, b) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round((((pa >> s) & 255) + ((pb >> s) & 255)) / 2);
  return `#${[16, 8, 0].map((s) => c(s).toString(16).padStart(2, "0")).join("")}`;
}
