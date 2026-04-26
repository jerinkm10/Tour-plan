export type TripRequest = {
  vibe: string;
  origin: string;
  destination: string;
  travelStyle: string;
  travelMode: 'car' | 'bus' | 'tram' | 'train' | 'flight';
  season: string;
  budgetTier: string;
  days: number;
};

export type WeatherDay = {
  day: number;
  date: string;
  condition: string;
  summary: string;
  highC: number;
  lowC: number;
  rainChance: number;
  outfitTip: string;
};

export type RouteStop = {
  id: string;
  day: number;
  name: string;
  type: 'arrival' | 'stay' | 'food' | 'culture' | 'nature' | 'shopping' | 'transit' | 'viewpoint';
  x: number;
  y: number;
  note: string;
  estimatedCost: number;
};

export type TransitLeg = {
  from: string;
  to: string;
  mode: 'walk' | 'bus' | 'train' | 'tram' | 'metro' | 'taxi' | 'car' | 'flight';
  duration: string;
  estimatedCost: number;
  tip: string;
};

export type TripPlan = {
  id: string;
  createdAt: string;
  request: TripRequest;
  imagePrompt: string;
  posterImageUrl?: string;
  destination: {
    name: string;
    country: string;
    region: string;
    tagline: string;
    description: string;
    coordinates?: { lat: number; lon: number };
    bestFor: string[];
  };
  weather: WeatherDay[];
  itinerary: Array<{
    day: number;
    title: string;
    theme: string;
    items: Array<{
      time: string;
      title: string;
      place: string;
      description: string;
      estimatedCost: number;
    }>;
  }>;
  routeMap: {
    origin?: { name: string; coordinates?: { lat: number; lon: number } };
    overview: string;
    stops: RouteStop[];
    transit: TransitLeg[];
  };
  budget: {
    currency: string;
    totalEstimate: number;
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    buffer: number;
    notes: string;
  };
  insiderTips: {
    localPhrase: string;
    localPhraseMeaning: string;
    mustTryDishes: string[];
    hiddenGem: string;
    etiquette: string[];
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
};

export type PlaceResult = {
  id: string;
  label: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
};