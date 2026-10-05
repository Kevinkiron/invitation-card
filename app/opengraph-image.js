import { shareImage, OG_SIZE } from "@/lib/og";

/* The preview for welcvm.com itself. Invitations and cards have their
   own (app/i/[token], app/g/[token]). */
export const alt = "Welcvm — digital invitations and greeting cards";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return shareImage(null, "site");
}
