/* ══════════════════════════════════════════════════════════════
   DRAFT  →  INVITATION DATA

   The interview fills a flat `draft` keyed by slot id. Templates
   consume the richer invitation shape. This module is the single
   translation between the two, so the live preview during the
   interview and the published invitation are guaranteed identical.
   ══════════════════════════════════════════════════════════════ */

import { DEMO_INVITATION } from "@/lib/demo-data";
import { getEventType } from "@/lib/ai/event-types";

export function emptyDraft(eventType) {
  return { eventType: eventType || null, celebrants: [], subEvents: [], gallery: [] };
}

/* Merge a model-produced patch into the draft. Arrays replace rather
   than concatenate so a correction ("actually only two functions")
   genuinely shrinks the list instead of appending forever. */
export function mergeDraft(draft, updates = {}) {
  const next = { ...draft };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    next[k] = v;
  }
  return next;
}

function splitNames(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());
  if (!value) return [];
  return String(value)
    .split(/\s*(?:&|\band\b|\+|,)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toISODate(d) {
  if (!d) return null;
  // Accept both "2026-12-20" and looser model output.
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function toClock(t) {
  if (!t) return null;
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = m[3]?.toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }
  return null;
}

/* Build the object the templates render. Anything the interview has
   not captured yet falls back to the sample invitation, so the phone
   preview always looks finished rather than half-empty. */
export function draftToInvitation(draft = {}, { guestName = null } = {}) {
  const et = getEventType(draft.eventType);
  const names = splitNames(draft.celebrants);
  const primary = names[0] || DEMO_INVITATION.groom.name;
  const secondary = names[1] || "";

  const date = toISODate(draft.primaryDate);
  const time = toClock(draft.primaryTime) || "16:30";

  const subEvents = Array.isArray(draft.subEvents) ? draft.subEvents : [];
  const events = subEvents.length
    ? subEvents
        .filter((e) => e && (e.name || e.venue))
        .map((e) => ({
          name: e.name || "Celebration",
          date: toISODate(e.date) || date || DEMO_INVITATION.events[0].date,
          time: toClock(e.time) || "18:00",
          venue: e.venue || draft.venueName || "",
          address: e.address || draft.venueAddress || "",
          note: e.note || "",
          icon: "rings",
        }))
    : date
      ? [{
          name: et?.label || "Celebration",
          date,
          time,
          venue: draft.venueName || "",
          address: draft.venueAddress || "",
          note: draft.note || "",
          icon: "rings",
        }]
      : DEMO_INVITATION.events;

  const gallery = Array.isArray(draft.gallery) && draft.gallery.length
    ? draft.gallery.map((g, i) => ({
        id: g.id ?? i,
        caption: g.caption || "",
        art: g.art || DEMO_INVITATION.gallery[i % DEMO_INVITATION.gallery.length].art,
        url: g.url || null,
        tall: i % 3 === 0,
      }))
    : DEMO_INVITATION.gallery;

  const storyBody = typeof draft.story === "string" ? draft.story : draft.story?.body;

  return {
    ...DEMO_INVITATION,

    /* Normalised list, ready for future single-celebrant event types.
       The five current templates still read groom/bride below, so
       nothing renders from this yet — it is written so the mapping
       does not have to change when birthdays are added. */
    celebrants: secondary ? [primary, secondary] : [primary],
    eyebrow: et?.eyebrow || DEMO_INVITATION.blessing,

    /* What the templates actually render today. */
    groom: { ...DEMO_INVITATION.groom, name: primary, parents: draft.parentsA || DEMO_INVITATION.groom.parents },
    bride: { ...DEMO_INVITATION.bride, name: secondary || primary, parents: draft.parentsB || DEMO_INVITATION.bride.parents },

    hosts: draft.hosts || "",
    blessing: draft.note || DEMO_INVITATION.blessing,
    intro: draft.note || DEMO_INVITATION.intro,
    hashtag: draft.hashtag || DEMO_INVITATION.hashtag,

    weddingDate: date ? `${date}T${time}` : DEMO_INVITATION.weddingDate,

    venue: {
      ...DEMO_INVITATION.venue,
      name: draft.venueName || DEMO_INVITATION.venue.name,
      address: draft.venueAddress || DEMO_INVITATION.venue.address,
      mapQuery: [draft.venueName, draft.venueAddress].filter(Boolean).join(", ") || DEMO_INVITATION.venue.mapQuery,
      directions: draft.directions || DEMO_INVITATION.venue.directions,
    },

    dressCode: draft.dressCode
      ? { title: draft.dressCode, note: draft.theme || "" }
      : DEMO_INVITATION.dressCode,

    story: storyBody
      ? { ...DEMO_INVITATION.story, title: draft.storyTitle || DEMO_INVITATION.story.title, body: storyBody }
      : DEMO_INVITATION.story,

    events,
    gallery,

    rsvp: {
      ...DEMO_INVITATION.rsvp,
      deadline: toISODate(draft.rsvpDeadline) || DEMO_INVITATION.rsvp.deadline,
    },

    guestName,
  };
}

/* The design_config persisted on the invitation row. Keeps the slug the
   renderer resolves plus enough of the draft to rebuild the preview. */
export function draftToConfig(draft, templateSlug) {
  const names = splitNames(draft.celebrants);
  return {
    template: templateSlug || draft.templateSlug || "ceylon-heritage",
    eventType: draft.eventType || null,
    headline: names.join(" & ") || "Our Celebration",
    subheadline: draft.note || "",
    draft,
  };
}
