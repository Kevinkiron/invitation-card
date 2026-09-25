"use client";

import { useState } from "react";
import { photo, photoAlt } from "@/lib/greetings/photos";

/* ══════════════════════════════════════════════════════════════════════
   OCCASION CARD ART — the picture on each /greetings landing tile.

   Used to be a flat colour gradient with a parametric SVG motif blended
   over it (lib/design/showcase.js's cardMotif) — no actual photo of
   Christmas, Diwali, a birthday, anything. This renders that occasion's
   real photograph (lib/greetings/photos.js, downloaded at build time by
   scripts/fetch-greeting-photos.mjs) instead, and falls back to exactly
   that old gradient+motif background if the photo is missing or fails to
   load — a client component only because that fallback needs state.
   ══════════════════════════════════════════════════════════════════════ */
export default function OccasionCardArt({ occasion, motifUrl }) {
  const [failed, setFailed] = useState(!occasion.photo);

  return (
    <div
      className="g-card-art"
      style={{
        background: `linear-gradient(150deg, ${occasion.palette.surface}, ${occasion.palette.bg})`,
        backgroundImage: failed
          ? `linear-gradient(150deg, ${occasion.palette.surface}, ${occasion.palette.bg}), url("${motifUrl}")`
          : undefined,
        backgroundBlendMode: failed ? "normal, soft-light" : undefined,
        backgroundSize: failed ? "cover, 160% 160%" : undefined,
        backgroundPosition: failed ? "center, center" : undefined,
      }}
    >
      {!failed && (
        <img
          className="g-card-art-img"
          src={photo(occasion.photo)}
          alt={photoAlt(occasion.photo)}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span className="g-card-art-veil" aria-hidden="true" />
      <span className="g-card-name">{occasion.name}</span>
    </div>
  );
}
