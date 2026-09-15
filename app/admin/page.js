"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Plus, Loader2, IndianRupee, Users, FileText } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TemplateRenderer from "@/components/TemplateRenderer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Reveal, Loading, Empty, Counter, StatusTag } from "@/components/ui";
import { C, money } from "@/lib/theme";

export default function AdminPage() {
  const { session, profile, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  useEffect(() => { if (ready && !session) router.replace("/login"); }, [ready, session, router]);

  if (!ready || !session) return <Loading />;
  if (!profile) return <Loading label="Checking access…" />;
  if (!profile.is_admin)
    return (
      <>
        <Nav />
        <Empty title="Admins only" sub="This account doesn't have admin access. Ask an existing admin to enable it for you." />
        <Footer />
      </>
    );

  const tabs = [["overview", "Overview"], ["customers", "Customers"], ["events", "Event types"], ["templates", "Templates"]];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <div className="wrap" style={{ maxWidth: 1080, padding: "44px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(140deg, ${C.maroon}, ${C.plumDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color={C.marigold} />
            </span>
            <h1 className="display h-lg" style={{ fontSize: 36, margin: 0 }}>Admin panel</h1>
          </div>

          <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.line}`, marginBottom: 30, overflowX: "auto" }}>
            {tabs.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  padding: "13px 20px", border: "none", background: "none",
                  fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap",
                  color: tab === k ? C.maroon : C.muted,
                  borderBottom: `2px solid ${tab === k ? C.maroon : "transparent"}`,
                  marginBottom: -1, transition: "all .25s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div key={tab} style={{ animation: "msgIn .45s var(--ease) both" }}>
            {tab === "overview" && <Overview />}
            {tab === "customers" && <Customers />}
            {tab === "events" && <EventTypes />}
            {tab === "templates" && <Templates />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Overview() {
  const [d, setD] = useState(null);
  useEffect(() => {
    (async () => {
      const [p, i, g, pay] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("invitations").select("id,status"),
        supabase.from("guests").select("id"),
        supabase.from("payments").select("amount,status"),
      ]);
      setD({
        customers: p.data?.length || 0,
        invitations: i.data?.length || 0,
        published: i.data?.filter((x) => x.status === "published").length || 0,
        guests: g.data?.length || 0,
        revenue: (pay.data || []).filter((x) => x.status === "completed").reduce((a, x) => a + Number(x.amount || 0), 0),
      });
    })();
  }, []);
  if (!d) return <Loading />;
  return (
    <div className="grid g4">
      {[
        [Users, "Customers", d.customers, C.peacock, false],
        [FileText, "Invitations", d.invitations, C.maroon, false],
        [FileText, "Published", d.published, C.green, false],
        [IndianRupee, "Revenue", d.revenue, C.gold, true],
      ].map(([Icon, l, v, col, isMoney], i) => (
        <Reveal key={l} delay={i * 70}>
          <div className="card" style={{ padding: "24px 26px" }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon size={18} color={col} />
            </span>
            <div className="display" style={{ fontSize: 32, color: col, lineHeight: 1 }}>
              {isMoney ? money(v) : <Counter to={v} />}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>{l}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function Customers() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: is }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("invitations").select("id,owner_id,title,status,plan"),
      ]);
      setRows((ps || []).map((p) => ({ ...p, invs: (is || []).filter((i) => i.owner_id === p.id) })));
    })();
  }, []);
  if (!rows) return <Loading />;
  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table className="dt">
        <thead>
          <tr><th>Customer</th><th>Invitations</th><th>Published</th><th>Plan</th><th>Joined</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 700 }}>{r.full_name || `${r.id.slice(0, 8)}…`}</td>
              <td>{r.invs.length}</td>
              <td>{r.invs.filter((i) => i.status === "published").length}</td>
              <td style={{ color: C.muted }}>{r.invs.find((i) => i.plan)?.plan || "—"}</td>
              <td style={{ color: C.muted }}>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} style={{ color: C.muted }}>No customers yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function EventTypes() {
  const [items, setItems] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("event_types").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await supabase.from("event_types").insert({ name: name.trim(), description: desc.trim() });
    setName(""); setDesc(""); await load(); setBusy(false);
  };

  return (
    <>
      <form className="card" onSubmit={add} style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 24 }}>
        <div className="field" style={{ marginBottom: 0, flex: "1 1 200px" }}>
          <label>Function name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tilak Ceremony" />
        </div>
        <div className="field" style={{ marginBottom: 0, flex: "1 1 260px" }}>
          <label>Description</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Blessing of the groom" />
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? <Loader2 size={15} className="spin" /> : <Plus size={15} />} Add
        </button>
      </form>

      {!items && <Loading />}
      {items?.map((it, i) => (
        <Reveal key={it.id} delay={i * 35}>
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11, padding: "18px 22px", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{it.name}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{it.description}</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <StatusTag status={it.is_active ? "published" : "draft"} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await supabase.from("event_types").update({ is_active: !it.is_active }).eq("id", it.id);
                  load();
                }}
              >
                {it.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </Reveal>
      ))}
    </>
  );
}

function Templates() {
  const [items, setItems] = useState(null);
  const [name, setName] = useState("");
  const [motif, setMotif] = useState("marigold");
  const [c1, setC1] = useState(C.maroon);
  const [c2, setC2] = useState(C.gold);
  const [c3, setC3] = useState(C.ivory);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await supabase.from("templates").insert({
      name: name.trim(),
      category: "wedding",
      base_config: { palette: [c1, c2, c3], font: "serif", motif },
    });
    setName(""); await load(); setBusy(false);
  };

  return (
    <>
      <form className="card" onSubmit={add} style={{ marginBottom: 26 }}>
        <div className="grid g2">
          <div className="field"><label>Template name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Golden Jharokha" /></div>
          <div className="field">
            <label>Motif</label>
            <select value={motif} onChange={(e) => setMotif(e.target.value)}>
              <option value="marigold">Marigold</option>
              <option value="peacock">Peacock</option>
              <option value="paisley">Paisley</option>
              <option value="line">Minimal line</option>
            </select>
          </div>
        </div>
        <div className="grid g3">
          <div className="field"><label>Main</label><input type="color" value={c1} onChange={(e) => setC1(e.target.value)} /></div>
          <div className="field"><label>Accent</label><input type="color" value={c2} onChange={(e) => setC2(e.target.value)} /></div>
          <div className="field"><label>Background</label><input type="color" value={c3} onChange={(e) => setC3(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? <Loader2 size={15} className="spin" /> : <Plus size={15} />} Add template
        </button>
      </form>

      <div className="grid g3">
        {items?.map((t, i) => (
          <Reveal key={t.id} delay={i * 50}>
            <div className="card card-hover" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 180, overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ transform: "scale(.6)", transformOrigin: "top center", width: "167%", marginLeft: "-33.5%" }}>
                  <TemplateRenderer cfg={{ ...t.base_config, headline: "Aarav & Diya", subheadline: "request the honour of your presence" }} events={[]} compact />
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 3, marginBottom: 14 }}>
                  {t.base_config?.motif || t.category}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%" }}
                  onClick={async () => {
                    await supabase.from("templates").update({ is_active: !t.is_active }).eq("id", t.id);
                    load();
                  }}
                >
                  {t.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
