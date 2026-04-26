export const tripPlanJsonSchema = {
  name: 'trip_plan_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['destination', 'imagePrompt', 'itinerary', 'routeMap', 'budget', 'insiderTips', 'theme'],
    properties: {
      destination: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'country', 'region', 'tagline', 'description', 'coordinates', 'bestFor'],
        properties: {
          name: { type: 'string' },
          country: { type: 'string' },
          region: { type: 'string' },
          tagline: { type: 'string' },
          description: { type: 'string' },
          coordinates: {
            type: 'object',
            additionalProperties: false,
            required: ['lat', 'lon'],
            properties: { lat: { type: 'number' }, lon: { type: 'number' } }
          },
          bestFor: { type: 'array', items: { type: 'string' } }
        }
      },
      imagePrompt: { type: 'string' },
      itinerary: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['day', 'title', 'theme', 'items'],
          properties: {
            day: { type: 'number' },
            title: { type: 'string' },
            theme: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['time', 'title', 'place', 'description', 'estimatedCost'],
                properties: {
                  time: { type: 'string' },
                  title: { type: 'string' },
                  place: { type: 'string' },
                  description: { type: 'string' },
                  estimatedCost: { type: 'number' }
                }
              }
            }
          }
        }
      },
      routeMap: {
        type: 'object',
        additionalProperties: false,
        required: ['overview', 'stops', 'transit'],
        properties: {
          overview: { type: 'string' },
          stops: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'day', 'name', 'type', 'x', 'y', 'note', 'estimatedCost'],
              properties: {
                id: { type: 'string' },
                day: { type: 'number' },
                name: { type: 'string' },
                type: { enum: ['arrival', 'stay', 'food', 'culture', 'nature', 'shopping', 'transit', 'viewpoint'] },
                x: { type: 'number' },
                y: { type: 'number' },
                note: { type: 'string' },
                estimatedCost: { type: 'number' }
              }
            }
          },
          transit: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['from', 'to', 'mode', 'duration', 'estimatedCost', 'tip'],
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                mode: { enum: ['walk', 'bus', 'train', 'tram', 'metro', 'taxi', 'car', 'flight'] },
                duration: { type: 'string' },
                estimatedCost: { type: 'number' },
                tip: { type: 'string' }
              }
            }
          }
        }
      },
      budget: {
        type: 'object',
        additionalProperties: false,
        required: ['currency', 'totalEstimate', 'accommodation', 'food', 'transport', 'activities', 'buffer', 'notes'],
        properties: {
          currency: { type: 'string' },
          totalEstimate: { type: 'number' },
          accommodation: { type: 'number' },
          food: { type: 'number' },
          transport: { type: 'number' },
          activities: { type: 'number' },
          buffer: { type: 'number' },
          notes: { type: 'string' }
        }
      },
      insiderTips: {
        type: 'object',
        additionalProperties: false,
        required: ['localPhrase', 'localPhraseMeaning', 'mustTryDishes', 'hiddenGem', 'etiquette'],
        properties: {
          localPhrase: { type: 'string' },
          localPhraseMeaning: { type: 'string' },
          mustTryDishes: { type: 'array', items: { type: 'string' } },
          hiddenGem: { type: 'string' },
          etiquette: { type: 'array', items: { type: 'string' } }
        }
      },
      theme: {
        type: 'object',
        additionalProperties: false,
        required: ['primary', 'secondary', 'accent', 'background', 'surface', 'text'],
        properties: {
          primary: { type: 'string' },
          secondary: { type: 'string' },
          accent: { type: 'string' },
          background: { type: 'string' },
          surface: { type: 'string' },
          text: { type: 'string' }
        }
      }
    }
  }
} as const;