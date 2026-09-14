import { NextResponse } from "next/server";
import { readKey } from "@/lib/ai/gemini";
import { chat, providerInfo } from "@/lib/ai/provider";
import { buildSystemPrompt, seedDesignFor } from "@/lib/ai/design-prompt";
import { buildWeddingCinemaPrompt } from "@/lib/ai/wedding-prompt";
import { classifyEvent } from "@/lib/ai/classify";
import { DESIGN_SCHEMA, applyPatch, touchedDesign } from "@/lib/design/tokens";
import { WEDDING_CINEMA_SCHEMA, patchWeddingTokens, cinemaProgress, isCinema, emptyWeddingTokens } from "@/lib/design/wedding-tokens";

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
  const started = Date.now();
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

    /* What the person actually typed. Used both to classify the event
       ourselves and to choose which variant within a family this
       invitation starts from. */
    const said = convo.filter((m) => m.role === "user").map((m) => m.content).join(" \n");

    /* Do not wait for the model to name the event. It frequently omits
       `eventKind`, and when it does every event used to fall back to the
       same cream arch — the "only one template ever shows up" bug. Read
       the conversation instead; the model's own answer still wins when it
       gives one. */
    const guessed = classifyEvent(said);
    const kind = incoming.eventKind || guessed.kind;
    const knownKind = kind;

    /* ── Wedding Cinema path ─────────────────────────────────────────
       Weddings get the cinematic template: a completely different
       prompt, schema, and token structure. The switch is on whether
       the event is a wedding (detected from the conversation or from
       the incoming tokens having the `_cinema` flag). */
    const isWedding = kind === "wedding" || guessed.family === "wedding" || isCinema(incoming);

    if (isWedding) {
      /* Wedding-specific system prompt */
      const weddingSystem = buildWeddingCinemaPrompt({
        tokens: incoming,
        turnCount,
        today: new Date().toISOString().slice(0, 10),
      });

      const wr = await chat({
        system: weddingSystem,
        messages: convo,
        schema: WEDDING_CINEMA_SCHEMA,
        maxTokens: 4000,
        geminiKey: key,
      });

      if (!wr.ok) {
        const rate = wr.status === 429;
        const slow = wr.status === 504;
        return NextResponse.json(
          {
            error: rate ? "The AI is rate limited right now. Wait a moment and try again."
                  : slow ? "The AI took too long to respond. Please try again."
                  : "Could not reach the AI service.",
            detail: (wr.detail || "").slice(0, 400),
            elapsedMs: Date.now() - started,
          },
          { status: rate ? 429 : slow ? 504 : 502 }
        );
      }

      const wp = wr.data || {};

      /* Merge: start from current cinema tokens, patch in the new data */
      const base = isCinema(incoming) ? incoming : { ...emptyWeddingTokens(), ...incoming };
      const next = patchWeddingTokens(base, wp);
      next.eventKind = "wedding";
      next.designed = true;

      const askNext = typeof wp.askNext === "string" ? wp.askNext.trim() : "";
      const reply = dedupeReply(String(wp.reply || "").trim(), askNext);

      return NextResponse.json({
        reply: reply || "Got it.",
        askNext: wp.done ? "" : askNext,
        done: Boolean(wp.done),
        tokens: next,
        eventKind: "wedding",
        progress: cinemaProgress(next),
        model: wr.model,
        provider: info.provider,
        elapsedMs: Date.now() - started,
      });
    }

    /* ── Generic path (non-wedding events) ── */
    const system = buildSystemPrompt({
      tokens: incoming,
      eventKind: knownKind,
      turnCount,
      today: new Date().toISOString().slice(0, 10),
    });

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
    let base = incoming;
    if (kind && !incoming.designed) {
      base = { ...incoming, design: { ...seedDesignFor(kind, said), ...(incoming.design || {}) } };
    }

    const next = applyPatch(base, patch);
    next.eventKind = kind || next.eventKind || null;
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
