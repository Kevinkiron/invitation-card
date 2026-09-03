import Link from "next/link";
import { ArrowRight, Check, Church, Gem, Cake, House, Star, Mic, Code } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShowcasePhone from "@/components/ShowcasePhone";
import { EVENTS, cardMotif, readableOn } from "@/lib/design/showcase";
import "./landing.css";

/* ══════════════════════════════════════════════════════════════════════
   The landing page.

   The proposition is one sentence: you describe your event, and the
   invitation designs itself. Everything here serves that, which is why
   there is no template gallery and no "choose a design" step — step two
   is the product doing the choosing.

   The hero phone runs the real renderer (components/ShowcasePhone.js),
   so the page cannot claim a design capability the code does not have.
   ══════════════════════════════════════════════════════════════════════ */

/* `House`, not `House as Home` — the page component is called Home. */
const ICONS = { church: Church, ring: Gem, cake: Cake, home: House, star: Star, mic: Mic, code: Code };

const TRUTHS = [
  ["No templates", "Every invitation is designed for your event alone"],
  ["Free to start", "Build the whole thing before you pay anything"],
  ["Your link, forever", "One address to share, and it keeps working"],
  ["Built in Kerala", "Made for Indian celebrations, and everything else"],
];

const STEPS = [
  ["Just talk", "Say what you are celebrating, the way you would tell a friend.", false],
  ["It designs itself", "A look made for your event — not picked from a shelf. Say “warmer” or “bigger names” and it changes.", true],
  ["Add your photos", "Drop them into the chat. They appear in the invitation where they belong.", false],
  ["Share the link", "One address on WhatsApp. Guests open it, RSVP, and add their own photos.", false],
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
        {/* ── hero ────────────────────────────────────────────────── */}
        <header className="w-hero">
          <div className="wrap w-herogrid">
            <div>
              <div className="w-pill">✦ <b>Built in Kerala</b> · Free to start</div>
              <h1 className="w-h1">
                Invitations that
                <br />
                <em>design themselves.</em>
              </h1>
              <p className="w-hero-sub">
                Tell us about your event in your own words. Watch a beautiful invitation appear as
                you talk — no templates, no colour pickers, nothing to learn.
              </p>
              <div className="w-hero-cta">
                <Link href="/create" className="btn btn-primary">
                  Create your invitation <ArrowRight size={15} />
                </Link>
                <a href="#how" className="btn btn-ghost">See how it works</a>
              </div>
              <p className="w-hero-note">Ready in minutes · <b>Your link, forever</b></p>
            </div>

            <ShowcasePhone />
          </div>
        </header>

        {/* ── the four things that are true ───────────────────────── */}
        <section className="w-truths">
          <div className="wrap" style={{ padding: 0 }}>
            <div className="w-truthgrid">
              {TRUTHS.map(([t, d]) => (
                <div className="w-truth" key={t}>
                  <div className="w-truth-t">{t}</div>
                  <div className="w-truth-d">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── what are you celebrating ────────────────────────────── */}
        <section className="w-blk" id="events">
          <div className="wrap">
            <div className="w-eyebrow">Start here</div>
            <h2 className="w-h2">What are you <em>celebrating?</em></h2>
            <p className="w-lede">
              Pick one and start talking. The design begins before you have even given a name.
            </p>

            <div className="w-egrid">
              {EVENTS.map((e) => {
                const [bg, accent, deep] = e.palette;
                const Icon = ICONS[e.icon] || Star;
                return (
                  <Link key={e.slug} href={`/create?event=${e.slug}`} className="w-ecard">
                    <div className="w-eart" style={{ background: bg }}>
                      <div className="w-emotif" style={{ backgroundImage: `url("${cardMotif(e.motif, accent)}")` }} />
                      <div className="w-echip" style={{ background: deep, color: readableOn(deep) }}>
                        <Icon size={21} />
                      </div>
                    </div>
                    <div className="w-ebody">
                      <h3>{e.name}</h3>
                      <p>{e.tag}</p>
                      <span className="w-ego">Get started <ArrowRight size={13} /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── how it works ────────────────────────────────────────── */}
        <section className="w-blk w-steps" id="how">
          <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
            <div className="w-eyebrow">Four steps</div>
            <h2 className="w-h2">From a sentence to a <em>shareable link</em></h2>
            <p className="w-lede">No stress. No learning. Nothing to design.</p>

            <div className="w-stepgrid">
              {STEPS.map(([title, body, key], i) => (
                <div className={key ? "w-step key" : "w-step"} key={title}>
                  <div className="w-step-n">{i + 1}</div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── sharing ─────────────────────────────────────────────── */}
        <section className="w-blk" id="share">
          <div className="wrap w-sharegrid">
            <div>
              <div className="w-eyebrow" style={{ textAlign: "left" }}>Easy sharing</div>
              <h2 className="w-h2" style={{ textAlign: "left" }}>
                Send one link.
                <br />
                <em>That is the whole thing.</em>
              </h2>
              <div className="w-checks">
                {SHARING.map(([t, d]) => (
                  <div className="w-check" key={t}>
                    <span className="w-check-ic"><Check size={12} strokeWidth={3} /></span>
                    <span><b>{t}</b><span>{d}</span></span>
                  </div>
                ))}
              </div>
            </div>

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
              <div className="w-msg them">Oh this is gorgeous, see you there</div>
            </div>
          </div>
        </section>

        {/* ── final ───────────────────────────────────────────────── */}
        <section className="w-blk w-final">
          <div className="wrap">
            <div className="w-eyebrow">Your turn</div>
            <h2 className="w-h2">Start with <em>one sentence.</em></h2>
            <p className="w-lede">
              Tell it what you are celebrating. It takes a few minutes from there.
            </p>
            <Link href="/create" className="btn btn-primary">
              Create your invitation <ArrowRight size={15} />
            </Link>
            <p className="w-fine">Free to start · No card needed</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
