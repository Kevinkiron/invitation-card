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

/* Merge a partial patch (from the AI) into the current wedding tokens.
   Handles nested objects and arrays correctly. */
export function patchWeddingTokens(current, patch) {
  if (!patch) return current;
  const next = { ...current };

  // Top-level flag
  next._cinema = true;

  // Merge nested objects
  for (const key of ["couple", "invitation", "venue", "social", "rsvp", "palette", "media"]) {
    if (patch[key] && typeof patch[key] === "object") {
      next[key] = { ...(current[key] || {}), ...patch[key] };
    }
  }

  // Arrays replace wholesale (events, story, gallery)
  if (Array.isArray(patch.events) && patch.events.length) next.events = patch.events;
  if (Array.isArray(patch.story) && patch.story.length) next.story = patch.story;
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
  required: ["reply", "eventKind"],
};
