"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X, Send, Loader2, Heart, HelpCircle } from "lucide-react";
import TemplateRenderer, { paletteOf } from "@/components/TemplateRenderer";
import { supabase } from "@/lib/supabase";
import { Loading, Empty } from "@/components/ui";
import { C } from "@/lib/theme";

/* ══════════════════════════════════════════════════════════════════════
   THE GUEST PAGE — one link, shared with everybody.

   This used to be a per-person URL: a row in `guests` for every invitee,
   each with its own token, and the couple sending a different link to
   each of them. Nobody shares an invitation that way — one link goes into
   the family group and travels from there. So the address is now the
   invitation's own slug, and everyone holding it sees the same page.

   Which means we no longer know who is reading, so the RSVP asks. The
   stepper collects the name and number the `guests` row used to hold,
   from the person actually replying:

     1. yes / maybe / no
     2. name, number, email (optional)
     3. a blessing for the couple, then send

   Old per-guest links still resolve: if the code in the URL is not a
   slug, it is looked up as a guest token and shows the same invitation.
   ══════════════════════════════════════════════════════════════════════ */

/* Relative luminance, for deciding whether a colour needs light or dark
   text on top of it. */
function lumOf(h) {
  const v = String(h || "").replace("#", "");
  const x = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  if (x.length < 6) return 0;
  const n = parseInt(x.slice(0, 6), 16);
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}

