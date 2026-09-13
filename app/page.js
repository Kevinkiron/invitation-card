import Link from "next/link";
import { ArrowRight, Check, Church, Gem, Cake, House, Star, Mic, Code, Sparkles } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShowcasePhone from "@/components/ShowcasePhone";
import InvitationWall from "@/components/InvitationWall";
import { Reveal } from "@/components/ui";
import { EVENTS, cardMotif, readableOn } from "@/lib/design/showcase";
import "./landing.css";

/* ══════════════════════════════════════════════════════════════════════
   The landing page — BigDates.ai-inspired UI, Welcvm branding.

   Design language: clean white, per-event accent colour cards,
   DM Sans heavy typography, badge pills, animated CTAs.
   ══════════════════════════════════════════════════════════════════════ */

const ICONS = { church: Church, ring: Gem, cake: Cake, home: House, star: Star, mic: Mic, code: Code };

/* Per-event accent system — mirrors BigDates category colour variables */
const EVENT_ACCENTS = {
  wedding:    { accent: "#B8405E", bg: "#FFF0F4", catBg: "rgba(184,64,94,.10)",  catBorder: "rgba(184,64,94,.22)" },
  birthday:   { accent: "#9B59B6", bg: "#F5EDFF", catBg: "rgba(155,89,182,.10)", catBorder: "rgba(155,89,182,.22)" },
  baptism:    { accent: "#5D9BCC", bg: "#F0F7FC", catBg: "rgba(93,155,204,.10)", catBorder: "rgba(93,155,204,.22)" },
  naming:     { accent: "#E8A87C", bg: "#FFF8F2", catBg: "rgba(232,168,124,.10)",catBorder: "rgba(232,168,124,.22)" },
  babyshower: { accent: "#E87A90", bg: "#FFF5F8", catBg: "rgba(232,122,144,.10)",catBorder: "rgba(232,122,144,.22)" },
  housewarming:{ accent: "#6B8E6B", bg: "#F0F7F0", catBg: "rgba(107,142,107,.10)",catBorder:"rgba(107,142,107,.22)" },
  concert:    { accent: "#E8A030", bg: "#FFFBF0", catBg: "rgba(232,160,48,.10)", catBorder: "rgba(232,160,48,.22)" },
};

const TRUTHS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
    ),
    title: "Designed for you",
    desc: "Every invitation made for your event alone — not picked from a shelf.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: "Any occasion",
    desc: "Weddings, naming ceremonies, birthdays, concerts and more.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: "Your link, forever",
    desc: "One address to share, and it keeps working long after the day.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    title: "Your photos, in place",
    desc: "They land in the portrait and gallery, not buried in a folder.",
  },
];

const ASSURE = [
  ["Minutes", "not an evening of fiddling"],
  ["No app", "guests just open the link"],
  ["Yours to edit", "change it after sending"],
];

const STEPS = [
  { title: "Just talk", body: "Say what you are celebrating, the way you would tell a friend.", key: false },
  { title: "It designs itself", body: "A look made for your event — not picked from a shelf. Say "warmer" or "bigger names" and it changes.", key: true },
  { title: "Add your photos", body: "Drop them into the chat. They appear in the invitation where they belong.", key: false },
  { title: "Share the link", body: "One address on WhatsApp. Guests open it, RSVP, and add their own photos.", key: false },
];

const SHARING = [
  ["One tap to open", "No app, no sign-up, nothing for your guests to install."],
  ["Change it any time", "Venue moved? Edit it and everyone already has the new version."],
  ["Guests add their photos", "A QR code at the venue puts every picture into your shared album."],
];

