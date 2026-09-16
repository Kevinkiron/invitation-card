"use client";

import { Calendar, MapPin } from "lucide-react";
import { C } from "@/lib/theme";
import { shade, formatDate, formatTime } from "@/lib/invite-format";
import Motif from "@/components/motifs";

/* This is the "classic" template variant — the original hero-panel +
   left-border-timeline layout. Other variants (editorial, noir, …) live
   under components/templates/ and are picked by components/TemplateRenderer
   based on cfg.variant, but all share this same prop shape:
   { cfg, events, guestName, compact }. */
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
