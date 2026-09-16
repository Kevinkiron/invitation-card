import Link from "next/link";
import {
  ArrowRight, Check, Church, Gem, Cake, House, Star, Mic, Code,
  MessageCircle, Sparkles, QrCode, Images, Link2, Pencil, ShieldCheck, Clock,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShowcasePhone from "@/components/ShowcasePhone";
import InvitationWall from "@/components/InvitationWall";
import DemoPhone from "@/components/DemoPhone";
import { Reveal } from "@/components/ui";
import { EVENTS, cardMotif } from "@/lib/design/showcase";
import { DEMOS } from "@/lib/demo/fixtures";
import "./landing.css";


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
  { icon: <Sparkles size={20} strokeWidth={2} />, title: "Designed, not chosen", desc: "Your invitation is drawn for your event. There is no template underneath it." },
  { icon: <Star size={20} strokeWidth={2} />,     title: "Built for Indian celebrations", desc: "Weddings, naming ceremonies, griha pravesh, birthdays, concerts." },
  { icon: <Link2 size={20} strokeWidth={2} />,    title: "One link, nothing to install", desc: "Guests tap it and it opens. No app, no sign-up, no account." },
  { icon: <Clock size={20} strokeWidth={2} />,    title: "Ready the same evening", desc: "A sentence in, a finished invitation out, while the tea is still hot." },
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
  { icon: <QrCode size={18} strokeWidth={2} />, title: "Paper and phone together", desc: "Print a QR on the card you post, and the same invitation opens in the guest's hand." },
  { icon: <ShieldCheck size={18} strokeWidth={2} />, title: "Your link, yours to keep", desc: "One address to share, and it keeps working long after the day is over." },
];

/* ── Voices ───────────────────────────────────────────────────────────
   TODO (owner): this must stay empty until you send real quotes. For each
   one we need: the person's name as they want it printed, their event
   type, the month, and their written permission to publish it. A rating
   badge needs a real review source and count. Until then the section
   renders an honest placeholder — it does NOT render invented people. */
const TESTIMONIALS = [];

/* ── Contact ──────────────────────────────────────────────────────────
   TODO (owner): supply the real support email, the WhatsApp business
   number (with country code), the phone number and its hours, and any
   office address you want published. Blank values are skipped, and if
   all of them are blank the section falls back to the create flow rather
   than printing a placeholder address that does not exist. */
const CONTACT = {
  email: "",     // e.g. "hello@welcvm.com"
  whatsapp: "",  // e.g. "+91 …" — the number guests/customers may message
  phone: "",     // e.g. "+91 …" — with the hours you actually answer
  hours: "",     // e.g. "Mon–Sat, 10am–7pm IST"
  offices: [],   // e.g. ["Kochi, Kerala"] — only addresses you really have
};

