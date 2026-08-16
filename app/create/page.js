"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Wand2, Send, Loader2, Calendar,
  CreditCard, ShieldCheck, Sparkles,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TemplateRenderer from "@/components/TemplateRenderer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Reveal, Loading, Banner, Petals } from "@/components/ui";
import { C, PLANS, money } from "@/lib/theme";

const STEPS = ["Functions", "Design", "Details", "Customise", "Publish"];

export default function CreatePage() {
  const { session, ready } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [types, setTypes] = useState([]);
  const [chosen, setChosen] = useState([]);
  const [tmpls, setTmpls] = useState([]);
  const [tmpl, setTmpl] = useState(null);
  const [names, setNames] = useState("");
  const [details, setDetails] = useState({});
  const [cfg, setCfg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (ready && !session) {
      // Preserve ?template=... (set when arriving from the landing page's
      // template gallery) through the login/signup detour so it isn't lost.
      const qs = typeof window !== "undefined" ? window.location.search : "";
      const target = `/create${qs}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [ready, session, router]);

  useEffect(() => {
    supabase.from("event_types").select("*").eq("is_active", true).order("name").then(({ data }) => setTypes(data || []));
    supabase.from("templates").select("*").eq("is_active", true).order("name").then(({ data }) => setTmpls(data || []));
  }, []);

  // Pre-select a template when arriving via /create?template=<id> (from the
  // landing page's "Use this template" cards).
  useEffect(() => {
    if (!tmpls.length || tmpl || typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("template");
    if (!id) return;
    const t = tmpls.find((x) => x.id === id);
    if (!t) return;
    setTmpl(t);
    setCfg({
      palette: t.base_config?.palette || [C.maroon, C.gold, C.ivory],
      font: t.base_config?.font || "serif",
      motif: t.base_config?.motif || "marigold",
      variant: t.base_config?.variant || "classic",
      headline: names || "Aarav & Diya",
      subheadline: "request the honour of your presence at their wedding",
    });
  }, [tmpls, tmpl, names]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const events = chosen.map((id) => {
    const t = types.find((x) => x.id === id);
    const d = details[id] || {};
    return { name: t?.name, event_date: d.date, event_time: d.time, venue: d.venue, address: d.address };
  });

  const publish = async (planKey) => {
    setBusy(true); setErr("");
    try {
      const price = PLANS[planKey].price;
      const { data: inv, error } = await supabase
        .from("invitations")
        .insert({
          owner_id: session.user.id,
          template_id: tmpl.id,
          title: names || "Untitled Invitation",
          design_config: cfg,
          status: "published",
          plan: planKey,
        })
        .select()
        .single();
      if (error) throw error;

      if (chosen.length) {
        const rows = chosen.map((id, i) => {
          const t = types.find((x) => x.id === id);
          const d = details[id] || {};
          return {
            invitation_id: inv.id,
            event_type_id: id,
            name: t?.name || "Event",
            event_date: d.date || null,
            event_time: d.time || null,
            venue: d.venue || "",
            address: d.address || "",
            sort_order: i,
          };
        });
        const { error: e2 } = await supabase.from("invitation_events").insert(rows);
        if (e2) throw e2;
      }

      await supabase.from("payments").insert({
        invitation_id: inv.id, amount: price, currency: "INR",
        plan: planKey, status: "completed", provider: "demo",
      });

      router.push(`/manage/${inv.id}`);
    } catch (e) {
      setErr(e.message || "Could not publish. Please try again.");
      setBusy(false);
    }
  };

  if (!ready || !session) return <Loading />;

  return (
    <>
      <Petals count={8} />
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <main style={{ flex: 1 }}>
          <div className="wrap" style={{ maxWidth: 960, padding: "44px 28px" }}>
            <Progress step={step} />
            {err && <Banner tone="err">{err}</Banner>}
            <div key={step} style={{ animation: "msgIn .55s var(--ease) both" }}>
              {step === 0 && <StepFunctions {...{ types, chosen, setChosen }} next={() => setStep(1)} />}
              {step === 1 && <StepDesign {...{ tmpls, tmpl, setTmpl, setCfg, names }} back={() => setStep(0)} next={() => setStep(2)} />}
              {step === 2 && <StepDetails {...{ names, setNames, chosen, types, details, setDetails, setCfg }} back={() => setStep(1)} next={() => setStep(3)} />}
              {step === 3 && <StepAI {...{ cfg, setCfg, events }} back={() => setStep(2)} next={() => setStep(4)} />}
              {step === 4 && <StepPublish onPay={publish} busy={busy} back={() => setStep(3)} />}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function Progress({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 44, flexWrap: "wrap" }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 9, padding: "9px 17px", borderRadius: 999,
              background: i === step ? `linear-gradient(140deg, ${C.maroon}, ${C.plum})` : i < step ? "rgba(200,162,74,.18)" : "rgba(140,123,112,.08)",
              color: i === step ? C.ivory : i < step ? "#7A5A17" : C.muted,
              fontSize: 13, fontWeight: 700,
              border: `1px solid ${i === step ? "transparent" : i < step ? "rgba(200,162,74,.3)" : C.line}`,
              transition: "all .45s var(--ease)",
            }}
          >
            {i < step ? <Check size={13} /> : <span style={{ opacity: 0.65, fontFamily: "'Marcellus',serif" }}>{i + 1}</span>}
            {s}
          </div>
          {i < STEPS.length - 1 && <span style={{ width: 16, height: 1, background: C.line }} />}
        </div>
      ))}
    </div>
  );
}

function Head({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 className="display h-lg" style={{ fontSize: 38, margin: "0 0 10px", lineHeight: 1.14 }}>{title}</h1>
      {sub && <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.65, margin: 0, maxWidth: 560 }}>{sub}</p>}
    </div>
  );
}

/* ── Step 1 ── */
function StepFunctions({ types, chosen, setChosen, next }) {
  const toggle = (id) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  return (
    <div>
      <Head title="Which functions are you hosting?" sub="Select every ceremony — each gets its own date, venue, guest list and RSVP count." />
      <div className="grid g3" style={{ marginBottom: 36 }}>
        {types.map((t, i) => {
          const on = chosen.includes(t.id);
          return (
            <Reveal key={t.id} delay={i * 40}>
              <div
                onClick={() => toggle(t.id)}
                className="card"
                style={{
                  cursor: "pointer", padding: 22, borderWidth: 2, position: "relative",
                  borderColor: on ? C.maroon : C.line,
                  background: on ? "rgba(91,18,38,.04)" : "#fff",
                  transform: on ? "translateY(-4px)" : "none",
                  boxShadow: on ? `0 22px 40px -26px ${C.maroon}` : "var(--shadow-sm)",
                }}
              >
                {on && (
                  <span className="pop" style={{ position: "absolute", top: 16, right: 16, width: 24, height: 24, borderRadius: "50%", background: C.maroon, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={14} color={C.ivory} />
                  </span>
                )}
                <div className="display" style={{ fontSize: 21, marginBottom: 6, paddingRight: 28 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{t.description}</div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <button className="btn btn-primary" disabled={!chosen.length} onClick={next}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ── Step 2 ── */
function StepDesign({ tmpls, tmpl, setTmpl, setCfg, names, back, next }) {
  const pick = (t) => {
    setTmpl(t);
    setCfg({
      palette: t.base_config?.palette || [C.maroon, C.gold, C.ivory],
      font: t.base_config?.font || "serif",
      motif: t.base_config?.motif || "marigold",
      variant: t.base_config?.variant || "classic",
      headline: names || "Aarav & Diya",
      subheadline: "request the honour of your presence at their wedding",
    });
  };
  return (
    <div>
      <Head title="Choose a starting design" sub="Just a starting point — you'll reshape the colours, motifs and wording by describing them in the next step." />
      <div className="grid g3" style={{ marginBottom: 36 }}>
        {tmpls.map((t, i) => {
          const p = t.base_config?.palette || [C.maroon, C.gold, C.ivory];
          const on = tmpl?.id === t.id;
          return (
            <Reveal key={t.id} delay={i * 55}>
              <div
                onClick={() => pick(t)}
                style={{
                  cursor: "pointer", borderRadius: 18, overflow: "hidden", background: "#fff",
                  border: `2px solid ${on ? C.maroon : C.line}`,
                  transform: on ? "translateY(-6px)" : "none",
                  boxShadow: on ? `0 28px 50px -30px ${C.maroon}` : "var(--shadow-sm)",
                  transition: "all .38s var(--ease)",
                }}
              >
                <div style={{ height: 190, overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ transform: "scale(.62)", transformOrigin: "top center", width: "161%", marginLeft: "-30.5%" }}>
                    <TemplateRenderer
                      cfg={{ ...t.base_config, headline: "Aarav & Diya", subheadline: "request the honour of your presence" }}
                      events={[]}
                      compact
                    />
                  </div>
                </div>
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.name}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 3 }}>
                      {t.base_config?.motif || t.category}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.map((c) => (
                      <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, border: `1px solid ${C.line}` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" onClick={back}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary" disabled={!tmpl} onClick={next}>Continue <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

/* ── Step 3 ── */
function StepDetails({ names, setNames, chosen, types, details, setDetails, setCfg, back, next }) {
  const upd = (id, f, v) => setDetails((p) => ({ ...p, [id]: { ...p[id], [f]: v } }));
  return (
    <div>
      <Head title="Add your details" sub="These appear on the invitation and drive each function's RSVP form." />
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field" style={{ marginBottom: 0, maxWidth: 460 }}>
          <label>Couple's names, as they should appear</label>
          <input value={names} onChange={(e) => setNames(e.target.value)} placeholder="e.g. Aarav & Diya" />
        </div>
      </div>

      {chosen.map((id, i) => {
        const t = types.find((x) => x.id === id);
        const d = details[id] || {};
        return (
          <Reveal key={id} delay={i * 55}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,145,45,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={15} color={C.maroon} />
                </span>
                <span className="display" style={{ fontSize: 22 }}>{t?.name}</span>
              </div>
              <div className="grid g2">
                <div className="field"><label>Date</label><input type="date" value={d.date || ""} onChange={(e) => upd(id, "date", e.target.value)} /></div>
                <div className="field"><label>Time</label><input type="time" value={d.time || ""} onChange={(e) => upd(id, "time", e.target.value)} /></div>
                <div className="field"><label>Venue</label><input value={d.venue || ""} onChange={(e) => upd(id, "venue", e.target.value)} placeholder="Rambagh Palace" /></div>
                <div className="field"><label>Address</label><input value={d.address || ""} onChange={(e) => upd(id, "address", e.target.value)} placeholder="Bhawani Singh Rd, Jaipur" /></div>
              </div>
            </div>
          </Reveal>
        );
      })}

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" onClick={back}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary" onClick={() => { setCfg((c) => (c ? { ...c, headline: names || c.headline } : c)); next(); }}>
          Customise with AI <Wand2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Gemini chat editing ── */
function StepAI({ cfg, setCfg, events, back, next }) {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Tell me how you'd like this to look. Try “make it peacock teal and gold, more regal”, or “write a warmer welcome line for our elders”." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const box = useRef(null);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, busy]);

  const send = async (preset) => {
    const text = (preset || input).trim();
    if (!text || busy) return;
    const conv = [...msgs, { role: "user", content: text }];
    setMsgs(conv); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conv, config: cfg }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.config) {
        setCfg((c) => ({ ...c, ...data.config }));
        setFlash(true);
        setTimeout(() => setFlash(false), 750);
      }
      setMsgs((m) => [...m, { role: "assistant", content: data.reply || "Updated." }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: `I couldn't apply that — ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  const presets = ["Peacock teal & gold", "More traditional", "Softer, romantic tone", "Minimal and modern"];

  return (
    <div>
      <Head title="Shape it in your own words" sub="Describe the change on the left. Your invitation updates on the right, instantly." />

      <div className="ai-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start", marginBottom: 34 }}>
        {/* chat */}
        <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", height: 580, overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 11, fontWeight: 700, fontSize: 15 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(140deg, ${C.marigold}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wand2 size={14} color={C.plumDeep} />
            </span>
            Design assistant
            <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>
              Gemini
            </span>
          </div>

          <div ref={box} className="scroll-y" style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
            {msgs.map((m, i) => (
              <div
                key={i}
                className="chat-msg"
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? `linear-gradient(140deg, ${C.maroon}, ${C.plum})` : "rgba(140,123,112,.1)",
                  color: m.role === "user" ? C.ivory : C.ink,
                  borderRadius: m.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                }}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="chat-msg" style={{ alignSelf: "flex-start", background: "rgba(140,123,112,.1)", borderRadius: "18px 18px 18px 5px", display: "flex", gap: 5, alignItems: "center" }}>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            )}
          </div>

          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.line}`, display: "flex", gap: 7, flexWrap: "wrap" }}>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={busy}
                style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 999, padding: "7px 13px", fontSize: 12, color: C.muted, fontWeight: 600 }}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 9, padding: 16, borderTop: `1px solid ${C.line}` }}>
            <input
              placeholder="Describe the change…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              style={{ flex: 1, padding: "12px 15px", border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 14.5, outline: "none" }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={busy} aria-label="Send">
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* preview */}
        <div
          style={{
            borderRadius: 22, overflow: "hidden", height: 580, background: "#fff",
            border: `1px solid ${flash ? C.gold : C.line}`,
            boxShadow: flash ? `0 0 0 6px rgba(200,162,74,.18)` : "var(--shadow-md)",
            transition: "box-shadow .55s, border-color .55s",
          }}
        >
          <div className="scroll-y" style={{ height: "100%", overflowY: "auto" }}>
            <TemplateRenderer cfg={cfg} events={events} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" onClick={back}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary" onClick={next}>Continue to publish <ArrowRight size={16} /></button>
      </div>

      <style jsx>{`@media (max-width: 900px) { .ai-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ── Step 5 ── */
function StepPublish({ onPay, busy, back }) {
  const [plan, setPlan] = useState("STANDARD");
  return (
    <div>
      <Head title="Publish your invitation" sub="One payment, no subscription. In this build the payment step is simulated — connect Razorpay to take real payments." />

      <div className="grid g3" style={{ marginBottom: 30 }}>
        {Object.entries(PLANS).map(([k, p]) => {
          const on = plan === k;
          return (
            <div
              key={k}
              onClick={() => setPlan(k)}
              className="card"
              style={{
                cursor: "pointer", borderWidth: 2,
                borderColor: on ? C.maroon : C.line,
                background: on ? "rgba(91,18,38,.04)" : "#fff",
                transform: on ? "translateY(-5px)" : "none",
                boxShadow: on ? `0 24px 42px -28px ${C.maroon}` : "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 15.5 }}>{p.label}</span>
                {on && <span className="pop" style={{ width: 20, height: 20, borderRadius: "50%", background: C.maroon, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color={C.ivory} /></span>}
              </div>
              <div className="display" style={{ fontSize: 32, color: C.maroon, margin: "10px 0 12px" }}>{money(p.price)}</div>
              {[p.sites, p.guests].map((b) => (
                <div key={b} style={{ display: "flex", gap: 8, fontSize: 13, color: C.muted, marginBottom: 7 }}>
                  <Check size={13} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} /> {b}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ maxWidth: 450, marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20, fontWeight: 700, fontSize: 15 }}>
          <CreditCard size={17} color={C.maroon} /> Payment details
        </div>
        <div className="field"><label>Name on card</label><input placeholder="Simulated — no real charge" /></div>
        <div className="field"><label>Card number</label><input placeholder="4242 4242 4242 4242" /></div>
        <div className="grid g2">
          <div className="field"><label>Expiry</label><input placeholder="MM / YY" /></div>
          <div className="field"><label>CVV</label><input placeholder="123" /></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: C.muted, marginTop: 4 }}>
          <ShieldCheck size={14} color={C.green} /> Your card is never stored on our servers.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-ghost" onClick={back} disabled={busy}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-primary btn-lg" onClick={() => onPay(plan)} disabled={busy}>
          {busy ? <><Loader2 size={16} className="spin" /> Publishing…</> : <><Sparkles size={16} /> Pay {money(PLANS[plan].price)} & publish</>}
        </button>
      </div>
    </div>
  );
}
