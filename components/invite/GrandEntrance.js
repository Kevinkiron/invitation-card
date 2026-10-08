"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaithTopper } from "@/components/wedding/FaithArt";
import { Lantern } from "@/components/wedding/ornaments";
import { weddingPhoto, defaultHero } from "@/lib/design/default-photos";
import "@/app/grand-entrance.css";

/* ══════════════════════════════════════════════════════════════════════
   GRAND ENTRANCE — the "tap to open" for wedding and celebration
   invitations (WeddingCinema.js, CelebrationCinema.js).

   The guest arrives in front of a pair of closed doors that fill the
   screen, dressed for the occasion, with the names above a seal on the
   seam. Tapping the seal opens them: the seal lifts away, the doors
   swing back in 3D, warm light floods through the gap, petals or
   confetti burst out, and the view moves forward through the doorway
   into the invitation — the feeling of walking into the event rather
   than closing a pop-up.

   Doors by occasion (`door`):
     temple  Hindu / Jain / Sikh weddings — carved teak with brass studs,
             a marigold toran across the top and two temple bells
     chapel  Christian weddings — ivory doors with gold mouldings and a
             stained-glass rose window across the top
     mosque  Muslim weddings — deep emerald doors with a gold star
             lattice, pointed arch panels and hanging lanterns
     palace  other weddings — midnight-blue palace doors, gold filigree
     gift    birthdays — two halves of wrapped paper, ribbon and a bow
     curtain naming ceremonies — soft velvet curtains scattered with stars
     home    housewarmings — a warm wooden front door with a wreath
   ══════════════════════════════════════════════════════════════════════ */

export function doorFor(kind, faith) {
  if (kind === "wedding") {
    const f = String(faith || "").toLowerCase();
    if (["hindu", "jain", "sikh"].includes(f)) return "temple";
    if (["christian", "catholic"].includes(f)) return "chapel";
    if (f === "muslim") return "mosque";
    return "palace";
  }
  if (kind === "birthday") return "gift";
  if (kind === "naming") return "curtain";
  if (kind === "housewarming") return "home";
  return "palace";
}

const PARTICLE = {
  temple: ["#ffb300", "#f57c00", "#ffd54a", "#d84315"],
  chapel: ["#ffffff", "#f8e1e4", "#f3e6c8", "#e9d5da"],
  mosque: ["#f0d38a", "#ffffff", "#e8c36a", "#bfe3d6"],
  palace: ["#f0d38a", "#fff3cf", "#c9a24a", "#ffffff"],
  gift:   ["#ff5d8f", "#ffd23f", "#3bceac", "#7b5cff", "#ff8c42"],
  curtain:["#fff3b0", "#ffffff", "#cfe3ff", "#ffd6e7"],
  home:   ["#f6c453", "#ffffff", "#e8a33d", "#9cc28b"],
};

/* Fixed numbers (no Math.random) so server and browser render the same. */
const BURST = Array.from({ length: 40 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const d = 34 + ((i * 53) % 46);
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.8 - 6, rot: (i * 71) % 360, delay: (i % 10) * 0.025, s: 0.7 + ((i * 29) % 7) / 10 };
});

function RoseWindow({ side }) {
  /* half of a stained-glass rose window; the two doors' halves meet on
     the seam and part when the doors open */
  const C = 60, lead = "#2a2018";
  const ring = (n, r, rr, cols, off = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + off;
      return <circle key={`${r}-${i}`} cx={C + Math.cos(a) * r} cy={C + Math.sin(a) * r} r={rr} fill={cols[i % cols.length]} stroke={lead} strokeWidth="1.6" />;
    });
  const spokes = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return <line key={i} x1={C + Math.cos(a) * 20} y1={C + Math.sin(a) * 20} x2={C + Math.cos(a) * 54} y2={C + Math.sin(a) * 54} stroke={lead} strokeWidth="1.3" />;
  });
  return (
    <svg className={`ge-rose ge-rose-${side}`} viewBox={side === "l" ? "0 0 60 120" : "60 0 60 120"} aria-hidden="true">
      <defs>
        <radialGradient id="ge-glass" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f6d77c" /><stop offset=".45" stopColor="#3d5fa8" /><stop offset="1" stopColor="#1d2f6b" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="57" fill="#cdb27a" />
      <circle cx={C} cy={C} r="54" fill="url(#ge-glass)" stroke={lead} strokeWidth="2" />
      {spokes}
      {ring(16, 44, 9, ["#9e2235", "#1f4f9c", "#9e2235", "#2d7a55"], Math.PI / 16)}
      {ring(8, 28, 9, ["#d8a63a", "#7a2f8c"], 0)}
      <circle cx={C} cy={C} r="13" fill="#9e2235" stroke={lead} strokeWidth="1.8" />
      <circle cx={C} cy={C} r="5" fill="#f6d77c" stroke={lead} strokeWidth="1.2" />
      <circle cx={C} cy={C} r="56" fill="none" stroke="#b08433" strokeWidth="3" />
      <circle cx={C} cy={C} r="51" fill="none" stroke="#e8cf8f" strokeWidth=".8" opacity=".7" />
    </svg>
  );
}

