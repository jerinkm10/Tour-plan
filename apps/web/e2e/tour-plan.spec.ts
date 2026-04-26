import { expect, test, type Page } from '@playwright/test';

type TripRequest = {
  vibe: string;
  origin: string;
  destination: string;
  travelStyle: string;
  travelMode: 'car' | 'bus' | 'tram' | 'train' | 'flight';
  season: string;
  budgetTier: string;
  days: number;
};

const posterSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#082f49"/><circle cx="860" cy="160" r="120" fill="#38bdf8" opacity=".55"/><path d="M0 650 C260 500 520 560 760 430 C960 330 1060 280 1200 220 L1200 800 L0 800 Z" fill="#0ea5e9" opacity=".75"/></svg>')}`;

function buildTrip(overrides: Partial<TripRequest> = {}) {
  const request: TripRequest = {
    vibe: 'peaceful nature, local food, scenic train rides, and light adventure',
    origin: 'Thrissur, Kerala, India',
    destination: 'San Francisco, United States',
    travelStyle: 'slow living',
    travelMode: 'flight',
    season: 'winter',
    budgetTier: 'comfort',
    days: 3,
    ...overrides
  };

  const destinationName = request.destination.split(',')[0].trim() || 'San Francisco';
  const slug = destinationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip';
  const stops = [
    ['arrival', 'Destination Arrival', 'arrival', 12, 42, 24],
    ['market', 'Local Market', 'food', 28, 34, 32],
    ['museum', 'Culture Museum', 'culture', 44, 48, 18],
    ['garden', 'Garden Quarter', 'nature', 58, 30, 16],
    ['transit', 'Main Transit Link', 'transit', 72, 52, 12],
    ['viewpoint', 'Sunset Viewpoint', 'viewpoint', 88, 38, 20]
  ].map(([id, name, type, x, y, estimatedCost], index) => ({
    id: `${slug}-${id}`,
    day: (index % request.days) + 1,
    name: String(name),
    type: String(type),
    x: Number(x),
    y: Number(y),
    note: `A polished ${destinationName} stop for the route plan.`,
    estimatedCost: Number(estimatedCost)
  }));

  return {
    id: `e2e-${slug}`,
    createdAt: new Date('2026-04-26T10:00:00.000Z').toISOString(),
    request,
    imagePrompt: `Premium travel poster of ${destinationName}, no text`,
    posterImageUrl: posterSvg,
    destination: {
      name: destinationName,
      country: request.destination.includes('Mexico') ? 'Mexico' : 'United States',
      region: 'E2E Region',
      tagline: `${destinationName} slow travel with scenic routing`,
      description: `A ${request.days}-day English travel plan for ${destinationName} with route stops, weather, hotels, and budget clarity.`,
      coordinates: { lat: 37.7749, lon: -122.4194 },
      bestFor: ['Slow travel', 'Local food', 'Weather-aware route']
    },
    weather: Array.from({ length: request.days }, (_, index) => ({
      day: index + 1,
      date: `2026-05-${String(index + 1).padStart(2, '0')}`,
      condition: index === 1 ? 'Partly Cloudy' : 'Sunny',
      summary: 'Comfortable weather for walking, transit hops, and viewpoints.',
      highC: 24 + index,
      lowC: 15 + index,
      rainChance: 10 + index * 4,
      outfitTip: 'Wear breathable layers and walking shoes.'
    })),
    itinerary: Array.from({ length: request.days }, (_, index) => ({
      day: index + 1,
      title: `Day ${index + 1} in ${destinationName}`,
      theme: 'Easy pacing and local discoveries',
      items: [
        {
          time: 'Morning',
          title: 'Neighborhood walk',
          place: stops[index % stops.length].name,
          description: 'Start with a gentle route stop and local breakfast nearby.',
          estimatedCost: 18
        },
        {
          time: 'Afternoon',
          title: 'Scenic transfer',
          place: stops[(index + 1) % stops.length].name,
          description: 'Use the planned transit route and keep time for photos.',
          estimatedCost: 24
        }
      ]
    })),
    routeMap: {
      origin: { name: request.origin, coordinates: { lat: 10.5276, lon: 76.2144 } },
      overview: `${request.days} days through ${destinationName} with smart transit and editable route stops.`,
      stops,
      transit: [
        { from: 'trip-origin', to: stops[0].id, mode: request.travelMode, duration: 'Same day', estimatedCost: 420, tip: 'Main route connection.' },
        ...stops.slice(0, -1).map((stop, index) => ({
          from: stop.id,
          to: stops[index + 1].id,
          mode: index % 2 ? 'train' : 'bus',
          duration: `${15 + index * 4} min`,
          estimatedCost: 4 + index,
          tip: 'Short local transfer.'
        }))
      ]
    },
    budget: {
      currency: 'USD',
      totalEstimate: 1150,
      accommodation: 520,
      food: 210,
      transport: 320,
      activities: 70,
      buffer: 30,
      notes: 'Mocked E2E estimate.'
    },
    insiderTips: {
      localPhrase: 'Dress in layers.',
      localPhraseMeaning: 'Weather can change during the day, so flexible clothing keeps the route comfortable.',
      mustTryDishes: ['Local market lunch', 'Craft coffee', 'Seasonal dessert'],
      hiddenGem: 'A quiet viewpoint just outside the main route is best before sunset.',
      etiquette: ['Keep reusable water handy', 'Confirm transit times before late returns']
    },
    theme: {
      primary: '#38bdf8',
      secondary: '#0f172a',
      accent: '#0ea5e9',
      background: '#020617',
      surface: '#0b1220',
      text: '#e0f2fe'
    }
  };
}

