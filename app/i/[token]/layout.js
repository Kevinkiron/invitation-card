import { publicInvitation } from "@/lib/supabase-server";
import { shareMeta, SITE_URL } from "@/lib/share";

/* The link preview for an invitation (title, line, picture) when the
   link is pasted into WhatsApp and friends. The page itself is a client
   component, so the metadata lives here. Picture: ./opengraph-image.js */
export async function generateMetadata({ params }) {
  const inv = await publicInvitation(params.token);
  if (!inv) {
    return {
      title: "You're invited | Welcvm",
      description: "Tap to open your invitation and RSVP.",
    };
  }
  const { title, description } = shareMeta(inv);
  const url = `${SITE_URL}/i/${inv.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Welcvm" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default function InvitationLayout({ children }) {
  return children;
}
