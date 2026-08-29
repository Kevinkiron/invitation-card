"use client";

import InvitationRenderer, { hasTemplate } from "@/components/InvitationRenderer";
import InvitePreview from "@/components/InvitePreview";
import { invitationFromRecord } from "@/lib/demo-data";
import { DEFAULT_TEMPLATE } from "@/lib/templates/registry";

/* Compatibility shim.
   The app's older render sites pass the legacy `cfg` shape
   ({ palette, font, motif, headline, subheadline }). Rather than
   rewriting each call site's data plumbing, this adapts that shape into
   the InvitationRenderer contract so the editor, the manage preview and
   the published guest page all resolve the SAME template component the
   gallery and preview pages use.

   Invitations created before templates existed have no `cfg.template`;
   those keep rendering the original InvitePreview so nothing that is
   already published changes appearance underneath its owner. */
export default function TemplateRenderer({ cfg, events = [], guestName, compact = false, mode }) {
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
