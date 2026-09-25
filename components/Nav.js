"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutGrid, Shield, LogOut, ArrowRight, Menu, X, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Wordmark, { BrandMark } from "./Wordmark";
import { C } from "@/lib/theme";
import "@/app/greetings.css";

/* Per-event nav link accents — mirrors BigDates nav category colours */
const NAV_EVENTS = [
  {
    href: "/#events",
    label: "Events",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    accent: "#B8405E",
    bg: "rgba(184,64,94,.1)",
    border: "rgba(184,64,94,.2)",
  },
  {
    href: "/#how",
    label: "How it works",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    accent: "#5D9BCC",
    bg: "rgba(93,155,204,.1)",
    border: "rgba(93,155,204,.2)",
  },
  {
    href: "/#share",
    label: "Sharing",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    accent: "#6B8E6B",
    bg: "rgba(107,142,107,.1)",
    border: "rgba(107,142,107,.2)",
  },
];

export default function Nav() {
  const { session, profile, signOut } = useAuth();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const inGreetings = pathname?.startsWith("/greetings") || pathname?.startsWith("/g/");

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const out = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className={`w-nav ${solid ? "w-nav-solid" : ""}`}>
      <div className="w-nav-inner wrap" style={{ maxWidth: 1180 }}>

        {/* Logo */}
        <Link href="/" aria-label="Welcvm home" className="w-nav-logo">
          <Wordmark size={26} />
          <span className="w-nav-logo-sub">Invites</span>
        </Link>

        {/* Portal toggle — the whole landing + creation flow swaps between
            invitations and greeting cards; everything else (dashboard,
            login, manage) stays exactly as it was. */}
        <div className="w-portal-toggle w-portal-toggle-header" aria-label="Choose invitations or greeting cards">
          <Link href="/" className={inGreetings ? "" : "active"}>Invitations</Link>
          <Link href="/greetings" className={inGreetings ? "active" : ""}>Greetings</Link>
        </div>

        {/* Desktop nav — BigDates style: icon + text pill links */}
        <nav className="w-nav-links">
          {!session ? (
            NAV_EVENTS.map(({ href, label, icon, accent, bg, border }) => (
              <a
                key={label}
                href={href}
                className="w-nav-link"
                style={{ "--accent": accent, "--category-bg": bg, "--category-border": border }}
              >
                {icon}
                {label}
              </a>
            ))
          ) : (
            <>
              <Link
                href="/dashboard"
                className="w-nav-link"
                style={{ "--accent": "#5D9BCC", "--category-bg": "rgba(93,155,204,.1)", "--category-border": "rgba(93,155,204,.2)" }}
              >
                <LayoutGrid size={14} />
                Dashboard
              </Link>
              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="w-nav-link"
                  style={{ "--accent": "#B8405E", "--category-bg": "rgba(184,64,94,.1)", "--category-border": "rgba(184,64,94,.2)" }}
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="w-nav-actions">
          {!session ? (
            <>
              <Link href="/login" className="w-nav-login">
                <User size={14} />
                Login
              </Link>
              <Link href="/create" className="btn btn-primary btn-sm">
                Create Invite
                <span className="btn-arrow"><ArrowRight size={14} /></span>
              </Link>
            </>
          ) : (
            <button
              onClick={out}
              style={{ background: "none", border: "none", color: C.muted, display: "flex", gap: 7, alignItems: "center", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              <LogOut size={15} /> Log out
            </button>
          )}

          <button
            className="w-nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="w-nav-drawer">
          <div className="w-portal-toggle" style={{ marginBottom: 6 }} aria-label="Choose invitations or greeting cards">
            <Link href="/" onClick={() => setOpen(false)} className={inGreetings ? "" : "active"}>Invitations</Link>
            <Link href="/greetings" onClick={() => setOpen(false)} className={inGreetings ? "active" : ""}>Greetings</Link>
          </div>
          {!session ? (
            <>
              {NAV_EVENTS.map(({ href, label }) => (
                <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
              ))}
              <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
              <Link
                href="/create"
                onClick={() => setOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: "flex-start" }}
              >
                Create Invite <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              {profile?.is_admin && <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>}
              <button onClick={out}>Log out</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

/* Square brand mark — used in AuthForm and elsewhere */
export function Logo({ size = 34 }) {
  return <BrandMark size={size} radius={Math.round(size * 0.31)} />;
}
