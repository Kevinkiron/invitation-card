/* ══════════════════════════════════════════════════════════════════════
   WEDDING CINEMA — the interview

   When the event is a wedding, this replaces the generic prompt. The
   model fills the wedding token schema (couple, invitation, venue,
   events, story) instead of the generic content/design tokens.

   WHY THE QUESTION PLAN LIVES IN CODE

   Every scene in components/WeddingCinema.js is gated on its own data:

     story.length      → no chapters, no "Their Story" scene at all
     events.length     → no timeline
     event.dressCode   → no colour band or dress line on the card
     venue.name        → no venue scene, no map
     couple.brideIntro → no "Meet the Couple"
     social.hashtag    → no share scene
     media.gallery     → no gallery

   So a question the model forgets to ask is not a small gap — it is a
   whole section of the invitation that silently never renders. Leaving
   the running order to the model's own judgement loses most of the page.
   The steps below are evaluated against the tokens on every turn and the
   model is told exactly which one to ask next, and what that answer
   switches on.
   ══════════════════════════════════════════════════════════════════════ */

const has = (v) => typeof v === "string" && v.trim().length > 0;
const list = (xs) => (Array.isArray(xs) ? xs : []);

/* The functions that make up an Indian wedding, with the styling each one
   conventionally carries. The model may use these to fill `theme` and
   `dressCode` when the couple do not specify — house style, not invented
   fact. Times and venues are never defaulted. */
export const FUNCTION_STYLE = {
  haldi:     { theme: "Haldi Yellow",            dressCode: "Yellow, ivory or floral" },
  mehendi:   { theme: "Mehendi Green",           dressCode: "Greens and soft pastels" },
  sangeet:   { theme: "Sangeet Indigo & Silver", dressCode: "Festive Indian" },
  ceremony:  { theme: "Royal Maroon & Gold",     dressCode: "Indian festive luxury" },
  nikah:     { theme: "Ivory & Gold",            dressCode: "Modest formal" },
  reception: { theme: "Emerald & Gold",          dressCode: "Cocktail or Indo-western" },
  after:     { theme: "Midnight & Neon",         dressCode: "Whatever you can dance in" },
};

/* An event card is only finished when it can fill its row in the
   timeline: a name, when it starts, and where. */
const eventComplete = (e) => has(e?.name) && has(e?.time) && has(e?.venue);
const firstIncomplete = (t) => list(t?.events).find((e) => !eventComplete(e));
const firstUndressed = (t) => list(t?.events).find((e) => !has(e?.dressCode));

/* ── The plan ──────────────────────────────────────────────────────────
   Ordered by what the guest sees first and by what the couple can answer
   without having to think. Each step names the scene it switches on,
   which is also what the model tells the couple — "that gives us the
   timeline" reads better than "next question". */
