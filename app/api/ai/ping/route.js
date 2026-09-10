import { NextResponse } from "next/server";
import { modelChain, readKey } from "@/lib/ai/gemini";

/* ══════════════════════════════════════════════════════════════
   Latency probe.

   We have now guessed twice at why the interview call takes >25s.
   This measures it instead.

     /api/ai/ping                     four tiny calls, one per thinking mode
     /api/ai/ping?model=gemini-2.5-flash-lite
     /api/ai/ping?full=1              one call with a realistic payload

   The tiny calls send about 20 tokens and ask for about 10 back, so
   anything above ~2s there is the model or the account queueing, not
   our prompt. If the tiny calls are fast and ?full=1 is slow, the cost
   is in the schema or the prompt and we trim those instead.
   ══════════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const PROBE_MS = 14000;

function thinkingFields(mode) {
  if (mode === "level") return { thinkingLevel: "minimal" };
  if (mode === "budget") return { thinkingConfig: { thinkingBudget: 0 } };
  return {};
}

async function probe({ key, model, mode, withSchema, full }) {
  const contents = full
    ? [{ role: "user", parts: [{ text: "It's a wedding. We're Priya and Arun, getting married on 14 February 2027 at St Mary's, Kochi, at 5pm." }] }]
    : [{ role: "user", parts: [{ text: 'Reply with exactly {"ok":true}' }] }];

  const generationConfig = {
    temperature: 0.2,
    maxOutputTokens: full ? 2048 : 64,
    responseMimeType: "application/json",
    ...thinkingFields(mode),
    ...(withSchema
      ? {
          responseSchema: {
            type: "object",
            properties: { ok: { type: "boolean" }, note: { type: "string" } },
          },
        }
      : {}),
  };

  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_MS);

  try {
    const r = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents, generationConfig }),
      signal: ctrl.signal,
    });
    const ms = Date.now() - started;
    const text = await r.text();

    if (!r.ok) {
      let msg = text.slice(0, 160);
      try { msg = JSON.parse(text)?.error?.message?.slice(0, 160) || msg; } catch {}
      return { model, mode, schema: withSchema, ms, ok: false, status: r.status, error: msg };
    }

    let usage = null, finish = null, chars = 0;
    try {
      const j = JSON.parse(text);
      const c = j?.candidates?.[0];
      finish = c?.finishReason || null;
      chars = (c?.content?.parts || []).map((p) => p.text || "").join("").length;
      // thoughtsTokenCount is the smoking gun: if it is high, the model is
      // still reasoning and whichever thinking field we sent was ignored.
      usage = j?.usageMetadata
        ? {
            prompt: j.usageMetadata.promptTokenCount,
            output: j.usageMetadata.candidatesTokenCount,
            thoughts: j.usageMetadata.thoughtsTokenCount ?? 0,
            total: j.usageMetadata.totalTokenCount,
          }
        : null;
    } catch {}

    return { model, mode, schema: withSchema, ms, ok: true, status: 200, finish, chars, usage };
  } catch (e) {
    return {
      model, mode, schema: withSchema,
      ms: Date.now() - started, ok: false, status: 0,
      error: e.name === "AbortError" ? `aborted at ${PROBE_MS / 1000}s` : e.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req) {
  const { key, error } = readKey();
  if (error) return NextResponse.json({ error }, { status: 500 });

  const url = new URL(req.url);
  const model = url.searchParams.get("model") || modelChain()[0];
  const full = url.searchParams.get("full") === "1";

  const plan = full
    ? [{ mode: "level", withSchema: true }, { mode: "budget", withSchema: true }]
    : [
        { mode: "level",  withSchema: false },
        { mode: "budget", withSchema: false },
        { mode: "none",   withSchema: false },
        { mode: "none",   withSchema: true  },
      ];

  const results = [];
  const startedAll = Date.now();
  for (const p of plan) {
    if (Date.now() - startedAll > 45000) {
      results.push({ skipped: true, reason: "out of budget" });
      break;
    }
    results.push(await probe({ key, model, full, ...p }));
  }

  const good = results.filter((r) => r.ok);
  const fastest = good.length ? good.reduce((a, b) => (a.ms <= b.ms ? a : b)) : null;

  return NextResponse.json({
    model,
    mode: full ? "realistic payload" : "tiny payload",
    results,
    fastestMs: fastest?.ms ?? null,
    verdict: !good.length
      ? "Every probe failed. If they all aborted, the API is not answering in time for this key — check quota/billing in AI Studio."
      : fastest.ms > 8000
        ? "Even a trivial call is slow. That is the model or the account queueing, not our prompt — try a -lite model, or enable billing."
        : "Trivial calls are fast. If /create is still slow, the cost is in the prompt or the response schema, not the API.",
    hint: "Compare with ?full=1, and try ?model=gemini-3.5-flash-lite or ?model=gemini-2.5-flash-lite. A non-zero usage.thoughts means thinking was NOT disabled.",
  });
}
