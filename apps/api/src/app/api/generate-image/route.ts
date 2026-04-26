import { NextResponse, type NextRequest } from 'next/server';

type ImagePayload = {
  prompt?: string;
  title?: string;
};

type ImageResult = {
  url: string;
  provider: string;
  warning: string | null;
};

function fallbackPoster(title: string, prompt: string): string {
  const safeTitle = title.replace(/[&<>]/g, '').slice(0, 54) || 'Dream Destination';
  const safePrompt = 'AI generated travel poster';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#020617"/><stop offset="0.5" stop-color="#0ea5e9"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="905" cy="150" r="100" fill="#e0f2fe" opacity="0.2"/><path d="M0 650 C230 520 455 520 710 455 C920 400 1030 300 1200 205 L1200 800 L0 800 Z" fill="#082f49" opacity="0.82"/><path d="M0 700 C260 548 510 548 810 475 C990 430 1100 335 1200 265" fill="none" stroke="#bae6fd" stroke-width="30" opacity="0.38"/><path d="M135 620 L320 310 L510 620 Z" fill="#1d4ed8" opacity="0.7"/><path d="M650 635 L870 260 L1115 635 Z" fill="#075985" opacity="0.72"/><rect x="62" y="56" width="700" height="180" rx="28" fill="#020617" opacity="0.58"/><text x="92" y="120" fill="#7dd3fc" font-family="Arial" font-size="28" font-weight="800" letter-spacing="8">LOCAL POSTER FALLBACK</text><text x="92" y="185" fill="#f8fafc" font-family="Georgia" font-size="68" font-weight="700">${safeTitle}</text><text x="94" y="232" fill="#dbeafe" font-family="Arial" font-size="24">${safePrompt}</text><circle cx="980" cy="575" r="44" fill="#38bdf8" filter="url(#glow)"/><circle cx="1045" cy="515" r="20" fill="#e0f2fe" opacity="0.88"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function providerWarning(provider: string, status: number, body: unknown): string {
  const message = typeof body === 'object' && body !== null && 'error' in body
    ? String((body as { error?: { message?: string } }).error?.message ?? '')
    : typeof body === 'string'
      ? body
      : '';

  if (message.trim()) return `${provider} image failed (${status}): ${message.trim()}`;
  return `${provider} image failed (${status}). Local poster fallback was used.`;
}

function extractGeminiImage(data: any): { mimeType: string; base64: string } | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  for (const part of parts) {
    const inlineData = part?.inlineData ?? part?.inline_data;
    const base64 = inlineData?.data;
    if (typeof base64 === 'string' && base64.length > 0) {
      return {
        mimeType: inlineData?.mimeType ?? inlineData?.mime_type ?? 'image/png',
        base64
      };
    }
  }

  return null;
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function generateStabilityImage(prompt: string): Promise<ImageResult | null> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) return null;

  const formData = new FormData();
  formData.set('prompt', `${prompt}\n\nPremium travel magazine poster image. No text, no letters, no logo, no watermark. Cinematic editorial style, strong destination mood, blue and white app theme friendly.`);
  formData.set('aspect_ratio', process.env.STABILITY_IMAGE_ASPECT_RATIO || '3:2');
  formData.set('output_format', process.env.STABILITY_OUTPUT_FORMAT || 'png');
  formData.set('negative_prompt', 'text, letters, words, logo, watermark, blurry, distorted, low quality, extra signage');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*'
    },
    body: formData,
    signal: AbortSignal.timeout(90000)
  });

  if (!response.ok) {
    return {
      url: '',
      provider: 'stability-ai',
      warning: providerWarning('Stability AI', response.status, await readErrorBody(response))
    };
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) {
    return {
      url: '',
      provider: 'stability-ai',
      warning: 'Stability AI response did not include image bytes. Local poster fallback was used.'
    };
  }

  return {
    url: `data:${contentType};base64,${buffer.toString('base64')}`,
    provider: 'stability-ai',
    warning: null
  };
}

async function generateGeminiImage(prompt: string): Promise<ImageResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
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
              text: `${prompt}\n\nCreate one premium travel poster image. No text, no letters, no logo, no watermark-looking caption. Cinematic editorial style, strong destination mood, blue and white app theme friendly.`
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    }),
    signal: AbortSignal.timeout(90000)
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      url: '',
      provider: 'gemini-image',
      warning: providerWarning('Gemini', response.status, data)
    };
  }

  const image = extractGeminiImage(data);
  if (!image) {
    return {
      url: '',
      provider: 'gemini-image',
      warning: 'Gemini response did not include image data. Local poster fallback was used.'
    };
  }

  return {
    url: `data:${image.mimeType};base64,${image.base64}`,
    provider: 'gemini-image',
    warning: null
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as ImagePayload | null;
  const title = body?.title?.trim() || 'Dream Destination';
  const prompt = body?.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const fallback = fallbackPoster(title, prompt);
  const warnings: string[] = [];

  try {
    const stability = await generateStabilityImage(prompt);
    if (stability?.url) return NextResponse.json(stability);
    if (stability?.warning) warnings.push(stability.warning);

    const gemini = await generateGeminiImage(prompt);
    if (gemini?.url) {
      return NextResponse.json({
        ...gemini,
        warning: warnings.length ? [...warnings, 'Gemini image fallback succeeded.'].join(' ') : gemini.warning
      });
    }
    if (gemini?.warning) warnings.push(gemini.warning);

    return NextResponse.json({
      url: fallback,
      provider: 'fallback-svg',
      warning: warnings.length ? warnings.join(' ') : 'No image API key is configured, so a local poster fallback was returned.'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown image error';
    return NextResponse.json({
      url: fallback,
      provider: 'fallback-svg',
      warning: `Image generation failed: ${message}. Local poster fallback was returned.`
    });
  }
}
