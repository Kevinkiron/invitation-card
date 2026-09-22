/* ══════════════════════════════════════════════════════════════════════
   THE WEDDING INTERVIEW, WITHOUT THE MODEL IN THE LOOP

   The questions were already ours — lib/ai/wedding-prompt.js computes the
   next one deterministically. This file takes the other half: reading the
   ANSWER. Names, dates, venues, times, functions, handles and links are
   all things a regular expression understands perfectly well, and every
   one of them was previously a round trip to a model that could — and
   regularly did — come back with nothing and stall the whole thing.

   So the interview now runs locally end to end. No network call, no
   latency, no empty `askNext`, no invented facts. A wedding can be built
   with the AI provider switched off entirely.

   WHAT THE MODEL STILL DOES, AND WHY

   It writes. The invitation paragraph, the one-line descriptions under
   each function, the story chapters, the closing thank-you — prose is
   where a language model genuinely earns its place, and where failing is
   survivable because there is a decent written fallback underneath. See
   PROSE_STEPS below and enrichWedding() in the route.

   So the product is still AI-powered in the way that matters to the
   couple: it writes their invitation. It just no longer depends on a
   model to understand the word "December".
   ══════════════════════════════════════════════════════════════════════ */

import { FUNCTION_STYLE } from "./wedding-prompt";

const clean = (s) => String(s || "").trim().replace(/\s+/g, " ");
const titled = (s) =>
  clean(s).replace(/\b[\p{L}]/gu, (c) => c.toUpperCase());

/* What app/create/page.js posts after it has uploaded photographs and
   written the URLs into the tokens itself. It is a notification, not an
   answer. */
const PHOTO_NOTE = /^\[\s*added \d+ photos?\s*\]$/i;

/* "skip", "none", "nothing", "no thanks" — the couple declining a step. */
const SKIP = /^(skip|no|nope|none|nothing|na|n\/a|not really|no thanks|later|pass)\b/i;
export const isSkip = (t) => SKIP.test(clean(t));

/* Answers that are not answers. Rejected rather than stored, so "asdf"
   never ends up printed on somebody's wedding invitation.

   This used to be a fixed list of specific test-words ("asdf", "test",
   "qwerty"…), which meant anything ELSE typed while testing — "dcdcdc",
   "vdsvsd", "cdadcadc" — sailed straight through and landed on the card
   as a venue name or a family name, because none of those exact strings
   were on the list. The two checks below catch the *shape* of keyboard
   mashing instead of specific words: a chunk repeated end to end
   ("dcdcdc" is "dc" three times), or a run of four-plus letters with no
   vowel in it at all (no real English or Indian-language name goes that
   long without one). Both need a minimum length so short, real answers
   — "no", "TBD", "N95" — are never at risk. Neither is perfect; some
   gibberish has a stray vowel in it and gets through regardless
   ("cdadcadc" does). That is a smaller failure than before: this step
   is a net, not a dictionary, and a couple can always fix a wrong
   answer by hand later, same as they could before this existed. */
const JUNK = /^(asdf|asd|test|testing|abc|xyz|qwerty|\.|,|\d{1,2})$/i;
const REPEATING_CHUNK = /^(.{1,3})\1{2,}$/i;
const HAS_VOWEL = /[aeiou]/i;
function looksMashed(word) {
  if (word.length < 4) return false;
  if (REPEATING_CHUNK.test(word)) return true;
  return /^[a-z]+$/i.test(word) && !HAS_VOWEL.test(word);
}
export const isJunk = (t) => {
  const v = clean(t);
  if (!v) return true;
  if (JUNK.test(v)) return true;
  if (/^[^\p{L}\d]+$/u.test(v)) return true;
  const words = v.split(/[\s,.\-]+/).filter(Boolean);
  return words.length > 0 && words.every(looksMashed);
};

/* ── dates ──────────────────────────────────────────────────────────── */
const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
};
const MONTH_NAME = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

/* Pulls a date out of free text in the shapes people actually type:
   "6 February 2027", "February 6, 2027", "6/2/2027", "2027-02-06".
   Returns { y, m, d } or null. Day-first on the ambiguous numeric form,
   because this is an Indian product and 6/2 means the sixth of February. */