function Bow({ color = "#ff5d8f", deep = "#c2185b" }) {
  return (
    <svg className="ge-bow" viewBox="0 0 160 110" aria-hidden="true">
      <path d="M80 55 C55 10 10 8 14 40 C17 66 55 66 80 55Z" fill={color} stroke={deep} strokeWidth="2" />
      <path d="M80 55 C105 10 150 8 146 40 C143 66 105 66 80 55Z" fill={color} stroke={deep} strokeWidth="2" />
      <path d="M78 56 L52 104 L66 98 L72 108 L84 60Z" fill={deep} />
      <path d="M82 56 L108 104 L94 98 L88 108 L76 60Z" fill={deep} />
      <path d="M36 36 C46 30 62 40 70 50" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="55" rx="13" ry="11" fill={color} stroke={deep} strokeWidth="2" />
    </svg>
  );
}

function Wreath() {
  const leaves = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return <path key={i} d="M0 0 q7 -6 14 0 q-7 6 -14 0Z" fill={i % 2 ? "#3f6b3a" : "#5b8a4c"} transform={`translate(${(60 + Math.cos(a) * 44).toFixed(1)} ${(60 + Math.sin(a) * 44).toFixed(1)}) rotate(${((a * 180) / Math.PI + 60).toFixed(0)})`} />;
  });
  const berries = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    return <circle key={i} cx={(60 + Math.cos(a) * 46).toFixed(1)} cy={(60 + Math.sin(a) * 46).toFixed(1)} r="3.2" fill="#e8a33d" />;
  });
  return (
    <svg className="ge-wreath" viewBox="0 0 120 120" aria-hidden="true">
      {leaves}{berries}
      <path d="M48 104 q12 -10 24 0 l-6 12 l-6 -7 l-6 7z" fill="#b8342b" />
    </svg>
  );
}

