/* ══════════════════════════════════════════════════════════════
   One place that talks to Gemini.

   The old code walked 4 models × 3 config variants on EVERY request —
   up to 12 sequential calls. Each miss costs a full round trip, and an
   unknown model ID costs two (once with thinkingLevel, once without).
   Past the platform's function timeout Vercel kills the request and
   returns its own plain-text error page, which is where the
   "Unexpected token 'A', "An error o"..." came from: the client called
   res.json() on "An error occurred with this application."

   Three things stop that happening:

   1. A hard deadline. We never start a call we cannot finish, and we
      always return our own JSON rather than letting the platform
      time us out.
   2. Per-instance memory. A model that 404s is dead for the life of
      this instance; the model+variant that worked is tried first next
      time. Steady state is one call, not twelve.
   3. Per-call abort, so one hung request cannot eat the whole budget.
   ══════════════════════════════════════════════════════════════ */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/* Survives between invocations on a warm instance; harmless when cold. */
const capability = new Map(); // model -> { withSchema, thinkingMode }
const deadModels = new Set(); // models this instance saw a 404/unknown for
let preferredModel = null;    // last model that actually answered

/** Models to try, best first. Override with GEMINI_MODEL (comma-separated). */
export function modelChain() {
  const env = process.env.GEMINI_MODEL?.trim();
  const list = env
    ? env.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        // Lite first, deliberately. The interview turn is short structured
        // extraction plus one warm sentence — it does not need a reasoning
        // model, and the full Flash models were taking >25s per call.
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-3.7-flash",
      ];

  // Anything known-dead in this instance goes last, not never — a cold
  // instance may have been wrong, and the list is short.
  const alive = list.filter((m) => !deadModels.has(m));
  const dead = list.filter((m) => deadModels.has(m));
  const ordered = preferredModel && alive.includes(preferredModel)
    ? [preferredModel, ...alive.filter((m) => m !== preferredModel)]
    : alive;
  return [...ordered, ...dead];
}

/* Full ladder, used only until we learn what a given model accepts.

   Turning thinking OFF is the point of the first two rungs, not a nicety.
   Every Flash model from 2.5 onward reasons by default, and on a long
   system prompt with a large responseSchema that reasoning ran past 20s —
   which is exactly the timeout that was being reported. This is structured
   extraction from one short user message; it needs no deliberation.

   The field is family-specific, and sending the wrong one is a hard 400:
     Gemini 3.x  ->  thinkingLevel: "minimal"
     Gemini 2.5  ->  thinkingConfig: { thinkingBudget: 0 }
   So try each, then fall back to leaving it to the model. */
const LADDER = [
  { withSchema: true,  thinkingMode: "level"  }, // Gemini 3.x
  { withSchema: true,  thinkingMode: "budget" }, // Gemini 2.5
  { withSchema: true,  thinkingMode: "none"   },
  { withSchema: false, thinkingMode: "none"   },
];

function variantsFor(model) {
  const known = capability.get(model);
  return known ? [known] : LADDER;
}

export function readGoogleError(text) {
  try {
    const j = JSON.parse(text);
    return j?.error?.message || j?.error?.status || null;
  } catch {
    return null;
  }
}

/**
 * Call Gemini, stepping down through models and config variants.
 *
 * @param {string}   key          API key
 * @param {Function} buildBody    ({withSchema, thinkingMode}) => JSON string
 * @param {number}   deadlineMs   total budget for all attempts
 * @param {number}   perCallMs    budget for any single call
 * @returns {Promise<{ok:boolean, data?:object, model?:string, status:number, detail:string}>}
 */
