"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid, Shield, LogOut, ArrowRight, Menu, X, User, ChevronDown,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import Wordmark, { BrandMark } from "./Wordmark";
import { EVENTS } from "@/lib/design/showcase";

/* ══════════════════════════════════════════════════════════════════════
   Header — light, full width, dark text, event types across the middle.

   The event links come from EVENTS so the header can never drift out of
   step with the occasion grid further down the page; a slug that exists
   in one place and not the other used to produce a nav link to an empty
   /create?event= flow.
   ══════════════════════════════════════════════════════════════════════ */

/* Six across the middle is what fits at 1180px without the row wrapping
   into the logo. The rest stay reachable from the occasion grid and the
   mobile drawer, which lists every one of them. */
const NAV_EVENT_COUNT = 6;

/* The "Services" menu — the page's own sections, not separate products.
   Anchors rather than routes, so the header works from any page: a bare
   "#how" on /create scrolls nowhere. */
const SERVICES = [
  { href: "/#demos", label: "Live demos", desc: "Real invitations, running" },
  { href: "/#how", label: "How it works", desc: "Four steps, start to link" },
  { href: "/#share", label: "Sharing", desc: "One link on WhatsApp" },
  { href: "/#qr", label: "QR on print", desc: "Paper card to phone" },
  { href: "/#why", label: "Why Welcvm", desc: "Designed, not chosen" },
  { href: "/#contact", label: "Contact", desc: "Talk to a human" },
];

export default function Nav() {
  const { session, profile, signOut } = useAuth();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState(false);
  const servicesRef = useRef(null);
  const router = useRouter();

  const navEvents = EVENTS.slice(0, NAV_EVENT_COUNT);

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* The dropdown has to close on Escape and on a click anywhere else, or
     it stays open over the page after the visitor has moved on — and a
     keyboard user who tabs past it has no way back out. */
  useEffect(() => {
    if (!services) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setServices(false);
        servicesRef.current?.querySelector("button")?.focus();
      }
    };
    const onDown = (e) => {
      if (!servicesRef.current?.contains(e.target)) setServices(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [services]);

  /* Closing the drawer on navigation is not automatic for in-page anchors:
     Next does not remount on a hash change, so the drawer would stay open
     covering the section the visitor just jumped to. */
  const closeAll = () => {
    setOpen(false);
    setServices(false);
  };

  const out = async () => {
    closeAll();
    await signOut();
    router.push("/");
  };

  return (
    <header className={`w-nav ${solid ? "w-nav-solid" : ""}`}>
      <div className="w-nav-inner wrap">

        {/* Logo */}
        <Link href="/" aria-label="Welcvm home" className="w-nav-logo">
          <Wordmark size={26} />
          <span className="w-nav-logo-sub">Invites</span>
        </Link>

        {/* Middle — event types, then the Services menu */}
        <nav className="w-nav-links" aria-label="Primary">
          {!session ? (
            <>
              {navEvents.map((e) => (
                <Link key={e.slug} href={`/create?event=${e.slug}`} className="w-nav-link">
                  {e.name}
                </Link>
              ))}

              <div className="w-nav-menu" ref={servicesRef}>
                <button
                  type="button"
                  className="w-nav-link w-nav-menu-btn"
                  aria-expanded={services}
                  aria-haspopup="true"
                  onClick={() => setServices((s) => !s)}
                >
                  Services
                  <ChevronDown size={14} className={services ? "w-nav-chev on" : "w-nav-chev"} />
                </button>

                {services && (
                  <div className="w-nav-pop">
                    {SERVICES.map((s) => (
                      <Link key={s.href} href={s.href} onClick={closeAll} className="w-nav-popitem">
                        <b>{s.label}</b>
                        <span>{s.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="w-nav-link">
                <LayoutGrid size={14} />
                Dashboard
              </Link>
              {profile?.is_admin && (
                <Link href="/admin" className="w-nav-link">
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              <Link href="/#demos" className="w-nav-link">Live demos</Link>
            </>
          )}
        </nav>

        {/* Right — account actions */}
        <div className="w-nav-actions">
          {!session ? (
            <>
              <Link href="/login" className="w-nav-login">
                <User size={14} />
                Login
              </Link>
              <Link href="/create" className="btn btn-primary btn-sm w-nav-cta">
                Create Invite
                <span className="btn-arrow"><ArrowRight size={14} /></span>
              </Link>
            </>
          ) : (
            <button type="button" onClick={out} className="w-nav-signout">
              <LogOut size={15} /> Log out
            </button>
          )}

          <button
            type="button"
            className="w-nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="w-nav-drawer"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer. It carries every event — the desktop row is
          truncated to six for width, the drawer has no such constraint. */}
      {open && (
        <div className="w-nav-drawer" id="w-nav-drawer">
          {!session ? (
            <>
              <p className="w-drawer-h">Occasions</p>
              <div className="w-drawer-events">
                {EVENTS.map((e) => (
                  <Link key={e.slug} href={`/create?event=${e.slug}`} onClick={closeAll} className="w-drawer-chip">
                    {e.name}
                  </Link>
                ))}
              </div>

              <p className="w-drawer-h">Services</p>
              {SERVICES.map((s) => (
                <Link key={s.href} href={s.href} onClick={closeAll}>{s.label}</Link>
              ))}

              <hr className="w-drawer-rule" />
              <Link href="/login" onClick={closeAll}>Login</Link>
              <Link href="/create" onClick={closeAll} className="btn btn-primary btn-sm w-drawer-cta">
                Create Invite <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={closeAll}>Dashboard</Link>
              {profile?.is_admin && <Link href="/admin" onClick={closeAll}>Admin</Link>}
              <Link href="/#demos" onClick={closeAll}>Live demos</Link>
              <Link href="/create" onClick={closeAll} className="btn btn-primary btn-sm w-drawer-cta">
                Create Invite <ArrowRight size={13} />
              </Link>
              <hr className="w-drawer-rule" />
              <button type="button" onClick={out}>Log out</button>
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
