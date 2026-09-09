/* ══════════════════════════════════════════════════════════════════════
   The prompt.

   Four jobs, in order of how much they matter:

   1. Make the model behave like a designer interviewing a client, not a
      form. Few questions, and at least one about taste.
   2. Make the questions belong to the event. A conference is asked about
      its programme and its tickets; a memorial is asked, gently, about the
      order of service. Asking a concert promoter about "the couple" is the
      fastest way to look like a wedding tool wearing a costume.
   3. Make the design move on the FIRST answer, and make two events of the
      same kind still differ.
   4. Keep it inside the primitives. Seeds are worked examples so the model
      interpolates between known-good designs instead of inventing.
   ══════════════════════════════════════════════════════════════════════ */

import { TYPE_SETS, FRAMES, MOTIFS } from "@/lib/design/tokens";
import { familyOf, hashOf } from "@/lib/ai/classify";

/* ── Seeds ──────────────────────────────────────────────────────────────
   Each family carries:
     when     — the events it covers
     asks     — what a designer actually needs to know for THIS kind of
                event, in the order it makes sense to ask
     shape    — the page it usually wants
     variants — two or three complete looks. The starting point is chosen
                from a hash of the conversation, so two weddings do not
                open on identical colours. The model overrides freely.  */
export const SEEDS = {
  wedding: {
    when: "weddings, receptions, sangeets, mehendis, anniversaries — warm, traditional, unhurried",
    asks: [
      "both names, and which family is hosting",
      "the date and the time the ceremony starts",
      "the venue and the town",
      "whether there are other functions (mehendi, sangeet, haldi, reception) with their own times and places",
      "formal and traditional, or relaxed and modern",
      "optionally, a line about how they met",
    ],
    shape: "epigraph → arch portrait → script names → order of the day (cards, inverted) → gallery → RSVP",
    variants: [
      { palette:{bg:"#fdf9f1",surface:"#f7efe0",ink:"#334034",muted:"#7d8a7c",accent:"#b8912f",accentSoft:"#e2d4ac",deep:"#2b4433",onDeep:"#fdf9f1"},
        typeSet:"classic-script", frame:"arch", motif:"botanical", reveal:"veil", corner:"soft", density:0.85 },
      { palette:{bg:"#fff8f4",surface:"#fbeade",ink:"#4a3128",muted:"#9b7f70",accent:"#c26a4a",accentSoft:"#f0d2c0",deep:"#6d2f24",onDeep:"#fff8f4"},
        typeSet:"editorial-serif", frame:"circle", motif:"geometric", reveal:"veil", corner:"soft", density:0.7 },
      { palette:{bg:"#f7f6fb",surface:"#eceaf6",ink:"#2f2b43",muted:"#7a7594",accent:"#7d6ba8",accentSoft:"#d6cfe8",deep:"#3b3159",onDeep:"#f7f6fb"},
        typeSet:"classic-script", frame:"arch", motif:"rings", reveal:"veil", corner:"soft", density:0.75 },
    ],
  },

  engagement: {
    when: "engagements, roka, bridal and baby showers — softer, celebratory, less formal than a wedding",
    asks: [
      "both names",
      "the date and time",
      "the venue",
      "whether the ring exchange has its own time in the evening",
      "intimate and family-only, or a big party",
    ],
    shape: "short epigraph → circle portrait → script names → how the night runs (cards) → gallery → RSVP",
    variants: [
      { palette:{bg:"#fffaf8",surface:"#fdeeea",ink:"#4a3438",muted:"#9c7f81",accent:"#c4788a",accentSoft:"#f2cfd4",deep:"#6d3b4a",onDeep:"#fffaf8"},
        typeSet:"classic-script", frame:"circle", motif:"confetti", reveal:"veil", corner:"soft", density:0.9 },
      { palette:{bg:"#fbfaf5",surface:"#f2f0e4",ink:"#3b3a2f",muted:"#87856f",accent:"#a8934e",accentSoft:"#e4dcbe",deep:"#4d4a33",onDeep:"#fbfaf5"},
        typeSet:"quiet-serif", frame:"circle", motif:"botanical", reveal:"veil", corner:"soft", density:0.65 },
    ],
  },

  milestone: {
    when: "birthdays, housewarmings, naming ceremonies, baptisms, upanayanams, graduations, retirements, reunions, festivals at home — warm, classic, unfussy",
    asks: [
      "whose occasion it is, and what exactly is being marked",
      "the date and the time",
      "the venue",
      "who is hosting or inviting",
      "whether there is a meal, and roughly how the day runs",
      "warm and traditional, or bright and modern",
    ],
    shape: "short quote → circle portrait → serif headline → how the day runs (cards, inverted) → gallery → let us know",
    variants: [
      { palette:{bg:"#fdf6ee",surface:"#f7e7d5",ink:"#3d2b21",muted:"#8d7461",accent:"#c26b3c",accentSoft:"#eccdb0",deep:"#5c3a24",onDeep:"#fdf6ee"},
        typeSet:"editorial-serif", frame:"circle", motif:"rings", reveal:"veil", corner:"soft", density:0.7 },
      { palette:{bg:"#f6f7f2",surface:"#e9ede0",ink:"#2f3a2b",muted:"#78846e",accent:"#7a8b5a",accentSoft:"#cfd9bd",deep:"#33402b",onDeep:"#f6f7f2"},
        typeSet:"quiet-serif", frame:"arch", motif:"botanical", reveal:"fade", corner:"soft", density:0.6 },
      { palette:{bg:"#f5f8fb",surface:"#e6eef6",ink:"#26364a",muted:"#7488a0",accent:"#6f93b8",accentSoft:"#c9dbea",deep:"#28405c",onDeep:"#f5f8fb"},
        typeSet:"editorial-serif", frame:"rect", motif:"geometric", reveal:"fade", corner:"soft", density:0.5 },
      /* Milestone is the widest family — birthdays through retirements —
         so it carries the most variants. With only three, one look was
         turning up for a fifth of all events. */
      { palette:{bg:"#fff9f4",surface:"#fdeede",ink:"#4a3527",muted:"#9d8571",accent:"#d69a5c",accentSoft:"#f4dcc0",deep:"#5e4028",onDeep:"#fff9f4"},
        typeSet:"classic-script", frame:"circle", motif:"confetti", reveal:"veil", corner:"soft", density:0.8 },
      { palette:{bg:"#faf7fb",surface:"#f0e9f3",ink:"#382c3d",muted:"#87748d",accent:"#8f5f9e",accentSoft:"#ddcbe4",deep:"#4a2f55",onDeep:"#faf7fb"},
        typeSet:"quiet-serif", frame:"circle", motif:"rings", reveal:"fade", corner:"soft", density:0.55 },
    ],
  },

  conference: {
    when: "conferences, summits, launches, exhibitions, corporate evenings — editorial, sharp, no romance",
    asks: [
      "what the event is called",
      "the dates, and the city and venue",
      "what it is about, in one line",
      "who should come",
      "the programme, or at least the headline sessions and speakers",
      "ticket price or registration link, if there is one",
    ],
    shape: "no epigraph → uppercase wordmark → programme (cards) → practical details (rows, inverted) → speakers (cards) → register",
    variants: [
      { palette:{bg:"#0e1116",surface:"#171c24",ink:"#c9d2de",muted:"#7d8899",accent:"#7ee787",accentSoft:"#2b4636",deep:"#f0f4f8",onDeep:"#0e1116"},
        typeSet:"modern-sans", frame:"none", motif:"grid", reveal:"none", corner:"sharp", density:0.55, displayCase:"uppercase" },
      { palette:{bg:"#101014",surface:"#191920",ink:"#d7d7de",muted:"#83838f",accent:"#ff6b35",accentSoft:"#3d2216",deep:"#ff6b35",onDeep:"#101014"},
        typeSet:"modern-sans", frame:"none", motif:"geometric", reveal:"none", corner:"sharp", density:0.5, displayCase:"uppercase" },
      { palette:{bg:"#fbfbfa",surface:"#f0f0ee",ink:"#1c1c1a",muted:"#76766f",accent:"#2b5fd9",accentSoft:"#d3ddf7",deep:"#12121a",onDeep:"#fbfbfa"},
        typeSet:"modern-sans", frame:"none", motif:"grid", reveal:"none", corner:"sharp", density:0.35, displayCase:"uppercase" },
    ],
  },

  concert: {
    when: "concerts, gigs, festivals, club nights, screenings, matches — loud, poster-like, typographic",
    asks: [
      "the act, or the name of the night",
      "the date, and what time doors open",
      "the venue and city",
      "the line-up and set times, if they are known",
      "where tickets are sold, and whether there is an age limit",
    ],
    shape: "no portrait → enormous act name → line-up (cards) → tickets (rows, inverted) → gallery → book now",
    variants: [
      { palette:{bg:"#120a1f",surface:"#1e1033",ink:"#e6dcf5",muted:"#9b8bb8",accent:"#ff2e88",accentSoft:"#4a1f52",deep:"#ffd93d",onDeep:"#120a1f"},
        typeSet:"poster-condensed", frame:"none", motif:"waves", reveal:"none", corner:"sharp", density:1, displayCase:"uppercase" },
      { palette:{bg:"#04222a",surface:"#0a3540",ink:"#d8f2ef",muted:"#7fa9a8",accent:"#22e0b4",accentSoft:"#0f4a4a",deep:"#22e0b4",onDeep:"#04222a"},
        typeSet:"poster-condensed", frame:"none", motif:"waves", reveal:"none", corner:"sharp", density:1, displayCase:"uppercase" },
      { palette:{bg:"#1a0d08",surface:"#2a1610",ink:"#f2e3d5",muted:"#b0917c",accent:"#ff8c23",accentSoft:"#4a2a14",deep:"#ffb347",onDeep:"#1a0d08"},
        typeSet:"poster-condensed", frame:"none", motif:"geometric", reveal:"none", corner:"sharp", density:0.9, displayCase:"uppercase" },
    ],
  },

  remembrance: {
    when: "memorials, remembrance services, prayer meetings — quiet, dignified, never celebratory",
    asks: [
      "whose life is being remembered, and the years",
      "the date, the time and the place of the service",
      "who is inviting",
      "whether the family would prefer donations to flowers",
      "anything they would like said at the top — a verse, or a line they loved",
    ],
    shape: "a verse or line → portrait → name and years → order of service (cards) → a note on flowers or donations",
    variants: [
      { palette:{bg:"#f4f4f2",surface:"#e8e8e4",ink:"#2f3134",muted:"#7a7c80",accent:"#8a7f6b",accentSoft:"#d8d4c9",deep:"#3a3d42",onDeep:"#f4f4f2"},
        typeSet:"quiet-serif", frame:"rect", motif:"none", reveal:"fade", corner:"soft", density:0.3 },
      { palette:{bg:"#f3f5f6",surface:"#e5eaec",ink:"#28343a",muted:"#74838a",accent:"#5f7f8c",accentSoft:"#cddadf",deep:"#2f4149",onDeep:"#f3f5f6"},
        typeSet:"quiet-serif", frame:"circle", motif:"rings", reveal:"fade", corner:"soft", density:0.25 },
    ],
  },
};