export const WEDDING_STEPS = [
  /* ── 1. The names ── */
  {
    id: "names",
    group: "The names",
    unlocks: "the opening scene, the monogram, and the names everywhere else",
    done: (t) => has(t?.couple?.bride) && has(t?.couple?.groom),
    ask: () => "What are the two first names \u2014 bride and groom?",
  },

  /* ── 2. The date that scratches away to reveal itself ── */
  {
    id: "date",
    group: "The date",
    unlocks: "the date-reveal scene and the countdown",
    done: (t) => has(t?.invitation?.displayDate),
    ask: () => "What is the wedding date, and what time does the main ceremony begin?",
  },

  /* ── 3. The card: faith, families, and where ──
     These three fill the one card at the top of the invitation — the
     symbol, the hosts line, and the venue under the date. */
  {
    id: "religion",
    group: "The card",
    unlocks: "the symbol and the invocation at the head of the invitation card",
    done: (t) => has(t?.invitation?.religion),
    ask: () =>
      "Which tradition is the ceremony in \u2014 Hindu, Muslim, Christian, Sikh, Jain, Buddhist, or a mix? It sets the symbol at the top of the card.",
  },
  {
    id: "hosts",
    group: "The card",
    unlocks: "the families line across the card",
    done: (t) => has(t?.couple?.hosts),
    ask: () =>
      "Which two families are hosting? I will set it as \u201cTogether with the \u2026 and \u2026 families\u201d.",
  },
  {
    id: "venue",
    group: "The card",
    unlocks: "the venue under the date, and the destination scene later on",
    done: (t) => has(t?.venue?.name) && has(t?.venue?.city),
    ask: () => "Where is the main ceremony \u2014 the venue name and the city?",
  },

  /* ── 4. Meet the couple, then their story and its photographs ── */
  {
    id: "couple",
    group: "The couple",
    unlocks: "the \u201cMeet the Couple\u201d scene",
    done: (t) => has(t?.couple?.brideIntro) && has(t?.couple?.groomIntro),
    ask: (t) => {
      const b = t?.couple?.bride || "the bride";
      const g = t?.couple?.groom || "the groom";
      if (!has(t?.couple?.brideIntro) && !has(t?.couple?.groomIntro))
        return `One line about each of them \u2014 what is ${b} like, and what is ${g} like?`;
      return has(t?.couple?.brideIntro) ? `And a line about ${g}?` : `And a line about ${b}?`;
    },
  },
  {
    /* The full-bleed photograph the curtain lifts on. Nothing else can
       fill it \u2014 every other picture slot draws a scene further down the
       page \u2014 so without this step the opening was two names on bare
       paper however many photographs the couple had sent. */
    id: "openingPhoto",
    group: "The couple",
    ack: true,
    unlocks: "the opening scene \u2014 your photograph behind the two names",
    done: (t) => Boolean(t?.media?.heroImageUrl),
    ask: (t) => {
      const b = t?.couple?.bride;
      const g = t?.couple?.groom;
      const who = b && g ? `${b} and ${g}` : "the two of you";
      return `Now one photograph of ${who} for the opening \u2014 tap the paperclip. It sits full-width behind your names as the curtain lifts, so pick one with a little room around them.`;
    },
  },
  {
    id: "story",
    group: "Their story",
    unlocks: "\u201cTheir Story\u201d, the chapters guests scroll through",
    done: (t) => list(t?.story).length >= 2,
    ask: (t) =>
      list(t?.story).length
        ? "One more moment for their story \u2014 the proposal, or something everyone remembers?"
        : "Two or three moments from their story \u2014 how they met, and the proposal?",
  },
  {
    id: "storyPhotos",
    group: "Their story",
    ack: true,
    unlocks: "the photograph on each story chapter",
    /* One per chapter. A single picture used to satisfy this, so a
       couple who sent one early were never asked again and the other two
       chapters rendered with an empty frame beside them. */
    done: (t) =>
      list(t?.media?.storyImages).length > 0 &&
      list(t?.media?.storyImages).length >= list(t?.story).length,
    ask: (t) =>
      `Now two or three photographs for those chapters \u2014 tap the paperclip and pick them all at once. They sit beside ${
        list(t?.story).length ? "each moment" : "each chapter"
      }, in the order you send them.`,
  },

  /* ── 5. The other functions and their timings ── */
  {
    id: "functions",
    group: "The celebrations",
    unlocks: "the celebrations timeline",
    done: (t) => list(t?.events).length > 0,
    ask: () =>
      "Which functions are you holding besides the ceremony \u2014 haldi, mehendi, sangeet, reception? Name whichever you are having.",
  },
  {
    id: "functionDetail",
    group: "The celebrations",
    unlocks: "the time and the place on each card in the timeline",
    done: (t) => list(t?.events).length > 0 && !firstIncomplete(t),
    ask: (t) => {
      const e = firstIncomplete(t);
      const name = e?.name || "that function";
      if (!has(e?.time) && !has(e?.venue)) return `What time does the ${name} start, and where is it held?`;
      if (!has(e?.time)) return `What time does the ${name} start?`;
      return `Where is the ${name} held?`;
    },
  },
  {
    id: "dress",
    group: "The celebrations",
    unlocks: "the colour band and the dress line on each card",
    done: (t) => list(t?.events).length > 0 && !firstUndressed(t),
    ask: (t) => {
      const e = firstUndressed(t);
      return `Is there a colour or dress code for the ${e?.name || "functions"}? I can use the usual one if you would rather.`;
    },
  },

  /* ── 6. The destination ── */
  {
    id: "map",
    group: "The destination",
    ack: true,
    unlocks: "the live map and the \u201copen in maps\u201d button in the destination scene",
    done: (t) => has(t?.venue?.mapLink),
    ask: (t) =>
      `Drop the Google Maps link for ${t?.venue?.name || "the venue"} and I will pin it exactly \u2014 open Maps, tap Share, copy link. If you would rather not hunt for it, say skip and I will search for the name instead.`,
  },
  {
    id: "travel",
    group: "The destination",
    ack: true,
    unlocks: "the parking, transport and directions notes under the map",
    done: (t) => has(t?.venue?.parking) || has(t?.venue?.nearestTransport) || has(t?.venue?.directions),
    ask: () => "Anything guests should know about getting there \u2014 parking, or the nearest airport or station?",
  },

  /* ── 7. RSVP ── */
  {
    id: "rsvp",
    group: "RSVP",
    ack: true,
    unlocks: "the line above the RSVP stepper guests fill in",
    done: (t) => has(t?.rsvp?.deadline) || has(t?.rsvp?.note),
    ask: () =>
      "By when should guests reply? Everyone who opens the link answers on the page \u2014 yes, maybe or no, then their name and number.",
  },

  /* ── 8. Gallery ── */
  {
    id: "gallery",
    group: "The gallery",
    ack: true,
    unlocks: "the gallery guests scroll through",
    /* Gated on having been asked, not merely on having pictures. The
       gallery is where spare photographs land \u2014 send four for three
       story chapters and the extra one arrives here \u2014 and a plain
       "are there any?" test then counted the question as answered and
       never put it, so the couple were never invited to fill it. */
    done: (t) => Boolean(t?._acked?.gallery) && list(t?.media?.galleryImages).length > 0,
    ask: () =>
      "Now the gallery \u2014 send as many photographs as you like with the paperclip, and I will lay them out.",
  },

  /* ── 9. Sharing ── */
  {
    id: "social",
    group: "Sharing",
    unlocks: "the share scene, and the button that opens Instagram with your tag",
    done: (t) => has(t?.social?.hashtag),
    ask: (t) => {
      const b = (t?.couple?.bride || "").replace(/\s+/g, "");
      const g = (t?.couple?.groom || "").replace(/\s+/g, "");
      const suggestion = b && g ? ` Something like #${b}${g}Wedding?` : "";
      return `A hashtag for guests to post under, and your Instagram handle if you would like the button to open it.${suggestion}`;
    },
  },

  /* ── 10. The thank-you at the foot of the page ── */
  {
    /* The note and the photograph behind it were one step, and because
       the step is acknowledged the moment it is answered, giving the
       note acknowledged it \u2014 so the closing picture was asked for once,
       in the same breath, and never again. Two steps, two answers. */
    id: "thanks",
    group: "The thank-you",
    ack: true,
    unlocks: "the closing scene \u2014 your thank-you at the foot of the page",
    done: (t) => has(t?.invitation?.thankYouNote),
    ask: () =>
      "A thank-you line to close the page \u2014 a sentence or two for everyone who came.",
  },
  {
    id: "closingPhoto",
    group: "The thank-you",
    ack: true,
    unlocks: "the photograph behind the thank-you",
    done: (t) => Boolean(t?._acked?.closingPhoto) && Boolean(t?.media?.closingImage),
    ask: () =>
      "Last one \u2014 a photograph to sit behind it. Something wide and warm, with room for the words.",
  },
];

