import { cardTheme } from "@/lib/greetings/card-themes";

/* ══════════════════════════════════════════════════════════════════════
   SHARING — what a Welcvm link says about itself when it is passed on.

   Two places read this, and they must agree:

   - the WhatsApp message the host sends ("Share on WhatsApp" on the
     manage page, and on the greeting card once it is live), and
   - the link preview WhatsApp, iMessage, Telegram and Instagram draw
     under that message: the title, the line beneath it and the picture
     (app/i/[token]/layout.js, app/g/[token]/layout.js and the
     opengraph-image.js beside each).

   Everything is worked out from the invitation row alone, so it runs the
   same on the server (for the preview) and in the browser (for the
   message). Nothing here is invented: a line we have no fact for is left
   out rather than filled with a placeholder.
   ══════════════════════════════════════════════════════════════════════ */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://welcvm.com").replace(/\/+$/, "");

const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const join = (...parts) => parts.map(clean).filter(Boolean).join(", ");

/* The emoji that opens the WhatsApp message, by kind of event. */
const EVENT_EMOJI = {
  wedding: "💍", engagement: "💍", birthday: "🎂", naming: "👶", baptism: "👶",
  housewarming: "🏡", anniversary: "💞", concert: "🎶", conference: "📣",
};
const GREETING_EMOJI = {
  christmas: "🎄", "new-year": "🎆", diwali: "🪔", onam: "🌼", eid: "🌙", holi: "🎨",
  "raksha-bandhan": "🧡", pongal: "🌾", "birthday-wish": "🎂", "anniversary-wish": "💞",
  "thank-you": "🙏", "get-well": "💐", congratulations: "🎉", farewell: "👋",
};

/* Pull the facts out of whichever shape of design_config this is. */
export function shareFacts(inv) {
  const cfg = inv?.design_config || {};
  const t = cfg.tokens || {};

  /* Greeting card (v3, kind "greeting"). */
  if (cfg.kind === "greeting") {
    const theme = cardTheme(t.occasion, { name: t.occasionName });
    const wish = clean(`${theme.kicker || ""} ${theme.script || t.occasionName || ""}`).replace(/!+$/, "") || "A little something";
    return {
      kind: "greeting",
      occasion: t.occasion || "",
      emoji: GREETING_EMOJI[t.occasion] || "💌",
      wish,
      to: clean(t.to),
      from: clean(t.from),
      occasionName: clean(t.occasionName) || wish,
      photo: t.media?.photoUrl || null,
      accent: theme.panel || "#8f294e",
      paper: theme.paper || "#fbf6ee",
      ink: theme.ink || "#4A443C",
    };
  }

  /* Wedding cinema. */
  if (t._cinema) {
    const c = t.couple || {};
    const names = [clean(c.bride), clean(c.groom)].filter(Boolean).join(" & ");
    return {
      kind: "wedding",
      emoji: "💍",
      names,
      headline: names || clean(inv?.title) || "Our Wedding",
      eventLabel: "wedding",
      hosts: clean(c.hosts),
      date: clean(t.invitation?.displayDate),
      place: join(t.venue?.name, t.venue?.city),
      photo: t.media?.heroImageUrl || t.media?.galleryImages?.[0] || null,
      accent: t.palette?.accent || "#B8862F",
    };
  }

  /* Celebrations: birthday, naming, housewarming, … */
  if (t.host || ["birthday", "naming", "housewarming", "celebration"].includes(t.eventKind)) {
    const h = t.host || {};
    const kind = t.eventKind || "celebration";
    const label = {
      birthday: `${h.age ? `${clean(h.age)} ` : ""}birthday`,
      naming: "naming ceremony",
      housewarming: "housewarming",
    }[kind] || "celebration";
    const who = [clean(h.name), clean(h.secondName)].filter(Boolean).join(" & ");
    const headline = clean(t.invitation?.headline) ||
      (who ? (kind === "housewarming" ? `${who}'s Housewarming` : `${who}'s ${label.replace(/\b[a-z]/g, (m) => m.toUpperCase())}`) : "") ||
      clean(inv?.title) || "You're invited";
    return {
      kind,
      emoji: EVENT_EMOJI[kind] || "🎉",
      names: who,
      headline,
      eventLabel: label,
      hosts: clean(h.hosts),
      date: clean(t.invitation?.displayDate),
      place: join(t.venue?.name, t.venue?.city),
      photo: t.media?.heroImageUrl || t.media?.galleryImages?.[0] || null,
      accent: t.palette?.accent || "#DE6B5A",
    };
  }

  /* Generative v2 designs, and the old template configs. */
  const c = t.content || {};
  const two = [clean(c.headline), clean(c.headlineB)].filter(Boolean);
  const headline = two.join(` ${clean(c.joiner) || "&"} `) || clean(cfg.headline) || clean(inv?.title) || "You're invited";
  const kind = clean(cfg.eventKind || t.eventKind || cfg.eventType).toLowerCase();
  return {
    kind: kind || "event",
    emoji: EVENT_EMOJI[kind] || "🎉",
    names: headline,
    headline,
    eventLabel: kind && kind !== "event" ? kind : "celebration",
    hosts: "",
    date: clean(c.subhead),
    place: clean(c.place),
    photo: t.media?.galleryImages?.[0] || null,
    accent: t.design?.palette?.accent || "#DE6B5A",
  };
}

