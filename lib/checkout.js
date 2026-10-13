"use client";

/* ══════════════════════════════════════════════════════════════════════
   CHECKOUT — pay with Razorpay and publish, from /create and
   /greetings/create. Server side: lib/razorpay.js, app/api/payments/*.

   1. /api/payments/order    saves the page as "pending_payment" and
                             creates the Razorpay order
   2. Razorpay Checkout      the payment sheet
   3. /api/payments/confirm  verifies and publishes — retried a few times
                             on its own, and remembered in localStorage
                             until it succeeds, so a payment can never
                             end up with nothing published: a failure,
                             a closed tab or a reload all come back to
                             resumePendingPayment().

   payAndPublish() resolves with { id, slug }. It rejects with an Error;
   `err.cancelled` means the person closed the sheet themselves, and
   `err.pending` means they PAID but publishing has not gone through yet
   (offer "Try again" → confirmPayment(session, err.pending)).
   ══════════════════════════════════════════════════════════════════════ */

const PENDING_KEY = "welcvm:pendingPayment";

let loading = null;
function loadCheckout() {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser."));
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error("Could not load the payment window. Check your connection and try again.")); };
      document.body.appendChild(s);
    });
  }
  return loading;
}

async function post(path, token, body) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    const e = new Error("No connection to the server.");
    e.retry = true;
    throw e;
  }
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: `Server error ${res.status}.` }; }
  if (!res.ok) {
    const e = new Error(data.error || `Request failed (${res.status}).`);
    e.status = res.status;
    e.retry = Boolean(data.retry) || res.status >= 500;
    throw e;
  }
  return data;
}

function savePending(p) {
  try { window.localStorage.setItem(PENDING_KEY, JSON.stringify({ ...p, at: Date.now() })); } catch { /* storage off */ }
}
function clearPending() {
  try { window.localStorage.removeItem(PENDING_KEY); } catch { /* storage off */ }
}
export function readPending() {
  try {
    const p = JSON.parse(window.localStorage.getItem(PENDING_KEY) || "null");
    /* a week is far longer than any real retry needs */
    return p && p.invitationId && Date.now() - (p.at || 0) < 7 * 864e5 ? p : null;
  } catch {
    return null;
  }
}

/* The unpaid draft from a payment sheet closed in this visit, so trying
   again reuses it (app/api/payments/order) instead of making another. */
const lastDraft = {};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Verify + publish, retrying transient failures. Resolves { id, slug, kind }. */
export async function confirmPayment(session, pending, attempts = 4) {
  const token = session?.access_token;
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const inv = await post("/api/payments/confirm", token, pending);
      clearPending();
      return { ...inv, kind: pending.kind };
    } catch (e) {
      last = e;
      if (!e.retry) break;
      await wait(800 * 2 ** i);
    }
  }
  if (last && !last.retry) clearPending(); // a definite "no" — nothing to resume
  const e = new Error(last?.message || "Publishing did not go through.");
  e.pending = pending;
  throw e;
}

/* After a reload: finish a payment that was made but not yet published. */
export async function resumePendingPayment(session, kind) {
  const p = typeof window !== "undefined" ? readPending() : null;
  if (!p || (kind && p.kind !== kind) || !session?.access_token) return null;
  return confirmPayment(session, p);
}

export async function payAndPublish({ session, kind, addons, title, design_config, events = [], description }) {
  const token = session?.access_token;
  if (!token) throw new Error("Please sign in again.");
  await loadCheckout();
  const order = await post("/api/payments/order", token, {
    kind, addons, invitation: { title, design_config }, events, invitationId: lastDraft[kind] || null,
  });
  lastDraft[kind] = order.invitationId;

  const paid = await new Promise((resolve, reject) => {
    let lastError = "";
    const rz = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: "INR",
      name: "Welcvm",
      description: description || (kind === "greeting" ? "Greeting card" : "Invitation"),
      prefill: { email: session?.user?.email || "" },
      notes: { invitation_id: order.invitationId },
      theme: { color: "#DE6B5A" },
      handler: (r) => resolve(r),
      modal: {
        confirm_close: true,
        ondismiss: () => {
          const e = new Error(lastError ? `Payment failed: ${lastError}` : "Payment cancelled.");
          e.cancelled = !lastError;
          reject(e);
        },
      },
    });
    rz.on("payment.failed", (r) => { lastError = r?.error?.description || "the payment was declined"; });
    rz.open();
  });

  const pending = {
    kind,
    invitationId: order.invitationId,
    razorpay_order_id: paid.razorpay_order_id,
    razorpay_payment_id: paid.razorpay_payment_id,
    razorpay_signature: paid.razorpay_signature,
  };
  savePending(pending); // before anything else can go wrong
  delete lastDraft[kind]; // paid: never reuse this one for another payment
  return confirmPayment(session, pending);
}
