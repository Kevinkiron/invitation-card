/* ══════════════════════════════════════════════════════════════════════
   Provider adapter.

   One interface, two backends. Switch with AI_PROVIDER=gemini|anthropic
   in Vercel — no other file changes. Worth having even if you never
   switch: it is what stops a provider outage or a pricing change from
   being a rewrite, and it makes the two genuinely comparable on your own
   traffic rather than on someone's benchmark.

     chat({ system, messages, schema, maxTokens })
       -> { ok, data, model, status, detail }

   `data` is the parsed object matching `schema`, whichever backend ran.
   ══════════════════════════════════════════════════════════════════════ */

import { generate as geminiGenerate, modelChain } from "./gemini";
import { parseModelJson } from "./json";

const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();

/* ── Gemini ─────────────────────────────────────────────────────────── */
async function viaGemini({ system, messages, schema, maxTokens, key }) {
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content ?? "") }] }));

  const buildBody = ({ withSchema, thinkingMode }) => JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
      ...(thinkingMode === "level" ? { thinkingLevel: "minimal" } : {}),
      ...(thinkingMode === "budget" ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      ...(withSchema ? { responseSchema: schema } : {}),
    },
  });

  const r = await geminiGenerate({ key, buildBody, deadlineMs: 50000, perCallMs: 25000 });
  if (!r.ok) return { ok: false, status: r.status, detail: r.detail, model: null };

  const cand = r.data?.candidates?.[0];
  const raw = (cand?.content?.parts || []).map((p) => p.text || "").join("");
  const parsed = parseModelJson(raw);
  if (!parsed) {
    return {
      ok: false, status: 502, model: r.model,
      detail: cand?.finishReason === "MAX_TOKENS"
        ? "Response hit the token ceiling before the JSON closed."
        : `Unparseable response: ${raw.slice(0, 200)}`,
    };
  }
  return { ok: true, data: parsed, model: r.model, status: 200, detail: "" };
}

/* ── Anthropic ──────────────────────────────────────────────────────────
   Structured output is done with a single-tool forced call: the schema
   becomes the tool's input_schema, tool_choice pins it, and the model
   answers by "calling" the tool. More reliable than asking for JSON in
   prose, because the API validates the shape for us.

   The system prompt is sent as a cacheable block. This workflow re-sends
   the same large prompt on every turn, so cache reads bill at a tenth of
   the input rate — which is most of the running cost. */
async function viaAnthropic({ system, messages, schema, maxTokens }) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { ok: false, status: 500, detail: "ANTHROPIC_API_KEY is not configured.", model: null };

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        tools: [{
          name: "update_invitation",
          description: "Reply to the guest and update the invitation design and content.",
          input_schema: schema,
        }],
        tool_choice: { type: "tool", name: "update_invitation" },
        messages: messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: String(m.content ?? "") })),
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 240);
      try { detail = JSON.parse(text)?.error?.message || detail; } catch {}
      return { ok: false, status: res.status, detail: `${model}: ${detail}`, model };
    }

    const body = JSON.parse(text);
    const block = (body.content || []).find((b) => b.type === "tool_use");
    if (!block) {
      const said = (body.content || []).map((b) => b.text || "").join("").slice(0, 200);
      return { ok: false, status: 502, model, detail: `No structured output returned. ${said}` };
    }
    return { ok: true, data: block.input, model, status: 200, detail: "" };
  } catch (e) {
    return {
      ok: false, status: e.name === "AbortError" ? 504 : 502, model,
      detail: e.name === "AbortError" ? `${model}: timed out after 30s` : e.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function chat({ system, messages, schema, maxTokens = 3000, geminiKey }) {
  if (PROVIDER === "anthropic") return viaAnthropic({ system, messages, schema, maxTokens });
  return viaGemini({ system, messages, schema, maxTokens, key: geminiKey });
}

export function providerInfo() {
  return PROVIDER === "anthropic"
    ? { provider: "anthropic", models: [process.env.ANTHROPIC_MODEL || "claude-haiku-4-5"] }
    : { provider: "gemini", models: modelChain() };
}
