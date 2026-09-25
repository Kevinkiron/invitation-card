/* ══════════════════════════════════════════════════════════════════════
   CHRISTMAS SCENE — the card's closed cover, for occasion "christmas".

   Drawn entirely in SVG/CSS rather than photographs, for the same reason
   every other motif in this product is: nothing in this environment can
   fetch an external image, so "Santa's sleigh" and "a shining star" have
   to be code, not stock art. The star glows and turns its rays slowly;
   Santa's sleigh flies the width of the card and off the other side on
   a loop, the way it would past a window. Falling snow is handled
   separately by components/greetings/ParticleField.js (occasion.particle
   is already "snow" for Christmas) — this component only owns the star
   and the sleigh, plus a simple treeline to ground the scene.

   See components/greetings/scenes/index.js for how this is wired to the
   occasion slug, and app/greeting-scenes.css for the animations.
   ══════════════════════════════════════════════════════════════════════ */
export default function ChristmasScene({ accent = "#c9a24a", palette = {} }) {
  const deep = palette.deep || "#7a1f2b";
  const ink = palette.ink || "#fdf6ea";

  return (
    <div className="gc-scene gc-scene-christmas" aria-hidden="true">
      {/* Treeline, grounding the scene at the bottom of the cover */}
      <svg className="gc-scene-trees" viewBox="0 0 300 60" preserveAspectRatio="none">
        <path
          d="M0 60 L18 22 L34 42 L52 6 L72 40 L92 16 L112 44 L138 8 L164 42 L188 18 L212 46 L238 12 L262 42 L284 22 L300 60 Z"
          fill="#04140c"
          opacity=".82"
        />
      </svg>

      {/* The shining star */}
      <div className="gc-scene-star" style={{ color: accent }}>
        <svg viewBox="0 0 40 40" overflow="visible">
          <g className="gc-star-rays" stroke={accent} strokeWidth="1.4" strokeLinecap="round" opacity=".55">
            <line x1="20" y1="1" x2="20" y2="11" />
            <line x1="20" y1="29" x2="20" y2="39" />
            <line x1="1" y1="20" x2="11" y2="20" />
            <line x1="29" y1="20" x2="39" y2="20" />
            <line x1="6.5" y1="6.5" x2="13.5" y2="13.5" />
            <line x1="26.5" y1="26.5" x2="33.5" y2="33.5" />
            <line x1="33.5" y1="6.5" x2="26.5" y2="13.5" />
            <line x1="13.5" y1="26.5" x2="6.5" y2="33.5" />
          </g>
          <path
            d="M20 7 L23.3 16.7 L33.5 16.7 L25.3 22.9 L28.5 33 L20 26.6 L11.5 33 L14.7 22.9 L6.5 16.7 L16.7 16.7 Z"
            fill={accent}
          />
        </svg>
      </div>

      {/* Santa's sleigh, flying across on a loop */}
      <div className="gc-scene-santa">
        <svg viewBox="0 0 120 40">
          <g fill={deep} opacity=".92">
            {/* two reindeer, simplified silhouettes */}
            <path d="M2 22 l-3 -9 M6 20 l0.5 -9 M40 22 l3 -9 M36 20 l-0.5 -9" stroke={deep} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M0 25 l-4 -3.5 M46 25 l4 -3.5" stroke={deep} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <ellipse cx="12" cy="27" rx="10" ry="5.4" />
            <ellipse cx="34" cy="27" rx="10" ry="5.4" />
            <path d="M12 32 v5 M16 32 v6 M30 32 v6 M34 32 v5" stroke={deep} strokeWidth="1.6" strokeLinecap="round" />

            {/* sleigh body */}
            <path d="M56 21 q-5 11 6 13 h26 q7 0 7 -7 v-6 q0 -4.5 -4.5 -4.5 h-30 q-4.5 0 -4.5 4.5 Z" />
            <path d="M52 33 q30 5 46 -2" stroke={deep} strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* santa */}
            <circle cx="72" cy="13" r="7.4" />
            <path d="M64.5 11.5 q7.5 -11 17 -2.4 l-2.2 3.2 q-6.4 -5.4 -12.8 1 Z" fill={ink} />
            <circle cx="81.5" cy="8" r="1.7" fill={ink} />
          </g>
        </svg>
      </div>
    </div>
  );
}
