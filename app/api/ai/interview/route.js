import { NextResponse } from "next/server";
import {
  EVENT_TYPES, EVENT_TYPE_LIST, getEventType,
  allowedSlotIds, missingRequired, completeness,
} from "@/lib/ai/event-types";
import { mergeDraft } from "@/lib/ai/draft";
import { TEMPLATES } from "@/lib/templates/registry";

export const runtime = "edge";

/* Same fallback discipline as /api/ai — never pin a single model. */
const MODEL_CHAIN = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];

const FALLTHROUGH = new Set([400, 403, 404, 429, 500, 503]);

const PLACEHOLDERS = new Set(["your_google_ai_studio_key_here", "your_gemini_api_key", "changeme"]);

/* ── Structured output schema ──────────────────────────────────
   Every writable slot is declared explicitly. Gemini's structured
   output needs typed properties, and declaring them here doubles as
   the allow-list that stops the model inventing fields the renderer
   cannot draw. */
const SUB_EVENT = {
  type: "object",
  properties: {
    name: { type: "string" },
    date: { type: "string", description: "YYYY-MM-DD" },
    time: { type: "string", description: "HH:MM 24-hour" },
    venue: { type: "string" },
    address: { type: "string" },
    note: { type: "string" },
  },
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "Warm, brief acknowledgement of what the user just said. One or two sentences. Never repeat the question here." },
    askNext: { type: "string", description: "The single next question to ask. Empty string when done is true." },
    eventType: { type: "string", enum: Object.keys(EVENT_TYPES), description: "Only set when first identified or corrected." },
    done: { type: "boolean", description: "True only when every required slot is filled." },
    offerPhotos: { type: "boolean", description: "True when it is a natural moment to offer adding photos." },
    template: { type: "string", enum: TEMPLATES.map((t) => t.slug), description: "Best-fitting template. Only set once there is enough signal about tone." },
    templateReason: { type: "string", description: "One short sentence on why that template suits them." },
    updates: {
      type: "object",
      description: "Only fields the user has actually supplied. Never guess.",
      properties: {
        celebrants: { type: "array", items: { type: "string" }, description: "First names. One entry for solo events, two for couples." },
        milestone: { type: "string" },
        hosts: { type: "string" },
        primaryDate: { type: "string", description: "YYYY-MM-DD" },
        primaryTime: { type: "string", description: "HH:MM 24-hour" },
        venueName: { type: "string" },
        venueAddress: { type: "string" },
        directions: { type: "string" },
        dressCode: { type: "string" },
        theme: { type: "string" },
        poojaTime: { type: "string", description: "HH:MM 24-hour" },
        rsvpDeadline: { type: "string", description: "YYYY-MM-DD" },
        note: { type: "string" },
        hashtag: { type: "string" },
        storyTitle: { type: "string" },
        story: { type: "string" },
        parentsA: { type: "string" },
        parentsB: { type: "string" },
        subEvents: { type: "array", items: SUB_EVENT },
      },
    },
  },
  required: ["reply", "updates"],
};

function systemPrompt({ eventType, draft, missing, today }) {
  const et = getEventType(eventType);

  const catalogue = TEMPLATES.map((t) => `- ${t.slug}: ${t.name}. ${t.category}. ${t.tagline}`).join("\n");

  const typeList = EVENT_TYPE_LIST.map((t) => `- ${t.id}: ${t.label} — ${t.blurb}`).join("\n");

  const slotLines = et
    ? et.slots
        .map((s) => `- ${s.id} (${s.type}${s.required ? ", required" : ", optional"}): ${s.label}${s.hint ? ` — ${s.hint}` : ""}`)
        .join("\n")
    : "(event type not chosen yet)";

  return `You are the host of a digital invitation studio. You interview one person, warmly and efficiently, and the answers fill a real invitation that updates live beside them as they talk.

Today's date is ${today}. Any date the user gives must be in the future; if they give a bare day and month, assume the next occurrence.

STEP ONE — if the event type is not yet known, your only job is to find out what they are celebrating. Choose from:
${typeList}

CURRENT EVENT TYPE: ${eventType || "not yet identified"}

SLOTS FOR THIS EVENT TYPE:
${slotLines}

ALREADY CAPTURED (do not ask about these again):
${Object.keys(draft || {}).filter((k) => !["eventType", "gallery", "templateSlug"].includes(k)).map((k) => `- ${k}: ${JSON.stringify(draft[k])}`).join("\n") || "- nothing yet"}

STILL MISSING (required): ${missing.length ? missing.join(", ") : "none"}

TEMPLATE CATALOGUE — pick the one whose mood matches what they describe:
${catalogue}

RULES
- Ask ONE question at a time in "askNext". Never stack two questions.
- Put ONLY what the user actually told you into "updates". Never invent names, dates, venues or stories. If they did not say it, leave it out.
- If a single message contains several facts, capture them all in "updates" at once, then ask about what is still missing.
- Prefer required slots first, then a couple of high-value optional ones (story, dress code). Do not grind through every optional field — offer to finish once the required ones are done.
- For a wedding, after the main ceremony details, ask whether there are other functions (mehendi, sangeet, reception, homecoming) and capture them in subEvents.
- Set "offerPhotos" true once the core details are in and it is a natural moment to ask whether they would like to add photos.
- Set "template" as soon as you have a sense of their taste. You may change it later if they describe a different mood.
- Set "done" true only when every required slot is filled. When done is true, "askNext" must be an empty string and "reply" should tell them their invitation is ready to preview.
- Keep "reply" to one or two warm sentences. Do not list what you captured back at them mechanically.
- Write in British English. Never use emoji.`;
}

