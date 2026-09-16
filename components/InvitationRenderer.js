"use client";

import CeylonHeritage from "@/components/templates/CeylonHeritage";
import VelvetHomecoming from "@/components/templates/VelvetHomecoming";
import EmeraldEnvelope from "@/components/templates/EmeraldEnvelope";
import AzureWatercolour from "@/components/templates/AzureWatercolour";
import MidnightRomance from "@/components/templates/MidnightRomance";
import { DEFAULT_TEMPLATE } from "@/lib/templates/registry";
import { DEMO_INVITATION } from "@/lib/demo-data";

/* ══════════════════════════════════════════════════════════════
   THE single source of truth.

   The gallery card, the standalone preview, the editor's live phone
   and the published guest page all render through this component.
   Nothing else imports a template directly, so a template can never
   drift between where it is previewed and where it is published.

   Modes:
     "gallery"   — miniature inside a phone card
     "preview"   — full-size template preview with demo data
     "editor"    — live invitation data while the customer edits
     "published" — the real invitation a guest opens
   ══════════════════════════════════════════════════════════════ */
const IMPLEMENTATIONS = {
  "ceylon-heritage": CeylonHeritage,
  "velvet-homecoming": VelvetHomecoming,
  "emerald-envelope": EmeraldEnvelope,
  "azure-watercolour": AzureWatercolour,
  "midnight-romance": MidnightRomance,
};

export function hasTemplate(slug) {
  return Boolean(IMPLEMENTATIONS[slug]);
}

export default function InvitationRenderer({
  templateId,
  mode = "preview",
  invitationData,
  guestData,
}) {
  const Template = IMPLEMENTATIONS[templateId] || IMPLEMENTATIONS[DEFAULT_TEMPLATE];

  // Merge guest personalisation in one place so every template receives
  // the same `data.guestName` contract rather than each handling guests.
  const data = {
    ...DEMO_INVITATION,
    ...(invitationData || {}),
    guestName: guestData?.name || invitationData?.guestName || null,
  };

  return <Template data={data} mode={mode} />;
}
