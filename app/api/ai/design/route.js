import { NextResponse } from "next/server";
import { readKey } from "@/lib/ai/gemini";
import { chat, providerInfo } from "@/lib/ai/provider";
import { buildSystemPrompt, seedDesignFor } from "@/lib/ai/design-prompt";
import { DESIGN_SCHEMA, applyPatch, touchedDesign } from "@/lib/design/tokens";

/* ══════════════════════════════════════════════════════════════════════
   The generative interview.

   Replaces the template-picking route. The model no longer chooses one
   of five prebuilt designs — it writes the design itself, as tokens,
   and lib/design/renderer.js draws it. Same call shape as before so the
   client change stays small.
   ══════════════════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const maxDuration = 60;

/* Roughly how far through the interview we are. The old route computed
   this from required slots; with a free-form event type there is no
   fixed slot list, so completeness is judged on what a reader needs. */
function progressOf(tokens) {
  const c = tokens?.content || {};
  const have = [
    Boolean(c.headline),
    Boolean(c.subhead),
    Boolean(c.place),
    Boolean(c.sections?.length),
    Boolean(tokens?.design?.palette?.bg),
  ].filter(Boolean).length;
  return Math.round((have / 5) * 100);
}

/* The model often puts the question in BOTH `reply` and `askNext`, and
   the client joins the two — which is why the chat showed the same
   question twice in one bubble. Prompting alone did not fix it, so
   strip it here where the outcome is deterministic. */
function dedupeReply(reply, askNext) {
  if (!reply || !askNext) return reply || "";
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const q = norm(askNext);
  if (!q) return reply;

  // Drop any sentence in the reply that is essentially the question again.
  const kept = reply
    .split(/(?<=[.?!])\s+/)
    .filter((sent) => {
      const s = norm(sent);
      if (!s) return false;
      if (s === q || s.includes(q) || q.includes(s)) return false;
      // Also catch near-duplicates: most of the question's words, and a "?"
      const qWords = new Set(q.split(" ").filter((w) => w.length > 3));
      if (!qWords.size) return true;
      const hits = [...qWords].filter((w) => s.includes(w)).length;
      return !(sent.trim().endsWith("?") && hits / qWords.size > 0.6);
    })
    .join(" ")
    .trim();

  return kept;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages = [], tokens: incoming = {}, turnCount = 0 } = body;

    const { key, error: keyError } = readKey();
    const info = providerInfo();
    if (info.provider === "gemini" && keyError) {
      return NextResponse.json({ error: keyError }, { status: 500 });
    }

    const convo = messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-20);
    if (!convo.length) {
      return NextResponse.json({ error: "No message to send." }, { status: 400 });
    }

    const system = buildSystemPrompt({
      tokens: incoming,
      eventKind: incoming.eventKind,
      turnCount,
      today: new Date().toISOString().slice(0, 10),
    });

    const started = Date.now();
    const r = await chat({
      system,
      messages: convo,
      schema: DESIGN_SCHEMA,
      maxTokens: 4000,
      geminiKey: key,
    });

    if (!r.ok) {
      const rate = r.status === 429;
      const slow = r.status === 504;
      return NextResponse.json(
        {
          error: rate ? "The AI is rate limited right now. Wait a moment and try again."
               : slow ? "The AI took too long to respond. Please try again."
               : "Could not reach the AI service.",
          detail: (r.detail || "").slice(0, 400),
          elapsedMs: Date.now() - started,
        },
        { status: rate ? 429 : slow ? 504 : 502 }
      );
    }

    const patch = r.data || {};

    /* The model proposes; applyPatch decides. Anything off-vocabulary, any
       bad colour, any unsafe link is dropped before it can reach the
       renderer.

       One extra step first: on the turn we learn what kind of event this
       is, seed the design from that event family BEFORE applying the
       model's patch. Models frequently send a palette and forget the
       frame and motif, and a half-specified design would otherwise
       inherit the generic default — which is how a concert came out with
       a wedding's arch and botanical leaves. Seed first, model wins. */
    const kind = patch.eventKind || incoming.eventKind;
    let base = incoming;
    if (kind && !incoming.designed) {
      base = { ...incoming, design: { ...seedDesignFor(kind), ...(incoming.design || {}) } };
    }

    const next = applyPatch(base, patch);
    // Seeding alone is not the model designing; only a real patch counts.
    next.designed = Boolean(incoming.designed) || touchedDesign(patch.design || {}) || Boolean(kind);

    const askNext = typeof patch.askNext === "string" ? patch.askNext.trim() : "";
    const reply = dedupeReply(String(patch.reply || "").trim(), askNext);

    return NextResponse.json({
      reply: reply || "Got it.",
      askNext: patch.done ? "" : askNext,
      done: Boolean(patch.done),
      tokens: next,
      eventKind: next.eventKind,
      progress: progressOf(next),
      model: r.model,
      provider: info.provider,
      elapsedMs: Date.now() - started,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
