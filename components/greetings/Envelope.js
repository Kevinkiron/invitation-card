"use client";

/* ══════════════════════════════════════════════════════════════════════
   ENVELOPE — the seal-and-flap opening ceremony every greeting card now
   starts from, sitting in front of GreetingCard's own front/back flip
   (see components/GreetingCard.js). Kevin's reference for this: a
   "winterpost"-style Christmas card whose whole appeal was the envelope
   itself — a wax seal, a postmark, a flap that folds back on a tap,
   then the envelope fades away to reveal the card underneath. This is
   that same structure and the same pure-CSS animation approach (no
   images: the paper is gradients, the flap and pocket are clip-path
   polygons, the seal is a radial-gradient with an inline SVG mark), just
   generalised so any occasion can use it — the wax seal and postmark ink
   are the occasion's own accent/deep palette colours (see
   lib/greetings/occasions.js) rather than fixed to Christmas red, and
   the postmark text comes from that occasion's own `stamp` field instead
   of "25 DEC".

   `opening` is owned by the parent (GreetingCard) rather than local
   state, because the parent needs to know once the envelope has been
   dismissed — see app/greeting-envelope.css for what each class actually
   animates; this component only ever toggles one class.
   ══════════════════════════════════════════════════════════════════════ */
export default function Envelope({ to, from, stamp, opening, onOpen }) {
  return (
    <div className={`gc-envelope-stage ${opening ? "gc-envelope-opening" : ""}`}>
      <div className="gc-envelope" aria-hidden={opening || undefined}>
        <div className="gc-envelope-back" />
        <div className="gc-envelope-pocket" />
        <div className="gc-envelope-flap" />
        {stamp && (
          <div className="gc-envelope-stamp">
            <span>{stamp.label}</span>
            <strong>{stamp.sub}</strong>
          </div>
        )}
        <div className="gc-envelope-label">
          To: <span>{to}</span>
          {from && <small>From: {from}</small>}
        </div>
        <button
          type="button"
          className="gc-envelope-seal"
          onClick={onOpen}
          aria-label="Break the seal and open your envelope"
          tabIndex={opening ? -1 : 0}
        >
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M16 4v24M6 10l20 12M6 22l20-12M12 6l4 4 4-4M12 26l4-4 4 4M6 15l5-2-1-5m12 16-1-5 5-2M6 17l5 2-1 5m12-16-1 5 5 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
