/* ══════════════════════════════════════════════════════════════════════
   WEDDING CINEMA — Token Schema

   The AI interview fills this structure when eventKind === "wedding".
   The WeddingCinema component reads it to render the cinematic
   scroll-driven invitation.

   Unlike the generic design tokens (lib/design/tokens.js), this schema
   is purpose-built for weddings: it carries couple data, family names,
   sub-events, love-story chapters, and venue details that a generic
   "headline + sections" model cannot represent.
   ══════════════════════════════════════════════════════════════════════ */

/* Default / seed data. The AI fills real data as the conversation
   progresses; the renderer always has something to show. */
export function emptyWeddingTokens() {
  return {
    _cinema: true,  // flag to route to WeddingCinema instead of TokenInvite
    couple: {
      bride: "",
      groom: "",
      brideFullName: "",
      groomFullName: "",
      hosts: "",
      blessingLine: "With the blessings of our families",
      brideIntro: "",
      groomIntro: "",
      bridePhoto: null,
      groomPhoto: null,
      couplePhoto: null,
    },
    invitation: {
      kicker: "Together With Their Families",
      headline: "",
      message: "",
      displayDate: "",
      countdownAt: null,
      closingMessage: "",
      closingBlessing: "With love and gratitude.",
    },
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      mapQuery: "",
      description: "",
      parking: "",
      nearestTransport: "",
      directions: "",
    },
    events: [],
    story: [],
    media: {
      heroImageUrl: null,
      heroVideoUrl: null,
      galleryImages: [],
    },
    social: {
      hashtag: "",
    },
    rsvp: {
      enabled: true,
      deadline: "",
    },
    palette: {
      primary: "#8f294e",
      secondary: "#7b594e",
      accent: "#c69a55",
      paper: "#fff8ea",
      text: "#4f392f",
    },
  };
}

/* A value the model actually supplied. Structured output makes the model
   emit every required key on every turn, so a field it does not yet know
   comes back as "" — and a plain spread would then overwrite the bride's
   name with an empty string on the turn after we captured it. Only real
   values are allowed to land. */
const supplied = (v) =>
  v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");

/* A stable key for one function or story chapter, so a second mention of
   the Haldi updates the existing card instead of adding a duplicate. */