export function parseDate(text) {
  const t = clean(text).toLowerCase();

  let m = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };

  m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?,?\s+(\d{4})/);
  if (m && MONTHS[m[2]]) return { y: +m[3], m: MONTHS[m[2]], d: +m[1] };

  m = t.match(/([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (m && MONTHS[m[1]]) return { y: +m[3], m: MONTHS[m[1]], d: +m[2] };

  m = t.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return { y: +m[3], m: +m[2], d: +m[1] };

  /* "6 February" with no year — assume the next one that is still ahead. */
  m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/);
  if (m && MONTHS[m[2]]) {
    const now = new Date();
    const mm = MONTHS[m[2]], dd = +m[1];
    const y = new Date(now.getFullYear(), mm - 1, dd) > now ? now.getFullYear() : now.getFullYear() + 1;
    return { y, m: mm, d: dd };
  }
  return null;
}

export const displayDate = (d) => (d ? `${d.d} ${MONTH_NAME[d.m]} ${d.y}` : "");
export const isoDate = (d) =>
  d ? `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}` : "";

/* "6:30 pm", "6.30pm", "18:30", "half six" is not supported on purpose —
   a wrong time on an invitation is worse than asking again. */
export function parseTime(text) {
  const t = clean(text).toLowerCase();
  const m = t.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/) || t.match(/\b(\d{1,2})\s*(am|pm)\b/);
  if (!m) return "";
  let h = +m[1];
  const min = m[2] && /^\d{2}$/.test(m[2]) ? m[2] : "00";
  const mer = (m[3] || m[2] || "").toLowerCase();
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  if (h > 23) return "";
  return `${String(h).padStart(2, "0")}:${min}`;
}

