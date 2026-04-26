import { NextResponse, type NextRequest } from 'next/server';
import { searchPlaces } from '../../../../lib/places';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';
  const results = await searchPlaces(query);
  return NextResponse.json({ results });
}