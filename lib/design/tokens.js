/* ══════════════════════════════════════════════════════════════════════
   THE CONTRACT between the AI and the renderer.

   The model never writes HTML or CSS. It writes an object matching the
   schema below — roughly 400 tokens — and lib/design/renderer.js turns
   that into the finished page. Two consequences worth stating plainly:

     • Nothing the model can emit is unrenderable, unresponsive or
       injectable. The worst it can do is pick a combination we think
       is ugly, and sanitise() below catches most of that.
     • The quality ceiling is set by the renderer's primitives, not by
       the model. Adding frames and motifs raises every future design.
   ══════════════════════════════════════════════════════════════════════ */

export const FRAMES  = ["arch", "circle", "rect", "wide", "none"];
export const MOTIFS  = ["botanical", "geometric", "waves", "confetti", "grid", "rings", "none"];
export const REVEALS = ["veil", "fade", "none"];
export const CORNERS = ["soft", "sharp"];

/* Curated pairings. The model picks a NAME, never a font stack — that
   keeps the webfont set bounded and stops it inventing families we do
   not ship. */
export const TYPE_SETS = {
  "classic-script":  { display: "'Cormorant Garamond',Georgia,serif", body: "'Jost',sans-serif",          script: "'Pinyon Script',cursive",   weight: 600, h1Scale: 6.6, h1Max: 66,  tracking: "0" },
  "editorial-serif": { display: "'Playfair Display',Georgia,serif",   body: "'DM Sans',sans-serif",       script: "'Playfair Display',serif",  weight: 700, h1Scale: 6.8, h1Max: 70,  tracking: "0" },
  "modern-sans":     { display: "'Space Grotesk',sans-serif",         body: "'DM Sans',sans-serif",       script: "'Space Grotesk',sans-serif",weight: 700, h1Scale: 7.2, h1Max: 78,  tracking: "-.02em" },
  "poster-condensed":{ display: "'Bebas Neue',Impact,sans-serif",     body: "'Space Grotesk',sans-serif", script: "'Bebas Neue',sans-serif",   weight: 400, h1Scale: 13,  h1Max: 150, tracking: ".01em" },
  "quiet-serif":     { display: "'Cormorant Garamond',Georgia,serif", body: "'DM Sans',sans-serif",       script: "'Cormorant Garamond',serif",weight: 600, h1Scale: 6.4, h1Max: 62,  tracking: "0" },
};

export const SECTION_TYPES = ["prose", "cards", "detail", "gallery", "cta"];

export const ICON_NAMES = [
  "ring","church","glass","home","mic","talk","code","users",
  "cake","ticket","pin","clock","star","camera",
];

const HEX = { type: "string", description: "Hex colour, e.g. #2b4433" };

/* Gemini structured-output / Anthropic tool-input schema. Deliberately
   flat and small — every extra nested field costs latency on each turn. */
export const DESIGN_SCHEMA = {
  type: "object",
  properties: {
    reply:   { type: "string", description: "One or two warm sentences acknowledging what they just said. Never repeat the question here." },
    askNext: { type: "string", description: "The single next question. Empty string when done is true." },
    done:    { type: "boolean", description: "True only when there is enough to publish." },
    eventKind: { type: "string", description: "Short slug for the kind of event, e.g. wedding, engagement, conference, concert, birthday, housewarming, baptism." },

    design: {
      type: "object",
      description: "Only send fields you are changing. Omit the whole object if nothing about the look should change.",
      properties: {
        palette: {
          type: "object",
          properties: {
            bg: HEX, surface: HEX, ink: HEX, muted: HEX,
            accent: HEX, accentSoft: HEX, deep: HEX, onDeep: HEX,
          },
        },
        typeSet:  { type: "string", enum: Object.keys(TYPE_SETS) },
        frame:    { type: "string", enum: FRAMES },
        motif:    { type: "string", enum: MOTIFS },
        reveal:   { type: "string", enum: REVEALS },
        corner:   { type: "string", enum: CORNERS },
        density:  { type: "number", description: "Ornament density, 0 to 1." },
        displayCase: { type: "string", enum: ["none", "uppercase"] },
      },
    },

    content: {
      type: "object",
      description: "Only fields the user actually supplied or that you are writing on their behalf. Never invent names, dates or venues.",
      properties: {
        monogram:  { type: "string", description: "Two initials joined, e.g. 'A & D'. Only for personal events." },
        kicker:    { type: "string" },
        headline:  { type: "string" },
        headlineB: { type: "string", description: "Second name or line, when the event has two subjects." },
        joiner:    { type: "string", description: "Word between the two headlines, e.g. 'with', '&', 'of'." },
        headlineScript: { type: "boolean", description: "True to set the headline in the script face. Personal events only — never for corporate." },
        subhead:   { type: "string", description: "Date and time, written out." },
        place:     { type: "string" },
        countdownTo: { type: "string", description: "ISO 8601 with offset, e.g. 2027-02-06T17:00:00+05:30" },
        epigraph:  { type: "object", properties: { text: { type: "string" }, source: { type: "string" } } },
        footerMark: { type: "string" },
        footerLine: { type: "string" },
        sections: {
          type: "array",
          description: "The page, in order. Replace wholesale when it changes.",
          items: {
            type: "object",
            properties: {
              type:    { type: "string", enum: SECTION_TYPES },
              id:      { type: "string" },
              invert:  { type: "boolean", description: "Draw on the deep colour. Use for at most one or two sections." },
              eyebrow: { type: "string" },
              title:   { type: "string" },
              script:  { type: "boolean" },
              lede:    { type: "string" },
              body:    { type: "string", description: "prose only." },
              note:    { type: "string" },
              button:  { type: "object", properties: { label: { type: "string" }, href: { type: "string" } } },
              items: {
                type: "array",
                description: "cards only.",
                items: {
                  type: "object",
                  properties: {
                    icon:    { type: "string", enum: ICON_NAMES },
                    heading: { type: "string" },
                    meta:    { type: "string" },
                    body:    { type: "string" },
                  },
                },
              },
              rows: {
                type: "array",
                description: "detail only.",
                items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } },
              },
            },
            required: ["type"],
          },
        },
      },
    },
  },
  required: ["reply"],
};

