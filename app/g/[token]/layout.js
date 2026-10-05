import { publicInvitation } from "@/lib/supabase-server";
import { shareMeta, SITE_URL } from "@/lib/share";

/* The link preview for a greeting card. See app/i/[token]/layout.js. */
export async function generateMetadata({ params }) {
  const inv = await publicInvitation(params.token);
  if (!inv) {
    return {
      title: "A card for you 💌 | Welcvm",
      description: "Someone sent you a card. Tap to open the envelope.",
    };
  }
  const { title, description } = shareMeta(inv);
  const url = `${SITE_URL}/g/${inv.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Welcvm" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export default function GreetingLayout({ children }) {
  return children;
}
