import Link from "next/link";
import {
  ArrowRight, Check, Church, Gem, Cake, House, Star, Mic, Code,
  MessageCircle, Sparkles, QrCode, Images, Link2, Pencil, ShieldCheck, Clock,
  MapPin, Music, Mail,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/company";
import HeroPhone from "@/components/HeroPhone";
import InvitationWall from "@/components/InvitationWall";
import DemoPhone from "@/components/DemoPhone";
import { Reveal } from "@/components/ui";
import RotatingWord from "@/components/landing/RotatingWord";
import LandingFX from "@/components/landing/LandingFX";
import { EVENTS, cardMotif } from "@/lib/design/showcase";
import { DEMOS } from "@/lib/demo/fixtures";
import { OCCASIONS } from "@/lib/greetings/occasions";
import { photo, photoAlt } from "@/lib/greetings/photos";
import "./landing.css";
import "./landing-premium.css";


/* ══════════════════════════════════════════════════════════════════════
   The landing page — BigDates.ai-shaped structure, Welcvm content.

   Structure borrowed: light full-width header, hero, occasion grid,
   reassurance strip, gallery, four numbered steps, a messaging demo, a
   QR bridge, voices, feature cards, contact, dark footer.

   Content NOT borrowed: they sell a template library, we sell a design
   made for one event. Every heading below has to still be true if the
   visitor reads it as "nothing here was picked off a shelf".

   HONESTY RULE for anyone editing this file: no invented numbers. No
   counts of weddings, no review scores, no testimonials, no office
   addresses. Where the reference site has social proof we either make a
   claim about what the product does, or we render a placeholder from an
   empty constant and leave a TODO for the owner. A fabricated review on
   a paying client's homepage is a real problem, not a rounding error.
   ══════════════════════════════════════════════════════════════════════ */

const ICONS = { church: Church, ring: Gem, cake: Cake, home: House, star: Star, mic: Mic, code: Code };

/* Per-event accent system — mirrors BigDates category colour variables.
   Keyed by EVENTS slug, not by index: the old index lookup walked a
   separate object and handed Engagement the birthday purple whenever
   anyone reordered either list. ACCENT_FALLBACK covers a slug added to
   EVENTS before it gets an entry here. */
const EVENT_ACCENTS = {
  wedding:     { accent: "#B8405E", bg: "#FFF0F4", catBg: "rgba(184,64,94,.10)",  catBorder: "rgba(184,64,94,.22)" },
  engagement:  { accent: "#C4788A", bg: "#FFF7F8", catBg: "rgba(196,120,138,.10)",catBorder: "rgba(196,120,138,.22)" },
  birthday:    { accent: "#9B59B6", bg: "#F5EDFF", catBg: "rgba(155,89,182,.10)", catBorder: "rgba(155,89,182,.22)" },
  housewarming:{ accent: "#6B8E6B", bg: "#F0F7F0", catBg: "rgba(107,142,107,.10)",catBorder: "rgba(107,142,107,.22)" },
  naming:      { accent: "#E8A87C", bg: "#FFF8F2", catBg: "rgba(232,168,124,.10)",catBorder: "rgba(232,168,124,.22)" },
  baptism:     { accent: "#5D9BCC", bg: "#F0F7FC", catBg: "rgba(93,155,204,.10)", catBorder: "rgba(93,155,204,.22)" },
  concert:     { accent: "#E8A030", bg: "#FFFBF0", catBg: "rgba(232,160,48,.10)", catBorder: "rgba(232,160,48,.22)" },
  conference:  { accent: "#4C8C7B", bg: "#EFF7F4", catBg: "rgba(76,140,123,.10)", catBorder: "rgba(76,140,123,.22)" },
  babyshower:  { accent: "#E87A90", bg: "#FFF5F8", catBg: "rgba(232,122,144,.10)",catBorder: "rgba(232,122,144,.22)" },
};
const ACCENT_FALLBACK = { accent: "#C9922F", bg: "#FDF6EA", catBg: "rgba(201,146,47,.10)", catBorder: "rgba(201,146,47,.22)" };

/* ── Reassurance strip ────────────────────────────────────────────────
   The reference site puts counters here ("12K+ Weddings"). We have no
   such numbers, so this strip states what the product does instead.
   Every line is checkable by a visitor within one minute of using it.
   TODO (owner): if you want real counters here — invitations created,
   guests reached — send the figures and the date they were measured,
   and swap this array for them. Do not estimate. */
const TRUTHS = [
  { icon: <Sparkles size={20} strokeWidth={2} />, title: "Designed, not chosen", desc: "Every invitation and card is drawn for its moment. There is no template underneath it." },
  { icon: <Star size={20} strokeWidth={2} />,     title: "Invitations and greetings", desc: "Weddings, griha pravesh and birthdays — and wishes for Diwali, Eid, Onam and Christmas." },
  { icon: <Link2 size={20} strokeWidth={2} />,    title: "One link, nothing to install", desc: "Guests tap it and it opens. No app, no sign-up, no account." },
  { icon: <Clock size={20} strokeWidth={2} />,    title: "Ready the same evening", desc: "A sentence in, a finished invitation or card out, while the tea is still hot." },
];

/* What rolls through each of the two hero cards (RotatingWord). */
const INVITE_WORDS = ["your wedding.", "a griha pravesh.", "her first birthday.", "the naming day.", "our engagement."];
const WISH_WORDS = ["a happy Diwali.", "a merry Christmas.", "Eid Mubarak.", "a happy birthday.", "a happy Onam."];


/* The slow ribbon of occasions under the hero. */
const RIBBON = [
  "Weddings", "Diwali Wishes", "Engagements", "Christmas Cards", "Griha Pravesh",
  "Eid Greetings", "Naming Ceremonies", "Birthday Wishes", "Baby Showers",
  "Onam Greetings", "Anniversaries", "Thank-you Cards", "Concerts", "New Year Wishes",
];

const ASSURE = [
  ["Minutes", "not an evening of fiddling"],
  ["No app", "guests just open the link"],
  ["Yours to edit", "change it after sending"],
];

const STEPS = [
  { title: "Start the chat", body: "Say what you are celebrating, the way you would tell a friend.", key: false },
  { title: "Share the details", body: "Names, date, venue, the order of the day. Drop your photos into the chat.", key: false },
  { title: "It designs itself", body: 'A look made for your event — not picked from a shelf. Say "warmer" or "bigger names" and it changes.', key: true },
  { title: "Share & celebrate", body: "One link on WhatsApp. Guests open it, RSVP, and add their own photos.", key: false },
];

const SHARING = [
  ["One tap to open", "No app, no sign-up, nothing for your guests to install."],
  ["Change it any time", "Venue moved? Edit it and everyone already has the new version."],
  ["Guests add their photos", "A QR code at the venue puts every picture into your shared album."],
];

/* Six feature cards — the reference's "why choose us" block. Same rule
   as the strip above: claims about behaviour, never about popularity. */
const WHY = [
  { icon: <Sparkles size={18} strokeWidth={2} />, title: "Made for this one event", desc: "The palette, the type and the ornament are chosen for your celebration, not inherited from a template someone else also bought." },
  { icon: <MessageCircle size={18} strokeWidth={2} />, title: "You describe, it draws", desc: "No editor to learn. Say what you want changed in plain words and watch it change." },
  { icon: <Images size={18} strokeWidth={2} />, title: "Your photos, in place", desc: "They land in the portrait and the gallery, sized and framed — not buried in a folder." },
  { icon: <Pencil size={18} strokeWidth={2} />, title: "Editable after sending", desc: "Times move and venues change. Edit the invitation and everyone already has the new one." },
  { icon: <Mail size={18} strokeWidth={2} />, title: "Greeting cards too", desc: "Diwali, Eid, Onam, Christmas, a birthday — a card that opens from its envelope, sent as one link." },
  { icon: <ShieldCheck size={18} strokeWidth={2} />, title: "Your link, yours to keep", desc: "One address to share, and it keeps working long after the day is over." },
];

/* ── Voices ───────────────────────────────────────────────────────────
   TODO (owner): this must stay empty until you send real quotes. For each
   one we need: the person's name as they want it printed, their event
   type, the month, and their written permission to publish it. A rating
   badge needs a real review source and count. Until then the section
   renders an honest placeholder — it does NOT render invented people. */
/* The greeting-card occasions shown on the homepage (the full list is on
   /greetings). Each tile opens the card maker on that occasion. */
const GREETING_PICKS = ["diwali", "christmas", "eid", "onam", "birthday-wish", "anniversary-wish", "thank-you", "new-year"];
const GREETINGS = GREETING_PICKS.map((slug) => OCCASIONS.find((o) => o.slug === slug)).filter(Boolean);

const TESTIMONIALS = [];

/* ── Contact ──────────────────────────────────────────────────────────
   TODO (owner): supply the real support email, the WhatsApp business
   number (with country code), the phone number and its hours, and any
   office address you want published. Blank values are skipped, and if
   all of them are blank the section falls back to the create flow rather
   than printing a placeholder address that does not exist. */
const CONTACT = {
  email: COMPANY.email,
  whatsapp: "",  // e.g. "+91 …" — the number guests/customers may message
  phone: "",     // e.g. "+91 …" — with the hours you actually answer
  hours: "",     // e.g. "Mon–Sat, 10am–7pm IST"
  offices: [`${COMPANY.legalName}, ${COMPANY.address}`],
};

export default function Home() {
  const contactCards = [
    CONTACT.email && { icon: <Mail size={18} strokeWidth={2} />, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.whatsapp && { icon: <MessageCircle size={18} strokeWidth={2} />, label: "WhatsApp", value: CONTACT.whatsapp, href: `https://wa.me/${CONTACT.whatsapp.replace(/[^\d]/g, "")}` },
    CONTACT.phone && { icon: <MessageCircle size={18} strokeWidth={2} />, label: "Phone", value: CONTACT.phone, note: CONTACT.hours, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    CONTACT.offices.length > 0 && { icon: <House size={18} strokeWidth={2} />, label: "Company", value: CONTACT.offices.join(" · ") },
  ].filter(Boolean);

  return (
    <div className="w-page">
      <LandingFX />
      <Nav />

      <main id="main">
        {/* ── 1. HERO ──────────────────────────────────────────────── */}
        <header className="w-hero">
          <div className="wrap w-herogrid">
            <div className="w-herotext">

              <p className="w-hero-eyebrow w-hero-tagline">
                {/* A staircase: "Greetings…" always on its own line, starting
                    right under "bring" — a two-column grid, so the step
                    lines up exactly at every size. */}
                <span className="w-tag-stairs">
                  <span className="w-tag-a"><b className="w-tag-inv">Invitations</b> that</span>
                  <span className="w-tag-b">bring them together,</span>
                  <span className="w-tag-c"><b className="w-tag-card">Greetings</b> that make their day.</span>
                </span>
              </p>

              {/* The hero used to be one big headline. It is now the two
                  products side by side — an invitation and a greeting
                  card — each a door you can walk through, so a visitor
                  sees in one glance that this does both. */}
              <h1 className="w-duohead">
                Invite them<span className="w-duohead-dot">.</span>{" "}
                <em>Wish them<span className="w-duohead-dot">.</span></em>
              </h1>
              <p className="w-hero-sub w-duosub">
                Tell it in a sentence. A design made for that one moment appears
                in minutes — and you share it as a single link.
              </p>

              <div className="w-dual">
                <Link href="/create" className="w-dcard w-dcard-inv" data-magnetic>
                  <span className="w-dcard-art" aria-hidden="true">
                    <svg viewBox="0 0 64 64"><path d="M14 58V26a18 18 0 0 1 36 0v32" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M32 8v50" stroke="currentColor" strokeWidth="1.6" opacity=".6" /><path d="M20 58V28a12 12 0 0 1 24 0v30" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" /><circle cx="32" cy="38" r="4.5" fill="currentColor" /></svg>
                  </span>
                  <span className="w-dcard-tag">Invitations</span>
                  <span className="w-dcard-line">
                    Invite everyone to{" "}
                    <RotatingWord words={INVITE_WORDS} interval={2600} />
                  </span>
                  <span className="w-dcard-meta">Opens on doors · RSVP · Directions · Music</span>
                  <span className="w-dcard-go">Create an invite <ArrowRight size={15} /></span>
                </Link>

                <span className="w-dual-amp" aria-hidden="true">&amp;</span>

                <Link href="/greetings" className="w-dcard w-dcard-card" data-magnetic>
                  <span className="w-dcard-art" aria-hidden="true">
                    <svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="34" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M8 18l24 18 24-18" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M32 30.5c-2.6-3.4-8-2-8 2.2 0 4 6 7.3 8 8.6 2-1.3 8-4.6 8-8.6 0-4.2-5.4-5.6-8-2.2z" fill="currentColor" /></svg>
                  </span>
                  <span className="w-dcard-tag">Greeting cards</span>
                  <span className="w-dcard-line">
                    Wish someone{" "}
                    <RotatingWord words={WISH_WORDS} interval={2600} />
                  </span>
                  <span className="w-dcard-meta">Opens from an envelope · Your words · Your photo</span>
                  <span className="w-dcard-go">Send a card <ArrowRight size={15} /></span>
                </Link>
              </div>

              <p className="w-cta-note">
                Ready in minutes · No app needed ·{" "}
                <a href="#demos">See live examples</a>
              </p>

              <div className="w-assure">
                {ASSURE.map(([t, d]) => (
                  <div className="w-as" key={t}>
                    <b>{t}</b>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The phone, two gold orbits behind it, and four chips naming
                what a guest can do on the invitation. The chips describe
                features, not invented guests or numbers. Each [data-depth]
                layer drifts with the cursor (LandingFX). */}
            <div className="w-herovis">
              <span className="w-orbit w-orbit-1" data-depth="0.25" aria-hidden="true"><i /></span>
              <span className="w-orbit w-orbit-2" data-depth="0.45" aria-hidden="true"><i /></span>
              {/* Two live phones: the wedding invitation and the Christmas
                  card, each on repeat (components/HeroPhone). */}
              <div className="w-duo" data-depth="0.6">
                <HeroPhone kind="wedding" tag="Invitations" className="w-duo-a" />
                <HeroPhone kind="christmas" tag="Greeting cards" className="w-duo-b" />
              </div>
              <span className="w-chip w-chip-1" data-depth="1.2" aria-hidden="true">
                <span><i><Check size={15} strokeWidth={2.6} /></i><span><b>RSVP in one tap</b><small>Guests reply right on it</small></span></span>
              </span>
              <span className="w-chip w-chip-2" data-depth="1.6" aria-hidden="true">
                <span><i><MapPin size={15} /></i><span><b>Directions</b><small>Opens straight in Maps</small></span></span>
              </span>
              <span className="w-chip w-chip-3" data-depth="1.0" aria-hidden="true">
                <span><i><Mail size={15} /></i><span><b>Cards that open</b><small>An envelope, then your words</small></span></span>
              </span>
              <span className="w-chip w-chip-4" data-depth="1.4" aria-hidden="true">
                <span><i><Music size={15} /></i><span><b>Music on open</b><small>Your song, your choice</small></span></span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Occasion ribbon ── */}
        <div className="w-marquee" aria-hidden="true">
          <div className="w-marquee-track">
            {[...RIBBON, ...RIBBON].map((r, i) => <span key={i}>{r}</span>)}
          </div>
        </div>

        {/* ── 2. ALL OCCASIONS ─────────────────────────────────────── */}
        <section className="w-blk" id="events" aria-labelledby="events-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#E8945C", borderColor: "rgba(232,148,92,.25)", background: "rgba(232,148,92,.06)" }}
                  >
                    <Star size={14} strokeWidth={2} />
                    All occasions
                  </span>
                </p>
                <h2 className="w-h2" id="events-h">
                  Big Moments{" "}
                  <span className="highlight">Deserve Welcvm</span>
                </h2>
                <p className="w-lede">
                  Pick what you are celebrating. The design starts from there —
                  a wedding and a housewarming do not come out looking like cousins.
                </p>
              </div>
            </Reveal>

            <ul className="w-egrid">
              {EVENTS.map((e) => {
                const Icon = ICONS[e.icon] || Star;
                const colors = EVENT_ACCENTS[e.slug] || ACCENT_FALLBACK;

                return (
                  <li key={e.slug}>
                    <Link
                      href={`/create?event=${e.slug}`}
                      className="w-ecard"
                      style={{
                        "--accent": colors.accent,
                        "--bg": colors.bg,
                        "--category-bg": colors.catBg,
                        "--category-border": colors.catBorder,
                      }}
                    >
                      {/* Top media area */}
                      <div className="w-eart" style={{ background: colors.bg }}>
                        {e.image && <div className="w-ethumb" style={{ backgroundImage: `url("${e.image}")` }} />}
                        <div className="w-emotif" style={{ backgroundImage: `url("${cardMotif(e.motif, colors.accent)}")` }} />
                        <div className="w-eveil" />
                        <div className="w-echip">
                          <Icon size={18} />
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="w-ebody">
                        <div className="w-ebody-text">
                          <h3>{e.name}</h3>
                          <p>{e.tag}</p>
                        </div>
                        <div className="w-ego">
                          <span>Get Started</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── 2b. GREETING CARDS ────────────────────────────────────
            The second product, which used to be reachable only from the
            Invitations | Greetings toggle in the header. One message for
            one person: an envelope that opens into a little card. */}
        <section className="w-blk w-gsec" id="greetings" aria-labelledby="greetings-h">
          <div className="wrap w-ggrid">
            <Reveal>
              <div className="w-gtext">
                <p className="w-badge-row w-badge-left">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#C0506A", borderColor: "rgba(192,80,106,.25)", background: "rgba(192,80,106,.06)" }}
                  >
                    <Mail size={14} strokeWidth={2} />
                    Greeting cards
                  </span>
                </p>
                <h2 className="w-h2" id="greetings-h">
                  Not hosting?{" "}
                  <span className="highlight">Send a card</span>
                </h2>
                <p className="w-lede w-lede-left">
                  A festival, a birthday, a thank-you — say it to one person,
                  properly. They open an envelope and the card unfolds like a
                  little book, with your words inside.
                </p>
                <ul className="w-glist">
                  <li><Check size={15} strokeWidth={2.6} /> An envelope that opens into a folded card</li>
                  <li><Check size={15} strokeWidth={2.6} /> Your own message, verse, photo and music</li>
                  <li><Check size={15} strokeWidth={2.6} /> Sent as one link — WhatsApp, anywhere</li>
                </ul>
                <div className="w-gcta">
                  <Link href="/greetings" className="btn btn-primary">
                    <span>Send a Greeting Card</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </Link>
                  <span className="w-gprice">₹100 a card</span>
                </div>
              </div>
            </Reveal>

            <ul className="w-gtiles" aria-label="Greeting card occasions">
              {GREETINGS.map((o) => (
                <li key={o.slug}>
                  <Link href={`/greetings/create?occasion=${o.slug}`} className="w-gtile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo(o.photo)} alt={photoAlt(o.photo)} loading="lazy" />
                    <span className="w-gtile-veil" aria-hidden="true" />
                    <span className="w-gtile-name">{o.name}</span>
                    <span className="w-gtile-go" aria-hidden="true"><ArrowRight size={14} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 3. REASSURANCE STRIP ─────────────────────────────────── */}
        <section className="w-truths" aria-label="What Welcvm does">
          <div className="wrap" style={{ padding: 0 }}>
            <div className="w-truthgrid">
              {TRUTHS.map(({ icon, title, desc }) => (
                <div className="w-truth" key={title}>
                  <div className="w-truth-orn" aria-hidden="true">{icon}</div>
                  <div className="w-truth-t">{title}</div>
                  <div className="w-truth-d">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. LIVE DEMOS ────────────────────────────────────────────
            The reference shows static screenshots. Ours are the real
            invitations, running. Each card is a live demo scrolling
            itself; the whole card is the link, via the stretched ::after
            on .w-demo-link — a plain <Link> wrapper around a scrolling
            demo swallowed the demo's own scroll and dragged the page. */}
        <section className="w-blk w-demosec" id="demos" aria-labelledby="demos-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#B8405E", borderColor: "rgba(184,64,94,.25)", background: "rgba(184,64,94,.06)" }}
                  >
                    <Sparkles size={14} strokeWidth={2} />
                    Live demos
                  </span>
                </p>
                <h2 className="w-h2" id="demos-h">
                  Open one and{" "}
                  <span className="highlight">walk through it</span>
                </h2>
                <p className="w-lede">
                  Real invitations, running right here — with stand-in names and
                  photographs. Yours will not look like any of them.
                </p>
              </div>
            </Reveal>

            <ul className="w-demorow">
              {DEMOS.map((d, i) => (
                <li className="w-demo" key={d.slug} style={{ "--accent": d.accent }}>
                  <Reveal delay={i * 80}>
                    <article className="w-democard">
                      <div className="w-demostage">
                        <DemoPhone demo={d} height={560} />
                      </div>
                      <div className="w-demometa">
                        <p className="w-demokind">{d.label}</p>
                        <h3 className="w-demonames">
                          <Link href={d.href} className="w-demo-link">{d.names}</Link>
                        </h3>
                        <p className="w-demoblurb">{d.blurb}</p>
                        <p className="w-demogo" aria-hidden="true">
                          Open the full invitation <ArrowRight size={13} />
                        </p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>

            <p className="w-demo-cta">
              <Link href="/create" className="btn btn-primary">
                Create yours
                <span className="btn-arrow"><ArrowRight size={16} /></span>
              </Link>
            </p>
          </div>
        </section>

        {/* ── 5. INVITATION WALL ───────────────────────────────────── */}
        <section className="w-blk w-wallsec" id="wall" aria-labelledby="wall-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#9B59B6", borderColor: "rgba(155,89,182,.25)", background: "rgba(155,89,182,.06)" }}
                  >
                    <Images size={14} strokeWidth={2} />
                    Made, not chosen
                  </span>
                </p>
                <h2 className="w-h2" id="wall-h">
                  None of these{" "}
                  <span className="highlight">existed yesterday</span>
                </h2>
                <p className="w-lede">
                  Invitations and greeting cards, every one drawn by the same
                  designer that will draw yours — from a sentence, in a few minutes.
                </p>
              </div>
            </Reveal>
          </div>
          <InvitationWall />
        </section>

        {/* ── 6. FOUR STEPS ────────────────────────────────────────── */}
        <section className="w-blk w-steps" id="how" aria-labelledby="how-h">
          <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#5D9BCC", borderColor: "rgba(93,155,204,.25)", background: "rgba(93,155,204,.06)" }}
                  >
                    <Clock size={14} strokeWidth={2} />
                    Four steps
                  </span>
                </p>
                <h2 className="w-h2" id="how-h">
                  From a sentence to a{" "}
                  <span className="highlight">shareable link</span>
                </h2>
                <p className="w-lede">No stress. No learning. Nothing to design.</p>
              </div>
            </Reveal>

            <ol className="w-stepgrid">
              {STEPS.map(({ title, body, key }, i) => (
                <li key={title}>
                  <Reveal delay={i * 90} className={key ? "w-step key" : "w-step"}>
                    <div className="w-step-n" aria-hidden="true">{i + 1}</div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 7. MESSAGING SHOWCASE ────────────────────────────────── */}
        <section className="w-blk" id="share" aria-labelledby="share-h">
          <div className="wrap w-sharegrid">
            <Reveal>
              <div>
                <p className="w-badge-row w-badge-left">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#4C8C7B", borderColor: "rgba(76,140,123,.25)", background: "rgba(76,140,123,.06)" }}
                  >
                    <MessageCircle size={14} strokeWidth={2} />
                    Easy sharing
                  </span>
                </p>
                <h2 className="w-h2 w-h2-left" id="share-h">
                  Send one link.
                  <br />
                  <span className="highlight">That is the whole thing.</span>
                </h2>
                <div className="w-checks">
                  {SHARING.map(([t, d]) => (
                    <div className="w-check" key={t}>
                      <span className="w-check-ic" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
                      <span><b>{t}</b><span>{d}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              {/* An illustration of a chat, not a screenshot of one. The
                  names are stand-ins and the section heading says so. */}
              <figure className="w-chatfig">
                <div className="w-chatcard">
                  <div className="w-chat-head">
                    <span className="w-chat-av" aria-hidden="true">F</span>
                    <span>
                      <b>Family group</b>
                      <em>18 members</em>
                    </span>
                  </div>
                  <div className="w-msg them">The invite is ready!</div>
                  <div className="w-msg me">
                    welcvm.com/i/aarav-diya
                    <div className="w-linkprev">
                      <div className="w-linkprev-top">Aarav &amp; Diya</div>
                      <div className="w-linkprev-meta">
                        <b>Aarav &amp; Diya — 6 February 2027</b>
                        <span>St Andrew&rsquo;s Church, Kochi</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-msg them">Oh this is gorgeous, see you there 🎉</div>
                </div>
                <figcaption className="w-figcap">
                  Illustration — the names and the thread are stand-ins.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ── 9. VOICES (placeholder until real quotes exist) ──────── */}
        <section className="w-blk w-voices" id="voices" aria-labelledby="voices-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#B8405E", borderColor: "rgba(184,64,94,.25)", background: "rgba(184,64,94,.06)" }}
                  >
                    <MessageCircle size={14} strokeWidth={2} />
                    In their words
                  </span>
                </p>
                <h2 className="w-h2" id="voices-h">
                  What hosts say{" "}
                  <span className="highlight">goes here</span>
                </h2>
              </div>
            </Reveal>

            {TESTIMONIALS.length > 0 ? (
              <ul className="w-quotegrid">
                {TESTIMONIALS.map((t) => (
                  <li key={t.name}>
                    <figure className="w-quote">
                      <blockquote><p>{t.quote}</p></blockquote>
                      <figcaption>
                        <b>{t.name}</b>
                        <span>{t.event}</span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : (
              /* Rendered deliberately, and deliberately plain. It is better
                 for a visitor to see that we have not collected quotes yet
                 than to read six that we made up. */
              <div className="w-quote-empty">
                <p>
                  We would rather show you a working invitation than a quote we
                  wrote ourselves. Open one of the live demos above — that is the
                  product, not a picture of it.
                </p>
                <Link href="#demos" className="btn btn-ghost">See the live demos</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── 10. WHY WELCVM ───────────────────────────────────────── */}
        <section className="w-blk w-whysec" id="why" aria-labelledby="why-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <p className="w-badge-row">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#6B8E6B", borderColor: "rgba(107,142,107,.25)", background: "rgba(107,142,107,.06)" }}
                  >
                    <ShieldCheck size={14} strokeWidth={2} />
                    Why Welcvm
                  </span>
                </p>
                <h2 className="w-h2" id="why-h">
                  A designer for one event —{" "}
                  <span className="highlight">yours</span>
                </h2>
                <p className="w-lede">
                  Template sites hand you someone else&rsquo;s layout and ask you
                  to type your names into it. This is the other way round.
                </p>
              </div>
            </Reveal>

            <ul className="w-whygrid">
              {WHY.map(({ icon, title, desc }, i) => (
                <li key={title}>
                  <Reveal delay={i * 60} className="w-why">
                    <span className="w-why-ic" aria-hidden="true">{icon}</span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 11. CONTACT ──────────────────────────────────────────── */}
        <section className="w-blk w-contactsec" id="contact" aria-labelledby="contact-h">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <h2 className="w-h2" id="contact-h">
                  Talk to a{" "}
                  <span className="highlight">human</span>
                </h2>
                <p className="w-lede">
                  Stuck, or want something the chat will not do? Say so and we
                  will sort it out with you.
                </p>
              </div>
            </Reveal>

            {contactCards.length > 0 ? (
              <ul className="w-contactgrid">
                {contactCards.map((c) => (
                  <li key={c.label}>
                    <div className="w-contact">
                      <span className="w-contact-ic" aria-hidden="true">{c.icon}</span>
                      <p className="w-contact-l">{c.label}</p>
                      {c.href
                        ? <a className="w-contact-v" href={c.href}>{c.value}</a>
                        : <p className="w-contact-v">{c.value}</p>}
                      {c.note && <p className="w-contact-n">{c.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              /* No contact details are published because none have been
                 supplied. See the TODO on CONTACT above — fill that object
                 in and this grid replaces the fallback automatically. */
              <p className="w-contact-empty">
                <Link href="/create" className="btn btn-primary">
                  Start in the chat
                  <span className="btn-arrow"><ArrowRight size={16} /></span>
                </Link>
                <span>Contact details are being set up — the chat reaches us today.</span>
              </p>
            )}
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────── */}
        <section className="w-blk w-final" aria-labelledby="final-h">
          <div className="w-wrap">
            <Reveal>
              <div className="w-seal" style={{ marginBottom: 32 }} aria-hidden="true">
                <i /><b>✦</b><i />
              </div>
              <h2 className="w-h2" id="final-h">
                Start with <span className="highlight">one sentence.</span>
              </h2>
              <p className="w-lede">
                Tell it what you are celebrating, or who you are wishing. A beautiful
                invitation or greeting card appears in minutes.
              </p>
              <p className="w-final-cta">
                <Link href="/create" className="btn btn-primary btn-lg">
                  Create your invitation
                  <span className="btn-arrow"><ArrowRight size={18} /></span>
                </Link>
                <Link href="/greetings" className="btn btn-ghost btn-lg">
                  <Mail size={17} />
                  Send a greeting card
                </Link>
              </p>
              <p className="w-fine">It takes one sentence to begin</p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
