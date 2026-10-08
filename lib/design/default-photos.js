/* ══════════════════════════════════════════════════════════════════════
   DEFAULT PHOTOS — what an invitation shows when the host has not
   uploaded their own (uploading is the ₹25 "photos" add-on, see
   lib/pricing.js). Used for the hero behind the names (and, through
   it, the closing scene) and for the wedding entrance window
   (components/invite/GrandEntrance.js).

   Hindu and Jain weddings use Welcvm's own artwork
   (public/wedding/hindu-hands.jpg). Every other picture is a free
   Unsplash photo, checked as free (not Unsplash+) on Unsplash before
   going in, credited here:
     christian     "man and woman holding hands" — Saeed Sarshar (JZB-sebrKa4)
     muslim        "hands with henna" — Anthony Lim (t2mrOFP0DoM)
     sikh          "a couple holding hands" — Planet Volumes (JRiyNjRtyiI)
     other         "bride and groom hold hands as the sun sets" —
                   Jaakko Perälä (_HoymeqvBEI)
     birthday      "lighted candles" — Hamid Roshaan (BQrzI0vi9x0)
     naming        "holding a baby's feet" — Renāte Gudele (dukKK0KVroc)
     housewarming  "wooden door with flowers" — Nazrin Babashova (z1uhic2f7Tg)
     celebration   "three sparkler sticks" — Tim Zänkert (gm3M-CsuynI)

   `pos` is the object-position that keeps the subject in view in the
   entrance window.
   ══════════════════════════════════════════════════════════════════════ */

const us = (id) => `https://images.unsplash.com/${id}?w=1200&q=72&auto=format&fit=crop`;

export const WEDDING_PHOTOS = {
  hindu:     { src: "/wedding/hindu-hands.jpg", pos: "50% 38%" },
  christian: { src: us("photo-1618566864264-fb013f791da4"), pos: "40% 30%" },
  muslim:    { src: us("photo-1720944517997-dbba56f97ad6"), pos: "50% 55%" },
  sikh:      { src: us("photo-1740417265999-42c749fcbed3"), pos: "60% 50%" },
  other:     { src: us("photo-1716813344739-51ac117d5ecc"), pos: "50% 55%" },
};

const EVENT_PHOTOS = {
  birthday:     us("photo-1600566209579-dd9691ed2ff0"),
  naming:       us("photo-1708439218339-b423ca4965d8"),
  housewarming: us("photo-1600873040273-48e6da19ed94"),
  celebration:  us("photo-1513546493312-0066d7de3fd2"),
};

export function weddingPhoto(faith) {
  const f = String(faith || "").toLowerCase();
  if (f === "hindu" || f === "jain") return WEDDING_PHOTOS.hindu;
  if (f === "christian" || f === "catholic") return WEDDING_PHOTOS.christian;
  return WEDDING_PHOTOS[f] || WEDDING_PHOTOS.other;
}

/* The hero photo for an invitation with none of its own. */
export function defaultHero(kind, faith) {
  if (kind === "wedding") return weddingPhoto(faith).src;
  return EVENT_PHOTOS[kind] || EVENT_PHOTOS.celebration;
}

/* The tokens a cinema actually renders from: uploaded photographs only
   when the "photos" add-on is unlocked (lib/pricing.js), and a default
   hero when there is none. Used by WeddingCinema and CelebrationCinema. */
export function withPhotoRules(tokens, kind, faith, allowed) {
  const media = { ...(tokens.media || {}) };
  let { events, couple } = tokens;
  if (!allowed) {
    media.heroImageUrl = null;
    media.heroVideoUrl = null;
    media.closingImage = null;
    media.storyImages = [];
    media.galleryImages = [];
    if (Array.isArray(events)) events = events.map((e) => (e && e.imageUrl ? { ...e, imageUrl: null } : e));
    if (couple) couple = { ...couple, bridePhoto: null, groomPhoto: null, couplePhoto: null };
  }
  if (!media.heroImageUrl) media.heroImageUrl = defaultHero(kind, faith);
  return { ...tokens, media, ...(events ? { events } : {}), ...(couple ? { couple } : {}) };
}
