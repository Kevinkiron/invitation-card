"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Banner, Petals } from "@/components/ui";
import Nav from "@/components/Nav";
import { Logo } from "@/components/Nav";
import { C } from "@/lib/theme";

export default function AuthForm({ mode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirect, setRedirect] = useState("/dashboard");
  const router = useRouter();

  // Read once on mount so a link like /login?redirect=/create%3Ftemplate%3D...
  // sends the person back to what they were doing (e.g. picking a template
  // from the landing page) instead of always dropping them on /dashboard.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("redirect");
    if (p && p.startsWith("/")) setRedirect(p);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) {
          if (name) await supabase.from("profiles").update({ full_name: name }).eq("id", data.user.id);
          router.push(redirect);
        } else {
          setOk("Account created. Please confirm your email, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        router.push(redirect);
      }
    } catch (ex) {
      setErr(ex.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Petals count={9} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Nav />
        <div style={{ maxWidth: 440, margin: "40px auto 90px", padding: "0 24px" }}>
          <div className="card" style={{ padding: 38, animation: "msgIn .65s var(--ease) both" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <Logo size={44} />
            </div>
            <h1 className="display" style={{ fontSize: 30, margin: "0 0 8px", textAlign: "center" }}>
              {mode === "signup" ? "Begin your invitation" : "Welcome back"}
            </h1>
            <p style={{ color: C.muted, fontSize: 14.5, textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
              {mode === "signup"
                ? "Free to build and preview. Pay only when you publish."
                : "Sign in to manage your invitations and RSVPs."}
            </p>

            {err && <Banner tone="err">{err}</Banner>}
            {ok && <Banner tone="ok">{ok}</Banner>}

            <form onSubmit={submit}>
              {mode === "signup" && (
                <div className="field">
                  <label>Your name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" />
                </div>
              )}
              <div className="field">
                <label>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
                {busy ? (
                  <><Loader2 size={16} className="spin" /> Please wait…</>
                ) : (
                  <>{mode === "signup" ? "Create my account" : "Sign in"} <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: C.muted }}>
              {mode === "signup" ? (
                <>Already have an account? <Link href="/login" style={{ color: C.maroon, fontWeight: 700 }}>Sign in</Link></>
              ) : (
                <>New here? <Link href="/signup" style={{ color: C.maroon, fontWeight: 700 }}>Create a free account</Link></>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
