import { BACKGROUNDS, backgroundIsLight } from "@/lib/greetings/backgrounds";

/* ══════════════════════════════════════════════════════════════════════
   INVITATION BACKGROUND — the gradient a host can pick for the page of a
   wedding or celebration invitation, in the chat on /create
   (components/BackgroundPicker.js). Stored on the tokens exactly like a
   greeting card's paper: `background: { id, from, to }`, or absent for
   the design's own colours.

   The same presets as the greeting cards (lib/greetings/backgrounds.js).

   WeddingCinema is a dark, candle-lit page with cream and gold type, so
   a light pick is deepened before it is used there — it keeps its hue
   but the names stay readable. CelebrationCinema already has light and
   dark rooms (a dark birthday, a pale naming), so there the text simply
   flips to suit the colour that was picked.

   Only plain hex colours get through, so a hand-edited design_config
   cannot put anything else into a style attribute.
   ══════════════════════════════════════════════════════════════════════ */

export { BACKGROUNDS };

const HEX = /^#[0-9a-f]{6}$/i;

export function validBackground(bg) {
  return Boolean(bg && HEX.test(bg.from || "") && HEX.test(bg.to || ""));
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}
/* a → b by t */
export function mixHex(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
}
function luma(h) {
  const [r, g, b] = rgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/* Wedding: always a deep version of the pick. --wc-bg is the darker
   end; --wc-bg-warm (the alternate scenes) sits partway to the lighter
   end, so the page reads as the chosen gradient scene by scene. */
export function weddingBackgroundVars(bg) {
  if (!validBackground(bg)) return {};
  let a = bg.from, b = bg.to;
  const deepen = (h) => (luma(h) > 0.22 ? mixHex(h, "#000000", Math.min(0.82, (luma(h) - 0.12) / luma(h))) : h);
  a = deepen(a); b = deepen(b);
  const [dark, light] = luma(a) <= luma(b) ? [a, b] : [b, a];
  return {
    "--wc-bg": dark,
    "--wc-bg-warm": mixHex(dark, light, 0.5),
    background: `linear-gradient(180deg, ${a} 0%, ${b} 100%)`,
  };
}

/* Celebration: the page takes the gradient as it is; ink, muted text,
   hairlines and glass panels follow whether it is light or dark. */
export function celebrationBackgroundVars(bg) {
  if (!validBackground(bg)) return {};
  const light = backgroundIsLight(bg);
  return {
    background: `radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,.10), transparent 60%), linear-gradient(180deg, ${bg.from} 0%, ${bg.to} 100%)`,
    "--cc-bg": bg.from,
    ...(light
      ? {
          "--cc-ink": "var(--cc-text)",
          "--cc-muted": "rgba(40, 30, 30, .64)",
          "--cc-line": "rgba(40, 30, 30, .16)",
          "--cc-veil": "rgba(255, 255, 255, .55)",
        }
      : {
          "--cc-ink": "var(--cc-paper)",
          "--cc-muted": "rgba(255, 244, 226, .62)",
          "--cc-line": "rgba(255, 255, 255, .14)",
          "--cc-veil": "rgba(255, 255, 255, .06)",
        }),
  };
}
