import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════════════════════════════
   RAZORPAY — server side only (app/api/payments/*). Never import this
   from a client component: it reads the key secret.

   Env (Vercel → Project → Settings → Environment Variables, and
   .env.local for development):
     RAZORPAY_KEY_ID       rzp_test_… / rzp_live_…  (sent to the browser
                           with each order, it is public by design)
     RAZORPAY_KEY_SECRET   never leaves the server

   Flow (lib/checkout.js on the client):
     1. /api/payments/order     price worked out HERE from the add-ons,
                                Razorpay order created, its id returned
     2. Razorpay Checkout       the guest-facing payment sheet
     3. /api/payments/confirm   signature checked, payment fetched back
                                from Razorpay, then the page is published
   ══════════════════════════════════════════════════════════════════════ */

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export function razorpayConfigured() {
  return Boolean(KEY_ID && KEY_SECRET);
}
export function razorpayKeyId() {
  return KEY_ID;
}

async function rzp(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.description || `Razorpay error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const createOrder = (amountPaise, receipt, notes) =>
  rzp("/orders", { method: "POST", body: { amount: amountPaise, currency: "INR", receipt, notes } });
export const fetchOrder = (id) => rzp(`/orders/${encodeURIComponent(id)}`);
export const fetchPayment = (id) => rzp(`/payments/${encodeURIComponent(id)}`);
export const capturePayment = (id, amount) =>
  rzp(`/payments/${encodeURIComponent(id)}/capture`, { method: "POST", body: { amount, currency: "INR" } });

/* Razorpay signs `order_id|payment_id` with the key secret. */
export function signatureValid(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* A Supabase client acting as the signed-in user (their access token),
   so every insert still goes through the row-level security policies. */
export async function userFromRequest(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!token || !url || !anon) return { user: null, db: null };
  const db = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return { user: null, db: null };
  return { user: data.user, db };
}
