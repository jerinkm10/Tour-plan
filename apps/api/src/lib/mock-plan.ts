import type { RouteStop, TransitLeg, TripPlan, TripRequest, WeatherDay } from './trip-types';

type TravelMode = TripRequest['travelMode'];

function titleWord(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function titleCase(value: string): string {
  const segments = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const uniqueSegments = segments.filter((part, index, list) => part.toLowerCase() !== list[index - 1]?.toLowerCase());
  const commonCountries = new Set(['india', 'thailand', 'france', 'united states', 'usa', 'uk', 'japan', 'uae', 'singapore', 'canada', 'australia']);
  const displaySegments = uniqueSegments.length > 1 && commonCountries.has(uniqueSegments[1].toLowerCase())
    ? [uniqueSegments[0]]
    : uniqueSegments.slice(0, 2);
  const result = (displaySegments.length ? displaySegments : value.split(/[ ,]+/).slice(0, 2)).map(titleWord).join(', ');
  return result || 'Dream City';
}

function budgetDaily(tier: string): number {
  if (tier === 'premium') return 280;
  if (tier === 'lean') return 85;
  return 155;
}

function isMunnarDestination(destination: string): boolean {
  return destination.toLowerCase().includes('munnar');
}

function mainTravelCost(mode: TravelMode, tier: string, destination: string): number {
  const premium = tier === 'premium' ? 1.35 : tier === 'lean' ? 0.78 : 1;
  const munnar = isMunnarDestination(destination);
  const base = mode === 'flight' ? 420 : mode === 'train' ? 72 : mode === 'bus' ? 38 : mode === 'tram' ? 18 : munnar ? 48 : 95;
  return Math.round(base * premium);
}

function mainTravelDuration(mode: TravelMode, destination: string): string {
  if (mode === 'flight') return 'Same day flight window';
  if (mode === 'train') return '4-8 hr rail window';
  if (mode === 'bus') return '3-7 hr bus window';
  if (mode === 'tram') return '45-90 min city tram window';
  return isMunnarDestination(destination) ? '4 hr hill drive' : 'Flexible drive day';
}

function mainTravelTip(mode: TravelMode, request: TripRequest): string {
  if (mode === 'flight') return `Flight estimate for the selected date from ${request.origin} to ${request.destination}. Book early and keep a local transfer buffer.`;
  if (mode === 'car') return `Petrol, toll, and parking estimate for driving from ${request.origin} to ${request.destination}. Start early for smoother roads.`;
  if (mode === 'train') return `Train fare estimate for the main intercity leg. Choose a window seat and keep station transfer time.`;
  if (mode === 'bus') return `Bus fare estimate for the main route. Keep a small cash buffer for local transfers.`;
  return `Tram/local transit estimate for the destination route. Best for short urban hops.`;
}

export function createMockWeather(days: number): WeatherDay[] {
  const conditions = ['clear', 'partly cloudy', 'sunny', 'breezy', 'light rain'];
  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    date: new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
    condition: conditions[index % conditions.length],
    highC: 24 + (index % 4),
    lowC: 16 + (index % 3),
    rainChance: index % 4 === 3 ? 42 : 12 + index * 4,
    summary: index % 4 === 3 ? 'A softer day with possible showers, ideal for indoor food and culture stops.' : 'Pleasant travel weather for walking, transit hops, and golden-hour viewpoints.',
    outfitTip: index % 4 === 3 ? 'Pack a compact umbrella.' : 'Wear breathable layers and walking shoes.'
  }));
}

