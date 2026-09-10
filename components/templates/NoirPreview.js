"use client";

import { Calendar, MapPin } from "lucide-react";
import { C } from "@/lib/theme";
import { formatDate, formatTime } from "@/lib/invite-format";
import Motif from "@/components/motifs";

const CREAM = "#F4ECDD";

/* "Onyx Starlight" variant — dark, cinematic structure. Unlike the classic
   and editorial variants, the whole canvas stays dark (not just a hero
   block), the date is treated as a large marquee stamp rather than plain
   text, and events render as bordered cards with corner brackets instead of
   a timeline. Same prop contract as InvitePreview / EditorialPreview. */
export default function NoirPreview({ cfg, events = [], guestName, compact = false }) {
  const p = cfg?.palette || ["#0E0B14", "#D8A13A", "#0B0910"];
  const [, accent, bgFallback] = p;
  const bg = p[2] || bgFallback || "#0B0910";
  const serif = cfg?.font !== "sans";
  const fam = serif ? "'Marcellus', serif" : "'Manrope', sans-serif";
  const motif = cfg?.motif || "stars";
  const pad = compact ? 34 : 48;

  const first = events[0];
  let day = "—", monYr = "TBA";
  if (first?.event_date) {
    try {
      const d = new Date(first.event_date);
      day = d.toLocaleDateString("en-IN", { day: "numeric" });
      monYr = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase();
    } catch { /* keep fallback */ }
  }

  return (
    <div style={{ background: bg, fontFamily: "'Manrope', sans-serif", color: CREAM, position: "relative", overflow: "hidden" }}>
      {/* scattered stars */}
      <Motif kind="stars" color={accent} size={26} style={{ position: "absolute", top: 18, left: 20, opacity: 0.55 }} />
      <Motif kind="stars" color={accent} size={18} style={{ position: "absolute", top: 70, right: 26, opacity: 0.4 }} />
      <Motif kind="stars" color={accent} size={16} style={{ position: "absolute", bottom: 30, left: 34, opacity: 0.35 }} />

      {/* radial glow */}
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: -140, left: "50%", transform: "translateX(-50%)", background: `radial-gradient(circle, ${accent}22, transparent 70%)`, pointerEvents: "none" }} />

      {/* ── Header ── */}
      <div style={{ position: "relative", padding: `${pad}px 26px ${pad - 10}px`, textAlign: "center" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".32em", textTransform: "uppercase", color: accent, opacity: 0.9, marginBottom: 16, fontWeight: 700 }}>
          {guestName ? `Dear ${guestName}` : "Together, under the stars"}
        </div>

        <div
          className="display"
          style={{
            fontFamily: fam, fontSize: compact ? 30 : 36, lineHeight: 1.14, color: CREAM,
            textShadow: `0 0 26px ${accent}55`,
          }}
        >
          {cfg?.headline || "Your Names"}
        </div>

        <div style={{ fontSize: 12, opacity: 0.68, lineHeight: 1.65, fontStyle: "italic", maxWidth: 270, margin: "14px auto 0" }}>
          {cfg?.subheadline || "request the honour of your presence"}
        </div>

        {/* marquee date stamp */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 14, marginTop: 24,
            borderTop: `1px solid ${accent}77`, borderBottom: `1px solid ${accent}77`,
            padding: "10px 20px",
          }}
        >
          <span className="display" style={{ fontFamily: fam, fontSize: 30, color: accent, lineHeight: 1 }}>{day}</span>
          <span style={{ width: 1, height: 26, background: `${accent}55` }} />
          <span style={{ fontSize: 11, letterSpacing: ".18em", color: CREAM, opacity: 0.85 }}>{monYr}</span>
        </div>
      </div>

      {/* ── Events ── */}
      <div style={{ position: "relative", padding: "6px 22px 32px" }}>
        <div style={{ textAlign: "center", fontSize: 9.5, letterSpacing: ".28em", textTransform: "uppercase", color: accent, opacity: 0.75, fontWeight: 700, marginBottom: 16 }}>
          The Celebrations
        </div>

        {events.length === 0 ? (
          <p style={{ opacity: 0.55, fontSize: 13, textAlign: "center", padding: "10px 0" }}>Your ceremonies will appear here.</p>
        ) : (
          events.map((ev, i) => (
            <div
              key={i}
              style={{
                position: "relative", marginBottom: 12, padding: "16px 18px",
                border: `1px solid ${accent}3d`, background: "rgba(255,255,255,.02)",
              }}
            >
              {/* corner brackets */}
              {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h]) => (
                <span
                  key={`${v}-${h}`}
                  style={{
                    position: "absolute", [v]: -1, [h]: -1, width: 10, height: 10,
                    borderTop: v === "top" ? `2px solid ${accent}` : "none",
                    borderBottom: v === "bottom" ? `2px solid ${accent}` : "none",
                    borderLeft: h === "left" ? `2px solid ${accent}` : "none",
                    borderRight: h === "right" ? `2px solid ${accent}` : "none",
                  }}
                />
              ))}
              <div className="display" style={{ fontFamily: fam, fontSize: 18, color: accent, marginBottom: 8 }}>
                {ev.name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, display: "flex", gap: 7, alignItems: "center", marginBottom: 4 }}>
                <Calendar size={12} style={{ flexShrink: 0, color: accent }} />
                {formatDate(ev.event_date)}{ev.event_time ? ` · ${formatTime(ev.event_time)}` : ""}
              </div>
              {ev.venue && (
                <div style={{ fontSize: 12, opacity: 0.75, display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <MapPin size={12} style={{ flexShrink: 0, marginTop: 2, color: accent }} />
                  <span>{ev.venue}{ev.address ? `, ${ev.address}` : ""}</span>
                </div>
              )}
            </div>
          ))
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
          <Motif kind="stars" color={accent} size={22} style={{ opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