/* ── the couple ─────────────────────────────────────────────────────── */
export function parseNames(text) {
  const t = clean(text)
    .replace(/^(it'?s|we are|we're|this is|my name is|the couple is)\s+/i, "")
    .replace(/\band\b/gi, "&");
  const parts = t.split(/[&,]/).map((s) => clean(s)).filter(Boolean);
  if (parts.length < 2) return null;
  const first = (s) => titled(s.split(/\s+/)[0].replace(/[^\p{L}'-]/gu, ""));
  const bride = first(parts[0]), groom = first(parts[1]);
  if (!bride || !groom) return null;
  return { bride, groom };
}

/* ── tradition ──────────────────────────────────────────────────────── */
const FAITHS = [
  /* Tested first on purpose: "mixed — she is Sikh, he is Catholic" names
     two faiths, and whichever rule ran first would otherwise win and
     print one family's invocation on both families' invitation. */
  [/inter[- ]?faith|mixed|both faiths|two faiths/i, "interfaith", ""],
  [/hindu|vedic|sanatan/i, "hindu", "Shree Ganeshaya Namah"],
  [/muslim|islam|nikah|nikaah/i, "muslim", "Bismillah ir-Rahman ir-Rahim"],
  [/christian|catholic|church/i, "christian", "In the name of the Father, the Son and the Holy Spirit"],
  [/sikh|anand karaj|gurudwara|gurdwara/i, "sikh", "Ik Onkar"],
  [/jain/i, "jain", "Namo Arihantaanam"],
  [/buddhist|buddha/i, "buddhist", "Buddham Sharanam Gacchami"],
  [/none|secular|civil|no religion|not religious/i, "none", ""],
];
export function parseReligion(text) {
  for (const [re, key, line] of FAITHS) if (re.test(text)) return { religion: key, deityLine: line };
  return null;
}

/* ── hosts ──────────────────────────────────────────────────────────── */
export function parseHosts(text) {
  const t = clean(text);
  if (/together with/i.test(t)) return titled(t).replace(/\bAnd\b/g, "and");
  const names = t.replace(/\bfamilies?\b/gi, "")
    .split(/\s*(?:&|and|,)\s*/i)
    /* Drop a leading article or we end up with "the The Mehra family". */
    .map((s) => titled(clean(s).replace(/^(the|our|of)\s+/i, "")))
    .filter(Boolean);
  if (names.length >= 2) return `Together with the ${names[0]} and ${names[1]} families`;
  if (names.length === 1) return `Together with the ${names[0]} family`;
  return titled(t);
}

/* ── venue ──────────────────────────────────────────────────────────── */
export function parseVenue(text) {
  const t = clean(text).replace(/^(at|in|the venue is|it'?s at)\s+/i, "");
  const bits = t.split(",").map((s) => clean(s)).filter(Boolean);
  if (bits.length >= 2) {
    const city = titled(bits[bits.length - 1]);
    const name = titled(bits.slice(0, -1).join(", "));
    return { name, city };
  }
  /* No comma — try "<venue> in <city>" before giving up on a city
     altogether. Without this, "The Grand Hyatt in Mumbai" stored a
     name and no city, which the venue step never treats as complete
     (see case "venue" below), so the chat asked the same question on
     every turn no matter what was typed — this is half of that fix. */
  const inSplit = t.match(/^(.+?)\s+\bin\b\s+(.+)$/i);
  if (inSplit) {
    const name = titled(clean(inSplit[1]));
    const city = titled(clean(inSplit[2]));
    if (name && city) return { name, city };
  }
  return { name: titled(t), city: "" };
}

/* ── functions ──────────────────────────────────────────────────────── */
const FUNCTIONS = [
  [/haldi|pithi/i, "Haldi", "haldi"],
  [/mehendi|mehndi|henna/i, "Mehendi", "mehendi"],
  [/sangeet|music night/i, "Sangeet", "sangeet"],
  [/nikah|nikaah/i, "Nikah", "nikah"],
  [/reception|walima/i, "Reception", "reception"],
  [/after[- ]?party|brunch|cocktail/i, "After Party", "after"],
  [/ceremony|wedding|pheras|muhurat|anand karaj/i, "Wedding Ceremony", "ceremony"],
];

/* Every function named in one message, in the order an Indian wedding
   runs them rather than the order they were typed. */
export function parseFunctions(text) {
  const found = [];
  for (const [re, name, key] of FUNCTIONS) {
    if (re.test(text) && !found.some((f) => f.id === key)) {
      const style = FUNCTION_STYLE[key] || {};
      found.push({ id: key, name, theme: style.theme || "", dressCode: "" });
    }
  }
  if (!found.length) {
    /* They named something we do not know — take them at their word. */
    const own = clean(text).split(/\s*(?:,|and|&|\+)\s*/i).filter((s) => s.length > 2 && !isSkip(s));
    return own.slice(0, 6).map((s) => ({ id: s.toLowerCase().replace(/[^a-z0-9]/g, ""), name: titled(s) }));
  }
  const order = ["mehendi", "haldi", "sangeet", "nikah", "ceremony", "reception", "after"];
  return found.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/* Time and place out of one sentence: "10:30 at the Garden Lawns". */
export function parseTimePlace(text) {
  const time = parseTime(text);
  let rest = clean(text);
  if (time) rest = rest.replace(/(\d{1,2})[:.]?(\d{2})?\s*(am|pm)?/i, " ");
  rest = clean(rest.replace(/^(at|in|from|starts?|start at|onwards?)\s+/i, "")
                   .replace(/\b(at|in)\b\s*$/i, ""));
  /* Strip whatever separator is left where the time used to be —
     "starts 7pm, Terrace" was yielding a venue of ", Terrace". */
  const venue = clean(rest.replace(/^[\s,;:.\u2013\u2014-]+/, "").replace(/^(at|in|on)\s+/i, ""));
  return { time, venue: venue.length > 2 ? titled(venue) : "" };
}

/* ── links and handles ──────────────────────────────────────────────── */
export const parseUrl = (text) => (clean(text).match(/https?:\/\/\S+/i) || [""])[0];
export function parseSocial(text) {
  const t = clean(text);
  const tag = (t.match(/#([A-Za-z0-9_]+)/) || [])[1] || "";
  const handle = (t.match(/@([A-Za-z0-9_.]+)/) || [])[1] || "";
  /* A bare word with no # or @ is most likely the hashtag they meant. */
  const bare = !tag && !handle && /^[A-Za-z0-9_.]+$/.test(t) ? t : "";
  return { hashtag: tag || bare, instagram: handle };
}

/* ── story chapters ─────────────────────────────────────────────────── */
const CHAPTER_TITLE = [
  [/met|first|hello|introduc|saw (her|him)|bumped/i, "The first hello"],
  [/propos|ring|knee|asked (her|him)|said yes/i, "The proposal"],
  [/coffee|walk|ritual|every|sunday|tradition/i, "Coffee became tradition"],
  [/travel|trip|holiday|road|mountain|beach/i, "The road that led here"],
  [/famil|parents|home|blessing/i, "Two families, one table"],
];
export function chapterTitle(text, index) {
  for (const [re, title] of CHAPTER_TITLE) if (re.test(text)) return title;
  return ["A moment we keep", "The one we retell", "Forever begins"][index % 3];
}

/* ══════════════════════════════════════════════════════════════════════
   READING ONE ANSWER

   Given the step we asked and what they typed, produce the patch to merge
   — or a `retry` message when the answer cannot be used. Never throws,
   never invents.
   ══════════════════════════════════════════════════════════════════════ */
export function readAnswer(step, text, tokens, attempt = 0) {
  const t = clean(text);
  const skip = isSkip(t);
  const optional = Boolean(step?.ack);

  if (!t) return { retry: "Sorry — I did not catch that." };

  /* Photographs never come through here. The create page uploads them,
     writes the URLs into the tokens itself and posts this marker so the
     interview has something to answer. It has to be caught before any
     step reads it: the tokens arrive already holding the pictures, so
     the step that asked for them can be finished by the time we look,
     and "[Added 2 photos]" would otherwise be read as the answer to
     whatever question came next — a thank-you note that said "[Added 1
     photo]" is exactly how that surfaced. */
  if (PHOTO_NOTE.test(t)) return { patch: {}, photos: true };

  if (skip && optional) return { patch: {}, skipped: true };

  /* Nobody should be trapped by a question they cannot answer. After two
     failed attempts an optional step gives up gracefully and moves on;
     asking a third time for a Google Maps link they do not have is how a
     form loses somebody. */
  if (optional && attempt >= 2) return { patch: {}, skipped: true, gaveUp: true };

  if (isJunk(t) && !skip) return { retry: "Let us try that again — what should I put down?" };

  switch (step.id) {
    case "names": {
      const n = parseNames(t);
      if (!n) return { retry: "I need both first names — something like “Meera and Rohan”." };
      return { patch: { couple: n } };
    }

    case "date": {
      const d = parseDate(t);
      if (!d) return { retry: "Could you give me the date as a day, month and year — “6 February 2027”?" };
      const time = parseTime(t);
      /* Deliberately NOT creating the ceremony event here. It used to,
         and that single line skipped the whole "which functions are you
         having?" question — `events` was already non-empty, so the step
         counted as answered and the couple were asked for the ceremony's
         time and place instead. "haldi, mehendi and a reception" then
         landed in a venue field. The ceremony is created at the
         `functions` step, where it belongs. */
      return {
        patch: {
          invitation: {
            displayDate: displayDate(d),
            countdownAt: `${isoDate(d)}T${time || "18:30"}`,
          },
        },
      };
    }

    case "religion": {
      const r = parseReligion(t);
      if (!r) return { patch: { invitation: { religion: "interfaith", deityLine: "" } } };
      return { patch: { invitation: r } };
    }

    case "hosts": {
      const hosts = parseHosts(t);
      /* parseHosts trusts a "together with…" answer verbatim, on the
         assumption it is the couple's own phrasing. That broke when the
         example in the question itself — "Together with the … and …
         families" — got typed back literally: the ellipses came right
         along with it and sat on the card as the families' actual name,
         forever, since this step never rejected anything before now. */
      if (/…|\.\.\./.test(hosts)) {
        return {
          retry: "I need the actual family names there — for example \"Mehra and Kapoor\", not the example wording.",
        };
      }
      return { patch: { couple: { hosts } } };
    }

    case "venue": {
      const v = parseVenue(t);
      /* Both pieces are required here, not just a name — this step's
         `done` check (wedding-prompt.js) needs venue.name AND
         venue.city, so silently accepting a name-only answer used to
         save it, thank the couple for it, and then ask the exact same
         question again forever: nothing ever made `done` true. Retrying
         with a message that names what's still missing breaks that
         loop and tells the couple what to fix. */
      if (!v.name) return { retry: "Which venue, and which city?" };
      if (!v.city) {
        return {
          retry: `Got "${v.name}" — and which city is that in? (Or send both together, like "${v.name}, Jaipur".)`,
        };
      }
      return {
        patch: {
          venue: {
            name: v.name,
            city: v.city,
            mapQuery: [v.name, v.city].filter(Boolean).join(", "),
          },
        },
      };
    }

    case "couple": {
      const haveBride = Boolean(clean(tokens?.couple?.brideIntro));
      return { patch: { couple: haveBride ? { groomIntro: t } : { brideIntro: t } } };
    }

    case "story": {
      const n = (tokens?.story || []).length;
      return {
        patch: {
          story: [{ id: `ch${n + 1}`, title: chapterTitle(t, n), description: t }],
        },
      };
    }

    case "functions": {
      const fns = parseFunctions(t);
      if (!fns.length) return { retry: "Name the functions you are having — haldi, mehendi, sangeet, reception?" };

      /* The ceremony is always on the timeline whether or not they name
         it, and it already has its date and time from the date step — so
         it is never asked for twice. */
      const ceremony = fns.find((f) => f.id === "ceremony");
      const iso = String(tokens?.invitation?.countdownAt || "");
      const date = iso.slice(0, 10);
      const time = iso.slice(11, 16);
      const style = FUNCTION_STYLE.ceremony;
      const seeded = {
        id: "ceremony",
        name: "Wedding Ceremony",
        date,
        time,
        venue: clean(tokens?.venue?.name),
        address: [tokens?.venue?.city, tokens?.venue?.state].filter(Boolean).join(", "),
        theme: style.theme,
        ...(ceremony || {}),
      };
      /* Carry the seeded date/time/venue even if parseFunctions matched
         the word "wedding" and produced a bare entry. */
      seeded.date = seeded.date || date;
      seeded.time = seeded.time || time;
      seeded.venue = seeded.venue || clean(tokens?.venue?.name);

      const rest = fns.filter((f) => f.id !== "ceremony");
      const order = ["mehendi", "haldi", "sangeet", "nikah", "ceremony", "reception", "after"];
      const all = [...rest, seeded].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      return { patch: { events: all } };
    }

    case "functionDetail": {
      const target = (tokens?.events || []).find((e) => !clean(e.time) || !clean(e.venue));
      if (!target) return { patch: {} };
      const { time, venue } = parseTimePlace(t);
      if (!time && !venue) return { retry: "What time does it start, and where?" };
      return { patch: { events: [{ ...target, time: time || target.time, venue: venue || target.venue }] } };
    }

    case "dress": {
      const target = (tokens?.events || []).find((e) => !clean(e.dressCode));
      if (!target) return { patch: {} };
      const house = FUNCTION_STYLE[target.id] || {};
      /* A dress code that is really a time and a place is an answer that
         has landed on the wrong question. Printing "18:30 At The Royal
         Courtyard" as a dress code is the sort of thing nobody notices
         until the invitation is out. */
      const looksLikeDress = /dress|wear|colour|color|saree|sari|suit|lehenga|kurta|sherwani|formal|casual|festive|pastel|ivory|floral/i.test(t);
      if ((parseTime(t) || parseUrl(t)) && !looksLikeDress) {
        return { retry: `That looks like it belongs somewhere else. For the ${target.name || "function"}, what should guests wear?` };
      }
      /* "the usual", "you choose", "whatever you think" → house style. */
      const useHouse = skip || /usual|you (choose|decide|pick)|whatever|default|standard/i.test(t);
      return {
        patch: {
          events: [{
            ...target,
            dressCode: useHouse ? house.dressCode || "Festive" : titled(t),
            theme: target.theme || house.theme || "",
          }],
        },
        usedHouse: useHouse,
      };
    }

    case "map": {
      const url = parseUrl(t);
      if (!url) return { retry: "Paste the Google Maps link, or say skip and I will search for the venue name." };
      return { patch: { venue: { mapLink: url } } };
    }

    case "travel":
      return { patch: { venue: { parking: t } } };

    case "rsvp": {
      const d = parseDate(t);
      return {
        patch: {
          rsvp: {
            enabled: true,
            deadline: d ? displayDate(d) : "",
            note: d ? `Kindly reply by ${displayDate(d)}.` : clean(t),
          },
        },
      };
    }

    case "social": {
      const s = parseSocial(t);
      if (!s.hashtag && !s.instagram) return { retry: "A hashtag like #MeeraAndRohan, or an Instagram handle?" };
      return { patch: { social: s } };
    }

    case "thanks":
      return { patch: { invitation: { thankYouNote: t } } };

    /* Photograph steps have nothing to read — the paperclip handles
       them, and a real upload was caught by PHOTO_NOTE above. Reaching
       here means they typed instead of attaching, so move on. */
    case "openingPhoto":
    case "storyPhotos":
    case "functionPhotos":
    case "gallery":
    case "closingPhoto":
      return { patch: {}, skipped: true };

    default:
      return { patch: {} };
  }
}

/* ══════════════════════════════════════════════════════════════════════
   THE WARM LINE

   A scripted interview still has to sound like a person. These vary with
   what was actually captured, so the couple hear their own answer read
   back rather than "Got it." fourteen times.
   ══════════════════════════════════════════════════════════════════════ */
export function acknowledge(step, result, tokens) {
  const c = tokens?.couple || {};
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* Pictures arrived. Said before the skip line, because a photograph
     step returns no patch either way and the couple who had just sent
     three photographs were being told "Of course — we can leave that." */
  if (result.photos) {
    return pick(["Those are in.", "Lovely — they are in.", "Got them, they are placed."]);
  }

  if (result.skipped) {
    return pick(["Of course — we can leave that.", "No trouble, skipping that one.", "That is fine, moving on."]);
  }

  switch (step.id) {
    case "names":
      return `${c.bride} and ${c.groom} — what lovely names to build this around.`;
    case "date":
      return `${tokens?.invitation?.displayDate} it is. That goes under the foil for your guests to scratch off.`;
    case "religion":
      return tokens?.invitation?.deityLine
        ? `Noted — I have set ${tokens.invitation.deityLine} at the head of the card.`
        : "Noted — I will keep the head of the card simple, then.";
    case "hosts":
      return "Both families are on the card now.";
    case "venue":
      return `${tokens?.venue?.name} — that is on the invitation and in the destination scene.`;
    case "couple":
      return clean(c.groomIntro) ? "Lovely. That is Meet the Couple done." : "Noted.";
    case "story": {
      const n = (tokens?.story || []).length;
      return n >= 2 ? "That is their story taking shape." : "A lovely place to start.";
    }
    case "functions": {
      const names = (tokens?.events || []).map((e) => e.name);
      return `${names.join(", ")} — all on the timeline.`;
    }
    case "functionDetail": {
      const done = (tokens?.events || []).filter((e) => clean(e.time) && clean(e.venue)).length;
      const total = (tokens?.events || []).length;
      return done >= total ? "Every function has its time and place now." : "Got that one down.";
    }
    case "dress":
      return result.usedHouse ? "I have used the traditional colours for that one." : "That sets the colour band on the card.";
    case "map":
      return "Pinned exactly — guests can tap straight through to directions.";
    case "travel":
      return "That will sit under the map.";
    case "rsvp":
      return "Set. Everyone who opens your link can reply on the page.";
    case "social":
      return tokens?.social?.instagram
        ? "Done — the share button will open your Instagram."
        : "Done — guests can post under that.";
    case "thanks":
      return "That closes the invitation beautifully.";
    case "openingPhoto":
    case "storyPhotos":
    case "functionPhotos":
    case "gallery":
    case "closingPhoto":
      return "Those are in.";
    default:
      return "Noted.";
  }
}

/* The steps where a model adds something a script cannot: prose. Used by
   the route to decide whether an enrichment call is worth making. */
export const PROSE_STEPS = new Set(["venue", "functionDetail", "story", "thanks"]);
