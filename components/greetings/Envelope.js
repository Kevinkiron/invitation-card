"use client";

import { cardTheme } from "@/lib/greetings/card-themes";
import { getOccasion } from "@/lib/greetings/occasions";

/* ══════════════════════════════════════════════════════════════════════
   ENVELOPE — what the recipient sees first, before the card itself
   (components/GreetingCard.js). Styles: app/greeting-envelope.css.

   A coloured, folded envelope in the same colour as that occasion's card
   panel (lib/greetings/card-themes.js) — crimson for Christmas, deep
   green for Eid, plum for birthdays — with real fold geometry (two side
   flaps and a bottom flap over a patterned liner), the top of the card
   just visible inside, a satin ribbon tied across it, a gold wax seal
   with the occasion's mark pressed into it, a perforated postage stamp,
   and the recipient's name in gold script.

   Tapping the seal plays the whole opening as one sequence, driven by
   the single .gc-envelope-opening class: the ribbon slides apart, the
   seal pops, the flap folds back to show the liner, the card rises a
   little, and the envelope drops away to leave the card behind.

   `opening` is owned by GreetingCard, which needs to know once the
   envelope has been dismissed.
   ══════════════════════════════════════════════════════════════════════ */

/* The mark pressed into the wax, by occasion. */
const MARKS = {
  snowflake: "M16 4v24M5.6 10l20.8 12M5.6 22l20.8-12M12.5 5.5 16 9l3.5-3.5M12.5 26.5 16 23l3.5 3.5M5 14.3l4.6-1.3-1.2-4.7M23.6 23.7l-1.2-4.7 4.6-1.3M5 17.7l4.6 1.3-1.2 4.7M23.6 8.3l-1.2 4.7 4.6 1.3",
  flame: "M16 4c3 4.5 7 8 7 13a7 7 0 0 1-14 0c0-3 1.6-5 3.2-6.6.3 2.4 1.5 3.8 3 4.4C14.5 11 14.6 7.5 16 4ZM9 24.5h14M11 27.5h10",
  crescent: "M20.5 5.5a11 11 0 1 0 6 18.5 9 9 0 1 1-6-18.5ZM23 10l.9 2.4 2.6.1-2 1.6.7 2.5-2.2-1.4-2.2 1.4.7-2.5-2-1.6 2.6-.1Z",
  heart: "M16 27S5 20.5 5 12.6A5.6 5.6 0 0 1 16 10a5.6 5.6 0 0 1 11 2.6C27 20.5 16 27 16 27Z",
  star: "M16 4l3.4 7.6 8.2.8-6.2 5.5 1.8 8.1L16 21.8 8.8 26l1.8-8.1-6.2-5.5 8.2-.8Z",
  flower: "M16 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM16 12.5c-2-5 2-9 2-9s3.5 4.5 0 9M19.4 15c4.6-2.6 8.6.8 8.6.8s-4 3.6-8.6 1.4M18.2 19.2c3 4.5-.4 8.5-.4 8.5s-4-3.6-1.8-8.3M13.8 19.4c-1.6 5-6.6 5.6-6.6 5.6s.2-5.2 5-6.6M12.6 15.3c-5-1.3-5.6-6.3-5.6-6.3s5.2-.3 6.6 4.5",
};
const MARK_FOR = {
  christmas: "snowflake",
  diwali: "flame", onam: "flower", pongal: "flower", "raksha-bandhan": "heart", holi: "flower",
  eid: "crescent",
  "birthday-wish": "star", "new-year": "star", congratulations: "star", farewell: "star",
  "anniversary-wish": "heart", "thank-you": "heart", "get-well": "flower",
};

/* A slightly irregular wax outline: a circle with a few soft bumps, the
   way poured wax spreads. Fixed numbers, so server and browser agree. */
