"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X, Send, Loader2, Heart, CalendarPlus } from "lucide-react";
import TemplateRenderer, { paletteOf } from "@/components/TemplateRenderer";
import { supabase } from "@/lib/supabase";
import { Loading, Empty, Reveal } from "@/components/ui";
import { C } from "@/lib/theme";

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
    line: dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.12)",
    fieldBg: dark ? "rgba(255,255,255,.06)" : "#fff",
    display: d?.fonts?.display || "'Marcellus', Georgia, serif",
    body: d?.fonts?.body || "inherit",
    radius: d?.corner === "sharp" ? "2px" : "12px",
    pill: d?.corner === "sharp" ? "2px" : "999px",
  };
}

export default function GuestPage() {
  const { token } = useParams();
  const [guest, setGuest] = useState(null);
  const [inv, setInv] = useState(null);
  const [events, setEvents] = useState([]);
  const [existing, setExisting] = useState([]);
  const [resp, setResp] = useState({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: g } = await supabase.from("guests").select("*").eq("token", token).maybeSingle();
        if (!g) { setErr("This invitation link isn't valid."); return; }
        setGuest(g);
        supabase.from("guests").update({ viewed_at: new Date().toISOString() }).eq("id", g.id).then(() => {});

        const [{ data: i }, { data: e }, { data: r }] = await Promise.all([
          supabase.from("invitations").select("*").eq("id", g.invitation_id).maybeSingle(),
          supabase.from("invitation_events").select("*").eq("invitation_id", g.invitation_id).order("sort_order"),
          supabase.from("rsvps").select("*").eq("guest_id", g.id),
        ]);
        setInv(i); setEvents(e || []); setExisting(r || []);

        const init = {};
        (e || []).forEach((ev) => {
          const ex = (r || []).find((x) => x.invitation_event_id === ev.id);
          init[ev.id] = { status: ex?.status || "pending", party_size: ex?.party_size || 1 };
        });
        setResp(init);
        if ((r || []).some((x) => x.status !== "pending")) {
          setNote((r || []).find((x) => x.message)?.message || "");
        }
      } catch {
        setErr("Something went wrong loading this invitation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const submit = async () => {
    setSending(true);
    try {
      for (const ev of events) {
        const r = resp[ev.id];
        const ex = existing.find((x) => x.invitation_event_id === ev.id);
        const body = {
          guest_id: guest.id,
          invitation_event_id: ev.id,
          status: r.status,
          party_size: Number(r.party_size) || 1,
          message: note,
          responded_at: new Date().toISOString(),
        };
        if (ex) await supabase.from("rsvps").update(body).eq("id", ex.id);
        else await supabase.from("rsvps").insert(body);
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  const ink = p[3] || C.ink;
  const muted = p[4] || C.muted;

  /* The RSVP form is app chrome, not renderer output, so it was styled by
     globals.css — which is built for the cream SaaS pages. On a dark
     invitation that meant near-black button text on a near-black ground:
     the accept/decline buttons were invisible. Everything below now takes
     its colours and its typefaces from the invitation itself. */
  const skin = skinOf(inv?.design_config, p);
  const anyAnswered = Object.values(resp).some((r) => r.status !== "pending");

  return (
    <div style={{ background: skin.bg, minHeight: "100vh" }}>
      <style>{`
        .rsvp{font-family:${skin.body}}
        .rsvp-orn{display:flex;align-items:center;justify-content:center;gap:13px;
          width:min(230px,64%);margin:0 auto 24px}
        .rsvp-orn i{flex:1;height:1px;background:${skin.line}}
        .rsvp-orn b{color:${skin.accent};font-size:12px;font-weight:400;line-height:1}
        .rsvp-h{font-family:${skin.display};font-weight:500;font-size:27px;text-align:center;
          margin:0 0 10px;color:${skin.deep === skin.bg ? skin.ink : skin.deep}}
        .rsvp-sub{text-align:center;color:${skin.muted};font-size:13.5px;line-height:1.65;margin:0 0 26px}

        .rsvp-card{background:${skin.fieldBg};border:1px solid ${skin.line};border-radius:${skin.radius};
          padding:22px;margin-bottom:14px}
        .rsvp-name{font-family:${skin.display};font-size:18px;color:${skin.ink};margin-bottom:15px}
        .rsvp-choice{display:flex;gap:10px;flex-wrap:wrap}

        /* Buttons take the invitation's own colours. Before this they used
           the app's .btn-ghost — cream border, near-black text — which
           disappeared completely on a dark invitation. */
        .rsvp-btn{flex:1 1 140px;display:inline-flex;align-items:center;justify-content:center;gap:7px;
          padding:12px 14px;border-radius:${skin.pill};cursor:pointer;font:inherit;font-size:13px;
          background:transparent;color:${skin.ink};border:1px solid ${skin.line};
          transition:background .25s ease,color .25s ease,border-color .25s ease,transform .25s ease}
        .rsvp-btn:hover{border-color:${skin.accent};transform:translateY(-1px)}
        .rsvp-btn.on{background:${skin.fill};border-color:${skin.fill};color:${skin.onFill}}
        .rsvp-btn.off{background:${skin.line};border-color:${skin.line};color:${skin.ink}}

        .rsvp-field{margin-top:16px}
        .rsvp-field label{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;
          color:${skin.muted};margin-bottom:8px}
        .rsvp-field input,.rsvp-field textarea{width:100%;padding:13px 15px;border-radius:${skin.radius};
          background:${skin.fieldBg};border:1px solid ${skin.line};color:${skin.ink};
          font:inherit;font-size:14.5px;outline:none;resize:vertical}
        .rsvp-field input:focus,.rsvp-field textarea:focus{border-color:${skin.accent}}
        .rsvp-field ::placeholder{color:${skin.muted};opacity:.8}

        .rsvp-send{width:100%;margin-top:22px;padding:17px 20px;border:none;cursor:pointer;
          border-radius:${skin.pill};background:${skin.fill};color:${skin.onFill};
          font:inherit;font-size:12px;letter-spacing:.22em;text-transform:uppercase;
          display:inline-flex;align-items:center;justify-content:center;gap:9px;
          transition:transform .3s ease,box-shadow .3s ease}
        .rsvp-send:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 32px rgba(0,0,0,.24)}
        .rsvp-send:disabled{opacity:.45;cursor:not-allowed}
        .rsvp-fine{text-align:center;font-size:11.5px;color:${skin.muted};margin-top:18px}
      `}</style>
      <div style={{ maxWidth: 500, margin: "0 auto", background: p[2], minHeight: "100vh", boxShadow: "0 0 80px rgba(27,17,22,.12)" }}>
        <div style={{ animation: "msgIn 1s var(--ease) both" }}>
          <TemplateRenderer cfg={inv?.design_config} events={events} guestName={guest?.name} />
        </div>

        {!done ? (
          <div className="rsvp" style={{ padding: "10px 26px 56px", background: skin.bg }}>
            <div className="rsvp-orn"><i /><b>&#10047;</b><i /></div>

            <h2 className="rsvp-h">Will you join us?</h2>
            <p className="rsvp-sub">
              Please respond for each function so we can plan the seating.
            </p>

            {events.map((ev, i) => {
              const r = resp[ev.id] || {};
              return (
                <Reveal key={ev.id} delay={i * 70}>
                  <div className="rsvp-card">
                    <div className="rsvp-name">{ev.name}</div>
                    <div className="rsvp-choice">
                      <button
                        type="button"
                        className={`rsvp-btn ${r.status === "accepted" ? "on" : ""}`}
                        onClick={() => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], status: "accepted" } }))}
                      >
                        <Check size={14} /> Joyfully accept
                      </button>
                      <button
                        type="button"
                        className={`rsvp-btn ${r.status === "declined" ? "off" : ""}`}
                        onClick={() => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], status: "declined" } }))}
                      >
                        <X size={14} /> Regretfully decline
                      </button>
                    </div>
                    {r.status === "accepted" && (
                      <div className="rsvp-field" style={{ animation: "msgIn .4s both" }}>
                        <label htmlFor={`n-${ev.id}`}>How many attending?</label>
                        <input
                          id={`n-${ev.id}`} type="number" min="1"
                          value={r.party_size}
                          onChange={(e) => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], party_size: e.target.value } }))}
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}

            <div className="rsvp-field">
              <label htmlFor="rsvp-note">A message for the hosts (optional)</label>
              <textarea id="rsvp-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="A line to say you are thinking of them…" />
            </div>

            <button className="rsvp-send" onClick={submit} disabled={sending || !anyAnswered}>
              {sending ? <><Loader2 size={16} className="spin" /> Sending…</> : <>Send my response <Send size={15} /></>}
            </button>

            <p className="rsvp-fine">You can reopen this link and change your answer any time.</p>
          </div>
        ) : (
          <div style={{ padding: "48px 30px 70px", textAlign: "center", background: skin.bg, fontFamily: skin.body }}>
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
            <div style={{ fontFamily: skin.display, fontSize: 30, marginBottom: 12, color: skin.deep === skin.bg ? skin.ink : skin.deep }}>
              Thank you, {guest.name}
            </div>
            <p style={{ color: muted, fontSize: 15, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 24px" }}>
              Your response has been recorded. We can't wait to celebrate with you.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setDone(false)}>
              <CalendarPlus size={14} /> Change my response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
