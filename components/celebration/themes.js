/* ══════════════════════════════════════════════════════════════════════
   CELEBRATION THEMES

   One engine (components/CelebrationCinema.js), three genuinely different
   invitations. Everything that makes a birthday not a naming ceremony
   lives here: its palette, its ornaments, which scenes it has and in what
   order, what each scene is called, how the date is revealed, and the
   voice the empty states speak in.

   The engine knows nothing about birthdays. It asks the theme what to
   draw. That is the only reason three templates can share a component
   without becoming one template rendered in three colourways.
   ══════════════════════════════════════════════════════════════════════ */

import { CELEBRATION_PALETTES } from "@/lib/design/celebration-tokens";
import {
  AgeBadge,
  ArchFrame,
  BuntingGarland,
  CandleCluster,
  CloudRule,
  CornerStar,
  CradleMotif,
  Diya,
  DoorwayArch,
  HouseKey,
  MoonStars,
  PartyFrame,
  RangoliMedallion,
  SparklerBurst,
  StarRule,
  ThresholdFrame,
  TinyFeet,
  ToranaRule,
} from "@/components/celebration/ornaments";

/* ══════════════════════════════════════════════════════════════════════
   PALETTE RESOLUTION

   A palette can come from three places: the seed in celebration-tokens,
   a variant this file chooses from the data (a first birthday is not a
   sixtieth), or the host — the AI writes `palette` when someone asks for
   "something in sage and cream".

   The host must always win. The only way to tell a chosen palette from
   the seed is that it differs from the seed, so that is the test: while
   the palette is still untouched we are free to refine it, and the moment
   a single value changes we keep our hands off. Without this check the
   age heuristic would quietly overwrite a colour the host picked by name,
   which is the sort of bug that gets reported as "it keeps changing back".
   ══════════════════════════════════════════════════════════════════════ */
function untouched(p, kind) {
  const seed = CELEBRATION_PALETTES[kind];
  if (!p) return true;
  return Object.keys(seed).every(
    (k) => !p[k] || String(p[k]).toLowerCase() === seed[k].toLowerCase()
  );
}

/* Digits out of an ordinal string: "60th" → 60, "" → null. The token is a
   string on purpose (ordinals, "half"), so every read of it has to cope
   with there being no number in it at all. */
