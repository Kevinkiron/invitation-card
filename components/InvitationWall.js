"use client";

import Link from "next/link";

/* ══════════════════════════════════════════════════════════════════════
   The wall — invitations AND greeting cards, passing by in one endless row.

   It used to mount a live iframe per card (8 small copies of the whole
   app). On a real connection most of them were still painting their
   background colour when they scrolled past, so visitors saw a row of
   plain coloured boxes. Now every card is a picture of the real thing —
   taken from the actual demo pages (/demo/<slug>, /demo/card/<occasion>):
   the doors closed, the invitation opened, a card's cover, its message —
   so the row is always full and always looks its best. Each card still
   opens the live demo.

   SEAMLESS LOOP: `@keyframes w-marquee` slides the track by -50%, so the
   track holds the set twice. The set is 18 cards (~4,800px) — wider than
   any screen — so there is never an empty stretch before it comes round.

   To refresh a picture: open the demo at 390×547, screenshot, resize to
   496×696 and save as public/showcase/<name>.webp.
   ══════════════════════════════════════════════════════════════════════ */

const CARD_W = 248;
const CARD_H = 348;

const INV = { wedding: "Wedding", birthday: "Birthday", naming: "Naming Ceremony", housewarming: "Housewarming" };
const CARD = { christmas: "Christmas", diwali: "Diwali", eid: "Eid", "birthday-wish": "Birthday wish", onam: "Onam" };

const inv = (slug, shot) => ({ key: `inv-${slug}-${shot}`, src: `/showcase/inv-${slug}-${shot}.webp`, href: `/demo/${slug}`, label: INV[slug], kind: "Invitation" });
const card = (occ, shot) => ({ key: `card-${occ}-${shot}`, src: `/showcase/card-${occ}-${shot}.webp`, href: `/demo/card/${occ}`, label: `${CARD[occ]} card`, kind: "Greeting card" });

/* Interleaved, so an invitation is always next to a card. */
const WALL = [
  inv("wedding", "door"), card("christmas", "cover"), inv("birthday", "open"), card("diwali", "inside"),
  inv("housewarming", "door"), card("eid", "cover"), inv("naming", "open"), card("birthday-wish", "inside"),
  inv("wedding", "open"), card("onam", "cover"), inv("birthday", "door"), card("christmas", "inside"),
  inv("naming", "door"), card("diwali", "cover"), inv("housewarming", "open"), card("eid", "inside"),
  card("onam", "inside"), card("birthday-wish", "cover"),
];

function WallCard({ item, hidden }) {
  return (
    <figure className={`w-wallcard ${item.kind === "Greeting card" ? "is-card" : "is-inv"}`}>
      <Link href={item.href} className="w-wallcard-inner" tabIndex={hidden ? -1 : undefined} aria-label={`${item.label} — open the live demo`}>
        <img src={item.src} alt="" width={CARD_W} height={CARD_H} loading="eager" fetchPriority="low" decoding="async" draggable="false" />
        <span className="w-wallcard-kind">{item.kind}</span>
      </Link>
      <figcaption className="w-wallcap">{item.label}</figcaption>
    </figure>
  );
}

export default function InvitationWall() {
  return (
    <div className="w-wall" style={{ "--card-w": `${CARD_W}px`, "--card-h": `${CARD_H}px` }}>
      <div className="w-wallrow">
        <div className="w-walltrack" style={{ animationDuration: `${WALL.length * 6.5}s` }}>
          {[0, 1].map((copy) => (
            <div className="w-wallset" key={copy} aria-hidden={copy === 1 || undefined}>
              {WALL.map((item) => (
                <WallCard key={`${copy}-${item.key}`} item={item} hidden={copy === 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
