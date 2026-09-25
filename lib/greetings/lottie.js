/* ══════════════════════════════════════════════════════════════════════
   GREETING LOTTIE ANIMATIONS

   The closed cover of a greeting card (components/GreetingCard.js) used
   to fall back to a flat, static parametric motif for every occasion
   without a hand-built scene (components/greetings/scenes/). This is the
   registry of real, free Lottie animations — sourced from LottieFiles —
   that components/greetings/scenes/GenericScene.js plays on that cover
   instead, keyed by occasion slug in lib/greetings/occasions.js
   (`occasion.lottie`).

   Every URL below is a direct, CORS-enabled asset link on LottieFiles'
   own CDN (assets-v2.lottiefiles.com) pointing at a ".lottie" file — the
   dotLottie format (a zip of one or more Lottie JSON animations). They
   are rendered client-side by @lottiefiles/dotlottie-wc, a web component
   loaded from a CDN in components/greetings/GreetingLottie.js — nothing
   to install, nothing bundled into the app's own JS.

   Several occasions share an animation on purpose (Onam, Pongal and Get
   Well all use the same flower-bloom loop; Raksha Bandhan and Anniversary
   share the beating heart) rather than every one of fourteen occasions
   getting its own bespoke asset — the same "share, don't multiply" choice
   lib/design/showcase.js's cardMotif already makes for the static motifs.
   ══════════════════════════════════════════════════════════════════════ */

export const LOTTIE = {
  snow: {
    src: "https://assets-v2.lottiefiles.com/a/25d7500e-1167-11ee-8b6b-4f78ff922a46/IpZweRDp2g.lottie",
    credit: "Snow fall!!! — Bùi Vịnh, LottieFiles",
  },
  fireworks: {
    src: "https://assets-v2.lottiefiles.com/a/7cf37436-1152-11ee-8707-df3ab5882909/GFHSe2YKwV.lottie",
    credit: "Fireworks! — Raghad Modallal, LottieFiles",
  },
  diya: {
    src: "https://assets-v2.lottiefiles.com/a/67655f2e-1181-11ee-bd0f-0b5e1442077d/hVa9RptRsQ.lottie",
    credit: "Diya Loader (Lamp) — Any Motions, LottieFiles",
  },
  flowerBloom: {
    src: "https://assets-v2.lottiefiles.com/a/6e94f2d6-1164-11ee-b70e-b315c0a16453/TyXcxYCB3I.lottie",
    credit: "Flower bloom — Elena Fernández Formoso, LottieFiles",
  },
  moon: {
    src: "https://assets-v2.lottiefiles.com/a/e9a1c380-1170-11ee-970a-43c443669001/Nddq9Y61cV.lottie",
    credit: "Clear Night Moon — Akhil Atluri, LottieFiles",
  },
  confettiBurst: {
    src: "https://assets-v2.lottiefiles.com/a/d61c7e16-8f71-11ee-a91c-2bc0b57d569d/uSEh0BRIru.lottie",
    credit: "Confetti Burst — Chintan, LottieFiles",
  },
  heart: {
    src: "https://assets-v2.lottiefiles.com/a/90e8d280-1150-11ee-b78a-5f6757b04df7/mXZBR7SdsU.lottie",
    credit: "Beating Heart — LottieFiles",
  },
  balloon: {
    src: "https://assets-v2.lottiefiles.com/a/62fb205e-1163-11ee-b95e-6331075fd069/MBYIsfYFyC.lottie",
    credit: "Flying Balloon — Deniz Hacısalihoğlu, LottieFiles",
  },
  trophy: {
    src: "https://assets-v2.lottiefiles.com/a/0f2637a8-1153-11ee-9e88-23e7edb0cb90/qoo0juMjYB.lottie",
    credit: "Trophy — LottieFiles",
  },
  twinkle: {
    src: "https://assets-v2.lottiefiles.com/a/57972a48-1166-11ee-9723-e326a9c4a7bc/fjDrxqSTSQ.lottie",
    credit: "Twinkle stars — ejy, LottieFiles",
  },
};

export function getLottie(key) {
  return LOTTIE[key] || null;
}
