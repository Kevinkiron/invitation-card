/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD DEMOS — invented senders and recipients for the cards
   shown on the homepage (components/HeroPhone.js) and at
   /demo/card/<occasion>. Same honesty rule as lib/demo/fixtures.js: the
   names are made up, and the message is the occasion's own default.
   ══════════════════════════════════════════════════════════════════════ */
import { getOccasion } from "@/lib/greetings/occasions";
import { emptyGreetingTokens } from "@/lib/design/greeting-tokens";

export const CARD_DEMOS = [
  { occasion: "christmas",     to: "Anna",   from: "Rahul & Meera" },
  { occasion: "diwali",        to: "Nani",   from: "Aarav" },
  { occasion: "eid",           to: "Ayesha", from: "Imran" },
  { occasion: "birthday-wish", to: "Priya",  from: "Kiran" },
  { occasion: "onam",          to: "Achan",  from: "Devika" },
];

export function cardDemo(slug) {
  const d = CARD_DEMOS.find((c) => c.occasion === slug);
  const o = getOccasion(slug);
  if (!d || !o) return null;
  return {
    ...d,
    name: o.name,
    accent: o.palette?.accent || "#c69a55",
    tokens: { ...emptyGreetingTokens(o), to: d.to, from: d.from },
  };
}
