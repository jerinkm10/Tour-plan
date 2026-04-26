import { createMockPlan } from './mock-plan';
import { createGeminiPlan } from './gemini-plan';
import { createOpenAIPlan, type OpenAIPlanResult } from './openai-plan';
import type { TripPlan, TripRequest } from './trip-types';
import { geocodeLocation, getWeatherForecast } from './weather';

type BuildMeta = {
  provider: 'openai' | 'gemini';
  warnings: string[];
};

function shouldTryGeminiFallback(result: OpenAIPlanResult): boolean {
  if (result.ok) return false;
  const error = result.error.toLowerCase();
  return !process.env.OPENAI_API_KEY ||
    result.status === 401 ||
    result.status === 403 ||
    result.status === 429 ||
    error.includes('quota') ||
    error.includes('limit') ||
    error.includes('rate') ||
    error.includes('billing') ||
    error.includes('model');
}

function transportLabel(request: TripRequest): string {
  if (request.travelMode === 'flight') return 'flight fare and airport transfers';
  if (request.travelMode === 'car') return 'petrol, toll, and parking';
  return `${request.travelMode} fare and local transfers`;
}

function normalizeTransport(plan: TripPlan, basePlan: TripPlan, request: TripRequest): TripPlan {
  const baseMainLeg = basePlan.routeMap.transit[0];
  const firstStop = plan.routeMap.stops[0] ?? basePlan.routeMap.stops[0];
  const baseLocalLegs = basePlan.routeMap.transit.slice(1);
  const aiLocalLegs = plan.routeMap.transit.filter((leg) => leg.from !== 'trip-origin');
  const localLegs = aiLocalLegs.length ? aiLocalLegs : baseLocalLegs;
  const mainLeg = {
    ...baseMainLeg,
    to: firstStop?.id ?? baseMainLeg.to,
    mode: request.travelMode,
    tip: request.travelMode === 'flight'
      ? `Flight estimate from ${request.origin} to ${request.destination}. Use this for long-distance routes, then add local transfers.`
      : request.travelMode === 'car'
        ? `Petrol, toll, and parking estimate from ${request.origin} to ${request.destination}.`
        : baseMainLeg.tip
  };

  const routeTransport = [mainLeg, ...localLegs].reduce((sum, leg) => sum + Math.max(0, Number(leg.estimatedCost) || 0), 0);
  const minimumTransport = Math.max(basePlan.budget.transport, routeTransport);
  const transport = Math.max(Number(plan.budget.transport) || 0, minimumTransport);
  const budget = {
    ...plan.budget,
    transport,
    notes: `Transport uses ${transportLabel(request)} for the main route. ${plan.budget.notes ?? ''}`.trim()
  };
  const categoryTotal = budget.accommodation + budget.food + budget.transport + budget.activities + budget.buffer;

  return {
    ...plan,
    request: { ...plan.request, travelMode: request.travelMode },
    routeMap: {
      ...plan.routeMap,
      origin: basePlan.routeMap.origin,
      transit: [mainLeg, ...localLegs]
    },
    budget: {
      ...budget,
      totalEstimate: Math.max(Number(plan.budget.totalEstimate) || 0, categoryTotal)
    }
  };
}

function mergePlan(basePlan: TripPlan, aiPlan: Partial<TripPlan>, tripRequest: TripRequest, coordinates?: { lat: number; lon: number } | null): TripPlan {
  const merged: TripPlan = {
    ...basePlan,
    ...aiPlan,
    id: basePlan.id,
    createdAt: basePlan.createdAt,
    request: tripRequest,
    imagePrompt: aiPlan.imagePrompt ?? basePlan.imagePrompt,
    weather: basePlan.weather,
    destination: { ...basePlan.destination, ...aiPlan.destination, coordinates: aiPlan.destination?.coordinates ?? coordinates ?? basePlan.destination.coordinates },
    routeMap: { ...basePlan.routeMap, ...aiPlan.routeMap, origin: basePlan.routeMap.origin },
    budget: { ...basePlan.budget, ...aiPlan.budget },
    insiderTips: { ...basePlan.insiderTips, ...aiPlan.insiderTips },
    theme: { ...basePlan.theme, ...aiPlan.theme }
  };

  return normalizeTransport(merged, basePlan, tripRequest);
}

export async function buildTripPlan(
  tripRequest: TripRequest,
  onStatus: (message: string) => void | Promise<void> = () => undefined
): Promise<{ plan: TripPlan; meta: BuildMeta }> {
  await onStatus('Reading trip request and checking destination coordinates.');
  const [coordinates, originCoordinates] = await Promise.all([
    geocodeLocation(tripRequest.destination),
    geocodeLocation(tripRequest.origin)
  ]);

  await onStatus('Loading weather forecast for the selected trip days.');
  const weather = coordinates ? await getWeatherForecast(coordinates, tripRequest.days) : null;

  await onStatus('Preparing route, weather, and budget context.');
  const basePlan = createMockPlan(tripRequest, weather ?? undefined, coordinates ?? undefined, originCoordinates ?? undefined);

  await onStatus('Calling OpenAI API for strict structured JSON.');
  const openAIResult = await createOpenAIPlan(tripRequest);

  if (openAIResult.ok) {
    await onStatus('Structured OpenAI trip plan received.');
    return {
      plan: mergePlan(basePlan, openAIResult.plan, tripRequest, coordinates),
      meta: {
        provider: 'openai',
        warnings: []
      }
    };
  }

  if (!shouldTryGeminiFallback(openAIResult)) {
    await onStatus(openAIResult.error);
    throw new Error(openAIResult.error);
  }

  await onStatus(`${openAIResult.error} Trying Gemini AI fallback.`);
  const geminiResult = await createGeminiPlan(tripRequest);

  if (!geminiResult.ok) {
    await onStatus(geminiResult.error);
    throw new Error(`${openAIResult.error} Gemini fallback also failed: ${geminiResult.error}`);
  }

  await onStatus('Structured Gemini trip plan received.');
  return {
    plan: mergePlan(basePlan, geminiResult.plan, tripRequest, coordinates),
    meta: {
      provider: 'gemini',
      warnings: [`OpenAI failed, so Gemini AI generated this structured trip plan. OpenAI reason: ${openAIResult.error}`]
    }
  };
}

