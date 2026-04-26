import type { TripPlan, TripRequest } from './trip-types';
import { tripPlanJsonSchema } from './trip-schema';

export type OpenAIPlanResult =
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
- theme colors must fit the destination and remain readable on dark UI cards.`;
}

function extractResponseText(data: any): string | null {
  if (typeof data?.output_text === 'string') return data.output_text;
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === 'string') return part.text;
      if (typeof part?.content === 'string') return part.content;
    }
  }
  return null;
}

function openAIError(status: number, data: any): string {
  const message = data?.error?.message;
  if (typeof message === 'string' && message.trim()) {
    return `OpenAI API failed (${status}): ${message}`;
  }
  return `OpenAI API failed (${status}).`;
}

export async function createOpenAIPlan(request: TripRequest): Promise<OpenAIPlanResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'OPENAI_API_KEY is missing in the API container environment.' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-2024-07-18',
        input: [
          {
            role: 'system',
            content: 'You are Trip AI, a production travel-planning agent. Follow the JSON schema exactly. No markdown. Write all user-facing text in English only.'
          },
          {
            role: 'user',
            content: promptFor(request)
          }
        ],
        text: {
          format: {
            type: 'json_schema',
            ...tripPlanJsonSchema
          }
        }
      }),
      signal: AbortSignal.timeout(45000)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, status: response.status, error: openAIError(response.status, data) };
    }

    const text = extractResponseText(data);
    if (!text) {
      return { ok: false, error: 'OpenAI API response did not include structured text output.' };
    }

    return { ok: true, plan: JSON.parse(text) as Partial<TripPlan> };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown OpenAI API error';
    return { ok: false, error: `OpenAI API request failed: ${message}` };
  }
}



