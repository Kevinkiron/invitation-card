"use client";

import { Calendar, MapPin } from "lucide-react";
import { C } from "@/lib/theme";

/* Decorative SVG motifs — drawn, not imported, so they inherit the palette */
function Motif({ kind = "marigold", color, size = 46, style }) {
  const s = { display: "block", ...style };
  if (kind === "peacock")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
        <path d="M24 44c0-12-9-16-9-24a9 9 0 1118 0c0 8-9 12-9 24z" stroke={color} strokeWidth="1.1" />
        <circle cx="24" cy="17" r="4.4" stroke={color} strokeWidth="1.1" />
        <circle cx="24" cy="17" r="1.6" fill={color} />
        <path d="M13 26c-4 2-7 6-8 11M35 26c4 2 7 6 8 11" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  if (kind === "paisley")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
        <path d="M30 6c8 5 11 15 6 23s-16 11-21 5c-4-5-1-12 5-13s10 4 8 9" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="27" cy="20" r="2.4" stroke={color} strokeWidth="1.1" />
      </svg>
    );
  if (kind === "line")
    return (
      <svg width={size * 2} height={12} viewBox="0 0 96 12" fill="none" style={s}>
        <path d="M0 6h34M62 6h34" stroke={color} strokeWidth="1" />
        <path d="M48 1l4.5 5-4.5 5-4.5-5z" stroke={color} strokeWidth="1" />
      </svg>
    );
  /* default: marigold rosette */
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={s}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="24" cy="13" rx="4.4" ry="8.6"
          stroke={color} strokeWidth="1.05"
          transform={`rotate(${i * 45} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="3.4" stroke={color} strokeWidth="1.05" />
    </svg>
  );
}

export default function InvitePreview({ cfg, events = [], guestName, compact = false }) {
  const p = cfg?.palette || [C.maroon, C.gold, C.ivory];
  const [main, accent, bg] = p;
  const motif = cfg?.motif || "marigold";
  const serif = cfg?.font !== "sans";
  const fam = serif ? "'Marcellus', serif" : "'Manrope', sans-serif";

  const pad = compact ? 40 : 56;

  return (
    <div style={{ background: bg, fontFamily: "'Manrope', sans-serif" }}>
      {/* ── Hero panel ── */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(168deg, ${main} 0%, ${shade(main, -14)} 100%)`,
          color: bg,
          padding: `${pad}px 26px ${pad - 6}px`,
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* glow */}
        <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", top: -120, right: -70, background: `radial-gradient(circle, ${accent}3d, transparent 70%)` }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", bottom: -110, left: -60, background: `radial-gradient(circle, ${accent}2e, transparent 70%)` }} />

        {/* ornamental inner frame */}
        <div style={{ position: "absolute", inset: 14, border: `1px solid ${accent}55`, borderRadius: 6, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 19, border: `1px solid ${accent}22`, borderRadius: 4, pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <Motif kind={motif} color={accent} size={compact ? 34 : 40} style={{ margin: "0 auto 16px" }} />

          <div style={{ fontSize: 9.5, letterSpacing: ".32em", textTransform: "uppercase", opacity: 0.82, marginBottom: 14, fontWeight: 600 }}>
            {guestName ? `Dear ${guestName}` : "Together with our families"}
          </div>

          <div className="display" style={{ fontFamily: fam, fontSize: compact ? 32 : 38, lineHeight: 1.16, letterSpacing: ".01em" }}>
            {cfg?.headline || "Your Names"}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "16px 0" }}>
            <span style={{ height: 1, width: 34, background: accent, opacity: 0.7 }} />
            <span style={{ color: accent, fontSize: 13, fontFamily: fam }}>❖</span>
            <span style={{ height: 1, width: 34, background: accent, opacity: 0.7 }} />
          </div>

          <div style={{ fontSize: 12.5, opacity: 0.86, lineHeight: 1.68, fontStyle: "italic", maxWidth: 280, margin: "0 auto" }}>
            {cfg?.subheadline || "request the honour of your presence"}
          </div>
        </div>
      </div>

      {/* ── Events ── */}
      <div style={{ padding: "28px 26px 34px", background: bg }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: main, opacity: 0.6, fontWeight: 700 }}>
            The Celebrations
          </div>
        </div>

        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              padding: "16px 0 16px 24px",
              borderLeft: `1px solid ${accent}44`,
              marginLeft: 5,
            }}
          >
            <span
              style={{
                position: "absolute", left: -4.5, top: 22,
                width: 9, height: 9, borderRadius: "50%",
                background: bg, border: `1.6px solid ${accent}`,
              }}
            />
            <div className="display" style={{ fontFamily: fam, fontSize: 19, color: main, marginBottom: 6, lineHeight: 1.25 }}>
              {ev.name}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, display: "flex", gap: 7, alignItems: "center", marginBottom: 4 }}>
              <Calendar size={12} style={{ flexShrink: 0, color: accent }} />
              {formatDate(ev.event_date)}
              {ev.event_time ? ` · ${formatTime(ev.event_time)}` : ""}
            </div>
            {ev.venue && (
              <div style={{ fontSize: 12.5, color: C.muted, display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.5 }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: 3, color: accent }} />
                <span>{ev.venue}{ev.address ? `, ${ev.address}` : ""}</span>
              </div>
            )}
          </div>
        ))}

        {!events.length && (
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "18px 0" }}>
            Your ceremonies will appear here.
          </p>
        )}

        <Motif kind={motif} color={accent} size={30} style={{ margin: "26px auto 0", opacity: 0.55 }} />
      </div>
    </div>
  );
}

/* darken / lighten a hex colour */
function shade(hex, amt) {
  try {
    const n = parseInt(String(hex).replace("#", ""), 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt);
    const g = clamp(((n >> 8) & 0xff) + amt);
    const b = clamp((n & 0xff) + amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  } catch {
    return hex;
  }
}

function formatDate(d) {
  if (!d) return "Date to be announced";
  try {
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":");
  const hh = parseInt(h, 10);
  const ap = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${m} ${ap}`;
}
