"use client";

/* ══════════════════════════════════════════════════════════════════════
   CHECKOUT — pay with Razorpay and publish, from /create and
   /greetings/create. Server side: lib/razorpay.js, app/api/payments/*.

   payAndPublish() resolves with the published { id, slug }, or rejects
   with an Error; `err.cancelled` is set when the person closed the
   payment sheet themselves (not worth showing as an error).
   ══════════════════════════════════════════════════════════════════════ */

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
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}

export async function payAndPublish({ session, kind, addons, title, design_config, events = [], description }) {
  const token = session?.access_token;
  if (!token) throw new Error("Please sign in again.");
  await loadCheckout();
  const order = await post("/api/payments/order", token, { kind, addons });

  const paid = await new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: "INR",
      name: "Welcvm",
      description: description || (kind === "greeting" ? "Greeting card" : "Invitation"),
      prefill: { email: session?.user?.email || "" },
      theme: { color: "#DE6B5A" },
      handler: (r) => resolve(r),
      modal: {
        ondismiss: () => { const e = new Error("Payment cancelled."); e.cancelled = true; reject(e); },
      },
    });
    rz.on("payment.failed", (r) => {
      /* Razorpay keeps its sheet open so they can retry with another
         method; this only records why, for the message if they close it. */
      rz.__lastError = r?.error?.description;
    });
    rz.open();
  });

  return post("/api/payments/confirm", token, {
    ...paid,
    invitation: { title, design_config },
    events,
  });
}
