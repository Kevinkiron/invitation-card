/* ══════════════════════════════════════════════════════════════
   Tolerant parsing of model JSON.

   Gemini 3 models think by default and thinking tokens are charged
   against maxOutputTokens, so a response can arrive structurally
   valid but cut off mid-object. Rather than losing the whole turn we
   rewind to the last sound point and close what is still open, which
   recovers every field the model did finish.
   ══════════════════════════════════════════════════════════════ */

/** Strip any code fence, parse, and fall back to repairing truncation. */
export function parseModelJson(raw) {
  if (!raw) return null;

  const cleaned = String(raw)
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try { return JSON.parse(cleaned); } catch { /* try to repair below */ }

  const repaired = repairTruncatedJson(cleaned);
  if (!repaired) return null;
  try { return JSON.parse(repaired); } catch { return null; }
}

/**
 * Rewind to the last structurally sound point — the last comma or
 * closing bracket that is not inside a string — then close whatever
 * containers remain open. Handles a half-written key, a half-written
 * value, or an unterminated array. Returns null if nothing is salvageable.
 */
export function repairTruncatedJson(s) {
  let inString = false;
  let escaped = false;
  const open = [];
  let cut = -1;
  let openAtCut = [];

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') { inString = true; continue; }

    if (ch === "{") open.push("}");
    else if (ch === "[") open.push("]");
    else if (ch === "}" || ch === "]") {
      open.pop();
      cut = i + 1;
      openAtCut = [...open];
    } else if (ch === ",") {
      cut = i; // cut before the comma
      openAtCut = [...open];
    }
  }

  if (cut <= 0 || openAtCut.length === 0) return null;
  return s.slice(0, cut) + openAtCut.reverse().join("");
}
