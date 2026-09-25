/* ══════════════════════════════════════════════════════════════════════
   GREETING OCCASION PHOTOGRAPHS

   The /greetings landing grid used to show each occasion as a flat
   colour gradient with a parametric SVG motif blended over it — no
   actual picture of Christmas, Diwali, a birthday. This is the photo for
   each of the fourteen occasion tiles, following exactly the pattern
   lib/demo/photos.js already established for the invitation homepage's
   demo cards: a manifest here, a build-time fetch script
   (scripts/fetch-greeting-photos.mjs) that downloads the real files into
   public/greetings/, and a themed-gradient fallback in the component if
   a picture is ever missing.

   LICENCE — read before adding to this list.

   Every photograph here is on the plain Unsplash licence, which permits
   commercial use without payment or attribution. Nothing from Unsplash+
   or Getty is in this list and nothing from either may be added.
   `credit` is kept on every entry purely so NOTICE.md can name the
   photographer even though the licence does not require it.
   ══════════════════════════════════════════════════════════════════════ */

export const GREETING_PHOTO_DIR = "greetings";

/* id   — the Unsplash photo id, the part of the URL after /photos/
   file — what it is saved as (also the value stored on the matching
          entry in lib/greetings/occasions.js)
   alt  — what is actually in the frame
   credit — photographer, for NOTICE.md */
export const GREETING_PHOTOS = [
  { id: "a-WdENukx9E", file: "christmas.jpg", credit: "Ingmar",
    alt: "A Christmas tree decorated with ornaments and warm string lights" },
  { id: "8SfiQYd489o", file: "new-year.jpg", credit: "Finn IJspeert",
    alt: "Colourful fireworks lighting up the night sky" },
  { id: "zNY2lVIRh7M", file: "diwali.jpg", credit: "Dilip Rathod",
    alt: "Rows of lit diya oil lamps" },
  { id: "Kq9KvoeD1GU", file: "onam.jpg", credit: "Kent June Bernal",
    alt: "Orange marigold flowers in full bloom" },
  { id: "0cxEaHgkNKo", file: "eid.jpg", credit: "Pavel Avakumov",
    alt: "The dome of a mosque with a crescent moon above it" },
  { id: "rFP3OzmYH6M", file: "holi.jpg", credit: "Dibakar Roy",
    alt: "A crowd celebrating Holi, covered in colourful powder" },
  { id: "MenleOU_QdY", file: "raksha-bandhan.jpg", credit: "Aditya Sethia",
    alt: "Close-up of a woman's hands wearing colourful bangles" },
  { id: "Q2Z6BnGn0ys", file: "pongal.jpg", credit: "B S",
    alt: "Golden wheat stalks in a sunlit field" },
  { id: "SYfH2bqf1yk", file: "birthday-wish.jpg", credit: "Shamblen Studios",
    alt: "A cluster of balloons with streamers and confetti" },
  { id: "7hfBV7VgIDQ", file: "anniversary-wish.jpg", credit: "Fellipe Ditadi",
    alt: "Two people holding a bouquet of white flowers together" },
  { id: "qAtP-1oIDX4", file: "thank-you.jpg", credit: "Karolina Grabowska",
    alt: "A white candle tied with a gold ribbon" },
  { id: "iBX2OiyHW2I", file: "get-well.jpg", credit: "Nastia Petruk",
    alt: "A vibrant sunflower blooming in the sunshine" },
  { id: "n4JwyvrWqj8", file: "congratulations.jpg", credit: "Dibakar Roy",
    alt: "A crowd throwing confetti in the air in celebration" },
  { id: "_9-5riFJ1iM", file: "farewell.jpg", credit: "insung yoon",
    alt: "Silhouette of a person waving at sunset on the beach" },
];

/* `/greetings/christmas.jpg` from `christmas.jpg` — matches occasion.photo
   in lib/greetings/occasions.js one to one. */
export const photo = (file) => `/${GREETING_PHOTO_DIR}/${file}`;

export const photoAlt = (file) =>
  GREETING_PHOTOS.find((p) => p.file === file)?.alt || "";
