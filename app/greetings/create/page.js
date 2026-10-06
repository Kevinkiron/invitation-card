"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Check, CreditCard, ShieldCheck, Loader2, Paperclip, Music,
  X as XIcon, Sparkles, RefreshCw, Copy, ExternalLink, MessageCircle,
} from "lucide-react";
import Nav from "@/components/Nav";
import PhoneFrame from "@/components/PhoneFrame";
import GreetingCard from "@/components/GreetingCard";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Loading, Banner } from "@/components/ui";
import { C, PLANS, money } from "@/lib/theme";
import { OCCASIONS, getOccasion } from "@/lib/greetings/occasions";
import { emptyGreetingTokens, greetingProgress, greetingPublishable } from "@/lib/design/greeting-tokens";
import { uploadPhoto, describeFile } from "@/lib/photos";
import { uploadAudio, describeAudioFile } from "@/lib/music/upload";
import { whatsappHref, SITE_URL } from "@/lib/share";
import { BACKGROUNDS, backgroundCss, backgroundIsLight } from "@/lib/greetings/backgrounds";
import { INKS, FONTS } from "@/lib/greetings/card-style";
import { coverOptions } from "@/lib/greetings/covers";
import { cardWords } from "@/lib/greetings/verses";
import { cardTheme } from "@/lib/greetings/card-themes";
import "@/app/greetings.css";

/* ══════════════════════════════════════════════════════════════════════
   GREETING CARD WIZARD

   No AI here — deliberately. A greeting card is occasion + to + from +
   message + two optional uploads, which is small enough to just ask for
   directly rather than route through a model. Kevin's scope for this
   feature: "Just the landing page and the creation of greetings going
   forward" — same chat-style chrome as app/create/page.js (ai-wrap,
   chat-msg, ai-chips, ai-input-row) so it feels like the same product,
   but the steps are a fixed script, not a conversation with a model on
   the other end.

   Publishing skips invitation_events entirely: a greeting card has no
   RSVP, no guest list, nothing to schedule — see lib/design/
   greeting-tokens.js and Kevin's answer #2 ("Just greeting card just
   that only"). The result is a `/g/{slug}` link, not `/manage/{id}` —
   answer #4 scoped this feature to creation only, not the dashboard.
   ══════════════════════════════════════════════════════════════════════ */

const STEPS = ["to", "from", "message", "verse", "cover", "style", "extras", "done"];
const STEP = (name) => STEPS.indexOf(name);