function readGoogleError(text) {
  try {
    const j = JSON.parse(text);
    return j?.error?.message || j?.error?.status || null;
  } catch { return null; }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages = [], draft = {}, eventType = null } = body;

    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }
    if (PLACEHOLDERS.has(key.toLowerCase())) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is still the placeholder from .env.example. Add a real key from https://aistudio.google.com/apikey in Vercel, then redeploy." },
        { status: 500 }
      );
    }

    const activeType = eventType || draft.eventType || null;
    const missing = activeType ? missingRequired(activeType, draft) : [];
    const today = new Date().toISOString().slice(0, 10);

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-24)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content ?? "") }],
      }));

    if (!contents.length) {
      return NextResponse.json({ error: "No message to send." }, { status: 400 });
    }

    const payload = (withSchema) => JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt({ eventType: activeType, draft, missing, today }) }] },
      contents,
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
        ...(withSchema ? { responseSchema: RESPONSE_SCHEMA } : {}),
      },
    });

    let res = null;
    let lastDetail = "";
    let lastStatus = 502;
    let usedModel = null;

    outer:
    for (const model of MODEL_CHAIN) {
      // Try with the schema first; if a model rejects it, retry the same
      // model prompt-only rather than skipping straight to a weaker model.
      for (const withSchema of [true, false]) {
        let attempt;
        try {
          attempt = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": key },
              body: payload(withSchema),
            }
          );
        } catch (e) {
          lastDetail = `${model}: network error — ${e.message}`;
          continue;
        }

        if (attempt.ok) { res = attempt; usedModel = model; break outer; }

        const text = await attempt.text();
        lastStatus = attempt.status;
        lastDetail = `${model}${withSchema ? " (schema)" : ""}: ${readGoogleError(text) || text.slice(0, 240)}`;

        // A 400 with the schema on is usually schema rejection — worth the
        // prompt-only retry. Any other non-fallthrough status is terminal.
        if (attempt.status === 400 && withSchema) continue;
        if (!FALLTHROUGH.has(attempt.status)) break outer;
        break; // move to the next model
      }
    }

    if (!res) {
      const rateLimited = lastStatus === 429;
      return NextResponse.json(
        {
          error: rateLimited
            ? "The AI is rate limited right now. Wait a moment and try again."
            : "Could not reach the AI service.",
          detail: lastDetail.slice(0, 400),
        },
        { status: rateLimited ? 429 : 502 }
      );
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

    let parsed;
    try {
      parsed = JSON.parse(
        raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim()
      );
    } catch {
      return NextResponse.json(
        { error: "The AI returned something unreadable. Please try again.", detail: raw.slice(0, 200) },
        { status: 502 }
      );
    }

    /* ── Server owns the draft ──────────────────────────────────
       The model proposes; we validate. Anything outside the event
       type's declared slots is discarded, so a hallucinated field can
       never reach the renderer or the database. */
    const nextType = parsed.eventType && EVENT_TYPES[parsed.eventType] ? parsed.eventType : activeType;
    const allowed = new Set(nextType ? allowedSlotIds(nextType) : []);
    // These are writable on every type but are not per-type slots.
    ["hashtag", "storyTitle", "directions", "theme", "milestone", "poojaTime", "parentsA", "parentsB", "story", "subEvents"].forEach((k) => allowed.add(k));

    const cleanUpdates = {};
    for (const [k, v] of Object.entries(parsed.updates || {})) {
      if (allowed.has(k)) cleanUpdates[k] = v;
    }
    // `directions` and `storyTitle` are renderer fields rather than
    // interview slots, so they are permitted but not asked about.
    for (const k of ["directions", "storyTitle"]) {
      if (parsed.updates?.[k]) cleanUpdates[k] = parsed.updates[k];
    }

    let nextDraft = mergeDraft({ ...draft, eventType: nextType }, cleanUpdates);

    const validTemplate = TEMPLATES.some((t) => t.slug === parsed.template) ? parsed.template : null;
    if (validTemplate) nextDraft.templateSlug = validTemplate;

    const nowMissing = nextType ? missingRequired(nextType, nextDraft) : [];

    return NextResponse.json({
      reply: parsed.reply || "",
      askNext: parsed.done ? "" : parsed.askNext || "",
      // Trust the schema, but never report done while a required slot is empty.
      done: Boolean(parsed.done) && nowMissing.length === 0,
      offerPhotos: Boolean(parsed.offerPhotos),
      template: validTemplate,
      templateReason: parsed.templateReason || "",
      draft: nextDraft,
      eventType: nextType,
      missing: nowMissing,
      progress: nextType ? completeness(nextType, nextDraft) : 0,
      model: usedModel,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
