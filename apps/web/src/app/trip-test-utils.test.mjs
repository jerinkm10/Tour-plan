import test from 'node:test';
import assert from 'node:assert/strict';
import { convertCurrency, hotelIdeasForTrip, munnarRouteCoordinates, routeCost, totalBudget } from './trip-test-utils.mjs';

test('totalBudget uses the higher value between declared total and category sum', () => {
  assert.equal(totalBudget({ totalEstimate: 300, accommodation: 100, food: 60, transport: 40, activities: 30, buffer: 20 }), 300);
  assert.equal(totalBudget({ totalEstimate: 100, accommodation: 100, food: 60, transport: 40, activities: 30, buffer: 20 }), 250);
});

test('routeCost combines place expenses and transit expenses', () => {
  const stops = [{ estimatedCost: 10 }, { estimatedCost: 25 }, { estimatedCost: 5 }];
  const transit = [{ estimatedCost: 2 }, { estimatedCost: 8 }];
  assert.equal(routeCost(stops, transit), 50);
});

test('convertCurrency applies the selected currency rate and rounds display amount', () => {
  assert.equal(convertCurrency(71, 83), 5893);
  assert.equal(convertCurrency(24.4, 3.67), 90);
});

test('hotelIdeasForTrip creates Munnar-specific accommodation options under the summary', () => {
  const trip = {
    request: { destination: 'Munnar, India' },
    destination: { name: 'Munnar', region: 'Kerala' },
    budget: { accommodation: 195 }
  };
  const hotels = hotelIdeasForTrip(trip);
  assert.equal(hotels.length, 3);
  assert.equal(hotels[0].name, 'Tea garden homestay');
  assert.equal(hotels.reduce((sum, hotel) => sum + hotel.estimate, 0), 195);
});

test('munnarRouteCoordinates maps six named stops to real Munnar route coordinates', () => {
  const coordinates = munnarRouteCoordinates([
    { id: 'arrival' },
    { id: 'tea-museum' },
    { id: 'rose-garden' },
    { id: 'mattupetty' },
    { id: 'echo-point' },
    { id: 'top-station' }
  ]);
  assert.equal(coordinates.length, 6);
  assert.deepEqual(coordinates[0], [10.0889, 77.0595]);
  assert.deepEqual(coordinates[5], [10.1216, 77.246]);
});