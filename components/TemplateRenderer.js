"use client";

import InvitePreview from "@/components/InvitePreview";
import EditorialPreview from "@/components/templates/EditorialPreview";
import NoirPreview from "@/components/templates/NoirPreview";

/* The registry: every place in the app that renders an invitation — the
   template gallery, the /create wizard's design step and AI-chat preview,
   the customer's manage/preview tab, and the public guest page — goes
   through this single switch instead of importing a variant directly.
   Adding a new template variant means adding one entry here; every render
   site picks it up automatically. Falls back to "classic" (the original
   hero-panel + timeline layout) for templates that don't set a variant. */
const REGISTRY = {
  classic: InvitePreview,
  editorial: EditorialPreview,
  noir: NoirPreview,
};

export default function TemplateRenderer({ cfg, ...rest }) {
  const Variant = REGISTRY[cfg?.variant] || InvitePreview;
  return <Variant cfg={cfg} {...rest} />;
}
