import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "Coderpace Invites | Digital Wedding Invitations for Indian Celebrations",
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
    title: "Coderpace Invites | Digital Wedding Invitations",
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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
