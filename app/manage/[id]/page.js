"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Copy, Check, Send, Link2, BarChart3, Heart,
  Download, Trash2, EyeOff, Eye, QrCode,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TemplateRenderer, { paletteOf } from "@/components/TemplateRenderer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Reveal, Loading, StatusTag, Counter, Empty, Petals } from "@/components/ui";
import { C } from "@/lib/theme";

/* ══════════════════════════════════════════════════════════════════════
   MANAGE — one link, and the replies that come back through it.

   This page used to be a guest list: the couple typed in every invitee,
   and each one got a URL of their own. That is backwards. An invitation
   goes into the family WhatsApp group and travels from there, so there is
   one link, and the RSVP on the page tells us who is actually coming.

   Two tabs: the link to share, and the replies.
   ══════════════════════════════════════════════════════════════════════ */

const REPLY_LABEL = { yes: "Coming", maybe: "Maybe", no: "Not coming" };
const REPLY_COLOUR = { yes: C.green, maybe: C.marigold, no: C.red };

export default function ManagePage() {
  const { id } = useParams();
  const { session, ready } = useAuth();
  const router = useRouter();

  const [inv, setInv] = useState(null);
  const [events, setEvents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [tab, setTab] = useState("share");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { if (ready && !session) router.replace("/login"); }, [ready, session, router]);

  const load = useCallback(async () => {
    const [i, e, r] = await Promise.all([
      supabase.from("invitations").select("*").eq("id", id).maybeSingle(),
      supabase.from("invitation_events").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("guest_responses").select("*").eq("invitation_id", id).order("created_at", { ascending: false }),
    ]);
    setInv(i.data);
    setEvents(e.data || []);
    setResponses(r.data || []);
  }, [id]);

  useEffect(() => { if (session) load(); }, [session, load]);

  const toggleBlessing = async (row) => {
    await supabase.from("guest_responses").update({ show_blessing: !row.show_blessing }).eq("id", row.id);
    load();
  };

  const removeResponse = async (rid) => {
    await supabase.from("guest_responses").delete().eq("id", rid);
    load();
  };

  const counts = useMemo(() => {
    const c = { yes: 0, maybe: 0, no: 0, seats: 0 };
    for (const r of responses) {
      c[r.status] = (c[r.status] || 0) + 1;
      if (r.status === "yes") c.seats += r.party_size || 1;
    }
    return c;
  }, [responses]);

  const exportCsv = () => {
    const header = ["Name", "Phone", "Email", "Reply", "Party size", "Blessing", "Replied at"];
    const lines = responses.map((r) => [
      r.name,
      r.phone || "",
      r.email || "",
      REPLY_LABEL[r.status] || r.status,
      r.party_size || 1,
      (r.blessing || "").replace(/[\n,]/g, " "),
      new Date(r.created_at).toLocaleString("en-IN"),
    ]);
    const csv = [header, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(inv?.title || "invitation").replace(/\s+/g, "-")}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready || !session || !inv) return <Loading />;

  /* One address, the same for everybody. */
  const link = `${origin}/i/${inv.slug}`;
  const waText = encodeURIComponent(`${inv.title}\n\nYou are invited. Open the invitation and let us know if you can come:\n${link}`);
  const published = inv.status === "published";

  return (
    <>
      <Petals count={7} />
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <main style={{ flex: 1 }}>
          <div className="wrap" style={{ maxWidth: 1020, padding: "40px 28px" }}>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }} onClick={() => router.push("/dashboard")}>
              <ArrowLeft size={14} /> All invitations
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 30 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: 15, background: `linear-gradient(140deg, ${paletteOf(inv.design_config, [C.maroon, C.gold])[0]}, ${paletteOf(inv.design_config, [C.maroon, C.gold])[1]})`, flexShrink: 0 }} />
                <div>
                  <h1 className="display h-lg" style={{ fontSize: 36, margin: "0 0 8px" }}>{inv.title}</h1>
                  <StatusTag status={inv.status} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.line}`, marginBottom: 30, overflowX: "auto" }}>
              {[["share", "Share link", Link2], ["rsvps", "Who's coming", BarChart3], ["preview", "Preview", Heart]].map(([k, l, Ic]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    padding: "13px 20px", border: "none", background: "none",
                    fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap",
                    color: tab === k ? C.maroon : C.muted,
                    borderBottom: `2px solid ${tab === k ? C.maroon : "transparent"}`,
                    marginBottom: -1, display: "flex", gap: 8, alignItems: "center",
                    transition: "all .25s",
                  }}
                >
                  <Ic size={16} /> {l}
                </button>
              ))}
            </div>

            <div key={tab} style={{ animation: "msgIn .45s var(--ease) both" }}>
              {tab === "share" && (
                <>
                  <div className="card" style={{ padding: "26px 28px", marginBottom: 18 }}>
                    <h2 className="display" style={{ fontSize: 22, margin: "0 0 8px" }}>
                      One link for everyone
                    </h2>
                    <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 560 }}>
                      Send this to the whole family. Everyone who opens it sees the same
                      invitation and replies on the page — their name and number come back
                      to you under <b>Who&rsquo;s coming</b>, so there is nothing to type in here.
                    </p>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(140,123,112,.05)", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                      <Link2 size={14} color={C.muted} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                      >
                        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <a className="btn btn-gold" href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer">
                        <Send size={14} /> Share on WhatsApp
                      </a>
                      <a className="btn btn-ghost" href={link} target="_blank" rel="noreferrer">
                        <Eye size={14} /> Open it yourself
                      </a>
                      <a
                        className="btn btn-ghost"
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(link)}`}
                        target="_blank" rel="noreferrer"
                      >
                        <QrCode size={14} /> QR code for the venue
                      </a>
                    </div>

                    {!published && (
                      <p style={{ marginTop: 18, fontSize: 13, color: C.red, lineHeight: 1.6 }}>
                        This invitation is still a draft, so the link will not open for
                        guests yet. Publish it first.
                      </p>
                    )}
                  </div>
                </>
              )}

              {tab === "rsvps" && (
                <>
                  <div className="grid g4" style={{ marginBottom: 28 }}>
                    {[
                      ["Replied", responses.length, C.ink],
                      ["Coming", counts.yes, C.green],
                      ["Maybe", counts.maybe, C.marigold],
                      ["Seats confirmed", counts.seats, C.maroon],
                    ].map(([l, v, col], i) => (
                      <Reveal key={l} delay={i * 60}>
                        <div className="card" style={{ padding: "22px 24px" }}>
                          <div className="display" style={{ fontSize: 36, color: col, lineHeight: 1 }}><Counter to={v} /></div>
                          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>{l}</div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>
                      {counts.no} said they cannot make it.
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={exportCsv} disabled={!responses.length}>
                      <Download size={14} /> Export CSV
                    </button>
                  </div>

                  {!responses.length ? (
                    <Empty
                      title="No replies yet"
                      sub="Share the link and answers will appear here as guests RSVP."
                    />
                  ) : (
                    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
                      <table className="dt">
                        <thead>
                          <tr>
                            <th>Guest</th>
                            <th>Phone</th>
                            <th>Reply</th>
                            <th>Party</th>
                            <th>Blessing</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {responses.map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 700 }}>
                                {r.name}
                                {r.email && (
                                  <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 400 }}>{r.email}</div>
                                )}
                              </td>
                              <td style={{ fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>
                                {r.phone ? <a href={`tel:${r.phone}`}>{r.phone}</a> : "—"}
                              </td>
                              <td>
                                <span style={{ color: REPLY_COLOUR[r.status] || C.muted, fontWeight: 700, fontSize: 13 }}>
                                  {REPLY_LABEL[r.status] || r.status}
                                </span>
                              </td>
                              <td style={{ fontSize: 13, color: C.muted }}>
                                {r.status === "no" ? "—" : `×${r.party_size || 1}`}
                              </td>
                              <td style={{ color: C.muted, fontSize: 13, maxWidth: 280 }}>
                                {r.blessing ? (
                                  <span style={{ opacity: r.show_blessing ? 1 : 0.45 }}>
                                    {r.blessing}
                                    {!r.show_blessing && (
                                      <em style={{ fontSize: 11, marginLeft: 6 }}>(hidden)</em>
                                    )}
                                  </span>
                                ) : "—"}
                              </td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {r.blessing && (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => toggleBlessing(r)}
                                    aria-label={r.show_blessing ? "Hide this blessing" : "Show this blessing"}
                                    title={r.show_blessing ? "Hide from the wishes wall" : "Show on the wishes wall"}
                                  >
                                    {r.show_blessing ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                )}
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => removeResponse(r.id)}
                                  aria-label={`Remove ${r.name}'s reply`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {tab === "preview" && (
                <div style={{ maxWidth: 430 }}>
                  <div style={{ borderRadius: 22, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: "var(--shadow-md)" }}>
                    {/* `compact` puts the cinematic template into preview
                        mode: no "tap to open" curtain, no fixed progress
                        bar. Without it this box rendered the full-screen
                        opening overlay, which belongs on a guest's phone
                        and not inside a 430px panel on the owner's
                        dashboard. */}
                    <TemplateRenderer cfg={inv.design_config} events={events} compact />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