export default function Home() {
  return (
    <div className="w-page">
      <Nav />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <header className="w-hero">
          <div className="wrap w-herogrid">
            <div className="w-herotext">

              {/* BigDates-style hero badge: star icon + social proof */}
              <div className="w-hero-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                Loved by 10,000+ families across India
              </div>

              {/* H1 — DM Sans 800, highlight span with gradient */}
              <h1 className="w-h1">
                Beautiful{" "}
                <span className="highlight">Invitation&nbsp;Websites</span>
                <br />
                for Every&nbsp;Event
              </h1>

              <p className="w-hero-sub">
                Celebrate life's special moments with a website your guests
                will love — designed by AI in minutes, shared in one link.
              </p>

              <div className="w-hero-cta">
                <Link href="/create" className="btn btn-primary">
                  <span>Create Invite</span>
                  <span className="btn-arrow">
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <a href="#how" className="btn btn-ghost">See how it works</a>
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

        {/* ── SOCIAL PROOF / TRUTH STRIP ───────────────────────────── */}
        <section className="w-truths">
          <div className="wrap" style={{ padding: 0 }}>
            <div className="w-truthgrid">
              {TRUTHS.map(({ icon, title, desc }) => (
                <div className="w-truth" key={title}>
                  <div className="w-truth-orn">{icon}</div>
                  <div className="w-truth-t">{title}</div>
                  <div className="w-truth-d">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EVENT CATEGORIES ─────────────────────────────────────── */}
        <section className="w-blk" id="events">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                {/* BigDates-style section badge with icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <span
                    className="w-sec-badge"
                    style={{ color: "#E8945C", borderColor: "rgba(232,148,92,.25)", background: "rgba(232,148,92,.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    All occasions
                  </span>
                </div>
                <h2 className="w-h2">
                  Big Moments{" "}
                  <span className="highlight">Deserve Welcvm</span>
                </h2>
                <p className="w-lede">
                  Create a beautiful invitation website in minutes. Pick your occasion below to begin.
                </p>
              </div>
            </Reveal>

            <div className="w-egrid">
              {EVENTS.map((e, i) => {
                const [bg, accent, deep] = e.palette;
                const Icon = ICONS[e.icon] || Star;
                const colors = Object.values(EVENT_ACCENTS)[i % Object.keys(EVENT_ACCENTS).length];
                return (
                  <Link
                    key={e.slug}
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
                      {/* Icon chip */}
                      <div className="w-echip">
                        <Icon size={18} />
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="w-ebody">
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <h3>{e.name}</h3>
                        <p>{e.tag}</p>
                      </div>
                      <div className="w-ego">
                        <span>Get Started</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── INVITATION WALL ──────────────────────────────────────── */}
        <section className="w-blk w-wallsec" id="wall">
          <div className="wrap">
            <Reveal>
              <div className="w-section-top">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <span
                    className="w-sec-badge"
                    style={{ color: "#9B59B6", borderColor: "rgba(155,89,182,.25)", background: "rgba(155,89,182,.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Made, not chosen
                  </span>
                </div>
                <h2 className="w-h2">
                  None of these{" "}
                  <span className="highlight">existed yesterday</span>
                </h2>
                <p className="w-lede">
                  Every one was drawn by the same designer that will draw yours — from a sentence, in a few minutes.
                </p>
              </div>
            </Reveal>
          </div>
          <InvitationWall />
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="w-blk w-steps" id="how">
          <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
            <Reveal>
              <div className="w-section-top">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <span
                    className="w-sec-badge"
                    style={{ color: "#5D9BCC", borderColor: "rgba(93,155,204,.25)", background: "rgba(93,155,204,.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Four steps
                  </span>
                </div>
                <h2 className="w-h2">
                  From a sentence to a{" "}
                  <span className="highlight">shareable link</span>
                </h2>
                <p className="w-lede">No stress. No learning. Nothing to design.</p>
              </div>
            </Reveal>

            <div className="w-stepgrid">
              {STEPS.map(({ title, body, key }, i) => (
                <Reveal key={title} delay={i * 90} className={key ? "w-step key" : "w-step"}>
                  <div className="w-step-n">{i + 1}</div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── SHARING ──────────────────────────────────────────────── */}
        <section className="w-blk" id="share">
          <div className="wrap w-sharegrid">
            <Reveal>
              <div className="w-eyebrow" style={{ textAlign: "left" }}>Easy sharing</div>
              <h2 className="w-h2" style={{ textAlign: "left" }}>
                Send one link.
                <br />
                <span className="highlight">That is the whole thing.</span>
              </h2>
              <div className="w-checks">
                {SHARING.map(([t, d]) => (
                  <div className="w-check" key={t}>
                    <span className="w-check-ic"><Check size={12} strokeWidth={3} /></span>
                    <span><b>{t}</b><span>{d}</span></span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="w-chatcard">
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
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────── */}
        <section className="w-blk w-final">
          <div className="w-wrap">
            <Reveal>
              <div className="w-seal" style={{ marginBottom: 32 }}>
                <i /><b>✦</b><i />
              </div>
              <div className="w-eyebrow">Your turn</div>
              <h2 className="w-h2">
                Start with <span className="highlight">one sentence.</span>
              </h2>
              <p className="w-lede">
                Tell it what you are celebrating. A beautiful invitation appears in minutes.
              </p>
              <div style={{ marginTop: 32, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/create" className="btn btn-primary btn-lg">
                  Create your invitation
                  <span className="btn-arrow"><ArrowRight size={18} /></span>
                </Link>
              </div>
              <p className="w-fine">It takes one sentence to begin</p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
