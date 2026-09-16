/* ══════════════════════════════════════════════════════════════
   EVENT TYPE REGISTRY

   Each event type declares the slots the AI interview must fill. The
   endpoint feeds the model the remaining slots and the model asks
   about them conversationally, one at a time.

   The registry is also the allow-list: the model may only write keys
   declared here, which is what stops it inventing fields the renderer
   cannot draw.

   Scope note — weddings and engagements first. Both are two-celebrant
   events, so the five existing templates fit without modification.
   Birthdays, housewarmings and naming ceremonies need their own
   templates before they can be added here.
   ══════════════════════════════════════════════════════════════ */

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
