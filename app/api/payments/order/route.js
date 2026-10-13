import { NextResponse } from "next/server";
import { ADDONS, priceOf } from "@/lib/pricing";
import { createOrder, razorpayConfigured, razorpayKeyId, userFromRequest } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST { kind: "invitation" | "greeting", addons: ["music", …] }
   → { orderId, amount, keyId }

   The price is worked out here from the add-ons (lib/pricing.js), never
   taken from the browser. The add-ons and the user ride along on the
   order's notes, and /api/payments/confirm trusts only those. */
export async function POST(req) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Payments are not set up yet (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)." }, { status: 503 });
  }
  const { user } = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "greeting" ? "greeting" : "invitation";
  const addons = [...new Set((Array.isArray(body.addons) ? body.addons : []).filter((a) => a in ADDONS))];
  const amount = priceOf({ addons }) * 100; // paise

  try {
    const order = await createOrder(amount, `wv_${Date.now().toString(36)}`, {
      user_id: user.id,
      kind,
      addons: addons.join(","),
    });
    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: razorpayKeyId() });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Could not start the payment." }, { status: 502 });
  }
}
