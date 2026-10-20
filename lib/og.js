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
function inviteCard(L, photo, F) {
  const deep = mix(L.accent, "black", 0.58);
  const n = L.headline.length;
  const hSize = n <= 14 ? 150 : n <= 20 ? 124 : n <= 28 ? 100 : n <= 38 ? 80 : 64;
  const font = F.script ? "Script" : F.serif ? "Serif" : "serif";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: deep, padding: 30, fontFamily: F.sans ? "Sans" : "sans-serif" }}>
      <div style={{ flex: 1, display: "flex", border: `2px solid ${GOLD}`, borderRadius: 20, padding: 9 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${GOLD}`, borderRadius: 13, padding: "30px 60px 64px", position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>{L.kicker}</div>
          <div style={{ fontFamily: font, fontSize: hSize, lineHeight: 1.25, color: "#F2D597", display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1000 }}>{L.headline}</div>
          <div style={{ display: "flex", alignItems: "center", margin: "6px 0 20px" }}>
            <div style={{ width: 90, height: 2, background: GOLD }} />
            <svg width="24" height="24" viewBox="0 0 20 20" style={{ margin: "0 16px" }}><path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill={GOLD} /></svg>
            <div style={{ width: 90, height: 2, background: GOLD }} />
          </div>
          {L.sub ? <div style={{ fontSize: 32, color: "#F6EBD8", display: "flex" }}>{L.sub}</div> : null}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 21, color: "#E9D9BC" }}>
            <svg width="22" height="20" viewBox="0 0 100 92" style={{ marginRight: 8 }}><path d={HEART} fill={CORAL} /></svg>
            <span style={{ fontFamily: F.serif ? "Serif" : "serif", fontSize: 28, color: "#FFF4DC", marginRight: 14 }}>Welcvm</span>
            <span>{L.cta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Greeting cards: an envelope, not an invitation — the card's paper,
   its coloured panel, a sealed envelope on the left, the wish on the
   right, in the card's own ink. */
function greetingCard(L, photo, F) {
  const n = L.headline.length;
  const hSize = n <= 16 ? 112 : n <= 26 ? 92 : n <= 36 ? 74 : 60;
  const panel = L.accent;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: L.paper, fontFamily: F.sans ? "Sans" : "sans-serif" }}>
      <div style={{ width: 470, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: panel }}>
        <div style={{ position: "relative", width: 340, height: 236, display: "flex" }}>
          {photo ? (
            <img src={photo} width={300} height={200} style={{ position: "absolute", left: 20, top: -70, borderRadius: 10, objectFit: "cover", border: "6px solid #fff" }} />
          ) : null}
          <svg width="340" height="236" viewBox="0 0 340 236" style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x="0" y="0" width="340" height="236" rx="10" fill="#fbf2df" />
            <path d="M0 236 L170 120 L340 236 Z" fill="#efdcb8" />
            <path d="M0 0 L170 140 L340 0 Z" fill="#f4e4c3" />
            <path d="M0 0 L170 140 L340 0" fill="none" stroke="#d9c095" strokeWidth="2" />
            <circle cx="170" cy="140" r="28" fill={L.ink || panel} />
            <circle cx="170" cy="140" r="21" fill="none" stroke="#ffffff66" strokeWidth="2" />
            <path transform="translate(156 128) scale(.28)" d={HEART} fill="#ffffff" />
          </svg>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", position: "relative" }}>
        <div style={{ fontSize: 23, letterSpacing: 6, textTransform: "uppercase", color: panel, marginBottom: 18 }}>{L.kicker}</div>
        <div style={{ fontFamily: F.script ? "Script" : F.serif ? "Serif" : "serif", fontSize: hSize, lineHeight: 1.2, color: L.ink || INK, display: "flex", flexWrap: "wrap" }}>{L.headline}</div>
        <div style={{ fontSize: 30, color: "#6b6258", marginTop: 24, display: "flex" }}>{L.sub}</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 22, color: "#fff", background: panel, borderRadius: 999, padding: "12px 26px", alignSelf: "flex-start" }}>
          Tap to open the envelope
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 28, display: "flex", alignItems: "center", fontSize: 20, color: "#8a8076" }}>
          <svg width="20" height="18" viewBox="0 0 100 92" style={{ marginRight: 8 }}><path d={HEART} fill={CORAL} /></svg>
          <span style={{ fontFamily: F.serif ? "Serif" : "serif", fontSize: 26, color: INK }}>Welcvm</span>
        </div>
      </div>
    </div>
  );
}

export async function shareImage(inv, mode = "invite") {
  const L = lines(inv, mode);
  /* No photograph: fetching and embedding one made the picture slow and
     heavy enough for WhatsApp to drop it (see inviteCard). */
  const photo = null;
  const text = `${L.kicker}${L.headline}${L.sub}${L.cta || ""}Tap to open the envelopeWelcvm`;
  const F = await loadFonts(text, L.headline);
  return new ImageResponse(
    L.kind === "greeting" ? greetingCard(L, photo, F) : inviteCard(L, photo, F),
    { ...OG_SIZE, fonts: F.list.length ? F.list : undefined },
  );
}
