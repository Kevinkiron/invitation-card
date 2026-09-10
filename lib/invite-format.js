/* Shared formatting helpers for every invitation template variant.
   Kept in one place so classic/editorial/noir renderers (and any future
   variant) stay in sync instead of re-implementing the same date/colour
   logic with subtle drift. */

/** darken / lighten a hex colour by `amt` (-255..255) */
export function shade(hex, amt) {
  try {
    const n = parseInt(String(hex).replace("#", ""), 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt);
    const g = clamp(((n >> 8) & 0xff) + amt);
    const b = clamp((n & 0xff) + amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  } catch {
    return hex;
  }
}

export function formatDate(d) {
  if (!d) return "Date to be announced";
  try {
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

/** short form used by compact date-stamp treatments, e.g. "20 DEC 2026" */
export function formatDateShort(d) {
  if (!d) return "TBA";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  } catch {
    return d;
  }
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":");
  const hh = parseInt(h, 10);
  const ap = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${m} ${ap}`;
}
