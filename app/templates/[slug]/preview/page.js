"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Maximize2, X, Smartphone, Monitor } from "lucide-react";
import Nav from "@/components/Nav";
import PhoneFrame from "@/components/PhoneFrame";
import InvitationRenderer from "@/components/InvitationRenderer";
import { getTemplateMeta, TEMPLATES } from "@/lib/templates/registry";
import { DEMO_INVITATION } from "@/lib/demo-data";
import { C } from "@/lib/theme";

export default function TemplatePreviewPage() {
  const { slug } = useParams();
  const meta = TEMPLATES.find((t) => t.slug === slug);
  const [full, setFull] = useState(false);
  const [device, setDevice] = useState("mobile");

  // Close the fullscreen overlay on Escape, and stop the page behind it
  // from scrolling while it is open.
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => { if (e.key === "Escape") setFull(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  if (!meta) return notFound();

  const dark = ["#0B0A0E", "#120A0D"].includes(meta.theme.bg);
  const statusColor = dark ? "rgba(255,255,255,.9)" : "rgba(20,16,14,.85)";
  const isMobile = device === "mobile";

  return (
    <>
      <Nav />
      <main style={{ background: C.paper, minHeight: "100vh", paddingBottom: 70 }}>
        <div className="wrap" style={{ padding: "26px 28px 0" }}>
          <Link href="/templates" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: C.muted }}>
            <ArrowLeft size={15} /> All templates
          </Link>
        </div>

        <div className="prev-grid wrap" style={{ padding: "22px 28px 0" }}>
          {/* ── LEFT: template information ── */}
          <aside className="prev-info">
            <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, fontWeight: 800, marginBottom: 10 }}>
              {meta.category}
            </div>
            <h1 className="display" style={{ fontSize: 38, lineHeight: 1.1, marginBottom: 10 }}>{meta.name}</h1>
            <p style={{ fontSize: 14.5, color: C.maroon, fontWeight: 600, marginBottom: 14 }}>{meta.tagline}</p>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 22 }}>{meta.description}</p>

            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {meta.swatches.map((s) => (
                <span key={s} style={{ width: 30, height: 30, borderRadius: 8, background: s, border: `1px solid ${C.line}` }} title={s} />
              ))}
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: C.muted, fontWeight: 800, marginBottom: 11 }}>
                What's in this design
              </div>
              {meta.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 8 }}>
                  <Check size={14} color={C.gold} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: C.muted, fontWeight: 800, marginBottom: 11 }}>
                Sections included
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {meta.sections.map((s) => (
                  <span key={s} style={{ fontSize: 11.5, fontWeight: 600, padding: "5px 11px", borderRadius: 999, background: "#fff", border: `1px solid ${C.line}`, color: C.muted }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <Link href={`/create?template=${meta.slug}`} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Use this template <ArrowRight size={16} />
            </Link>
            <button onClick={() => setFull(true)} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
              <Maximize2 size={15} /> Open full preview
            </button>
          </aside>

          {/* ── CENTRE: the live invitation ── */}
          <div className="prev-stage">
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 }}>
              {[["mobile", Smartphone, "Mobile"], ["desktop", Monitor, "Desktop"]].map(([k, Icon, lbl]) => (
                <button
                  key={k}
                  onClick={() => setDevice(k)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                    padding: "8px 15px", borderRadius: 999, fontSize: 11.5, fontWeight: 800,
                    letterSpacing: ".08em", textTransform: "uppercase",
                    border: `1px solid ${device === k ? C.maroon : C.line}`,
                    background: device === k ? C.maroon : "#fff",
                    color: device === k ? C.ivory : C.muted,
                    transition: "all .3s",
                  }}
                >
                  <Icon size={13} /> {lbl}
                </button>
              ))}
            </div>

            {isMobile ? (
              <PhoneFrame width={330} height={690} statusColor={statusColor} label={`${meta.name} live preview`}>
                <InvitationRenderer templateId={meta.slug} mode="preview" invitationData={DEMO_INVITATION} />
              </PhoneFrame>
            ) : (
              /* Desktop view: the same renderer, just given a wider,
                 taller viewport — the templates are fluid, so this is a
                 real responsive check, not a different implementation. */
              <div
                style={{
                  width: "100%", maxWidth: 760, height: 690, overflowY: "auto",
                  borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff",
                  boxShadow: "var(--shadow-md)", overscrollBehavior: "contain",
                }}
              >
                <InvitationRenderer templateId={meta.slug} mode="preview" invitationData={DEMO_INVITATION} />
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 16, maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              This is the live template. Scroll it, tap a photo, try the RSVP — it behaves exactly as
              your guests will see it.
            </p>
          </div>
        </div>
      </main>

      {/* ── Fullscreen overlay ── */}
      {full && (
        <div
          role="dialog" aria-modal="true" aria-label={`${meta.name} full preview`}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(16,10,14,.93)", backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 20, gap: 18, animation: "msgIn .32s var(--ease) both",
          }}
        >
          <button
            onClick={() => setFull(false)}
            aria-label="Close full preview"
            style={{
              position: "absolute", top: 18, right: 20, width: 42, height: 42, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.08)",
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>

          <PhoneFrame width={340} height="min(74vh, 720px)" statusColor={statusColor} label={`${meta.name} full preview`}>
            <InvitationRenderer templateId={meta.slug} mode="preview" invitationData={DEMO_INVITATION} />
          </PhoneFrame>

          <Link href={`/create?template=${meta.slug}`} className="btn btn-primary btn-lg">
            Use this template <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <style jsx>{`
        .prev-grid {
          display: grid;
          grid-template-columns: minmax(280px, 380px) 1fr;
          gap: 46px;
          align-items: start;
        }
        .prev-info { position: sticky; top: 92px; }
        .prev-stage { display: flex; flex-direction: column; align-items: center; }
        @media (max-width: 940px) {
          .prev-grid { grid-template-columns: 1fr; gap: 34px; }
          .prev-info { position: static; order: 2; }
          .prev-stage { order: 1; }
        }
      `}</style>
    </>
  );
}
