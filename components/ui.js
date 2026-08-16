"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { C } from "@/lib/theme";

export function Reveal({ children, delay = 0, style, className = "" }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${seen ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

export function Counter({ to, suffix = "", prefix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1500, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function Petals({ count = 16 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 100) / count + (Math.random() * 6 - 3),
        size: 7 + Math.random() * 12,
        dur: 15 + Math.random() * 16,
        delay: Math.random() * 20,
        color: ["#F4C77E", "#EFB9A2", "#E8912D", "#D9B863", "#F2DCC2"][i % 5],
      })),
    [count]
  );
  return (
    <>
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.72,
            background: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

export function Banner({ tone = "info", children }) {
  const map = {
    err: [C.red, "rgba(184,68,63,.09)"],
    ok: [C.green, "rgba(63,125,83,.1)"],
    info: [C.plum, "rgba(59,10,42,.07)"],
  };
  const [fg, bg] = map[tone] || map.info;
  return (
    <div style={{ background: bg, color: fg, padding: "12px 16px", borderRadius: 12, fontSize: 13.5, marginBottom: 16, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "110px 0", color: C.muted, fontSize: 14.5 }}>
      <Loader2 size={18} className="spin" /> {label}
    </div>
  );
}

export function Empty({ title, sub, children }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", maxWidth: 460, margin: "0 auto" }}>
      <div className="display h-lg" style={{ fontSize: 27, marginBottom: 10 }}>{title}</div>
      {sub && <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, margin: "0 0 20px" }}>{sub}</p>}
      {children}
    </div>
  );
}

export function StatusTag({ status }) {
  const m = {
    published: [C.green, "rgba(63,125,83,.12)"],
    pending_payment: ["#9A6B12", "rgba(232,145,45,.16)"],
    draft: [C.muted, "rgba(140,123,112,.12)"],
    accepted: [C.green, "rgba(63,125,83,.12)"],
    declined: [C.red, "rgba(184,68,63,.1)"],
    pending: [C.muted, "rgba(140,123,112,.12)"],
  };
  const [fg, bg] = m[status] || m.draft;
  return <span className="tag" style={{ color: fg, background: bg }}>{String(status).replace(/_/g, " ")}</span>;
}

export function SectionHead({ eyebrow, title, sub, align = "center" }) {
  return (
    <Reveal>
      <div style={{ textAlign: align, marginBottom: 52, maxWidth: align === "center" ? 620 : "none", marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0 }}>
        {eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>
            {eyebrow}
          </div>
        )}
        <h2 className="display h-lg" style={{ fontSize: 44, margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-.01em" }}>
          {title}
        </h2>
        {sub && <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.65, margin: 0 }}>{sub}</p>}
      </div>
    </Reveal>
  );
}
