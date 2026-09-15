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
  {
    id: "names",
    unlocks: "the opening scene, the monogram, and the names everywhere else",
    done: (t) => has(t?.couple?.bride) && has(t?.couple?.groom),
    ask: () => "What are the two first names — bride and groom?",
  },
  {
    id: "date",
    unlocks: "the date-reveal scene and the countdown",
    done: (t) => has(t?.invitation?.displayDate),
    ask: () => "What is the wedding date, and what time does the main ceremony begin?",
  },
  {
    id: "venue",
    unlocks: "the invitation card and the venue scene with its live map",
    done: (t) => has(t?.venue?.name) && has(t?.venue?.city),
    ask: () => "Where is the main ceremony — the venue name and the city?",
  },
  {
    id: "hosts",
    unlocks: "the families line across the invitation card",
    done: (t) => has(t?.couple?.hosts),
    ask: () =>
      "Which two families are hosting? I will set it as “Together with the … and … families”.",
  },
  {
    id: "functions",
    unlocks: "the celebrations timeline",
    done: (t) => list(t?.events).length > 0,
    ask: () =>
      "Which functions are you holding besides the ceremony — haldi, mehendi, sangeet, reception? Name whichever you are having.",
  },
  {
    id: "functionDetail",
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
    unlocks: "the colour band and the dress line on each card",
    done: (t) => list(t?.events).length > 0 && !firstUndressed(t),
    ask: (t) => {
      const e = firstUndressed(t);
      return `Is there a colour or dress code for the ${e?.name || "functions"}? I can use the usual one if you would rather.`;
    },
  },
  {
    id: "couple",
    unlocks: "the “Meet the Couple” scene",
    done: (t) => has(t?.couple?.brideIntro) && has(t?.couple?.groomIntro),
    ask: (t) => {
      const b = t?.couple?.bride || "the bride";
      const g = t?.couple?.groom || "the groom";
      if (!has(t?.couple?.brideIntro) && !has(t?.couple?.groomIntro))
        return `Tell me one line about each of them — what is ${b} like, and what is ${g} like?`;
      return has(t?.couple?.brideIntro) ? `And a line about ${g}?` : `And a line about ${b}?`;
    },
  },
  {
    id: "story",
    unlocks: "“Their Story”, the chapters guests scroll through",
    done: (t) => list(t?.story).length >= 2,
    ask: (t) =>
      list(t?.story).length
        ? "One more moment for their story — the proposal, or something everyone remembers?"
        : "Two or three moments from their story — how they met, and the proposal?",
  },
  {
    id: "photos",
    unlocks: "the opening image and the gallery",
    done: (t) =>
      Boolean(t?.media?.heroImageUrl) || list(t?.media?.galleryImages).length > 0 || Boolean(t?._askedPhotos),
    ask: () =>
      "Would you like to add photos? Use the paperclip below the message box — the first becomes the opening image, the rest fill the gallery.",
  },
  {
    id: "logistics",
    unlocks: "the parking, transport and directions notes under the map",
    done: (t) =>
      has(t?.venue?.parking) || has(t?.venue?.nearestTransport) || has(t?.venue?.directions) || Boolean(t?._askedLogistics),
    ask: () => "Anything guests should know about getting there — parking, or the nearest airport or station?",
  },
  {
    id: "hashtag",
    unlocks: "the share scene at the end",
    done: (t) => has(t?.social?.hashtag),
    ask: (t) => {
      const b = (t?.couple?.bride || "").replace(/\s+/g, "");
      const g = (t?.couple?.groom || "").replace(/\s+/g, "");
      const suggestion = b && g ? ` Something like #${b}And${g}?` : "";
      return `A wedding hashtag for guests to post under?${suggestion}`;
    },
  },
  {
    id: "closing",
    unlocks: "the closing blessing at the foot of the invitation",
    done: (t) => has(t?.invitation?.closingMessage),
    ask: () => "Last one — a closing line for your guests, or shall I write one?",
  },
];

/* The next unanswered step, or null when the invitation is complete. */
export function nextWeddingStep(tokens) {
  return WEDDING_STEPS.find((s) => !s.done(tokens)) || null;
}

/* How much of the invitation actually renders, 0–100. This drives the
   progress bar and the publish gate, so it counts scenes that will draw
   rather than questions that were asked. */
export function weddingProgress(tokens) {
  if (!tokens) return 0;
  const done = WEDDING_STEPS.filter((s) => s.done(tokens)).length;
  return Math.round((done / WEDDING_STEPS.length) * 100);
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
  if (list(t.story).length) known.push(`- story chapters: ${list(t.story).length}`);
  if (has(t.social?.hashtag)) known.push(`- hashtag: #${t.social.hashtag}`);
  if (has(t.invitation?.closingMessage)) known.push("- closing line: written");

  const captured = known.length ? known.join("\n") : "Nothing captured yet.";

  const step = nextWeddingStep(t);
  const remaining = WEDDING_STEPS.filter((s) => !s.done(t))
    .slice(1)
    .map((s) => `- ${s.id} → ${s.unlocks}`)
    .join("\n");

  const instruction = step
    ? `ASK THIS, AND ONLY THIS, IN \`askNext\`:

    "${step.ask(t)}"

Word it more warmly if you like, but ask for exactly this and nothing
else. It switches on ${step.unlocks}.`
    : `Everything is answered. Set \`done: true\`, leave \`askNext\` empty, and use
\`reply\` to tell them the invitation is ready to publish.`;

  return `You are the designer running a premium wedding invitation studio, interviewing a couple — or a family member — one question at a time. The invitation you are filling is a cinematic, scroll-driven wedding page: a curtain that opens, the two names, a date reveal, the invitation card, Meet the Couple, Their Story, a timeline of every function, a gallery, the venue with a live map, and a closing blessing.

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
- \`invitation\` — { kicker, headline, message, displayDate, countdownAt, closingMessage, closingBlessing }
- \`venue\` — { name, address, city, state, country, mapQuery, description, parking, nearestTransport, directions }
- \`events\` — array of { id, name, date, time, endTime, venue, address, description, dressCode, theme }
- \`story\` — array of { id, title, description }
- \`social\` — { hashtag }
- \`rsvp\` — { enabled: true, deadline }
- \`palette\` — { primary, secondary, accent, paper, text }

## What to ask next

${instruction}

If their answer happens to contain something from a later step, take it — then skip that step. Never ask for something you already hold.

Still to answer after this, in order:
${remaining || "- nothing"}

## Filling the cards well

- \`theme\` is the colour band across the top of a timeline card; \`dressCode\` is the line beneath it. When the couple do not specify, use the house style for that function and say so in \`reply\`: Haldi → "Haldi Yellow" / "Yellow, ivory or floral"; Mehendi → "Mehendi Green" / "Greens and soft pastels"; Sangeet → "Sangeet Indigo & Silver" / "Festive Indian"; Ceremony → "Royal Maroon & Gold" / "Indian festive luxury"; Nikah → "Ivory & Gold" / "Modest formal"; Reception → "Emerald & Gold" / "Cocktail or Indo-western".
- \`description\` on each function is one warm sentence of your own — "A bright morning of turmeric, laughter and family blessings."
- \`mapQuery\` is the venue name plus the city, so the map finds it.
- \`countdownAt\` is the main ceremony as an ISO datetime, e.g. "2027-02-06T18:30".
- \`invitation.message\` is the prose paragraph on the card — two sentences, warm, never a list.
- Story chapters get a short title ("The first hello") and two sentences.

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
