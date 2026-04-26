import { NextResponse, type NextRequest } from 'next/server';
import { reversePlace } from '../../../../lib/places';

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get('lat'));
  const lon = Number(request.nextUrl.searchParams.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'lat and lon are required.' }, { status: 400 });
  }
  const place = await reversePlace(lat, lon);
  return NextResponse.json({ place });
}