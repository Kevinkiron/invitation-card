/* Home-screen install: name, colours and the heart icon. */
export default function manifest() {
  return {
    name: "Welcvm Invites",
    short_name: "Welcvm",
    description: "Digital invitations and greeting cards, made with love.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2EFE3",
    theme_color: "#4A443C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
