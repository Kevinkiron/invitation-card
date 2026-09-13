"use client";

import Link from "next/link";
import Wordmark from "./Wordmark";
import { C } from "@/lib/theme";

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
              <Wordmark size={22} />
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: ".32em",
                  textTransform: "uppercase",
                  color: C.muted,
                  fontWeight: 600,
                }}
              >
                Invites
              </span>
            </div>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.72, margin: 0 }}>
              Digital invitations that design themselves — weddings, birthdays,
              naming ceremonies and more. Shared as one beautiful link.
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
              ]}
            />
            <FootCol
              title="Account"
              links={[
                ["Sign in", "/login"],
                ["Dashboard", "/dashboard"],
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
          <span>© {new Date().getFullYear()} Welcvm. All rights reserved.</span>
          <span>Invitations, designed for you</span>
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
