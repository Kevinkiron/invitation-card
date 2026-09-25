import ChristmasScene from "./ChristmasScene";
import OnamScene from "./OnamScene";

/* ══════════════════════════════════════════════════════════════════════
   SCENE REGISTRY — occasion slug → an animated closed-cover scene.

   Most occasions still fall back to the generic parametric motif from
   lib/design/showcase.js (cardMotif) rendered as a static, faintly
   blended background — see components/GreetingCard.js. Only occasions
   with a real hand-built scene here get the fuller treatment (Kevin's
   call: build Christmas and Onam to a genuinely premium standard first,
   then extend this map occasion by occasion rather than spreading
   thinner effort across all of them at once).
   ══════════════════════════════════════════════════════════════════════ */
export const SCENES = {
  christmas: ChristmasScene,
  onam: OnamScene,
};

export function getScene(slug) {
  return SCENES[slug] || null;
}
