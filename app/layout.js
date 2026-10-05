import "./globals.css";
import "./responsive.css";
import "./invitation.css";
import "./wedding-cinema.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/share";

export const metadata = {
  /* Turns the relative preview-image paths into the absolute URLs
     WhatsApp needs (see lib/share.js). */
  metadataBase: new URL(SITE_URL),
  applicationName: "Welcvm",
  title: "Welcvm Invites | Digital Wedding Invitations for Indian Celebrations",
  description:
    "Create beautiful digital wedding invitations for Indian weddings — Haldi, Mehendi, Sangeet, Vivaah and Reception. Personalised guest links, live RSVP tracking and WhatsApp delivery.",
  keywords: [
    "indian wedding invitation",
    "digital shaadi card",
    "e-invite india",
    "sangeet mehendi invitation",
    "online wedding invitation india",
  ],
  openGraph: {
    title: "Welcvm — Invitations made with love 💌",
    description:
      "Beautiful digital invitations for weddings, birthdays and housewarmings, plus animated greeting cards. One link on WhatsApp, RSVPs tracked live.",
    type: "website",
    siteName: "Welcvm",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B0A2A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Faces the generative renderer picks between. Every typeSet in
            lib/design/tokens.js must be loadable here or the AI's choice
            silently falls back to a system font. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Pinyon+Script&family=Jost:wght@300;400;500&family=Space+Grotesk:wght@400;700&family=Bebas+Neue&family=Playfair+Display:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