const DEFAULT_FAMILY = "milestone";

/** The seed family for an event kind, falling back to the broadest one. */
export function familyForKind(eventKind) {
  return familyOf(eventKind) || DEFAULT_FAMILY;
}

/** Two families to show as worked examples: the right one, and a contrast. */
export function pickSeeds(eventKind) {
  const fam = familyOf(eventKind);
  if (!fam) return ["wedding", "conference"]; // far apart while we do not know
  const contrast = {
    wedding: "milestone", engagement: "wedding", milestone: "wedding",
    conference: "concert", concert: "conference", remembrance: "milestone",
  }[fam];
  return [fam, contrast];
}

/* The design an event STARTS from when the model has not sent a complete
   one. `seedText` is the conversation so far: it only picks which variant
   within the family, so the same conversation always rebuilds the same
   design, but two different weddings do not open identically. */
export function seedDesignFor(eventKind, seedText = "") {
  const seed = SEEDS[familyForKind(eventKind)];
  const v = seed.variants;
  return v[hashOf(seedText || String(eventKind || "")) % v.length];
}

const compact = (o) => JSON.stringify(o);

export function buildSystemPrompt({ tokens, eventKind, turnCount, today }) {
  const family = familyForKind(eventKind);
  const seedKeys = pickSeeds(eventKind);

  const seedBlock = seedKeys.map((k) => {
    const s = SEEDS[k];
    return `### ${k} — ${s.when}\ndesign: ${compact(s.variants[0])}\nshape: ${s.shape}`;
  }).join("\n\n");

  /* The question plan is the whole answer to "why does it ask a concert
     promoter about the couple". Only the matching family's plan is sent. */
  const plan = SEEDS[family].asks.map((a, i) => `${i + 1}. ${a}`).join("\n");

  const known = tokens?.content
    ? Object.entries(tokens.content)
        .filter(([k, v]) => v && k !== "sections" && typeof v !== "object")
        .map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "";

  return `You are the designer running a digital invitation studio. One person is describing their event to you in chat, and the invitation is being drawn live beside them as they talk. You are not filling in a form — you are interviewing a client.

Today is ${today}. Every date must be in the future; a bare day and month means the next occurrence.

**Any event is welcome.** Weddings and engagements are the common case, but people also bring housewarmings, naming ceremonies, upanayanams, half-saree functions, baptisms, retirements, reunions, product launches, conferences, gigs, festivals, marathons, exhibitions and memorials. Never tell someone their event is not supported, and never bend an event into a wedding shape. A memorial is quiet and dignified; a launch is sharp and corporate; a temple function is warm and traditional. Design for the event in front of you.

## How you work

Return a reply, ONE next question, and a patch of the design and content. The patch is merged — send only what changes.

**Always set \`eventKind\`.** One short slug, every single turn, even when nothing else changed. Without it the design cannot follow the event.

**Turn one is the important one.** The moment you know what kind of event this is, send a COMPLETE design: full palette, typeSet, frame, motif, reveal, corner, density, plus a headline and a first pass at sections. The page must visibly transform before they have given you any details. Do not wait for names or dates to start designing.

**Ask few questions.** Six at most, then set done:true and tell them it is ready. Never grind through optional fields.

## What to ask for THIS event

This is a ${family} event. Work through these, in roughly this order, skipping anything they have already told you:

${plan}

Ask for photographs once, after the essentials and before you finish: the first becomes the portrait at the top and the rest form a gallery. Phrase it as an offer — "Would you like to add a few photos? There is a paperclip below the message box." If they decline, say it looks lovely without them and move on. Never ask twice.

When photos arrive you will see a message like "[Added 3 photos]". Never put a photo into \`content\` yourself — they are already attached. Respond warmly, and if there is no gallery section yet, add one with a fitting title (leave \`photos\` out entirely; the server fills it).

**Ask one question about taste, early.** "Formal and traditional, or relaxed and modern?" shapes the design more than five factual ones.

**Take multiple facts from one message.** If they give names, date and venue at once, capture all of it and move on to what is missing.

**Never invent.** Names, dates, venues, prices and speakers come only from the user. Write connective prose and section copy yourself — that is your job — but never fabricate a fact.

**Do not accept nonsense as fact.** If an answer looks like keyboard mash or a placeholder ("ffsdf", "asdf", "test", "ree"), do not write it in. Say lightly that you did not catch that and ask again. Never set done:true while the headline or venue still holds a value like that.

**Never repeat your question inside "reply".** "reply" acknowledges; "askNext" carries the question.

**Respond to design feedback.** "Warmer", "less pink", "bigger names", "too fussy" are instructions to you. Adjust and say what you changed.

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

Reference points, not templates. Interpolate between them and push away from them — a Kerala housewarming and a Goa beach wedding should not come out looking the same, and neither should two weddings.

${seedBlock}

## Where this one has got to

Event kind: ${eventKind || "not yet known"}
Design family: ${family}
Turns so far: ${turnCount}
${known ? `Already captured:\n${known}` : "Nothing captured yet."}
${tokens?.design?.typeSet ? `Current look: ${compact(tokens.design)}` : "No design chosen yet — send a complete one this turn."}

Write in British English. Never use emoji. Keep "reply" to one or two sentences.`;
}
