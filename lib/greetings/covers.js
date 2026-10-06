import { GREETING_PHOTOS } from "@/lib/greetings/photos";
import { getOccasion } from "@/lib/greetings/occasions";

/* ══════════════════════════════════════════════════════════════════════
   CARD COVERS — the photographs a sender can pick for the front of their
   greeting card (components/greetings/CardBook.js), in the chat on
   /greetings/create. The first choice for every occasion is the photo it
   already had (lib/greetings/photos.js); the rest were picked from
   Unsplash for how they sit behind a gold title on a tall card — calm,
   darker space at the top, the subject lower down.

   LICENCE: every photo here was checked as free on Unsplash (not
   Unsplash+) through Unsplash's own API before going in; `credit` names
   the photographer. Same rules as lib/greetings/photos.js.

   A sender can also upload their own cover; that is stored as
   `cover: { photoUrl }` and used as it is.
   ══════════════════════════════════════════════════════════════════════ */

const u = (id, src, alt, credit) => ({ id, src: `https://images.unsplash.com/${src}`, alt, credit });

const EXTRA = {
  christmas: [
    u("4D160Ilvm2k", "photo-1511465797926-5381e1add47d", "A glowing Christmas tree against a deep green wall", "Rodolfo Marques"),
    u("-by-Brgr4Ag", "photo-1606916928892-3e15e20c5c0c", "A Christmas tree with red baubles in a cosy room", "Alsu Vershinina"),
    u("5PQn41LFsQk", "photo-1529973625058-a665431328fb", "A snowy village street lit for Christmas at night", "Roberto Nickson"),
    u("PlUJM2sPwis", "photo-1545024602-5ac8042e0bc5", "Two dogs looking up at a glowing Christmas wreath", "Laura Beth Snipes"),
  ],
  diwali: [
    u("H4ilfu3vftk", "photo-1605292356183-a77d0a9c9d1d", "Hands holding a lit diya", "Umesh Soni"),
    u("wqPTulHkhW4", "photo-1700601589928-8937ebf649fa", "A sparkler burning bright in the dark", "Picnu"),
    u("SKkvHiX_p6U", "photo-1575840459001-193274524edf", "Rows of lamps glowing together", "Alexis Fauvet"),
    u("Pkzc6Z64MoU", "photo-1699801676350-4182399f7cdd", "A ring of diyas glowing in the dark", "Sarthak Veggalam"),
  ],
  onam: [
    u("RSpmHq4I3o8", "photo-1787295779612-b3182bea0a81", "Two women in kasavu sarees laying a pookalam", "pranav ck"),
    u("m9H8ulv9gxU", "photo-1757229338735-1f6df8a5ba8f", "A Kathakali dancer in full costume and make-up", "Sleeba Thomas"),
    u("-a2x5HwpANg", "photo-1755547944443-3bb7114e2b1f", "A houseboat on the Kerala backwaters", "Vivek Kuppa"),
  ],
  pongal: [
    u("zsU7zlOdkeE", "photo-1576394435759-02a2674ff6e0", "A pot cooking over a wood fire", "Ganesh Partheeban"),
    u("8LbC2WRe-Bo", "photo-1739242895622-ed842c09d596", "A woman drawing a colourful kolam", "Karthick Gislen"),
    u("67w0us_FXjw", "photo-1739242895556-b1750c6f25de", "A kolam being drawn on the ground", "Karthick Gislen"),
    u("ikQjDKRmg3U", "photo-1642144776352-ad285aaa0ad6", "A woman in a pink and green half-saree", "Happysurd Photography"),
  ],
  eid: [
    u("Y-joaXX7XCQ", "photo-1577214407836-1f3a0604ecb2", "Ornate lanterns glowing in many colours", "Rawan Yasser"),
    u("inZWGoA_WnU", "photo-1658758062547-3dc96542eae6", "A white mosque dome framed by an arch", "Daniel Jankovic"),
    u("W9QvxvvZjmU", "photo-1759505820572-2ee950ffe6f5", "A golden mosque dome against a blue sky", "ekrem osmanoglu"),
  ],
  holi: [
    u("hGrvKzUfpzM", "photo-1610313898425-a5c637a940db", "A woman laughing in clouds of Holi colour", "Bulbul Ahmed"),
    u("NLqNQ10ppe0", "photo-1616884950055-861aeb5eb380", "Bowls of Holi colours, sweets and thandai", "Prchi Palwe"),
    u("b40crbTDmkU", "photo-1658892031910-1cdddba7805b", "Trays of bright gulal powder", "thom masat"),
    u("zHzaGwFMVSU", "photo-1775181315994-233aecf5d98f", "A woman leaping on a beach in a burst of colour", "Marlon Schmeiski"),
  ],
  "raksha-bandhan": [
    u("WciKbLIFGxc", "photo-1659907521212-8bbdfa688aa6", "A rakhi thali with sweets and diya", "Prchi Palwe"),
    u("VSFs4HrNqbc", "photo-1629649052013-36f5712a4e99", "A rakhi held in open hands", "Clicking Machine"),
    u("d7G9Q1tgJPk", "photo-1704927768404-22ca2cd2864e", "A sister tying a rakhi on Raksha Bandhan", "Rosario Fernandes"),
    u("AZzeUkQ9-xk", "photo-1569762587009-39893391015a", "Two smiling brothers", "Speedy Sandy"),
  ],
  "birthday-wish": [
    u("d8s13D29QiE", "photo-1545696563-af8f6ec2295a", "Candles being lit on a birthday cake", "Aneta Pawlik"),
    u("_IN4QCfBqmc", "photo-1527481138388-31827a7c94d5", "A rainbow slice of cake with one candle", "April Pethybridge"),
    u("n670rQW6n2o", "photo-1590174709246-f95754d54cc1", "A pink and white birthday cake with candles", "Maria"),
    u("l6yLVM-FJxc", "photo-1479750178258-aec5879046ce", "A bunch of polka-dot balloons", "Sofiya Levchenko"),
  ],
  "new-year": [
    u("1XgbEO7siqg", "photo-1535379665706-aea78de84a41", "A crowd watching golden fireworks", "Michael Fousert"),
    u("l4HBYkURqvE", "photo-1514845505178-849cebf1a91d", "A sparkler held up against glowing lights", "Wout Vanacker"),
    u("7jPeQQpTMHU", "photo-1700909591029-0cbd7c5d23be", "A glass of champagne among golden ornaments", "Kate Laine"),
    u("7LAykcNqlTk", "photo-1609517270254-f04d47ec9ad6", "Fireworks lighting up the night sky", "Philip Myrtorp"),
  ],
  "anniversary-wish": [
    u("yjkGazAKR7w", "photo-1561240055-102e7eaa2961", "A couple touching foreheads at golden hour", "Jonathan Borba"),
    u("PGIDs5PKWns", "photo-1622503958522-9f847e7e18de", "A couple by candlelight under the night sky", "Jonathan Borba"),
    u("C6CVXJMXwqs", "photo-1487035242901-d419a42d17af", "A single red rose in soft light", "Jamie Street"),
    u("ktzSt2uT1po", "photo-1589458456444-f7158a7e8a4f", "A bunch of pale pink roses", "Ilona K."),
  ],
  "thank-you": [
    u("VQwWU2i-7dw", "photo-1604072762229-9075f8878d30", "A deep, rich bouquet of roses and dahlias", "micheile henderson"),
    u("7eEj2JDkCQs", "photo-1759419281557-ebdca33c9263", "A hand holding out white alstroemeria", "feey"),
    u("mNEpmNiFdXs", "photo-1572454591674-2739f30d8c40", "A soft peach and pink bouquet in a vase", "Angelina Jollivet"),
    u("WBpr_yH0Frg", "photo-1457089328109-e5d9bd499191", "A dark, moody flower arrangement", "Annie Spratt"),
  ],
  "get-well": [
    u("Clw4X1R4LtY", "photo-1586810164142-5455a250a029", "Letter tiles spelling get well soon, with lemon", "Priscilla Du Preez"),
    u("LP1KmrWp-f0", "photo-1773045446183-e0aa29488126", "A bright bouquet of tulips", "Le Tia"),
    u("vKNjdRBqep0", "photo-1548291616-bfccc8db731d", "A sunflower field at golden hour", "Mike Marrah"),
    u("QldMpmrmWuc", "photo-1598920710727-e6c74781538c", "A sunflower field under a blue sky", "Todd Trapani"),
  ],
  congratulations: [
    u("fqMpD4LlodY", "photo-1659407490039-27cc03c0b4b3", "Bright curls of party streamers", "Michael Dziedzic"),
    u("oTglG1D4hRA", "photo-1627556704302-624286467c65", "A graduation cap held up high", "RUT MIIT"),
    u("4OjvrEGyf6A", "photo-1770135005669-0094609c733e", "Friends raising a champagne toast", "Desiray Green"),
    u("PqkJIcQOpb8", "photo-1610372073608-05b64a89a864", "A woman in gold raising a glass", "Kateryna Hliznitsova"),
  ],
  farewell: [
    u("FE-O7TD_OZ8", "photo-1694140066292-0bc81a6b0653", "A lone figure on a beach at sunset", "Vincent Y"),
    u("F-K0uFzYB1g", "photo-1721334753178-8f49e3ea15db", "A blazing sunset over the sea", "Bernd Dittrich"),
    u("V3B0kUl2nuk", "photo-1600653066531-3f0c81efd1c2", "An open road through the hills", "Etienne Delorieux"),
    u("GktK3Jb9BRE", "photo-1571035330093-fd93f6321a7b", "A winding road through a pine forest", "Meritt Thomas"),
  ],
};

