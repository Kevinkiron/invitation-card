import { NextResponse } from "next/server";
import { ADDONS, priceOf } from "@/lib/pricing";
import { createOrder, razorpayConfigured, razorpayKeyId, userFromRequest } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST {
     kind: "invitation" | "greeting",
     addons: ["music", …],
     invitation: { title, design_config },
     invitationId,          // optional: the unpaid draft from a cancelled try
     events: [{ name, event_date, event_time, venue, address }]   // optional
   } → { orderId, amount, keyId, invitationId }

   Step 1 of 2 (step 2: /api/payments/confirm). The page is SAVED HERE,
   before anyone pays, as status "pending_payment" (not public: the
   public read policy only shows "published"), with a "pending" payment
   row. So once Razorpay takes the money there is always something on
   our side to publish — confirming only flips two statuses, and can be
   retried safely if the first attempt fails.

   The price is worked out here from the add-ons (lib/pricing.js), never
   taken from the browser, and the add-ons saved on the page are these. */
export async function POST(req) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Payments are not set up yet (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)." }, { status: 503 });
  }
  const { user, db } = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "greeting" ? "greeting" : "invitation";
  const addons = [...new Set((Array.isArray(body.addons) ? body.addons : []).filter((a) => a in ADDONS))];
  const amount = priceOf({ addons }) * 100; // paise

  const cfg = body.invitation?.design_config;
  if (!cfg || typeof cfg !== "object") return NextResponse.json({ error: "Nothing to publish." }, { status: 400 });
  const design_config = cfg.tokens ? { ...cfg, tokens: { ...cfg.tokens, addons } } : cfg;

  try {
    const fields = {
      title: String(body.invitation?.title || "Invitation").slice(0, 200),
      design_config,
    };

    /* Paying again after closing the payment sheet reuses the same
       unpaid draft instead of leaving one behind per attempt. */
    let inv = null;
    const reuse = String(body.invitationId || "");
    if (reuse) {
      const { data: prev } = await db
        .from("invitations").select("id, slug, status, owner_id").eq("id", reuse).maybeSingle();
      if (prev && prev.owner_id === user.id && prev.status === "pending_payment") {
        const { data, error } = await db
          .from("invitations").update(fields).eq("id", prev.id).select("id, slug").single();
        if (error) throw new Error(`saving the page: ${error.message}`);
        inv = data;
        await db.from("invitation_events").delete().eq("invitation_id", prev.id);
      }
    }
    if (!inv) {
      const { data, error } = await db
        .from("invitations")
        .insert({ owner_id: user.id, ...fields, status: "pending_payment", plan: "BASIC" })
        .select("id, slug")
        .single();
      if (error) throw new Error(`saving the page: ${error.message}`);
      inv = data;
    }

    const events = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
    if (events.length) {
      const rows = events.map((e, i) => ({
        invitation_id: inv.id,
        name: String(e?.name || "Celebration").slice(0, 80),
        event_date: e?.event_date || null,
        event_time: e?.event_time || null,
        venue: String(e?.venue || "").slice(0, 160),
        address: String(e?.address || "").slice(0, 160),
        sort_order: i,
      }));
      const { error: e2 } = await db.from("invitation_events").insert(rows);
      if (e2) throw new Error(`saving the events: ${e2.message}`);
    }

    const order = await createOrder(amount, `inv_${inv.id.replace(/-/g, "").slice(0, 24)}`, {
      user_id: user.id,
      invitation_id: inv.id,
      kind,
      addons: addons.join(","),
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: razorpayKeyId(), invitationId: inv.id });
  } catch (e) {
    console.error("[payments/order]", e);
    return NextResponse.json({ error: `Could not start the payment — ${e.message || "unknown error"}.` }, { status: 502 });
  }
}
