"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Send, Loader2, Sparkles, Check, RefreshCw,
  CreditCard, ShieldCheck, AlertTriangle, Paperclip, Images, X as XIcon,
  Copy, ExternalLink, MessageCircle, Users, Music2, Palette, Lock,
} from "lucide-react";
import Nav from "@/components/Nav";
import PhoneFrame from "@/components/PhoneFrame";
import ChatDateField from "@/components/ChatDateField";
import MusicPicker from "@/components/MusicPicker";
import BackgroundPicker from "@/components/BackgroundPicker";
import TokenInvite from "@/components/TokenInvite";
import WeddingCinema from "@/components/WeddingCinema";
import CelebrationCinema from "@/components/CelebrationCinema";
import { isCinema } from "@/lib/design/wedding-tokens";
import { isCelebration } from "@/lib/design/celebration-tokens";
import { useAuth } from "@/components/AuthProvider";
import { Loading, Banner } from "@/components/ui";
import { C, money } from "@/lib/theme";
import { UnlockDialog, PriceSummary } from "@/components/AddonLock";
import { priceOf, ADDON_PRICE } from "@/lib/pricing";
import { payAndPublish, confirmPayment, resumePendingPayment } from "@/lib/checkout";
import { whatsappHref, SITE_URL, warmPreview } from "@/lib/share";
import { TEMPLATES } from "@/lib/templates/registry";
import { EVENT_TYPE_LIST, getEventType } from "@/lib/ai/event-types";
import { emptyDraft, draftToInvitation, draftToConfig } from "@/lib/ai/draft";
import { uploadPhotos, withPhotos, countPhotos, MAX_PHOTOS } from "@/lib/photos";

/* Perceived luminance — decides whether the phone status bar should be
   light or dark against whatever background the AI chose. */
