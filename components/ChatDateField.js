"use client";

/* ══════════════════════════════════════════════════════════════════════
   A calendar (and, where the question calls for it, a time) rendered
   inline in the chat, instead of asking the host to type a date out by
   hand. It never replaces the ordinary text box below it — this sits
   above it as a shortcut. Typing is still there for someone who would
   rather just type "6 Feb" and move on, and "skip" still works exactly
   as it always did, because both still travel through the same
   send(text) call this component itself uses to answer.

   Deliberately built with no calendar library: this is one small month
   grid, not a scheduling app, and the app avoids new dependencies where
   a hundred lines of plain React does the same job with nothing to
   install on a device this session cannot always reach.
   ══════════════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { C } from "@/lib/theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

/* Props:
   withTime  — also show a time control (the wedding date question and a
               celebration's own event date both ask for a start time in
               the same breath; an RSVP deadline does not).
   onConfirm — (text) => void. Called with a string in exactly the shape
               the interview already parses ("6 February 2027, 18:30" or
               "6 February 2027"), so nothing downstream needs to change
               to understand a tapped date versus a typed one. */
export default function ChatDateField({ withTime = false, onConfirm }) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(withTime ? "18:30" : "");

  const first = new Date(viewYear, viewMonth, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function goMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function pick(day) {
    if (!day) return;
    const d = new Date(viewYear, viewMonth, day);
    if (d < today) return; // an invitation's own date is never in the past
    setSelected(d);
  }

  function confirm() {
    if (!selected) return;
    const label = `${selected.getDate()} ${MONTH_NAMES[selected.getMonth()]} ${selected.getFullYear()}`;
    onConfirm(withTime && time ? `${label}, ${time}` : label);
  }

  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, background: "#fff", padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button type="button" onClick={() => goMonth(-1)} aria-label="Previous month" style={navBtnStyle}>
          <ChevronLeft size={15} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13, color: C.ink }}>
          <CalendarIcon size={13} color={C.gold} /> {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button type="button" onClick={() => goMonth(1)} aria-label="Next month" style={navBtnStyle}>
          <ChevronRight size={15} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: ".06em" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = new Date(viewYear, viewMonth, day);
          const isPast = d < today;
          const isSelected = Boolean(selected) && d.getTime() === selected.getTime();
          return (
            <button
              type="button"
              key={i}
              disabled={isPast}
              onClick={() => pick(day)}
              style={{
                aspectRatio: "1",
                borderRadius: 9,
                border: "none",
                fontSize: 12.5,
                fontWeight: isSelected ? 800 : 600,
                fontFamily: "inherit",
                cursor: isPast ? "default" : "pointer",
                background: isSelected ? C.heart : "transparent",
                color: isPast ? "#d8cfc4" : isSelected ? "#fff" : C.ink,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {withTime && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Clock size={13} color={C.gold} />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              border: `1px solid ${C.line}`, borderRadius: 9, padding: "7px 10px",
              fontSize: 13, fontFamily: "inherit", color: C.ink,
            }}
          />
          <span style={{ fontSize: 11, color: C.muted }}>Start time</span>
        </div>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={!selected}
        style={{
          width: "100%", marginTop: 12, padding: "10px 14px", borderRadius: 10, border: "none",
          background: selected ? C.heart : C.line, color: "#fff", fontWeight: 800, fontSize: 13,
          fontFamily: "inherit", cursor: selected ? "pointer" : "default",
        }}
      >
        Use this date{withTime ? " & time" : ""}
      </button>
    </div>
  );
}

const navBtnStyle = {
  border: "none", background: "transparent", cursor: "pointer", padding: 4, color: C.muted, display: "flex",
};
