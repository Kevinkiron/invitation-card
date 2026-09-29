/* ══════════════════════════════════════════════════════════════════════
   WEDDING FUNCTIONS, BY TRADITION

   The functions a wedding is made of — and the question that asks about
   them — are not the same everywhere. A Hindu wedding has a haldi and a
   sangeet; a Muslim wedding has a nikah and a walima; a Christian one an
   engagement and a reception; a Sikh one an Anand Karaj and a sangeet.
   Before this file, every couple was asked the same Hindu-shaped
   question ("haldi, mehendi, sangeet, reception?") and Haldi Yellow /
   Mehendi Green were the only house colours on offer, regardless of
   `invitation.religion` — captured one step earlier in the interview
   (see lib/ai/wedding-prompt.js) but never read again until now.

   Each entry mirrors the shape lib/ai/wedding-script.js already expects:
     functions   — [regex, display name, id] tried in order against what
                   the couple typed, exactly like the old flat FUNCTIONS
                   array this replaces.
     style       — id → { theme, dressCode }, the house colours used when
                   the couple do not specify their own.
     order       — the id order an invitation of that tradition runs in.
     ceremonyId / ceremonyName — the main ceremony, seeded automatically
                   with the date/time/venue already on file (see the
                   "functions" case in wedding-script.js) under the name
                   that tradition actually gives it.
     suggest     — the functions named in the question itself, so a Sikh
                   couple are asked about their sangeet and Anand Karaj,
                   not somebody else's haldi and nikah.
     retry       — what to ask again when nothing was understood.

   `religionKey()` normalises whatever wedding-script.js's own FAITHS
   table produced (hindu, muslim, christian, sikh, jain, buddhist,
   interfaith, none, or "") down to one of the four tailored sets below,
   or "default" for everyone else — the original, Hindu-leaning generic
   list, since a Jain or interfaith couple's functions overlap with it
   more often than not, and it is far better than refusing to guess.
   ══════════════════════════════════════════════════════════════════════ */

const AFTER = [/after[- ]?party|brunch|cocktail/i, "After Party", "after"];

