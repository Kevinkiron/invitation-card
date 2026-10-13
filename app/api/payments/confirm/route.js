import { NextResponse } from "next/server";
import { ADDONS, planLabel } from "@/lib/pricing";
import {
  fetchOrder, fetchPayment, capturePayment, signatureValid, razorpayConfigured, userFromRequest,
} from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST {
     razorpay_order_id, razorpay_payment_id, razorpay_signature,
     invitation: { title, design_config },
     events: [{ name, event_date, event_time, venue, address }]   // optional
   } → { id, slug }

   Publishes the page only once the payment is proven:
     1. the signature Razorpay returned to the browser is checked
     2. the order and payment are fetched back from Razorpay: same user,
        paid in full (an authorised-but-uncaptured payment is captured)
     3. the add-ons written onto the page are the ones on the order —
        whatever the browser sent is replaced
   Calling it twice for the same payment returns the same invitation. */
export async function POST(req) {
  if (!razorpayConfigured()) return NextResponse.json({ error: "Payments are not set up yet." }, { status: 503 });
  const { user, db } = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  if (!signatureValid(orderId, paymentId, body.razorpay_signature)) {
    return NextResponse.json({ error: "The payment could not be verified." }, { status: 400 });
  }

  try {
    const order = await fetchOrder(orderId);
    if (order?.notes?.user_id !== user.id) {
      return NextResponse.json({ error: "This payment belongs to another account." }, { status: 403 });
    }
    let payment = await fetchPayment(paymentId);
    if (payment.order_id !== orderId || payment.amount !== order.amount) {
      return NextResponse.json({ error: "The payment does not match the order." }, { status: 400 });
    }
    if (payment.status === "authorized") payment = await capturePayment(paymentId, order.amount);
    if (payment.status !== "captured") {
      return NextResponse.json({ error: `The payment is ${payment.status}, not complete.` }, { status: 402 });
    }

    /* Already published for this payment (a retry, a double tap)? */
    const { data: seen } = await db.from("payments").select("invitation_id").eq("provider_ref", paymentId).maybeSingle();
    if (seen?.invitation_id) {
      const { data: inv } = await db.from("invitations").select("id, slug").eq("id", seen.invitation_id).maybeSingle();
      if (inv) return NextResponse.json(inv);
    }

    const addons = String(order.notes?.addons || "").split(",").filter((a) => a in ADDONS);
    const cfg = body.invitation?.design_config;
    if (!cfg || typeof cfg !== "object") return NextResponse.json({ error: "Nothing to publish." }, { status: 400 });
    const design_config = cfg.tokens ? { ...cfg, tokens: { ...cfg.tokens, addons } } : cfg;

    const { data: inv, error } = await db
      .from("invitations")
      .insert({
        owner_id: user.id,
        title: String(body.invitation?.title || "Invitation").slice(0, 200),
        design_config,
        status: "published",
        plan: "BASIC",
      })
      .select("id, slug")
      .single();
    if (error) throw error;

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
      if (e2) throw e2;
    }

    const { error: e3 } = await db.from("payments").insert({
      invitation_id: inv.id,
      amount: order.amount / 100,
      currency: "INR",
      plan: planLabel({ addons }),
      status: "completed",
      provider: "razorpay",
      provider_ref: paymentId,
    });
    if (e3) throw e3;

    return NextResponse.json(inv);
  } catch (e) {
    return NextResponse.json(
      { error: `Your payment went through, but publishing failed: ${e.message || "unknown error"}. Payment ${paymentId} — contact support and we'll publish it for you.` },
      { status: 500 }
    );
  }
}