export default function GrandEntrance({
  kind = "wedding", faith = "", kicker = "", title = "", sub = "", mono = "", palette = {}, cue = "Tap to open", onOpen,
  photoSrc = "",
}) {
  const door = doorFor(kind, faith);
  const [phase, setPhase] = useState("idle"); // idle → opening → gone

  const open = useCallback(() => {
    if (phase !== "idle") return;
    onOpen?.();
    const quick = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setPhase("opening");
    setTimeout(() => setPhase("gone"), quick ? 450 : 2700);
  }, [phase, onOpen]);

  /* the page underneath must not scroll while the doors are closed */
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  const style = useMemo(() => ({
    "--ge-accent": palette.accent || "#c69a55",
    "--ge-primary": palette.primary || "#8f294e",
    "--ge-secondary": palette.secondary || "#7b594e",
  }), [palette]);

  if (phase === "gone") return null;
  const colors = PARTICLE[door];
  /* weddings: the couple's hands in a window across both doors */
  /* The arched window across the doors: the couple's hands for a wedding;
     for a housewarming or any other event on panelled doors, the
     invitation's own main photo (or its default, lib/design/default-photos.js).
     The gift wrap and the curtains have no panels and need none. */
  const photo = kind === "wedding"
    ? weddingPhoto(faith)
    : (door === "home" || door === "palace")
      ? { src: photoSrc || defaultHero(kind), pos: "50% 45%" }
      : null;
  const half = photo && (
    <div className="ge-photo" style={{ "--ge-photo-pos": photo.pos }}>
      <img src={photo.src} alt="" draggable="false" />
    </div>
  );

  return (
    <div className={`ge ge-${door} ${photo ? "ge-has-photo" : ""} ${phase === "opening" ? "ge-opening" : ""}`} style={style}>
      <div className="ge-backlight" aria-hidden="true" />
      <div className="ge-stage">
        <div className="ge-door ge-door-l" aria-hidden="true">
          <i className="ge-panel ge-panel-top" /><i className="ge-panel ge-panel-bottom" />
          {door === "chapel" && <RoseWindow side="l" />}
          {half}
          {(door === "temple" || door === "palace" || door === "home") && <i className="ge-handle" />}
          {door === "gift" && <i className="ge-ribbon" />}
        </div>
        <div className="ge-door ge-door-r" aria-hidden="true">
          <i className="ge-panel ge-panel-top" /><i className="ge-panel ge-panel-bottom" />
          {door === "chapel" && <RoseWindow side="r" />}
          {half}
          {(door === "temple" || door === "palace" || door === "home") && <i className="ge-handle" />}
          {door === "gift" && <i className="ge-ribbon" />}
        </div>

        {/* what hangs over the doorway and stays as the doors swing */}
        {door === "temple" && (
          <div className="ge-lintel ge-toran" aria-hidden="true">
            <FaithTopper faith="hindu" gold={palette.accent || "#c69a55"} />
            <i className="ge-bell ge-bell-l" /><i className="ge-bell ge-bell-r" />
          </div>
        )}
        {door === "mosque" && (
          <div className="ge-lintel" aria-hidden="true">
            <span className="ge-lamp ge-lamp-l"><Lantern gold="#e2bd6a" cord={60} /></span>
            <span className="ge-lamp ge-lamp-c"><Lantern gold="#e2bd6a" cord={30} /></span>
            <span className="ge-lamp ge-lamp-r"><Lantern gold="#e2bd6a" cord={80} /></span>
          </div>
        )}

        <div className="ge-copy">
          {kicker && <p className="ge-kicker">{kicker}</p>}
          {title && <h2 className="ge-title">{title}</h2>}
          {sub && <p className="ge-sub">{sub}</p>}
        </div>

        <button type="button" className="ge-seal" onClick={open} aria-label={cue}>
          {door === "gift" ? (
            <Bow color={palette.accent || "#ff5d8f"} deep={palette.primary || "#c2185b"} />
          ) : door === "home" ? (
            <Wreath />
          ) : (
            <span className="ge-medal">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <radialGradient id="ge-wax" cx="38%" cy="32%" r="75%">
                    <stop offset="0" stopColor="#fff3c4" /><stop offset=".3" stopColor="#e9c76a" />
                    <stop offset=".72" stopColor="#b98a2e" /><stop offset="1" stopColor="#7d5a17" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#ge-wax)" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#7a5516" strokeOpacity=".55" strokeWidth="1.4" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#fff4cf" strokeOpacity=".5" strokeWidth=".8" />
                {Array.from({ length: 24 }, (_, i) => (
                  <circle key={i} cx={50 + Math.cos((i / 24) * Math.PI * 2) * 42} cy={50 + Math.sin((i / 24) * Math.PI * 2) * 42} r="1.1" fill="#7a5516" opacity=".5" />
                ))}
              </svg>
              <b>{mono || (door === "curtain" ? "☾" : "✦")}</b>
            </span>
          )}
          <span className="ge-cue">{cue}</span>
        </button>
      </div>

      <div className="ge-burst" aria-hidden="true">
        {BURST.map((p, i) => (
          <i
            key={i}
            className={`ge-bit ${door === "gift" ? "is-confetti" : door === "curtain" || door === "palace" || door === "mosque" ? "is-star" : "is-petal"}`}
            style={{ "--dx": `${p.dx}vmax`, "--dy": `${p.dy}vmax`, "--r": `${p.rot}deg`, "--d": `${p.delay}s`, "--s": p.s, background: colors[i % colors.length] }}
          />
        ))}
      </div>
    </div>
  );
}
