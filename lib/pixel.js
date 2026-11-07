/* ══════════════════════════════════════════════════════════════════════
   META PIXEL — browser side. (The server-side Conversions API, if we add
   it, lives with the payment confirmation, not here.)

   NOTHING loads until the visitor presses Accept on the banner
   (components/MetaPixel.js): the choice is kept in localStorage under
   CONSENT_KEY ("yes" | "no"). Until then — and always after "no" —
   every call below does nothing, so it is safe to call from anywhere.

   Never loaded for what a *guest* sees (/i, /g, /demo): those pages are
   for the people an invitation or card was sent to, not for ad
   measurement, and a cookie banner has no place on a wedding invitation.
   See PIXEL_SKIP.

   Events (standard Meta names, so ads can optimise on them):
     PageView             every page, incl. client-side navigation
     CompleteRegistration an account was created        (AuthForm)
     InitiateCheckout     the Razorpay sheet opened      (lib/checkout.js)
     Purchase             payment verified, value in ₹   (lib/checkout.js)
   ══════════════════════════════════════════════════════════════════════ */

export const PIXEL_ID = "1876446943521852";
export const CONSENT_KEY = "welcvm_ads_consent_v1";
export const CONSENT_EVENT = "welcvm:consent";

/* Pages that never carry the pixel or the banner. */
export const PIXEL_SKIP = ["/demo", "/i/", "/g/", "/manage", "/admin", "/api"];
export const pixelAllowed = (path) => !PIXEL_SKIP.some((p) => (path || "").startsWith(p));

export function getConsent() {
  try { return window.localStorage.getItem(CONSENT_KEY); } catch { return null; }
}
export function setConsent(v) {
  try { window.localStorage.setItem(CONSENT_KEY, v); } catch { /* storage off: asked again next visit */ }
  try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v })); } catch { /* old browser */ }
}
export function clearConsent() {
  try { window.localStorage.removeItem(CONSENT_KEY); } catch { /* storage off */ }
  try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null })); } catch { /* old browser */ }
}

let loaded = false;

/* Meta's own loader snippet, unchanged apart from formatting. */
function bootstrap() {
  if (typeof window === "undefined" || window.fbq) return;
  const n = (window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
}

/* Start the pixel (once). Sends the first PageView. */
export function loadPixel() {
  if (typeof window === "undefined" || loaded || getConsent() !== "yes") return false;
  loaded = true;
  /* belt and braces: never init twice, even from a second copy of this file */
  if (window.__welcvmPixel) return true;
  window.__welcvmPixel = true;
  bootstrap();
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
  return true;
}

export function pageView() {
  if (loaded && getConsent() === "yes") window.fbq?.("track", "PageView");
}

/* Stop sending (a visitor who accepted and later changed their mind). */
export function stopPixel() {
  try { window.fbq?.("consent", "revoke"); } catch { /* not loaded */ }
}

/* track("Purchase", { value: 125, currency: "INR" }, "pay_123")
   `eventId` lets Meta ignore a repeat of the same event (a reload that
   re-confirms a payment, or the same event later sent from the server). */
export function track(name, data = {}, eventId) {
  if (typeof window === "undefined" || !loaded || getConsent() !== "yes") return;
  try {
    if (eventId) window.fbq("track", name, data, { eventID: String(eventId) });
    else window.fbq("track", name, data);
  } catch { /* tracking must never break a payment */ }
}
