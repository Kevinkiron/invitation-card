import "./globals.css";
import "./invitation.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
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
    title: "Welcvm Invites | Digital Wedding Invitations",
    description:
      "Design by chatting with AI. Send every guest their own link. Track RSVPs live.",
    type: "website",
  },
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Pinyon+Script&family=Jost:wght@300;400;500&family=Space+Grotesk:wght@400;700&family=Bebas+Neue&family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;700&display=swap"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
