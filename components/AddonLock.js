"use client";

import { Lock, Unlock, Music2, Palette, Images, X as XIcon, Check, ShieldCheck } from "lucide-react";
import { C, money } from "@/lib/theme";
import { ADDONS, ADDON_PRICE, BASE_PRICE } from "@/lib/pricing";

/* ══════════════════════════════════════════════════════════════════════
   ADD-ON LOCKS — the ₹25 features (lib/pricing.js) in the chat on
   /create and /greetings/create.

   LockedFeature   the card shown in place of a locked feature
   UnlockDialog    "Unlock Background music for ₹25?" — confirming adds
                   the add-on; the sender then uses it straight away
   PriceSummary    the bill at publish: ₹100 + each unlocked add-on, with
                   the still-locked ones offered as one-tap extras
   ══════════════════════════════════════════════════════════════════════ */

const ICON = { music: Music2, colour: Palette, photos: Images };

export function LockedFeature({ id, onUnlock, disabled, compact = false }) {
  const a = ADDONS[id];
  const Icon = ICON[id] || Lock;
  return (
    <div style={{ border: `1px dashed ${C.line}`, borderRadius: 14, padding: compact ? "10px 12px" : "13px 14px", marginBottom: 10, background: "#fdfaf5", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ position: "relative", width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "#e9e1d6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={13} color={C.muted} />
        <span style={{ position: "absolute", right: -5, bottom: -5, width: 15, height: 15, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px #fdfaf5" }}>
          <Lock size={8} color="#fff" />
        </span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{a.label}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{a.blurb}</div>
      </div>
      <button
        type="button" onClick={() => onUnlock(id)} disabled={disabled}
        style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, border: 0, borderRadius: 999, padding: "8px 13px", fontSize: 12, fontWeight: 800, color: "#fff", background: `linear-gradient(140deg, ${C.heart}, ${C.marigold})`, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 14px -8px rgba(222,107,90,.9)" }}
      >
        <Unlock size={12} /> {money(ADDON_PRICE)}
      </button>
    </div>
  );
}

export function UnlockDialog({ id, onConfirm, onClose }) {
  if (!id) return null;
  const a = ADDONS[id];
  const Icon = ICON[id] || Lock;
  return (
    <div role="dialog" aria-modal="true" aria-label={`Unlock ${a.label}`} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(20,14,10,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "min(360px, 100%)", background: "#fff", borderRadius: 18, padding: "22px 20px 18px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.45)", position: "relative", textAlign: "center" }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 10, right: 10, border: 0, background: "none", cursor: "pointer", color: C.muted }}><XIcon size={16} /></button>
        <span style={{ width: 46, height: 46, borderRadius: 14, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(140deg, ${C.heart}, ${C.marigold})` }}>
          <Icon size={20} color="#fff" />
        </span>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Unlock {a.label.toLowerCase()}</div>
        <div style={{ fontSize: 12.5, color: C.muted, margin: "6px 0 16px", lineHeight: 1.5 }}>{a.blurb}<br />One-time {money(ADDON_PRICE)} for this page.</div>
        <button type="button" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => onConfirm(id)}>
          <Unlock size={15} /> Pay {money(ADDON_PRICE)} &amp; unlock
        </button>
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", fontSize: 11, color: C.muted, marginTop: 10 }}>
          <ShieldCheck size={13} color={C.green} /> Payment is simulated in this build.
        </div>
      </div>
    </div>
  );
}

export function PriceSummary({ addons = [], onAdd, kindLabel = "Invitation" }) {
  const locked = Object.keys(ADDONS).filter((k) => !addons.includes(k));
  const total = BASE_PRICE + ADDON_PRICE * addons.length;
  const row = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "7px 0" };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...row, fontWeight: 700 }}><span>{kindLabel}</span><span>{money(BASE_PRICE)}</span></div>
      {addons.map((k) => (
        <div key={k} style={{ ...row, color: C.ink }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Check size={13} color={C.green} /> {ADDONS[k].label}</span>
          <span>{money(ADDON_PRICE)}</span>
        </div>
      ))}
      {locked.length > 0 && onAdd && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0 4px" }}>
          {locked.map((k) => (
            <button key={k} type="button" onClick={() => onAdd(k)}
              style={{ display: "flex", alignItems: "center", gap: 5, border: `1px dashed ${C.line}`, background: "#fff", borderRadius: 999, padding: "6px 11px", fontSize: 11.5, fontWeight: 700, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
              <Lock size={11} /> {ADDONS[k].label} +{money(ADDON_PRICE)}
            </button>
          ))}
        </div>
      )}
      <div style={{ ...row, borderTop: `1px solid ${C.line}`, marginTop: 6, paddingTop: 10, fontWeight: 800, fontSize: 15 }}>
        <span>Total</span><span className="display" style={{ color: C.heart, fontSize: 20 }}>{money(total)}</span>
      </div>
    </div>
  );
}
