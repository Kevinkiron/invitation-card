import { NextResponse } from "next/server";
import { modelChain, readKey } from "@/lib/ai/gemini";

/* Diagnostics. Open /api/ai/models in the browser to see exactly which
   models this deployment's key can call, and whether the IDs in
   MODEL_CHAIN are among them. Beats guessing at model names — a wrong
   ID costs a wasted round trip on every single request. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const { key, error } = readKey();
  if (error) return NextResponse.json({ error }, { status: 500 });

  let res;
  try {
    res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
      headers: { "x-goog-api-key": key },
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Could not reach the Gemini API.", detail: e.message },
      { status: 502 }
    );
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json(
      { error: `Gemini returned ${res.status}.`, detail: text.slice(0, 400) },
      { status: res.status }
    );
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Gemini returned a non-JSON body.", detail: text.slice(0, 400) },
      { status: 502 }
    );
  }

  const usable = (body.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""));

  const configured = modelChain();

  return NextResponse.json({
    configured,
    // The whole point: which of the IDs we actually try are real.
    configuredValid: configured.filter((m) => usable.includes(m)),
    configuredMissing: configured.filter((m) => !usable.includes(m)),
    usableCount: usable.length,
    usable,
    hint: "Set GEMINI_MODEL in Vercel to a comma-separated list drawn from `usable` (best first), then redeploy.",
  });
}
