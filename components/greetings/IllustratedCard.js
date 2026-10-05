"use client";

import GreetingLottie from "@/components/greetings/GreetingLottie";
import Garland from "@/components/greetings/Garland";
import { cardTheme } from "@/lib/greetings/card-themes";
import { getLottie } from "@/lib/greetings/lottie";
import { getOccasion } from "@/lib/greetings/occasions";
import "@/app/greeting-illustrated.css";

/* ══════════════════════════════════════════════════════════════════════
   ILLUSTRATED CARD — the inside of a greeting card, the face the
   recipient reads once the card flips open (components/GreetingCard.js).

   Built to Kevin's printed-card reference: cream paper, a big script
   headline, a garland across the top, a coloured panel down the right
   with something drifting down it, TO / FROM on dotted lines, and a cast
   of large animated characters standing on the ground in the corner.
   The per-occasion choices (colours, garland, characters) all live in
   lib/greetings/card-themes.js; this component is only the layout.

   `entering` adds .ic-in, which plays the entrance in
   app/greeting-illustrated.css: garland drops in, the seal spins in, the
   headline writes itself left to right, then each character pops up from
   the ground in turn. `delay` holds all of that back until the card has
   finished turning over (about a second), so none of it happens while
   the face is still edge-on.

   The sender's photo, when there is one, goes in the round seal at the
   top left in place of that occasion's emblem animation.
   ══════════════════════════════════════════════════════════════════════ */

const SPECKS = Array.from({ length: 14 }, (_, i) => {
  const dur = 6 + (i % 5);
  return { left: (i * 37) % 100, dur, delay: -((i * 1.3) % dur), dx: ((i % 3) - 1) * 14 };
});

/* Long messages step the body text down so the TO / FROM lines below
   them never get pushed into the characters. */
function messageSize(len) {
  if (len > 340) return "2.75cqw";
  if (len > 230) return "3.15cqw";
  if (len > 140) return "3.6cqw";
  return "4.1cqw";
}

function scriptSize(text) {
  const wraps = text.includes(" ") && text.length >= 10;
  if (wraps) return { size: text.length > 13 ? "12cqw" : "14cqw", wraps };
  if (text.length >= 14) return { size: "9.5cqw", wraps };
  if (text.length >= 11) return { size: "12cqw", wraps };
  if (text.length >= 9) return { size: "15cqw", wraps };
  return { size: "17cqw", wraps };
}

export default function IllustratedCard({
  occasion, occasionName, palette = {}, to, from, message, photoUrl, entering = false, delay = 1,
}) {
  const o = getOccasion(occasion);
  const t = cardTheme(occasion, { palette, name: occasionName, lottie: o?.lottie });
  const script = t.script || occasionName || "With love";
  const { size, wraps } = scriptSize(script);
  const emblem = getLottie(t.emblem);
  const confetti = t.bunting || [t.ink, t.leaf];

  const style = {
    "--ic-paper": t.paper,
    "--ic-ink": t.ink,
    "--ic-panel": t.panel,
    "--ic-leaf": t.leaf,
    "--ic-ground": t.ground || `color-mix(in srgb, ${t.paper} 82%, ${t.panel})`,
    "--ic-script-size": size,
    "--ic-msg-size": messageSize((message || "").length),
    "--ic-delay": `${delay}s`,
  };

  return (
    <div className={`ic ${entering ? "ic-in" : ""}`} style={style}>
      <div className="ic-panel" aria-hidden="true">
        <div className={`ic-specks ic-specks-${t.specks || "snow"}`}>
          {SPECKS.map((s, i) => (
            <i
              key={i}
              style={{
                left: `${s.left}%`,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
                "--dx": `${s.dx}px`,
                ...(t.specks === "confetti" ? { background: confetti[i % confetti.length] } : null),
              }}
            />
          ))}
        </div>
      </div>

      {Object.entries(t.cast || {}).map(([slot, key]) => {
        const anim = getLottie(key);
        if (!anim) return null;
        return (
          <div key={slot} className={`ic-cast ic-slot-${slot}`} style={t.slotStyle?.[slot]} aria-hidden="true">
            <GreetingLottie src={anim.src} />
          </div>
        );
      })}

      <svg className="ic-ground" viewBox="0 0 330 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 60 C60 30 120 40 170 34 C230 26 280 20 330 30 L330 80 L0 80Z" opacity=".55" />
        <path d="M0 72 C70 48 140 58 200 50 C260 44 300 46 330 52 L330 80 L0 80Z" />
      </svg>

      <Garland theme={t} />

      <div className={`ic-emblem ${photoUrl ? "ic-emblem-photo" : ""}`} aria-hidden={photoUrl ? undefined : "true"}>
        {photoUrl ? <img src={photoUrl} alt="" /> : emblem && <GreetingLottie src={emblem.src} />}
      </div>

      <div className="ic-copy">
        {t.kicker && <p className="ic-kicker">{t.kicker}</p>}
        <h2 className={`ic-script ${wraps ? "ic-script-wrap" : ""}`}>{script}</h2>
        <p className="ic-msg">{message || "Wishing you all the good things."}</p>

        <div className="ic-fields">
          <p className="ic-field"><b>TO:</b><span>{to}</span></p>
          <p className="ic-field"><b>FROM:</b><span>{from || " "}</span></p>
        </div>
      </div>
    </div>
  );
}
