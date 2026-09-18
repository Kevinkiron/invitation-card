/* ══════════════════════════════════════════════════════════════════════
   CELEBRATION CINEMA — Token Schema

   The premium template for every celebration that is not a wedding — a
   birthday, a naming ceremony, a housewarming, and now anything else
   someone describes: an engagement, a graduation, a retirement, a
   product launch, a reunion. `_premium` carries the kind AND acts as the
   flag that routes a stored design_config to CelebrationCinema, the same
   way `_cinema` routes a wedding to WeddingCinema. Keeping the flag and
   the kind in one field means they cannot disagree: there is no state
   where the invitation is "premium but of no kind", which is what a
   separate boolean would eventually produce.

   Three of these kinds — birthday, naming, housewarming — have their own
   hand-built visual theme in components/celebration/themes.js: their own
   opening animation, their own drawn ornaments, their own voice. Every
   other kind still renders through the same premium, animated engine —
   it borrows the shared "celebration" theme (also in themes.js) rather
   than a bespoke one, because a genuinely new visual identity is design
   work, not something a chat conversation can produce at request time.
   The result is still a real, moving, occasion-aware invitation for
   anything; it is just not yet a fourth bespoke look.

   The wedding schema models a couple. This one models an honouree — one
   person (or two, for twins or a couple opening a new home) whom the
   event is FOR, and a set of hosts who are inviting you. That
   distinction is the whole reason this is not the wedding schema with
   the field names changed.
   ══════════════════════════════════════════════════════════════════════ */

/* The three kinds with a bespoke theme. Everything else is still a
   perfectly valid celebration — see themeFor() in
   components/celebration/themes.js, which falls back to the shared
   "celebration" theme rather than mislabelling a graduation as a
   birthday. */
export const CELEBRATION_KINDS = ["birthday", "naming", "housewarming"];

/* Normalise whatever kind we're given — from the model, from a landing
   page link, from a stored config — into a short, stable, lowercase
   slug. It no longer forces an unrecognised kind into "birthday": a
   retirement party should say "retirement" even while it borrows the
   shared theme's look, because the slug is also shown back to the host
   ("eventKind") and used to pick music (lib/music/tracks.js, which
   already falls back gracefully for an unknown kind). */
