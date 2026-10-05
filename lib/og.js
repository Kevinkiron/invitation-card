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
   a photo it sits in a ring on the right. Flat colour keeps the PNG small
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

function lines(inv, mode) {
  if (!inv) {
    return {
      kicker: mode === "greeting" ? "A card for you" : mode === "invite" ? "You're invited" : "Digital invitations",
      headline: mode === "site" ? "Invitations made with love" : mode === "greeting" ? "Open your card" : "Open your invitation",
      sub: mode === "site" ? "Weddings · Birthdays · Housewarmings · Greeting cards" : "",
      accent: CORAL, paper: "#FBF6EE", photo: null,
      cta: mode === "site" ? "welcvm.com" : "Tap to open",
    };
  }
  const f = shareFacts(inv);
  if (f.kind === "greeting") {
    return {
      kicker: `A ${f.occasionName} card${f.to ? ` for ${f.to}` : ""}`,
      headline: f.wish,
      sub: f.from ? `With love, from ${f.from}` : "Sent with love",
      accent: f.accent, paper: f.paper, photo: f.photo,
      cta: "Tap to open the envelope",
    };
  }
  const label = f.kind === "wedding" ? "The wedding of" : "You're invited";
  return {
    kicker: label,
    headline: f.kind === "wedding" ? (f.names || f.headline) : f.headline,
    sub: [f.date, f.place].filter(Boolean).join("  ·  "),
    accent: f.accent || CORAL, paper: "#FBF6EE", photo: f.photo,
    cta: "Tap to open & RSVP",
  };
}

export async function shareImage(inv, mode = "invite") {
  const L = lines(inv, mode);
  const photo = await photoData(L.photo);
  const text = `${L.kicker}${L.headline}${L.sub}${L.cta}Welcvm`;

  const [serif, sans] = await Promise.all([
    localFont("cormorant-garamond-latin-600-normal.woff").then((f) => f || googleFont("Cormorant Garamond", 600, `${L.headline}Welcvm`)),
    localFont("jost-latin-500-normal.woff").then((f) => f || googleFont("Jost", 500, text.toUpperCase() + text)),
  ]);
  const fonts = [
    serif && { name: "Serif", data: serif, weight: 600, style: "normal" },
    sans && { name: "Sans", data: sans, weight: 500, style: "normal" },
  ].filter(Boolean);

  const n = L.headline.length;
  const max = photo ? 640 : 960;
  const hSize = n <= 14 ? (photo ? 92 : 112) : n <= 22 ? (photo ? 76 : 92) : n <= 32 ? (photo ? 60 : 74) : (photo ? 50 : 60);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: L.paper, padding: 28, fontFamily: sans ? "Sans" : "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", border: `2px solid ${L.accent}`, borderRadius: 26, padding: 10 }}>
          <div style={{ flex: 1, display: "flex", border: `1px solid ${L.accent}66`, borderRadius: 18, padding: "44px 64px", alignItems: "center", justifyContent: photo ? "space-between" : "center", position: "relative" }}>

            <div style={{ display: "flex", flexDirection: "column", alignItems: photo ? "flex-start" : "center", textAlign: photo ? "left" : "center", width: max }}>
              <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: L.accent, marginBottom: 18 }}>{L.kicker}</div>
              <div style={{ fontFamily: serif ? "Serif" : "serif", fontSize: hSize, lineHeight: 1.04, color: INK, display: "flex", flexWrap: "wrap", justifyContent: photo ? "flex-start" : "center" }}>{L.headline}</div>
              <div style={{ display: "flex", alignItems: "center", margin: "26px 0 22px" }}>
                <div style={{ width: 70, height: 2, background: `${L.accent}88` }} />
                <svg width="26" height="24" viewBox="0 0 100 92" style={{ margin: "0 14px" }}><path d={HEART} fill={CORAL} /></svg>
                <div style={{ width: 70, height: 2, background: `${L.accent}88` }} />
              </div>
              {L.sub ? <div style={{ fontSize: 30, color: "#6b6258", display: "flex" }}>{L.sub}</div> : null}
            </div>

            {photo ? (
              <div style={{ display: "flex", width: 330, height: 330, borderRadius: 999, border: `6px solid ${L.accent}`, padding: 8, background: "#fff" }}>
                <img src={photo} width={302} height={302} style={{ borderRadius: 999, objectFit: "cover" }} />
              </div>
            ) : null}

            <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 22, color: "#8a8076" }}>
              <svg width="22" height="20" viewBox="0 0 100 92" style={{ marginRight: 8 }}><path d={HEART} fill={CORAL} /></svg>
              <span style={{ fontFamily: serif ? "Serif" : "serif", fontSize: 28, color: INK, marginRight: 14 }}>Welcvm</span>
              <span>{L.cta}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
