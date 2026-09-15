import { NextResponse } from "next/server";
import { readKey } from "@/lib/ai/gemini";
import { chat, providerInfo } from "@/lib/ai/provider";
import { buildSystemPrompt, seedDesignFor } from "@/lib/ai/design-prompt";
import {
  nextWeddingStep,
  ackWeddingStep,
  weddingProgress,
  weddingPublishable,
} from "@/lib/ai/wedding-prompt";
import { readAnswer, acknowledge, PROSE_STEPS } from "@/lib/ai/wedding-script";
import { classifyEvent } from "@/lib/ai/classify";
import { DESIGN_SCHEMA, applyPatch, touchedDesign } from "@/lib/design/tokens";
import { patchWeddingTokens, isCinema, emptyWeddingTokens } from "@/lib/design/wedding-tokens";

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


const has = (v) => typeof v === "string" && v.trim().length > 0;

/* ── Prose, and only prose ─────────────────────────────────────────────
   The interview no longer asks the model to understand anything. This is
   the one place it is still used, for the sentences a script cannot
   write: the paragraph on the card, the line under a function, the two
   sentences of a story chapter, the closing thank-you.

   Every failure mode here is survivable. A bad call, a timeout, a
   rate limit, a malformed reply — the tokens come back unchanged and the
   invitation is still complete, because the couple's own words are
   already in it. Nothing downstream waits on this. */
const PROSE_SCHEMA = {
  type: "object",
  properties: {
    message:     { type: "string", description: "Two warm sentences for the invitation card." },
    description: { type: "string", description: "One warm sentence describing the most recent function." },
    chapter:     { type: "string", description: "Two sentences retelling the couple's moment, in the third person." },
    thankYou:    { type: "string", description: "Two sentences thanking guests." },
  },
};

