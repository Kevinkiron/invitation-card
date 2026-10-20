import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { shareFacts } from "@/lib/share";

/* ══════════════════════════════════════════════════════════════════════
   THE PREVIEW PICTURE — the 1200×630 card WhatsApp shows above a shared
   Welcvm link (opengraph-image.js under app/, app/i/[token], app/g/[token]).

   Drawn, not photographed: a cream card with a fine double frame, the
   occasion in small capitals, the names large in Cormorant, the date and
   place beneath, and the Welcvm heart at the foot. When the host gave us
   a photo it sat in a ring on the right (no longer — see inviteCard). Flat colour keeps the PNG small
   — WhatsApp quietly drops previews whose image is too heavy.

   Fonts: Cormorant Garamond and Jost ship with the app (assets/fonts,
   both SIL Open Font License), so the preview never depends on another
   server. Google Fonts is only a fallback, and if both fail the card
   still renders in the built-in sans — a preview in the wrong typeface
   is much better than no preview.
   ══════════════════════════════════════════════════════════════════════ */

export const OG_SIZE = { width: 1200, height: 630 };
/* Invitations and cards: a wide, short banner — the names in script on
   the event's colour, nothing else — like the demo on the homepage. The
   title and venue are printed by WhatsApp itself underneath. */
export const BANNER_SIZE = { width: 1200, height: 360 };

const HEART = "M50 89.5 C46 89.5 6 60.5 6 32.8 C6 15.9 18.1 4 33.1 4 C41.2 4 47.6 8.3 50 13.6 C52.4 8.3 58.8 4 66.9 4 C81.9 4 94 15.9 94 32.8 C94 60.5 54 89.5 50 89.5 Z";
const CORAL = "#DE6B5A";
const INK = "#4A443C";

async function localFont(file) {
  try {
    return await readFile(join(process.cwd(), "assets", "fonts", file));
  } catch {
    return null;
  }
}