export const WEDDING_FUNCTIONS_BY_RELIGION = {
  hindu: {
    suggest: "haldi, mehendi, sangeet, reception",
    retry: "Name the functions you are having — haldi, mehendi, sangeet, reception?",
    ceremonyId: "ceremony",
    ceremonyName: "Wedding Ceremony",
    order: ["mehendi", "haldi", "sangeet", "ceremony", "reception", "after"],
    functions: [
      [/haldi|pithi/i, "Haldi", "haldi"],
      [/mehendi|mehndi|henna/i, "Mehendi", "mehendi"],
      [/sangeet|music night/i, "Sangeet", "sangeet"],
      [/reception/i, "Reception", "reception"],
      AFTER,
      [/ceremony|wedding|pheras|muhurat/i, "Wedding Ceremony", "ceremony"],
    ],
    style: {
      haldi:     { theme: "Haldi Yellow",            dressCode: "Yellow, ivory or floral" },
      mehendi:   { theme: "Mehendi Green",           dressCode: "Greens and soft pastels" },
      sangeet:   { theme: "Sangeet Indigo & Silver", dressCode: "Festive Indian" },
      ceremony:  { theme: "Royal Maroon & Gold",     dressCode: "Indian festive luxury" },
      reception: { theme: "Emerald & Gold",          dressCode: "Cocktail or Indo-western" },
      after:     { theme: "Midnight & Neon",         dressCode: "Whatever you can dance in" },
    },
  },

  muslim: {
    suggest: "mehndi, nikah, walima",
    retry: "Name the functions you are having — mehndi, nikah, walima?",
    ceremonyId: "ceremony",
    ceremonyName: "Nikah Ceremony",
    order: ["mehendi", "nikah", "ceremony", "walima", "after"],
    functions: [
      [/mehendi|mehndi|henna/i, "Mehndi", "mehendi"],
      [/nikah|nikaah/i, "Nikah", "nikah"],
      [/walima|valima/i, "Walima", "walima"],
      [/reception/i, "Walima", "walima"],
      AFTER,
      [/ceremony|wedding/i, "Nikah Ceremony", "ceremony"],
    ],
    style: {
      mehendi:  { theme: "Mehndi Green",   dressCode: "Greens and soft pastels" },
      nikah:    { theme: "Ivory & Gold",   dressCode: "Modest formal" },
      ceremony: { theme: "Ivory & Gold",   dressCode: "Modest formal" },
      walima:   { theme: "Emerald & Gold", dressCode: "Elegant, modest formal" },
      after:    { theme: "Midnight & Neon", dressCode: "Whatever you can dance in" },
    },
  },

  christian: {
    suggest: "engagement, bachelorette party, reception",
    retry: "Name the functions you are having — engagement, bachelorette, reception?",
    ceremonyId: "ceremony",
    ceremonyName: "Wedding Ceremony",
    order: ["engagement", "bachelor", "rehearsal", "ceremony", "reception", "after"],
    functions: [
      [/engage|ring ceremony|roka/i, "Engagement", "engagement"],
      [/bachelor|hen do|stag|bridal shower/i, "Bachelorette Party", "bachelor"],
      [/rehearsal/i, "Rehearsal Dinner", "rehearsal"],
      [/reception/i, "Reception", "reception"],
      AFTER,
      [/ceremony|wedding|vows|church/i, "Wedding Ceremony", "ceremony"],
    ],
    style: {
      engagement: { theme: "Blush & Gold",    dressCode: "Cocktail attire" },
      bachelor:   { theme: "Midnight & Neon", dressCode: "Whatever you can dance in" },
      rehearsal:  { theme: "Ivory & Sage",    dressCode: "Smart casual" },
      ceremony:   { theme: "Ivory & Gold",    dressCode: "Church formal" },
      reception:  { theme: "Emerald & Gold",  dressCode: "Cocktail or black tie" },
      after:      { theme: "Midnight & Neon", dressCode: "Whatever you can dance in" },
    },
  },

  sikh: {
    suggest: "kurmai, mehndi, sangeet, Anand Karaj",
    retry: "Name the functions you are having — kurmai, mehndi, sangeet, Anand Karaj?",
    ceremonyId: "ceremony",
    ceremonyName: "Anand Karaj",
    order: ["kurmai", "mehendi", "sangeet", "ceremony", "reception", "after"],
    functions: [
      [/kurmai|roka|engage/i, "Kurmai", "kurmai"],
      [/mehendi|mehndi|henna/i, "Mehndi", "mehendi"],
      [/sangeet|music night/i, "Sangeet", "sangeet"],
      [/reception/i, "Reception", "reception"],
      AFTER,
      [/anand karaj|gurudwara|gurdwara|ceremony|wedding/i, "Anand Karaj", "ceremony"],
    ],
    style: {
      kurmai:    { theme: "Rose & Gold",             dressCode: "Festive Indian" },
      mehendi:   { theme: "Mehendi Green",           dressCode: "Greens and soft pastels" },
      sangeet:   { theme: "Sangeet Indigo & Silver", dressCode: "Festive Indian" },
      ceremony:  { theme: "Saffron & White",         dressCode: "Modest festive, head covered" },
      reception: { theme: "Emerald & Gold",          dressCode: "Cocktail or Indo-western" },
      after:     { theme: "Midnight & Neon",         dressCode: "Whatever you can dance in" },
    },
  },
};

/* Jain, Buddhist, interfaith, none, and anything the couple types that
   parseReligion does not recognise all land here — the original,
   Hindu-leaning list this file replaces, kept as the safe default rather
   than guessing at a tradition we were not told. */
WEDDING_FUNCTIONS_BY_RELIGION.default = WEDDING_FUNCTIONS_BY_RELIGION.hindu;

export function religionKey(religion) {
  const r = String(religion || "").trim().toLowerCase();
  return WEDDING_FUNCTIONS_BY_RELIGION[r] ? r : "default";
}

/** The function set — questions, regex table, house styles, ordering —
    for a given `invitation.religion` value. Always returns something
    usable, even when `religion` is empty or unrecognised. */
export function functionsFor(religion) {
  return WEDDING_FUNCTIONS_BY_RELIGION[religionKey(religion)];
}