async function enrichWeddingProse({ tokens, step, said, key, info }) {
  if (info.provider === "gemini" && !key) return tokens;
  try {
    const c = tokens.couple || {};
    const ask = {
      venue: "Write `message`: the invitation paragraph for the card.",
      functionDetail: "Write `description`: one sentence about the function just described.",
      story: "Write `chapter`: two sentences retelling the moment below, warmly, in the third person.",
      thanks: "Write `thankYou`: two sentences thanking the guests.",
    }[step.id];
    if (!ask) return tokens;

    const r = await chat({
      system: `You write copy for wedding invitations. British English, warm, never flowery, never a list, no emoji.
The couple are ${c.bride || "the bride"} and ${c.groom || "the groom"}${tokens.venue?.name ? `, marrying at ${tokens.venue.name}${tokens.venue.city ? `, ${tokens.venue.city}` : ""}` : ""}.
${ask}
Return ONLY that one field. Invent no facts — no dates, no places, no names beyond the two above.`,
      messages: [{ role: "user", content: said || "Write it." }],
      schema: PROSE_SCHEMA,
      maxTokens: 400,
      geminiKey: key,
    });
    if (!r.ok || !r.data) return tokens;
    const d = r.data;

    if (step.id === "venue" && has(d.message)) {
      return patchWeddingTokens(tokens, { invitation: { message: d.message.trim() } });
    }
    if (step.id === "thanks" && has(d.thankYou) && !has(tokens.invitation?.thankYouNote)) {
      return patchWeddingTokens(tokens, { invitation: { thankYouNote: d.thankYou.trim() } });
    }
    if (step.id === "functionDetail" && has(d.description)) {
      const target = [...(tokens.events || [])].reverse().find((e) => has(e.time) && !has(e.description));
      if (target) return patchWeddingTokens(tokens, { events: [{ ...target, description: d.description.trim() }] });
    }
    if (step.id === "story" && has(d.chapter)) {
      const last = (tokens.story || [])[(tokens.story || []).length - 1];
      if (last) return patchWeddingTokens(tokens, { story: [{ ...last, description: d.chapter.trim() }] });
    }
    return tokens;
  } catch {
    /* Prose is a nicety. The invitation does not wait for it. */
    return tokens;
  }
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
       prompt, schema, and token structure.

       The switch is on the event KIND, not on classify's family. The
       wedding family also contains `anniversary` — a silver jubilee is
       not a wedding, and routing it here handed a couple married
       twenty-five years a bride-and-groom interview, "Together With
       Their Families", and a countdown to their own wedding day.

       The wedding FUNCTIONS are the opposite case and do belong here:
       someone who opens with "it's our haldi" is inviting people to a
       wedding, so the haldi becomes the first entry on that wedding's
       timeline rather than an invitation of its own. The list is written
       out rather than derived, so adding a kind to classify.js cannot
       quietly change this routing.

       Once `_cinema` is set the path sticks, so naming a sangeet midway
       through the interview never restarts it. */
    const WEDDING_FUNCTIONS = new Set(["sangeet", "mehendi", "haldi"]);
    const isWedding = kind === "wedding" || WEDDING_FUNCTIONS.has(kind) || isCinema(incoming);

    if (isWedding) {
      /* ── THE WEDDING INTERVIEW RUNS LOCALLY ────────────────────────
         No model call to read the answer. The step plan says what was
         asked, lib/ai/wedding-script.js reads what came back, and both
         are deterministic — so this path cannot stall, cannot return an
         empty question, and cannot invent a date. It also works with the
         AI provider down.

         The model is used afterwards, for prose only, and only when it
         would add something: the invitation paragraph, the line under a
         function, a story chapter, the closing note. That call is
         allowed to fail; the invitation is already complete without it.
         See enrichWeddingProse(). */
      const askedStep = nextWeddingStep(incoming);
      const base = isCinema(incoming) ? incoming : { ...emptyWeddingTokens(), ...incoming };

      /* The latest thing the couple typed — the answer to askedStep. */
      const lastUser = [...convo].reverse().find((m) => m.role === "user");
      const said = String(lastUser?.content || "");

      /* Nothing asked yet: open the interview. */
      if (!askedStep) {
        return NextResponse.json({
          reply: "Everything is answered — your invitation is ready to publish.",
          askNext: "", done: weddingPublishable(base), tokens: base,
          eventKind: "wedding", progress: weddingProgress(base),
          provider: info.provider, elapsedMs: Date.now() - started,
        });
      }

      /* How many times this same step has already bounced, so an
         optional one can bow out rather than ask forever. */
      const attempt = Number(base?._tries?.[askedStep.id] || 0);
      const read = readAnswer(askedStep, said, base, attempt);

      /* An answer we cannot use: ask again, in place, without burning a
         step or a model call. */
      if (read.retry) {
        const bumped = { ...base, _tries: { ...(base._tries || {}), [askedStep.id]: attempt + 1 } };
        return NextResponse.json({
          reply: read.retry,
          askNext: askedStep.ask(base),
          done: false,
          tokens: bumped,
          eventKind: "wedding",
          progress: weddingProgress(base),
          provider: info.provider,
          elapsedMs: Date.now() - started,
        });
      }

      let next = patchWeddingTokens(base, read.patch || {});
      next.eventKind = "wedding";
      next.designed = true;

      /* Photograph and optional steps cannot prove they were answered
         from the tokens alone; record that we put them, or the interview
         asks again every turn and never reaches the end. */
      if (read.skipped || askedStep.ack) next = ackWeddingStep(next, askedStep);

      /* Seed the palette and the standing copy once, on the first turn,
         so the preview has something to draw immediately. */
      if (!has(next.invitation?.kicker)) {
        next = patchWeddingTokens(next, {
          invitation: { kicker: "Together With Their Families", headline: "A celebration of love, music and forever" },
          palette: { primary: "#8f294e", secondary: "#7b594e", accent: "#c69a55", paper: "#fff8ea", text: "#4f392f" },
        });
      }

      /* Prose, from the model, best-effort. */
      if (PROSE_STEPS.has(askedStep.id) && !read.skipped) {
        next = await enrichWeddingProse({ tokens: next, step: askedStep, said, key, info });
      }

      const followUp = nextWeddingStep(next);
      const askNext = followUp ? followUp.ask(next) : "";
      const done = !followUp && weddingPublishable(next);

      return NextResponse.json({
        reply: acknowledge(askedStep, read, next),
        askNext: done ? "" : askNext,
        done,
        tokens: next,
        eventKind: "wedding",
        progress: weddingProgress(next),
        step: askedStep.id,
        group: askedStep.group,
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
