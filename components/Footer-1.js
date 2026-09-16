"use client";

import Link from "next/link";
import Wordmark from "./Wordmark";
import { C } from "@/lib/theme";

/* ══════════════════════════════════════════════════════════════════════
   Footer — dark, full width.

   Styles stay inline here rather than moving into app/landing.css: the
   footer is rendered on /create, /manage and the guest pages too, and
   landing.css is imported by the landing page alone. A class defined
   there would leave the footer unstyled everywhere else.

   TODO (owner) — nothing below is invented, which means several things
   the reference site has are simply absent until you supply them:
     · SOCIALS — the real handles/URLs for Instagram, WhatsApp, YouTube
       etc. Empty for now; the row does not render.
     · LEGAL — links to the Privacy Policy, Terms and the Refund /
       Cancellation page. Add them once those routes exist; a link to a
       page that 404s is worse than no link.
     · A company name, registered address or GST number, if Welcvm is
       required to display them. We have not guessed any of these.
   ══════════════════════════════════════════════════════════════════════ */

const SOCIALS = []; // e.g. [{ label: "Instagram", href: "https://instagram.com/…" }]
const LEGAL = [];   // e.g. [["Privacy", "/privacy"], ["Terms", "/terms"]]

const INK = "#FBF6F2";       // footer foreground
const DIM = "rgba(251,246,242,.62)";
const RULE = "rgba(251,246,242,.14)";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 72,
        background: "linear-gradient(180deg, #3B0A2A 0%, #2A0720 100%)",
        color: INK,
      }}
    >
      <div className="wrap" style={{ padding: "56px 16px 28px" }}>

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          {/* Brand. Wordmark paints itself in the brand's dark ink, which
              disappears on this background — so it sits on a small light
              plaque rather than being recoloured from the outside. */}
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: 12,
                  padding: "8px 12px",
                }}
              >
                <Wordmark size={22} />
              </span>
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: ".32em",
                  textTransform: "uppercase",
                  color: DIM,
                  fontWeight: 600,
                }}
              >
                Invites
              </span>
            </div>
            <p style={{ color: DIM, fontSize: 13.5, lineHeight: 1.72, margin: 0 }}>
              Invitation websites designed for one event, not chosen from a
              shelf — weddings, naming ceremonies, birthdays and more, shared
              as a single link.
            </p>

            {SOCIALS.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: `1px solid ${RULE}`,
                      color: INK,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {s.label.slice(0, 2)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            <FootCol
              title="Occasions"
              links={[
                ["All occasions", "/#events"],
                ["Live demos", "/#demos"],
                ["Create invitation", "/create"],
              ]}
            />
            <FootCol
              title="Learn"
              links={[
                ["How it works", "/#how"],
                ["Sharing", "/#share"],
                ["Why Welcvm", "/#why"],
              ]}
            />
            <FootCol
              title="Account"
              links={[
                ["Login", "/login"],
                ["Dashboard", "/dashboard"],
                ["Contact", "/#contact"],
              ]}
            />
          </div>
        </div>

        {/* Ornamental rule */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <span style={{ flex: 1, height: 1, background: RULE }} />
          <span style={{ fontSize: 12, color: C.gold }}>❖</span>
          <span style={{ flex: 1, height: 1, background: RULE }} />
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 12.5,
            color: DIM,
          }}
        >
          <span>© {new Date().getFullYear()} Welcvm. All rights reserved.</span>

          {LEGAL.length > 0 ? (
            <span style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {LEGAL.map(([l, h]) => (
                <Link key={l} href={h} style={{ color: DIM }}>{l}</Link>
              ))}
            </span>
          ) : (
            <span>Invitations, designed for you</span>
          )}
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: C.gold,
          margin: "0 0 14px",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([l, h]) => (
          <Link
            key={l}
            href={h}
            style={{
              fontSize: 13.5,
              color: DIM,
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = DIM)}
            onFocus={(e) => (e.currentTarget.style.color = INK)}
            onBlur={(e) => (e.currentTarget.style.color = DIM)}
          >
            {l}
          </Link>
        ))}
      </div>
    </nav>
  );
}