function createStops(days: number, destination: string): RouteStop[] {
  if (isMunnarDestination(destination)) {
    return [
      { id: 'arrival', day: 1, name: 'Munnar Town Arrival', type: 'arrival', x: 14, y: 35, note: 'Reach Munnar town, check fuel/parking, and orient before the hill route begins.', estimatedCost: 8 },
      { id: 'tea-museum', day: 1, name: 'KDHP Tea Museum', type: 'culture', x: 32, y: 48, note: 'Tea history, old machinery, tastings, and plantation context.', estimatedCost: 16 },
      { id: 'rose-garden', day: 1, name: 'Munnar Rose Garden', type: 'nature', x: 47, y: 31, note: 'A relaxed garden stop with flowers, spice plants, and easy photo corners.', estimatedCost: 22 },
      { id: 'mattupetty', day: Math.min(2, days), name: 'Mattupetty Dam', type: 'viewpoint', x: 62, y: 46, note: 'Water viewpoint with parking, snacks, and a short walking stretch.', estimatedCost: 7 },
      { id: 'echo-point', day: Math.min(2, days), name: 'Echo Point', type: 'nature', x: 73, y: 65, note: 'Lake stop for snacks, photos, and a short pause before the climb.', estimatedCost: 10 },
      { id: 'top-station', day: days, name: 'Top Station Viewpoint', type: 'viewpoint', x: 88, y: 43, note: 'Final high-altitude point for mountain views and a sunset finish.', estimatedCost: 12 }
    ];
  }

  return [
    { id: 'arrival', day: 1, name: 'Destination Arrival', type: 'arrival', x: 14, y: 35, note: 'Arrival point, ticket check, and first orientation stop.', estimatedCost: 8 },
    { id: 'old-town', day: 1, name: 'Old Town Walk', type: 'culture', x: 32, y: 48, note: 'Best first walk for architecture, snacks, and photos.', estimatedCost: 16 },
    { id: 'market', day: 1, name: 'Local Market', type: 'food', x: 47, y: 31, note: 'Lunch stop with strong local flavor.', estimatedCost: 22 },
    { id: 'train-station', day: Math.min(2, days), name: 'Main Transit Link', type: 'transit', x: 62, y: 46, note: 'Use public transport to save time and add a scenic ride.', estimatedCost: 7 },
    { id: 'garden', day: Math.min(2, days), name: 'Garden Quarter', type: 'nature', x: 73, y: 65, note: 'Weather-friendly reset with calm paths.', estimatedCost: 10 },
    { id: 'viewpoint', day: days, name: 'Sunset Viewpoint', type: 'viewpoint', x: 88, y: 43, note: 'Final photo stop and best route finish.', estimatedCost: 12 }
  ];
}

function createTransit(request: TripRequest): TransitLeg[] {
  const mainLeg: TransitLeg = {
    from: 'trip-origin',
    to: 'arrival',
    mode: request.travelMode,
    duration: mainTravelDuration(request.travelMode, request.destination),
    estimatedCost: mainTravelCost(request.travelMode, request.budgetTier, request.destination),
    tip: mainTravelTip(request.travelMode, request)
  };

  const localLegs: TransitLeg[] = isMunnarDestination(request.destination)
    ? [
        { from: 'arrival', to: 'tea-museum', mode: 'car', duration: '10 min', estimatedCost: 2, tip: 'Short local drive from town to the Tea Museum.' },
        { from: 'tea-museum', to: 'rose-garden', mode: 'car', duration: '14 min', estimatedCost: 4, tip: 'Use the same car or auto between garden stops.' },
        { from: 'rose-garden', to: 'mattupetty', mode: 'car', duration: '28 min', estimatedCost: 5, tip: 'Follow Mattupetty Road early to avoid crowding.' },
        { from: 'mattupetty', to: 'echo-point', mode: 'car', duration: '12 min', estimatedCost: 2, tip: 'Stay on the same scenic road and keep lake-side stops flexible.' },
        { from: 'echo-point', to: 'top-station', mode: 'car', duration: '35 min', estimatedCost: 4, tip: 'Final climb. Start before golden hour for clear views.' }
      ]
    : [
        { from: 'arrival', to: 'old-town', mode: 'train', duration: '12 min', estimatedCost: 3, tip: 'Fastest first hop from arrival.' },
        { from: 'old-town', to: 'market', mode: 'walk', duration: '18 min', estimatedCost: 0, tip: 'Walk slowly through side streets.' },
        { from: 'market', to: 'train-station', mode: 'bus', duration: '20 min', estimatedCost: 2, tip: 'Bus avoids the hottest stretch.' },
        { from: 'train-station', to: 'garden', mode: 'train', duration: '15 min', estimatedCost: 4, tip: 'Choose the window side.' },
        { from: 'garden', to: 'viewpoint', mode: 'bus', duration: '22 min', estimatedCost: 3, tip: 'Arrive before sunset.' }
      ];

  return [mainLeg, ...localLegs];
}