async function googleFont(family, weight, text) {
  try {
    const q = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(q, { signal: AbortSignal.timeout(4000) })).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1], { signal: AbortSignal.timeout(4000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/* The host's photo as a data URI, only if it arrives quickly and is not
   huge; otherwise the card is drawn without it. */
async function photoData(src) {
  if (!src || !/^https:\/\//.test(src)) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !/^image\/(jpeg|png|webp)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/* Darken / lighten a #rrggbb toward black or white. */
function mix(hex, to, amt) {
  const m = String(hex || "").match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const t = to === "black" ? 0 : 255;
  const ch = (v) => Math.round(v + (t - v) * amt).toString(16).padStart(2, "0");
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

function lines(inv, mode) {
  if (!inv) {
    return mode === "greeting"
      ? { kind: "greeting", kicker: "A card for you", headline: "Open your card", sub: "", accent: "#8e1212", paper: "#fbf1e6", ink: "#b3232b", photo: null }
      : {
          kind: "invite",
          kicker: mode === "site" ? "Invitations & greeting cards" : "You're invited",
          headline: mode === "site" ? "Welcvm" : "Open your invitation",
          sub: mode === "site" ? "Weddings · Birthdays · Housewarmings · Diwali, Eid & Christmas cards" : "",
          accent: "#7a1f3d", photo: null,
          cta: mode === "site" ? "welcvm.com" : "Tap to open & RSVP",
        };
  }
  const f = shareFacts(inv);
  if (f.kind === "greeting") {
    return {
      kind: "greeting",
      kicker: `A ${f.occasionName} card${f.to ? ` for ${f.to}` : ""}`,
      headline: `${f.wish}${f.to ? `, ${f.to}` : ""}!`,
      sub: f.from ? `With love, from ${f.from}` : "Sent with love",
      accent: f.accent, paper: f.paper, ink: f.ink, photo: f.photo,
    };
  }
  return {
    kind: "invite",
    kicker: f.kind === "wedding" ? "The wedding of" : "You're invited",
    headline: f.kind === "wedding" ? (f.names || f.headline) : f.headline,
    sub: [f.date, f.place].filter(Boolean).join("  ·  "),
    accent: f.kind === "wedding" ? "#7a1f3d" : (f.accent || CORAL),
    photo: f.photo,
    cta: "Tap to open & RSVP",
  };
}

async function loadFonts(text, headline) {
  const [serif, sans, script] = await Promise.all([
    localFont("cormorant-garamond-latin-600-normal.woff").then((f) => f || googleFont("Cormorant Garamond", 600, `${headline}Welcvm`)),
    localFont("jost-latin-500-normal.woff").then((f) => f || googleFont("Jost", 500, text.toUpperCase() + text)),
    localFont("pinyon-script-latin-400-normal.woff").then((f) => f || googleFont("Pinyon Script", 400, headline)),
  ]);
  return {
    serif: Boolean(serif), sans: Boolean(sans), script: Boolean(script),
    list: [
      serif && { name: "Serif", data: serif, weight: 600, style: "normal" },
      sans && { name: "Sans", data: sans, weight: 500, style: "normal" },
      script && { name: "Script", data: script, weight: 400, style: "normal" },
    ].filter(Boolean),
  };
}

const GOLD = "#E6C27A";

/* Invitations: the names in gold script on the event's deep colour, the
   date and place beneath — like the front of a printed card.

   FLAT colours on purpose. The first version used gradients and a photo
   ring, and came out at ~370 KB and four seconds to draw; WhatsApp
   quietly drops a preview picture that heavy or that slow, which is why
   shared links showed only text. Flat fills compress to a fraction. */
function inviteBanner(L, F) {
  const deep = mix(L.accent, "black", 0.62);
  const mid = mix(L.accent, "black", 0.42);
  const n = L.headline.length;
  /* Script runs about 0.45em a character; fit one line in ~1040px. */
  const hSize = Math.round(Math.max(54, Math.min(150, 1040 / (Math.max(n, 1) * 0.45))));
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(90deg, ${deep}, ${mid})`, padding: "0 70px" }}>
      <div style={{ fontFamily: F.script ? "Script" : F.serif ? "Serif" : "serif", fontSize: hSize, lineHeight: 1.3, color: "#E9C98A", display: "flex", textAlign: "center", justifyContent: "center", whiteSpace: "nowrap" }}>{L.headline}</div>
    </div>
  );
}

/* Greeting cards: the same banner, on the card's colour, with its sealed
   envelope beside the wish — so it reads as a card, not an invitation. */
function greetingBanner(L, F) {
  const deep = mix(L.accent, "black", 0.35);
  const n = L.headline.length;
  const hSize = Math.round(Math.max(50, Math.min(120, 780 / (Math.max(n, 1) * 0.45))));
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: `linear-gradient(90deg, ${deep}, ${L.accent})`, padding: "0 70px 0 80px" }}>
      <svg width="220" height="153" viewBox="0 0 340 236" style={{ flexShrink: 0, marginRight: 56 }}>
        <rect x="0" y="0" width="340" height="236" rx="12" fill="#fbf2df" />
        <path d="M0 236 L170 120 L340 236 Z" fill="#efdcb8" />
        <path d="M0 0 L170 140 L340 0 Z" fill="#f4e4c3" />
        <path d="M0 0 L170 140 L340 0" fill="none" stroke="#d9c095" strokeWidth="2" />
        <circle cx="170" cy="140" r="30" fill={L.ink || L.accent} />
        <circle cx="170" cy="140" r="22" fill="none" stroke="#ffffff66" strokeWidth="2" />
        <path transform="translate(155 127) scale(.3)" d={HEART} fill="#ffffff" />
      </svg>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", fontFamily: F.script ? "Script" : F.serif ? "Serif" : "serif", fontSize: hSize, lineHeight: 1.3, color: "#FFF1D2", textAlign: "center", whiteSpace: "nowrap" }}>{L.headline}</div>
    </div>
  );
}

/* The 1200×630 card for welcvm.com itself. */
function siteCard(L, F) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#3a1222", fontFamily: F.sans ? "Sans" : "sans-serif" }}>
      <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>{L.kicker}</div>
      <div style={{ fontFamily: F.script ? "Script" : "serif", fontSize: 150, lineHeight: 1.3, color: "#E9C98A", display: "flex" }}>{L.headline}</div>
      <div style={{ fontSize: 30, color: "#F6EBD8", display: "flex", marginTop: 10 }}>{L.sub}</div>
    </div>
  );
}

export async function shareImage(inv, mode = "invite") {
  const L = lines(inv, mode);
  const text = `${L.kicker}${L.headline}${L.sub}${L.cta || ""}Welcvm`;
  const F = await loadFonts(text, L.headline);
  const site = mode === "site";
  return new ImageResponse(
    site ? siteCard(L, F) : L.kind === "greeting" ? greetingBanner(L, F) : inviteBanner(L, F),
    { ...(site ? OG_SIZE : BANNER_SIZE), fonts: F.list.length ? F.list : undefined },
  );
}