function contrastOf(a, b) {
  const la = lumOf(a), lb = lumOf(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function skinOf(cfg, p) {
  const d = cfg?.v === 2 ? cfg.tokens?.design : null;
  const bg = p[2], deep = p[0], accent = p[1], ink = p[3], muted = p[4], surface = p[5] || p[2];
  const dark = lumOf(bg) < 0.5;
  /* A filled button needs ink that actually reads on it. Choosing by
     "is it dark?" fails on mid-tones: gold and orange both landed at
     2.9:1 either way. Take whichever is better, and if even that is weak,
     fill with `deep` instead — that colour exists precisely to carry
     text. */
  const best = (on) => (contrastOf("#ffffff", on) >= contrastOf("#14100f", on) ? "#ffffff" : "#14100f");
  const accentInk = best(accent);
  const useDeepForFill = contrastOf(accentInk, accent) < 4;
  const fill = useDeepForFill ? deep : accent;
  const onFill = useDeepForFill ? best(deep) : accentInk;

  return {
    bg, surface, ink, muted, accent, deep,
    fill, onFill,
    onDeep: best(deep),
    onAccent: onFill,
    dark,
    line: dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.12)",
    fieldBg: dark ? "rgba(255,255,255,.06)" : "#fff",
    display: d?.fonts?.display || "'Marcellus', Georgia, serif",
    body: d?.fonts?.body || "inherit",
    radius: d?.corner === "sharp" ? "2px" : "12px",
    pill: d?.corner === "sharp" ? "2px" : "999px",
  };
}

const CHOICES = [
  { key: "yes",   mark: <Check size={20} />,      title: "Yes",   sub: "Joyfully",      line: "We will be there" },
  { key: "maybe", mark: <HelpCircle size={20} />, title: "Maybe", sub: "Still confirming", line: "We will let you know" },
  { key: "no",    mark: <X size={20} />,          title: "No",    sub: "Regretfully",   line: "Sending our love" },
];

const EMPTY_FORM = { status: "", name: "", phone: "", email: "", party_size: 1, blessing: "" };

export default function GuestPage() {
  /* The folder is still [token]; the value is now normally an invitation
     slug, so `code` reads more honestly for a public address. */
  const { token: code } = useParams();

  const [inv, setInv] = useState(null);
  const [events, setEvents] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [greeting, setGreeting] = useState("");   // legacy per-guest links only

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");

  const loadWishes = useCallback(async (invitationId) => {
    const { data } = await supabase
      .from("invitation_wishes")
      .select("name, blessing, created_at")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false })
      .limit(40);
    setWishes(data || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        /* The link is the slug. Fall back to the old guest token so that
           anything already sent out keeps working. */
        let { data: i } = await supabase
          .from("invitations").select("*").eq("slug", code).maybeSingle();

        if (!i) {
          const { data: g } = await supabase
            .from("guests").select("id, name, invitation_id").eq("token", code).maybeSingle();
          if (g) {
            setGreeting(g.name || "");
            const r = await supabase.from("invitations").select("*").eq("id", g.invitation_id).maybeSingle();
            i = r.data;
            supabase.from("guests").update({ viewed_at: new Date().toISOString() }).eq("id", g.id).then(() => {});
          }
        }

        if (!i) { setErr("This invitation link isn't valid."); return; }
        setInv(i);

        const { data: e } = await supabase
          .from("invitation_events").select("*").eq("invitation_id", i.id).order("sort_order");
        setEvents(e || []);
        await loadWishes(i.id);
      } catch {
        setErr("Something went wrong loading this invitation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [code, loadWishes]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* A guest seeing "We could not save that" learns nothing, and neither
     does whoever they complain to — the first time this fired it took a
     database query to discover the table simply was not there. Postgres
     already says why; these translate the three causes that can actually
     reach a guest and log the rest for us. */
  const explain = (error) => {
    const code = String(error?.code || "");
    const msg = String(error?.message || "");
    if (code === "42P01" || /does not exist/i.test(msg)) {
      return "RSVPs are not switched on for this invitation yet. Please let the couple know.";
    }
    if (code === "42501" || /row-level security|permission denied/i.test(msg)) {
      return "This invitation is not open for replies yet. Please let the couple know.";
    }
    if (code === "23514") {
      return "That does not look right — please check the number of guests and try again.";
    }
    if (/fetch|network|Failed to fetch/i.test(msg)) {
      return "We could not reach the server. Check your connection and try again.";
    }
    return "We could not save that. Please try again.";
  };

  const submit = async () => {
    setSending(true);
    setSendErr("");
    try {
      const { error } = await supabase.from("guest_responses").insert({
        invitation_id: inv.id,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        status: form.status || "yes",
        party_size: Math.max(1, Math.min(50, Number(form.party_size) || 1)),
        blessing: form.blessing.trim() || null,
      });
      if (error) {
        console.error("[rsvp] insert failed", error);
        setSendErr(explain(error));
        return;
      }
      setDone(true);
      await loadWishes(inv.id);
    } catch (e) {
      console.error("[rsvp] insert threw", e);
      setSendErr(explain(e));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loading label="Opening your invitation…" />;
  if (err) return <Empty title={err} sub="Please check the link you were sent, or ask the host to resend it." />;

  /* [heading, accent, background, ink, muted, surface] — taken from the
     design itself so the RSVP block below the invitation is part of the
     same object, not a cream form stapled to a black poster. */
  const p = paletteOf(inv?.design_config, [C.maroon, C.gold, C.ivory, C.ink, C.muted, "#fff"]);
  const skin = skinOf(inv?.design_config, p);
  const tokens = inv?.design_config?.tokens;
  const rsvpNote =
    tokens?.rsvp?.note ||
    (tokens?.rsvp?.deadline ? `Kindly reply by ${tokens.rsvp.deadline}.` : "");

  const canContinue = step === 1 ? Boolean(form.status) : step === 2 ? form.name.trim().length > 1 : true;

  return (
    <div style={{ background: skin.bg, minHeight: "100vh" }}>
      <style>{`
        .rsvp{font-family:${skin.body}}
        .rsvp-orn{display:flex;align-items:center;justify-content:center;gap:13px;
          width:min(230px,64%);margin:0 auto 24px}
        .rsvp-orn i{flex:1;height:1px;background:${skin.line}}
        .rsvp-orn b{color:${skin.accent};font-size:12px;font-weight:400;line-height:1}
        .rsvp-h{font-family:${skin.display};font-weight:500;font-size:27px;text-align:center;
          color:${skin.ink};margin:0 0 8px}
        .rsvp-sub{text-align:center;color:${skin.muted};font-size:13.5px;line-height:1.65;margin:0 0 26px}

        .rsvp-steps{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 14px}
        .rsvp-step{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;
          justify-content:center;font-size:12px;font-weight:700;border:1px solid ${skin.line};
          color:${skin.muted};background:transparent;transition:.3s}
        .rsvp-step.on{background:${skin.fill};border-color:${skin.fill};color:${skin.onFill}}
        .rsvp-step.past{border-color:${skin.accent};color:${skin.accent}}
        .rsvp-steprule{width:26px;height:1px;background:${skin.line}}
        .rsvp-legend{text-align:center;font-size:10px;letter-spacing:.22em;text-transform:uppercase;
          color:${skin.muted};margin:0 0 22px}

        .rsvp-card{background:${skin.fieldBg};border:1px solid ${skin.line};border-radius:${skin.radius};
          padding:18px 18px 20px}
        .rsvp-choice{display:flex;flex-direction:column;gap:11px}
        .rsvp-opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;
          padding:15px 17px;border-radius:${skin.radius};cursor:pointer;
          border:1px solid ${skin.line};background:${skin.fieldBg};color:${skin.ink};
          font-family:inherit;transition:border-color .25s,background .25s,transform .2s}
        .rsvp-opt:hover{border-color:${skin.accent};transform:translateY(-1px)}
        .rsvp-opt.on{border-color:${skin.fill};background:${skin.fill};color:${skin.onFill}}
        .rsvp-opt .ic{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;
          align-items:center;justify-content:center;border:1px solid currentColor;opacity:.9}
        .rsvp-opt b{display:block;font-size:16px;font-weight:600;line-height:1.2}
        .rsvp-opt em{display:block;font-size:12px;font-style:normal;opacity:.75;margin-top:2px}

        .rsvp-field{margin-top:16px}
        .rsvp-card>.rsvp-field:first-child{margin-top:0}
        .rsvp-field label{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;
          color:${skin.muted};margin-bottom:7px}
        .rsvp-field input,.rsvp-field textarea{width:100%;padding:13px 15px;border-radius:${skin.radius};
          border:1px solid ${skin.line};background:${skin.fieldBg};color:${skin.ink};
          font-size:15px;font-family:inherit;outline:none;transition:border-color .2s}
        .rsvp-field input:focus,.rsvp-field textarea:focus{border-color:${skin.accent}}
        .rsvp-field ::placeholder{color:${skin.muted};opacity:.8}
        .rsvp-row{display:flex;gap:12px}
        .rsvp-row>*{flex:1;min-width:0}

        .rsvp-actions{display:flex;gap:10px;margin-top:22px}
        .rsvp-send{flex:1;padding:16px 20px;border:none;cursor:pointer;border-radius:${skin.pill};
          background:${skin.fill};color:${skin.onFill};font-size:14px;font-weight:700;
          font-family:inherit;display:inline-flex;align-items:center;
          justify-content:center;gap:9px;transition:transform .2s,box-shadow .3s}
        .rsvp-send:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 32px rgba(0,0,0,.24)}
        .rsvp-send:disabled{opacity:.45;cursor:not-allowed}
        .rsvp-back{padding:16px 20px;border-radius:${skin.pill};cursor:pointer;font-family:inherit;
          background:transparent;border:1px solid ${skin.line};color:${skin.muted};font-size:14px}
        .rsvp-fine{text-align:center;font-size:11.5px;color:${skin.muted};margin-top:18px;line-height:1.6}
        .rsvp-err{text-align:center;font-size:13px;color:#e06a5c;margin-top:14px}

        .wish-list{display:flex;flex-direction:column;gap:12px}
        .wish{background:${skin.fieldBg};border:1px solid ${skin.line};border-radius:${skin.radius};
          padding:15px 17px;margin:0}
        .wish p{margin:0 0 8px;font-family:${skin.display};font-size:15.5px;line-height:1.6;
          color:${skin.ink};font-style:italic}
        .wish figcaption{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${skin.accent}}
        .wish-empty{text-align:center;color:${skin.muted};font-size:13.5px;line-height:1.7;padding:18px 10px}
      `}</style>

      <div style={{ maxWidth: 500, margin: "0 auto", background: p[2], minHeight: "100vh", boxShadow: "0 0 80px rgba(27,17,22,.12)" }}>
        <div style={{ animation: "msgIn 1s var(--ease) both" }}>
          <TemplateRenderer cfg={inv?.design_config} events={events} guestName={greeting} />
        </div>

        {/* ── RSVP ── */}
        <div className="rsvp" style={{ padding: "10px 26px 44px", background: skin.bg }}>
          <div className="rsvp-orn"><i /><b>&#10047;</b><i /></div>

          {!done ? (
            <>
              <h2 className="rsvp-h">Will you celebrate with us?</h2>
              <p className="rsvp-sub">
                {rsvpNote || "Let us know if you can make it, so we can keep a place for you."}
              </p>

              <div className="rsvp-steps">
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {n > 1 && <i className="rsvp-steprule" />}
                    <div className={`rsvp-step ${step === n ? "on" : step > n ? "past" : ""}`}>{n}</div>
                  </div>
                ))}
              </div>
              <p className="rsvp-legend">
                {step === 1 ? "Response" : step === 2 ? "Your details" : "A blessing"}
              </p>

              {step === 1 && (
                <div className="rsvp-choice">
                  {CHOICES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={`rsvp-opt ${form.status === c.key ? "on" : ""}`}
                      onClick={() => { set("status", c.key); setStep(2); }}
                    >
                      <span className="ic">{c.mark}</span>
                      <span>
                        <b>{c.title}</b>
                        <em>{c.sub} · {c.line}</em>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="rsvp-card">
                  <div className="rsvp-field">
                    <label htmlFor="g-name">Your name</label>
                    <input
                      id="g-name" value={form.name} autoComplete="name"
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="So the couple know who replied"
                    />
                  </div>
                  <div className="rsvp-field">
                    <label htmlFor="g-phone">Phone number</label>
                    <input
                      id="g-phone" value={form.phone} inputMode="tel" autoComplete="tel"
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="In case they need to reach you"
                    />
                  </div>
                  <div className="rsvp-row">
                    <div className="rsvp-field">
                      <label htmlFor="g-email">Email (optional)</label>
                      <input
                        id="g-email" value={form.email} type="email" autoComplete="email"
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    {form.status !== "no" && (
                      <div className="rsvp-field">
                        <label htmlFor="g-party">How many of you</label>
                        <input
                          id="g-party" value={form.party_size} type="number" min={1} max={50}
                          onChange={(e) => set("party_size", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="rsvp-card">
                  <div className="rsvp-field">
                    <label htmlFor="g-bless">A blessing or a note</label>
                    <textarea
                      id="g-bless" rows={4} value={form.blessing}
                      onChange={(e) => set("blessing", e.target.value)}
                      placeholder="Wishing you a lifetime of love and laughter…"
                    />
                  </div>
                  <p className="rsvp-fine" style={{ textAlign: "left", marginTop: 12 }}>
                    Your message appears further down this page for other guests to read.
                    Leave it empty if you would rather not.
                  </p>
                </div>
              )}

              <div className="rsvp-actions">
                {step > 1 && (
                  <button type="button" className="rsvp-back" onClick={() => setStep(step - 1)}>
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button" className="rsvp-send" disabled={!canContinue}
                    onClick={() => setStep(step + 1)}
                  >
                    Continue
                  </button>
                ) : (
                  <button type="button" className="rsvp-send" disabled={sending} onClick={submit}>
                    {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                    {sending ? "Sending…" : "Send my RSVP"}
                  </button>
                )}
              </div>

              {sendErr && <p className="rsvp-err">{sendErr}</p>}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 0 6px" }}>
              <div
                className="pop"
                style={{
                  width: 74, height: 74, borderRadius: "50%", margin: "0 auto 24px",
                  background: `linear-gradient(140deg, ${skin.accent}, ${skin.deep})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 16px 34px -18px ${p[0]}`,
                }}
              >
                <Heart size={30} color={skin.onAccent} fill={skin.onAccent} />
              </div>
              <div style={{ fontFamily: skin.display, fontSize: 30, marginBottom: 12, color: skin.ink }}>
                Thank you, {form.name.trim().split(" ")[0] || "friend"}
              </div>
              <p style={{ color: skin.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 330, margin: "0 auto 22px" }}>
                {form.status === "no"
                  ? "We are sorry to miss you, and grateful you told us."
                  : "Your reply is with the couple. They cannot wait to see you."}
              </p>
              <button
                type="button" className="rsvp-back"
                onClick={() => { setForm(EMPTY_FORM); setStep(1); setDone(false); }}
              >
                Reply for someone else
              </button>
            </div>
          )}
        </div>

        {/* ── BLESSINGS & WISHES ── */}
        <div className="rsvp" style={{ padding: "6px 26px 64px", background: skin.bg }}>
          <div className="rsvp-orn"><i /><b>&#10047;</b><i /></div>
          <h2 className="rsvp-h">Blessings &amp; Wishes</h2>
          <p className="rsvp-sub">What everyone is saying to the couple.</p>

          {wishes.length ? (
            <div className="wish-list">
              {wishes.map((w, i) => (
                <figure className="wish" key={i}>
                  <p>&ldquo;{w.blessing}&rdquo;</p>
                  <figcaption>{w.name}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="wish-empty">
              Be the first to leave a blessing for this beautiful new chapter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
