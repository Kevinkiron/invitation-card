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

  /* The cast of the illustrated inside of the card
     (components/greetings/IllustratedCard.js, chosen per occasion in
     lib/greetings/card-themes.js). Each was rendered and checked by eye
     before being added, and each is free under the Lottie Simple
     License. */
  giftBox: {
    src: "https://assets-v2.lottiefiles.com/a/6034265a-1176-11ee-bc6b-573e40a2c785/pYEaeoUuiE.lottie",
    credit: "Gift Box Lottie Animation — SM Rony, LottieFiles",
  },
  reindeer: {
    src: "https://assets-v2.lottiefiles.com/a/1de344f8-1184-11ee-9f46-1bbeea027a53/rwckbSRWsx.lottie",
    credit: "Reindeer — Bashir Ahmad, LottieFiles",
  },
  snowman: {
    src: "https://assets-v2.lottiefiles.com/a/4430817e-93c1-11ee-9c1e-67ebb0846a3e/tagQmLuxEe.lottie",
    credit: "Snowman — Diego Gonzalez, LottieFiles",
  },
  pineTree: {
    src: "https://assets-v2.lottiefiles.com/a/fd80508e-1183-11ee-a71e-cb22e14a167a/phz4yM8sTR.lottie",
    credit: "Christmas Tree — SM Rony, LottieFiles",
  },
  santaGift: {
    src: "https://assets-v2.lottiefiles.com/a/5b4c4f56-1175-11ee-a274-ffac96fbedeb/sZl8naVjNa.lottie",
    credit: "Merry Christmas - Santa Claus — Animo Arts, LottieFiles",
  },
  diyaBoy: {
    src: "https://assets-v2.lottiefiles.com/a/6ba71d5e-1166-11ee-a6b3-0f0a6f1a3965/jrmHepqV17.lottie",
    credit: "Happy Diwali 02 — JAStudio, LottieFiles",
  },
  hangingLamp: {
    src: "https://assets-v2.lottiefiles.com/a/d5c1ae24-1180-11ee-a543-fbb49c01d0a4/AFSTJO6qD8.lottie",
    credit: "Hanging Oil Lamp — LottieFiles",
  },
  rangoli: {
    src: "https://assets-v2.lottiefiles.com/a/582a4080-1166-11ee-977d-bbc2823e5b82/eGDOd9XA4r.lottie",
    credit: "Rangoli (for Diwali) — JAStudio, LottieFiles",
  },
  birthdayCake: {
    src: "https://assets-v2.lottiefiles.com/a/56b79446-fd2e-11ee-aee5-6fd2476cc13f/1QzWbDSYrF.lottie",
    credit: "Happy Birthday — Amanda, LottieFiles",
  },
  birthdayBalloons: {
    src: "https://assets-v2.lottiefiles.com/a/d7fbf106-725d-11ef-9110-5f153ab9eb98/SU6ht6OKs5.lottie",
    credit: "Birthday Confetti Balloon — Mayank Pandey, LottieFiles",
  },
  giftPurple: {
    src: "https://assets-v2.lottiefiles.com/a/0614ec90-1185-11ee-b4b6-876b7a2465e4/KjvdxT5q7l.lottie",
    credit: "Gift Box — Animo Arts, LottieFiles",
  },
  eidMoonGirl: {
    src: "https://assets-v2.lottiefiles.com/a/cdf5db66-116c-11ee-95fa-b3513980c3e9/o4ImV7bnWa.lottie",
    credit: "Eid Crescent Moon Girl — LottieFiles",
  },
  ramadanLantern: {
    src: "https://assets-v2.lottiefiles.com/a/4ca134be-e161-11ee-bea4-af698395fee3/ilacN2gaBz.lottie",
    credit: "Ramadan lantern — Rabea Sathi, LottieFiles",
  },
  cheers: {
    src: "https://assets-v2.lottiefiles.com/a/ff1610c2-1161-11ee-ba35-cf3be6c839c6/rQ3bICdCtb.lottie",
    credit: "Cheers Celebrations — Tanvi Sharma, LottieFiles",
  },

  /* Wedding invitation card decoration, chosen by the couple's tradition
     (components/WeddingCinema.js, FAITH_DECOR). Rendered and checked by
     eye before being added; all free under the Lottie Simple License. */
  ganesha: {
    src: "https://assets-v2.lottiefiles.com/a/7aeb766c-1183-11ee-a1e9-23374b2363f7/QdKR6fHDan.lottie",
    credit: "Happy Ganesh Chaturthi — mukesh kumar, LottieFiles",
  },
  kalash: {
    src: "https://assets-v2.lottiefiles.com/a/a4e9f9aa-1171-11ee-b9be-8735f95230dc/wtV9E6II0i.lottie",
    credit: "Kalash — sunil mourya, LottieFiles",
  },
  dove: {
    src: "https://assets-v2.lottiefiles.com/a/be222d8e-117b-11ee-a3aa-5f68d19435b4/iDTbqJXr9B.lottie",
    credit: "Dove — Yash Goswami, LottieFiles",
  },
  weddingCouple: {
    src: "https://assets-v2.lottiefiles.com/a/29c532d6-116b-11ee-b988-a398e7cb9ed0/Zo3UKaMqei.lottie",
    credit: "Marriage Couple hugging — Boltbite, LottieFiles",
  },
  mosque: {
    src: "https://assets-v2.lottiefiles.com/a/d788a264-1188-11ee-870a-d761e719f38a/JDoniZE6ah.lottie",
    credit: "Mosque Animation — Abdul Latif, LottieFiles",
  },
  ramadanLanterns: {
    src: "https://assets-v2.lottiefiles.com/a/eb7dca48-dec8-11ee-98bc-07d1583b6918/0wDZjeg9i0.lottie",
    credit: "Ramadan Theme — AffanJ, LottieFiles",
  },
};

export function getLottie(key) {
  return LOTTIE[key] || null;
}