const WAX = (() => {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 46 + 2.6 * Math.sin(a * 7 + 0.6) + 1.6 * Math.sin(a * 13 + 2.1);
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

/* Twinkles scattered over the envelope, positioned in percent. */
const SPARKLES = [
  [12, 30, 0], [84, 38, 1.2], [18, 66, 2.1], [88, 70, .6], [50, 92, 1.7], [30, 12, 2.6],
];

export default function Envelope({ to, from, stamp, occasion, occasionName, palette = {}, opening, onOpen }) {
  const o = getOccasion(occasion);
  const t = cardTheme(occasion, { palette, name: occasionName, lottie: o?.lottie });
  const mark = MARKS[MARK_FOR[occasion] || "star"];

  const style = {
    "--env": t.panel,
    "--env-paper": t.paper,
    "--env-ink": t.ink,
  };

  return (
    <div className={`gc-envelope-stage ${opening ? "gc-envelope-opening" : ""}`} style={style}>
      <div className="gc-envelope" aria-hidden={opening || undefined}>
        {/* the folded body: liner, the card inside, then the three flaps */}
        <div className="gc-env-body">
          <div className="gc-env-liner" />
          <div className="gc-env-sheet">
            <span>{t.kicker ? `${t.kicker} ` : ""}{t.script}</span>
          </div>
          <div className="gc-env-side gc-env-left" />
          <div className="gc-env-side gc-env-right" />
          <div className="gc-env-bottom" />

          {SPARKLES.map(([x, y, d], i) => (
            <svg key={i} className="gc-env-sparkle" viewBox="0 0 20 20" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} aria-hidden="true">
              <path d="M10 0c.8 5.6 3.6 8.6 10 10-6.4 1.4-9.2 4.4-10 10-.8-5.6-3.6-8.6-10-10C6.4 8.6 9.2 5.6 10 0Z" />
            </svg>
          ))}

          <div className="gc-env-address">
            <small>Specially for</small>
            <span className="gc-env-to">{to}</span>
            {from && <small className="gc-env-from">with love, {from}</small>}
          </div>
        </div>

        {/* the top flap: outside face, and the patterned liner on its back */}
        <div className="gc-env-flap">
          <div className="gc-env-flap-out" />
          <div className="gc-env-flap-in" />
        </div>

        {stamp && (
          <div className="gc-env-stamp" aria-hidden="true">
            <div className="gc-env-stamp-paper">
              <div className="gc-env-stamp-face">
                <svg viewBox="0 0 32 32" aria-hidden="true"><path d={mark} /></svg>
                <span>{stamp.label}</span>
                <strong>{stamp.sub}</strong>
              </div>
            </div>
            <svg className="gc-env-postmark" viewBox="0 0 120 40" aria-hidden="true">
              <path d="M0 10q10-6 20 0t20 0 20 0 20 0 20 0 20 0M0 20q10-6 20 0t20 0 20 0 20 0 20 0 20 0M0 30q10-6 20 0t20 0 20 0 20 0 20 0 20 0" />
            </svg>
          </div>
        )}

        <div className="gc-env-ribbon" aria-hidden="true">
          <i className="gc-env-ribbon-l" />
          <i className="gc-env-ribbon-r" />
        </div>

        <button
          type="button"
          className="gc-envelope-seal"
          onClick={onOpen}
          aria-label="Break the seal and open your card"
          tabIndex={opening ? -1 : 0}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <radialGradient id="gc-wax" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#fff3c4" />
                <stop offset="28%" stopColor="#e9c76a" />
                <stop offset="70%" stopColor="#b98a2e" />
                <stop offset="100%" stopColor="#7d5a17" />
              </radialGradient>
            </defs>
            <path d={WAX} fill="url(#gc-wax)" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="#8a6420" strokeOpacity=".55" strokeWidth="2.2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#fff4cf" strokeOpacity=".45" strokeWidth="1" />
            <g transform="translate(28 28) scale(1.375)" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={mark} stroke="#fff6d8" strokeOpacity=".7" strokeWidth="1.6" transform="translate(.5 .6)" />
              <path d={mark} stroke="#7a5516" strokeWidth="1.6" />
            </g>
            <ellipse cx="36" cy="30" rx="14" ry="7" fill="#fff" opacity=".28" transform="rotate(-30 36 30)" />
          </svg>
        </button>
        <p className="gc-env-hint">Tap the seal to open</p>
      </div>
    </div>
  );
}
