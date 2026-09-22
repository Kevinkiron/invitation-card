/* ══════════════════════════════════════════════════════════════
   EVENT TYPE REGISTRY

   Each event type declares the slots the AI interview must fill. The
   endpoint feeds the model the remaining slots and the model asks
   about them conversationally, one at a time.

   The registry is also the allow-list: the model may only write keys
   declared here, which is what stops it inventing fields the renderer
   cannot draw. In practice that allow-list only ever bound the wedding
   flow — every occasion below routes through Celebration Cinema
   (lib/ai/celebration-prompt.js), whose freeform interview is not driven
   by these `slots` at all, so they are kept here for shape and
   documentation rather than enforced. `label`/`blurb`/`eyebrow` are the
   only fields anything actually reads (the starter chips on /create and
   the "37% · Birthday" progress line).

   Scope note — this used to say "weddings and engagements first" because
   birthday, housewarming and naming ceremony had no template of their
   own yet. They do now, and typing any of them free-form already worked
   — the only thing missing was a starter button for it, same as
   "Wedding" and "Engagement" already had. That is what the entries below
   add: no new capability, just no longer making someone guess the right
   word to type. */

const COMMON = [
  { id: "primaryDate", label: "Date", type: "date", required: true, hint: "The main day the invitation is for." },
  { id: "primaryTime", label: "Start time", type: "time", required: true, hint: "When guests should arrive." },
  { id: "venueName", label: "Venue", type: "text", required: true, hint: "Name of the place." },
  { id: "venueAddress", label: "Address", type: "text", required: true, hint: "Street, area and city." },
  { id: "hosts", label: "Hosted by", type: "text", required: false, hint: "Whose names appear as hosts." },
  { id: "dressCode", label: "Dress code", type: "text", required: false, hint: "Guidance on what to wear." },
  { id: "rsvpDeadline", label: "RSVP by", type: "date", required: false, hint: "Last date to reply." },
  { id: "note", label: "A note to guests", type: "textarea", required: false, hint: "Something warm to open with." },
];

export const EVENT_TYPES = {
  wedding: {
    id: "wedding",
    label: "Wedding",
    blurb: "The main ceremony, with as many surrounding functions as you like.",
    eyebrow: "The wedding of",
    slots: [
      { id: "celebrants", label: "Couple's names", type: "names", required: true, hint: "Both first names." },
      ...COMMON,
      { id: "subEvents", label: "Other functions", type: "list", required: false, hint: "Mehendi, sangeet, reception, homecoming — each with its own date, time and venue." },
      { id: "story", label: "Your story", type: "textarea", required: false, hint: "How you met, in a few sentences." },
      { id: "parentsA", label: "Parents of the first person", type: "text", required: false },
      { id: "parentsB", label: "Parents of the second person", type: "text", required: false },
      { id: "hashtag", label: "Wedding hashtag", type: "text", required: false },
    ],
  },

  engagement: {
    id: "engagement",
    label: "Engagement",
    blurb: "A roka, sagai or engagement party.",
    eyebrow: "The engagement of",
    slots: [
      { id: "celebrants", label: "Couple's names", type: "names", required: true, hint: "Both first names." },
      ...COMMON,
      { id: "story", label: "The proposal", type: "textarea", required: false, hint: "How it happened." },
      { id: "parentsA", label: "Parents of the first person", type: "text", required: false },
      { id: "parentsB", label: "Parents of the second person", type: "text", required: false },
      { id: "hashtag", label: "Hashtag", type: "text", required: false },
    ],
  },

  /* Every entry from here down is Celebration Cinema territory — kind
     slugs are chosen to match lib/ai/classify.js's RULES exactly, so
     clicking the chip and typing the same word by hand land on the
     identical occasion and the same progress-line label. */
  birthday: {
    id: "birthday",
    label: "Birthday",
    blurb: "A birthday party, any age, any scale.",
    eyebrow: "A birthday for",
    slots: [{ id: "honouree", label: "Whose birthday", type: "text", required: true }, ...COMMON],
  },
  anniversary: {
    id: "anniversary",
    label: "Anniversary",
    blurb: "A wedding anniversary, silver or golden jubilee.",
    eyebrow: "Celebrating",
    slots: [{ id: "celebrants", label: "Names", type: "names", required: true }, ...COMMON],
  },
  naming: {
    id: "naming",
    label: "Naming Ceremony",
    blurb: "Namkaran, christening, or any naming or cradle ceremony.",
    eyebrow: "The naming of",
    slots: [{ id: "honouree", label: "Baby's name", type: "text", required: false }, ...COMMON],
  },
  housewarming: {
    id: "housewarming",
    label: "Housewarming",
    blurb: "Griha pravesh, or moving into a new home.",
    eyebrow: "Welcome to",
    slots: [...COMMON],
  },
  shower: {
    id: "shower",
    label: "Baby / Bridal Shower",
    blurb: "A baby shower, bridal shower, or godh bharai.",
    eyebrow: "A shower for",
    slots: [{ id: "honouree", label: "Guest of honour", type: "text", required: false }, ...COMMON],
  },
  graduation: {
    id: "graduation",
    label: "Graduation",
    blurb: "A convocation or graduation celebration.",
    eyebrow: "Congratulations to",
    slots: [{ id: "honouree", label: "Graduate's name", type: "text", required: false }, ...COMMON],
  },
  retirement: {
    id: "retirement",
    label: "Retirement / Farewell",
    blurb: "A retirement, or a warm send-off.",
    eyebrow: "A farewell for",
    slots: [{ id: "honouree", label: "Guest of honour", type: "text", required: false }, ...COMMON],
  },
  reunion: {
    id: "reunion",
    label: "Reunion",
    blurb: "A family or friends get-together.",
    eyebrow: "A reunion for",
    slots: [...COMMON],
  },
};

export const EVENT_TYPE_LIST = Object.values(EVENT_TYPES);

export function getEventType(id) {
  return EVENT_TYPES[id] || null;
}

/* Every slot id the model is permitted to write. */
export function allowedSlotIds(eventTypeId) {
  return getEventType(eventTypeId)?.slots.map((s) => s.id) ?? [];
}

export function isEmpty(v) {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/* Required slots still empty — drives the model's next question and
   the progress meter, and gates `done`. */
export function missingRequired(eventTypeId, draft = {}) {
  const et = getEventType(eventTypeId);
  if (!et) return [];
  return et.slots.filter((s) => s.required && isEmpty(draft[s.id])).map((s) => s.id);
}

export function slotById(eventTypeId, slotId) {
  return getEventType(eventTypeId)?.slots.find((s) => s.id === slotId) ?? null;
}

/* 0..1 fraction of required slots filled. */
export function completeness(eventTypeId, draft = {}) {
  const et = getEventType(eventTypeId);
  if (!et) return 0;
  const req = et.slots.filter((s) => s.required);
  if (!req.length) return 1;
  return req.filter((s) => !isEmpty(draft[s.id])).length / req.length;
}