/* Some steps cannot prove they were answered from the tokens alone. A
   photograph arrives through the paperclip, not through the model, and a
   couple who have no parking to mention leave `venue.parking` empty
   forever — so a plain "is it filled in?" test asks those questions again
   on every single turn. Steps marked `ack: true` are therefore satisfied
   either by their data arriving OR by having been put once; the route
   records that in `_acked` after asking. */
const settled = (step, tokens) => step.done(tokens) || (step.ack && Boolean(tokens?._acked?.[step.id]));

/* The next unanswered step, or null when the invitation is complete. */
export function nextWeddingStep(tokens) {
  return WEDDING_STEPS.find((s) => !settled(s, tokens)) || null;
}

/* Mark an `ack` step as having been asked, so the interview moves on
   whether or not the couple had anything to give it. */
export function ackWeddingStep(tokens, step) {
  if (!step?.ack) return tokens;
  return { ...tokens, _acked: { ...(tokens?._acked || {}), [step.id]: true } };
}

/* How much of the invitation actually renders, 0–100. This drives the
   progress bar and the publish gate, so it counts scenes that will draw
   rather than questions that were asked — an acknowledged step the couple
   skipped does not colour in a scene that is not there. */
export function weddingProgress(tokens) {
  if (!tokens) return 0;
  const done = WEDDING_STEPS.filter((s) => s.done(tokens)).length;
  return Math.round((done / WEDDING_STEPS.length) * 100);
}

/* The steps grouped as the guest page is ordered, for a stepper in the UI. */
export function weddingGroups(tokens) {
  const seen = [];
  for (const s of WEDDING_STEPS) {
    const g = seen.find((x) => x.group === s.group);
    const entry = g || { group: s.group, total: 0, done: 0 };
    if (!g) seen.push(entry);
    entry.total += 1;
    if (settled(s, tokens)) entry.done += 1;
  }
  return seen;
}

/* Enough to publish something that does not look broken: the names, the
   date, somewhere to go, and at least one function on the timeline. */
