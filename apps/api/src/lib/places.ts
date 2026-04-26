import type { PlaceResult } from './trip-types';

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (query.trim().length < 2) return [];

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '8');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) return [];

    const data = (await response.json()) as {
      results?: Array<{ id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number }>;
    };

    return (data.results ?? []).map((place) => ({
      id: String(place.id),
      name: place.name,
      region: place.admin1 ?? '',
      country: place.country ?? '',
      latitude: place.latitude,
      longitude: place.longitude,
      label: [place.name, place.admin1, place.country].filter(Boolean).join(', ')
    }));
  } catch {
    return [];
  }
}

export async function reversePlace(lat: number, lon: number): Promise<PlaceResult | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url, {
      headers: { 'User-Agent': 'TourPlanLocalDev/1.0' },
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      place_id?: number;
      display_name?: string;
      address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
    };
    const name = data.address?.city ?? data.address?.town ?? data.address?.village ?? 'Current location';
    const region = data.address?.state ?? '';
    const country = data.address?.country ?? '';
    return {
      id: String(data.place_id ?? `${lat},${lon}`),
      name,
      region,
      country,
      latitude: lat,
      longitude: lon,
      label: data.display_name ?? [name, region, country].filter(Boolean).join(', ')
    };
  } catch {
    return null;
  }
}