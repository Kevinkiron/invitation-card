import { NextResponse } from "next/server";
import { parseModelJson } from "@/lib/ai/json";
import { generate, modelChain, readKey } from "@/lib/ai/gemini";

/* nodejs, not edge — see lib/ai/gemini.js for why. Model selection and the
   retry ladder live there too, so both AI routes share one implementation
   and one per-instance memory of what actually works. */
export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_MS = 45000;
const PER_CALL_MS = 20000;

const SYSTEM = `You are an expert designer of Indian wedding invitations working inside a design tool.
The user describes a change in plain language; you return an updated design configuration.

Respond with ONLY a raw JSON object. No markdown fences, no commentary. Shape:
{
  "reply": "one short, warm sentence describing what you changed",
  "config": {
    "palette": ["#mainHex", "#accentHex", "#backgroundHex"],
    "font": "serif" | "sans",
    "motif": "marigold" | "peacock" | "paisley" | "line",
    "headline": "string",
    "subheadline": "string"
  }
}

Rules:
- palette is exactly three hex colours in the order [main, accent, background].
- "main" is a deep, saturated colour used behind white text. "accent" is a metallic or bright highlight. "background" must stay very pale so dark text stays readable.
- Draw on Indian wedding aesthetics: marigold orange, maroon, peacock teal, antique gold, indigo, banarasi rose, ivory.
- Keep every field the user did NOT ask about identical to the current configuration.
- Never invent event names, dates or venues — those come from the user's own data.
- Keep subheadline under 120 characters.`;

export async function POST(req) {
  try {
    const { messages = [], config = {} } = await req.json();

    const { key, error: keyError } = readKey();
    if (keyError) return NextResponse.json({ error: keyError }, { status: 500 });

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content ?? "") }],
      }));

    if (contents.length === 0) {
      return NextResponse.json(
        { error: "No message to send. Describe the change you'd like." },
        { status: 400 }
      );
    }

    const makeBody = (withThinking) => JSON.stringify({
      systemInstruction: {
        parts: [{ text: `${SYSTEM}\n\nCurrent configuration: ${JSON.stringify(config)}` }],
      },
      contents,
      generationConfig: {
        temperature: 0.8,
        // Gemini 3 models think by default at "medium", and thinking tokens
        // count against maxOutputTokens — at 900 the JSON was being cut off
        // before it closed. Headroom plus minimal thinking.
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        ...(withThinking ? { thinkingLevel: "minimal" } : {}),
      },
    });

    const started = Date.now();
    const result = await generate({
      key,
      buildBody: ({ withThinking }) => makeBody(withThinking),
      deadlineMs: MAX_MS,
      perCallMs: PER_CALL_MS,
    });

    if (!result.ok) {
      const rateLimited = result.status === 429;
      const timedOut = result.status === 504;
      return NextResponse.json(
        {
          error: rateLimited
            ? "The AI design service is rate limited right now. Wait a moment and try again."
            : timedOut
              ? "The AI design service took too long to respond. Please try again."
              : "The AI design service could not be reached.",
          detail: result.detail.slice(0, 400),
          triedModels: modelChain(),
          elapsedMs: Date.now() - started,
        },
        { status: rateLimited ? 429 : timedOut ? 504 : 502 }
      );
    }

    const data = result.data;
    const usedModel = result.model;
    const candidate = data?.candidates?.[0];
    const raw = candidate?.content?.parts?.map((p) => p.text).join("") ?? "";

    // parseModelJson also rescues a response cut off mid-object, so a
    // truncated design edit still applies instead of being dropped.
    const parsed = parseModelJson(raw) || {
      reply:
        candidate?.finishReason === "MAX_TOKENS"
          ? "That was a bit long for me to finish — could you ask for one change at a time?"
          : "I couldn't parse that — could you rephrase?",
      config: null,
    };

    return NextResponse.json({ ...parsed, model: usedModel });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
