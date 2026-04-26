import type { WeatherDay } from './trip-types';

const weatherCodes: Record<number, string> = {
  0: 'clear',
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'heavy rain',
  80: 'showers',
  81: 'showers',
  82: 'heavy showers',
  95: 'thunderstorm'
};
function knownCoordinates(query: string): { lat: number; lon: number } | null {
  const value = query.toLowerCase();
  if (value.includes('munnar')) return { lat: 10.0889, lon: 77.0595 };
  if (value.includes('thrissur')) return { lat: 10.5276, lon: 76.2144 };
  if (value.includes('paris') && value.includes('texas')) return { lat: 33.6609, lon: -95.5555 };
  if (value.includes('paris')) return { lat: 48.8566, lon: 2.3522 };
  if (value.includes('london')) return { lat: 51.5072, lon: -0.1276 };
  if (value.includes('tokyo')) return { lat: 35.6762, lon: 139.6503 };
  if (value.includes('dubai')) return { lat: 25.2048, lon: 55.2708 };
  if (value.includes('singapore')) return { lat: 1.3521, lon: 103.8198 };
  if (value.includes('new york')) return { lat: 40.7128, lon: -74.006 };
  return null;
}
export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number } | null> {
  if (!query.trim()) return null;
  const fallback = knownCoordinates(query);

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) return null;

    const data = (await response.json()) as { results?: Array<{ latitude: number; longitude: number }> };
    const place = data.results?.[0];
    return place ? { lat: place.latitude, lon: place.longitude } : fallback;
  } catch {
    return fallback;
  }
}

export async function getWeatherForecast(coordinates: { lat: number; lon: number }, days: number): Promise<WeatherDay[] | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(coordinates.lat));
    url.searchParams.set('longitude', String(coordinates.lon));
    url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
    url.searchParams.set('forecast_days', String(Math.min(Math.max(days, 2), 10)));
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      daily?: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };
    const daily = data.daily;
    if (!daily?.time?.length) return null;

    return daily.time.slice(0, days).map((date, index) => {
      const condition = weatherCodes[daily.weather_code[index] ?? 2] ?? 'mixed';
      const highC = Math.round(daily.temperature_2m_max[index] ?? 25);
      const lowC = Math.round(daily.temperature_2m_min[index] ?? 16);
      const rainChance = daily.precipitation_probability_max[index] ?? 0;
      return {
        day: index + 1,
        date,
        condition,
        highC,
        lowC,
        rainChance,
        summary: `${condition[0].toUpperCase()}${condition.slice(1)} with ${highC}C high, ${lowC}C low, and ${rainChance}% rain chance.`,
        outfitTip: rainChance > 45 ? 'Carry an umbrella and quick-dry shoes.' : highC > 28 ? 'Light cotton, sunscreen, and water breaks.' : 'Comfortable shoes and a light layer will work well.'
      };
    });
  } catch {
    return null;
  }
}