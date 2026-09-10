"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* Shared, genuinely-working invitation building blocks. Templates compose
   these but style them through their own tokens, so two templates using
   <Countdown> still look nothing alike. */

/* ── Scroll reveal ──────────────────────────────────────────
   Observes within the phone viewport (or the page in full modes). */
export function Reveal({ children, delay = 0, as: Tag = "div", style, className = "", ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    // root:null works for both the page and the phone viewport because the
    // viewport is a scroll container inside the page — a partially visible
    // element still intersects the page rect.
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={ref}
      className={`inv-reveal ${seen ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ── Live countdown ───────────────────────────────────────── */
function diff(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({ date, cellStyle, numStyle, labelStyle }) {
  // Start null so server and first client render agree; fill in after mount.
  const [t, setT] = useState(null);

  useEffect(() => {
    if (!date) return;
    setT(diff(date));
    const id = setInterval(() => setT(diff(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  const cells = [
    ["Days", t?.days], ["Hours", t?.hours],
    ["Minutes", t?.minutes], ["Seconds", t?.seconds],
  ];

  return (
    <div className="inv-count" role="timer" aria-label="Time until the wedding">
      {cells.map(([label, value]) => (
        <div key={label} className="inv-count-cell" style={cellStyle}>
          <div className="inv-count-num" style={numStyle}>
            {value == null ? "––" : String(value).padStart(2, "0")}
          </div>
          <div className="inv-count-lbl" style={labelStyle}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Gallery with working in-viewport lightbox ────────────── */
export function Gallery({ items = [], accent = "#fff", radius = 2, columns = 2 }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;

  return (
    <>
      <div className="inv-gal" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((g, i) => (
          <figure
            key={g.id ?? i}
            onClick={() => setOpen(i)}
            style={{ borderRadius: radius, gridRow: g.tall ? "span 2" : undefined }}
            tabIndex={0}
            role="button"
            aria-label={`Open photo: ${g.caption}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(i); } }}
          >
            <div
              className="inv-art"
              data-art={g.art}
              style={{ width: "100%", height: g.tall ? 188 : 90, borderRadius: radius }}
            />
            <figcaption>{g.caption}</figcaption>
          </figure>
        ))}
      </div>

      {open !== null && (
        <div className="inv-lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div style={{ width: "100%", maxWidth: 300 }} onClick={(e) => e.stopPropagation()}>
            <div className="inv-art" data-art={items[open].art} style={{ width: "100%", height: 300, borderRadius: 3 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, color: "#fff" }}>
              <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>{items[open].caption}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{open + 1} / {items.length}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                className="inv-btn"
                style={{ flex: 1, background: "rgba(255,255,255,.14)", color: "#fff" }}
                onClick={() => setOpen((o) => (o - 1 + items.length) % items.length)}
              >
                Prev
              </button>
              <button
                className="inv-btn"
                style={{ flex: 1, background: accent, color: "#1a1a1a" }}
                onClick={() => setOpen((o) => (o + 1) % items.length)}
              >
                Next
              </button>
            </div>
            <button
              onClick={() => setOpen(null)}
              className="inv-btn"
              style={{ width: "100%", marginTop: 8, background: "transparent", color: "rgba(255,255,255,.75)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Working RSVP card ────────────────────────────────────── */
export function RSVPCard({ accent = "#C8A24A", onDark = false, question = "Will you celebrate with us?", deadline, events = [] }) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(null);
  const [seats, setSeats] = useState(2);
  const [meal, setMeal] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const border = onDark ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.18)";
  const fieldBg = onDark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.6)";

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "26px 18px", border: `1px solid ${border}`, borderRadius: 4 }}>
        <div style={{ fontSize: 24, color: accent, marginBottom: 10 }}>❖</div>
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>
          {attending ? "We can't wait to see you" : "We'll miss you"}
        </h3>
        <p style={{ fontSize: 12, opacity: 0.72, lineHeight: 1.6 }}>
          {attending
            ? `Thank you, ${name || "friend"}. We've noted ${seats} ${seats === 1 ? "seat" : "seats"}.`
            : `Thank you for letting us know, ${name || "friend"}.`}
        </p>
        <button
          onClick={() => setSent(false)}
          className="inv-btn"
          style={{ marginTop: 14, background: "transparent", color: accent, border: `1px solid ${border}` }}
        >
          Change response
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      style={{ border: `1px solid ${border}`, borderRadius: 4, padding: 16, background: onDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.4)" }}
    >
      <p style={{ fontSize: 13, textAlign: "center", marginBottom: 14, lineHeight: 1.5 }}>{question}</p>

      <div className="inv-field">
        <label htmlFor="rsvp-name">Your name</label>
        <input
          id="rsvp-name" required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Full name" style={{ borderColor: border, background: fieldBg }}
        />
      </div>

      <div style={{ display: "flex", gap: 7, marginBottom: 11 }}>
        {[["Joyfully accept", true], ["Regretfully decline", false]].map(([lbl, val]) => (
          <button
            key={lbl} type="button" onClick={() => setAttending(val)}
            style={{
              flex: 1, padding: "10px 6px", fontSize: 9.5, fontWeight: 700, cursor: "pointer",
              letterSpacing: ".1em", textTransform: "uppercase", borderRadius: 3,
              fontFamily: "inherit",
              border: `1px solid ${attending === val ? accent : border}`,
              background: attending === val ? accent : "transparent",
              color: attending === val ? (onDark ? "#14100f" : "#fff") : "inherit",
              transition: "all .3s",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {attending && (
        <div className="inv-fadeIn">
          <div className="inv-field">
            <label htmlFor="rsvp-seats">Guests attending</label>
            <select id="rsvp-seats" value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ borderColor: border, background: fieldBg }}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {events.length > 0 && (
            <div className="inv-field">
              <label htmlFor="rsvp-meal">Meal preference</label>
              <select id="rsvp-meal" value={meal} onChange={(e) => setMeal(e.target.value)} style={{ borderColor: border, background: fieldBg }}>
                <option value="">No preference</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Seafood</option>
                <option>No restrictions</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="inv-field">
        <label htmlFor="rsvp-note">A note for the couple</label>
        <textarea id="rsvp-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" style={{ borderColor: border, background: fieldBg, resize: "none" }} />
      </div>

      <button
        type="submit" disabled={attending === null || !name}
        className="inv-btn"
        style={{
          width: "100%", background: accent, color: onDark ? "#14100f" : "#fff",
          opacity: attending === null || !name ? 0.45 : 1,
          cursor: attending === null || !name ? "not-allowed" : "pointer",
        }}
      >
        Send response
      </button>

      {deadline && (
        <p style={{ fontSize: 9.5, textAlign: "center", marginTop: 10, opacity: 0.6, letterSpacing: ".08em" }}>
          Kindly reply by {new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
    </form>
  );
}

/* ── Sticky in-invitation nav (stays inside the phone) ────── */
export function InvNav({ sections = [], background, color, accent }) {
  const [active, setActive] = useState(sections[0]?.id);

  const go = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    // scrollIntoView targets the nearest scrollable ancestor, which is the
    // phone viewport in gallery/preview mode — so the page never jumps.
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="inv-nav" style={{ background, color }}>
      {sections.map((s) => (
        <button
          key={s.id}
          className={active === s.id ? "is-active" : ""}
          style={active === s.id ? { background: `${accent}2e` } : undefined}
          onClick={() => go(s.id)}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

/* ── Ambient particle layers ──────────────────────────────── */
export function Petals({ count = 12, colors = ["#E8B4C0", "#F3D9C6"], duration = 13 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: (i * 97) % 100,
        size: 6 + ((i * 13) % 7),
        delay: (i * 1.37) % duration,
        dur: duration + ((i * 3) % 7),
        drift: ((i % 5) - 2) * 26,
        color: colors[i % colors.length],
        round: i % 2 === 0,
      })),
    [count, duration, colors]
  );
  return (
    <div className="inv-particles" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="inv-particle petal"
          style={{
            left: `${b.left}%`, width: b.size, height: b.size * 0.66,
            background: b.color,
            borderRadius: b.round ? "60% 20% 60% 20%" : "50% 50% 50% 0",
            animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s`,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export function GoldDust({ count = 16, color = "#D9B65F", duration = 11 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: (i * 61) % 100,
        size: 1.5 + ((i * 7) % 4) * 0.7,
        delay: (i * 0.91) % duration,
        dur: duration + ((i * 5) % 9),
        drift: ((i % 7) - 3) * 16,
      })),
    [count, duration]
  );
  return (
    <div className="inv-particles" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="inv-particle gold"
          style={{
            left: `${b.left}%`, width: b.size, height: b.size, background: color,
            boxShadow: `0 0 ${b.size * 3}px ${color}`,
            animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s`,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Event/venue helpers ──────────────────────────────────── */
export function formatLong(d) {
  if (!d) return "Date to be announced";
  try {
    return new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return String(d); }
}

export function formatDayMonth(d) {
  if (!d) return { day: "--", month: "TBA", year: "" };
  try {
    const dt = new Date(d);
    return {
      day: dt.toLocaleDateString("en-GB", { day: "2-digit" }),
      month: dt.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
      year: dt.toLocaleDateString("en-GB", { year: "numeric" }),
      weekday: dt.toLocaleDateString("en-GB", { weekday: "long" }),
    };
  } catch { return { day: "--", month: "TBA", year: "" }; }
}

export function formatClock(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":");
  const hh = parseInt(h, 10);
  if (Number.isNaN(hh)) return String(t);
  const ap = hh >= 12 ? "pm" : "am";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}.${m ?? "00"} ${ap}`;
}

export function MapLink({ query, accent, children }) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "")}`}
      target="_blank" rel="noopener noreferrer"
      className="inv-btn"
      style={{ background: "transparent", color: accent, border: `1px solid ${accent}`, textDecoration: "none" }}
    >
      {children || "Get directions"}
    </a>
  );
}

/* Music toggle — real state, no audio file needed for a preview. */
export function MusicToggle({ accent, title, onDark }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
        background: onDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.05)",
        border: `1px solid ${accent}55`, borderRadius: 999, padding: "7px 14px",
        color: "inherit", fontFamily: "inherit", fontSize: 9.5,
        letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700,
      }}
    >
      <span style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 11 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 2, background: accent, borderRadius: 1,
              height: on ? [5, 11, 7, 9][i] : 3,
              transition: "height .3s",
              animation: on ? `invFloat ${0.6 + i * 0.15}s ease-in-out infinite` : "none",
            }}
          />
        ))}
      </span>
      {on ? "Pause" : title || "Play music"}
    </button>
  );
}
