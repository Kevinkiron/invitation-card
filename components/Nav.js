"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Shield, LogOut, ArrowRight, Menu, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { C } from "@/lib/theme";

export default function Nav() {
  const { session, profile, signOut } = useAuth();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
    <header
      style={{
        position: "sticky", top: 0, zIndex: 80,
        background: solid ? "rgba(253,246,234,.82)" : "transparent",
        backdropFilter: solid ? "saturate(180%) blur(16px)" : "none",
        WebkitBackdropFilter: solid ? "saturate(180%) blur(16px)" : "none",
        borderBottom: `1px solid ${solid ? C.line : "transparent"}`,
        transition: "all .4s var(--ease)",
      }}
    >
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 28px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo />
          <span style={{ lineHeight: 1 }}>
            <span className="display" style={{ fontSize: 21, letterSpacing: ".015em", display: "block" }}>Welcvm</span>
            <span style={{ fontSize: 8.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.muted, display: "block", marginTop: 3 }}>
              Invites
            </span>
          </span>
        </Link>

        <nav className="nav-desk" style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 14.5, fontWeight: 600 }}>
          {!session ? (
            <>
              {/* No "Templates" link any more — the product no longer has
                  templates, and advertising a gallery undercuts the one
                  thing that makes it different. */}
              <a href="/#events" style={{ color: C.muted }}>Events</a>
              <a href="/#how" style={{ color: C.muted }}>How it works</a>
              <a href="/#share" style={{ color: C.muted }}>Sharing</a>
              <Link href="/login" style={{ color: C.ink }}>Sign in</Link>
              <Link href="/create" className="btn btn-primary btn-sm">
                Create invitation <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" style={{ color: C.muted, display: "flex", gap: 7, alignItems: "center" }}>
                <LayoutGrid size={16} /> Dashboard
              </Link>
              {profile?.is_admin && (
                <Link href="/admin" style={{ color: C.maroon, display: "flex", gap: 7, alignItems: "center" }}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button onClick={out} style={{ background: "none", border: "none", color: C.muted, display: "flex", gap: 7, alignItems: "center", fontSize: 14.5, fontWeight: 600 }}>
                <LogOut size={16} /> Log out
              </button>
            </>
          )}
        </nav>

        <button className="nav-burger" onClick={() => setOpen((o) => !o)} style={{ display: "none", background: "none", border: "none", color: C.ink }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.line}`, background: "rgba(253,246,234,.97)", padding: "18px 28px", display: "flex", flexDirection: "column", gap: 16, fontWeight: 600 }}>
          {!session ? (
            <>
              <a href="/#events" onClick={() => setOpen(false)}>Events</a>
              <a href="/#how" onClick={() => setOpen(false)}>How it works</a>
              <a href="/#share" onClick={() => setOpen(false)}>Sharing</a>
              <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/create" onClick={() => setOpen(false)} className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>Create invitation</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              {profile?.is_admin && <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>}
              <button onClick={out} style={{ background: "none", border: "none", textAlign: "left", fontWeight: 600, color: C.muted }}>Log out</button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 860px) {
          .nav-desk { display: none !important; }
          .nav-burger { display: block !important; }
        }
      `}</style>
    </header>
  );
}

export function Logo({ size = 34 }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 11,
        background: `linear-gradient(140deg, ${C.maroon}, ${C.plumDeep})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 6px 16px -8px ${C.plum}`,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="12" cy="6.4" rx="2.1" ry="4.2" stroke={C.marigold} strokeWidth="1.15" transform={`rotate(${i * 45} 12 12)`} />
        ))}
        <circle cx="12" cy="12" r="1.7" fill={C.marigold} />
      </svg>
    </span>
  );
}