async function mockGeneration(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'EventSource', { value: undefined, configurable: true });
  });

  await page.route('**/api/generate-trip', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}') as Partial<TripRequest>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: buildTrip(body),
        meta: { provider: 'playwright-mock', warnings: [] }
      })
    });
  });

  await page.route('**/api/generate-image', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: posterSvg, provider: 'playwright-mock-image', warning: null })
    });
  });
}

test('reveals the trip form after the Trip AI intro', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Trip AI interaction')).toBeVisible();
  await expect(page.getByLabel('Trip plan controls')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByRole('button', { name: 'Generate trip plan' })).toBeVisible();
});

test('generates a mocked trip, renders the card, and saves it', async ({ page }) => {
  await mockGeneration(page);
  await page.goto('/');
  await expect(page.getByLabel('Trip plan controls')).toBeVisible({ timeout: 8_000 });

  await page.getByLabel('From').fill('Thrissur, Kerala, India');
  await page.getByLabel('To').fill('San Francisco, United States');
  await page.getByRole('button', { name: 'Generate trip plan' }).click();

  await expect(page.getByRole('heading', { name: 'San Francisco' }).first()).toBeVisible({ timeout: 12_000 });
  await expect(page.getByText('Transport expense')).toBeVisible();
  await expect(page.getByText('Hotel stay idea')).toBeVisible();

  await page.getByRole('button', { name: 'Save trip' }).click();
  await expect(page.getByRole('dialog', { name: 'Saved trips' })).toBeVisible();
  await expect(page.getByText('Your trip cards')).toBeVisible();
  await expect(page.getByText('San Francisco').first()).toBeVisible();
});

test('compares two saved trips in split screen mode', async ({ page }) => {
  const first = buildTrip({ destination: 'San Francisco, United States', days: 3 });
  const second = buildTrip({ destination: 'San Cristobal de las Casas, Mexico', days: 4 });

  await page.addInitScript((trips) => {
    window.localStorage.setItem('tour-plan:saved-trips', JSON.stringify(trips));
  }, [first, second]);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open saved trips' }).click();
  await expect(page.getByRole('dialog', { name: 'Saved trips' })).toBeVisible();

  await page.getByRole('button', { name: 'Compare' }).nth(0).click();
  await page.getByRole('button', { name: 'Compare' }).nth(0).click();
  await page.getByRole('button', { name: 'Split compare' }).click();

  await expect(page.getByText('Trip comparison')).toBeVisible();
  await expect(page.getByText('San Francisco').first()).toBeVisible();
  await expect(page.getByText('San Cristobal de las Casas').first()).toBeVisible();
  await expect(page.getByText('Accommodation').first()).toBeVisible();
  await expect(page.getByText('Transport').first()).toBeVisible();
});
