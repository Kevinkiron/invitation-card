"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Wand2, Link2, BarChart3, PartyPopper, Send, Globe,
  Check, MessageCircle, ChevronDown,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import InvitePreview from "@/components/InvitePreview";
import { Reveal, Counter, Petals, SectionHead } from "@/components/ui";
import { C, PLANS, money } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

/* Rotating demo palettes so the hero phone feels alive */
const DEMOS = [
  { palette: ["#5B1226", "#E8912D", "#FDF6EA"], motif: "marigold", headline: "Aarav & Diya", subheadline: "request the honour of your presence at their wedding" },
  { palette: ["#0E5C63", "#C8A24A", "#F6FAF8"], motif: "peacock", headline: "Rohan & Meera", subheadline: "invite you to celebrate a union of two families" },
  { palette: ["#3B0A2A", "#C8A24A", "#FBF3E9"], motif: "paisley", headline: "Vikram & Ananya", subheadline: "joyfully invite you to share in their happiness" },
];

const DEMO_EVENTS = [
  { name: "Haldi", event_date: "2027-01-14", event_time: "10:00", venue: "Residence, Jaipur" },
  { name: "Sangeet", event_date: "2027-01-15", event_time: "19:00", venue: "Rambagh Palace" },
  { name: "Vivaah", event_date: "2027-01-16", event_time: "20:30", venue: "Rambagh Palace Lawns" },
];

