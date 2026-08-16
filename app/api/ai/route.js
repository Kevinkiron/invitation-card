import { NextResponse } from "next/server";

export const runtime = "edge";

const MODEL = "gemini-2.0-flash";

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

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content ?? "") }],
      }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `${SYSTEM}\n\nCurrent configuration: ${JSON.stringify(config)}` }],
          },
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 900,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Gemini request failed", detail: detail.slice(0, 400) },
        { status: 502 }
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
      parsed = { reply: raw || "I couldn't parse that — could you rephrase?", config: null };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
