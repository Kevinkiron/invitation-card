"use client";

import Link from "next/link";
import { Logo } from "./Nav";
import { C } from "@/lib/theme";

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 100, background: "rgba(255,255,255,.5)" }}>
      <div className="wrap" style={{ padding: "54px 28px 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 40, flexWrap: "wrap", marginBottom: 36 }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <Logo size={30} />
              <span className="display" style={{ fontSize: 20 }}>Coderpace Invites</span>
            </div>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
              Digital wedding invitations for Indian celebrations — from Roka to Griha Pravesh,
              delivered to every guest on WhatsApp.
            </p>
          </div>

          <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
            <FootCol title="Product" links={[["Features", "/#features"], ["Pricing", "/#pricing"], ["Get started", "/signup"]]} />
            <FootCol title="Account" links={[["Sign in", "/login"], ["Dashboard", "/dashboard"]]} />
          </div>
        </div>

        <div className="rule-orn" style={{ marginBottom: 22 }}>
          <span style={{ fontSize: 12 }}>❖</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: C.muted }}>
          <span>© {new Date().getFullYear()} Coderpace. All rights reserved.</span>
          <span>Hindi · Tamil · Telugu · Marathi · Bengali · English</span>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {links.map(([l, h]) => (
          <Link key={l} href={h} style={{ fontSize: 13.5, color: C.muted }}>{l}</Link>
        ))}
      </div>
    </div>
  );
}
