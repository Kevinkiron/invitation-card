import ChristmasScene from "./ChristmasScene";
import OnamScene from "./OnamScene";
import GenericScene from "./GenericScene";

/* ══════════════════════════════════════════════════════════════════════
   SCENE REGISTRY — occasion slug → an animated closed-cover scene.

   Christmas and Onam have a real hand-built scene (Santa's sleigh past a
   shining star; a blooming pookalam and a gliding boat) — built to a
   genuinely premium standard first, per Kevin's original call, before
   spreading thinner effort across every occasion at once.

   Every other occasion now gets GenericScene — that occasion's own
   parametric motif (lib/design/showcase.js) with its Lottie animation
   (lib/greetings/lottie.js, via occasion.lottie) playing over it, rather
   than the flat, unanimated motif this registry used to fall back to.
   getScene() never returns null any more; every occasion's cover
   animates, some with a bespoke scene and the rest with GenericScene.
   ══════════════════════════════════════════════════════════════════════ */
export const SCENES = {
  christmas: ChristmasScene,
  onam: OnamScene,
};

export function getScene(slug) {
  return SCENES[slug] || GenericScene;
}
