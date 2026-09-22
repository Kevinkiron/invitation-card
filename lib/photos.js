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

/* ── shrinking a photo before it ever reaches Supabase ────────────────
   A phone camera photo is routinely 3–8 MB — fine to hold in memory for
   a second, terrible to serve to every guest who opens the link on a
   cellular connection. A wedding invitation on welcvm.com was shipping
   a 1.86 MB PNG at 1122×1402 to be displayed at 485×730 CSS pixels:
   no resize, no compression, and PNG (lossless) used for a photograph.

   This runs the file through a canvas once, in the guest's own browser,
   before upload: shrink to a sensible ceiling for how large an
   invitation ever actually shows a photo, then re-encode as JPEG at a
   quality that is indistinguishable from the source on screen. A
   photograph never needs a transparent background, so re-encoding as
   JPEG is always safe here — this is not a general-purpose image
   pipeline, just this one upload path.

   If anything about this fails — an old browser without
   createImageBitmap, a HEIC file the canvas can't decode, running with
   no DOM at all — the original file is uploaded unchanged. A slightly
   large photo beats a failed upload. */
const MAX_EDGE = 2000; // long edge, px — covers a full-bleed hero on a 2x desktop display
const JPEG_QUALITY = 0.82;

async function compressImage(file) {
  if (typeof document === "undefined") return file; // no DOM (SSR, tests) — skip
  if (!file.type?.startsWith("image/")) return file;
  if (file.type === "image/heic" || file.type === "image/heif") return file; // canvas can't decode HEIC in most browsers
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);
    const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;

    // Already small and already a lossy format — recompressing a JPEG
    // that's already well under the ceiling just burns a generation of
    // quality for no size win.
    if (scale === 1 && file.type === "image/jpeg" && file.size <= 700 * 1024) {
      bitmap.close?.();
      return file;
    }

    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    // Only worth it if it actually saved space — a tiny already-optimized
    // source image can occasionally re-encode slightly larger.
    if (blob.size >= file.size) return file;

    const base = (file.name || "photo").replace(/\.[a-z0-9]+$/i, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file; // never let a compression hiccup block the upload
  }
}

/** Upload one image. Resolves to a public https URL. */
export async function uploadPhoto(file, userId) {
  const problem = describeFile(file);
  if (problem) throw new Error(problem);

  const upload = await compressImage(file);

  const name = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext(upload)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, upload, { cacheControl: "31536000", upsert: false, contentType: upload.type });

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
     events[].imageUrl    → one beside each card in the celebrations
                             timeline (mehendi, sangeet, reception, …)
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
  functionPhotos: "events",
  gallery: "gallery",
  closingPhoto: "closing",
};

export function withCinemaPhotos(tokens, urls, slotHint) {
  if (!urls?.length) return tokens;

  const media = { ...(tokens.media || {}) };
  const story = Array.isArray(media.storyImages) ? [...media.storyImages] : [];
  const gallery = Array.isArray(media.galleryImages) ? [...media.galleryImages] : [];
  const events = Array.isArray(tokens.events) ? tokens.events.map((e) => ({ ...e })) : [];

  /* One photograph per story chapter. Before the chapters exist we still
     accept one, so a couple who reach for the paperclip early are not
     told to wait. */
  const chapters = Math.max(1, (Array.isArray(tokens.story) ? tokens.story : []).length);

  const used =
    (media.heroImageUrl ? 1 : 0) +
    (media.closingImage ? 1 : 0) +
    story.length +
    gallery.length +
    events.filter((e) => e.imageUrl).length;

  const queue = urls.slice(0, Math.max(0, MAX_PHOTOS + 1 - used));
  const take = () => queue.shift();

  const slot = slotHint || SLOT_FOR_STEP[nextWeddingStep(tokens)?.id] || null;

  if (slot === "hero" && queue.length) media.heroImageUrl = take();
  else if (slot === "closing" && queue.length) media.closingImage = take();
  else if (slot === "story") while (queue.length && story.length < chapters) story.push(take());
  else if (slot === "gallery") while (queue.length) gallery.push(take());
  else if (slot === "events") {
    /* One per card, in the order the timeline already has them — the
       interview asked for them "in that order" for exactly this. A
       function that already has a photograph is left alone rather than
       overwritten, so re-sending one picture later does not reshuffle
       the rest. */
    for (const e of events) {
      if (!queue.length) break;
      if (!e.imageUrl) e.imageUrl = take();
    }
  }

  /* Whatever is left over. The opening picture first — it is the one
     scene that cannot be filled from anywhere else — then the chapters,
     then the gallery, which has no ceiling of its own. */
  if (!media.heroImageUrl && queue.length) media.heroImageUrl = take();
  while (queue.length && story.length < chapters) story.push(take());
  while (queue.length) gallery.push(take());

  media.storyImages = story;
  media.galleryImages = gallery;

  return { ...tokens, media, events, _cinema: true };
}

/* How many photographs the invitation is already holding, whichever
   shape it is in. The create page counts against MAX_PHOTOS with this,
   and used to count only the generic shape — so on a wedding it read
   zero however many had been added. */
export function countPhotos(tokens) {
  if (isCinema(tokens)) {
    const m = tokens?.media || {};
    const events = Array.isArray(tokens?.events) ? tokens.events : [];
    return (
      (m.heroImageUrl ? 1 : 0) +
      (m.closingImage ? 1 : 0) +
      (Array.isArray(m.storyImages) ? m.storyImages.length : 0) +
      (Array.isArray(m.galleryImages) ? m.galleryImages.length : 0) +
      events.filter((e) => e?.imageUrl).length
    );
  }
  const c = tokens?.content || {};
  return (
    (c.heroPhoto ? 1 : 0) +
    ((c.sections || []).find((x) => x.type === "gallery")?.photos?.length || 0)
  );
}