export async function generate({ key, buildBody, deadlineMs = 50000, perCallMs = 25000 }) {
  const startedAt = Date.now();
  const left = () => deadlineMs - (Date.now() - startedAt);

  let lastStatus = 502;
  let lastDetail = "";

  for (const model of modelChain()) {
    for (const variant of variantsFor(model)) {
      // Never begin a call we cannot finish inside the budget.
      if (left() < 3000) {
        return {
          ok: false,
          status: 504,
          detail: lastDetail
            ? `Ran out of time after: ${lastDetail}`
            : "Ran out of time before the AI replied.",
        };
      }

      const budget = Math.min(perCallMs, left() - 1500);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), budget);

      let attempt;
      try {
        attempt = await fetch(`${ENDPOINT}/${model}:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Header auth keeps the key out of URLs and proxy access logs.
            "x-goog-api-key": key,
          },
          body: buildBody(variant),
          signal: ctrl.signal,
        });
      } catch (e) {
        clearTimeout(timer);
        lastDetail =
          e.name === "AbortError"
            ? `${model}: timed out after ${Math.round(budget / 1000)}s`
            : `${model}: network error — ${e.message}`;
        continue; // next variant / model
      }
      clearTimeout(timer);

      if (attempt.ok) {
        capability.set(model, variant);
        preferredModel = model;
        deadModels.delete(model);
        let data;
        try {
          data = await attempt.json();
        } catch (e) {
          lastDetail = `${model}: response was not JSON — ${e.message}`;
          continue;
        }
        return { ok: true, data, model, status: 200, detail: "" };
      }

      const text = await attempt.text().catch(() => "");
      lastStatus = attempt.status;
      const tag = `${variant.withSchema ? "schema" : "no-schema"}/think:${variant.thinkingMode}`;
      lastDetail = `${model} (${tag}): ${readGoogleError(text) || text.slice(0, 200)}`;

      /* Two different 400s, and telling them apart is the whole game.

         A rejected CONFIG FIELD looks like:
           Invalid JSON payload received. Unknown name "thinkingLevel"
           at 'generation_config': Cannot find field.
         That model is fine — it just does not take that option, so we step
         down the ladder and try again without it.

         An unknown MODEL looks like:
           models/foo is not found for API version v1beta, or is not
           supported for generateContent.
         That model is genuinely gone and should be retired.

         Check the field case FIRST: it also contains "unknown name", so a
         loose pattern reads a perfectly good model as dead, skips the rest
         of its ladder, and fails the whole request on an option we were
         always willing to drop. */
      const badField = /invalid json payload|cannot find field|unknown name .*at '/i.test(text);

      if (badField) {
        // Try the same model again, one rung down.
        if (variant.thinkingMode !== "none" || variant.withSchema) continue;
        return { ok: false, status: attempt.status, detail: lastDetail };
      }

      const unknownModel =
        attempt.status === 404 ||
        /is not found for api version|not supported for generatecontent|is not found/i.test(text);
      if (unknownModel) {
        deadModels.add(model);
        capability.delete(model);
        break; // next model
      }

      // Any other 400 with optional config set — still worth stepping down.
      if (attempt.status === 400 && (variant.thinkingMode !== "none" || variant.withSchema)) continue;

      // Transient or capacity — try the next model.
      if ([403, 429, 500, 502, 503].includes(attempt.status)) break;

      // Anything else is a real error worth surfacing as-is.
      return { ok: false, status: attempt.status, detail: lastDetail };
    }
  }

  return { ok: false, status: lastStatus, detail: lastDetail || "No model answered." };
}

/** Read the key once, with the placeholder check both routes need. */
const PLACEHOLDERS = new Set([
  "your_google_ai_studio_key_here",
  "your_gemini_api_key",
  "changeme",
]);

export function readKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return { error: "GEMINI_API_KEY is not configured on the server." };
  }
  if (PLACEHOLDERS.has(key.toLowerCase())) {
    return {
      error:
        "GEMINI_API_KEY is still the placeholder from .env.example. Add a real key from https://aistudio.google.com/apikey in Vercel → Settings → Environment Variables, then redeploy.",
    };
  }
  return { key };
}
