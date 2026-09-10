/* ══════════════════════════════════════════════════════════════════════
   Event classification.

   The design used to depend on the model returning an `eventKind`. When it
   did not — and it often did not, because the structured-output ladder in
   lib/ai/gemini.js falls back to free text on some models — every event
   collapsed to the same default: quiet-serif, arch, botanical, cream. A
   concert, a conference and a memorial all came out looking like the same
   wedding. That is the "only one template ever shows up" bug.

   So the server no longer asks the model what kind of event this is. It
   reads what the person actually typed. The model's answer is still
   preferred when it gives one; this is the floor, not the ceiling.

   Short keywords are word-bounded on purpose: without \b, `rave` matched
   inside "griha p-rave-sh" and sent a housewarming to the concert family.
   ══════════════════════════════════════════════════════════════════════ */

export const FAMILIES = ["wedding", "engagement", "milestone", "conference", "concert", "remembrance"];

/* Ordered. The first match wins, so the sombre and the specific are tested
   before the general. `kind` is the specific slug we show and store;
   `family` selects the design seed and the question plan. */
const RULES = [
  // ── quiet occasions first: these must never inherit a festive palette ──
  [/\bmemorial\b|remembrance|\bfuneral\b|prayer meet|condolence|shraddh|requiem|in loving memory|passed away|celebration of life/, "memorial", "remembrance"],

  // ── weddings and the functions around them ──
  [/\bwedding\b|\bmarriage\b|nikah|nikaah|shaadi|vivah|\bvivaah\b|getting married|reception/, "wedding", "wedding"],
  [/sangeet/, "sangeet", "wedding"],
  [/mehendi|mehndi/, "mehendi", "wedding"],
  [/\bhaldi\b/, "haldi", "wedding"],
  [/anniversar|silver jubilee|golden jubilee|renewal of vows/, "anniversary", "wedding"],

  // ── engagements ──
  [/engage|betroth|\broka\b|proposal|got engaged/, "engagement", "engagement"],
  [/bridal shower|baby shower|godh bharai|bachelor|hen (do|night|party)|stag (do|night|party)/, "shower", "engagement"],

  // ── work and civic ──
  [/conference|summit|symposium|seminar|\bexpo\b|exhibition|meetup|hackathon|workshop|webinar|demo day|offsite|\bagm\b|press meet|book launch|fundrais|gala dinner|award night|corporate/, "conference", "conference"],
  [/product launch|\blaunch (night|party|event)\b|unveiling/, "launch", "conference"],

  // ── music, sport, spectacle ──
  [/concert|\bgig\b|festival|\bfest\b|\bband\b|\bdj\b|club night|\btour\b|\brave\b|open mic|\bjam\b|album|\bmatch\b|marathon|tournament|sports day|screening|premiere|watch party/, "concert", "concert"],

  // ── milestones and family occasions ──
  [/birthday|\bbday\b|\bturning \d+/, "birthday", "milestone"],
  [/housewarm|griha pravesh|gruhapravesham|new home|new house/, "housewarming", "milestone"],
  [/naming ceremony|namkaran|christening|cradle ceremony|annaprashan|\bnaming\b/, "naming", "milestone"],
  [/baptism|first communion|confirmation/, "baptism", "milestone"],
  [/upanayanam|thread ceremony|bar mitzvah|bat mitzvah|puberty (function|ceremony)|half saree|ritu kala/, "ceremony", "milestone"],
  [/graduat|convocation/, "graduation", "milestone"],
  [/retire|farewell|send.?off/, "retirement", "milestone"],
  [/reunion|get.?together|welcome party|housewarming party/, "reunion", "milestone"],
  [/\bonam\b|\beid\b|diwali|christmas|new year|\bpooja\b|\bpuja\b|festival at home|temple function/, "celebration", "milestone"],
];

/** The event kind and design family behind a piece of text. */
export function classifyEvent(text) {
  /* Slugs arrive hyphenated from `?event=half-saree`; the rules are
     written in ordinary words. Normalise so both forms match. */
  const k = String(text || "").toLowerCase().replace(/[-_]+/g, " ");
  if (!k.trim()) return { kind: null, family: null, confident: false };
  for (const [re, kind, family] of RULES) {
    if (re.test(k)) return { kind, family, confident: true };
  }
  return { kind: null, family: null, confident: false };
}

/* Every kind slug the rules above can emit, mapped to its family. Built
   from RULES so it cannot drift out of step.

   This exists because a kind is not always matchable by the rule that
   produced it: "product launch night" yields the kind `launch`, but the
   bare word "launch" matches no rule, so looking the family up by
   re-classifying the slug returned null and fell back to `milestone`. A
   product launch was getting a birthday's cream and circles. */
const KIND_FAMILY = RULES.reduce((m, [, kind, family]) => {
  m[kind] = family;
  return m;
}, {});

/* Slugs the landing page links with that are narrower than any kind the
   rules emit. Without these, `?event=festival` and `?event=launch` would
   have to be re-derived from prose that no longer exists. */
const SLUG_FAMILY = {
  festival: "concert", launch: "conference", memorial: "remembrance",
  naming: "milestone", baptism: "milestone", graduation: "milestone",
  retirement: "milestone", reunion: "milestone", anniversary: "wedding",
};

/** The design family for a kind — model-supplied or our own. */
export function familyOf(kind) {
  if (!kind) return null;
  const k = String(kind).toLowerCase().replace(/[-_]+/g, " ").trim();
  if (FAMILIES.includes(k)) return k;
  if (KIND_FAMILY[k]) return KIND_FAMILY[k];
  if (SLUG_FAMILY[k]) return SLUG_FAMILY[k];
  return classifyEvent(k).family;
}

/* A stable number from a string. Used to pick which variant within a
   family an invitation starts from, so two weddings described differently
   do not open on identical colours. Deterministic, so the same
   conversation always rebuilds the same design. */
export function hashOf(text) {
  let h = 2166136261;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