export function createMockPlan(
  request: TripRequest,
  weather?: WeatherDay[],
  coordinates?: { lat: number; lon: number },
  originCoordinates?: { lat: number; lon: number }
): TripPlan {
  const destinationName = titleCase(request.destination || 'Dream City');
  const daily = budgetDaily(request.budgetTier);
  const baseTotal = daily * request.days;
  const stops = createStops(request.days, request.destination);
  const transit = createTransit(request);
  const mainTravel = transit[0]?.estimatedCost ?? 0;
  const localTransit = transit.slice(1).reduce((sum, leg) => sum + leg.estimatedCost, 0);
  const transport = mainTravel + localTransit + Math.round(baseTotal * 0.08);
  const total = baseTotal + mainTravel;
  const transportLabel = request.travelMode === 'flight' ? 'flight fare' : request.travelMode === 'car' ? 'petrol and toll' : `${request.travelMode} fare`;

  return {
    id: `trip_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    request,
    imagePrompt: `Premium travel magazine poster for ${destinationName}, ${request.days}-day ${request.travelStyle} trip, ${request.travelMode} route, weather-aware mood, elegant typography, cinematic destination illustration, blue and white editorial palette, no watermark.`,
    destination: {
      name: destinationName,
      country: isMunnarDestination(request.destination) ? 'India' : 'AI matched destination',
      region: isMunnarDestination(request.destination) ? 'Kerala, India' : request.destination,
      tagline: `${request.travelStyle} days with ${request.travelMode} routing`,
      description: `A ${request.days}-day plan from ${request.origin} to ${request.destination}, shaped around ${request.vibe}. It balances major places, local food, ${request.travelMode} movement, and budget clarity.`,
      coordinates,
      bestFor: ['weather-aware route', `${request.travelMode} plan`, request.travelStyle, `${request.days} days`]
    },
    weather: weather ?? createMockWeather(request.days),
    itinerary: Array.from({ length: request.days }, (_, index) => ({
      day: index + 1,
      title: index === 0 ? `${request.travelMode} arrival and easy start` : index === request.days - 1 ? 'Viewpoint finale' : 'Transit and local gems',
      theme: index === 0 ? `Use day one for the main ${request.travelMode} leg and a smooth check-in.` : 'Use transit to cover more without rushing.',
      items: [
        { time: '09:00', title: index === 0 ? `${request.travelMode} transfer` : 'Start route', place: index === 0 ? request.origin : 'Transit Hub', description: index === 0 ? mainTravelTip(request.travelMode, request) : 'Begin with a practical, low-stress movement plan.', estimatedCost: index === 0 ? mainTravel : 8 + index * 2 },
        { time: '13:00', title: 'Local food break', place: 'Market area', description: 'Use lunch as a cultural stop, not just a pause.', estimatedCost: 18 + index * 4 },
        { time: '17:00', title: 'Signature stop', place: index === request.days - 1 ? 'Sunset Viewpoint' : 'Garden Quarter', description: 'End the day with the most photogenic place.', estimatedCost: 10 + index * 3 }
      ]
    })),
    routeMap: {
      origin: { name: request.origin, coordinates: originCoordinates },
      overview: isMunnarDestination(request.destination)
        ? `Starts from ${request.origin}, then follows a real Munnar car route through town, tea, garden, dam, lake, and Top Station. Transport includes ${transportLabel}.`
        : `Starts from ${request.origin}, then builds a destination route with numbered stops, local transfers, and ${transportLabel} for the main leg.`,
      stops,
      transit
    },
    budget: {
      currency: 'USD',
      totalEstimate: total,
      accommodation: Math.round(baseTotal * 0.42),
      food: Math.round(baseTotal * 0.24),
      transport,
      activities: Math.round(baseTotal * 0.12),
      buffer: Math.round(baseTotal * 0.08),
      notes: request.travelMode === 'flight'
        ? `Transport includes a flight estimate for the selected travel date plus local transfers.`
        : request.travelMode === 'car'
          ? `Transport includes petrol, toll, parking, and local driving buffer.`
          : `Transport includes the main ${request.travelMode} fare plus local transfers.`
    },
    insiderTips: {
      localPhrase: 'Thank you',
      localPhraseMeaning: 'Use this simple phrase warmly with locals.',
      mustTryDishes: ['Local breakfast plate', 'Street snack', 'Regional dessert'],
      hiddenGem: 'Ask a local cafe owner which lane is quietest in the morning.',
      etiquette: ['Carry small cash.', 'Start popular stops early.', 'Keep transit tickets handy.']
    },
    theme: {
      primary: '#0ea5e9',
      secondary: '#0f172a',
      accent: '#38bdf8',
      background: '#020617',
      surface: '#0b1220',
      text: '#e0f2fe'
    }
  };
}