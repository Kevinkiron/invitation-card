"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PhoneFrame from "@/components/PhoneFrame";
import InvitationRenderer from "@/components/InvitationRenderer";
import { TEMPLATES, CATEGORIES } from "@/lib/templates/registry";
import { DEMO_INVITATION } from "@/lib/demo-data";
import { C } from "@/lib/theme";

export default function TemplatesPage() {
  const [category, setCategory] = useState("All");

  const shown = category === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);
  const active = CATEGORIES.filter(
    (c) => c === "All" || TEMPLATES.some((t) => t.category === c)
  );

  return (
    <>
      <Nav />
      <main style={{ background: C.paper, minHeight: "100vh" }}>
        {/* ── Header ── */}
        <section className="wrap" style={{ padding: "54px 28px 26px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase",
              color: C.maroon, background: "rgba(91,18,38,.07)",
              border: "1px solid rgba(91,18,38,.12)",
              padding: "8px 16px", borderRadius: 999, marginBottom: 22,
            }}
          >
            <Sparkles size={13} /> Live, not screenshots
          </div>
          <h1 className="display h-lg" style={{ fontSize: 46, margin: "0 0 14px", lineHeight: 1.08 }}>
            Wedding invitation templates
          </h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            Choose a design and preview it before you start. Every phone below is running the real
            invitation — scroll inside it, open the gallery, try the RSVP.
          </p>
        </section>

        {/* ── Category tabs ── */}
        <div className="wrap" style={{ padding: "0 28px 30px", display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
          {active.map((c) => {
            const on = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: "9px 18px", borderRadius: 999, cursor: "pointer",
                  fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                  border: `1px solid ${on ? C.maroon : C.line}`,
                  background: on ? C.maroon : "#fff",
                  color: on ? C.ivory : C.muted,
                  transition: "all .3s var(--ease)",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* ── Grid of live phone previews ── */}
        <section className="wrap tpl-grid" style={{ padding: "0 28px 90px" }}>
          {shown.map((t) => (
            <article key={t.slug} className="tpl-card">
              <div className="tpl-stage">
                <PhoneFrame
                  width={286}
                  height={560}
                  statusColor={t.theme.bg === "#0B0A0E" || t.theme.bg === "#120A0D" ? "rgba(255,255,255,.9)" : "rgba(20,16,14,.85)"}
                  label={`Live preview of ${t.name}`}
                >
                  <InvitationRenderer
                    templateId={t.slug}
                    mode="gallery"
                    invitationData={DEMO_INVITATION}
                  />
                </PhoneFrame>
              </div>

              <div className="tpl-meta">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 className="display" style={{ fontSize: 21, lineHeight: 1.2, marginBottom: 4 }}>{t.name}</h2>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, fontWeight: 800 }}>
                      {t.category}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, paddingTop: 4 }}>
                    {t.swatches.map((s) => (
                      <span key={s} style={{ width: 13, height: 13, borderRadius: "50%", background: s, border: `1px solid ${C.line}` }} />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "10px 0 16px" }}>{t.tagline}</p>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/templates/${t.slug}/preview`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                    <Eye size={14} /> Preview
                  </Link>
                  <Link href={`/create?template=${t.slug}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                    Use <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />

      <style jsx>{`
        .tpl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          justify-items: center;
        }
        .tpl-card {
          background: #fff;
          border: 1px solid ${C.line};
          border-radius: 22px;
          padding: 18px 18px 20px;
          width: 100%;
          max-width: 340px;
          box-shadow: var(--shadow-sm);
          transition: box-shadow .45s var(--ease), transform .45s var(--ease), border-color .45s;
        }
        .tpl-card:hover {
          transform: translateY(-4px);
          border-color: rgba(200, 162, 74, 0.45);
          box-shadow: 0 30px 60px -34px rgba(59, 10, 42, 0.5);
        }
        .tpl-stage { display: flex; justify-content: center; }
        .tpl-meta { padding: 18px 4px 0; }
        @media (max-width: 700px) {
          .tpl-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
