import type { NextRequest } from 'next/server';
import { buildTripPlan } from '../../../../lib/plan-service';
import { requestFromSearchParams } from '../../../../lib/trip-request';

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  const tripRequest = requestFromSearchParams(request.nextUrl.searchParams);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(sse(event, data)));

      if (!tripRequest) {
        send('error', { message: 'vibe, origin, and destination are required.' });
        controller.close();
        return;
      }

      try {
        send('status', { message: 'Trip AI stream connected.' });
        const result = await buildTripPlan(tripRequest, (message) => send('status', { message }));
        send('final', result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OpenAI trip generation failed.';
        send('error', { message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
