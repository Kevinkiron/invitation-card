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

/* id     — the Unsplash photo id, the part of the URL after /photos/
   src    — that photo's address on Unsplash's own image CDN
            (images.unsplash.com), which is what the tiles load
   file   — the key stored on the matching entry in
            lib/greetings/occasions.js (`occasion.photo`)
   alt    — what is actually in the frame
   credit — photographer, for NOTICE.md
   focusY — optional: where to centre a tall photo's crop, 0 (top) to 1
            (bottom); the default centre crop is fine for the rest

   Every entry was checked on unsplash.com as free (not Unsplash+), and
   looked at, before going in. Two earlier picks (anniversary, thank you)
   turned out to be Unsplash+ and were replaced; Diwali, Onam, Raksha
   Bandhan, Pongal and Birthday were swapped for photos of the actual
   festival rather than something nearby (wheat for Pongal, bangles for
   Raksha Bandhan). */
export const GREETING_PHOTOS = [
  { id: "a-WdENukx9E", file: "christmas.jpg", credit: "Ingmar",
    src: "https://images.unsplash.com/photo-1765194493212-874b062ff31a",
    alt: "A Christmas tree decorated with ornaments and warm string lights" },
  { id: "8SfiQYd489o", file: "new-year.jpg", credit: "Finn IJspeert",
    src: "https://images.unsplash.com/photo-1641043023857-b92a05139d77",
    alt: "Colourful fireworks lighting up the night sky" },
  { id: "xisPXJqwQkA", file: "diwali.jpg", credit: "Udayaditya Barua",
    src: "https://images.unsplash.com/photo-1577083753695-e010191bacb5",
    alt: "Lit clay diyas on a decorated tray, surrounded by flower petals" },
  { id: "zD6ZdPWG01E", file: "onam.jpg", credit: "Rachel N Raju",
    src: "https://images.unsplash.com/photo-1615184927936-b4dadca7538f",
    alt: "A pookalam, the Onam flower carpet, in red, yellow and purple petals" },
  { id: "0cxEaHgkNKo", file: "eid.jpg", credit: "Pavel Avakumov",
    src: "https://images.unsplash.com/photo-1742060621064-13c2bfeba6a5",
    alt: "The dome of a mosque with a crescent moon above it" },
  { id: "rFP3OzmYH6M", file: "holi.jpg", credit: "Dibakar Roy",
    src: "https://images.unsplash.com/photo-1756661921244-35636963e096",
    alt: "A crowd celebrating Holi, covered in colourful powder" },
  { id: "u4ms_TgLYig", file: "raksha-bandhan.jpg", credit: "Paras Kaushal",
    src: "https://images.unsplash.com/photo-1692902288471-4beec045f56d",
    alt: "A rakhi beside a small silver box of kumkum and rice" },
  { id: "HZ72Fg2_OAI", file: "pongal.jpg", credit: "A N Suresh",
    src: "https://images.unsplash.com/photo-1732603891196-2b8cc24f39a5",
    alt: "A clay pongal pot over a fire, on a kolam drawn in rice flour" },
  { id: "M20ylqCzSZw", file: "birthday-wish.jpg", credit: "Annie Spratt",
    src: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84",
    alt: "A birthday cake with lit Happy Birthday candles" },
  { id: "aC5_EFhq7Fs", file: "anniversary-wish.jpg", credit: "Jonathan Borba",
    src: "https://images.unsplash.com/photo-1621621667797-e06afc217fb0",
    alt: "A couple embracing, him holding a bouquet of dried flowers" },
  { id: "M3fhZSBFoFQ", file: "thank-you.jpg", credit: "Manuel Cosentino",
    src: "https://images.unsplash.com/photo-1526614180703-827d23e7c8f2",
    alt: "A hand holding up a card that says Thanks" },
  { id: "iBX2OiyHW2I", file: "get-well.jpg", credit: "Nastia Petruk",
    src: "https://images.unsplash.com/photo-1748017330807-8a5aaabfd587",
    alt: "A vibrant sunflower blooming in the sunshine" },
  { id: "n4JwyvrWqj8", file: "congratulations.jpg", credit: "Dibakar Roy",
    src: "https://images.unsplash.com/photo-1740767579757-b3de04b7596c",
    alt: "A crowd throwing confetti in the air in celebration" },
  { id: "_9-5riFJ1iM", file: "farewell.jpg", credit: "insung yoon",
    src: "https://images.unsplash.com/photo-1763448817129-2421ae9e8361", focusY: 0.55,
    alt: "Silhouette of a person waving at sunset on the beach" },
];

/* The tile image for an occasion.photo key: Unsplash's CDN, cropped and
   sized on their side for a landing tile. This used to point at
   /greetings/<file>, downloaded at build time by
   scripts/fetch-greeting-photos.mjs — but that download fails on the
   build server, so every tile fell back to a flat gradient. Loading from
   images.unsplash.com directly is also how Unsplash asks its photos to be
   used. */
export const photo = (file) => {
  const p = GREETING_PHOTOS.find((x) => x.file === file);
  if (!p) return null;
  const focus = p.focusY != null ? `&crop=focalpoint&fp-x=0.5&fp-y=${p.focusY}` : "";
  return `${p.src}?w=900&h=560&fit=crop&auto=format&q=75${focus}`;
};

export const photoAlt = (file) =>
  GREETING_PHOTOS.find((p) => p.file === file)?.alt || "";

/* The same photograph cut tall, for the front cover of the card book
   (components/greetings/CardBook.js), which is portrait 3 : 4.3. */
export const coverPhoto = (file) => {
  const p = GREETING_PHOTOS.find((x) => x.file === file);
  if (!p) return null;
  const focus = p.focusY != null ? `&crop=focalpoint&fp-x=0.5&fp-y=${p.focusY}` : "";
  return `${p.src}?w=760&h=1090&fit=crop&auto=format&q=72${focus}`;
};
