export function convertCurrency(amount, rate) {
  return Math.round(Number(amount || 0) * Number(rate || 1));
}

export function totalBudget(budget) {
  const categorySum = ['accommodation', 'food', 'transport', 'activities', 'buffer']
    .reduce((sum, key) => sum + Number(budget?.[key] || 0), 0);
  return Math.max(Number(budget?.totalEstimate || 0), categorySum);
}

export function routeCost(stops = [], transit = []) {
  const stopCost = stops.reduce((sum, stop) => sum + Number(stop?.estimatedCost || 0), 0);
  const transitCost = transit.reduce((sum, leg) => sum + Number(leg?.estimatedCost || 0), 0);
  return stopCost + transitCost;
}

export function hotelIdeasForTrip(trip) {
  const stayBudget = Math.max(1, Number(trip?.budget?.accommodation || 0));
  const destination = `${trip?.destination?.name || ''} ${trip?.destination?.region || ''} ${trip?.request?.destination || ''}`.toLowerCase();
  const isMunnar = destination.includes('munnar');
  const names = isMunnar
    ? ['Tea garden homestay', 'Mattupetty road resort', 'Viewpoint cabin stay']
    : ['Central boutique stay', 'Transit-friendly hotel', 'Viewpoint guesthouse'];
  const weights = [0.34, 0.38, 0.28];
  return names.map((name, index) => ({ name, estimate: Math.round(stayBudget * weights[index]) }));
}

export function munnarRouteCoordinates(stops = []) {
  const pointsById = {
    arrival: [10.0889, 77.0595],
    'tea-museum': [10.0956, 77.0636],
    'rose-garden': [10.0827, 77.0755],
    mattupetty: [10.112, 77.124],
    'echo-point': [10.1205, 77.159],
    'top-station': [10.1216, 77.246]
  };
  const fallbackPoints = Object.values(pointsById);
  return stops.map((stop, index) => pointsById[stop?.id] ?? fallbackPoints[index] ?? fallbackPoints[fallbackPoints.length - 1]);
}