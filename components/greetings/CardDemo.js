"use client";

import { useEffect, useState } from "react";
import GreetingCard from "@/components/GreetingCard";

/* A greeting card that turns its own pages — cover, verse, letter — for
   the homepage phone (app/demo/card/[occasion]). Nobody can tap a phone
   mockup, so it flips by itself; reduced motion holds the cover. */
const PAGES = [0, 1, 2];
const EVERY_MS = 2600;

export default function CardDemo({ tokens }) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setPage((p) => (p + 1) % PAGES.length), EVERY_MS);
    return () => clearInterval(t);
  }, []);
  return (
    /* The card is shorter than a phone screen; centre it on the card's
       own colour so the phone shows no blank strip under it. */
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", background: tokens.palette?.bg || "#1c1420", overflow: "hidden" }}>
      <div style={{ width: "100%" }}>
        <GreetingCard tokens={tokens} preview focusPage={PAGES[page]} />
      </div>
    </div>
  );
}
