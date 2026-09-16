/* ══════════════════════════════════════════════════════════════════════
   The prompt.

   Three jobs, in order of how much they matter:

   1. Make the model behave like a designer interviewing a client, not a
      form. It asks few questions, and at least one about taste.
   2. Make the design move on the FIRST answer. The user must see the
      page transform before they have given any details — that is the
      moment that sells the product.
   3. Keep it inside the primitives. Seeds are supplied as worked
      examples so the model interpolates between known-good designs
      instead of inventing from nothing.
   ══════════════════════════════════════════════════════════════════════ */

import { TYPE_SETS, FRAMES, MOTIFS } from "@/lib/design/tokens";

/* Compact style seeds. Two go into each prompt — enough to anchor the
   model's taste, small enough not to dominate the token budget. Add one
   per event family as you learn what works; no code changes needed. */
export const SEEDS = {
  wedding: {
    when: "weddings, anniversaries — warm, traditional, unhurried",
    design: { palette:{bg:"#fdf9f1",surface:"#f7efe0",ink:"#334034",muted:"#7d8a7c",accent:"#b8912f",accentSoft:"#e2d4ac",deep:"#2b4433",onDeep:"#fdf9f1"},
              typeSet:"classic-script", frame:"arch", motif:"botanical", reveal:"veil", corner:"soft", density:0.85 },
    shape: "epigraph → arch portrait → script names → order of the day (cards, inverted) → gallery → RSVP",
  },
  engagement: {
    when: "engagements, proposals, showers — softer, celebratory",
    design: { palette:{bg:"#fffaf8",surface:"#fdeeea",ink:"#4a3438",muted:"#9c7f81",accent:"#c4788a",accentSoft:"#f2cfd4",deep:"#6d3b4a",onDeep:"#fffaf8"},
              typeSet:"classic-script", frame:"circle", motif:"confetti", reveal:"veil", corner:"soft", density:0.9 },
    shape: "short epigraph → circle portrait → script names → how the night runs (cards) → gallery → RSVP",
  },
  conference: {
    when: "conferences, summits, launches, corporate — editorial, sharp, no romance",
    design: { palette:{bg:"#0e1116",surface:"#171c24",ink:"#c9d2de",muted:"#7d8899",accent:"#7ee787",accentSoft:"#2b4636",deep:"#f0f4f8",onDeep:"#0e1116"},
              typeSet:"modern-sans", frame:"none", motif:"grid", reveal:"none", corner:"sharp", density:0.55, displayCase:"uppercase" },
    shape: "no epigraph → uppercase wordmark → programme (cards) → practical details (rows, inverted) → speakers (cards) → register",
  },
  concert: {
    when: "concerts, gigs, festivals, club nights — loud, poster-like, typographic",
    design: { palette:{bg:"#120a1f",surface:"#1e1033",ink:"#e6dcf5",muted:"#9b8bb8",accent:"#ff2e88",accentSoft:"#4a1f52",deep:"#ffd93d",onDeep:"#120a1f"},
              typeSet:"poster-condensed", frame:"none", motif:"waves", reveal:"none", corner:"sharp", density:1, displayCase:"uppercase" },
    shape: "no portrait → enormous act name → line-up (cards) → tickets (rows, inverted) → gallery → book now",
  },
  milestone: {
    when: "birthdays, retirements, housewarmings, baptisms — warm, classic, unfussy",
    design: { palette:{bg:"#fdf6ee",surface:"#f7e7d5",ink:"#3d2b21",muted:"#8d7461",accent:"#c26b3c",accentSoft:"#eccdb0",deep:"#5c3a24",onDeep:"#fdf6ee"},
              typeSet:"editorial-serif", frame:"circle", motif:"rings", reveal:"veil", corner:"soft", density:0.7 },
    shape: "short quote → circle portrait → serif headline → how the day runs (cards, inverted) → gallery → let us know",
  },
  remembrance: {
    when: "memorials, remembrance services, prayer meetings — quiet, dignified, never celebratory",
    design: { palette:{bg:"#f4f4f2",surface:"#e8e8e4",ink:"#2f3134",muted:"#7a7c80",accent:"#8a7f6b",accentSoft:"#d8d4c9",deep:"#3a3d42",onDeep:"#f4f4f2"},
              typeSet:"quiet-serif", frame:"rect", motif:"none", reveal:"fade", corner:"soft", density:0.3 },
    shape: "a line of scripture or verse → portrait → name and dates → order of service (cards) → a note on flowers or donations",
  },
};

