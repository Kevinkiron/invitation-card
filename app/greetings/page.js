import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { cardMotif } from "@/lib/design/showcase";
import { OCCASIONS } from "@/lib/greetings/occasions";
import { C } from "@/lib/theme";
import "@/app/greetings.css";

/* ══════════════════════════════════════════════════════════════════════
   THE GREETINGS PORTAL — landing page.

   A separate front door from the invitation homepage (app/page.js),
   reached from the toggle in the header (components/Nav.js). Same
   no-templates promise, much smaller product: one message, one
   recipient, no guest list — see lib/design/greeting-tokens.js and
   app/greetings/create/page.js.
   ══════════════════════════════════════════════════════════════════════ */
export const metadata = {
  title: "Greeting Cards — Welcvm",
  description: "A personal, animated greeting card for any occasion — Christmas, Diwali, Onam, a birthday, a thank you. Written for the one person it's going to.",
};

export default function GreetingsLanding() {
  return (
    <>
      <Nav />
      <main style={{ background: C.paper, minHeight: "100vh" }}>
        <section className="g-hero wrap">
          <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>
            <Sparkles size={13} /> Greeting Cards
          </p>
          <h1 className="display">One card, one person, said properly</h1>
          <p>
            Not an invitation — a message. Pick the occasion, say who it&rsquo;s for and what
            you want to say, and it opens as a small animated card made for exactly that.
          </p>
        </section>

        <div className="wrap">
          <div className="g-grid">
            {OCCASIONS.map((o) => (
              <Link key={o.slug} href={`/greetings/create?occasion=${o.slug}`} className="g-card">
                <div
                  className="g-card-art"
                  style={{
                    background: `linear-gradient(150deg, ${o.palette.surface}, ${o.palette.bg})`,
                    backgroundImage: `linear-gradient(150deg, ${o.palette.surface}, ${o.palette.bg}), url("${cardMotif(o.motif, o.palette.accent)}")`,
                    backgroundBlendMode: "normal, soft-light",
                    backgroundSize: "cover, 160% 160%",
                    backgroundPosition: "center, center",
                  }}
                >
                  <span className="g-card-art-veil" aria-hidden="true" />
                  <span className="g-card-name">{o.name}</span>
                </div>
                <div className="g-card-body">
                  <p className="g-card-tag">{o.tag}</p>
                  <span className="g-card-cta" style={{ color: C.heart }}>
                    Create a card <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
