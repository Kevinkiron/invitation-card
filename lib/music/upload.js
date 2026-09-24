import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════════════════════════════════
   Music uploads.

   Same shape as lib/photos.js's photo upload: the file goes straight to
   Supabase Storage from the browser, and only the resulting https URL
   ever lands in the design tokens. Nobody's own recording travels
   through a model request.

   The bucket is public-read for the same reason invitation-photos is: a
   published invitation link is opened by guests who never sign in, and
   the browser has to be able to play the track without a session. Writes
   are restricted to the signed-in owner's own folder by the storage
   policies in supabase/schema.sql.
   ══════════════════════════════════════════════════════════════════════ */

export const BUCKET = "invitation-audio";
export const MAX_BYTES = 15 * 1024 * 1024; // 15 MB — comfortable for a 3–4 minute mp3
const TYPES = [
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg",
];

export function describeAudioFile(file) {
  if (!file) return "That file did not come through.";
  if (!TYPES.includes(file.type) && !/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name || "")) {
    return `${file.name || "That file"} is not an audio file I can use — MP3, WAV, M4A, AAC or OGG please.`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name || "That track"} is ${(file.size / 1048576).toFixed(1)} MB — the limit is ${MAX_BYTES / 1048576} MB.`;
  }
  return null;
}

const ext = (file) => {
  const fromName = (file.name || "").split(".").pop();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  return (file.type.split("/")[1] || "mp3").replace("mpeg", "mp3").replace("x-wav", "wav").replace("x-m4a", "m4a");
};

/** Upload one audio file. Resolves to a public https URL. */
export async function uploadAudio(file, userId) {
  const problem = describeAudioFile(file);
  if (problem) throw new Error(problem);

  const name = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext(file)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { cacheControl: "31536000", upsert: false, contentType: file.type || "audio/mpeg" });

  if (error) {
    if (/bucket/i.test(error.message || "")) {
      throw new Error(
        `Music storage is not reachable. Check that a public bucket named "${BUCKET}" ` +
        "exists in Supabase — the SQL is in supabase/schema.sql."
      );
    }
    if (/mime|content type/i.test(error.message || "")) {
      throw new Error(`${file.name || "That file"} is a type the storage bucket does not accept.`);
    }
    if (/row-level security|policy|unauthorized|jwt/i.test(error.message || "")) {
      throw new Error("Your session has expired. Please sign in again and retry the upload.");
    }
    throw new Error(error.message || "That upload did not go through.");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  if (!data?.publicUrl) throw new Error("Uploaded, but could not read the track back.");
  return data.publicUrl;
}
