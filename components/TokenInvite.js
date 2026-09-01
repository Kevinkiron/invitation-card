"use client";

import { useEffect, useRef } from "react";
import { render } from "@/lib/design/renderer";

/* Mounts the token renderer inside React. The renderer is deliberately
   framework-free — it also runs on the published guest page and could run
   in a worker for thumbnails — so this is just a host element for it. */
export default function TokenInvite({ tokens }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!tokens?.design?.palette?.bg) return;   // nothing designed yet
    try {
      render(tokens, el);
    } catch (e) {
      // A renderer throw must not take the whole create page down.
      console.error("[TokenInvite] render failed", e);
      el.innerHTML = "";
    }
    return () => {
      if (el._cd) clearInterval(el._cd);
      const root = el.querySelector(".inv-root");
      if (root?._cd) clearInterval(root._cd);
    };
  }, [tokens]);

  return <div ref={ref} style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }} />;
}
