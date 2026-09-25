import { cardMotif } from "@/lib/design/showcase";
import { getOccasion } from "@/lib/greetings/occasions";
import { getLottie } from "@/lib/greetings/lottie";
import GreetingLottie from "@/components/greetings/GreetingLottie";

/* ══════════════════════════════════════════════════════════════════════
   GENERIC SCENE — the closed-cover animation for every occasion that
   doesn't have a bespoke hand-built one (see
   components/greetings/scenes/index.js; today that's every occasion
   except Christmas and Onam).

   Before this component existed, those occasions fell back to a flat,
   static parametric motif (lib/design/showcase.js's cardMotif) — a
   pattern, not a picture, and nothing on it ever moved. This keeps that
   motif as the base (it still carries each occasion's own shape and
   colour) and plays that occasion's Lottie animation
   (lib/greetings/lottie.js, via occasion.lottie) centred over it, so
   every greeting card the sender opens has something actually animated
   on its cover, not just Christmas and Onam.
   ══════════════════════════════════════════════════════════════════════ */
export default function GenericScene({ occasion, accent = "#c69a55", palette = {} }) {
  const o = getOccasion(occasion);
  const motifUrl = cardMotif(o?.motif || "botanical", accent);
  const anim = getLottie(o?.lottie);

  return (
    <div className="gc-scene gc-scene-generic" aria-hidden="true">
      <div className="gc-scene-generic-motif" style={{ backgroundImage: `url("${motifUrl}")` }} />
      {anim && <GreetingLottie src={anim.src} className="gc-scene-generic-lottie" />}
    </div>
  );
}
