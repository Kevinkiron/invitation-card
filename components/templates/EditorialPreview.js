"use client";

import { Calendar, MapPin } from "lucide-react";
import { C } from "@/lib/theme";
import { formatDate, formatDateShort, formatTime } from "@/lib/invite-format";
import Motif from "@/components/motifs";

/* "Ivory Editorial" variant — a genuinely different structure from the
   classic template, not just a recolour: no coloured hero block (everything
   sits on the page background), an asymmetric left-ruled header instead of
   a centred panel, a bordered date stamp, and a horizontal-scrolling row of
   numbered event cards instead of a vertical left-border timeline. Same
   prop contract as InvitePreview so TemplateRenderer can swap it in. */
export default function EditorialPreview({ cfg, events = [], guestName, compact = false }) {
  const p = cfg?.palette || [C.maroon, C.gold, C.ivory];
  const [main, accent, bg] = p;
  const serif = cfg?.font !== "sans";
  const fam = serif ? "'Marcellus', serif" : "'Manrope', sans-serif";
  const motif = cfg?.motif || "line";

  const firstEvent = events[0];
  const pad = compact ? 30 : 44;

  return (
    <div style={{ background: bg, fontFamily: "'Manrope', sans-serif", color: main }}>
      {/* top rule */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* ── Header ── */}
      <div style={{ padding: `${pad}px 24px ${pad - 10}px`, position: "relative" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{ width: 2, alignSelf: "stretch", background: accent, opacity: 0.7, flexShrink: 0, minHeight: compact ? 130 : 160 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9.5, letterSpacing: ".28em", textTransform: "uppercase", opacity: 0.6, marginBottom: 12, fontWeight: 700 }}>
              {guestName ? `Dear ${guestName}` : "The wedding of"}
            </div>
            <div className="display" style={{ fontFamily: fam, fontSize: compact ? 30 : 36, lineHeight: 1.08, letterSpacing: ".005em", wordBreak: "break-word" }}>
              {cfg?.headline || "Your Names"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.72, lineHeight: 1.65, fontStyle: "italic", marginTop: 14, maxWidth: 260 }}>
              {cfg?.subheadline || "request the honour of your presence"}
            </div>

            {/* date stamp */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18,
                border: `1px solid ${accent}66`, borderRadius: 3, padding: "7px 12px",
                fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: accent,
              }}
            >
              {formatDateShort(firstEvent?.event_date)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Events: horizontal scroll, numbered cards ── */}
      <div style={{ padding: "6px 0 30px" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", opacity: 0.55, fontWeight: 700, padding: "0 24px", marginBottom: 14 }}>
          The Celebrations
        </div>

        {events.length === 0 ? (
          <p style={{ opacity: 0.55, fontSize: 13, padding: "10px 24px" }}>Your ceremonies will appear here.</p>
        ) : (
          <div className="editorial-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 24px 8px", scrollSnapType: "x mandatory" }}>
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  scrollSnapAlign: "start", flexShrink: 0, width: compact ? 170 : 190,
                  border: `1px solid ${accent}33`, borderTop: `2px solid ${accent}`, borderRadius: 4,
                  padding: "14px 14px 16px", background: `${accent}0a`,
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 800, color: accent, letterSpacing: ".08em", marginBottom: 8 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="display" style={{ fontFamily: fam, fontSize: 17, marginBottom: 8, lineHeight: 1.2 }}>
                  {ev.name}
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.75, display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <Calendar size={11} style={{ flexShrink: 0, color: accent }} />
                  {formatDate(ev.event_date)}{ev.event_time ? ` · ${formatTime(ev.event_time)}` : ""}
                </div>
                {ev.venue && (
                  <div style={{ fontSize: 11.5, opacity: 0.75, display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <MapPin size={11} style={{ flexShrink: 0, marginTop: 2, color: accent }} />
                    <span>{ev.venue}{ev.address ? `, ${ev.address}` : ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 0 30px", display: "flex", justifyContent: "center" }}>
        <Motif kind={motif} color={accent} size={30} style={{ opacity: 0.6 }} />
      </div>

      <style jsx>{`
        .editorial-scroll { scrollbar-width: none; }
        .editorial-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