const tall = (p) =>
  `${p.src}?w=760&h=1090&fit=crop&auto=format&q=72${p.focusY != null ? `&crop=focalpoint&fp-x=0.5&fp-y=${p.focusY}` : ""}`;
const thumb = (p) => `${p.src}?w=180&h=258&fit=crop&auto=format&q=60`;

/* Every cover a sender can pick for this occasion, default first. */
export function coverOptions(slug) {
  const o = getOccasion(slug);
  const base = GREETING_PHOTOS.find((p) => p.file === o?.photo);
  const list = [
    ...(base ? [{ id: base.id, src: base.src, alt: base.alt, credit: base.credit, focusY: base.focusY }] : []),
    ...(EXTRA[slug] || []),
  ];
  return list.map((p) => ({ ...p, url: tall(p), thumb: thumb(p) }));
}

/* The cover for a card: the sender's own upload, a picked one, or null
   (CardBook then falls back to the occasion's default photo). */
export function coverChoice(slug, cover) {
  if (!cover) return null;
  if (cover.photoUrl && /^https:\/\//.test(cover.photoUrl)) return { url: cover.photoUrl, alt: "" };
  const hit = coverOptions(slug).find((p) => p.id === cover.id);
  return hit ? { url: hit.url, alt: hit.alt } : null;
}
