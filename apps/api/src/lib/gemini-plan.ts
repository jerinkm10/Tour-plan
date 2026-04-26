import type { TripPlan, TripRequest } from './trip-types';
import { tripPlanJsonSchema } from './trip-schema';

export type GeminiPlanResult =
  | { ok: true; plan: Partial<TripPlan> }
  | { ok: false; error: string; status?: number };

function promptFor(request: TripRequest): string {
  return `Create a premium travel plan as structured JSON for this request: ${JSON.stringify(request)}.

Requirements:
- Return a destination that matches the user's vibe and requested destination.
- Include exactly ${request.days} itinerary days.
- Include 5 to 9 route stops with x/y coordinates spread like an editorial route map.
- Include a main origin-to-destination transit leg that respects travelMode: ${request.travelMode}.
- Use realistic weather-aware descriptions, realistic budget estimates in USD, and practical local tips.
- Write every user-facing string in English only. Do not use non-English scripts or translated UI text.
- localPhrase and localPhraseMeaning must both be English sentences. Do not return local-language words or non-English scripts.
- imagePrompt must be a concise prompt for a premium travel magazine poster with the destination, weather mood, route style, and color palette.
- theme colors must fit the destination and remain readable on dark UI cards.
- Return only JSON that matches the provided schema.`;
}

function toGeminiSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiSchema);
  if (!value || typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(source)) {
    if (key === 'additionalProperties') continue;
    result[key] = toGeminiSchema(nested);
  }

  if (Array.isArray(result['enum']) && !result['type']) {
    result['type'] = 'string';
  }

  return result;
}

function extractText(data: any): string | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => typeof part?.text === 'string' ? part.text : '')
    .join('')
    .trim();

  return text || null;
}

function cleanJsonText(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function geminiError(status: number, data: any): string {
  const message = data?.error?.message;
  if (typeof message === 'string' && message.trim()) {
    return `Gemini API failed (${status}): ${message}`;
  }
  return `Gemini API failed (${status}).`;
}

export async function createGeminiPlan(request: TripRequest): Promise<GeminiPlanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'GEMINI_API_KEY is missing in the API container environment.' };
  }

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: promptFor(request)
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: toGeminiSchema(tripPlanJsonSchema.schema)
        }
      }),
      signal: AbortSignal.timeout(45000)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, status: response.status, error: geminiError(response.status, data) };
    }

    const text = extractText(data);
    if (!text) {
      return { ok: false, error: 'Gemini API response did not include structured text output.' };
    }

    return { ok: true, plan: JSON.parse(cleanJsonText(text)) as Partial<TripPlan> };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini API error';
    return { ok: false, error: `Gemini API request failed: ${message}` };
  }
}



