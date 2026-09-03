"use client";

import { useEffect, useRef } from "react";
import { render } from "@/lib/design/renderer";

/* Mounts the token renderer inside React. The renderer is deliberately
   framework-free — it runs here, on the published guest page, and in the
   landing-page showcase — so this is just a host element for it.

   The invitation renders inside a SHADOW ROOT. app/invitation.css also
   claims `.inv-root` (it sets background, colour and heading fonts for
   the legacy templates), and today the token renderer only wins because
   its <style> happens to be injected later in the document. That is luck,
   not design: the same collision on the landing page silently turned a
   black concert poster grey. A shadow root makes the invitation immune to
   anything the surrounding app declares, which is also true to life —
   a published invitation is a page with nothing else on it.

   @font-face is document-global, so the faces loaded in app/layout.js
   still apply inside the shadow root. */
export default function TokenInvite({ tokens, fit = "scroll" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!tokens?.design?.palette?.bg) return; // nothing designed yet

    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    shadow.innerHTML = "";

    try {
      render(tokens, shadow);
    } catch (e) {
      // A renderer throw must not take the host page down.
      console.error("[TokenInvite] render failed", e);
      shadow.innerHTML = "";
      return;
    }

    const root = shadow.querySelector(".inv-root");

    /* "scroll" is the create-page preview: the invitation scrolls inside a
       fixed-height phone. "flow" is the published guest page, where the
       invitation is part of a page that scrolls as a whole and the RSVP
       form follows underneath it. */
    if (root) {
      if (fit === "flow") {
        root.style.height = "auto";
        root.style.overflow = "visible";
      } else {
        root.style.height = "100%";
        root.style.overflowY = "auto";
      }
    }

    return () => {
      const r = shadow.querySelector(".inv-root");
      if (r?._cd) clearInterval(r._cd);
      if (host._cd) clearInterval(host._cd);
      shadow.innerHTML = "";
    };
  }, [tokens, fit]);

  return (
    <div
      ref={hostRef}
      style={
        fit === "flow"
          ? { width: "100%" }
          : { width: "100%", height: "100%", overflow: "hidden" }
      }
    />
  );
}
