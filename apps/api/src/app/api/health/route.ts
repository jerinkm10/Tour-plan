import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'tour-plan-api', ai: process.env.OPENAI_API_KEY ? 'openai' : 'mock' });
}