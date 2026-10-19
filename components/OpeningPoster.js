"use client";

/* ══════════════════════════════════════════════════════════════════════
   The loading cover for every live preview (hero phones, demo phones,
   the invitation wall) — drawn as Welcvm's own opening rather than a
   white box with a label.

   Invitations get the "Tap to open" doors (a little GrandEntrance):
   two panels with arches and a gold seal, the occasion and the names
   above. Greeting cards get the envelope their real page opens with.
   When the page behind has loaded (`gone`), the doors swing open / the
   flap lifts, and the cover fades — so the preview opens the way the
   real link does.
   ══════════════════════════════════════════════════════════════════════ */
export default function OpeningPoster({ label, names, accent = "#B8405E", gone = false, variant = "doors", style }) {
  const cls = `dp-poster dp-open dp-open-${variant} ${gone ? "dp-gone" : ""}`;
  if (variant === "envelope") {
    return (
      <div className={cls} style={{ "--dp-accent": accent, ...style }} aria-hidden="true">
        <span className="dp-open-kick">{label}</span>
        <div className="dp-env">
          <span className="dp-env-back" />
          <span className="dp-env-flap" />
          <span className="dp-env-seal">♥</span>
        </div>
        <span className="dp-open-names">{names}</span>
        <span className="dp-open-cue">Tap to open</span>
      </div>
    );
  }
  return (
    <div className={cls} style={{ "--dp-accent": accent, ...style }} aria-hidden="true">
      <span className="dp-door dp-door-l" />
      <span className="dp-door dp-door-r" />
      <div className="dp-open-text">
        <span className="dp-open-kick">{label}</span>
        <span className="dp-open-names">{names}</span>
        <span className="dp-open-seal"><i>✦</i></span>
        <span className="dp-open-cue">Tap to open</span>
      </div>
    </div>
  );
}