const keyOf = (item, i) =>
  String(item?.id || item?.name || item?.title || `i${i}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/* Merge two arrays of cards by that key: keep what we already have, fill
   in whatever the patch adds, and append genuinely new entries in the
   order the model sent them. */
function mergeCards(current, incoming) {
  const out = [];
  const index = new Map();
  for (const [i, item] of (current || []).entries()) {
    const k = keyOf(item, i);
    index.set(k, out.length);
    out.push({ ...item });
  }
  for (const [i, item] of (incoming || []).entries()) {
    if (!item || typeof item !== "object") continue;
    const k = keyOf(item, i);
    const clean = Object.fromEntries(Object.entries(item).filter(([, v]) => supplied(v)));
    if (index.has(k)) Object.assign(out[index.get(k)], clean);
    else {
      index.set(k, out.length);
      out.push(clean);
    }
  }
  return out;
}

/* Merge a partial patch (from the AI) into the current wedding tokens. */
export function patchWeddingTokens(current, patch) {
  if (!patch) return current;
  const next = { ...current };

  // Top-level flag
  next._cinema = true;

  // Merge nested objects, ignoring blanks (see `supplied` above).
  for (const key of ["couple", "invitation", "venue", "social", "rsvp", "palette", "media"]) {
    if (patch[key] && typeof patch[key] === "object") {
      const clean = Object.fromEntries(Object.entries(patch[key]).filter(([, v]) => supplied(v)));
      next[key] = { ...(current[key] || {}), ...clean };
    }
  }

  /* Functions and story chapters MERGE rather than replace. They used to
     overwrite wholesale, so the turn where the couple added the sangeet
     could drop the haldi they had given two turns earlier — the model
     only has to forget one entry once for a function to vanish from the
     timeline for good. */
  if (Array.isArray(patch.events) && patch.events.length) {
    next.events = mergeCards(current?.events, patch.events);
  }
  if (Array.isArray(patch.story) && patch.story.length) {
    next.story = mergeCards(current?.story, patch.story);
  }

  /* Photos are uploaded by the client, not written by the model, so the
     client's array is authoritative when it sends one. */
  if (patch.media?.galleryImages) {
    next.media = { ...(next.media || {}), galleryImages: patch.media.galleryImages };
  }

  return next;
}

/* Check if tokens represent a wedding cinema invitation. */
export function isCinema(tokens) {
  return Boolean(tokens?._cinema);
}

/* Progress: how complete is the wedding data? 0–100 */
export function cinemaProgress(tokens) {
  if (!tokens) return 0;
  const checks = [
    Boolean(tokens.couple?.bride),
    Boolean(tokens.couple?.groom),
    Boolean(tokens.invitation?.displayDate),
    Boolean(tokens.venue?.name),
    Boolean(tokens.events?.length),
    Boolean(tokens.invitation?.message),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* The Gemini structured-output schema for wedding cinema tokens.
   This is what the AI model returns on each turn. */
export const WEDDING_CINEMA_SCHEMA = {
  type: "object",
  properties: {
    reply:     { type: "string", description: "One or two warm sentences acknowledging what they just said." },
    askNext:   { type: "string", description: "The single next question. Empty when done." },
    done:      { type: "boolean", description: "True when enough to publish." },
    eventKind: { type: "string", description: "Always 'wedding'." },

    couple: {
      type: "object",
      properties: {
        bride:         { type: "string" },
        groom:         { type: "string" },
        brideFullName: { type: "string" },
        groomFullName: { type: "string" },
        hosts:         { type: "string", description: "e.g. 'Together with the Sharma and Patel families'" },
        blessingLine:  { type: "string" },
        brideIntro:    { type: "string", description: "A sentence about the bride." },
        groomIntro:    { type: "string", description: "A sentence about the groom." },
      },
    },
    invitation: {
      type: "object",
      properties: {
        kicker:          { type: "string", description: "Short line above the names, e.g. 'Together With Their Families'" },
        headline:        { type: "string", description: "Tagline, e.g. 'A celebration of love, music, and forever'" },
        message:         { type: "string", description: "The invitation prose paragraph." },
        displayDate:     { type: "string", description: "Human-readable date, e.g. '12 December 2026'" },
        countdownAt:     { type: "string", description: "ISO datetime for countdown, e.g. '2026-12-12T18:30'" },
        closingMessage:  { type: "string" },
        closingBlessing: { type: "string" },
      },
    },
    venue: {
      type: "object",
      properties: {
        name:             { type: "string" },
        address:          { type: "string" },
        city:             { type: "string" },
        state:            { type: "string" },
        country:          { type: "string" },
        mapQuery:         { type: "string", description: "Google Maps search query" },
        description:      { type: "string" },
        parking:          { type: "string" },
        nearestTransport: { type: "string" },
        directions:       { type: "string" },
      },
    },
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id:          { type: "string" },
          name:        { type: "string" },
          date:        { type: "string", description: "YYYY-MM-DD" },
          time:        { type: "string", description: "HH:MM" },
          endTime:     { type: "string" },
          venue:       { type: "string" },
          address:     { type: "string" },
          description: { type: "string" },
          dressCode:   { type: "string" },
          theme:       { type: "string", description: "e.g. 'Haldi Yellow', 'Royal Maroon / Gold'" },
        },
      },
    },
    story: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id:          { type: "string" },
          title:       { type: "string" },
          description: { type: "string" },
        },
      },
    },
    social: {
      type: "object",
      properties: {
        hashtag: { type: "string" },
      },
    },
    rsvp: {
      type: "object",
      properties: {
        enabled:  { type: "boolean" },
        deadline: { type: "string" },
      },
    },
    palette: {
      type: "object",
      properties: {
        primary:   { type: "string", description: "Hex, e.g. '#8f294e'" },
        secondary: { type: "string" },
        accent:    { type: "string", description: "Gold accent, e.g. '#c69a55'" },
        paper:     { type: "string" },
        text:      { type: "string" },
      },
    },
  },
  /* `couple` and `invitation` are required for the same reason the generic
     schema requires `content`: with only `reply` required the model will
     happily hold a warm conversation and return no data at all, and the
     invitation publishes with the couple's names empty. That shipped once
     already. Requiring the objects forces it to carry the page's data on
     every turn; blank fields inside them are dropped by
     patchWeddingTokens rather than overwriting what we know. */
  required: ["reply", "eventKind", "couple", "invitation"],
};