/* Title + description for the link preview. */
export function shareMeta(inv) {
  const f = shareFacts(inv);
  if (f.kind === "greeting") {
    const title = f.to ? `${f.wish}, ${f.to}! ${f.emoji}` : `${f.wish} ${f.emoji}`;
    const description = `${f.from ? `${f.from} sent` : "Someone sent"} you a ${f.occasionName} card. Tap to open the envelope 💌`;
    return { title, description, facts: f };
  }
  const title = f.kind === "wedding" && f.names
    ? `${f.names} are getting married ${f.emoji}`
    : `${f.headline} ${f.emoji}`;
  const when = [f.date, f.place].filter(Boolean).join(" · ");
  const description = `You're invited${when ? ` · ${when}` : ""}. Tap to open your invitation and RSVP.`;
  return { title, description, facts: f };
}

/* The ready-to-send WhatsApp message. WhatsApp's own formatting:
   *bold*, _italic_. The link goes last, on its own line, so WhatsApp
   draws the preview card for it. */
export function whatsappMessage(inv, link) {
  const f = shareFacts(inv);

  if (f.kind === "greeting") {
    return [
      `${f.emoji} *${f.wish}${f.to ? `, ${f.to}` : ""}!*`,
      "",
      `I made a little ${f.occasionName} card for you 💌`,
      "Tap the link to open the envelope:",
      link,
      ...(f.from ? ["", `— ${f.from}`] : []),
    ].join("\n");
  }

  const lines = [`${f.emoji} *You're invited!*`, ""];
  if (f.kind === "wedding") {
    lines.push(
      `${f.hosts ? f.hosts.replace(/[.,]+$/, "") : "Together with our families"}, we joyfully invite you to the wedding of`,
      `*${f.names || f.headline}*`,
    );
  } else if (f.names && f.names !== f.headline) {
    lines.push(`Please join us for *${f.headline}*`);
  } else {
    lines.push(`Please join us to celebrate *${f.headline}*`);
  }
  if (f.date || f.place) lines.push("");
  if (f.date) lines.push(`📅 ${f.date}`);
  if (f.place) lines.push(`📍 ${f.place}`);
  lines.push(
    "",
    "Open your invitation and let us know if you can make it 🙏",
    link,
  );
  return lines.join("\n");
}

export const whatsappHref = (inv, link) =>
  `https://wa.me/?text=${encodeURIComponent(whatsappMessage(inv, link))}`;
