"use client";

import InvitationRenderer, { hasTemplate } from "@/components/InvitationRenderer";
import InvitePreview from "@/components/InvitePreview";
import TokenInvite from "@/components/TokenInvite";
import WeddingCinema from "@/components/WeddingCinema";
import CelebrationCinema from "@/components/CelebrationCinema";
import { isCinema } from "@/lib/design/wedding-tokens";
import { isCelebration } from "@/lib/design/celebration-tokens";
import { invitationFromRecord } from "@/lib/demo-data";
import { DEFAULT_TEMPLATE } from "@/lib/templates/registry";

/* Compatibility shim — and the single place that decides how a stored
   `design_config` becomes pixels. The guest page (/i/[token]) and the
   owner's preview (/manage/[id]) both come through here, so all three
   generations of stored config are resolved in one spot:

     v2      { v: 2, tokens }   — the AI designed it. lib/design/renderer
                                  draws it: the same code that drew the
                                  live preview while they were chatting.
                                  For weddings, WeddingCinema draws the
                                  cinematic template.
     legacy  { template: … }    — one of the prebuilt template components.
     oldest  { palette, … }     — pre-template invitations, kept rendering
                                  through InvitePreview so nothing already
                                  published changes under its owner.

   This is the fix for published v2 links showing an empty card: a v2
   config has no `template` and no `palette`, so it used to fall all the
   way through to InvitePreview, which then had nothing to draw. */
export default function TemplateRenderer({ cfg, events = [], guestName, compact = false, mode }) {
  if (cfg?.v === 2) {
    const tokens = cfg.tokens || cfg;

    /* Weddings first. A wedding token set carries `_cinema`; a birthday,
       naming or housewarming carries `_premium` with its kind. They are
       separate flags on purpose — testing one shape's flag against the
       other's tokens is how an anniversary ended up in a bride-and-groom
       template once already. */
    if (isCinema(cfg.tokens) || isCinema(cfg)) {
      return <WeddingCinema tokens={tokens} preview={compact} />;
    }
    if (isCelebration(cfg.tokens) || isCelebration(cfg)) {
      return <CelebrationCinema tokens={tokens} preview={compact} />;
    }
    return <TokenInvite tokens={cfg.tokens} fit={compact ? "scroll" : "flow"} />;
  }

  const slug = cfg?.template;

  if (!slug || !hasTemplate(slug)) {
    return <InvitePreview cfg={cfg} events={events} guestName={guestName} compact={compact} />;
  }

  return (
    <InvitationRenderer
      templateId={slug || DEFAULT_TEMPLATE}
      mode={mode || (compact ? "gallery" : "editor")}
      invitationData={invitationFromRecord({ config: cfg, events, guestName })}
    />
  );
}

/* The RSVP block sits directly beneath the invitation, so it has to wear
   the same colours — otherwise a black concert poster is followed by a
   cream form. Returns [heading, accent, background, ink, muted, surface].
   Callers pass a fallback for configs that carry no palette at all. */
export function paletteOf(cfg, fallback) {
  if (cfg?.v === 2) {
    if (
      isCinema(cfg.tokens) || isCinema(cfg) ||
      isCelebration(cfg.tokens) || isCelebration(cfg)
    ) {
      const p = cfg.tokens?.palette || cfg.palette || {};
      return [
        p.primary || "#8f294e",
        p.accent || "#c69a55",
        p.paper || "#fff8ea",
        p.text || "#4f392f",
        p.secondary || "#7b594e",
        p.paper || "#fff8ea",
      ];
    }
    const p = cfg.tokens?.design?.palette;
    if (p?.bg) return [p.deep || p.ink, p.accent, p.bg, p.ink, p.muted, p.surface];
  }
  if (Array.isArray(cfg?.palette) && cfg.palette.length >= 3) {
    const [a, b, c] = cfg.palette;
    return [a, b, c, fallback[3], fallback[4], c];
  }
  return fallback;
}
