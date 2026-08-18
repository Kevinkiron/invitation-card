import { NextResponse } from "next/server";
import { parseModelJson } from "@/lib/ai/json";

export const runtime = "edge";

// Model fallback chain. gemini-2.0-flash was shut down on 1 June 2026 — never
// hardcode a single model name here again. GEMINI_MODEL (optional) pins one
// model and skips the chain.
const MODEL_CHAIN = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];

// Status codes worth retrying on the next model in the chain.
// 400 is included because Google returns it for an unknown model name.
const FALLTHROUGH = new Set([400, 403, 404, 429, 500, 503]);

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

const PLACEHOLDERS = new Set([
  "your_google_ai_studio_key_here",
  "your_gemini_api_key",
  "changeme",
]);

function readGoogleError(text) {
  try {
    const j = JSON.parse(text);
    return j?.error?.message || j?.error?.status || null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const { messages = [], config = {} } = await req.json();

    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }
    if (PLACEHOLDERS.has(key.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is still set to the placeholder value from .env.example. Add a real key from https://aistudio.google.com/apikey in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 500 }
      );
    }

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

    let res = null;
    let lastDetail = "";
    let lastStatus = 502;
    let usedModel = null;

    outer:
    for (const model of MODEL_CHAIN) {
      // thinkingLevel is Gemini-3 only; drop it before writing off a model.
      for (const withThinking of [true, false]) {
      let attempt;
      try {
        attempt = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Header auth keeps the key out of the URL (and out of any
              // proxy/CDN access log that records query strings).
              "x-goog-api-key": key,
            },
            body: makeBody(withThinking),
          }
        );
      } catch (e) {
        lastDetail = `${model}: network error — ${e.message}`;
        continue;
      }

      if (attempt.ok) {
        res = attempt;
        usedModel = model;
        break outer;
      }

      const text = await attempt.text();
      lastStatus = attempt.status;
      lastDetail = `${model}${withThinking ? " (thinking)" : ""}: ${readGoogleError(text) || text.slice(0, 300)}`;

      // A 400 with thinkingLevel set is usually this model not knowing the
      // field — retry it without before moving on.
      if (attempt.status === 400 && withThinking) continue;
      // Not a fallthrough-worthy failure — stop and report it.
      if (!FALLTHROUGH.has(attempt.status)) break outer;
      break; // model unavailable — next model
      }
    }

    if (!res) {
      const rateLimited = lastStatus === 429;
      return NextResponse.json(
        {
          error: rateLimited
            ? "The AI design service is rate limited right now. Wait a moment and try again."
            : "The AI design service could not be reached.",
          detail: lastDetail.slice(0, 400),
          triedModels: MODEL_CHAIN,
        },
        { status: rateLimited ? 429 : 502 }
      );
    }

    const data = await res.json();
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