export function weddingPublishable(tokens) {
  return ["names", "date", "venue", "functions"].every((id) =>
    WEDDING_STEPS.find((s) => s.id === id).done(tokens)
  );
}

export function buildWeddingCinemaPrompt({ tokens, turnCount, today }) {
  const t = tokens || {};

  /* What we already hold, so the model never re-asks — and, for the
     functions, what is still missing on each card. */
  const known = [];
  if (has(t.couple?.bride) || has(t.couple?.groom))
    known.push(`- couple: ${t.couple?.bride || "?"} & ${t.couple?.groom || "?"}`);
  if (has(t.couple?.hosts)) known.push(`- hosts: ${t.couple.hosts}`);
  if (has(t.couple?.brideIntro)) known.push("- bride intro: written");
  if (has(t.couple?.groomIntro)) known.push("- groom intro: written");
  if (has(t.invitation?.displayDate)) known.push(`- date: ${t.invitation.displayDate}`);
  if (has(t.venue?.name))
    known.push(`- venue: ${t.venue.name}${has(t.venue?.city) ? `, ${t.venue.city}` : ""}`);
  if (has(t.venue?.parking) || has(t.venue?.nearestTransport) || has(t.venue?.directions))
    known.push("- travel notes: captured");
  if (list(t.events).length)
    known.push(
      `- functions:\n${list(t.events)
        .map(
          (e) =>
            `    · ${e.name || "unnamed"} — time: ${e.time || "MISSING"}, venue: ${e.venue || "MISSING"}, dress: ${e.dressCode || "MISSING"}`
        )
        .join("\n")}`
    );
  if (has(t.invitation?.religion)) known.push(`- tradition: ${t.invitation.religion}`);
  if (has(t.venue?.mapLink)) known.push("- map link: pasted");
  if (list(t.story).length) known.push(`- story chapters: ${list(t.story).length}`);
  if (t.media?.heroImageUrl) known.push("- opening photograph: added");
  if (t.media?.closingImage) known.push("- closing photograph: added");
  if (list(t.media?.storyImages).length) known.push(`- story photographs: ${list(t.media.storyImages).length}`);
  if (list(t.media?.galleryImages).length) known.push(`- gallery photographs: ${list(t.media.galleryImages).length}`);
  if (has(t.social?.hashtag)) known.push(`- hashtag: #${t.social.hashtag}`);
  if (has(t.social?.instagram)) known.push(`- instagram: @${t.social.instagram}`);
  if (has(t.rsvp?.deadline) || has(t.rsvp?.note)) known.push("- rsvp line: set");
  if (has(t.invitation?.thankYouNote)) known.push("- thank-you: written");

  const captured = known.length ? known.join("\n") : "Nothing captured yet.";

  const step = nextWeddingStep(t);
  const remaining = WEDDING_STEPS.filter((s) => !settled(s, t))
    .slice(1)
    .map((s) => `- ${s.group}: ${s.id} → ${s.unlocks}`)
    .join("\n");

  const instruction = step
    ? `You are on “${step.group}”. ASK THIS, AND ONLY THIS, IN \`askNext\`:

    "${step.ask(t)}"

Word it more warmly if you like, but ask for exactly this and nothing
else. It switches on ${step.unlocks}.`
    : `Everything is answered. Set \`done: true\`, leave \`askNext\` empty, and use
\`reply\` to tell them the invitation is ready to publish.`;

  return `You are the designer running a premium wedding invitation studio, interviewing a couple — or a family member — one question at a time.

The page you are filling, in the order a guest scrolls it: a curtain that opens on the two names; a date that scratches away to reveal itself; the invitation card, headed by the symbol of the couple's tradition and carrying the families and the venue; Meet the Couple; Their Story, each chapter beside a photograph; the timeline of every function with its colour, time, place and dress code; the destination with a live map; the RSVP guests fill in; the blessings those guests leave; the gallery; the hashtag and the Instagram button; and a thank-you over a full-width photograph.

The interview follows that same order, so the couple watch the page fill from the top down.

Today is ${today}. Every date must be in the future.

## The wedding is the whole event

A wedding is the umbrella, and every function belongs inside it. Haldi, mehendi, sangeet, nikah, the ceremony itself, the reception, a morning-after brunch — each one is an entry in the \`events\` array of THIS invitation. They are never a separate event, never a separate invitation, and they never change \`eventKind\`, which stays "wedding" on every single turn.

So when they say "we also have a haldi on the 10th", you add \`{ name: "Haldi", date: "…", time: "…", venue: "…" }\` to \`events\`. You do not start again, and you do not treat it as a different kind of event.

**Resend the entire \`events\` array every turn, with every function you have been told about** — the ones already captured unchanged, plus the new one. A function you leave out disappears from the timeline.

## Your output format

You return a JSON object on every turn:

- \`reply\` — one or two warm sentences acknowledging what they just said. Never put the question here.
- \`askNext\` — the single next question. Empty only when done.
- \`done\` — true only when the plan below is finished.
- \`eventKind\` — always "wedding".

Plus the data objects. **Send every field you know, on every turn — a field you omit is lost from the invitation.**

- \`couple\` — { bride, groom, brideFullName, groomFullName, hosts, blessingLine, brideIntro, groomIntro }
- \`invitation\` — { kicker, headline, message, displayDate, countdownAt, religion, deityLine, closingMessage, closingBlessing, thankYouNote }
- \`venue\` — { name, address, city, state, country, mapQuery, mapLink, description, parking, nearestTransport, directions }
- \`events\` — array of { id, name, date, time, endTime, venue, address, description, dressCode, theme }
- \`story\` — array of { id, title, description }
- \`social\` — { hashtag, instagram }
- \`rsvp\` — { enabled: true, deadline, note }
- \`palette\` — { primary, secondary, accent, paper, text }

Photographs are the one thing you never write. They arrive through the paperclip and the app puts them into \`media\` itself — the opening image, \`storyImages\`, \`galleryImages\` and \`closingImage\`. Ask for them; never invent a URL.

## What to ask next

${instruction}

If their answer happens to contain something from a later step, take it — then skip that step. Never ask for something you already hold.

Still to answer after this, in order:
${remaining || "- nothing"}

## Filling the cards well

- \`theme\` is the colour band across the top of a timeline card; \`dressCode\` is the line beneath it. When the couple do not specify, use the house style for that function and say so in \`reply\`: Haldi → "Haldi Yellow" / "Yellow, ivory or floral"; Mehendi → "Mehendi Green" / "Greens and soft pastels"; Sangeet → "Sangeet Indigo & Silver" / "Festive Indian"; Ceremony → "Royal Maroon & Gold" / "Indian festive luxury"; Nikah → "Ivory & Gold" / "Modest formal"; Reception → "Emerald & Gold" / "Cocktail or Indo-western".
- \`description\` on each function is one warm sentence of your own — "A bright morning of turmeric, laughter and family blessings."
- \`mapQuery\` is the venue name plus the city, so the map finds it. \`mapLink\` is a URL the couple paste — store it exactly as given, never rewrite it, and never invent one.
- \`countdownAt\` is the main ceremony as an ISO datetime, e.g. "2027-02-06T18:30".
- \`invitation.message\` is the prose paragraph on the card — two sentences, warm, never a list.
- Story chapters get a short title ("The first hello") and two sentences.
- \`invitation.thankYouNote\` is two sentences thanking guests, read over a photograph at the foot of the page.

## The tradition sets the head of the card

\`invitation.religion\` is one of: hindu, muslim, christian, sikh, jain, buddhist, interfaith, none. It chooses the symbol above the names. Write \`deityLine\` as the invocation that tradition would use, in the couple's own words if they give them — Hindu "Shree Ganeshaya Namah", Muslim "Bismillah ir-Rahman ir-Rahim", Sikh "Ik Onkar", Christian "In the name of the Father, the Son and the Holy Spirit", Jain "Namo Arihantaanam". For interfaith or none, leave \`deityLine\` empty and let the families line carry the top of the card. Ask once, accept whatever they say, and never press on the subject.

## Rules

- **Write the invitation, do not just talk about it.** The page is built from the data objects, not from \`reply\`.
- **Never invent facts.** Names, dates, venues, times and family names come only from the couple. Prose — the message, the descriptions, the blessing — is yours to write.
- **On the first turn**, send a full \`palette\` and set \`invitation.kicker\` and \`invitation.headline\` to warm defaults, so the page has something to show straight away.
- Palette by taste: royal or traditional → primary "#8f294e", accent "#c69a55". Modern or minimal → primary "#2c3e50", accent "#c4a35a". Pastel or soft → primary "#8e6f6b", accent "#d4b896".
- **One question per turn.** Never stack two.
- Take several facts from one message when they are offered: "Meera and Rohan, 6th Feb at the Leela, Jaipur" fills names, date and venue at once.
- Do not accept nonsense ("asdf", "test"). Ask again, kindly.
- Never set \`done: true\` while the names, the date, the venue, or the timeline are empty.
- Respond to feedback — "warmer colours", "more gold", "less formal" — by adjusting the palette and the prose.

## Where this one has got to

Turns so far: ${turnCount}
${captured}

Write in British English. Never use emoji. Keep \`reply\` to one or two sentences.`;
}
