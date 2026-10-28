/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD DEMOS — invented senders and recipients for the cards
   shown on the homepage (components/HeroPhone.js) and at
   /demo/card/<occasion>. Same honesty rule as lib/demo/fixtures.js: the
   names are made up, and the message is the occasion's own default.
   ══════════════════════════════════════════════════════════════════════ */
import { getOccasion } from "@/lib/greetings/occasions";
import { emptyGreetingTokens } from "@/lib/design/greeting-tokens";

export const CARD_DEMOS = [
  /* `photo` — the sender's own picture on the wish page, so the demos
     show what a card looks like with a photo in it (public/demo/, the
     same Unsplash-licensed set the demo invitations use). */
  { occasion: "christmas",     to: "Anna",   from: "Rahul & Meera", photo: "/demo/wedding-10.jpg" },
  { occasion: "diwali",        to: "Nani",   from: "Aarav",         photo: "/demo/birthday-04.jpg" },
  { occasion: "eid",           to: "Ayesha", from: "Imran" },
  { occasion: "birthday-wish", to: "Priya",  from: "Kiran",         photo: "/demo/birthday-05.jpg" },
  { occasion: "onam",          to: "Achan",  from: "Devika" },
];

export function cardDemo(slug) {
  const d = CARD_DEMOS.find((c) => c.occasion === slug);
  const o = getOccasion(slug);
  if (!d || !o) return null;
  const base = emptyGreetingTokens(o);
  return {
    ...d,
    name: o.name,
    accent: o.palette?.accent || "#c69a55",
    tokens: { ...base, to: d.to, from: d.from, media: { ...base.media, photoUrl: d.photo || null } },
  };
}
