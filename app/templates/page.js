"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TemplateRenderer from "@/components/TemplateRenderer";
import { Reveal, Petals } from "@/components/ui";
import { C } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

const DEMO_EVENTS = [
  { name: "Haldi", event_date: "2027-01-14", event_time: "10:00", venue: "Residence, Jaipur" },
  { name: "Sangeet", event_date: "2027-01-15", event_time: "19:00", venue: "Rambagh Palace" },
  { name: "Vivaah", event_date: "2027-01-16", event_time: "20:30", venue: "Rambagh Palace Lawns" },
];

export default function TemplatesPage() {
  const [tmpls, setTmpls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setTmpls(data || []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const seen = new Set();
    tmpls.forEach((t) => t.category && seen.add(t.category));
    return ["All", ...Array.from(seen).sort()];
  }, [tmpls]);

  const filtered = category === "All" ? tmpls : tmpls.filter((t) => t.category === category);

  return (
    <>
      <Petals count={7} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav />
        <main>
          {/* ── Hero ── */}
          <section className="wrap" style={{ padding: "56px 28px 24px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase",
                color: C.maroon, background: "rgba(91,18,38,.07)",
                border: "1px solid rgba(91,18,38,.12)",
                padding: "8px 16px", borderRadius: 999, marginBottom: 22,
              }}
            >
              <Sparkles size={13} /> Every template, live and interactive
            </div>
            <h1 className="display h-lg" style={{ fontSize: 48, margin: "0 0 16px", lineHeight: 1.08 }}>
              Templates, not screenshots
            </h1>
            <p style={{ fontSize: 16.5, color: C.muted, lineHeight: 1.68, maxWidth: 600, margin: "0 auto" }}>
              What you see below is the actual invitation renderer — the same one your guests will open —
              filled with sample names. Pick one to start, then reshape colours, wording and mood by
              describing them in plain language.
            </p>
          </section>

          {/* ── Category filters ── */}
          {!loading && categories.length > 1 && (
            <div className="wrap" style={{ padding: "8px 28px 8px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {categories.map((c) => {
                const on = c === category;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    style={{
                      padding: "9px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 700,
                      border: `1px solid ${on ? C.maroon : C.line}`,
                      background: on ? C.maroon : "#fff",
                      color: on ? C.ivory : C.ink,
                      transition: "all .3s var(--ease)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Grid ── */}
          <section className="wrap" style={{ padding: "28px 28px 90px" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "60px 0" }}>Loading templates…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "60px 0" }}>No templates in this category yet.</div>
            ) : (
              <div className="grid g3">
                {filtered.map((t, i) => {
                  const p = t.base_config?.palette || [C.maroon, C.gold, C.ivory];
                  return (
                    <Reveal key={t.id} delay={i * 55}>
                      <div
                        className="card card-hover"
                        style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
                      >
                        <div style={{ height: 280, overflow: "hidden", borderBottom: `1px solid ${C.line}`, background: p[2] || C.ivory }}>
                          <div style={{ transform: "scale(.66)", transformOrigin: "top center", width: "151%", marginLeft: "-25.5%" }}>
                            <TemplateRenderer
                              cfg={{ ...t.base_config, headline: "Aarav & Diya", subheadline: "request the honour of your presence" }}
                              events={DEMO_EVENTS}
                            />
                          </div>
                        </div>
                        <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                            <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                              {p.map((c) => (
                                <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, border: `1px solid ${C.line}` }} />
                              ))}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: C.gold, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 16 }}>
                            {t.category || "Wedding"}
                          </div>
                          <Link href={`/create?template=${t.id}`} className="btn btn-primary btn-sm" style={{ marginTop: "auto", justifyContent: "center" }}>
                            Use this template <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