function isDark(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export default function GreetingCreatePage() {
  const router = useRouter();
  const { session, ready } = useAuth();

  /* Always start empty — occasion-picker chips, step -1 — and only look at
     `?occasion=` after mount, in a useEffect. This mirrors app/create/
     page.js's own `?event=`/`?template=` handling (window.location.search
     read inside useEffect, never as an initial useState value): reading
     the query string during render, even guarded by `typeof window`,
     produces different HTML on the server prerender pass than on the
     client and forces this page out of static prerendering — exactly
     the "should be wrapped in a suspense boundary" build failure that
     useSearchParams() hit here. This page is "use client" anyway, so
     nothing is lost by resolving the occasion one tick after mount. */
  const [occasion, setOccasion] = useState(null);
  const [tokens, setTokens] = useState(() => emptyGreetingTokens(null));
  const [stepIdx, setStepIdx] = useState(-1); // -1 = still picking an occasion
  const [messages, setMessages] = useState(() => [
    { role: "assistant", content: "Which occasion is this card for?" },
  ]);
  const autoStarted = useRef(false);
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null); // { slug }
  const [copied, setCopied] = useState(false);

  const photoRef = useRef(null);
  const coverRef = useRef(null);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* Same redirect app/create/page.js does for itself: without this, an
     empty session just sat on `if (!ready || !session) return <Loading />`
     forever with nothing to ever move it off that screen — clicking a
     card on /greetings and landing on a stuck spinner was exactly this
     missing effect, not a slow request. */
  useEffect(() => {
    if (ready && !session) {
      const qs = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/login?redirect=${encodeURIComponent(`/greetings/create${qs}`)}`);
    }
  }, [ready, session, router]);

  const progress = greetingProgress(tokens);
  const step = STEPS[Math.max(stepIdx, 0)];

  function pickOccasion(o, fromChip = true) {
    setOccasion(o);
    setTokens(emptyGreetingTokens(o));
    setMessages((m) => (fromChip ? [...m, { role: "user", content: o.name }] : m).concat({
      role: "assistant",
      content: `A ${o.name.toLowerCase()} card — lovely. Who is it for?`,
    }));
    setStepIdx(0);
  }

  /* `?occasion=` arrives from the cards on /greetings — see comment above
     the state declarations for why this lives in an effect rather than in
     the initial state. */
  useEffect(() => {
    if (autoStarted.current || typeof window === "undefined") return;
    autoStarted.current = true;
    const slug = new URLSearchParams(window.location.search).get("occasion");
    const o = getOccasion(slug);
    if (o) pickOccasion(o, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function say(role, content) {
    setMessages((m) => [...m, { role, content }]);
  }

  function advance() {
    const text = input.trim();
    if (!text) return;

    if (step === "to") {
      setTokens((t) => ({ ...t, to: text.slice(0, 60) }));
      say("user", text);
      say("assistant", `And who is it from?`);
      setStepIdx(1);
    } else if (step === "from") {
      setTokens((t) => ({ ...t, from: text.slice(0, 60) }));
      say("user", text);
      say("assistant", `Here's a start for the message — keep it, or write your own:\n\n"${occasion?.greeting || ""}"`);
      setStepIdx(2);
    } else if (step === "message") {
      setTokens((t) => ({ ...t, message: text.slice(0, 600) }));
      say("user", text);
      say("assistant", verseQuestion());
      setStepIdx(STEP("verse"));
    }
    setInput("");
  }

  function useSuggestedMessage() {
    const text = occasion?.greeting || tokens.message || "";
    setTokens((t) => ({ ...t, message: text }));
    say("user", "Use that as it is.");
    say("assistant", verseQuestion());
    setStepIdx(STEP("verse"));
  }

  async function addPhoto(fileList) {
    const file = fileList?.[0];
    if (!file || !session?.user?.id) return;
    const problem = describeFile(file);
    if (problem) { setErr(problem); return; }
    setUploading(true);
    setErr("");
    try {
      const url = await uploadPhoto(file, session.user.id);
      setTokens((t) => ({ ...t, media: { ...t.media, photoUrl: url } }));
      say("assistant", "Got the photo — it'll sit inside the card.");
    } catch (e) {
      setErr(e.message || "That photo did not upload.");
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  async function addAudio(fileList) {
    const file = fileList?.[0];
    if (!file || !session?.user?.id) return;
    const problem = describeAudioFile(file);
    if (problem) { setErr(problem); return; }
    setUploading(true);
    setErr("");
    try {
      const url = await uploadAudio(file, session.user.id);
      setTokens((t) => ({ ...t, media: { ...t.media, musicUrl: url, musicTrackId: null, musicLabel: file.name } }));
      say("assistant", "Music added — it'll start when they open the card.");
    } catch (e) {
      setErr(e.message || "That track did not upload.");
    } finally {
      setUploading(false);
      if (audioRef.current) audioRef.current.value = "";
    }
  }

  function removeMedia(key) {
    setTokens((t) => ({ ...t, media: { ...t.media, [key]: null, ...(key === "musicUrl" ? { musicTrackId: null, musicLabel: null } : {}) } }));
  }

  /* ── Page one: the verse — theirs, or the occasion's own ── */
  const words = cardWords(occasion?.slug, occasion?.name);
  function verseQuestion() {
    return `Page one of the card has a little verse. This is the one we wrote for ${occasion?.name || "it"}:\n\n${words.title}\n${words.verse.join("\n")}\n\nKeep it, or write your own below.`;
  }
  function editVerse(patch) {
    setTokens((t) => ({ ...t, verse: { title: t.verse?.title || "", lines: t.verse?.lines || [], ...patch } }));
  }
  function confirmVerse(keep) {
    const own = (tokens.verse?.lines || []).some((l) => l.trim()) || tokens.verse?.title?.trim();
    if (keep || !own) {
      setTokens((t) => ({ ...t, verse: null }));
      say("user", "Keep that verse.");
    } else {
      say("user", [tokens.verse.title, ...(tokens.verse.lines || [])].filter((l) => l && l.trim()).join("\n"));
    }
    say("assistant", "Now choose a photo for the front of the card — or upload one of your own.");
    setStepIdx(STEP("cover"));
  }

  /* ── The cover photo ── */
  async function uploadCover(fileList) {
    const file = fileList?.[0];
    if (!file || !session?.user?.id) return;
    const problem = describeFile(file);
    if (problem) { setErr(problem); return; }
    setUploading(true);
    setErr("");
    try {
      const url = await uploadPhoto(file, session.user.id);
      setTokens((t) => ({ ...t, cover: { photoUrl: url } }));
    } catch (e) {
      setErr(e.message || "That photo did not upload.");
    } finally {
      setUploading(false);
      if (coverRef.current) coverRef.current.value = "";
    }
  }
  function confirmCover() {
    const c = tokens.cover;
    say("user", c?.photoUrl ? "My own photo" : c?.id ? (coverOptions(occasion?.slug).find((x) => x.id === c.id)?.alt || "That one") : "The first one is perfect");
    say("assistant", "Last bit of styling: the paper colour inside the card, the text colour and a font. Tap to try them on the preview.");
    setStepIdx(STEP("style"));
  }

  /* ── Inside the card: paper colour, text colour, font ── */
  function pickBackground(bg) {
    setTokens((t) => ({ ...t, background: bg ? { id: bg.id, from: bg.from, to: bg.to } : null }));
  }
  function pickLook(patch) {
    setTokens((t) => ({ ...t, style: { ...(t.style || {}), ...patch } }));
  }
  function confirmStyle() {
    const bg = tokens.background;
    const paper = !bg ? "Classic paper" : bg.id === "custom" ? "My own colours" : (BACKGROUNDS.find((b) => b.id === bg.id)?.name || "That colour");
    const ink = INKS.find((i) => i.id === tokens.style?.ink)?.name;
    const font = FONTS.find((f) => f.id === tokens.style?.font)?.name;
    say("user", [paper, ink && `${ink} text`, font && `${font} font`].filter(Boolean).join(", "));
    say("assistant", "You can add a photo or a little music if you'd like, or just publish it as is.");
    setStepIdx(STEP("extras"));
  }

  function goToReview() {
    say("assistant", "Your card is ready — pick a plan and publish it.");
    setStepIdx(STEP("done"));
  }

  async function publish() {
    if (!session?.user?.id) return;
    setPublishing(true);
    setErr("");
    try {
      const title = `A ${occasion?.name || "Greeting"} card for ${tokens.to || "someone lovely"}`;
      const { data: inv, error } = await supabase
        .from("invitations")
        .insert({
          owner_id: session.user.id,
          title,
          design_config: { v: 3, kind: "greeting", tokens },
          status: "published",
          plan,
        })
        .select()
        .single();
      if (error) throw error;

      /* No invitation_events insert — a greeting card has no guest list
         and nothing for anyone to RSVP to (Kevin's answer #2). */
      await supabase.from("payments").insert({
        invitation_id: inv.id, amount: PLANS[plan].price, currency: "INR",
        plan, status: "completed", provider: "demo",
      });

      setResult({ slug: inv.slug });
    } catch (e) {
      setErr(`Could not publish: ${e.message || "unknown error"}. If your Supabase project is paused, restore it and try again — your card is still here.`);
      setPublishing(false);
    }
  }

  function copyLink(url) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  if (!ready || !session) return <Loading />;

  const p = tokens.palette || {};
  const shareUrl = result ? `${SITE_URL}/g/${result.slug}` : "";
  /* The same message the card's link preview is written to sit under. */
  const waLink = result
    ? whatsappHref({ design_config: { kind: "greeting", tokens } }, shareUrl)
    : "";

  return (
    <>
      <Nav />
      <main style={{ background: C.paper, minHeight: "100vh" }}>
        <div className="ai-wrap">
          {/* ── Conversation ── */}
          <section className="ai-chat-col">
            <header style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(140deg, ${C.heart}, ${C.heartDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={15} color="#fff" />
                </span>
                <h1 className="display" style={{ fontSize: 24, margin: 0 }}>Make a greeting card</h1>
              </div>

              {occasion && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(140,123,112,.16)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%", width: `${progress}%`,
                        background: `linear-gradient(90deg, ${C.gold}, ${C.marigold})`,
                        borderRadius: 999, transition: "width .6s var(--ease)",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: ".08em", minWidth: 78, textAlign: "right" }}>
                    {progress}% · {occasion.name}
                  </span>
                </div>
              )}
            </header>

            {err && <Banner tone="err">{err}</Banner>}

            <div className="ai-thread" ref={scrollRef}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="chat-msg"
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background: m.role === "user" ? C.heart : "#fff",
                    color: m.role === "user" ? "#fff" : C.ink,
                    border: m.role === "user" ? "none" : `1px solid ${C.line}`,
                    borderRadius: m.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* Occasion chips — only while none is chosen yet. */}
            {stepIdx === -1 && (
              <div className="ai-chips">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.slug}
                    onClick={() => pickOccasion(o)}
                    style={{
                      border: `1px solid ${C.line}`, background: "#fff", borderRadius: 999,
                      padding: "8px 15px", fontSize: 12.5, color: C.ink, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            )}

            {result ? (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} color="#fff" />
                  </span>
                  <strong style={{ fontSize: 15 }}>Your card is live</strong>
                </div>

                <div className="g-done-link">
                  <span style={{ flex: 1 }}>{shareUrl}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyLink(shareUrl)} style={{ flexShrink: 0 }}>
                    <Copy size={13} /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>

<a href={waLink} target="_blank" rel="noreferrer" className="btn btn-lg" style={{ width: "100%", justifyContent: "center", textDecoration: "none", background: "#25D366", color: "#fff", border: "none", marginBottom: 8 }}>
                  <MessageCircle size={16} /> Send on WhatsApp
                </a>

                <a href={shareUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                  <ExternalLink size={16} /> Open the card
                </a>

                <a href="/greetings" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 8, textDecoration: "none" }}>
                  Make another card
                </a>
              </div>
            ) : step === "done" ? (
              <div className="card" style={{ padding: 18 }}>
                <div className="grid g3" style={{ gap: 8, marginBottom: 14 }}>
                  {Object.entries(PLANS).map(([k, pl]) => (
                    <button
                      key={k}
                      onClick={() => setPlan(k)}
                      style={{
                        cursor: "pointer", textAlign: "left", padding: "11px 12px", borderRadius: 12,
                        border: `2px solid ${plan === k ? C.heart : C.line}`,
                        background: plan === k ? "rgba(222,107,90,.06)" : "#fff",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 800 }}>{pl.label}</div>
                      <div className="display" style={{ fontSize: 19, color: C.heart, marginTop: 3 }}>{money(pl.price)}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11.5, color: C.muted, marginBottom: 12 }}>
                  <ShieldCheck size={14} color={C.green} /> Payment is simulated in this build — no card is charged.
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={publish} disabled={publishing}>
                  {publishing ? <><Loader2 size={16} className="spin" /> Publishing…</> : <><CreditCard size={16} /> Publish card</>}
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  onClick={() => setStepIdx(STEP("extras"))}
                  disabled={publishing}
                >
                  <RefreshCw size={13} /> Back
                </button>
              </div>
            ) : step === "verse" ? (
              <div className="g-verse-form">
                <input
                  type="text"
                  className="g-verse-title"
                  value={tokens.verse?.title || ""}
                  onChange={(e) => editVerse({ title: e.target.value.slice(0, 60) })}
                  placeholder={words.title}
                  aria-label="Title for page one"
                />
                <textarea
                  rows={5}
                  value={(tokens.verse?.lines || []).join("\n")}
                  onChange={(e) => editVerse({ lines: e.target.value.split("\n").slice(0, 8) })}
                  placeholder={words.verse.join("\n")}
                  aria-label="Your verse, one line per line"
                />
                <p className="g-verse-hint">Up to 8 short lines. Leave it empty to keep ours.</p>
                <div className="g-verse-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => confirmVerse(true)}>Keep the default</button>
                  <button type="button" className="btn btn-primary" onClick={() => confirmVerse(false)}>
                    Use my words <Send size={14} />
                  </button>
                </div>
              </div>
            ) : step === "cover" ? (
              <div className="g-bg-picker">
                <div className="g-cover-grid" role="radiogroup" aria-label="Cover photo">
                  {coverOptions(occasion?.slug).map((c, i) => {
                    const on = tokens.cover?.id ? tokens.cover.id === c.id : !tokens.cover && i === 0;
                    return (
                      <button
                        key={c.id} type="button" role="radio" aria-checked={on}
                        className={`g-cover ${on ? "is-on" : ""}`}
                        onClick={() => setTokens((t) => ({ ...t, cover: i === 0 ? null : { id: c.id } }))}
                        title={c.alt}
                      >
                        <img src={c.thumb} alt={c.alt} loading="lazy" />
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={`g-cover g-cover-upload ${tokens.cover?.photoUrl ? "is-on" : ""}`}
                    onClick={() => coverRef.current?.click()}
                    disabled={uploading}
                  >
                    {tokens.cover?.photoUrl
                      ? <img src={tokens.cover.photoUrl} alt="Your cover photo" />
                      : <span>{uploading ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}<b>Your own</b></span>}
                  </button>
                </div>
                <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => uploadCover(e.target.files)} />
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={confirmCover} disabled={uploading}>
                  Use this cover <Send size={14} />
                </button>
              </div>
            ) : step === "style" ? (
              <div className="g-bg-picker">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" />
                <p className="g-style-label">Paper colour</p>
                <div className="g-bg-grid" role="radiogroup" aria-label="Card background">
                  <button
                    type="button" role="radio" aria-checked={!tokens.background}
                    className={`g-bg-swatch is-light ${!tokens.background ? "is-on" : ""}`}
                    style={{ background: cardTheme(occasion?.slug, { name: occasion?.name }).paper || "#fbf6ee" }}
                    onClick={() => pickBackground(null)}
                  >
                    <span>Classic</span>
                  </button>
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b.id} type="button" role="radio" aria-checked={tokens.background?.id === b.id}
                      className={`g-bg-swatch ${tokens.background?.id === b.id ? "is-on" : ""} ${backgroundIsLight(b) ? "is-light" : ""}`}
                      style={{ background: backgroundCss(b) }}
                      onClick={() => pickBackground(b)}
                      title={b.name}
                    >
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>

                <div className="g-bg-custom">
                  <span className="g-bg-custom-label">Or mix your own</span>
                  <label className="g-bg-dot" title="Top colour">
                    <input
                      type="color"
                      value={tokens.background?.id === "custom" ? tokens.background.from : "#2a1236"}
                      onChange={(e) => pickBackground({ id: "custom", from: e.target.value, to: tokens.background?.id === "custom" ? tokens.background.to : "#c4776a" })}
                    />
                  </label>
                  <span className="g-bg-arrow" aria-hidden="true">→</span>
                  <label className="g-bg-dot" title="Bottom colour">
                    <input
                      type="color"
                      value={tokens.background?.id === "custom" ? tokens.background.to : "#c4776a"}
                      onChange={(e) => pickBackground({ id: "custom", from: tokens.background?.id === "custom" ? tokens.background.from : "#2a1236", to: e.target.value })}
                    />
                  </label>
                  {tokens.background?.id === "custom" && (
                    <span className="g-bg-preview" style={{ background: backgroundCss(tokens.background) }} aria-hidden="true" />
                  )}
                </div>

                <p className="g-style-label">Text colour</p>
                <div className="g-ink-row" role="radiogroup" aria-label="Text colour">
                  <button
                    type="button" role="radio" aria-checked={!tokens.style?.ink}
                    className={`g-ink g-ink-auto ${!tokens.style?.ink ? "is-on" : ""}`}
                    onClick={() => pickLook({ ink: null })}
                    title="Automatic"
                  >Auto</button>
                  {INKS.map((ink) => (
                    <button
                      key={ink.id} type="button" role="radio" aria-checked={tokens.style?.ink === ink.id}
                      className={`g-ink ${tokens.style?.ink === ink.id ? "is-on" : ""}`}
                      style={{ background: ink.hex }}
                      onClick={() => pickLook({ ink: ink.id })}
                      title={ink.name}
                      aria-label={ink.name}
                    />
                  ))}
                </div>

                <p className="g-style-label">Font</p>
                <div className="g-font-row" role="radiogroup" aria-label="Font">
                  {FONTS.map((f) => {
                    const on = (tokens.style?.font || "classic") === f.id;
                    return (
                      <button
                        key={f.id} type="button" role="radio" aria-checked={on}
                        className={`g-font ${on ? "is-on" : ""}`}
                        onClick={() => pickLook({ font: f.id })}
                      >
                        <span style={{ fontFamily: f.display, fontStyle: f.style, fontWeight: f.weight }}>Dear Anna</span>
                        <small>{f.name}</small>
                      </button>
                    );
                  })}
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={confirmStyle}>
                  Use this style <Send size={14} />
                </button>
              </div>
            ) : step === "extras" ? (
              <div>
                <div className="g-optional-row">
                  <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: `linear-gradient(140deg, ${C.heart}, ${C.heartDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Paperclip size={13} color="#fff" />
                  </span>
                  <div className="g-opt-label">
                    Photo {tokens.media.photoUrl && <span className="g-opt-sub">— added</span>}
                  </div>
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => addPhoto(e.target.files)} />
                  {tokens.media.photoUrl ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMedia("photoUrl")}><XIcon size={13} /></button>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => photoRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 size={14} className="spin" /> : "Add"}
                    </button>
                  )}
                </div>

                <div className="g-optional-row">
                  <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: `linear-gradient(140deg, ${C.peacock}, ${C.ink})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Music size={13} color="#fff" />
                  </span>
                  <div className="g-opt-label">
                    Music {tokens.media.musicLabel && <span className="g-opt-sub">— {tokens.media.musicLabel}</span>}
                  </div>
                  <input ref={audioRef} type="file" accept="audio/*" hidden onChange={(e) => addAudio(e.target.files)} />
                  {tokens.media.musicUrl ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMedia("musicUrl")}><XIcon size={13} /></button>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => audioRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 size={14} className="spin" /> : "Add"}
                    </button>
                  )}
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={goToReview} disabled={uploading}>
                  Continue <Send size={14} />
                </button>
              </div>
            ) : stepIdx >= 0 ? (
              <div className="ai-input-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") advance(); }}
                  placeholder={
                    step === "to" ? "Their name…" :
                    step === "from" ? "Your name…" :
                    "Write your message, or use the suggestion below…"
                  }
                  autoFocus
                />
                <button type="button" className="btn btn-primary" onClick={advance} disabled={!input.trim()}>
                  <Send size={15} />
                </button>
              </div>
            ) : null}

            {step === "message" && (
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={useSuggestedMessage}>
                <Sparkles size={13} /> Use the suggested message
              </button>
            )}
          </section>

          {/* ── Live preview ── */}
          <section className="ai-preview-col">
            <PhoneFrame
              statusColor={isDark(p.bg) ? "#fdf6ea" : "#1b1116"}
              statusBg="transparent"
              label="Card preview"
            >
              <GreetingCard tokens={tokens} preview focusPage={step === "cover" ? 0 : step === "verse" ? 1 : 2} />
            </PhoneFrame>
          </section>
        </div>
      </main>
    </>
  );
}
