import { NextResponse } from "next/server";
import { ADDONS, planLabel } from "@/lib/pricing";
import {
  fetchOrder, fetchPayment, capturePayment, signatureValid, razorpayConfigured, userFromRequest,
} from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST { invitationId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
   → { id, slug, status: "published" }

   Step 2 of 2 (step 1: /api/payments/order, which already saved the page
   as "pending_payment"). Publishes it once the payment is proven:
     1. Razorpay's signature over order_id|payment_id is checked
     2. the order and payment are fetched back from Razorpay: this user's
        order for this page, payment for that order, full amount, and
        authorised or captured (an authorised one is captured; if
        Razorpay's own auto-capture got there first, that is fine)
     3. the page goes to "published" and the payment is recorded
   Safe to call more than once: an already-published page is returned
   as it is. */
export async function POST(req) {
  if (!razorpayConfigured()) return NextResponse.json({ error: "Payments are not set up yet." }, { status: 503 });
  const { user, db } = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const invitationId = String(body.invitationId || "");
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");

  try {
    const { data: inv, error: e0 } = await db
      .from("invitations").select("id, slug, status, owner_id").eq("id", invitationId).maybeSingle();
    if (e0) throw new Error(`reading the page: ${e0.message}`);
    if (!inv || inv.owner_id !== user.id) {
      return NextResponse.json({ error: "That page could not be found on your account." }, { status: 404 });
    }
    if (inv.status === "published") return NextResponse.json({ id: inv.id, slug: inv.slug, status: inv.status });

    if (!signatureValid(orderId, paymentId, body.razorpay_signature)) {
      return NextResponse.json({ error: "The payment could not be verified (signature mismatch)." }, { status: 400 });
    }

    const order = await fetchOrder(orderId);
    if (order?.notes?.user_id !== user.id || order?.notes?.invitation_id !== inv.id) {
      return NextResponse.json({ error: "This payment is for a different page." }, { status: 403 });
    }
    let payment = await fetchPayment(paymentId);
    if (payment.order_id !== orderId || Number(payment.amount) !== Number(order.amount)) {
      return NextResponse.json({ error: "The payment does not match the order." }, { status: 400 });
    }
    if (payment.status === "authorized") {
      try {
        payment = await capturePayment(paymentId, order.amount);
      } catch {
        /* Most often Razorpay's own auto-capture won the race. Look again
           rather than failing a payment that went through. */
        payment = await fetchPayment(paymentId);
      }
    }
    if (!["captured", "authorized"].includes(payment.status)) {
      return NextResponse.json({ error: `The payment is ${payment.status}, not complete.` }, { status: 402 });
    }

    const { data: pub, error: e1 } = await db
      .from("invitations").update({ status: "published" }).eq("id", inv.id).select("id, slug, status").single();
    if (e1) throw new Error(`publishing the page: ${e1.message}`);

    /* One payment row per Razorpay payment (the table allows inserts
       but not updates, so it is written once, here). */
    const { data: seen } = await db.from("payments").select("id").eq("provider_ref", paymentId).maybeSingle();
    if (!seen) {
      const addons = String(order.notes?.addons || "").split(",").filter((a) => a in ADDONS);
      const { error: e2 } = await db.from("payments").insert({
        invitation_id: inv.id,
        amount: Number(order.amount) / 100,
        currency: "INR",
        plan: planLabel({ addons }),
        status: "completed",
        provider: "razorpay",
        provider_ref: paymentId,
      });
      if (e2) console.error("[payments/confirm] payment row", e2);
    }

    return NextResponse.json(pub);
  } catch (e) {
    console.error("[payments/confirm]", e);
    return NextResponse.json(
      { error: `Your payment went through, but publishing hit a problem — ${e.message || "unknown error"}. Tap "Try again"; you will not be charged twice.`, retry: true },
      { status: 500 }
    );
  }
}
