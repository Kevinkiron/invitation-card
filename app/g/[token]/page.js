"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import GreetingCard from "@/components/GreetingCard";
import { supabase } from "@/lib/supabase";
import { Loading, Empty } from "@/components/ui";
import { C } from "@/lib/theme";

/* ══════════════════════════════════════════════════════════════════════
   THE GREETING CARD GUEST PAGE — one link, one card, no RSVP.

   Deliberately a separate route from app/i/[token]/page.js rather than a
   branch inside it: that page is built entirely around a stepper (RSVP,
   name, number, blessing) that a greeting card has no use for at all — a
   greeting card is a message to one person, not an event with guests.
   Keeping this route small and independent means the RSVP flow for
   weddings/celebrations is never at risk from this feature.
   ══════════════════════════════════════════════════════════════════════ */
export default function GreetingGuestPage() {
  const { token: code } = useParams();
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: i } = await supabase
          .from("invitations").select("*").eq("slug", code).maybeSingle();

        if (!i || i.design_config?.kind !== "greeting") {
          setErr("This card link isn't valid.");
          return;
        }
        setInv(i);
      } catch (e) {
        setErr(e.message || "Could not open this card.");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) return <Loading />;
  if (err || !inv) return <Empty title="Card not found" sub={err || "This link may have expired or been typed incorrectly."} />;

  const tokens = inv.design_config?.tokens || {};

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      <GreetingCard tokens={tokens} />

      <Link
        href="/greetings"
        style={{
          position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)", zIndex: 40,
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,.94)", color: C.ink,
          padding: "10px 18px", borderRadius: 999, textDecoration: "none",
          fontSize: 12.5, fontWeight: 800, boxShadow: "0 10px 30px -12px rgba(0,0,0,.35)",
        }}
      >
        <Sparkles size={13} color={C.heart} /> Send one of your own
      </Link>
    </div>
  );
}
