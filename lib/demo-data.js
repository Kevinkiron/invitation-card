/* Demo wedding data used by the template gallery and the standalone
   template preview. Deliberately complete — every field a template can
   render is filled in with realistic content so a template never shows
   an empty shell or placeholder text in the gallery. */

export const DEMO_INVITATION = {
  bride: { name: "Sophia", full: "Sophia Fernando", parents: "Mr. & Mrs. Anton Fernando" },
  groom: { name: "Daniel", full: "Daniel Perera", parents: "Mr. & Mrs. Rohan Perera" },
  hashtag: "#SophiaAndDaniel",
  blessing: "With the blessings of our families, we invite you to share in the joy of our wedding day.",
  intro: "After seven years, two cities and countless cups of tea, we are getting married.",
  /* The primary date every countdown and date medallion reads from. */
  weddingDate: "2026-12-20T16:30:00",
  venue: {
    name: "The Grand Ballroom",
    address: "Galle Face Terrace, Colombo 03",
    city: "Colombo",
    directions: "Valet parking available from the Marine Drive entrance.",
    mapQuery: "Galle Face Terrace, Colombo",
  },
  dressCode: { title: "Black tie, garden ready", note: "Soft golds, deep greens and ivory. Flat heels for the lawn ceremony." },
  story: {
    title: "Two lives, one beautiful journey",
    body: "We met in a bookshop in Kandy, both reaching for the last copy of the same novel. Daniel let Sophia have it, on the condition that she tell him how it ended. She took four months to finish it, and he waited.",
    timeline: [
      { year: "2019", title: "The bookshop", text: "A shared novel, a borrowed pen, and a phone number on the back of a receipt." },
      { year: "2021", title: "The long way home", text: "Two cities, one very patient train timetable, and a standing Sunday phone call." },
      { year: "2024", title: "The question", text: "Asked at sunrise on the Ella rock trail, with the mist still sitting in the valley." },
      { year: "2026", title: "The beginning", text: "Everyone we love, in one room, at last." },
    ],
  },
  events: [
    { name: "Engagement", date: "2026-12-17", time: "18:30", venue: "Fernando Residence", address: "Ward Place, Colombo 07", note: "An intimate evening with close family.", icon: "ring" },
    { name: "Mehendi", date: "2026-12-18", time: "10:00", venue: "The Garden Pavilion", address: "Rajagiriya, Colombo", note: "Bring your brightest colours.", icon: "henna" },
    { name: "Wedding Ceremony", date: "2026-12-20", time: "16:30", venue: "The Grand Ballroom", address: "Galle Face Terrace, Colombo 03", note: "Poruwa ceremony begins promptly at 4:30.", icon: "rings" },
    { name: "Reception", date: "2026-12-20", time: "20:00", venue: "The Grand Ballroom Terrace", address: "Galle Face Terrace, Colombo 03", note: "Dinner, dancing and far too much cake.", icon: "glass" },
  ],
  /* Gallery entries are CSS-composed art directions, not photographs — the
     renderer paints each one from these tokens so nothing 404s and the
     grid still reads as a real photo wall. See components/invitation/parts. */
  gallery: [
    { id: 1, caption: "The bookshop, Kandy", art: "dawn", tall: true },
    { id: 2, caption: "Ella rock, sunrise", art: "mist" },
    { id: 3, caption: "Sunday calls", art: "amber" },
    { id: 4, caption: "The proposal", art: "rose", tall: true },
    { id: 5, caption: "Engagement, Colombo", art: "sage" },
    { id: 6, caption: "Us, last winter", art: "dusk" },
  ],
  party: [
    { role: "Maid of Honour", name: "Amara Fernando", note: "Sister of the bride" },
    { role: "Best Man", name: "Nuwan Perera", note: "Brother of the groom" },
    { role: "Bridesmaid", name: "Ishara Silva", note: "Friend since school" },
    { role: "Groomsman", name: "Kasun Jayawardena", note: "Friend since university" },
  ],
  gifts: {
    title: "Your presence is the gift",
    note: "If you would still like to mark the day, a contribution to our first home would mean a great deal.",
  },
  wishes: [
    { name: "Aunty Manel", text: "We have waited years for this day. Endless blessings to you both." },
    { name: "Ishara", text: "Still the best love story I know. See you on the dance floor." },
    { name: "Nuwan", text: "Finally! Congratulations to my brother and my new sister." },
  ],
  rsvp: { enabled: true, deadline: "2026-11-20", question: "Will you celebrate with us?" },
  music: { enabled: true, title: "Our first dance" },
};

/* Events shaped the way the existing wizard/DB pass them, so a template
   renders identically whether it is fed demo data or a real invitation. */
export const DEMO_EVENTS = DEMO_INVITATION.events.map((e) => ({
  name: e.name,
  event_date: e.date,
  event_time: e.time,
  venue: e.venue,
  address: e.address,
  note: e.note,
  icon: e.icon,
}));

/* Build the shape a template consumes from a saved invitation row. Keeps
   published/editor output identical to the gallery preview. */
export function invitationFromRecord({ config, events = [], guestName } = {}) {
  const headline = config?.headline || "";
  const [a, b] = String(headline).split(/\s*&\s*|\s+and\s+/i);
  const merged = {
    ...DEMO_INVITATION,
    bride: { ...DEMO_INVITATION.bride, name: (b || DEMO_INVITATION.bride.name).trim() },
    groom: { ...DEMO_INVITATION.groom, name: (a || DEMO_INVITATION.groom.name).trim() },
    blessing: config?.subheadline || DEMO_INVITATION.blessing,
    events: events.length
      ? events.map((e) => ({
          name: e.name,
          date: e.event_date,
          time: e.event_time,
          venue: e.venue,
          address: e.address,
          note: e.note || "",
          icon: e.icon || "rings",
        }))
      : DEMO_INVITATION.events,
  };
  const first = merged.events.find((e) => e.date);
  if (first?.date) merged.weddingDate = `${first.date}T${first.time || "16:30"}`;
  if (first?.venue) merged.venue = { ...merged.venue, name: first.venue, address: first.address || merged.venue.address };
  merged.guestName = guestName || null;
  return merged;
}
