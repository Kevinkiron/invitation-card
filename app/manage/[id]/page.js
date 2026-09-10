"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Copy, Check, Send, Link2, Users, BarChart3, Heart,
  Loader2, Download, Trash2, Eye,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TemplateRenderer, { paletteOf } from "@/components/TemplateRenderer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Reveal, Loading, StatusTag, Counter, Empty, Petals } from "@/components/ui";
import { C } from "@/lib/theme";

export default function ManagePage() {
  const { id } = useParams();
  const { session, ready } = useAuth();
  const router = useRouter();

  const [inv, setInv] = useState(null);
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [tab, setTab] = useState("guests");
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [bulk, setBulk] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { if (ready && !session) router.replace("/login"); }, [ready, session, router]);

  const load = useCallback(async () => {
    const [i, e, g] = await Promise.all([
      supabase.from("invitations").select("*").eq("id", id).maybeSingle(),
      supabase.from("invitation_events").select("*").eq("invitation_id", id).order("sort_order"),
      supabase.from("guests").select("*").eq("invitation_id", id).order("created_at", { ascending: false }),
    ]);
    setInv(i.data); setEvents(e.data || []); setGuests(g.data || []);
    if (g.data?.length) {
      const { data: r } = await supabase.from("rsvps").select("*").in("guest_id", g.data.map((x) => x.id));
      setRsvps(r || []);
    } else setRsvps([]);
  }, [id]);

  useEffect(() => { if (session) load(); }, [session, load]);

  const addGuest = async (e) => {
    e.preventDefault();
    if (!gName.trim()) return;
    setAdding(true);
    await supabase.from("guests").insert({ invitation_id: id, name: gName.trim(), phone: gPhone.trim() });
    setGName(""); setGPhone(""); await load(); setAdding(false);
  };

  const addBulk = async () => {
    const lines = bulk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setAdding(true);
    const rows = lines.map((l) => {
      const [name, phone] = l.split(",").map((s) => (s || "").trim());
      return { invitation_id: id, name, phone: phone || "" };
    });
    await supabase.from("guests").insert(rows);
    setBulk(""); await load(); setAdding(false);
  };

  const removeGuest = async (gid) => {
    await supabase.from("guests").delete().eq("id", gid);
    load();
  };

  const exportCsv = () => {
    const header = ["Guest", "Phone", "Opened", ...events.map((e) => e.name), "Message"];
    const lines = guests.map((g) => [
      g.name,
      g.phone || "",
      g.viewed_at ? "yes" : "no",
      ...events.map((e) => {
        const r = rsvps.find((x) => x.guest_id === g.id && x.invitation_event_id === e.id);
        return r ? `${r.status}${r.party_size > 1 ? ` (${r.party_size})` : ""}` : "pending";
      }),
      (rsvps.find((r) => r.guest_id === g.id && r.message)?.message || "").replace(/[\n,]/g, " "),
    ]);
    const csv = [header, ...lines].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(inv?.title || "guests").replace(/\s+/g, "-")}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready || !session || !inv) return <Loading />;

  const link = (tok) => `${origin}/i/${tok}`;
  const rsvpOf = (gid, eid) => rsvps.find((r) => r.guest_id === gid && r.invitation_event_id === eid);
  const tot = rsvps.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
  const seats = rsvps.filter((r) => r.status === "accepted").reduce((a, r) => a + (r.party_size || 1), 0);
  const opened = guests.filter((g) => g.viewed_at).length;

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
              {[["guests", "Guests & links", Users], ["rsvps", "RSVP board", BarChart3], ["preview", "Preview", Heart]].map(([k, l, Ic]) => (
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
              {tab === "guests" && (
                <>
                  <form className="card" onSubmit={addGuest} style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
                    <div className="field" style={{ marginBottom: 0, flex: "1 1 200px" }}>
                      <label>Guest name</label>
                      <input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Kabir Sharma" required />
                    </div>
                    <div className="field" style={{ marginBottom: 0, flex: "1 1 190px" }}>
                      <label>WhatsApp number</label>
                      <input value={gPhone} onChange={(e) => setGPhone(e.target.value)} placeholder="+91 98XXX XXXXX" />
                    </div>
                    <button className="btn btn-primary" disabled={adding}>
                      {adding ? <Loader2 size={15} className="spin" /> : <Plus size={15} />} Add guest
                    </button>
                  </form>

                  <details className="card" style={{ marginBottom: 26 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14.5 }}>Add many guests at once</summary>
                    <div className="field" style={{ marginTop: 16 }}>
                      <label>One per line — name, phone</label>
                      <textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Kabir Sharma, +919812345678\nMeera Iyer, +919898989898\nRahul Nair"} />
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={addBulk} disabled={adding}>Add all</button>
                  </details>

                  {!guests.length && <Empty title="No guests yet" sub="Add someone above — they'll get a private link with their own name on the invitation." />}

                  {guests.map((g, i) => {
                    const l = link(g.token);
                    const msg = encodeURIComponent(`🌸 You're invited!\n\n${inv.title}\n\nView your personal invitation and RSVP here:\n${l}`);
                    const wa = g.phone ? `https://wa.me/${g.phone.replace(/\D/g, "")}?text=${msg}` : `https://wa.me/?text=${msg}`;
                    return (
                      <Reveal key={g.id} delay={i * 40}>
                        <div className="card" style={{ marginBottom: 12, padding: "20px 24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(232,145,45,.16)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: C.maroon }}>
                                {g.name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{g.name}</div>
                                <div style={{ fontSize: 11.5, color: g.viewed_at ? C.green : C.muted, display: "flex", gap: 5, alignItems: "center", marginTop: 2 }}>
                                  <Eye size={11} /> {g.viewed_at ? "Opened their invitation" : "Not opened yet"}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <a className="btn btn-gold btn-sm" href={wa} target="_blank" rel="noreferrer"><Send size={13} /> WhatsApp</a>
                              <button className="btn btn-ghost btn-sm" onClick={() => removeGuest(g.id)} aria-label="Remove guest"><Trash2 size={13} /></button>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(140,123,112,.05)", border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 13px" }}>
                            <Link2 size={13} color={C.muted} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => { navigator.clipboard?.writeText(l); setCopied(g.id); setTimeout(() => setCopied(null), 1600); }}
                            >
                              {copied === g.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                            </button>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </>
              )}

              {tab === "rsvps" && (
                <>
                  <div className="grid g4" style={{ marginBottom: 28 }}>
                    {[["Invited", guests.length, C.ink], ["Opened", opened, C.peacock], ["Accepted", tot.accepted || 0, C.green], ["Seats confirmed", seats, C.maroon]].map(([l, v, col], i) => (
                      <Reveal key={l} delay={i * 60}>
                        <div className="card" style={{ padding: "22px 24px" }}>
                          <div className="display" style={{ fontSize: 36, color: col, lineHeight: 1 }}><Counter to={v} /></div>
                          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>{l}</div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                    <button className="btn btn-ghost btn-sm" onClick={exportCsv}><Download size={14} /> Export CSV</button>
                  </div>

                  <div className="card" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="dt">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          {events.map((e) => <th key={e.id}>{e.name}</th>)}
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.map((g) => (
                          <tr key={g.id}>
                            <td style={{ fontWeight: 700 }}>{g.name}</td>
                            {events.map((e) => {
                              const r = rsvpOf(g.id, e.id);
                              return (
                                <td key={e.id}>
                                  <StatusTag status={r?.status || "pending"} />
                                  {r?.party_size > 1 && <span style={{ fontSize: 11.5, color: C.muted, marginLeft: 6 }}>×{r.party_size}</span>}
                                </td>
                              );
                            })}
                            <td style={{ color: C.muted, fontSize: 13 }}>
                              {rsvps.find((r) => r.guest_id === g.id && r.message)?.message || "—"}
                            </td>
                          </tr>
                        ))}
                        {!guests.length && (
                          <tr><td colSpan={events.length + 2} style={{ color: C.muted }}>No guests yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === "preview" && (
                <div style={{ maxWidth: 430 }}>
                  <div style={{ borderRadius: 22, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: "var(--shadow-md)" }}>
                    <TemplateRenderer cfg={inv.design_config} events={events} />
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
