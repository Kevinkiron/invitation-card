/* ══════════════════════════════════════════════════════════════════════
   DEMO PHOTOGRAPHS

   The landing page shows real invitations with real pictures in them, so
   a visitor can see what they are buying rather than a grey placeholder.
   Those pictures are not ours, so this file is the only place they are
   named, and `scripts/fetch-demo-photos.mjs` is the only thing that
   downloads them.

   LICENCE — read before adding to this list.

   Every photograph here is on the plain Unsplash licence, which permits
   commercial use without payment or attribution. Nothing from Unsplash+
   or Getty is in this list and nothing from either may be added: those
   are paid licences and using one here would be an infringement, not an
   oversight.

   The Unsplash licence covers the photographer's copyright. It does not
   carry a model release, and several of these pictures show identifiable
   people. Using a stranger's face to advertise a paid service is a
   different question from using their photograph, and the answer varies
   by jurisdiction. These are fine as a demonstration of a template while
   the catalogue is being built; before any paid advertising campaign,
   replace them with photographs the business has releases for — client
   shoots, or a licensed stock library. `attribution` is kept on every
   entry so the NOTICE file can be regenerated and so a picture can
   always be traced back to its source.
   ══════════════════════════════════════════════════════════════════════ */

/* Where the downloaded files live, relative to `public/`. A demo token
   set refers to `/demo/<file>`; the fetch script writes `public/demo/`. */
export const DEMO_PHOTO_DIR = "demo";

/* id        — the Unsplash photo id, the part of the URL after /photos/
   file      — what it is saved as
   alt       — what is actually in the frame, for the alt attribute and
               so nobody has to open the file to know what it is
   credit    — photographer, for NOTICE.md */
export const DEMO_PHOTOS = [
  /* ── Wedding ── */
  { id: "ohENjR9w0bk", file: "wedding-01.jpg", credit: "Alok Verma",
    alt: "A bride in a red bridal outfit with gold jewellery and henna" },
  { id: "SUwPo4ErQCc", file: "wedding-02.jpg", credit: "Love Arya",
    alt: "Two hands patterned with henna, holding each other" },
  { id: "7O422yG_b80", file: "wedding-03.jpg", credit: "Amish Thakkar",
    alt: "A couple in traditional attire beneath a floral canopy" },
  { id: "d-jyMeP6uNQ", file: "wedding-04.jpg", credit: "Sean Williams",
    alt: "A couple in traditional wedding dress on a rock beside a river" },
  { id: "BEdxXAiRfRM", file: "wedding-05.jpg", credit: "Amish Thakkar",
    alt: "A wedding ritual beneath a floral canopy" },
  { id: "bWQ6-0c_ZcM", file: "wedding-06.jpg", credit: "Jayesh Jalodara",
    alt: "A gold and red wedding crown held in both hands" },
  { id: "lKwp3-FQomY", file: "wedding-07.jpg", credit: "Khadija Yousaf",
    alt: "Hands wearing a gold ring" },
  { id: "y9HsMX3-mUY", file: "wedding-08.jpg", credit: "Bella Pon Fruitsia",
    alt: "A woman smiling in a green, gold and red sari" },
  { id: "SHFOaVaVe2A", file: "wedding-09.jpg", credit: "iKshana Productions",
    alt: "A bride and groom on a path through trees" },
  { id: "d9RsO9BHFVQ", file: "wedding-10.jpg", credit: "Arto Suraj",
    alt: "A bride and groom together, photographed from a distance" },

  /* ── Birthday ── */
  { id: "MD_ha01Bk7c", file: "birthday-01.jpg", credit: "Lidya Nada",
    alt: "A table of birthday decorations" },
  { id: "Hli3R6LKibo", file: "birthday-02.jpg", credit: "Adi Goldstein",
    alt: "Balloons in many colours, close up" },
  { id: "Xaanw0s0pMk", file: "birthday-03.jpg", credit: "Jason Leung",
    alt: "Multicoloured confetti scattered across a surface" },
  { id: "gm3M-CsuynI", file: "birthday-04.jpg", credit: "Tim Zänkert",
    alt: "Three lit sparklers against the dark" },
  { id: "qSPxjNn7Uy8", file: "birthday-05.jpg", credit: "Duncan Kidd",
    alt: "Lit candles on a black metal stand" },
  { id: "-gDHgEcec6Q", file: "birthday-06.jpg", credit: "Robert Anderson",
    alt: "Pink cupcakes on a tray" },
  { id: "18N4okmWccM", file: "birthday-07.jpg", credit: "Morgan Lane",
    alt: "Balloons spelling out a birthday greeting" },
  { id: "kmLUcvhqhSo", file: "birthday-08.jpg", credit: "Nick Fewings",
    alt: "A hand-lettered birthday sign" },

  /* ── Naming ceremony ── */
  { id: "oMWPaPtJjes", file: "naming-01.jpg", credit: "Marius Muresan",
    alt: "A baby lying on a patterned blanket" },
  { id: "MBIvLGfgw1w", file: "naming-02.jpg", credit: "Ayodele Adeniyi",
    alt: "A woman holding a baby in her arms" },
  { id: "G2GV_InHTQ8", file: "naming-03.jpg", credit: "Manish Jadhav",
    alt: "A woman cradling a baby in her hands" },
  { id: "qU20sihrq-w", file: "naming-04.jpg", credit: "Marek Studzinski",
    alt: "A family holding a baby in front of a cake" },
  { id: "HghhjYruIIU", file: "naming-05.jpg", credit: "Arun Prakash",
    alt: "A small decorated bed against a red curtain" },
  { id: "27Q6hjK-Ivw", file: "naming-06.jpg", credit: "Marek Studzinski",
    alt: "A woman lifting a small child into the air" },
  { id: "thdH4Mgnh-Y", file: "naming-07.jpg", credit: "Samuel Lopez Cruz",
    alt: "Pink gift bags tied with bows" },
  { id: "ygzKK4hlGy8", file: "naming-08.jpg", credit: "Rosario Fernandes",
    alt: "A group of women seated together at a celebration" },

  /* ── Housewarming ── */
  { id: "bqUZEAeWuok", file: "house-01.jpg", credit: "Jakub Żerdzicki",
    alt: "House keys held up in front of a doorway" },
  { id: "rgJ1J8SDEAY", file: "house-02.jpg", credit: "Tierra Mallorca",
    alt: "A small wooden model house on a table" },
  { id: "PxiAc1aElFQ", file: "house-03.jpg", credit: "Filip Szalbot",
    alt: "A bunch of keys on a wooden table" },
  { id: "Ebj87ehFNNU", file: "house-04.jpg", credit: "Jakub Żerdzicki",
    alt: "A person holding a bunch of keys" },
  { id: "LkoDqb5E3zg", file: "house-05.jpg", credit: "Dima Solomin",
    alt: "A key in a door, close up" },
  { id: "Nel8STCcWy8", file: "house-06.jpg", credit: "Kelly Sikkema",
    alt: "A single key on a plain background" },
  { id: "0juktkOTkpU", file: "house-07.jpg", credit: "Amol Tyagi",
    alt: "An old iron key on a dark surface" },
];

/* `/demo/wedding-01.jpg` from `wedding-01.jpg`. Used by the fixtures so
   a filename is written once, here, rather than in four token sets. */
export const photo = (file) => `/${DEMO_PHOTO_DIR}/${file}`;

/* The alt text for a demo photograph, so a preview that shows one is not
   an unlabelled decoration to a screen reader. */
export const photoAlt = (file) =>
  DEMO_PHOTOS.find((p) => p.file === file)?.alt || "";
