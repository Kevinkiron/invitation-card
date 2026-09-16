/* ══════════════════════════════════════════════════════════════════════
   DEMO INVITATIONS

   Four fully-filled invitations with invented names, rendered by exactly
   the same components a customer's invitation is rendered by. That is
   the whole point: the landing page is not showing screenshots of a
   design, it is showing the product running. If a template regresses,
   the landing page regresses with it, which is the correct and useful
   outcome.

   Because these go through `TemplateRenderer`, each one is shaped as a
   stored `design_config` — `{ v: 2, tokens, eventKind }` — not as a
   loose token bag. A demo that stopped matching the stored shape would
   look fine here and prove nothing about the real thing.

   THE NAMES ARE INVENTED and the events never happened. Nothing here
   should be presented as a real customer, a real testimonial or a real
   wedding; the landing page labels these as demonstrations.
   ══════════════════════════════════════════════════════════════════════ */

import { emptyWeddingTokens } from "@/lib/design/wedding-tokens";
import { emptyCelebrationTokens } from "@/lib/design/celebration-tokens";
import { photo } from "@/lib/demo/photos";

/* A date far enough ahead that the countdown always has something to
   count. Computed rather than written down, so the demos do not quietly
   start advertising a date in the past six months from now — which is
   exactly what a hardcoded "6 February 2027" would do. */