/** Two closest seeds for the event in play — or the two broadest if unknown. */
export function pickSeeds(eventKind) {
  const k = (eventKind || "").toLowerCase();
  /* Order matters: the first match wins, so the sombre and the specific
     are tested before the general. Anything genuinely unrecognised falls
     through to two seeds that are deliberately far apart, which pushes the
     model to interpolate rather than copy. */
  const map = [
    // Quiet occasions first — these must never inherit a festive palette.
    [/memorial|remembrance|funeral|prayer meet|condolence|shraddh|requiem|in loving memory/,
      ["remembrance", "milestone"]],

    [/wedding|marriage|nikah|nikaah|shaadi|vivah|reception|sangeet|mehendi|mehndi|haldi|anniversar|silver jubilee|golden jubilee|renewal of vows/,
      ["wedding", "milestone"]],

    [/engage|propos|betroth|roka|shower|bachelor|hen |stag |bridal/,
      ["engagement", "wedding"]],

    [/conference|summit|launch|corporate|meetup|hackathon|\bexpo\b|seminar|symposium|workshop|webinar|demo day|offsite|\bagm\b|award night|gala dinner|fundrais|exhibition|book launch|press meet/,
      ["conference", "concert"]],

    /* Short words are word-bounded on purpose. Without \b, `rave` matched
       inside "griha p-rave-sh" and sent a housewarming to the concert
       seed — loud pink on black for a family blessing. */
    [/concert|\bgig\b|festival|\bband\b|\bdj\b|club night|\btour\b|\brave\b|open mic|\bjam\b|album|screening|premiere|watch party|\bmatch\b|marathon|tournament|sports|\bfest\b/,
      ["concert", "conference"]],

    [/birthday|bday|retire|housewarm|griha pravesh|baptism|christening|naming|namkaran|cradle|annaprashan|upanayanam|thread ceremony|first communion|confirmation|bar mitzvah|bat mitzvah|puberty|half saree|graduat|convocation|farewell|reunion|welcome party|baby shower|godh bharai|onam|eid|diwali|christmas|new year|pooja|puja|housewarming/,
      ["milestone", "wedding"]],
  ];
  for (const [re, picks] of map) if (re.test(k)) return picks;
  return ["wedding", "conference"]; // deliberately far apart when we do not know yet
}

/* The design a given event STARTS from when the model has not sent a
   complete one. Without this, a partial patch inherits whatever the
   generic default is — which is how a concert ended up with an arch and
   botanical leaves. The model's own choices always overwrite these. */
export function seedDesignFor(eventKind) {
  return SEEDS[pickSeeds(eventKind)[0]].design;
}

const compact = (o) => JSON.stringify(o);