/* ── Sanitiser ─────────────────────────────────────────────────────────
   The model proposes; this decides. Anything off-list is dropped rather
   than passed through, so a hallucinated frame name or a stray colour
   string can never reach the renderer. */

const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v.trim());
const pick = (v, list, fallback) => (list.includes(v) ? v : fallback);
const clamp01 = (n) => (typeof n === "number" && isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.7);

/* A complete, renderable design. This is the whole point of the file:
   the renderer reads d.fonts.display and d.palette.bg unconditionally, so
   the sanitiser's contract is not "filter bad values" but "always return
   something that renders". Getting that wrong is what produced a blank
   preview — the model sent a palette without a typeSet, fonts came back
   undefined, render() threw, and the caller swallowed it. */
export const DEFAULT_DESIGN = {
  palette: {
    bg: "#fdf9f1", surface: "#f5efe4", ink: "#33302c", muted: "#867f76",
    accent: "#b8912f", accentSoft: "#e6dcc4", deep: "#2f2b26", onDeep: "#fdf9f1",
  },
  typeSet: "quiet-serif",
  frame: "arch", motif: "botanical", reveal: "fade", corner: "soft",
  density: 0.7, displayCase: "none",
};

export function sanitiseDesign(incoming = {}, current = {}) {
  // Defaults first, then whatever we already had, then the validated patch.
  // Every branch below overwrites; none can leave a required field missing.
  const d = {
    ...DEFAULT_DESIGN,
    ...current,
    palette: { ...DEFAULT_DESIGN.palette, ...(current.palette || {}) },
  };

  if (incoming.palette) {
    for (const k of ["bg","surface","ink","muted","accent","accentSoft","deep","onDeep"]) {
      if (isHex(incoming.palette[k])) d.palette[k] = incoming.palette[k].trim();
    }
  }
  if (incoming.typeSet && TYPE_SETS[incoming.typeSet]) d.typeSet = incoming.typeSet;
  if (incoming.frame)  d.frame  = pick(incoming.frame,  FRAMES,  d.frame);
  if (incoming.motif)  d.motif  = pick(incoming.motif,  MOTIFS,  d.motif);
  if (incoming.reveal) d.reveal = pick(incoming.reveal, REVEALS, d.reveal);
  if (incoming.corner) d.corner = pick(incoming.corner, CORNERS, d.corner);
  if (incoming.density !== undefined) d.density = clamp01(incoming.density);
  if (incoming.displayCase) d.displayCase = incoming.displayCase === "uppercase" ? "uppercase" : "none";

  /* Everything typographic is derived from typeSet here and nowhere else.
     Storing fonts separately let them drift: a seeded design carried
     typeSet "poster-condensed" but the default serif's font stack, so
     every event rendered in the same face. */
  const ts = TYPE_SETS[d.typeSet] ? d.typeSet : DEFAULT_DESIGN.typeSet;
  const t = TYPE_SETS[ts];
  d.typeSet = ts;
  d.fonts = { display: t.display, body: t.body, script: t.script };
  d.displayWeight = t.weight;
  d.h1Scale = t.h1Scale;
  d.h1Max = t.h1Max;
  d.displayTracking = t.tracking;

  /* The little divider glyph follows the design's temperament. A botanical
     flower under a concert headline was the tell that this was a wedding
     template wearing other colours. */
  d.ornament = d.corner === "sharp" ? "&#9670;" : "&#10047;";

  return d;
}

