"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X, Send, Loader2, Heart, CalendarPlus } from "lucide-react";
import TemplateRenderer, { paletteOf } from "@/components/TemplateRenderer";
import { supabase } from "@/lib/supabase";
import { Loading, Empty, Reveal } from "@/components/ui";
import { C } from "@/lib/theme";

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
  const anyAnswered = Object.values(resp).some((r) => r.status !== "pending");

  return (
    <div style={{ background: p[2], minHeight: "100vh" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", background: p[2], minHeight: "100vh", boxShadow: "0 0 80px rgba(27,17,22,.12)" }}>
        <div style={{ animation: "msgIn 1s var(--ease) both" }}>
          <TemplateRenderer cfg={inv?.design_config} events={events} guestName={guest?.name} />
        </div>

        {!done ? (
          <div style={{ padding: "4px 26px 50px", background: p[2] }}>
            <div className="rule-orn" style={{ marginBottom: 26, color: p[1] }}><span style={{ fontSize: 12 }}>❖</span></div>

            <div className="display" style={{ fontSize: 26, textAlign: "center", marginBottom: 8, color: p[0] }}>
              Will you join us?
            </div>
            <p style={{ textAlign: "center", color: muted, fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
              Please respond for each function so we can plan the seating.
            </p>

            {events.map((ev, i) => {
              const r = resp[ev.id] || {};
              return (
                <Reveal key={ev.id} delay={i * 70}>
                  <div className="card" style={{ marginBottom: 14, padding: 22, background: p[5] || "#fff", borderColor: "rgba(0,0,0,.08)" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: ink }}>{ev.name}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className={`btn btn-sm ${r.status === "accepted" ? "btn-primary" : "btn-ghost"}`}
                        style={{ flex: 1 }}
                        onClick={() => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], status: "accepted" } }))}
                      >
                        <Check size={14} /> Joyfully accept
                      </button>
                      <button
                        className={`btn btn-sm ${r.status === "declined" ? "btn-danger" : "btn-ghost"}`}
                        style={{ flex: 1 }}
                        onClick={() => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], status: "declined" } }))}
                      >
                        <X size={14} /> Regretfully decline
                      </button>
                    </div>
                    {r.status === "accepted" && (
                      <div className="field" style={{ marginTop: 16, marginBottom: 0, animation: "msgIn .4s both" }}>
                        <label>How many attending?</label>
                        <input
                          type="number" min="1" max={guest?.max_party_size ? undefined : undefined}
                          value={r.party_size}
                          onChange={(e) => setResp((s) => ({ ...s, [ev.id]: { ...s[ev.id], party_size: e.target.value } }))}
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}

            <div className="field">
              <label>A message for the couple (optional)</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Wishing you both a lifetime of happiness…" />
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={submit} disabled={sending || !anyAnswered}>
              {sending ? <><Loader2 size={16} className="spin" /> Sending…</> : <>Send my response <Send size={15} /></>}
            </button>

            <p style={{ textAlign: "center", fontSize: 11.5, color: muted, marginTop: 18 }}>
              You can reopen this link and change your answer any time.
            </p>
          </div>
        ) : (
          <div style={{ padding: "48px 30px 70px", textAlign: "center", background: p[2] }}>
            <div
              className="pop"
              style={{
                width: 74, height: 74, borderRadius: "50%", margin: "0 auto 24px",
                background: `linear-gradient(140deg, ${p[1]}, ${p[0]})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 16px 34px -18px ${p[0]}`,
              }}
            >
              <Heart size={30} color="#fff" fill="#fff" />
            </div>
            <div className="display" style={{ fontSize: 30, marginBottom: 12, color: p[0] }}>
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
