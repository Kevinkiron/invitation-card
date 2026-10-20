import { publicInvitation } from "@/lib/supabase-server";
import { shareImage, BANNER_SIZE } from "@/lib/og";

export const alt = "A card for you";
export const size = BANNER_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }) {
  return shareImage(await publicInvitation(params.token), "greeting");
}
