import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Welcome from Tour Plan API' });
}