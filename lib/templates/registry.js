/* ══════════════════════════════════════════════════════════════
   TEMPLATE REGISTRY — the single source of truth.

   Templates are defined in code (a real React component per design),
   not as database rows, so the gallery, the standalone preview, the
   editor and the published invitation all resolve the SAME component
   from the SAME slug. A saved invitation only stores the slug.

   This file carries metadata only (no JSX) so it can be imported from
   server components and route metadata without pulling the renderer in.
   ══════════════════════════════════════════════════════════════ */

export const CATEGORIES = ["All", "Traditional", "Cultural", "Modern", "Luxury", "Minimal", "Floral"];

export const TEMPLATES = [
  {
    slug: "ceylon-heritage",
    name: "Ceylon Heritage",
    category: "Cultural",
    tagline: "Ivory, champagne gold and deep maroon",
    description:
      "A formal, symmetrical invitation built around an arched gold frame and an ornamental date medallion. Traditional decorative motifs sit alongside an elegant serif and a script couple name, with gold dust drifting quietly behind it all.",
    features: ["Arched gold frame", "Ornamental date medallion", "Blessing & guest wishes", "Drifting gold dust", "Sticky in-invitation nav"],
    sections: ["Hero", "Blessing", "Couple", "Countdown", "Story", "Events", "Venue", "Gallery", "RSVP", "Wishes", "Footer"],
    theme: { primary: "#5B1226", accent: "#C1994A", bg: "#FBF4E7", text: "#2C1E1A" },
    swatches: ["#5B1226", "#C1994A", "#FBF4E7"],
  },
  {
    slug: "velvet-homecoming",
    name: "Velvet Homecoming",
    category: "Luxury",
    tagline: "Burgundy, black and champagne — cinematic editorial",
    description:
      "A luxury fashion-editorial take on the wedding invitation. A full-bleed cinematic hero with a slow Ken Burns drift, chapter-numbered story beats, floating gold embers and butterflies, and an oversized editorial typographic hierarchy.",
    features: ["Full-bleed Ken Burns hero", "Chapter-based story", "Gold embers & butterflies", "Editorial typography", "Cinematic scroll reveals"],
    sections: ["Hero", "Countdown", "Chapters", "Events", "Gallery", "Venue", "RSVP", "Footer"],
    theme: { primary: "#5A1224", accent: "#D2AC63", bg: "#120A0D", text: "#F3E7DC" },
    swatches: ["#5A1224", "#D2AC63", "#120A0D"],
  },
  {
    slug: "emerald-envelope",
    name: "Emerald Envelope",
    category: "Traditional",
    tagline: "Emerald, cream and antique gold — opens like a letter",
    description:
      "Begins closed, as a sealed envelope with a wax seal. Break the seal and the flap folds back to reveal the invitation, with petals falling through a botanical layout and a vertical ceremony timeline.",
    features: ["Interactive envelope opening", "Wax seal", "Falling petals", "Botanical sprigs", "Vertical ceremony timeline"],
    sections: ["Envelope", "Hero", "Couple", "Countdown", "Events", "Story", "Gallery", "Venue", "RSVP", "Footer"],
    theme: { primary: "#1E4D3B", accent: "#B99A55", bg: "#F6F2E6", text: "#20302A" },
    swatches: ["#1E4D3B", "#B99A55", "#F6F2E6"],
  },
  {
    slug: "azure-watercolour",
    name: "Azure Watercolour",
    category: "Floral",
    tagline: "Powder blue washes on soft paper",
    description:
      "Layered watercolour blooms bleed across a soft paper texture. An editorial two-column timeline, a frosted glass RSVP card and slowly floating particles keep it light, airy and unmistakably hand-painted.",
    features: ["Layered watercolour washes", "Paper texture", "Editorial timeline", "Frosted glass RSVP", "Floating particles"],
    sections: ["Hero", "Couple", "Countdown", "Story", "Events", "Gallery", "Venue", "RSVP", "Footer"],
    theme: { primary: "#3C6088", accent: "#C4A05C", bg: "#F4F7FA", text: "#25313D" },
    swatches: ["#3C6088", "#C4A05C", "#F4F7FA"],
  },
  {
    slug: "midnight-romance",
    name: "Midnight Romance",
    category: "Modern",
    tagline: "Black, charcoal and champagne gold",
    description:
      "A dark luxury editorial. A full-bleed portrait hero carries oversized names in gold foil, with gold line-art blooms, a fine grain overlay and drifting gold dust. Minimal, high-contrast and modern throughout.",
    features: ["Full-bleed portrait hero", "Gold foil shimmer names", "Gold line-art blooms", "Film grain overlay", "High-contrast minimal layout"],
    sections: ["Hero", "Couple", "Countdown", "Story", "Events", "Gallery", "Venue", "RSVP", "Footer"],
    theme: { primary: "#100F14", accent: "#CBA96A", bg: "#0B0A0E", text: "#EDE6DC" },
    swatches: ["#100F14", "#CBA96A", "#3A3742"],
  },
];

export const DEFAULT_TEMPLATE = "ceylon-heritage";

export function getTemplateMeta(slug) {
  return TEMPLATES.find((t) => t.slug === slug) || TEMPLATES.find((t) => t.slug === DEFAULT_TEMPLATE);
}
