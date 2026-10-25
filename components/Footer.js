"use client";

import Link from "next/link";
import Wordmark from "./Wordmark";
import { C } from "@/lib/theme";
import { COMPANY } from "@/lib/company";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.line}`,
        marginTop: 80,
        background: "#fff",
      }}
    >
      <div className="wrap" style={{ padding: "52px 28px 32px" }}>

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <Wordmark size={24} tld=".com" />
            </div>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.72, margin: 0 }}>
              Invitations that bring them together, greetings that make their
              day — designed for the moment and shared as one beautiful link.
            </p>
            <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.7, margin: "14px 0 0" }}>
              {COMPANY.legalName} · {COMPANY.address}<br />
              Support: <a href={`mailto:${COMPANY.email}`} style={{ color: C.ink, fontWeight: 700 }}>{COMPANY.email}</a>
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            <FootCol
              title="Product"
              links={[
                ["Events", "/#events"],
                ["How it works", "/#how"],
                ["Create invitation", "/create"],
                ["Greeting cards", "/greetings"],
              ]}
            />
            <FootCol
              title="Account"
              links={[
                ["Sign in", "/login"],
                ["Dashboard", "/dashboard"],
              ]}
            />
            <FootCol
              title="Legal"
              links={[
                ["Terms & Conditions", "/terms"],
                ["Refunds & cancellations", "/terms#refunds"],
                ["Privacy Policy", "/privacy"],
              ]}
            />
          </div>
        </div>

        {/* Ornamental rule */}
        <div className="rule-orn" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: C.gold }}>❖</span>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 12.5,
            color: C.muted,
          }}
        >
          <span>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</span>
          <span>Invitations &amp; greeting cards, designed for you</span>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([l, h]) => (
          <Link
            key={l}
            href={h}
            style={{
              fontSize: 13.5,
              color: C.muted,
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            {l}
          </Link>
        ))}
      </div>
    </div>
  );
}
