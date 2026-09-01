"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Send, Loader2, Sparkles, Check, RefreshCw,
  CreditCard, ShieldCheck, AlertTriangle,
} from "lucide-react";
import Nav from "@/components/Nav";
import PhoneFrame from "@/components/PhoneFrame";
import InvitationRenderer from "@/components/InvitationRenderer";
import TokenInvite from "@/components/TokenInvite";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Loading, Banner } from "@/components/ui";
import { C, PLANS, money } from "@/lib/theme";
import { TEMPLATES } from "@/lib/templates/registry";
import { EVENT_TYPE_LIST, getEventType } from "@/lib/ai/event-types";
import { emptyDraft, draftToInvitation, draftToConfig } from "@/lib/ai/draft";

/* Perceived luminance — decides whether the phone status bar should be
   light or dark against whatever background the AI chose. */
function isDark(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

const OPENING = "Hello — I'll build your invitation with you. It'll fill in on the right as we talk.\n\nWhat are you celebrating?";

export default function CreatePage() {
  const { session, ready } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([{ role: "assistant", content: OPENING }]);
  const [draft, setDraft] = useState(emptyDraft(null));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [templateReason, setTemplateReason] = useState("");
  // v2: the AI writes the design itself, as tokens. Empty until it does.
  const [tokens, setTokens] = useState({ design: {}, content: {}, eventKind: null });
  const generative = Boolean(tokens?.design?.palette?.bg);
  const [publishing, setPublishing] = useState(false);
  const [plan, setPlan] = useState("STANDARD");

  const scrollRef = useRef(null);

  useEffect(() => {
    if (ready && !session) {
      const qs = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/login?redirect=${encodeURIComponent(`/create${qs}`)}`);
    }
  }, [ready, session, router]);

  // If they arrived from a template card, lock that choice in up front.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = new URLSearchParams(window.location.search).get("template");
    if (slug && TEMPLATES.some((t) => t.slug === slug)) {
      setDraft((d) => ({ ...d, templateSlug: slug }));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const templateSlug = draft.templateSlug || TEMPLATES[0].slug;
  const invitation = draftToInvitation(draft);
  const activeTemplate = TEMPLATES.find((t) => t.slug === templateSlug) || TEMPLATES[0];

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setErr("");

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          tokens,
          turnCount: messages.filter((m) => m.role === "user").length,
        }),
      });
      /* Read as text first. A failure that never reached our route — a
         platform timeout, a cold-start crash — comes back as HTML or plain
         text, and calling res.json() on it throws
         `Unexpected token 'A', "An error o"...` which buries the real cause.
         Parse defensively and show whatever the server actually said. */
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        setErr(
          `Server error ${res.status}: ${text.slice(0, 200) || "empty response"}. ` +
          `If this says the deployment failed, the AI call most likely timed out — check /api/ai/models.`
        );
        setBusy(false);
        return;
      }

      if (!res.ok || !data) {
        const msg = data?.error || `Request failed (${res.status}).`;
        setErr(data?.detail ? `${msg} (${data.detail})` : msg);
        setBusy(false);
        return;
      }

      // The server returns sanitised tokens — we never merge blindly.
      if (data.tokens) setTokens(data.tokens);
      if (data.eventKind) setDraft((d) => ({ ...d, eventType: data.eventKind }));
      setProgress(data.progress ?? 0);
      setDone(Boolean(data.done));

      const say = [data.reply, data.askNext].filter(Boolean).join("\n\n");
      setMessages((m) => [...m, { role: "assistant", content: say || "Got it." }]);
    } catch (e) {
      setErr(e.message || "Could not reach the AI.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setPublishing(true);
    setErr("");
    try {
      const cfg = draftToConfig(draft, templateSlug);
      const { data: inv, error } = await supabase
        .from("invitations")
        .insert({
          owner_id: session.user.id,
          title: cfg.headline,
          design_config: cfg,
          status: "published",
          plan,
        })
        .select()
        .single();
      if (error) throw error;

      const rows = invitation.events.map((e, i) => ({
        invitation_id: inv.id,
        name: e.name || "Celebration",
        event_date: e.date || null,
        event_time: e.time || null,
        venue: e.venue || "",
        address: e.address || "",
        sort_order: i,
      }));
      if (rows.length) {
        const { error: e2 } = await supabase.from("invitation_events").insert(rows);
        if (e2) throw e2;
      }

      await supabase.from("payments").insert({
        invitation_id: inv.id, amount: PLANS[plan].price, currency: "INR",
        plan, status: "completed", provider: "demo",
      });

      router.push(`/manage/${inv.id}`);
    } catch (e) {
      setErr(
        `Could not publish: ${e.message || "unknown error"}. If your Supabase project is paused, restore it and try again — your answers are still here.`
      );
      setPublishing(false);
    }
  }

  if (!ready || !session) return <Loading />;

  const eventType = getEventType(draft.eventType);

  return (
    <>
      <Nav />
      <main style={{ background: C.paper, minHeight: "100vh" }}>
        <div className="ai-wrap">
          {/* ── Conversation ── */}
          <section className="ai-chat-col">
            <header style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(140deg, ${C.maroon}, ${C.plum})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={15} color={C.marigold} />
                </span>
                <h1 className="display" style={{ fontSize: 24, margin: 0 }}>Build your invitation</h1>
              </div>

              {/* progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(140,123,112,.16)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", width: `${Math.round(progress * 100)}%`,
                      background: `linear-gradient(90deg, ${C.gold}, ${C.marigold})`,
                      borderRadius: 999, transition: "width .6s var(--ease)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: ".08em", minWidth: 78, textAlign: "right" }}>
                  {eventType ? `${Math.round(progress * 100)}% · ${eventType.label}` : "Getting started"}
                </span>
              </div>
            </header>

            {err && <Banner tone="err">{err}</Banner>}

            <div className="ai-thread" ref={scrollRef}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="chat-msg"
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background: m.role === "user" ? C.maroon : "#fff",
                    color: m.role === "user" ? C.ivory : C.ink,
                    border: m.role === "user" ? "none" : `1px solid ${C.line}`,
                    borderRadius: m.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              ))}

              {busy && (
                <div className="chat-msg" style={{ alignSelf: "flex-start", background: "#fff", border: `1px solid ${C.line}`, borderRadius: "18px 18px 18px 5px", display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              )}
            </div>

            {/* Event-type chips only until the type is known. */}
            {!draft.eventType && !busy && (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                {EVENT_TYPE_LIST.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => send(`It's a ${t.label.toLowerCase()}.`)}
                    style={{
                      border: `1px solid ${C.line}`, background: "#fff", borderRadius: 999,
                      padding: "8px 15px", fontSize: 12.5, color: C.ink, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {done ? (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} color="#fff" />
                  </span>
                  <strong style={{ fontSize: 15 }}>Your invitation is ready</strong>
                </div>

                <div className="grid g3" style={{ gap: 8, marginBottom: 14 }}>
                  {Object.entries(PLANS).map(([k, p]) => (
                    <button
                      key={k}
                      onClick={() => setPlan(k)}
                      style={{
                        cursor: "pointer", textAlign: "left", padding: "11px 12px", borderRadius: 12,
                        border: `2px solid ${plan === k ? C.maroon : C.line}`,
                        background: plan === k ? "rgba(91,18,38,.04)" : "#fff",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 800 }}>{p.label}</div>
                      <div className="display" style={{ fontSize: 19, color: C.maroon, marginTop: 3 }}>{money(p.price)}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11.5, color: C.muted, marginBottom: 12 }}>
                  <ShieldCheck size={14} color={C.green} /> Payment is simulated in this build — no card is charged.
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={publish} disabled={publishing}>
                  {publishing
                    ? <><Loader2 size={16} className="spin" /> Publishing…</>
                    : <><CreditCard size={16} /> Publish invitation</>}
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  onClick={() => { setDone(false); send("Actually, I'd like to change something."); }}
                  disabled={publishing}
                >
                  <RefreshCw size={13} /> Keep editing
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 9 }}>
                <input
                  placeholder={draft.eventType ? "Type your answer…" : "Tell me what you're celebrating…"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={busy}
                  style={{ flex: 1, padding: "13px 16px", border: `1px solid ${C.line}`, borderRadius: 13, fontSize: 14.5, outline: "none", fontFamily: "inherit", background: "#fff" }}
                />
                <button className="btn btn-primary" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">
                  <Send size={15} />
                </button>
              </div>
            )}
          </section>

          {/* ── Live preview ── */}
          <aside className="ai-preview-col">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhoneFrame
                width={296}
                height={604}
                statusColor={generative
                  ? (isDark(tokens.design.palette.bg) ? "rgba(255,255,255,.9)" : "rgba(20,16,14,.85)")
                  : (["#0B0A0E", "#120A0D"].includes(activeTemplate.theme.bg) ? "rgba(255,255,255,.9)" : "rgba(20,16,14,.85)")}
                label="Live invitation preview"
              >
                {generative ? (
                  <TokenInvite tokens={tokens} />
                ) : (
                  <InvitationRenderer
                    templateId={templateSlug}
                    mode="editor"
                    invitationData={invitation}
                  />
                )}
              </PhoneFrame>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: C.muted, fontWeight: 800, marginBottom: 9 }}>
                Design
              </div>
              {generative && (
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.7 }}>
                  Designed for your event as you talk — no template. Say “warmer”,
                  “less pink” or “bigger names” and it will change.
                </div>
              )}
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
                {!generative && TEMPLATES.map((t) => {
                  const on = t.slug === templateSlug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => setDraft((d) => ({ ...d, templateSlug: t.slug }))}
                      title={t.name}
                      aria-label={t.name}
                      aria-pressed={on}
                      style={{
                        cursor: "pointer", padding: "6px 11px", borderRadius: 999,
                        fontSize: 11, fontWeight: 700,
                        border: `1px solid ${on ? C.maroon : C.line}`,
                        background: on ? C.maroon : "#fff",
                        color: on ? C.ivory : C.muted,
                        fontFamily: "inherit", transition: "all .3s",
                      }}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
              {templateReason && (
                <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                  {templateReason}
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <style jsx>{`
        .ai-wrap {
          max-width: 1180px; margin: 0 auto;
          padding: 26px 28px 60px;
          display: grid; grid-template-columns: 1fr minmax(320px, 380px);
          gap: 40px; align-items: start;
        }
        .ai-chat-col { display: flex; flex-direction: column; min-width: 0; }
        .ai-thread {
          display: flex; flex-direction: column; gap: 10px;
          height: 420px; overflow-y: auto; padding: 4px 2px 14px; margin-bottom: 12px;
        }
        .ai-preview-col { position: sticky; top: 92px; }
        @media (max-width: 940px) {
          .ai-wrap { grid-template-columns: 1fr; gap: 30px; }
          .ai-preview-col { position: static; order: -1; }
          .ai-thread { height: 320px; }
        }
      `}</style>
    </>
  );
}
