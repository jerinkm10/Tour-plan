import type { TripRequest } from './trip-types';

const travelModes = ['car', 'bus', 'tram', 'train', 'flight'] as const;
type TravelMode = (typeof travelModes)[number];

function countryHint(value: string): string | null {
  const text = value.toLowerCase();
  if (text.includes('india') || text.includes('kerala') || text.includes('thrissur') || text.includes('munnar')) return 'india';
  if (text.includes('united states') || text.includes('usa') || text.includes('new york') || text.includes('texas')) return 'usa';
  if (text.includes('france') || text.includes('paris')) return 'france';
  if (text.includes('united kingdom') || text.includes('uk') || text.includes('london')) return 'uk';
  if (text.includes('japan') || text.includes('tokyo')) return 'japan';
  if (text.includes('uae') || text.includes('dubai')) return 'uae';
  if (text.includes('singapore')) return 'singapore';
  if (text.includes('thailand') || text.includes('bangkok') || text.includes('phuket')) return 'thailand';
  return null;
}

function isFarDestination(destination: string): boolean {
  const text = destination.toLowerCase();
  return ['new york', 'paris', 'london', 'tokyo', 'dubai', 'singapore', 'thailand', 'bangkok', 'phuket'].some((place) => text.includes(place));
}

export function chooseTravelMode(value: unknown, origin: string, destination: string): TravelMode {
  const requested = String(value ?? '').toLowerCase();
  const originCountry = countryHint(origin);
  const destinationCountry = countryHint(destination);

  if (destination.toLowerCase().includes('munnar') && (!originCountry || originCountry === 'india')) return 'car';
  if (originCountry && destinationCountry && originCountry !== destinationCountry) return 'flight';
  if (originCountry === 'india' && isFarDestination(destination)) return 'flight';
  if (requested === 'flight') return 'flight';
  if (requested === 'car' && isFarDestination(destination) && originCountry !== destinationCountry) return 'flight';

  return travelModes.includes(requested as TravelMode) ? (requested as TravelMode) : 'car';
}

export function cleanTripRequest(value: unknown): TripRequest | null {
  const body = value as Partial<TripRequest>;
  const days = Number(body.days ?? 3);
  if (!body.vibe || !body.origin || !body.destination) return null;
  const origin = String(body.origin).trim();
  const destination = String(body.destination).trim();

  return {
    vibe: String(body.vibe).trim(),
    origin,
    destination,
    travelStyle: String(body.travelStyle ?? 'slow living'),
    travelMode: chooseTravelMode(body.travelMode, origin, destination),
    season: String(body.season ?? 'winter'),
    budgetTier: String(body.budgetTier ?? 'comfort'),
    days: Math.min(Math.max(Number.isFinite(days) ? days : 3, 2), 10)
  };
}

export function requestFromSearchParams(params: URLSearchParams): TripRequest | null {
  return cleanTripRequest(Object.fromEntries(params.entries()));
}
