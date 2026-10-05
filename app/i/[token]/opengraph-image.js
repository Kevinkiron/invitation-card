import { publicInvitation } from "@/lib/supabase-server";
import { shareImage, OG_SIZE } from "@/lib/og";

export const alt = "Your invitation";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }) {
  return shareImage(await publicInvitation(params.token), "invite");
}
