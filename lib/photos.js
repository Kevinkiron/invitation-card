import { supabase } from "@/lib/supabase";
import { isCinema } from "@/lib/design/wedding-tokens";
import { nextWeddingStep } from "@/lib/ai/wedding-prompt";

/* ══════════════════════════════════════════════════════════════════════
   Photo uploads.

   Photographs are the one part of the invitation the AI never touches.
   The person picks them, they go straight to Supabase Storage, and only
   the resulting https URL ever reaches the design tokens — so a picture
   of somebody's family never travels through a model request, and the
   stored row stays small.

   The bucket is public-read: an invitation link is shared with guests who
   are not signed in, so the images behind it have to be fetchable without
   a session. Writes are restricted to the signed-in owner's own folder by
   the storage policies in supabase/schema.sql.
   ══════════════════════════════════════════════════════════════════════ */

/* The bucket that exists in the project, with public read and
   owner-folder writes already in place. It is `invitation-photos`, not
   `invite-photos` — an earlier version of this file guessed the name and
   every upload failed with "Bucket not found". */
export const BUCKET = "invitation-photos";
export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_PHOTOS = 12;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function describeFile(file) {
  if (!file) return "That file did not come through.";
  if (!TYPES.includes(file.type)) {
    return `${file.name || "That file"} is not an image I can use — JPEG, PNG, WebP or HEIC please.`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name || "That photo"} is ${(file.size / 1048576).toFixed(1)} MB — the limit is 8 MB.`;
  }
  return null;
}

const ext = (file) => {
  const fromName = (file.name || "").split(".").pop();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  return (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
};

/** Upload one image. Resolves to a public https URL. */
export async function uploadPhoto(file, userId) {
  const problem = describeFile(file);
  if (problem) throw new Error(problem);

  const name = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext(file)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { cacheControl: "31536000", upsert: false, contentType: file.type });

  if (error) {
    /* The most common cause by far is the bucket not existing yet, and
       the raw message ("Bucket not found") tells the person nothing they
       can act on. */
    if (/bucket/i.test(error.message || "")) {
      throw new Error(
        `Photo storage is not reachable. Check that a public bucket named "${BUCKET}" ` +
        "exists in Supabase — the SQL is in supabase/schema.sql."
      );
    }
    if (/mime|content type/i.test(error.message || "")) {
      throw new Error(`${file.name || "That photo"} is a file type the storage bucket does not accept.`);
    }
    if (/row-level security|policy|unauthorized|jwt/i.test(error.message || "")) {
      throw new Error("Your session has expired. Please sign in again and retry the upload.");
    }
    throw new Error(error.message || "That upload did not go through.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  if (!data?.publicUrl) throw new Error("Uploaded, but could not read the photo back.");
  return data.publicUrl;
}

/** Upload several, keeping order. Returns { urls, errors }. */
export async function uploadPhotos(files, userId) {
  const urls = [];
  const errors = [];
  for (const f of files) {
    try {
      urls.push(await uploadPhoto(f, userId));
    } catch (e) {
      errors.push(e.message);
    }
  }
  return { urls, errors };
}

/* ── placing photos in the design ─────────────────────────────────────
   The first photograph is the portrait in the hero; the rest fill the
   gallery. If the AI has not written a gallery section yet, one is added
   so the pictures are never orphaned — the model can retitle it later,
   and lib/design/tokens.js preserves `photos` across its patches. */
export function withPhotos(tokens, urls, slotHint) {
  if (!urls?.length) return tokens;

  /* The wedding cinema keeps its photographs somewhere else entirely.
     Writing them into `content.heroPhoto` there uploaded them perfectly
     and then showed the couple a link with no pictures on it, because
     components/WeddingCinema.js only ever reads `media`. */
  if (isCinema(tokens)) return withCinemaPhotos(tokens, urls, slotHint);

  const content = { ...(tokens.content || {}) };
  const sections = [...(content.sections || [])];

  const existingHero = content.heroPhoto ? [content.heroPhoto] : [];
  const galleryIdx = sections.findIndex((s) => s.type === "gallery");
  const existingGallery = galleryIdx >= 0 ? sections[galleryIdx].photos || [] : [];

  const all = [...existingHero, ...existingGallery, ...urls].slice(0, MAX_PHOTOS + 1);
  const [hero, ...rest] = all;

  content.heroPhoto = hero;

  if (rest.length) {
    const gallery = {
      ...(galleryIdx >= 0 ? sections[galleryIdx] : { type: "gallery", id: "gallery", title: "Moments" }),
      photos: rest,
    };
    if (galleryIdx >= 0) sections[galleryIdx] = gallery;
    else sections.push(gallery);
  }
  content.sections = sections;

  return { ...tokens, content };
}

/* ── placing photos in the wedding cinema ─────────────────────────────
   The cinema has four distinct picture slots, each feeding a different
   scene:

     media.heroImageUrl   → behind the two names, as the curtain lifts
     media.storyImages    → one beside each chapter of Their Story
     media.closingImage   → full-width, under the thank-you
     media.galleryImages  → the gallery guests scroll through

   Which slot a batch belongs to is not a guess: the interview asked for
   it. lib/ai/wedding-prompt.js knows which question is outstanding, so
   the step being answered names the slot. Anything the slot cannot hold
   — pictures sent before they were asked for, or more than a slot takes
   — falls through the page in scroll order rather than being dropped. */
const SLOT_FOR_STEP = {
  openingPhoto: "hero",
  storyPhotos: "story",
  gallery: "gallery",
  closingPhoto: "closing",
};

export function withCinemaPhotos(tokens, urls, slotHint) {
  if (!urls?.length) return tokens;

  const media = { ...(tokens.media || {}) };
  const story = Array.isArray(media.storyImages) ? [...media.storyImages] : [];
  const gallery = Array.isArray(media.galleryImages) ? [...media.galleryImages] : [];

  /* One photograph per story chapter. Before the chapters exist we still
     accept one, so a couple who reach for the paperclip early are not
     told to wait. */
  const chapters = Math.max(1, (Array.isArray(tokens.story) ? tokens.story : []).length);

  const used =
    (media.heroImageUrl ? 1 : 0) +
    (media.closingImage ? 1 : 0) +
    story.length +
    gallery.length;

  const queue = urls.slice(0, Math.max(0, MAX_PHOTOS + 1 - used));
  const take = () => queue.shift();

  const slot = slotHint || SLOT_FOR_STEP[nextWeddingStep(tokens)?.id] || null;

  if (slot === "hero" && queue.length) media.heroImageUrl = take();
  else if (slot === "closing" && queue.length) media.closingImage = take();
  else if (slot === "story") while (queue.length && story.length < chapters) story.push(take());
  else if (slot === "gallery") while (queue.length) gallery.push(take());

  /* Whatever is left over. The opening picture first — it is the one
     scene that cannot be filled from anywhere else — then the chapters,
     then the gallery, which has no ceiling of its own. */
  if (!media.heroImageUrl && queue.length) media.heroImageUrl = take();
  while (queue.length && story.length < chapters) story.push(take());
  while (queue.length) gallery.push(take());

  media.storyImages = story;
  media.galleryImages = gallery;

  return { ...tokens, media, _cinema: true };
}

/* How many photographs the invitation is already holding, whichever
   shape it is in. The create page counts against MAX_PHOTOS with this,
   and used to count only the generic shape — so on a wedding it read
   zero however many had been added. */
export function countPhotos(tokens) {
  if (isCinema(tokens)) {
    const m = tokens?.media || {};
    return (
      (m.heroImageUrl ? 1 : 0) +
      (m.closingImage ? 1 : 0) +
      (Array.isArray(m.storyImages) ? m.storyImages.length : 0) +
      (Array.isArray(m.galleryImages) ? m.galleryImages.length : 0)
    );
  }
  const c = tokens?.content || {};
  return (
    (c.heroPhoto ? 1 : 0) +
    ((c.sections || []).find((x) => x.type === "gallery")?.photos?.length || 0)
  );
}