export default function Home() {
  const [demo, setDemo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDemo((d) => (d + 1) % DEMOS.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Petals />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav />
        <main>
          <Hero demo={demo} />
          <Ceremonies />
          <Templates />
          <Features />
          <HowItWorks />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}

/* ══════════════ HERO ══════════════ */
function Hero({ demo }) {
  const phoneRef = useRef(null);

  // gentle mouse parallax on the phone
  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fn = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const rx = ((e.clientY - h / 2) / h) * -7;
      const ry = ((e.clientX - w / 2) / w) * 9;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const cfg = DEMOS[demo];

  return (
    <section className="wrap" style={{ padding: "60px 28px 30px" }}>
      <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 60, alignItems: "center" }}>
        {/* copy */}
        <div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase",
              color: C.maroon, background: "rgba(91,18,38,.07)",
              border: `1px solid rgba(91,18,38,.12)`,
              padding: "8px 16px", borderRadius: 999, marginBottom: 26,
              animation: "msgIn .7s var(--ease) both",
            }}
          >
            <Sparkles size={13} /> Made for Indian celebrations
          </div>

          <h1 className="display h-xl" style={{ fontSize: 66, lineHeight: 1.03, margin: "0 0 24px", letterSpacing: "-.02em", animation: "msgIn .85s var(--ease) .08s both" }}>
            Every ceremony.<br />
            Every guest.
            <br />
            <span className="foil">One beautiful link.</span>
          </h1>

          <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.68, maxWidth: 480, margin: "0 0 34px", animation: "msgIn .85s var(--ease) .16s both" }}>
            From Roka to Griha Pravesh — design your invitation by simply describing it,
            send each guest their own personalised link on WhatsApp, and watch every RSVP arrive live.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", animation: "msgIn .85s var(--ease) .24s both" }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create yours free <ArrowRight size={17} />
            </Link>
            <a href="#how" className="btn btn-ghost btn-lg">See how it works</a>
          </div>

          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 16, animation: "msgIn .85s .3s both" }}>
            No card required · Free to build and preview · Pay only to publish
          </div>

          <div style={{ display: "flex", gap: 40, marginTop: 46, flexWrap: "wrap", animation: "msgIn .85s .36s both" }}>
            {[
              ["Families served", 1200, "+"],
              ["Guests invited", 340000, ""],
              ["Minutes to build", 10, ""],
            ].map(([l, v, s]) => (
              <div key={l}>
                <div className="display" style={{ fontSize: 34, color: C.maroon, lineHeight: 1 }}>
                  <Counter to={v} suffix={s} />
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 7, letterSpacing: ".04em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* phone mockup */}
        <div className="phone-stage" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div className="orbit" style={{ width: 460, height: 460, top: "50%", left: "50%", marginTop: -230, marginLeft: -230 }} />
          <div className="orbit" style={{ width: 560, height: 560, top: "50%", left: "50%", marginTop: -280, marginLeft: -280, animationDuration: "40s", animationDirection: "reverse", borderStyle: "dashed", opacity: .5 }} />

          <div ref={phoneRef} className="phone" style={{ transition: "transform .45s var(--ease)" }}>
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-status">
                <span>9:41</span>
                <span style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 10 }}>▮▮▮ ⌁ ▰</span>
              </div>
              <div className="phone-scroll">
                <div key={demo} style={{ animation: "msgIn .8s var(--ease) both" }}>
                  <InvitePreview cfg={cfg} events={DEMO_EVENTS} guestName="Kabir Uncle" compact />
                </div>
              </div>
              <div className="phone-glare" />
            </div>
          </div>

          <div className="float-tag" style={{ top: 74, left: -6, animationDelay: ".4s" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 0 3px rgba(63,125,83,.18)` }} />
            142 accepted
          </div>
          <div className="float-tag" style={{ bottom: 108, right: -14, animationDelay: "1.5s" }}>
            <MessageCircle size={14} color={C.marigold} /> Sent on WhatsApp
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════ CEREMONY RAIL ══════════════ */
function Ceremonies() {
  const list = ["Roka", "Sagai", "Ganesh Puja", "Haldi", "Mehendi", "Sangeet", "Baraat", "Vivaah", "Reception", "Griha Pravesh"];
  return (
    <section style={{ padding: "56px 0 20px", overflow: "hidden" }}>
      <Reveal>
        <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold, marginBottom: 22 }}>
          One invitation, every function
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
          {list.map((n, i) => (
            <span
              key={n}
              style={{
                padding: "10px 20px", borderRadius: 999,
                border: `1px solid ${C.line}`, background: "rgba(255,255,255,.7)",
                fontSize: 14, fontWeight: 600, color: C.ink,
                animation: `msgIn .6s var(--ease) ${i * 60}ms both`,
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ══════════════ TEMPLATES ══════════════ */
function Templates() {
  const [tmpls, setTmpls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setTmpls(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="templates" style={{ padding: "92px 0" }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Templates"
          title="Start from a design you love"
          sub="Every template redraws itself as you describe changes — pick whichever feels closest, then make it yours in the AI chat step."
        />
        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 14 }}>Loading templates…</div>
        ) : tmpls.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 14 }}>
            Templates will appear here once they're published.
          </div>
        ) : (
          <div className="grid g3">
            {tmpls.map((t, i) => {
              const p = t.base_config?.palette || [C.maroon, C.gold, C.ivory];
              return (
                <Reveal key={t.id} delay={i * 60}>
                  <Link
                    href={`/create?template=${t.id}`}
                    className="card card-hover"
                    style={{ display: "block", overflow: "hidden", padding: 0, textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ height: 220, overflow: "hidden", borderBottom: `1px solid ${C.line}`, background: p[2] || C.ivory }}>
                      <div style={{ transform: "scale(.62)", transformOrigin: "top center", width: "161%", marginLeft: "-30.5%" }}>
                        <InvitePreview
                          cfg={{ ...t.base_config, headline: "Aarav & Diya", subheadline: "request the honour of your presence" }}
                          events={[]}
                          compact
                        />
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                        <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 3 }}>
                          {t.base_config?.motif || t.category}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {p.map((c) => (
                          <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: `1px solid ${C.line}` }} />
                        ))}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <Link href="/signup" className="btn btn-ghost">
            Build with any of these <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════ FEATURES ══════════════ */
function Features() {
  const items = [
    [Wand2, "Design by conversation", "Say “make it peacock teal with gold, more traditional” and watch the invitation redraw itself. No design skills needed."],
    [Link2, "A link for every guest", "Each person opens an invitation addressed to them by name. No group forwards, no impersonal blasts."],
    [BarChart3, "Live RSVP board", "Who's coming, to which function, how many seats, dietary preferences — updating in real time."],
    [PartyPopper, "Functions tracked separately", "Haldi at home, Sangeet at the hotel, Vivaah at the farmhouse — each with its own guests and headcount."],
    [Send, "Delivered on WhatsApp", "One tap sends each guest their personal link, message already written, in the language you choose."],
    [Globe, "Every Indian language", "Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi — mix scripts on a single invitation."],
  ];

  return (
    <section id="features" style={{ background: C.paper, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "92px 0", marginTop: 40 }}>
      <div className="wrap">
        <SectionHead eyebrow="What's inside" title="Everything the big day asks for" sub="Built around how Indian weddings actually run — many functions, many guests, many languages." />
        <div className="grid g3">
          {items.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className="card card-hover card-orn" style={{ height: "100%" }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                    background: `linear-gradient(140deg, rgba(232,145,45,.2), rgba(200,162,74,.08))`,
                    border: `1px solid rgba(200,162,74,.24)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon size={21} color={C.maroon} />
                </div>
                <h3 className="display" style={{ fontSize: 22, margin: "0 0 10px", lineHeight: 1.25 }}>{t}</h3>
                <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.68, margin: 0 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ HOW IT WORKS ══════════════ */
function HowItWorks() {
  const steps = [
    ["Choose your functions", "Pick every ceremony you're hosting — each gets its own date, venue, guest list and RSVP count."],
    ["Describe your design", "Start from a template, then tell the AI what to change. Colours, wording, mood — it updates instantly."],
    ["Add your guests", "Type names or paste a list. Every guest gets a private link with their own name on the invitation."],
    ["Share and track", "Send on WhatsApp in one tap, then watch acceptances, declines and seat counts land on your dashboard."],
  ];

  return (
    <section id="how" style={{ padding: "92px 0" }}>
      <div className="wrap">
        <SectionHead eyebrow="How it works" title="From idea to invitation in four steps" />
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={i * 90}>
              <div style={{ display: "flex", gap: 26, paddingBottom: i === steps.length - 1 ? 0 : 34, position: "relative" }}>
                {i < steps.length - 1 && (
                  <span style={{ position: "absolute", left: 25, top: 56, bottom: 8, width: 1, background: `linear-gradient(180deg, ${C.gold}55, ${C.line})` }} />
                )}
                <div
                  style={{
                    width: 51, height: 51, flexShrink: 0, borderRadius: "50%",
                    border: `1px solid ${C.gold}`, background: C.paper,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Marcellus', serif", fontSize: 19, color: C.maroon,
                    boxShadow: `0 8px 20px -12px ${C.gold}`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <h3 className="display" style={{ fontSize: 24, margin: "0 0 8px" }}>{t}</h3>
                  <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.68, margin: 0, maxWidth: 520 }}>{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ PRICING ══════════════ */
function Pricing() {
  const rows = [
    ["BASIC", ["1 invitation website", "Up to 200 guest links", "All ceremony types", "Live RSVP dashboard", "WhatsApp sharing"], false],
    ["STANDARD", ["3 invitation websites", "Up to 800 guest links", "Separate RSVP per function", "AI design assistant", "Guest list import", "Priority support"], true],
    ["PREMIUM", ["Unlimited guest links", "Custom design by our team", "Guest photo gallery", "Multi-language invitation", "Dedicated manager"], false],
  ];

  return (
    <section id="pricing" style={{ background: C.paper, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "92px 0" }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Pricing"
          title="Pay once. No subscriptions."
          sub="A printed card set for 300 guests runs well past ₹60,000. This costs a fraction, and you can edit it after sending."
        />
        <div className="grid g3">
          {rows.map(([key, bullets, featured], i) => {
            const p = PLANS[key];
            return (
              <Reveal key={key} delay={i * 100}>
                <div
                  className="card card-hover"
                  style={{
                    height: "100%", position: "relative", display: "flex", flexDirection: "column",
                    borderColor: featured ? C.maroon : C.line,
                    borderWidth: featured ? 2 : 1,
                    background: featured ? `linear-gradient(172deg, #fff, rgba(232,145,45,.055))` : "#fff",
                  }}
                >
                  {featured && (
                    <span className="tag" style={{ position: "absolute", top: -13, left: 28, background: C.maroon, color: C.ivory, padding: "6px 14px" }}>
                      <Sparkles size={11} /> Most chosen
                    </span>
                  )}
                  <div className="display" style={{ fontSize: 27, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{p.sites}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                    <span className="display" style={{ fontSize: 40, color: C.maroon }}>{money(p.price)}</span>
                    <span style={{ fontSize: 15, color: C.muted, textDecoration: "line-through" }}>{money(p.mrp)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 24 }}>
                    Save {money(p.mrp - p.price)} · one-time
                  </div>
                  <div style={{ flex: 1, marginBottom: 26 }}>
                    {bullets.map((b) => (
                      <div key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.muted, marginBottom: 12 }}>
                        <Check size={15} color={C.gold} style={{ marginTop: 3, flexShrink: 0 }} /> {b}
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className={`btn ${featured ? "btn-primary" : "btn-ghost"}`} style={{ width: "100%" }}>
                    Start free preview
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <p style={{ textAlign: "center", color: C.muted, fontSize: 13.5, marginTop: 30 }}>
            Every plan is free to build and preview. You pay only when you publish.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════ FAQ ══════════════ */
function Faq() {
  const qs = [
    ["Is it really free to start?", "Yes. You can build your entire invitation, add your functions and preview exactly how guests will see it without paying. Payment is only required to publish and generate guest links."],
    ["How do personalised guest links work?", "You add each guest's name to your list, and the system creates a unique private link for them. When they open it, the invitation greets them by name and their RSVP is recorded against their entry."],
    ["Can I add Haldi, Mehendi, Sangeet and the Vivaah separately?", "Yes. Each function is its own entry with its own date, time, venue and RSVP tracking, so you can see exactly who's coming to which event."],
    ["Can I edit the invitation after sending it?", "Yes. Because it's a live website rather than a printed card, any edit you make is reflected instantly for every guest who opens their link."],
    ["Which languages are supported?", "You can write in Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Kannada, Malayalam and English — and mix scripts on the same invitation."],
  ];
  const [open, setOpen] = useState(0);

  return (
    <section style={{ padding: "92px 0" }}>
      <div className="wrap" style={{ maxWidth: 780 }}>
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
        {qs.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <div
              className="card"
              style={{ marginBottom: 12, padding: "6px 24px", cursor: "pointer", borderColor: open === i ? C.gold : C.line }}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0" }}>
                <span style={{ fontWeight: 700, fontSize: 15.5 }}>{q}</span>
                <ChevronDown size={18} color={C.muted} style={{ flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .35s var(--ease)" }} />
              </div>
              <div
                style={{
                  maxHeight: open === i ? 240 : 0,
                  opacity: open === i ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height .45s var(--ease), opacity .35s, padding .35s",
                  paddingBottom: open === i ? 20 : 0,
                }}
              >
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.72, margin: 0, maxWidth: 620 }}>{a}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════ FINAL CTA ══════════════ */
function FinalCta() {
  return (
    <section className="wrap" style={{ paddingBottom: 20 }}>
      <Reveal>
        <div
          style={{
            background: `linear-gradient(145deg, ${C.maroon}, ${C.plumDeep})`,
            borderRadius: 30, padding: "82px 40px", textAlign: "center",
            color: C.ivory, position: "relative", overflow: "hidden",
            boxShadow: `0 50px 90px -50px ${C.plum}`,
          }}
        >
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", top: -190, right: -110, background: `radial-gradient(circle, rgba(232,145,45,.3), transparent 68%)` }} />
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", bottom: -180, left: -90, background: `radial-gradient(circle, rgba(200,162,74,.2), transparent 68%)` }} />
          <div style={{ position: "absolute", inset: 18, border: `1px solid rgba(200,162,74,.25)`, borderRadius: 22, pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <h2 className="display h-lg" style={{ fontSize: 48, margin: "0 0 16px", lineHeight: 1.12 }}>
              Your invitation, ready in <span className="foil">ten minutes</span>
            </h2>
            <p style={{ opacity: 0.8, fontSize: 16.5, marginBottom: 34, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Free to build. Free to preview. Pay only when you're ready to share it with everyone.
            </p>
            <Link href="/signup" className="btn btn-gold btn-lg">
              Get started free <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