function asKind(k) {
  const s = String(k || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "celebration";
}

/* The seed palette for each kind. The theme layer
   (components/celebration/themes.js) may refine these — a first birthday
   is softened, a sixtieth is made grand — but every kind has a complete,
   contrasty palette from the very first render, before the AI has said
   anything at all. */
export const CELEBRATION_PALETTES = {
  /* Deep plum, amber, cream: warm and loud without going neon. */
  birthday: {
    primary: "#5a1b3d",
    secondary: "#a8385c",
    accent: "#f0a63c",
    paper: "#fff4e2",
    text: "#3a1226",
  },
  /* Powder blue, blush, ivory, a gentle gold. Nothing saturated: the
     scene is meant to read as hushed. */
  naming: {
    primary: "#4f7796",
    secondary: "#d99aa6",
    accent: "#d9c089",
    paper: "#fbf7f2",
    text: "#3c4a57",
  },
  /* Earthy green and terracotta over warm paper — the colours of a
     doorway, a courtyard and a lit diya. */
  housewarming: {
    primary: "#2f5d4a",
    secondary: "#b45a35",
    accent: "#c2913f",
    paper: "#faf1e3",
    text: "#33291f",
  },
  /* Every occasion that isn't one of the three above — an engagement, a
     graduation, a retirement, a product launch, a reunion, or anything
     else. Deep ink and warm gold over ivory: elegant and a little
     formal, so the very first render — before the AI has said anything
     — already looks premium regardless of what's actually being
     celebrated. In practice this is almost always overridden within a
     turn or two, once the AI writes a palette suited to what was
     described (see CELEBRATION_SCHEMA.palette below). */
  celebration: {
    primary: "#2b2320",
    secondary: "#6b4a3a",
    accent: "#c9a24b",
    paper: "#faf6ee",
    text: "#2b2320",
  },
};

/* Default / seed data. The AI interview fills real values as the
   conversation progresses; the renderer always has something to show.

   Every text field starts empty on purpose. The tempting thing is to
   seed a friendly kicker here, but then the renderer cannot tell "the
   host has not answered yet" from "the host chose these words", and the
   scene-gating that keeps empty shells off the page stops working. The
   warm defaults live in the theme's `voice`, where they are applied at
   render time and never written back into the data. */
export function emptyCelebrationTokens(kind) {
  const k = asKind(kind);
  return {
    /* The kind, and the flag. See the note at the head of this file. */
    _premium: k,
    eventKind: k,
    designed: true,

    host: {
      name: "",          // the person the event is for: "Aarav", "Ananya"
      secondName: "",    // optional second honouree (twins, a couple hosting)
      age: "",           // "7th", "60th" — a string, not a number
      role: "",          // "the birthday boy", "our little one", "the new home"
      intro: "",         // one warm line about them
      secondIntro: "",
      hosts: "",         // "Priya and Karan Mehta", the people inviting
    },

    invitation: {
      kicker: "",        // small line above the headline
      headline: "",
      displayDate: "",   // "6 February 2027"
      countdownAt: "",   // ISO "2027-02-06T18:30"
      message: "",       // the invitation paragraph
      blessingLine: "",  // an invocation or a wish at the head of the card
      thankYouNote: "",
    },

    venue: {
      name: "",
      address: "",
      city: "",
      country: "India",
      /* `mapQuery` is a search string we build; `mapLink` is a Google Maps
         URL the host pastes. The link wins when both exist — a pasted
         link is the exact pin, a query is a guess at it. */
      mapQuery: "",
      mapLink: "",
      description: "",
      parking: "",
      nearestTransport: "",
      directions: "",
    },

    /* [{ id, name, date, time, venue, address, theme, dressCode, note }] */
    events: [],
    /* [{ id, title, body }] */
    story: [],

    media: {
      heroImageUrl: null,
      heroVideoUrl: null,
      /* The photographs beside the story chapters, in chapter order.
         storyImages[0] doubles as the honouree's portrait. */
      storyImages: [],
      galleryImages: [],
      /* The photograph behind the closing thank-you. */
      closingImage: null,
    },

    social: {
      hashtag: "",
      /* Instagram handle without the @, so the share button can deep-link
         into the app. */
      instagram: "",
    },

    rsvp: {
      enabled: true,
      deadline: "",
      /* Shown above the stepper the guest page renders. */
      note: "",
    },

    palette: { ...(CELEBRATION_PALETTES[k] || CELEBRATION_PALETTES.celebration) },
  };
}

/* A value the model actually supplied. Structured output makes the model
   emit every required key on every turn, so a field it does not yet know
   comes back as "" — and a plain spread would then overwrite the child's
   name with an empty string on the turn after we captured it. Only real
   values are allowed to land. */
const supplied = (v) =>
  v !== undefined &&
  v !== null &&
  !(typeof v === "string" && v.trim() === "") &&
  /* An empty array is the same kind of nothing, and `media` is merged
     through here — a model that emitted `galleryImages: []` on a later
     turn would otherwise erase photographs the host had uploaded. */
  !(Array.isArray(v) && v.length === 0);

/* A stable key for one programme item or story chapter, so a second
   mention of the cake-cutting updates the existing card instead of
   adding a duplicate. */
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

/* Merge a partial patch (from the AI, or from the photo uploader) into
   the current celebration tokens. */
export function patchCelebrationTokens(current, patch) {
  if (!patch) return current;
  const next = { ...current };

  /* The kind is sticky. A patch may correct it — the interview can
     discover on turn three that the "birthday" is really a first-birthday
     naming ceremony — but a patch that simply omits it must not be able
     to blank the flag, because a blanked flag routes the finished
     invitation back to the plain token renderer and the host loses the
     template they designed. */
  /* `kept` used to only remember one of the three bespoke kinds, so an
     already-established freeform kind ("graduation", "retirement") reset
     to the generic "celebration" slug the moment a later turn's reply
     omitted `eventKind` — which structured output does constantly, since
     the model only has to repeat a field when it changed. Any kind we
     have already accepted, bespoke or not, is sticky now. */
  const patched = asKind(patch._premium || patch.eventKind);
  const kept = current?._premium || null;
  next._premium = supplied(patch._premium) || supplied(patch.eventKind) ? patched : kept || patched;
  next.eventKind = next._premium;
  next.designed = true;

  // Merge nested objects, ignoring blanks (see `supplied` above).
  for (const key of ["host", "invitation", "venue", "social", "rsvp", "palette", "media"]) {
    if (patch[key] && typeof patch[key] === "object") {
      const clean = Object.fromEntries(Object.entries(patch[key]).filter(([, v]) => supplied(v)));
      next[key] = { ...(current?.[key] || {}), ...clean };
    }
  }

  /* Programme items and story chapters MERGE rather than replace. The
     wedding template shipped these as a wholesale overwrite, and the turn
     where the family added the cake-cutting could drop the mehndi they
     had given two turns earlier — the model only has to forget one entry
     once for a function to vanish from the timeline for good. */
  if (Array.isArray(patch.events) && patch.events.length) {
    next.events = mergeCards(current?.events, patch.events);
  }
  if (Array.isArray(patch.story) && patch.story.length) {
    next.story = mergeCards(current?.story, patch.story);
  }

  /* Photos are uploaded by the client, not written by the model, so the
     client's array is authoritative when it sends one. Merging these the
     way the text fields merge would let a stale model turn reorder a
     gallery the host had just rearranged. */
  if (Array.isArray(patch.media?.galleryImages) && patch.media.galleryImages.length) {
    next.media = { ...(next.media || {}), galleryImages: patch.media.galleryImages };
  }
  if (Array.isArray(patch.media?.storyImages) && patch.media.storyImages.length) {
    next.media = { ...(next.media || {}), storyImages: patch.media.storyImages };
  }

  return next;
}

/* Does this token object represent a premium celebration invitation? */
export function isCelebration(tokens) {
  return Boolean(tokens?._premium);
}

/* Which of the three it is — or null, so a caller can tell "not a
   celebration" from "a celebration of an unknown kind" without reading
   the flag twice. */
export function celebrationKind(tokens) {
  return tokens?._premium || null;
}

/* Progress: how complete is the celebration data? 0–100 */
export function celebrationProgress(tokens) {
  if (!tokens) return 0;
  const checks = [
    Boolean(tokens.host?.name),
    Boolean(tokens.host?.hosts),
    Boolean(tokens.invitation?.displayDate),
    Boolean(tokens.invitation?.message),
    Boolean(tokens.venue?.name),
    Boolean(tokens.events?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* The structured-output schema the AI returns on each turn. It mirrors
   the token shape exactly; anything renamed here and not there lands in
   the patch, fails `supplied`'s sibling checks silently, and shows up as
   a field that never fills no matter what the host types. */
export const CELEBRATION_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "One or two warm sentences acknowledging what they just said." },
    askNext: { type: "string", description: "The single next question. Empty when done." },
    done: { type: "boolean", description: "True when enough to publish." },
    eventKind: {
      type: "string",
      description:
        "A short, lowercase, hyphenated slug for what's being celebrated. Use " +
        "'birthday', 'naming' or 'housewarming' when it truly is one of those " +
        "— otherwise invent a short, sensible one of your own (e.g. " +
        "'engagement', 'graduation', 'retirement', 'product-launch', " +
        "'reunion', 'anniversary-party', 'farewell'). Never leave it empty.",
    },

    host: {
      type: "object",
      properties: {
        name:        { type: "string", description: "The person the event is for, e.g. 'Aarav'." },
        secondName:  { type: "string", description: "A second honouree — a twin, or the other partner opening the home." },
        age:         { type: "string", description: "An ordinal string, e.g. '7th' or '60th'. Empty when not a birthday." },
        role:        { type: "string", description: "What this person or event is to the occasion, phrased naturally for whatever is being celebrated — e.g. 'the birthday boy', 'our little one', 'our new home', 'the graduate', 'the guest of honour'." },
        intro:       { type: "string", description: "One warm line about them." },
        secondIntro: { type: "string" },
        hosts:       { type: "string", description: "The people inviting, e.g. 'Priya and Karan Mehta'." },
      },
    },
    invitation: {
      type: "object",
      properties: {
        kicker:       { type: "string", description: "Small line above the headline." },
        headline:     { type: "string" },
        displayDate:  { type: "string", description: "Human-readable date, e.g. '6 February 2027'." },
        countdownAt:  { type: "string", description: "ISO datetime for the countdown, e.g. '2027-02-06T18:30'." },
        message:      { type: "string", description: "The invitation prose paragraph." },
        blessingLine: { type: "string", description: "An invocation or wish at the head of the card." },
        thankYouNote: { type: "string", description: "The thank-you at the foot of the page." },
      },
    },
    venue: {
      type: "object",
      properties: {
        name:             { type: "string" },
        address:          { type: "string" },
        city:             { type: "string" },
        country:          { type: "string" },
        mapQuery:         { type: "string", description: "Google Maps search query." },
        mapLink:          { type: "string", description: "A Google Maps URL the host pasted. Store it exactly as given." },
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
          id:        { type: "string" },
          name:      { type: "string" },
          date:      { type: "string", description: "YYYY-MM-DD" },
          time:      { type: "string", description: "HH:MM" },
          venue:     { type: "string" },
          address:   { type: "string" },
          theme:     { type: "string", description: "e.g. 'Sunshine Yellow', 'Marigold & Brass'." },
          dressCode: { type: "string" },
          note:      { type: "string" },
        },
      },
    },
    story: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id:    { type: "string" },
          title: { type: "string" },
          body:  { type: "string" },
        },
      },
    },
    social: {
      type: "object",
      properties: {
        hashtag:   { type: "string", description: "Without the #." },
        instagram: { type: "string", description: "Handle without the @." },
      },
    },
    rsvp: {
      type: "object",
      properties: {
        enabled:  { type: "boolean" },
        deadline: { type: "string" },
        note:     { type: "string", description: "One line above the RSVP stepper." },
      },
    },
    palette: {
      type: "object",
      properties: {
        primary:   { type: "string", description: "Hex, e.g. '#5a1b3d'." },
        secondary: { type: "string" },
        accent:    { type: "string" },
        paper:     { type: "string" },
        text:      { type: "string" },
      },
    },
  },
  /* `host` and `invitation` are required for the same reason the wedding
     schema requires `couple`: with only `reply` required the model will
     happily hold a warm conversation and return no data at all, and the
     invitation publishes with the child's name empty. Requiring the
     objects forces it to carry the page's data on every turn; blank
     fields inside them are dropped by patchCelebrationTokens rather than
     overwriting what we know.

     `askNext` is required for the same reason: left optional, the model
     omits it, the client shows a warm sentence and an empty box, and the
     interview dies on turn one. */
  required: ["reply", "askNext", "eventKind", "host", "invitation"],
};