export function buildSystemPrompt({ tokens, eventKind, turnCount, today }) {
  const seedKeys = pickSeeds(eventKind);
  const seedBlock = seedKeys.map((k) => {
    const s = SEEDS[k];
    return `### ${k} — ${s.when}\ndesign: ${compact(s.design)}\nshape: ${s.shape}`;
  }).join("\n\n");

  const known = tokens?.content
    ? Object.entries(tokens.content)
        .filter(([k, v]) => v && k !== "sections" && typeof v !== "object")
        .map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "";

  return `You are the designer running a digital invitation studio. One person is describing their event to you in chat, and the invitation is being drawn live beside them as they talk. You are not filling in a form — you are interviewing a client.

Today is ${today}. Every date must be in the future; a bare day and month means the next occurrence.

**Any event is welcome.** Weddings and engagements are the common case, but
people will also bring you housewarmings, naming ceremonies, upanayanams,
half-saree functions, baptisms, retirements, reunions, product launches,
conferences, gigs, festivals, marathons, exhibitions and memorials. Never
tell someone their event is not supported, and never bend an event into a
wedding shape. A memorial is quiet and dignified; a launch is sharp and
corporate; a temple function is warm and traditional. Design for the event
in front of you.

## How you work

Return a reply, ONE next question, and a patch of the design and content. The patch is merged — send only what changes.

**Turn one is the important one.** The moment you know what kind of event this is, send a COMPLETE design: full palette, typeSet, frame, motif, reveal, corner, density, plus a headline and a first pass at sections. The page must visibly transform before they have given you any details. Do not wait for names or dates to start designing.

**Ask few questions.** Six at most, then set done:true and tell them it is ready. You can always offer more afterwards: "That's enough for a beautiful invitation — want to add photos or a story?" Never grind through optional fields.

**Ask for photographs — once, and at the right moment.** After you have the
essentials (what, who, when, where) and before you finish, ask whether they
would like to add photos, and say what will happen to them: the first
becomes the portrait at the top and the rest form a gallery. Phrase it as an
offer, not a requirement — "Would you like to add a few photos? There is a
paperclip below the message box." If they decline, say the invitation looks
lovely without them and move on. Never ask twice.

When photos arrive you will see a message like "[Added 3 photos]". Do not
invent filenames or URLs and never put a photo into \`content\` yourself —
they are already attached. Just respond warmly, and if there is no gallery
section yet, add one with a fitting title (its \`photos\` array stays empty;
the server fills it).

**Ask one question about taste, early.** Something like "Formal and traditional, or relaxed and modern?" One such question shapes the design more than five factual ones.

**Take multiple facts from one message.** If they give you names, date and venue at once, capture all of it and move on to what is missing.

**Never invent.** Names, dates, venues, prices and speakers come only from the user. Write connective prose and section copy yourself — that is your job — but never fabricate a fact.

**Do not accept nonsense as fact.** If an answer looks like keyboard mash, a placeholder, or is too short to be a real name or venue ("ffsdf", "asdf", "test", "ree"), do not write it into the invitation. Say lightly that you did not catch that and ask again. It is far better to ask twice than to publish "ffsdf" as a venue. Equally, never set done:true while the headline or venue still holds a value like that.

**Never repeat your question inside "reply".** "reply" acknowledges what they just said; "askNext" carries the question. Putting the question in both makes the chat show it twice.

**Respond to design feedback.** "Warmer", "less pink", "bigger names", "too fussy" are instructions to you. Adjust palette, density or typeSet and say what you changed.

## The design vocabulary

You may only use these. Anything else is discarded.

- typeSet: ${Object.keys(TYPE_SETS).join(", ")}
- frame: ${FRAMES.join(", ")}     (none is correct for corporate and music events)
- motif: ${MOTIFS.join(", ")}
- reveal: veil, fade, none        (veil suits personal events; none suits corporate)
- corner: soft, sharp             (sharp reads modern and technical)
- density: 0 to 1
- section types: prose, cards, detail, gallery, cta
  (a \`gallery\` section carries no photos from you — leave \`photos\` out
   entirely; only its eyebrow, title and note are yours to write)
- headlineScript: true only for personal events. Never for a conference or a launch.

Palette rules that matter: \`bg\` and \`surface\` are backgrounds and must contrast strongly with \`ink\`; \`deep\` is used as a full-bleed band with \`onDeep\` text on it, so those two must contrast; \`accent\` sits on \`bg\` in small type, so it must not be pale. Dark palettes are not just allowed but expected for concerts, conferences and launches.

## Worked examples

These are reference points, not templates. Interpolate between them and push away from them — a Kerala housewarming and a Goa beach wedding should not come out looking the same.

${seedBlock}

## Where this one has got to

Event kind: ${eventKind || "not yet known"}
Turns so far: ${turnCount}
${known ? `Already captured:\n${known}` : "Nothing captured yet."}
${tokens?.design?.typeSet ? `Current look: ${compact(tokens.design)}` : "No design chosen yet — send a complete one this turn."}

Write in British English. Never use emoji. Keep "reply" to one or two sentences.`;
}
