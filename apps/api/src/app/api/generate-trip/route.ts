import { NextResponse, type NextRequest } from 'next/server';
import { buildTripPlan } from '../../../lib/plan-service';
import { cleanTripRequest } from '../../../lib/trip-request';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const tripRequest = cleanTripRequest(body);
  if (!tripRequest) {
    return NextResponse.json({ error: 'vibe, origin, and destination are required.' }, { status: 400 });
  }

  try {
    const result = await buildTripPlan(tripRequest);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OpenAI trip generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
