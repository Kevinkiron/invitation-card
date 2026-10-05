import { createClient } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════════════════════════════
   A server-side Supabase reader for the link previews (lib/share.js).

   Separate from lib/supabase.js because that client keeps a signed-in
   session in the browser; here there is no browser and no user — just
   the public, published invitation behind a link (the
   "invitation_public_read" policy in supabase/one-link-rsvp.sql).

   Next caches fetch() on the server by default, which would freeze a
   preview at whatever the invitation said the first time anyone shared
   it. Five minutes keeps WhatsApp's crawler fast without that.
   ══════════════════════════════════════════════════════════════════════ */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const server = url && key
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300 } }) },
    })
  : null;

/* The published invitation behind a share link, or null. Never throws:
   a preview that fails just falls back to the site's own. */
export async function publicInvitation(slug) {
  if (!server || !slug) return null;
  try {
    const { data } = await server
      .from("invitations")
      .select("title, slug, design_config, status")
      .eq("slug", String(slug))
      .eq("status", "published")
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}
