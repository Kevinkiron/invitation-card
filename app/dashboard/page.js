"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Heart, Users, CheckCircle2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Reveal, Loading, StatusTag, Counter, Petals } from "@/components/ui";
import { C } from "@/lib/theme";

export default function DashboardPage() {
  const { session, profile, ready } = useAuth();
  const router = useRouter();
  const [invs, setInvs] = useState(null);
  const [stats, setStats] = useState({ guests: 0, accepted: 0 });

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });
      setInvs(data || []);

      const ids = (data || []).map((i) => i.id);
      if (!ids.length) return;
      const { data: gs } = await supabase.from("guests").select("id").in("invitation_id", ids);
      const { data: rs } = gs?.length
        ? await supabase.from("rsvps").select("status").in("guest_id", gs.map((g) => g.id))
        : { data: [] };
      setStats({
        guests: gs?.length || 0,
        accepted: (rs || []).filter((r) => r.status === "accepted").length,
      });
    })();
  }, [session]);

  if (!ready || !session) return <Loading />;

  return (
    <>
      <Petals count={8} />
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <main style={{ flex: 1 }}>
          <div className="wrap" style={{ maxWidth: 1020, padding: "48px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 34 }}>
              <div>
                <h1 className="display h-lg" style={{ fontSize: 40, margin: "0 0 6px" }}>Your invitations</h1>
                <p style={{ color: C.muted, fontSize: 14.5, margin: 0 }}>
                  {profile?.full_name || session.user.email}
                </p>
              </div>
              <Link href="/create" className="btn btn-primary">
                <Plus size={17} /> New invitation
              </Link>
            </div>

            {invs?.length > 0 && (
              <div className="grid g3" style={{ marginBottom: 32 }}>
                {[
                  [Heart, "Invitations", invs.length, C.maroon],
                  [Users, "Guests invited", stats.guests, C.peacock],
                  [CheckCircle2, "Accepted", stats.accepted, C.green],
                ].map(([Icon, l, v, col], i) => (
                  <Reveal key={l} delay={i * 70}>
                    <div className="card" style={{ padding: "22px 24px", display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={19} color={col} />
                      </div>
                      <div>
                        <div className="display" style={{ fontSize: 30, lineHeight: 1, color: col }}>
                          <Counter to={v} />
                        </div>
                        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5 }}>{l}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {invs === null && <Loading label="Fetching your invitations…" />}

            {invs?.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: "70px 32px" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, margin: "0 auto 22px", background: `linear-gradient(140deg, rgba(232,145,45,.22), rgba(200,162,74,.08))`, border: `1px solid rgba(200,162,74,.25)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Heart size={26} color={C.maroon} />
                </div>
                <div className="display" style={{ fontSize: 27, marginBottom: 10 }}>Nothing here yet</div>
                <p style={{ color: C.muted, fontSize: 15, maxWidth: 380, margin: "0 auto 26px", lineHeight: 1.68 }}>
                  Choose your functions, pick a design, then shape it by describing what you want.
                </p>
                <Link href="/create" className="btn btn-primary">Create your first invitation</Link>
              </div>
            )}

            {invs?.map((inv, i) => (
              <Reveal key={inv.id} delay={i * 60}>
                <Link href={`/manage/${inv.id}`}>
                  <div className="card card-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "22px 26px", gap: 18, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                          background: `linear-gradient(140deg, ${inv.design_config?.palette?.[0] || C.maroon}, ${inv.design_config?.palette?.[1] || C.gold})`,
                        }}
                      />
                      <div>
                        <div className="display" style={{ fontSize: 22, marginBottom: 4 }}>{inv.title}</div>
                        <div style={{ fontSize: 12.5, color: C.muted }}>
                          Created {new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {inv.plan ? ` · ${inv.plan}` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <StatusTag status={inv.status} />
                      <span className="btn btn-ghost btn-sm">
                        {inv.status === "published" ? "Manage" : "Continue"} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