export function ageNumber(tokens) {
  const m = String(tokens?.host?.age || "").match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/* The ages that get the grand treatment. Round decades from thirty up,
   plus the ones that are milestones in their own right. */
const MILESTONES = new Set([16, 18, 21, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100]);

/* A first birthday is a soft, nursery-toned thing; a sixtieth is a
   banquet. Same template, two different rooms. */
const BIRTHDAY_FIRST = {
  primary: "#7c4a63",
  secondary: "#e2a3b4",
  accent: "#f2c14e",
  paper: "#fff7ef",
  text: "#4a2b3a",
};
const BIRTHDAY_MILESTONE = {
  primary: "#3f1230",
  secondary: "#8c2d4e",
  accent: "#d9a441",
  paper: "#fbf1e0",
  text: "#2e1022",
};

function birthdayPalette(tokens) {
  const p = tokens?.palette;
  if (!untouched(p, "birthday")) return { ...CELEBRATION_PALETTES.birthday, ...p };
  const n = ageNumber(tokens);
  if (n === 1) return { ...BIRTHDAY_FIRST };
  if (n !== null && (MILESTONES.has(n) || (n >= 30 && n % 10 === 0))) return { ...BIRTHDAY_MILESTONE };
  return { ...CELEBRATION_PALETTES.birthday };
}

function plainPalette(kind) {
  return (tokens) => ({ ...CELEBRATION_PALETTES[kind], ...(tokens?.palette || {}) });
}

/* ══════════════════════════════════════════════════════════════════════
   BIRTHDAY — warm, joyful, a little loud
   ══════════════════════════════════════════════════════════════════════ */
const birthday = {
  kind: "birthday",
  className: "cc-birthday",
  label: "Birthday",

  paletteFor: birthdayPalette,

  /* The curtain parts on a row of bunting; confetti falls the whole way
     down the page. */
  opening: "curtain",
  particles: "confetti",
  particleColors: (p) => [p.accent, p.secondary, p.paper, p.primary],

  /* Foil over the date, rubbed off. A birthday is the one of the three
     where a guest scratching at their screen is in keeping. */
  dateReveal: "scratch",

  Motif: ({ palette, tokens }) => (
    <CandleCluster
      id="bday-motif"
      wax={palette.paper}
      stripe={palette.secondary}
      flame={palette.accent}
      /* One candle per year gets silly past seven; the cluster is a
         symbol, not a count. */
      count={Math.min(5, Math.max(3, ageNumber(tokens) || 3))}
    />
  ),

  OpeningOrnament: ({ palette }) => (
    <BuntingGarland
      id="bday-open"
      colors={[palette.accent, palette.secondary, palette.paper]}
      thread={palette.accent}
    />
  ),

  /* The age is the crest. A birthday without a number falls back to a
     sparkler so the head of the card is never bare. */
  CardCrest: ({ palette, tokens }) =>
    tokens?.host?.age ? (
      <AgeBadge id="bday-crest" value={tokens.host.age} ink={palette.paper} ring={palette.accent} />
    ) : (
      <SparklerBurst id="bday-crest" color={palette.accent} />
    ),

  CardFrame: ({ palette }) => <PartyFrame color={palette.accent} />,

  CardCorners: ({ palette }) => (
    <>
      <span className="cc-slot cc-slot-tl"><CornerStar id="tl" color={palette.accent} /></span>
      <span className="cc-slot cc-slot-tr"><CornerStar id="tr" color={palette.accent} /></span>
      <span className="cc-slot cc-slot-bl"><CornerStar id="bl" color={palette.secondary} /></span>
      <span className="cc-slot cc-slot-br"><CornerStar id="br" color={palette.secondary} /></span>
    </>
  ),

  Rule: ({ palette }) => <StarRule color={palette.accent} />,

  DateOrnament: ({ palette }) => <SparklerBurst id="bday-date" color={palette.accent} />,

  scenes: [
    "opening", "date", "card", "about", "story",
    "programme", "venue", "rsvp", "wishes", "gallery", "share", "closing",
  ],

  headings: {
    date: { eyebrow: "Mark the day", title: "There is a date under that foil" },
    card: { eyebrow: "The invitation", title: "You are on the list" },
    about: { eyebrow: "The birthday star", title: (c) => (c.name ? `All about ${c.name}` : "All about the birthday star") },
    story: { eyebrow: "A year in moments", title: "The year that got us here" },
    programme: { eyebrow: "The plan", title: "How the day unfolds", intro: "Cake, chaos and everything in between." },
    venue: { eyebrow: "Where", title: "Find the party" },
    rsvp: { eyebrow: "One small thing", title: "Say you are coming" },
    wishes: { eyebrow: "From everyone", title: "Birthday wishes" },
    gallery: { eyebrow: "The album", title: "A few favourite frames" },
    share: { eyebrow: "After the cake", title: "Tag us in everything" },
  },

  voice: {
    kicker: "It is party time",
    openCue: "Tap to open",
    scrollCue: "Let's get into it",
    dateEyebrow: "Mark the day",
    waiting: "The date is still under wraps",
    revealLabel: "Reveal the date",
    hintBefore: "Rub the foil away",
    hintAfter: "Put it in the calendar before you forget",
    cardWaiting: "Reveal the date above",
    countdownLabel: "Until the candles are lit",
    shareNote: "Post the blurry ones too. Especially the blurry ones.",
    signature: "Birthday Cinema by Welcvm",
    role: "the birthday star",
  },

  empty: {
    name: "The birthday star",
    hosts: "With love, from all of us",
    photo: "A photograph belongs here",
  },
};

/* ══════════════════════════════════════════════════════════════════════
   NAMING CEREMONY / BABY SHOWER — soft, hushed, tender
   ══════════════════════════════════════════════════════════════════════ */
const naming = {
  kind: "naming",
  className: "cc-naming",
  label: "Naming ceremony",

  paletteFor: plainPalette("naming"),

  /* No curtain and no bang. The page simply lightens, the way a room
     does when someone opens the curtains on a sleeping baby. */
  opening: "veil",
  particles: "stardust",
  particleColors: (p) => [p.accent, p.paper, p.secondary],

  /* The name is not scratched off. It unfolds — a card opening, which is
     the gesture a naming ceremony actually involves. */
  dateReveal: "unfold",

  Motif: ({ palette }) => (
    <CradleMotif id="nm-motif" wood={palette.accent} cloth={palette.secondary} hood={palette.paper} star={palette.accent} />
  ),

  OpeningOrnament: ({ palette }) => (
    <MoonStars id="nm-open" moon={palette.accent} star={palette.paper} glow={palette.accent} />
  ),

  CardCrest: ({ palette }) => (
    <MoonStars id="nm-crest" moon={palette.accent} star={palette.paper} glow={palette.secondary} />
  ),

  CardFrame: ({ palette }) => <ArchFrame color={palette.accent} />,

  CardCorners: ({ palette }) => (
    <span className="cc-slot cc-slot-foot"><TinyFeet color={palette.secondary} /></span>
  ),

  Rule: ({ palette }) => <CloudRule color={palette.accent} cloud={palette.paper} />,

  DateOrnament: ({ palette }) => <TinyFeet color={palette.secondary} />,

  /* The card comes before the date here. The point of the evening is the
     name, and the name is on the card — the date is the practical detail
     that follows it, not the surprise. */
  scenes: [
    "opening", "card", "date", "about", "story",
    "programme", "venue", "gallery", "rsvp", "wishes", "share", "closing",
  ],

  headings: {
    date: { eyebrow: "The morning of", title: "Unfold the day" },
    card: { eyebrow: "With folded hands", title: "We have chosen a name" },
    about: { eyebrow: "Our little one", title: (c) => (c.name ? `Meet ${c.name}` : "Meet our little one") },
    story: { eyebrow: "How we got here", title: "Small beginnings" },
    programme: { eyebrow: "The morning", title: "The order of the day", intro: "Quietly, and then with everyone." },
    venue: { eyebrow: "Where", title: "Come to us" },
    rsvp: { eyebrow: "Kindly", title: "Will you be with us?" },
    wishes: { eyebrow: "For the baby", title: "Blessings" },
    gallery: { eyebrow: "First photographs", title: "The first few weeks" },
    share: { eyebrow: "Afterwards", title: "Share a photograph with us" },
  },

  voice: {
    kicker: "With the blessings of our elders",
    openCue: "Open gently",
    scrollCue: "Come and see",
    dateEyebrow: "The morning of",
    waiting: "Fold open the card to see the day",
    revealLabel: "Unfold the card",
    hintBefore: "Tap the card to open it",
    hintAfter: "We would love you there",
    cardWaiting: "Unfold the card above",
    countdownLabel: "Until we say the name aloud",
    shareNote: "If you take a photograph, please send it to us. We will keep every one.",
    signature: "Naming Cinema by Welcvm",
    role: "our little one",
  },

  empty: {
    name: "Our little one",
    hosts: "From the family",
    photo: "A photograph belongs here",
  },
};

/* ══════════════════════════════════════════════════════════════════════
   HOUSEWARMING / GRIHA PRAVESH — grounded, warm, architectural
   ══════════════════════════════════════════════════════════════════════ */
const housewarming = {
  kind: "housewarming",
  className: "cc-housewarming",
  label: "Griha pravesh",

  paletteFor: plainPalette("housewarming"),

  /* A doorway, not a curtain. The guest is not being shown a stage — they
     are being asked over the threshold. */
  opening: "threshold",
  particles: "embers",
  particleColors: (p) => [p.accent, p.secondary],

  /* The date is behind the door. Tapping it swings the leaves open. */
  dateReveal: "doorway",

  Motif: ({ palette }) => (
    <DoorwayArch id="hw-motif" wood={palette.secondary} brass={palette.accent} deep={palette.primary} />
  ),

  OpeningOrnament: ({ palette }) => (
    <ToranaRule id="hw-open" leaf={palette.primary} thread={palette.accent} bud={palette.secondary} />
  ),

  CardCrest: ({ palette }) => (
    <RangoliMedallion id="hw-crest" color={palette.secondary} accent={palette.accent} />
  ),

  CardFrame: ({ palette }) => <ThresholdFrame color={palette.accent} />,

  CardCorners: ({ palette }) => (
    <>
      <span className="cc-slot cc-slot-diya-l"><Diya id="dl" clay={palette.secondary} oil={palette.accent} flame={palette.accent} /></span>
      <span className="cc-slot cc-slot-diya-r"><Diya id="dr" clay={palette.secondary} oil={palette.accent} flame={palette.accent} /></span>
    </>
  ),

  Rule: ({ palette }) => <ToranaRule id="hw-rule" leaf={palette.primary} thread={palette.accent} bud={palette.secondary} />,

  DateOrnament: ({ palette }) => <HouseKey id="hw-date" metal={palette.accent} />,

  /* Where the house is comes early — for a housewarming the address is
     half the news, and several guests have never been to this part of
     town before. */
  scenes: [
    "opening", "date", "card", "venue", "programme",
    "about", "story", "rsvp", "gallery", "wishes", "share", "closing",
  ],

  headings: {
    date: { eyebrow: "The auspicious day", title: "The door opens on" },
    card: { eyebrow: "Griha pravesh", title: "Our first day in the new house" },
    about: { eyebrow: "The house", title: (c) => (c.name ? `About ${c.name}` : "About the house") },
    story: { eyebrow: "How it was built", title: "From a plot to a home" },
    programme: { eyebrow: "The day", title: "Puja, lunch, and the long afternoon" },
    venue: { eyebrow: "The address", title: "Where to find us now" },
    rsvp: { eyebrow: "So we can cook", title: "Tell us you are coming" },
    wishes: { eyebrow: "For the house", title: "Blessings at the door" },
    gallery: { eyebrow: "Room by room", title: "A look inside" },
    share: { eyebrow: "On the day", title: "Show us your corner of it" },
  },

  voice: {
    kicker: "With gratitude, and with you",
    openCue: "Step inside",
    scrollCue: "Come through",
    dateEyebrow: "The auspicious day",
    waiting: "The door is still shut",
    revealLabel: "Open the door",
    hintBefore: "Tap the door to open it",
    hintAfter: "Our door is open from that morning",
    cardWaiting: "Open the door above",
    countdownLabel: "Until the lamp is lit",
    shareNote: "Tag us so we can keep every photograph of the first day.",
    signature: "Griha Pravesh Cinema by Welcvm",
    role: "our new home",
  },

  empty: {
    name: "Our new home",
    hosts: "From our family to yours",
    photo: "A photograph belongs here",
  },
};

/* ══════════════════════════════════════════════════════════════════════
   CELEBRATION — the shared theme for everything that isn't one of the
   three above.

   An engagement, a graduation, a retirement, a product launch, a
   reunion — anything the chat interview classifies as a celebration but
   that has no bespoke visual identity of its own yet. This is still the
   full animated engine: an opening reveal, a scratch-free tap-to-open
   card, a scrolling programme, a gallery, a closing scene — not a
   downgrade, just not (yet) drawn specifically for one occasion.

   The chrome here is deliberately tone-neutral — "You are invited"
   rather than "It's party time" — because this theme also has to carry
   a retirement, a memorial gathering or a company offsite without
   sounding like it assumes confetti. The actual words on the page (the
   message, the blessing line, the thank-you) are written by the AI for
   the specific occasion described, so the invitation itself does read as
   occasion-appropriate even where this shared shell stays neutral. */
const celebration = {
  kind: "celebration",
  className: "cc-celebration",
  label: "Celebration",

  paletteFor: plainPalette("celebration"),

  /* No curtain, no bang, no door — a soft reveal that suits a graduation
     as easily as a farewell. */
  opening: "veil",
  particles: "stardust",
  particleColors: (p) => [p.accent, p.paper, p.secondary],

  /* Unfolds rather than scratches or swings — the gentlest of the three
     mechanics, and the one with no occasion attached to it. */
  dateReveal: "unfold",

  Motif: ({ palette }) => (
    <SparklerBurst id="cel-motif" color={palette.accent} glow={palette.paper} rays={22} />
  ),

  OpeningOrnament: ({ palette }) => (
    <MoonStars id="cel-open" moon={palette.accent} star={palette.paper} glow={palette.secondary} />
  ),

  CardCrest: ({ palette }) => (
    <RangoliMedallion id="cel-crest" color={palette.secondary} accent={palette.accent} petals={16} size={104} />
  ),

  CardFrame: ({ palette }) => <ArchFrame color={palette.accent} />,

  CardCorners: ({ palette }) => (
    <>
      <span className="cc-slot cc-slot-tl"><CornerStar id="cel-tl" color={palette.accent} /></span>
      <span className="cc-slot cc-slot-tr"><CornerStar id="cel-tr" color={palette.accent} /></span>
    </>
  ),

  Rule: ({ palette }) => <StarRule color={palette.accent} />,

  DateOrnament: ({ palette }) => <CornerStar id="cel-date" color={palette.accent} />,

  scenes: [
    "opening", "card", "date", "about", "story",
    "programme", "venue", "rsvp", "gallery", "wishes", "share", "closing",
  ],

  headings: {
    date: { eyebrow: "Save the date", title: "The day, when you're ready to see it" },
    card: { eyebrow: "The invitation", title: "You are invited" },
    about: { eyebrow: "The guest of honour", title: (c) => (c.name ? `About ${c.name}` : "About the guest of honour") },
    story: { eyebrow: "How we got here", title: "A little of the story" },
    programme: { eyebrow: "The plan", title: "How the day unfolds" },
    venue: { eyebrow: "Where", title: "Find us" },
    rsvp: { eyebrow: "One small thing", title: "Let us know you're coming" },
    wishes: { eyebrow: "From everyone", title: "Messages" },
    gallery: { eyebrow: "The album", title: "A few favourite frames" },
    share: { eyebrow: "Afterwards", title: "Share the moment" },
  },

  voice: {
    kicker: "You are invited",
    openCue: "Tap to open",
    scrollCue: "See more",
    dateEyebrow: "Save the date",
    waiting: "The date is still to come",
    revealLabel: "Reveal the date",
    hintBefore: "Tap to reveal",
    hintAfter: "Add it to your calendar",
    cardWaiting: "Reveal the date above",
    countdownLabel: "Until we gather",
    shareNote: "Share your photographs with us.",
    signature: "Cinema by Welcvm",
    role: "the guest of honour",
  },

  empty: {
    name: "Our guest of honour",
    hosts: "With warm wishes",
    photo: "A photograph belongs here",
  },
};

export const THEMES = { birthday, naming, housewarming, celebration };

/* Resolve the theme for a kind, with its palette already worked out from
   the data. An unknown kind resolves to the shared "celebration" theme
   rather than birthday — a graduation dressed in candles and a "happy
   birthday" voice would be a worse failure than a slightly generic-but-
   correct one, and the AI's own written content still carries the actual
   occasion regardless of which shell it lands in. */
export function themeFor(kind, tokens) {
  const theme = THEMES[kind] || THEMES.celebration;
  return { ...theme, palette: theme.paletteFor(tokens) };
}