function isDark(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

const OPENING = "Hello — I'll build your invitation with you. It'll fill in on the right as we talk.\n\nWhat are you celebrating? Anything at all: a wedding, a housewarming, a naming ceremony, a launch, a gig, a conference.";

/* Arriving from a card on the landing page should not mean answering a
   question you have already answered. `?event=` opens the conversation on
   the person's behalf, so the design moves before they type anything. */
const EVENT_OPENERS = {
  wedding: "It's a wedding.",
  engagement: "It's an engagement.",
  birthday: "It's a birthday.",
  housewarming: "It's a housewarming.",
  naming: "It's a naming ceremony.",
  baptism: "It's a baptism.",
  concert: "It's a concert.",
  conference: "It's a conference.",
  anniversary: "It's a wedding anniversary.",
  launch: "It's a product launch.",
  festival: "It's a music festival.",
  graduation: "It's a graduation.",
  retirement: "It's a retirement party.",
  reunion: "It's a reunion.",
  memorial: "It's a memorial service.",
};

/* Turn the AI's own schedule into the list guests respond to. The first
   `cards` section is the order of the day / line-up / programme, which is
   exactly the set of functions worth an RSVP. If there is no such section,
   one row stands for the whole event. Dates stay null: those columns are
   typed, and the readable time already lives in the invitation itself. */
function rsvpRowsFromTokens(tokens) {
  if (isCinema(tokens)) {
    const events = Array.isArray(tokens?.events) ? tokens.events : [];
    if (events.length) {
      return events.map((e) => ({
        name: String(e.name || e.title || "Wedding Ceremony").slice(0, 80),
        event_date: e.date || null,
        event_time: e.time || null,
        venue: String(e.venue || tokens?.venue?.name || "").slice(0, 160),
        address: String(e.address || tokens?.venue?.address || "").slice(0, 160),
      }));
    }
    const bride = tokens?.couple?.bride;
    const groom = tokens?.couple?.groom;
    return [{
      name: bride && groom ? `${bride} & ${groom}'s Wedding` : "Wedding Ceremony",
      event_date: null,
      event_time: null,
      venue: String(tokens?.venue?.name || "").slice(0, 160),
      address: String(tokens?.venue?.address || "").slice(0, 160),
    }];
  }

  /* Celebration Cinema (birthday/naming/housewarming and now anything
     else) already carries a real `events` array in the same shape as
     the wedding one above — a programme item, not a generic "card" —
     so it reads the same way rather than through the older `content`
     shape below, which this schema never had. */
  if (isCelebration(tokens)) {
    const events = Array.isArray(tokens?.events) ? tokens.events : [];
    if (events.length) {
      return events.map((e) => ({
        name: String(e.name || e.title || tokens?.invitation?.headline || "Celebration").slice(0, 80),
        event_date: e.date || null,
        event_time: e.time || null,
        venue: String(e.venue || tokens?.venue?.name || "").slice(0, 160),
        address: String(e.address || tokens?.venue?.address || "").slice(0, 160),
      }));
    }
    const label =
      tokens?.invitation?.headline ||
      (tokens?.host?.name ? `${tokens.host.name}'s Celebration` : "") ||
      (tokens?.eventKind ? tokens.eventKind.replace(/[-_]+/g, " ") : "Celebration");
    return [{
      name: label.charAt(0).toUpperCase() + label.slice(1),
      event_date: tokens?.invitation?.countdownAt ? tokens.invitation.countdownAt.slice(0, 10) : null,
      event_time: null,
      venue: String(tokens?.venue?.name || "").slice(0, 160),
      address: String(tokens?.venue?.address || "").slice(0, 160),
    }];
  }

  const sections = tokens?.content?.sections || [];
  const cards = sections.find((s) => s.type === "cards" && Array.isArray(s.items) && s.items.length);
  if (cards) {
    return cards.items.slice(0, 8).map((it) => ({
      name: String(it.heading || "Celebration").slice(0, 80),
      event_date: null,
      event_time: null,
      venue: String(it.body || "").slice(0, 160),
      address: "",
    }));
  }
  const only =
    tokens?.content?.headline ||
    (tokens?.eventKind ? tokens.eventKind.replace(/[-_]+/g, " ") : "") ||
    "Celebration";
  return [{
    name: only.charAt(0).toUpperCase() + only.slice(1),
    event_date: null, event_time: null,
    venue: String(tokens?.content?.place || "").slice(0, 160),
    address: "",
  }];
}

export default function CreatePage() {
  const { session, ready } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([{ role: "assistant", content: OPENING }]);
  const [draft, setDraft] = useState(emptyDraft(null));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  /* "Keep editing": the invitation was finished and the couple went back
     to change something. While this is on, a reply from the AI never
     re-opens the publish card by itself — they leave with "Done editing". */
  const [editing, setEditing] = useState(false);
  const editingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [templateReason, setTemplateReason] = useState("");
  // "text" | "date" | "datetime" — which control to show above the input
  // row for the question currently on screen. The server decides this: a
  // wedding step knows its own shape, and the celebration interview's own
  // model is asked to say so via `askField` on its patch (see route.js).
  const [askField, setAskField] = useState("text");
  // v2: the AI writes the design itself, as tokens. Empty until it does.
  const [tokens, setTokens] = useState({ design: {}, content: {}, eventKind: null });
  const generative = Boolean(tokens?.designed);
  const isWedding = tokens?.eventKind === "wedding" || draft.eventType === "wedding";
  const weddingMode = isCinema(tokens) || isWedding;
  const celebrationMode = isCelebration(tokens);
  // Both cinemas ask for photos scene by scene as the interview goes,
  // unlike the older plain renderer's "first photo = portrait" model —
  // this only distinguishes copy, not which component actually renders.
  const cinemaMode = weddingMode || celebrationMode;
  const [publishing, setPublishing] = useState(false);
  /* After payment: the live invitation { id, slug, title, design_config },
     shown with its link right here. `paidPending` is a payment that went
     through but has not published yet (lib/checkout.js). */
  const [published, setPublished] = useState(null);
  const [paidPending, setPaidPending] = useState(null);
  const [copied, setCopied] = useState(false);
  /* ₹25 add-ons unlocked for this invitation (lib/pricing.js). Kept
     apart from `tokens` so an AI turn can never drop or add one; merged
     in for the preview and when publishing. */
  const [addons, setAddons] = useState([]);
  const [unlocking, setUnlocking] = useState(null);
  const [extra, setExtra] = useState(null); // the open extras panel under the message box
  const afterUnlock = useRef(null);
  const can = (id) => addons.includes(id);
  /* Run `then` now if the add-on is unlocked, otherwise ask first and run
     it straight after (in the same tap, so a file picker may still open). */
  function requireAddon(id, then) {
    if (can(id)) { then?.(); return; }
    afterUnlock.current = then || null;
    setUnlocking(id);
  }
  function confirmUnlock(id) {
    setAddons((a) => (a.includes(id) ? a : [...a, id]));
    setUnlocking(null);
    const then = afterUnlock.current;
    afterUnlock.current = null;
    then?.();
  }

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const autoStarted = useRef(false);

  /* Counts both token shapes. It used to read only `content`, so on a
     wedding it reported nought photographs however many were in. */
  const photoCount = countPhotos(tokens);

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

  /* `?event=` comes from the cards on the landing page. Answer the opening
     question on their behalf so the design appears before they type — that
     first transformation is the moment the product sells itself. An
     unknown slug is still sent verbatim, because the model can design for
     an event this list has never heard of. */
  useEffect(() => {
    if (!ready || !session || autoStarted.current) return;
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("event");
    if (!raw) return;
    const slug = raw.toLowerCase().replace(/[^a-z -]/g, "").slice(0, 40).trim();
    if (!slug) return;
    autoStarted.current = true;
    const name = slug.replace(/-/g, " ");
    const article = /^[aeiou]/i.test(name) ? "an" : "a";
    send(EVENT_OPENERS[slug] || `It's ${article} ${name}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const templateSlug = draft.templateSlug || TEMPLATES[0].slug;
  const invitation = draftToInvitation(draft);
  const activeTemplate = TEMPLATES.find((t) => t.slug === templateSlug) || TEMPLATES[0];

  /* Photographs never travel through the model. They go straight to
     storage; only the resulting URL is written into the tokens, and the
     AI is simply told how many arrived so it can respond and title the
     gallery. */
  async function addPhotos(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length || uploading || busy) return;
    if (!session?.user?.id) { setErr("Please sign in again before adding photos."); return; }

    const room = MAX_PHOTOS + 1 - photoCount;
    if (room <= 0) { setErr(`That is the maximum of ${MAX_PHOTOS + 1} photos.`); return; }

    setErr("");
    setUploading(true);
    try {
      const { urls, errors } = await uploadPhotos(files.slice(0, room), session.user.id);
      if (urls.length) {
        /* Compute the new tokens and hand them to send() explicitly.
           setTokens() does not apply until the next render, so a plain
           send() here would post the pre-upload tokens — and the reply
           would overwrite state with a version that has no photos. The
           customer would watch their pictures appear and then vanish. */
        const next = withPhotos(tokens, urls);
        setTokens(next);
        const n = urls.length;
        send(`[Added ${n} photo${n === 1 ? "" : "s"}]`, next);
      }
      if (errors.length) setErr(errors.join(" "));
      else if (files.length > room) setErr(`Only the first ${room} were added — that is the limit.`);
    } catch (e) {
      setErr(e.message || "Those photos could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /* The "Background music" picker (components/MusicPicker.js) writes
     straight onto tokens.media, the same as photos — the model never
     asks about or knows which track is playing. */
  function chooseMusic(choice) {
    setTokens((t) => ({ ...t, media: { ...(t.media || {}), ...choice } }));
  }

  /* The background gradient (components/BackgroundPicker.js) is the
     same: written onto tokens.background from the browser, never by the
     model, and the preview repaints at once. */
  function chooseBackground(bg) {
    setTokens((t) => {
      const next = { ...t };
      if (bg) next.background = bg; else delete next.background;
      return next;
    });
  }

  function startEditing() {
    editingRef.current = true;
    setEditing(true);
    setDone(false);
    setErr("");
    setAskField("text");
    const isWed = isCinema(tokens) || tokens?.eventKind === "wedding";
    const first = (tokens?.events || []).find((e) => e.id !== "ceremony")?.name || "haldi";
    setMessages((m) => [...m, {
      role: "assistant",
      content: isWed
        ? `Of course — what would you like to change? For example “change the date to 14 February 2027”, “move the ${first} to 11 am”, “add a sangeet”, “change the venue”, “make the message warmer”, or “the bride's name is Priya”. Photos, music and the background colour are in the options below.\n\nWhen you are happy, tap “Done editing”.`
        : "Of course — what would you like to change? Tell me in your own words (the date, the venue, the names, the wording…). Photos, music and the background colour are in the options below.\n\nWhen you are happy, tap “Done editing”.",
    }]);
    setTimeout(() => inputRef.current?.focus?.(), 50);
  }

  function stopEditing(latest) {
    editingRef.current = false;
    setEditing(false);
    /* Drop any half-asked change so it cannot leak into the saved page. */
    setTokens((t) => {
      const base = latest || t;
      if (!base?._edit) return base;
      const n = { ...base };
      delete n._edit;
      return n;
    });
    setAskField("text");
    setDone(true);
  }

  /* Draw the WhatsApp preview picture now, before the link is pasted. */
  useEffect(() => { if (published?.slug) warmPreview(`/i/${published.slug}`); }, [published?.slug]);

  async function send(text, tokensOverride) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    // See addPhotos(): state set in the same tick is not readable yet.
    const outgoing = tokensOverride || tokens;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setErr("");
    setAskField("text");

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          tokens: outgoing,
          turnCount: messages.filter((m) => m.role === "user").length,
          editing: editingRef.current,
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
      if (editingRef.current) {
        /* They said "done" / "looks good" — back to the publish card. */
        if (data.finished) stopEditing(data.tokens);
        else setDone(false);
      } else {
        setDone(Boolean(data.done));
      }
      setAskField(["date", "datetime"].includes(data.askField) ? data.askField : "text");

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
      /* v2 stores the design itself. The guest page renders these with the
         same lib/design/renderer used in the preview, so what they approve
         is exactly what guests see. */
      const isCin = isCinema(tokens);
      const isCel = isCelebration(tokens);
      const cinemaTitle = tokens.couple?.bride && tokens.couple?.groom
        ? `${tokens.couple.bride} & ${tokens.couple.groom}'s Wedding`
        : "Wedding Invitation";
      const celebrationTitle =
        tokens.invitation?.headline ||
        (tokens.host?.name ? `${tokens.host.name}'s Celebration` : "") ||
        "Celebration Invitation";
      const paidTokens = { ...tokens, addons };
      const cfg = generative
        ? { v: 2, tokens: paidTokens, eventKind: tokens.eventKind || (isCin ? "wedding" : null) }
        : draftToConfig(draft, templateSlug);
      const title = (generative
        ? (isCin ? cinemaTitle : isCel ? celebrationTitle : tokens.content?.headline)
        : cfg.headline) || "Invitation";

      /* The functions guests RSVP to.

         For v2 these must come from what the AI actually captured. The
         legacy path runs draftToInvitation(), which falls back to
         DEMO_INVITATION.events when the draft is empty — and in the
         generative flow the draft is always empty, so EVERY published
         invitation was silently given the demo wedding's four functions.
         An engagement was asking guests to RSVP to a Mehendi. */
      const events = generative
        ? rsvpRowsFromTokens(tokens)
        : invitation.events.map((e) => ({
            name: e.name || "Celebration",
            event_date: e.date || null,
            event_time: e.time || null,
            venue: e.venue || "",
            address: e.address || "",
          }));

      /* Razorpay first; the server publishes only once the payment is
         verified (lib/checkout.js → app/api/payments/confirm). */
      const inv = await payAndPublish({
        session, kind: "invitation", addons, title, design_config: cfg, events,
        description: title,
      });

      setPaidPending(null);
      setPublished({ ...inv, title, design_config: cfg });
      setPublishing(false);
    } catch (e) {
      publishFailed(e);
    }
  }

  function publishFailed(e) {
    if (e.pending) {
      setPaidPending(e.pending);
      setErr(`Your payment went through, but the invitation is not published yet: ${e.message} Tap "Finish publishing" — you will not be charged again.`);
    } else if (!e.cancelled) {
      setErr(`Could not publish: ${e.message || "unknown error"} Your answers are still here.`);
    }
    setPublishing(false);
  }

  async function finishPublishing() {
    if (!paidPending) return;
    setPublishing(true);
    setErr("");
    try {
      const inv = await confirmPayment(session, paidPending);
      setPaidPending(null);
      setPublished({ ...inv, title: "", design_config: { v: 2, tokens } });
      setPublishing(false);
    } catch (e) {
      publishFailed(e);
    }
  }

  /* Came back after paying (a reload, a closed tab) before the invitation
     was published? Finish it now and show the link. */
  useEffect(() => {
    if (!session?.access_token) return;
    resumePendingPayment(session, "invitation")
      .then((inv) => { if (inv) setPublished({ ...inv, title: "", design_config: null }); })
      .catch((e) => { if (e.pending) publishFailed(e); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  function copyLink(url) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
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
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(140deg, ${C.heart}, ${C.heartDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={15} color="#fff" />
                </span>
                <h1 className="display" style={{ fontSize: 24, margin: 0 }}>Build your invitation</h1>
              </div>

              {/* progress — the API already returns 0–100, so multiplying
                  by 100 again pinned the bar at 3100% and it read as full
                  from the first answer onwards. */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(140,123,112,.16)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", width: `${Math.max(0, Math.min(100, Math.round(progress)))}%`,
                      background: `linear-gradient(90deg, ${C.gold}, ${C.marigold})`,
                      borderRadius: 999, transition: "width .6s var(--ease)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: ".08em", minWidth: 78, textAlign: "right" }}>
                  {eventType ? `${Math.max(0, Math.min(100, Math.round(progress)))}% · ${eventType.label}` : "Getting started"}
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

              {busy && (
                <div className="chat-msg" style={{ alignSelf: "flex-start", background: "#fff", border: `1px solid ${C.line}`, borderRadius: "18px 18px 18px 5px", display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              )}
            </div>

            {/* Event-type chips only until the type is known. */}
            {!draft.eventType && !busy && (
              <div className="ai-chips">
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

            {published ? (() => {
              const link = `${SITE_URL}/i/${published.slug}`;
              return (
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={14} color="#fff" />
                    </span>
                    <strong style={{ fontSize: 15 }}>Paid — your invitation is live</strong>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Share this link with your guests. It is also saved in your dashboard.</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px 10px 9px 13px", marginBottom: 10, background: "#fff" }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyLink(link)} style={{ flexShrink: 0 }}>
                      <Copy size={13} /> {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <a href={whatsappHref({ title: published.title, slug: published.slug, design_config: published.design_config || {} }, link)} target="_blank" rel="noreferrer" className="btn btn-lg" style={{ width: "100%", justifyContent: "center", textDecoration: "none", background: "#25D366", color: "#fff", border: "none", marginBottom: 8 }}>
                    <MessageCircle size={16} /> Send on WhatsApp
                  </a>
                  <a href={link} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", textDecoration: "none", marginBottom: 8 }}>
                    <ExternalLink size={16} /> Open the invitation
                  </a>
                  <a href={`/manage/${published.id}`} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                    <Users size={13} /> Manage RSVPs
                  </a>
                </div>
              );
            })() : done ? (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} color="#fff" />
                  </span>
                  <strong style={{ fontSize: 15 }}>Your invitation is ready</strong>
                </div>

                <PriceSummary addons={addons} onAdd={(k) => requireAddon(k)} kindLabel="Invitation" />

                <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11.5, color: C.muted, marginBottom: 12 }}>
                  <ShieldCheck size={14} color={C.green} /> Secure payment by Razorpay — UPI, cards, netbanking and wallets.
                </div>

                {err && (
                  <div role="alert" style={{ fontSize: 12.5, lineHeight: 1.5, color: "#9b2c1f", background: "#fdecea", border: "1px solid #f5c2bb", borderRadius: 10, padding: "9px 11px", marginBottom: 10 }}>
                    {err}
                  </div>
                )}

                {paidPending && (
                  <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} onClick={finishPublishing} disabled={publishing}>
                    {publishing ? <><Loader2 size={16} className="spin" /> Publishing…</> : <><RefreshCw size={16} /> Finish publishing</>}
                  </button>
                )}

                {!paidPending && (
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={publish} disabled={publishing}>
                  {publishing
                    ? <><Loader2 size={16} className="spin" /> Publishing…</>
                    : <><CreditCard size={16} /> Pay {money(priceOf({ addons }))} &amp; publish</>}
                </button>
                )}

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  onClick={startEditing}
                  disabled={publishing}
                >
                  <RefreshCw size={13} /> Keep editing
                </button>
              </div>
            ) : (
              <div>
                {!busy && !uploading && (askField === "date" || askField === "datetime") && (
                  <ChatDateField
                    withTime={askField === "datetime"}
                    onConfirm={(text) => { setAskField("text"); send(text); }}
                  />
                )}

                {editing && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.green}`, background: "#f3fbf6", borderRadius: 14, padding: "10px 12px", marginBottom: 10 }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
                      <strong>Editing.</strong> Tell me what to change — the preview updates as you go.
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => stopEditing()}
                      disabled={busy || uploading}
                      style={{ flexShrink: 0 }}
                    >
                      <Check size={14} /> Done editing
                    </button>
                  </div>
                )}

                <div className="ai-input-row">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={(e) => addPhotos(e.target.files)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => requireAddon("photos", () => fileRef.current?.click())}
                    disabled={busy || uploading}
                    aria-label="Add photos"
                    title="Add photos"
                    style={{ padding: "12px 13px", flexShrink: 0 }}
                  >
                    {uploading ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
                  </button>

                  <input
                    ref={inputRef}
                    placeholder={
                      uploading ? "Uploading your photos…"
                      : editing ? "What would you like to change?"
                      : (askField === "date" || askField === "datetime") ? "Or type the date yourself…"
                      : draft.eventType ? "Type your answer…"
                      : "Tell me what you're celebrating…"
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    disabled={busy || uploading}
                    style={{ flex: 1, minWidth: 0, padding: "13px 16px", border: `1px solid ${C.line}`, borderRadius: 13, fontSize: 14.5, outline: "none", fontFamily: "inherit", background: "#fff" }}
                  />
                  <button className="btn btn-primary" onClick={() => send()} disabled={busy || uploading || !input.trim()} aria-label="Send" style={{ flexShrink: 0 }}>
                    <Send size={15} />
                  </button>
                </div>

                {/* The card above already covers this for a cinema
                    invitation (wedding or celebration) — this stays only
                    for the older plain-renderer flow, which has no such
                    card. */}
                {/* The ₹25 extras — photos, music, background — sit UNDER the
                    message box as one compact row, so the chat runs straight
                    into the box you type in. A tap opens that extra's panel
                    (or offers to unlock it first). */}
                {cinemaMode && (
                  <div className="ai-extras">
                    <div className="ai-extras-row" role="tablist" aria-label="Extras">
                      {[
                        ["photos", Images, "Photos", photoCount ? `${photoCount} added` : null],
                        ["music", Music2, "Music", tokens?.media?.musicUrl || tokens?.media?.musicTrackId ? "Chosen" : null],
                        ["colour", Palette, "Background", tokens?.background ? "Chosen" : null],
                      ].map(([id, Icon, label, state]) => {
                        const unlocked = can(id);
                        const on = extra === id && unlocked;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            className={`ai-extra ${on ? "on" : ""} ${unlocked ? "" : "locked"}`}
                            disabled={busy || uploading}
                            onClick={() => (unlocked ? setExtra(on ? null : id) : requireAddon(id, () => setExtra(id)))}
                          >
                            <Icon size={14} />
                            <span className="ai-extra-l">{label}</span>
                            {unlocked
                              ? <span className="ai-extra-s">{state ? <><Check size={11} /> {state}</> : "Add"}</span>
                              : <span className="ai-extra-p"><Lock size={10} /> {money(ADDON_PRICE)}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {extra === "photos" && can("photos") && (
                      <div className="ai-extra-panel">
                    <div
                      style={{
                        border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 14px",
                        marginBottom: 10, background: "#fff",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                          background: `linear-gradient(140deg, ${C.heart}, ${C.heartDeep})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Images size={13} color="#fff" />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>
                          Photos {photoCount ? `(${photoCount}/${MAX_PHOTOS + 1})` : ""}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {photoCount
                            ? "Each one goes to the scene I asked it for — add more any time."
                            : "I will ask for these as we go, or add them yourself whenever you like."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => requireAddon("photos", () => fileRef.current?.click())}
                        disabled={busy || uploading}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                          border: `1.5px solid ${C.line}`, background: "#fff", borderRadius: 999,
                          padding: "8px 14px", fontSize: 12, fontWeight: 700, color: C.heart,
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {uploading ? <Loader2 size={14} className="spin" /> : <Paperclip size={14} />}
                        {uploading ? "Uploading…" : photoCount ? "Add more" : "Add photos"}
                      </button>
                    </div>
                      </div>
                    )}
                    {extra === "music" && can("music") && (
                      <div className="ai-extra-panel">
                        <MusicPicker
                          tokens={tokens}
                          eventKind={tokens?.eventKind || draft.eventType}
                          userId={session?.user?.id}
                          onChoose={chooseMusic}
                          disabled={busy || uploading}
                        />
                      </div>
                    )}
                    {extra === "colour" && can("colour") && (
                      <div className="ai-extra-panel">
                        <BackgroundPicker
                          tokens={tokens}
                          onChoose={chooseBackground}
                          disabled={busy || uploading}
                          wedding={weddingMode}
                        />
                      </div>
                    )}
                  </div>
                )}

                {!cinemaMode && (
                  <div style={{ marginTop: 8, fontSize: 11.5, color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>
                    <Paperclip size={11} />
                    {photoCount
                      ? `${photoCount} photo${photoCount === 1 ? "" : "s"} added — the first is the portrait at the top.`
                      : "You can add photos at any time. The first becomes the portrait."}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Live preview ── */}
          <aside className="ai-preview-col">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhoneFrame
                width={296}
                height={604}
                statusColor={generative && !cinemaMode && isDark(tokens.design?.palette?.bg) ? "rgba(255,255,255,.9)" : "rgba(20,16,14,.85)"}
                label="Live invitation preview"
              >
                {generative ? (
                  weddingMode ? (
                    <WeddingCinema tokens={{ ...tokens, addons }} preview />
                  ) : celebrationMode ? (
                    <CelebrationCinema tokens={{ ...tokens, addons }} preview />
                  ) : (
                    <TokenInvite tokens={tokens} />
                  )
                ) : (
                  /* Nothing is designed until the user says something. Showing a
                     stock invitation here was the single most misleading thing on
                     the page — it implied a template they would be editing. */
                  <div style={{
                    height: "100%", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 14,
                    padding: 30, textAlign: "center", background: "#faf7f2",
                  }}>
                    <Sparkles size={22} style={{ color: C.gold, opacity: .8 }} />
                    <div style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 1.7, color: C.muted }}>
                      Your invitation appears here,<br />designed around your answers.
                    </div>
                  </div>
                )}
              </PhoneFrame>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
                {generative
                  ? "Designed for your event as you talk. Say \u201cwarmer\u201d, \u201cless pink\u201d or \u201cbigger names\u201d and it will change."
                  : "No templates \u2014 the design is written for your event once you describe it."}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <UnlockDialog id={unlocking} onConfirm={confirmUnlock} onClose={() => { afterUnlock.current = null; setUnlocking(null); }} />

      {/* Responsive styles for the chat layout are in app/responsive.css */}
    </>
  );
}
