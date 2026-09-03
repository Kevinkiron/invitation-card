"use client";

import InvitationRenderer, { hasTemplate } from "@/components/InvitationRenderer";
import InvitePreview from "@/components/InvitePreview";
import TokenInvite from "@/components/TokenInvite";
import { invitationFromRecord } from "@/lib/demo-data";
import { DEFAULT_TEMPLATE } from "@/lib/templates/registry";

/* Compatibility shim — and the single place that decides how a stored
   `design_config` becomes pixels. The guest page (/i/[token]) and the
   owner's preview (/manage/[id]) both come through here, so all three
   generations of stored config are resolved in one spot:

     v2      { v: 2, tokens }   — the AI designed it. lib/design/renderer
                                  draws it: the same code that drew the
                                  live preview while they were chatting.
     legacy  { template: … }    — one of the prebuilt template components.
     oldest  { palette, … }     — pre-template invitations, kept rendering
                                  through InvitePreview so nothing already
                                  published changes under its owner.

   This is the fix for published v2 links showing an empty card: a v2
   config has no `template` and no `palette`, so it used to fall all the
   way through to InvitePreview, which then had nothing to draw. */
export default function TemplateRenderer({ cfg, events = [], guestName, compact = false, mode }) {
  if (cfg?.v === 2) {
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
    const p = cfg.tokens?.design?.palette;
    if (p?.bg) return [p.deep || p.ink, p.accent, p.bg, p.ink, p.muted, p.surface];
  }
  if (Array.isArray(cfg?.palette) && cfg.palette.length >= 3) {
    const [a, b, c] = cfg.palette;
    return [a, b, c, fallback[3], fallback[4], c];
  }
  return fallback;
}
