/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD TOKENS

   Deliberately much smaller than lib/design/wedding-tokens.js or
   lib/design/celebration-tokens.js: a greeting card is one message to one
   recipient, not an event with a guest list and RSVPs, so there is no
   AI interview and no model-authored patch to merge. The whole thing is
   collected by the scripted wizard in app/greetings/create/page.js and
   written directly — see also lib/greetings/occasions.js for the palette
   and motif each occasion starts from.
   ══════════════════════════════════════════════════════════════════════ */

export function emptyGreetingTokens(occasion) {
  return {
    _greeting: true,
    occasion: occasion?.slug || "",
    occasionName: occasion?.name || "",
    palette: occasion?.palette || {
      bg: "#1c1420", surface: "#241a2b", accent: "#c69a55", deep: "#8f294e", ink: "#fdf6ea", muted: "#c9b9c6",
    },
    motif: occasion?.motif || "botanical",
    particle: occasion?.particle || "petals",
    to: "",
    from: "",
    message: occasion?.greeting || "",
    media: {
      photoUrl: null,
      musicUrl: null,
      musicTrackId: null,
      musicLabel: null,
    },
  };
}

/** Does this token object represent a greeting card? */
export function isGreetingCard(tokens) {
  return Boolean(tokens?._greeting);
}

/** 0–100, matching the shape cinemaProgress()/celebrationProgress() use,
    for the same "N% · Occasion" progress readout on the create page. */
export function greetingProgress(tokens) {
  if (!tokens) return 0;
  const checks = [
    Boolean(tokens.occasion),
    Boolean(tokens.to?.trim()),
    Boolean(tokens.from?.trim()),
    Boolean(tokens.message?.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/** Ready to publish once the essentials are in — a photo and a chosen
    track are always optional. */
export function greetingPublishable(tokens) {
  return Boolean(tokens?.to?.trim() && tokens?.from?.trim() && tokens?.message?.trim());
}