function futureDate(monthsAhead, day, hour = 18, minute = 30) {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() + monthsAhead, day, hour, minute);
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const pad = (n) => String(n).padStart(2, "0");
  return {
    displayDate: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    countdownAt: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}`,
    iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  };
}

/* ── 1. Wedding ─────────────────────────────────────────────────────── */
function weddingDemo() {
  const when = futureDate(7, 6, 18, 30);
  const t = emptyWeddingTokens();

  t._cinema = true;
  t.designed = true;
  t.eventKind = "wedding";

  t.couple = {
    ...t.couple,
    bride: "Meera",
    groom: "Rohan",
    brideFullName: "Meera Nandini Mehra",
    groomFullName: "Rohan Aditya Kapoor",
    hosts: "the Mehra and Kapoor families",
    blessingLine: "With the blessings of our families",
    brideIntro: "A paediatrician who still laughs at her own jokes before the punchline.",
    groomIntro: "Builds bridges for a living, burns toast for a hobby.",
  };

  t.invitation = {
    ...t.invitation,
    kicker: "Together With Their Families",
    headline: "A celebration of love, music and forever",
    message:
      "Three days of colour, noise and far too much food, at a palace that has " +
      "seen a hundred years of them. Come early, stay late, dance badly.",
    displayDate: when.displayDate,
    countdownAt: when.countdownAt,
    religion: "hindu",
    deityLine: "Shree Ganeshaya Namah",
    closingMessage: "Where there is love, there is life.",
    thankYouNote:
      "Thank you for making the journey, and for every year of friendship that " +
      "led to this one. We cannot wait to see your faces.",
  };

  t.venue = {
    ...t.venue,
    name: "Taj Falaknuma Palace",
    address: "Engine Bowli, Falaknuma",
    city: "Hyderabad",
    state: "Telangana",
    mapQuery: "Taj Falaknuma Palace Hyderabad",
    description:
      "A hilltop palace above the old city, reached by a drive that climbs " +
      "through the gates and does not stop climbing.",
    parking: "Valet parking at the lower gate; buggies run up to the porch.",
    nearestTransport: "Rajiv Gandhi International Airport, about 40 minutes away.",
  };

  t.events = [
    { id: "haldi", name: "Haldi", date: when.iso, time: "10:00", venue: "The Mehra House",
      address: "Banjara Hills, Hyderabad", theme: "Haldi Yellow",
      dressCode: "Yellow, ivory or floral", note: "Wear something you do not mind ruining." },
    { id: "mehendi", name: "Mehendi", date: when.iso, time: "16:00", venue: "The Mehra House",
      address: "Banjara Hills, Hyderabad", theme: "Mehendi Green",
      dressCode: "Greens and soft pastels", note: "Artists from four in the afternoon." },
    { id: "sangeet", name: "Sangeet", date: when.iso, time: "19:30", venue: "Durbar Hall",
      address: "Taj Falaknuma Palace", theme: "Sangeet Indigo & Silver",
      dressCode: "Festive Indian", note: "Rehearsals have been happening. You have been warned." },
    { id: "ceremony", name: "Wedding Ceremony", date: when.iso, time: "18:30", venue: "The Palace Courtyard",
      address: "Taj Falaknuma Palace", theme: "Royal Maroon & Gold",
      dressCode: "Indian festive luxury", note: "Muhurat at half past six." },
    { id: "reception", name: "Reception", date: when.iso, time: "20:00", venue: "The Palace Lawn",
      address: "Taj Falaknuma Palace", theme: "Emerald & Gold",
      dressCode: "Cocktail or Indo-western", note: "Dinner under the lights." },
  ];

  t.story = [
    { id: "met", title: "A moment we keep",
      body: "They met at somebody else's wedding in Jaipur, in a queue for the " +
            "same plate of food, and argued about it for twenty minutes." },
    { id: "proposal", title: "The one we retell",
      body: "He proposed on a terrace in the rain, having practised the speech " +
            "for a fortnight and forgotten all of it." },
    { id: "now", title: "Forever begins",
      body: "Two cities, one dog, and a shared conviction that the other one " +
            "makes the better tea." },
  ];

  t.media = {
    ...t.media,
    heroImageUrl: photo("wedding-01.jpg"),
    storyImages: [photo("wedding-03.jpg"), photo("wedding-02.jpg"), photo("wedding-04.jpg")],
    galleryImages: [
      photo("wedding-05.jpg"), photo("wedding-06.jpg"), photo("wedding-07.jpg"),
      photo("wedding-08.jpg"), photo("wedding-09.jpg"),
    ],
    closingImage: photo("wedding-10.jpg"),
  };

  t.social = { hashtag: "MeeraAndRohan", instagram: "meera.and.rohan" };
  t.rsvp = {
    enabled: true,
    deadline: "20 January",
    note: "Let us know before the twentieth so the caterers can stop asking.",
  };

  return t;
}

/* ── 2. Birthday ────────────────────────────────────────────────────── */
function birthdayDemo() {
  const when = futureDate(3, 14, 16, 0);
  const t = emptyCelebrationTokens("birthday");

  t.host = {
    ...t.host,
    name: "Aarav",
    age: "7th",
    role: "the birthday boy",
    intro:
      "Seven years old, knows the name of every dinosaur that ever lived, and " +
      "will tell you all of them if you let him.",
    hosts: "Priya and Karan Mehta",
  };

  t.invitation = {
    ...t.invitation,
    kicker: "You are invited to",
    headline: "Aarav turns seven",
    blessingLine: "Many happy returns",
    message:
      "Cake at five, chaos from four. Bring nothing but an appetite — and " +
      "possibly a change of clothes.",
    displayDate: when.displayDate,
    countdownAt: when.countdownAt,
    thankYouNote:
      "Thank you for coming, for the noise, and for every single person who " +
      "pretended to be surprised by the dinosaur cake.",
  };

  t.venue = {
    ...t.venue,
    name: "The Garden House",
    address: "14 Rose Lane, Indiranagar",
    city: "Bengaluru",
    mapQuery: "Indiranagar Bengaluru",
    description: "A garden, a trampoline and enough space to run in circles.",
    parking: "Street parking along Rose Lane.",
  };

  t.events = [
    { id: "games", name: "Games in the garden", date: when.iso, time: "16:00",
      venue: "The Garden House", theme: "Sunshine", dressCode: "Play clothes",
      note: "Treasure hunt starts sharp — he has hidden things himself." },
    { id: "cake", name: "Cake and candles", date: when.iso, time: "17:00",
      venue: "The Garden House", theme: "Amber", dressCode: "",
      note: "Seven candles, one enormous breath." },
    { id: "film", name: "Films on the lawn", date: when.iso, time: "18:30",
      venue: "The Garden House", theme: "Dusk", dressCode: "Something warm",
      note: "Blankets provided. Dinosaurs, obviously." },
  ];

  t.story = [
    { id: "born", title: "Seven years ago",
      body: "He arrived three weeks early and has been in a hurry ever since." },
    { id: "dinos", title: "The dinosaur year",
      body: "It started with one plastic stegosaurus and has not stopped." },
  ];

  t.media = {
    ...t.media,
    heroImageUrl: photo("birthday-01.jpg"),
    storyImages: [photo("birthday-08.jpg"), photo("birthday-07.jpg")],
    galleryImages: [
      photo("birthday-02.jpg"), photo("birthday-03.jpg"),
      photo("birthday-05.jpg"), photo("birthday-06.jpg"),
    ],
    closingImage: photo("birthday-04.jpg"),
  };

  t.social = { hashtag: "AaravIsSeven", instagram: "" };
  t.rsvp = {
    enabled: true,
    deadline: "the 8th",
    note: "A quick yes or no by the eighth helps enormously with the cake.",
  };

  return t;
}

/* ── 3. Naming ceremony ─────────────────────────────────────────────── */
function namingDemo() {
  const when = futureDate(2, 22, 10, 30);
  const t = emptyCelebrationTokens("naming");

  t.host = {
    ...t.host,
    name: "Ananya",
    role: "our little one",
    intro:
      "Eleven weeks old. Sleeps through thunderstorms, wakes at the sound of " +
      "a kettle.",
    hosts: "Sneha and Vikram Iyer",
  };

  t.invitation = {
    ...t.invitation,
    kicker: "With joy, we invite you to the naming of",
    headline: "Ananya",
    blessingLine: "May she be given a name, and may it be a blessing",
    message:
      "A morning of prayers, a cradle, and a name said aloud for the first " +
      "time. Breakfast afterwards, for as long as anyone wants to stay.",
    displayDate: when.displayDate,
    countdownAt: when.countdownAt,
    thankYouNote:
      "Thank you for standing with us while she was given her name. She will " +
      "grow up knowing who was in the room.",
  };

  t.venue = {
    ...t.venue,
    name: "The Iyer Residence",
    address: "Flat 4, Sunbeam Apartments, Adyar",
    city: "Chennai",
    mapQuery: "Adyar Chennai",
    description: "Home, with the furniture moved and the good lamps out.",
    parking: "Visitor parking in the basement.",
  };

  t.events = [
    { id: "puja", name: "Naamkaran Puja", date: when.iso, time: "10:30",
      venue: "The Iyer Residence", theme: "Ivory", dressCode: "Traditional, soft colours",
      note: "Please arrive a little before — the muhurat is exact." },
    { id: "cradle", name: "The cradle ceremony", date: when.iso, time: "11:30",
      venue: "The Iyer Residence", theme: "Blush", dressCode: "",
      note: "Her name, said aloud, for the first time." },
    { id: "lunch", name: "Lunch", date: when.iso, time: "12:30",
      venue: "The Iyer Residence", theme: "Powder Blue", dressCode: "",
      note: "Sit down, stay a while." },
  ];

  t.story = [
    { id: "wait", title: "The long wait",
      body: "Nine months of arguing gently about names, and settling on one in " +
            "the first ten minutes of meeting her." },
    { id: "name", title: "Why Ananya",
      body: "It means unique, without equal. Her grandmother suggested it, and " +
            "nobody could improve on it." },
  ];

  t.media = {
    ...t.media,
    heroImageUrl: photo("naming-01.jpg"),
    storyImages: [photo("naming-03.jpg"), photo("naming-02.jpg")],
    galleryImages: [
      photo("naming-05.jpg"), photo("naming-07.jpg"),
      photo("naming-08.jpg"), photo("naming-06.jpg"),
    ],
    closingImage: photo("naming-04.jpg"),
  };

  t.social = { hashtag: "WelcomeAnanya", instagram: "" };
  t.rsvp = {
    enabled: true,
    deadline: "a week before",
    note: "A note either way by the week before, so we can count the chairs.",
  };

  return t;
}

/* ── 4. Housewarming ────────────────────────────────────────────────── */
function housewarmingDemo() {
  const when = futureDate(1, 9, 11, 0);
  const t = emptyCelebrationTokens("housewarming");

  t.host = {
    ...t.host,
    name: "Number Eleven",
    role: "our new home",
    intro:
      "Four years of saving, eight months of dust, and a kitchen window that " +
      "gets the morning light.",
    hosts: "Nisha and Arjun Rao",
  };

  t.invitation = {
    ...t.invitation,
    kicker: "Griha Pravesh",
    headline: "Come and see the new place",
    blessingLine: "May this threshold know only good news",
    message:
      "The puja is at eleven, the doors open before it, and lunch happens " +
      "whenever the last person arrives. Come and put your feet up.",
    displayDate: when.displayDate,
    countdownAt: when.countdownAt,
    thankYouNote:
      "Thank you for filling the rooms before we had even finished unpacking " +
      "them. It is a home now, and that is your doing.",
  };

  t.venue = {
    ...t.venue,
    name: "11 Champa Road",
    address: "Off Baner Road, Balewadi",
    city: "Pune",
    mapQuery: "Balewadi Pune",
    description: "Second floor, the one with the yellow door and too many plants.",
    parking: "Covered parking on the ground floor; take any free bay.",
    nearestTransport: "Balewadi Stadium, a ten minute walk.",
  };

  t.events = [
    { id: "puja", name: "Griha Pravesh Puja", date: when.iso, time: "11:00",
      venue: "11 Champa Road", theme: "Terracotta", dressCode: "Traditional",
      note: "Milk boils over at eleven. Please be in before then." },
    { id: "lunch", name: "Lunch", date: when.iso, time: "13:00",
      venue: "11 Champa Road", theme: "Marigold", dressCode: "",
      note: "Home cooking, far too much of it." },
    { id: "evening", name: "Open house", date: when.iso, time: "17:00",
      venue: "11 Champa Road", theme: "Deep Green", dressCode: "Comfortable",
      note: "Drop in any time until late." },
  ];

  t.story = [
    { id: "keys", title: "The keys",
      body: "Handed over on a Tuesday afternoon in an empty corridor that " +
            "echoed. We sat on the floor and ate chips." },
    { id: "work", title: "Eight months of dust",
      body: "Everything took twice as long as anyone said it would, and the " +
            "yellow door was worth all of it." },
  ];

  t.media = {
    ...t.media,
    heroImageUrl: photo("house-01.jpg"),
    storyImages: [photo("house-03.jpg"), photo("house-02.jpg")],
    galleryImages: [
      photo("house-05.jpg"), photo("house-06.jpg"),
      photo("house-07.jpg"), photo("house-04.jpg"),
    ],
    closingImage: photo("house-04.jpg"),
  };

  t.social = { hashtag: "ElevenChampaRoad", instagram: "" };
  t.rsvp = {
    enabled: true,
    deadline: "the 5th",
    note: "Tell us by the fifth roughly when you will come, and we will keep food back.",
  };

  return t;
}

/* ── The list the landing page maps over ────────────────────────────── */

/* `cfg` is the stored shape, so `<TemplateRenderer cfg={demo.cfg} />`
   draws it exactly as a published invitation is drawn. */
export const DEMOS = [
  {
    slug: "wedding",
    label: "Wedding",
    kind: "wedding",
    names: "Meera & Rohan",
    blurb: "A cinematic wedding, with every function on one timeline.",
    accent: "#B8405E",
    href: "/demo/wedding",
    cfg: { v: 2, tokens: weddingDemo(), eventKind: "wedding" },
  },
  {
    slug: "birthday",
    label: "Birthday",
    kind: "birthday",
    names: "Aarav is seven",
    blurb: "Candles, confetti and a running order for the afternoon.",
    accent: "#9B59B6",
    href: "/demo/birthday",
    cfg: { v: 2, tokens: birthdayDemo(), eventKind: "birthday" },
  },
  {
    slug: "naming",
    label: "Naming Ceremony",
    kind: "naming",
    names: "Welcome, Ananya",
    blurb: "A quiet morning invitation, with the name kept until the reveal.",
    accent: "#E8A87C",
    href: "/demo/naming",
    cfg: { v: 2, tokens: namingDemo(), eventKind: "naming" },
  },
  {
    slug: "housewarming",
    label: "Housewarming",
    kind: "housewarming",
    names: "11 Champa Road",
    blurb: "A threshold that opens, a puja time, and directions that work.",
    accent: "#6B8E6B",
    href: "/demo/housewarming",
    cfg: { v: 2, tokens: housewarmingDemo(), eventKind: "housewarming" },
  },
];

export function demoBySlug(slug) {
  return DEMOS.find((d) => d.slug === slug) || null;
}
