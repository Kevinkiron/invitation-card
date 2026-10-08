"use client";

import { useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { C } from "@/lib/theme";
import { BACKGROUNDS, validBackground } from "@/lib/design/invite-background";
import { backgroundCss, backgroundIsLight } from "@/lib/greetings/backgrounds";

/* ══════════════════════════════════════════════════════════════════════
   BACKGROUND PICKER — the gradient behind a wedding or celebration
   invitation, in the chat column on /create next to photos and music.
   Writes `tokens.background` ({ id, from, to } or null) straight from
   the browser, like the music picker; the model never sees it. The live
   preview on the right repaints as soon as a swatch is tapped.
   (Applied by lib/design/invite-background.js.)
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_FROM = "#2a1236";
const DEFAULT_TO = "#c4776a";

export default function BackgroundPicker({ tokens, onChoose, disabled, wedding }) {
  const bg = validBackground(tokens?.background) ? tokens.background : null;
  const [open, setOpen] = useState(false);
  const name = !bg ? "The design's own colours" : bg.id === "custom" ? "Your own mix" : BACKGROUNDS.find((b) => b.id === bg.id)?.name || "Custom";
  const custom = bg?.id === "custom" ? bg : { from: DEFAULT_FROM, to: DEFAULT_TO };

  const pick = (b) => onChoose(b ? { id: b.id, from: b.from, to: b.to } : null);

  const swatch = (on) => ({
    position: "relative", height: 46, borderRadius: 11, cursor: disabled ? "default" : "pointer",
    border: `2px solid ${on ? C.heart : "transparent"}`,
    boxShadow: on ? "0 0 0 3px rgba(222,107,90,.22)" : "inset 0 0 0 1px rgba(0,0,0,.08)",
    display: "flex", alignItems: "flex-end", padding: 0, overflow: "hidden", fontFamily: "inherit",
  });
  const label = (light) => ({
    width: "100%", fontSize: 9.5, fontWeight: 700, letterSpacing: ".02em", padding: "10px 4px 4px",
    color: light ? "#3b2c26" : "#fff", textAlign: "center", lineHeight: 1.1,
    background: light ? "linear-gradient(180deg,transparent,rgba(255,255,255,.5))" : "linear-gradient(180deg,transparent,rgba(0,0,0,.35))",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  });
  const tick = { position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: C.heart, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 14px", marginBottom: 10, background: "#fff" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: 0, background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: bg ? backgroundCss(bg) : `linear-gradient(140deg, ${C.heart}, ${C.marigold})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
          <Palette size={13} color="#fff" />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: C.ink }}>Background colour</span>
          <span style={{ display: "block", fontSize: 11, color: C.muted }}>{name} — tap to {open ? "close" : "change"}</span>
        </span>
        <ChevronDown size={16} color={C.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div role="radiogroup" aria-label="Invitation background" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 7 }}>
            <button type="button" role="radio" aria-checked={!bg} disabled={disabled} onClick={() => pick(null)}
              style={{ ...swatch(!bg), background: "repeating-linear-gradient(45deg,#f4eee6 0 6px,#fbf8f3 6px 12px)" }}>
              {!bg && <span style={tick}><Check size={10} color="#fff" /></span>}
              <span style={label(true)}>Original</span>
            </button>
            {BACKGROUNDS.map((b) => {
              const on = bg?.id === b.id;
              const light = backgroundIsLight(b);
              return (
                <button key={b.id} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => pick(b)} title={b.name}
                  style={{ ...swatch(on), background: backgroundCss(b) }}>
                  {on && <span style={tick}><Check size={10} color="#fff" /></span>}
                  <span style={label(light)}>{b.name}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 10px", borderRadius: 11, background: C.ivory || "#faf6ef" }}>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.ink }}>Or mix your own</span>
            {["from", "to"].map((end, i) => (
              <label key={end} title={i ? "Bottom colour" : "Top colour"}
                style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", position: "relative", boxShadow: "0 0 0 2px #fff, 0 0 0 3px rgba(0,0,0,.12)", background: custom[end], cursor: "pointer" }}>
                <input type="color" value={custom[end]} disabled={disabled}
                  onChange={(e) => onChoose({ id: "custom", from: end === "from" ? e.target.value : custom.from, to: end === "to" ? e.target.value : custom.to })}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </label>
            ))}
          </div>
          {wedding && (
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
              Light colours are deepened on a wedding invitation so the gold names stay readable.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
