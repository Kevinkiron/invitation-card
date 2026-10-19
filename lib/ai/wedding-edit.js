/* ══════════════════════════════════════════════════════════════════════
   WEDDING — changes after the interview is finished

   Once every step is answered, nextWeddingStep() returns null and the
   interview has nothing left to ask. "Keep editing" used to post a
   message into exactly that state, and the route answered "Everything
   is answered — ready to publish" without reading it, so nothing the
   couple typed after finishing could ever change the invitation.

   This reads a change request the same way the interview reads an
   answer — locally, deterministically, no model needed to understand it:

     1. work out WHAT they want to change (a topic, or one function);
     2. if the new value is already in the message ("move the haldi to
        11am", "change the date to 12 Feb 2027"), apply it at once;
     3. otherwise ask for it, remember the target in `tokens._edit`, and
        apply the next message to that target only.
   ══════════════════════════════════════════════════════════════════════ */

import { functionsFor } from "./wedding-functions";
import {
  parseDate, parseTime, parseNames, parseReligion, parseHosts, parseVenue,
  parseFunctions, parseTimePlace, parseUrl, parseSocial, displayDate, isoDate,
  isSkip, isJunk, chapterTitle,
} from "./wedding-script";

const clean = (s) => String(s || "").trim().replace(/\s+/g, " ");
const titled = (s) => clean(s).replace(/\b[\p{L}]/gu, (c) => c.toUpperCase());
const list = (xs) => (Array.isArray(xs) ? xs : []);
/* "19:30" → "7:30 pm", for what we say back. */
const pretty = (hhmm) => {
  const m = String(hhmm || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return hhmm || "";
  const h = +m[1];
  return `${h % 12 || 12}${m[2] === "00" ? "" : `:${m[2]}`} ${h < 12 ? "am" : "pm"}`;
};

export const FINISHED = /^(done|i'?m done|all done|that'?s (it|all|everything)|finished|no more|nothing( else)?|no,? (that'?s|thats) (it|all)|looks (good|great|perfect)|all good|perfect|publish|ready)\b/i;
const CANCEL = /^(never ?mind|cancel|leave it|keep it|no change|forget it)\b/i;
const REMOVE = /\b(remove|delete|drop|cancel(?:led)?|no longer|not having|take out|get rid of)\b/i;
const ADD = /\b(add|also (?:have|having)|another|include|plus a)\b/i;
const DRESS = /\b(dress(?: ?code)?|wear|attire|outfit)\b/i;
const DIRECTION = /\b(warmer|shorter|longer|formal|casual|simpler|simple|nicer|better|rewrite|re-?word|more|less|emotional|fun|funny|elegant|traditional|modern)\b/i;

/* The quoted part of a message, if there is one: change it to "…". */
function quoted(text) {
  const m = String(text || "").match(/["“”'‘’]([^"“”]{3,})["“”'‘’]\s*$/) || String(text || "").match(/["“]([^"”]{3,})["”]/);
  return m ? clean(m[1]) : "";
}
/* "… to <value>" at the end of a request. */
function afterTo(text) {
  const m = clean(text).match(/\b(?:to|as|is|should be|=)\s*:?\s+(.{2,})$/i);
  return m ? clean(m[1]).replace(/[.!]+$/, "") : "";
}

/* Which of THIS invitation's functions a message names. */
function findEvent(text, tokens) {
  const t = clean(text).toLowerCase();
  const evs = list(tokens?.events);
  for (const e of evs) {
    const words = [e.id, ...(String(e.name || "").toLowerCase().split(/\s+/))]
      .map((w) => String(w || "").toLowerCase())
      .filter((w) => w.length > 3 && !["ceremony", "function", "party", "night", "the"].includes(w));
    if (words.some((w) => new RegExp(`\\b${w.replace(/[^a-z0-9]/g, "")}`, "i").test(t))) return e;
  }
  /* "the ceremony" / "the wedding" with a time in it means the main one. */
  if (/\b(ceremony|wedding|pheras?|muhurat|muhurtham)\b/i.test(t)) {
    const { ceremonyId } = functionsFor(tokens?.invitation?.religion);
    return evs.find((e) => e.id === ceremonyId) || null;
  }
  return null;
}

/* Topics in order: the specific before the general ("map" before
   "venue", "bride intro" before "bride"). */
const TOPICS = [
  { step: "map",     re: /\b(map|maps|pin|location link|google)\b/i },
  { step: "travel",  re: /\b(parking|travel|airport|station|directions|getting there)\b/i },
  { step: "rsvp",    re: /\b(rsvp|reply by|respond by|deadline)\b/i },
  { step: "social",  re: /(#|@|\b(hashtag|instagram|insta|handle)\b)/i },
  { step: "thanks",  re: /\b(thank|thanks|thank-you|closing)\b/i },
  { step: "message", re: /\b(message|wording|paragraph|invitation text|card text|headline)\b/i },
  { step: "couple",  re: /\b(intro|introduction|about (him|her|them|the bride|the groom)|meet the couple|line about|describ)/i },
  { step: "story",   re: /\b(story|chapter|how (we|they) met|proposal)\b/i },
  { step: "hosts",   re: /\b(famil(y|ies)|hosts?|parents)\b/i },
  { step: "religion",re: /\b(religion|tradition|faith|symbol|deity|invocation)\b/i },
  { step: "names",   re: /\b(names?|bride|groom|spell|spelling|spelt)\b/i },
  { step: "date",    re: /\b(date|day|time|timing|muhurat|muhurtham|postpone|moved|reschedul)/i },
  { step: "venue",   re: /\b(venue|hall|place|city|location|address|resort|hotel|lawns?)\b/i },
  { step: "dress",   re: DRESS },
  { step: "photos",  re: /\b(photo|photos|picture|pictures|image|images|pic|pics)\b/i },
  { step: "music",   re: /\b(music|song|track|audio)\b/i },
  { step: "colour",  re: /\b(colou?rs?|background|theme|palette|gradient)\b/i },
];

/* The question to ask for a target whose value was not in the message. */
export function editQuestion(target, tokens) {
  const c = tokens?.couple || {};
  const ev = list(tokens?.events).find((e) => e.id === target.eventId);
  switch (target.step) {
    case "names": return "What should the two first names be — bride and groom?";
    case "date": return "What is the new date, and what time does the main ceremony begin?";
    case "religion": return "Which tradition — Hindu, Muslim, Christian, Sikh, Jain, Buddhist, or a mix?";
    case "hosts": return "Which families are hosting? For example “Mehra and Kapoor”.";
    case "venue": return "What is the new venue — the name and the city?";
    case "map": return "Paste the new Google Maps link.";
    case "travel": return "What should guests know about getting there — parking, the nearest airport or station?";
    case "rsvp": return "By when should guests reply?";
    case "social": return "What hashtag (and Instagram handle, if you like) should guests use?";
    case "message": return "Type the invitation message exactly as you would like it — or tell me the feel (warmer, shorter, more formal) and I will rewrite it.";
    case "thanks": return "Type the new thank-you line — or tell me the feel and I will rewrite it.";
    case "couple":
      return target.which === "groom"
        ? `And the new line about ${c.groom || "the groom"}? (Say skip to keep the current one.)`
        : `What should the line about ${c.bride || "the bride"} say? (Say skip to keep the current one.)`;
    case "story":
      return target.n
        ? "And the next moment? Say done if that is all."
        : "Tell me the first moment of their story again — how they met. I will replace the chapters with what you send.";
    case "functionDetail": return `When and where is the ${ev?.name || "function"} now? For example “11:00 am at the Garden Lawns”.`;
    case "dress": return `What should guests wear for the ${ev?.name || "function"}?`;
    case "pickFunction": return `Which function — ${list(tokens?.events).map((e) => e.name).join(", ")}?`;
    default: return "";
  }
}

const HELP = (tokens) =>
  `What would you like to change? You can say things like “change the date to 14 February 2027”, “move the ${
    list(tokens?.events)[0]?.name || "haldi"
  } to 11 am”, “add a sangeet”, “change the venue”, “rewrite the message warmer”, or “the bride's name is Priya”. Photos, music and the background colour are in the options below the chat.`;

/* Keep the main ceremony on the timeline in step with the card. */
function syncCeremony(tokens, fields) {
  const { ceremonyId } = functionsFor(tokens?.invitation?.religion);
  const evs = list(tokens.events);
  if (!evs.some((e) => e.id === ceremonyId)) return tokens;
  return { ...tokens, events: evs.map((e) => (e.id === ceremonyId ? { ...e, ...fields } : e)) };
}

/* Apply a value to a target. Returns { tokens } or { retry } or { ask }.
   `merge` is patchWeddingTokens, passed in to keep this file free of the
   design layer. */
export function applyEdit(target, text, tokens, merge) {
  const t = clean(text);
  /* Free text (a note, a line about someone) is taken whole; "… to X"
     is only peeled off where a short value is expected. */
  const value = quoted(t) || t;
  const evs = list(tokens?.events);

  switch (target.step) {
    case "names": {
      /* One name: "the bride's name is Priya", "groom to Arjun". */
      const one = t.match(/\b(bride|groom)(?:'s)?(?:\s+name)?\s*(?:to|is|should be|as|=|:)\s+([\p{L}'-]+)/iu);
      if (one) return { tokens: merge(tokens, { couple: { [one[1].toLowerCase()]: titled(one[2]) } }), said: `${titled(one[2])} it is.` };
      const n = parseNames(afterTo(t) || t);
      if (!n) return { retry: "I need both first names — something like “Meera and Rohan”." };
      return { tokens: merge(tokens, { couple: n }), said: `${n.bride} and ${n.groom} — updated everywhere on the page.` };
    }
    case "date": {
      const d = parseDate(t);
      const time = parseTime(t);
      const curIso = String(tokens?.invitation?.countdownAt || "");
      if (!d && time && curIso) {
        /* Just the time moved. */
        const next = merge(tokens, { invitation: { countdownAt: `${curIso.slice(0, 10)}T${time}` } });
        return { tokens: syncCeremony(next, { time }), said: `The ceremony now begins at ${pretty(time)}.` };
      }
      if (!d) return { retry: "Could you give me the date as a day, month and year — “6 February 2027”?" };
      const hhmm = time || curIso.slice(11, 16) || "18:30";
      const next = merge(tokens, { invitation: { displayDate: displayDate(d), countdownAt: `${isoDate(d)}T${hhmm}` } });
      return { tokens: syncCeremony(next, { date: isoDate(d), time: hhmm }), said: `${displayDate(d)} it is — the date reveal and the countdown are updated.` };
    }
    case "religion": {
      const r = parseReligion(t);
      if (!r) return { retry: "Which one — Hindu, Muslim, Christian, Sikh, Jain, Buddhist, a mix, or none?" };
      return { tokens: merge(tokens, { invitation: r }), said: r.deityLine ? `Done — ${r.deityLine} now heads the card.` : "Done — the head of the card is kept simple." };
    }
    case "hosts": {
      const hosts = parseHosts(afterTo(t) || t);
      if (!hosts || /…|\.\.\./.test(hosts)) return { retry: "Which family names? For example “Mehra and Kapoor”." };
      return { tokens: merge(tokens, { couple: { hosts } }), said: `The card now reads “${hosts}”.` };
    }
    case "venue": {
      const v = parseVenue(afterTo(t) || t);
      if (!v.name || !v.city) return { retry: "Send the venue and the city together, like “The Leela Palace, Jaipur”." };
      const oldName = clean(tokens?.venue?.name);
      let next = merge(tokens, { venue: { name: v.name, city: v.city, mapQuery: `${v.name}, ${v.city}` } });
      /* The old pin points at the old venue — drop it. */
      if (next.venue?.mapLink) next = { ...next, venue: { ...next.venue, mapLink: "" } };
      next = { ...next, events: list(next.events).map((e) => (clean(e.venue) && clean(e.venue) === oldName ? { ...e, venue: v.name } : e)) };
      return { tokens: next, said: `${v.name}, ${v.city} — on the card and in the destination scene. The map now searches for it by name; paste a Google Maps link if you want it pinned exactly.`, prose: "venue" };
    }
    case "map": {
      const url = parseUrl(t);
      if (!url) return { retry: "Paste the Google Maps link — it starts with https://" };
      return { tokens: merge(tokens, { venue: { mapLink: url } }), said: "Pinned — guests can tap straight through to directions." };
    }
    case "travel":
      return { tokens: merge(tokens, { venue: { parking: value } }), said: "Updated — that sits under the map." };
    case "rsvp": {
      const d = parseDate(t);
      if (!d) return { retry: "By which date — for example “20 January 2027”?" };
      return { tokens: merge(tokens, { rsvp: { enabled: true, deadline: displayDate(d), note: `Kindly reply by ${displayDate(d)}.` } }), said: `Guests are now asked to reply by ${displayDate(d)}.` };
    }
    case "social": {
      const s = parseSocial(quoted(t) || afterTo(t) || t);
      if (!s.hashtag && !s.instagram) return { retry: "A hashtag like #MeeraAndRohan, or an Instagram handle like @meera?" };
      return { tokens: merge(tokens, { social: s }), said: "Updated — the share scene uses that now." };
    }
    case "message":
    case "thanks": {
      const field = target.step === "message" ? "message" : "thankYouNote";
      const q = quoted(t);
      if (q) return { tokens: merge(tokens, { invitation: { [field]: q } }), said: "Updated, word for word." };
      const words = t.split(/\s+/).length;
      if (DIRECTION.test(t) && words <= (target.asked ? 6 : 14)) return { rewrite: { field, direction: t } };
      if (target.asked) return { tokens: merge(tokens, { invitation: { [field]: value } }), said: "Updated, word for word." };
      return { ask: true };
    }
    case "couple": {
      const which = target.which === "groom" ? "groomIntro" : "brideIntro";
      let next = tokens;
      if (!isSkip(t)) next = merge(tokens, { couple: { [which]: value } });
      if (target.which !== "groom") return { tokens: next, then: { step: "couple", which: "groom" } };
      return { tokens: next, said: "Meet the Couple is updated." };
    }
    case "story": {
      if (target.n && (isSkip(t) || /^(done|that'?s (it|all))\b/i.test(t))) return { tokens, said: "Their story is updated." };
      const n = Number(target.n || 0);
      const chapter = { id: `ch${n + 1}`, title: chapterTitle(t, n), description: t };
      const story = n === 0 ? [chapter] : [...list(tokens.story).slice(0, n), chapter];
      const next = { ...tokens, story };
      if (n + 1 >= 3) return { tokens: next, said: "Their story is updated.", prose: "story" };
      return { tokens: next, then: { step: "story", n: n + 1 }, prose: "story" };
    }
    case "functionDetail": {
      const ev = evs.find((e) => e.id === target.eventId);
      if (!ev) return { retry: editQuestion({ step: "pickFunction" }, tokens) };
      const d = parseDate(t);
      let { time, venue } = parseTimePlace(t.replace(/\b(\d{1,2})(?:st|nd|rd|th)?\s+[a-z]+\.?,?(\s+\d{4})?/i, (m) => (parseDate(m) ? " " : m)));
      /* "move the haldi to 11am" — the function's own name is not a venue. */
      if (venue && /\b(move|change|shift|make|haldi|mehendi|sangeet|reception|ceremony|nikah|walima)\b/i.test(venue)) {
        const at = t.match(/\b(?:at|in)\s+(?!\d)(.{3,})$/i);
        venue = at ? titled(at[1]) : "";
      }
      if (!time && !venue && !d) return { retry: `What time does the ${ev.name} start, and where?` };
      const upd = { ...ev, time: time || ev.time, venue: venue || ev.venue, ...(d ? { date: isoDate(d) } : {}) };
      let next = { ...tokens, events: evs.map((e) => (e.id === ev.id ? upd : e)) };
      /* Moving the main ceremony moves the card's date and countdown too. */
      const { ceremonyId } = functionsFor(tokens?.invitation?.religion);
      if (ev.id === ceremonyId && (time || d)) {
        const iso = String(next.invitation?.countdownAt || "");
        const day = d ? isoDate(d) : iso.slice(0, 10);
        next = merge(next, { invitation: { countdownAt: `${day}T${upd.time || "18:30"}`, ...(d ? { displayDate: displayDate(d) } : {}) } });
      }
      const bits = [time && `at ${pretty(upd.time)}`, venue && `at ${upd.venue}`, d && `on ${displayDate(d)}`].filter(Boolean).join(", ");
      return { tokens: next, said: `The ${ev.name} is now ${bits}.` };
    }
    case "dress": {
      const ev = evs.find((e) => e.id === target.eventId);
      if (!ev) return { retry: editQuestion({ step: "pickFunction" }, tokens) };
      const house = functionsFor(tokens?.invitation?.religion).style[ev.id] || {};
      const useHouse = isSkip(t) || /usual|you (choose|decide|pick)|whatever|default|standard/i.test(t);
      const raw = afterTo(t) || t;
      const dressCode = useHouse ? house.dressCode || "Festive" : titled(raw.replace(/^(guests should wear|wear)\s+/i, ""));
      return { tokens: { ...tokens, events: evs.map((e) => (e.id === ev.id ? { ...e, dressCode } : e)) }, said: `The ${ev.name} card now says “${dressCode}”.` };
    }
    default:
      return { retry: HELP(tokens) };
  }
}

/* Read a fresh change request (no `_edit` pending). Returns one of:
     { finished }                       — they are done
     { help }                           — could not tell what to change
     { tokens, said }                   — applied straight away
     { target }                         — ask editQuestion(target)
     { rewrite, target }                — prose rewrite wanted (route calls the model)
     { pointer }                        — handled by the controls under the chat */
export function readEdit(text, tokens, merge) {
  const t = clean(text);
  if (!t || isJunk(t)) return { help: true };
  if (FINISHED.test(t)) return { finished: true };

  const religion = tokens?.invitation?.religion;
  const evs = list(tokens?.events);

  /* "it's a Sikh wedding now" — the tradition, not the ceremony card. */
  if (/\b(hindu|muslim|islamic|christian|catholic|sikh|jain|buddhist|inter[- ]?faith|mixed|secular|religion|tradition|faith)\b/i.test(t) && !parseTime(t) && !REMOVE.test(t)) {
    const r = applyEdit({ step: "religion" }, t, tokens, merge);
    return r.tokens ? r : { target: { step: "religion" } };
  }

  const ev = findEvent(t, tokens);

  /* Remove a function. */
  if (ev && REMOVE.test(t)) {
    if (evs.length <= 1) return { tokens, said: `The ${ev.name} is the only function on the timeline, so I have kept it — tell me what to change about it instead.` };
    return { tokens: { ...tokens, events: evs.filter((e) => e.id !== ev.id) }, said: `The ${ev.name} is off the timeline.` };
  }

  /* Add a function they name that is not on the timeline yet. */
  if (ADD.test(t) || (!ev && /\b(haldi|mehendi|mehndi|sangeet|reception|cocktail|nikah|walima|tilak|engagement|roka|mayra|chooda|baraat|brunch)\b/i.test(t))) {
    const known = new Set(evs.map((e) => e.id));
    const fresh = parseFunctions(t, religion).filter((f) => !known.has(f.id) && f.theme !== undefined);
    if (fresh.length) {
      const style = functionsFor(religion).style;
      const added = fresh.map((f) => ({ ...f, dressCode: (style[f.id] || {}).dressCode || "" }));
      const order = functionsFor(religion).order;
      const all = [...evs, ...added].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      const next = { ...tokens, events: all };
      const first = added[0];
      const { time, venue } = parseTimePlace(t);
      if (time && venue && added.length === 1) {
        next.events = next.events.map((e) => (e.id === first.id ? { ...e, time, venue } : e));
        return { tokens: next, said: `${first.name} added — ${pretty(time)} at ${venue}.` };
      }
      return { tokens: next, said: `${added.map((a) => a.name).join(" and ")} added to the timeline.`, then: { step: "functionDetail", eventId: first.id } };
    }
  }

  /* One function: its dress code, or its time and place. */
  if (ev) {
    const target = { step: DRESS.test(t) ? "dress" : "functionDetail", eventId: ev.id };
    const hasValue = target.step === "dress" ? Boolean(afterTo(t)) : Boolean(parseTime(t) || parseDate(t) || /\b(at|in)\s+(?!\d)\S{3,}/i.test(t.replace(new RegExp(ev.name, "i"), "")));
    if (hasValue) {
      const r = applyEdit(target, t, tokens, merge);
      if (r.tokens) return r;
    }
    return { target };
  }

  const topic = TOPICS.find((x) => x.re.test(t));
  if (!topic) return { help: true };

  if (topic.step === "photos") return { pointer: "Use the Photos option below the chat to add or replace pictures — each one lands in the scene it belongs to." };
  if (topic.step === "music") return { pointer: "Pick a new track with the Music option below the chat." };
  if (topic.step === "colour") return { pointer: "Choose a new background with the Background colour option below the chat — the preview changes as you pick." };
  if (topic.step === "dress") return { target: { step: "pickFunction", next: "dress" } };

  const target = { step: topic.step };
  if (topic.step === "couple") target.which = /\b(groom|him|his)\b/i.test(t) ? "groom" : "bride";

  /* Try the message itself first: "change the date to 12 Feb 2027". */
  const direct = {
    names: () => /\b(bride|groom)(?:'s)?(?:\s+name)?\s*(?:to|is|should be|as|=|:)\s+\S/i.test(t) || Boolean(parseNames(afterTo(t))),
    date: () => Boolean(parseDate(t) || parseTime(t)),
    religion: () => Boolean(parseReligion(t.replace(TOPICS.find((x) => x.step === "religion").re, ""))),
    hosts: () => Boolean(afterTo(t)),
    venue: () => { const v = parseVenue(afterTo(t)); return Boolean(afterTo(t) && v.name && v.city); },
    map: () => Boolean(parseUrl(t)),
    rsvp: () => Boolean(parseDate(t)),
    social: () => /[#@]\w/.test(t),
    message: () => Boolean(quoted(t)) || DIRECTION.test(t),
    thanks: () => Boolean(quoted(t)) || DIRECTION.test(t),
  }[topic.step];

  if (direct && direct()) {
    const r = applyEdit(target, t, tokens, merge);
    if (r.tokens) return r;
    if (r.rewrite) return { ...r, target };
  }
  return { target };
}

export { CANCEL };