/** Did the model actually make a design decision this turn? */
export function touchedDesign(incoming = {}) {
  return Boolean(
    incoming.palette || incoming.typeSet || incoming.frame || incoming.motif ||
    incoming.reveal || incoming.corner || incoming.displayCase ||
    incoming.density !== undefined
  );
}

const str = (v, max = 400) => (typeof v === "string" ? v.slice(0, max) : undefined);

/* esc() in the renderer neutralises quotes and angle brackets, but it does
   NOT stop `javascript:` in an href — escaping the string still leaves a
   live scheme. Model-supplied links therefore have to be scheme-checked
   here, where they enter the system. */
const safeHref = (v) => {
  const s = str(v, 500);
  if (!s) return undefined;
  const t = s.trim();
  if (/^(https?:|mailto:|tel:)/i.test(t)) return t;
  if (t.startsWith("/") || t.startsWith("#")) return t;   // same-site
  return undefined;
};

function sanitiseSection(s = {}) {
  if (!SECTION_TYPES.includes(s.type)) return null;
  const out = { type: s.type };
  for (const k of ["id","eyebrow","title","lede","body","note"]) {
    const v = str(s[k], k === "body" ? 1200 : 300);
    if (v) out[k] = v;
  }
  if (s.invert) out.invert = true;
  if (s.script) out.script = true;

  if (s.type === "cards" && Array.isArray(s.items)) {
    out.items = s.items.slice(0, 6).map((it) => ({
      icon: ICON_NAMES.includes(it?.icon) ? it.icon : "star",
      heading: str(it?.heading, 80) || "",
      meta: str(it?.meta, 80),
      body: str(it?.body, 300),
      ...(safeHref(it?.link?.href) ? { link: { label: str(it.link.label, 40) || "Open", href: safeHref(it.link.href) } } : {}),
    })).filter((it) => it.heading);
    if (!out.items.length) return null;
  }
  if (s.type === "detail" && Array.isArray(s.rows)) {
    out.rows = s.rows.slice(0, 10).map((r) => ({
      label: str(r?.label, 60) || "", value: str(r?.value, 120) || "",
    })).filter((r) => r.label && r.value);
    if (!out.rows.length) return null;
  }
  if (s.type === "cta" && s.button) {
    out.button = { label: str(s.button.label, 40) || "RSVP", href: safeHref(s.button.href) || "#" };
  }
  // Photos are never model-supplied — the server attaches them from storage.
  if (s.type === "gallery") out.photos = Array.isArray(s.photos) ? s.photos : [];
  return out;
}

export function sanitiseContent(incoming = {}, current = {}) {
  const c = { ...current };
  for (const k of ["monogram","kicker","headline","headlineB","joiner","subhead","place","footerMark","footerLine"]) {
    const v = str(incoming[k], 140);
    if (v) c[k] = v;
  }
  if (typeof incoming.headlineScript === "boolean") c.headlineScript = incoming.headlineScript;

  if (incoming.epigraph && str(incoming.epigraph.text, 300)) {
    c.epigraph = { text: str(incoming.epigraph.text, 300), source: str(incoming.epigraph.source, 80) };
  }
  if (incoming.countdownTo) {
    const t = Date.parse(incoming.countdownTo);
    // Reject the past, and anything absurd — a bad date silently kills the countdown.
    if (!Number.isNaN(t) && t > Date.now() && t < Date.now() + 15 * 365 * 864e5) {
      c.countdownTo = new Date(t).toISOString();
    }
  }
  if (Array.isArray(incoming.sections)) {
    const secs = incoming.sections.slice(0, 8).map(sanitiseSection).filter(Boolean);
    if (secs.length) c.sections = secs;
  }
  return c;
}

/** Merge one AI turn into the working invitation. Never trusts input. */
export function applyPatch(currentTokens = {}, patch = {}) {
  return {
    design:  sanitiseDesign(patch.design || {},  currentTokens.design  || {}),
    content: sanitiseContent(patch.content || {}, currentTokens.content || {}),
    eventKind: str(patch.eventKind, 40) || currentTokens.eventKind || null,
    // The preview switches on this, not on "does a palette exist" — with
    // defaults always present, that test was true before the AI had done
    // anything, and would have shown a generic design on turn zero.
    designed: Boolean(currentTokens.designed) || touchedDesign(patch.design || {}),
  };
}