export default function Home() {
  const contactCards = [
    CONTACT.email && { icon: <MessageCircle size={18} strokeWidth={2} />, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.whatsapp && { icon: <MessageCircle size={18} strokeWidth={2} />, label: "WhatsApp", value: CONTACT.whatsapp, href: `https://wa.me/${CONTACT.whatsapp.replace(/[^\d]/g, "")}` },
    CONTACT.phone && { icon: <MessageCircle size={18} strokeWidth={2} />, label: "Phone", value: CONTACT.phone, note: CONTACT.hours, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    CONTACT.offices.length > 0 && { icon: <House size={18} strokeWidth={2} />, label: "Where we are", value: CONTACT.offices.join(" · ") },
  ].filter(Boolean);

  return (
    <div className="w-page">
      <Nav />

      <main id="main">
        {/* ── 1. HERO ──────────────────────────────────────────────── */}
        <header className="w-hero">
          <div className="wrap w-herogrid">
            <div className="w-herotext">

              {/* Hero badge. The reference puts a customer count here; we
                  put a positioning claim, because we do not have a count
                  we can honestly print. */}
              <div className="w-hero-badge">
                <Sparkles size={15} strokeWidth={2.2} />
                Designed by AI for your event — never a template
              </div>

              <h1 className="w-h1">
                Beautiful{" "}
                <span className="highlight">Invitation&nbsp;Websites</span>
                <br />
                for Every&nbsp;Event
              </h1>

              <p className="w-hero-sub">
                Tell it what you are celebrating. A design made for that one
                day appears in minutes — and you share it as a single link.
              </p>

              <div className="w-hero-cta">
                <Link href="/create" className="btn btn-primary">
                  <span>Create Invite</span>
                  <span className="btn-arrow">
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <a href="#demos" className="btn btn-ghost">See live examples</a>
              </div>

              <p className="w-cta-note">Create in minutes · Share anywhere · No app needed</p>

              <div className="w-assure">
                {ASSURE.map(([t, d]) => (
                  <div className="w-as" key={t}>
                    <b>{t}</b>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <ShowcasePhone />
          </div>
        </header>

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
                  Every one was drawn by the same designer that will draw yours —
                  from a sentence, in a few minutes.
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

        {/* ── 8. QR — paper to phone ───────────────────────────────── */}
        <section className="w-blk w-qrsec" id="qr" aria-labelledby="qr-h">
          <div className="wrap w-qrgrid">
            <Reveal>
              <figure className="w-qrfig">
                <div className="w-qrcard">
                  <p className="w-qrcard-kick">Together with their families</p>
                  <p className="w-qrcard-name">Aarav &amp; Diya</p>
                  <p className="w-qrcard-date">6 · 02 · 2027</p>
                  <span className="w-qrrule" aria-hidden="true" />
                  <span className="w-qrblock" aria-hidden="true">
                    {/* Decorative stand-in for a QR code. Deliberately not
                        a scannable code: a printed homepage graphic that
                        resolved to a real URL would be scanned by visitors
                        and land them somewhere we did not intend. */}
                    <QrCode size={64} strokeWidth={1.4} />
                  </span>
                  <p className="w-qrcard-scan">Scan for directions, RSVP &amp; photos</p>
                </div>
                <figcaption className="w-figcap">Illustration of a printed card.</figcaption>
              </figure>
            </Reveal>

            <Reveal delay={120}>
              <div>
                <p className="w-badge-row w-badge-left">
                  <span
                    className="w-sec-badge"
                    style={{ color: "#C9922F", borderColor: "rgba(201,146,47,.28)", background: "rgba(201,146,47,.07)" }}
                  >
                    <QrCode size={14} strokeWidth={2} />
                    Paper meets phone
                  </span>
                </p>
                <h2 className="w-h2 w-h2-left" id="qr-h">
                  The card still goes in the post.
                  <br />
                  <span className="highlight">The evening lives on the phone.</span>
                </h2>
                <p className="w-lede w-lede-left">
                  Print the code on the invitation you hand over in person. The
                  same design opens in their hand — with the route to the venue,
                  the RSVP and, afterwards, everyone&rsquo;s photographs.
                </p>
                <div className="w-checks">
                  {[
                    ["Put it on anything printed", "Card, envelope, board at the gate, the back of a sweet box."],
                    ["Nothing to type", "No long address to read out to an uncle over the phone."],
                    ["It stays current", "Change the invitation and the printed code still points at the right thing."],
                  ].map(([t, d]) => (
                    <div className="w-check" key={t}>
                      <span className="w-check-ic" aria-hidden="true"><Check size={12} strokeWidth={3} /></span>
                      <span><b>{t}</b><span>{d}</span></span>
                    </div>
                  ))}
                </div>
              </div>
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
                Tell it what you are celebrating. A beautiful invitation appears in minutes.
              </p>
              <p className="w-final-cta">
                <Link href="/create" className="btn btn-primary btn-lg">
                  Create your invitation
                  <span className="btn-arrow"><ArrowRight size={18} /></span>
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
