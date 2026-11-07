"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT, clearConsent, getConsent, loadPixel, pageView, pixelAllowed, setConsent, stopPixel,
} from "@/lib/pixel";
import "@/app/consent.css";

/* The ad-measurement banner and the pixel it switches on (lib/pixel.js).
   Mounted once in app/layout.js. Shows only on pages that may carry the
   pixel, only until the visitor has chosen, and reopens from the footer's
   "Ad choices" button (see components/Footer.js). */
export default function MetaPixel() {
  const path = usePathname() || "/";
  const allowed = pixelAllowed(path);
  const [choice, setChoice] = useState("pending"); // "pending" | null (ask) | "yes" | "no"
  const first = useRef(true);

  useEffect(() => {
    setChoice(getConsent());
    const on = () => setChoice(getConsent());
    window.addEventListener(CONSENT_EVENT, on);
    return () => window.removeEventListener(CONSENT_EVENT, on);
  }, []);

  /* accepted → start the pixel on the first allowed page */
  useEffect(() => {
    if (choice === "yes" && allowed) loadPixel();
    if (choice === "no") stopPixel();
  }, [choice, allowed]);

  /* every later page (the first PageView is sent by loadPixel) */
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (choice === "yes" && allowed) pageView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (!allowed || choice === "pending" || choice === "yes" || choice === "no") return null;

  return (
    <div className="ck" role="dialog" aria-live="polite" aria-label="Advertising cookies">
      <p>
        We use a Meta (Facebook) pixel to see which of our ads bring people to Welcvm. It runs only if you
        say yes, and never on the invitations and cards you open from a link.{" "}
        <Link href="/privacy#ads">Details</Link>
      </p>
      <div className="ck-btns">
        <button type="button" className="ck-no" onClick={() => setConsent("no")}>No thanks</button>
        <button type="button" className="ck-yes" onClick={() => setConsent("yes")}>Accept</button>
      </div>
    </div>
  );
}

/* Footer button: change your mind later. */
export function AdChoices({ style }) {
  return (
    <button type="button" onClick={() => clearConsent()} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit", color: "inherit", textDecoration: "underline", ...style }}>
      Ad choices
    </button>
  );
}
