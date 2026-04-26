# Tour Plan

Angular frontend + Next.js backend for a Codex AI style tour planner.

## What Is Implemented

- Angular form for travel vibe, origin, destination, travel style, season, budget tier, trip days, and display currency.
- Current location autofill and city autocomplete through the Next API.
- Weather cards for the selected trip length with condition-matched backgrounds and CSS weather icons.
- Dynamic illustrated route map inspired by the provided campus-map reference.
- Bus and train route legs, numbered places, and smooth hover tooltips with stop expenses.
- Trip cost summary, place expense cards, itinerary timeline, and local tips.
- Editable route map: move stops, remove stops, and add custom stops.
- Currency selector that converts every visible amount in the UI from the base USD estimate.
- Sky-blue and white responsive UI theme.
- Next API uses OpenAI Structured Outputs through the Responses API if `OPENAI_API_KEY` is set, otherwise it returns a local mock plan so the app still runs.
- SSE status endpoint at `/api/generate-trip/stream` powers progressive Trip AI status updates.
- Real poster image endpoint at `/api/generate-image` uses the OpenAI Image API when configured and falls back to a generated local SVG poster.
- Saved trips panel stores recent trips in browser localStorage.
- Tailwind CSS is installed and configured for utility styling alongside the existing detailed component CSS.
- Playwright E2E tests are scaffolded in `apps/web/e2e`.
- Vercel config files are included for separate web/API deployments.

Currency conversion currently uses fixed demo rates in the Angular app. For production, replace those with a live FX service.

## Folder Structure

```text
Tour-plan/
  apps/
    api/      Next.js backend
    web/      Angular frontend
  packages/
  docker-compose.yml
  Dockerfile.api
  Dockerfile.web
  README.md
```

## Start Containers

```bash
cd /home/jerin/EMS/Tour-plan
docker compose up -d --build
```

The containers are designed for manual npm control. They stay alive first, then you install and run each app inside its own container.

## Web Container

```bash
docker compose exec web /bin/sh
cd /app/apps/web
npm install
npm run dev
```

Open:

```text
http://localhost:4200
```

If the browser still shows an old `main.js` error, hard refresh with `Ctrl + F5`. If needed, stop Angular with `Ctrl + C` and run `npm run dev` again.

## API Container

Open another terminal:

```bash
cd /home/jerin/EMS/Tour-plan
docker compose exec api /bin/sh
cd /app/apps/api
npm install
npm run dev
```

Open:

```text
http://localhost:3001
http://localhost:3001/api/health
```

## Optional OpenAI Key

Create `.env` in the project root:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_SIZE=1024x1024
```

Then recreate containers:

```bash
docker compose down
docker compose up -d --build
```

## Evaluation Coverage

**Problem decomposition:** The app is split into a focused Angular UI, a Next API, and small backend helpers for AI generation, mock fallback, weather, and places.

**AI integration:** The API uses OpenAI Structured Outputs with a strict JSON schema through the Responses API. If the key is missing, the AI call fails, or parsing fails, the backend returns a usable mock plan with a warning. Poster generation uses the OpenAI Image API when configured and otherwise returns a local SVG poster fallback.

**Code quality:** The frontend keeps UI state in Angular signals and reactive forms. The backend separates trip types, mock plan generation, weather/geocoding, and OpenAI request logic.

**Testing:** Unit tests cover budget, route cost, currency conversion, accommodation ideas, and Munnar route coordinates. Playwright E2E smoke tests cover the Trip AI reveal and core form editing. In the Alpine Docker image, Playwright needs the Dockerfile Chromium package installed by rebuilding the web image.

**UI/UX design:** The interface uses a sky-blue/white palette, responsive layout, weather-aware cards, an illustrated route map, expense tooltips, and editable route controls.

**Communication:** This README documents setup, Docker workflow, AI fallback behavior, design choices, current limitations, and next testing work.

## Stop

```bash
docker compose down
```
## Added Bonus Features

### Tailwind CSS

Tailwind is configured in `apps/web/tailwind.config.cjs` and `apps/web/postcss.config.cjs`. The existing handcrafted CSS remains because it carries the custom visual design; Tailwind is used additively for utility-styled saved-trip panels and future UI work.

### SSE Status Updates

The frontend first connects to:

```text
GET /api/generate-trip/stream
```

The stream emits `status` events while geocoding, loading weather, preparing fallback data, and calling Trip AI. It emits `final` with the same `{ plan, meta }` shape as the existing POST route. If SSE fails, Angular falls back to `POST /api/generate-trip`.

### Real Image API

The frontend calls:

```text
POST /api/generate-image
```

Set these values to use OpenAI image generation:

```env
OPENAI_API_KEY=your_key_here
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_SIZE=1024x1024
```

If the key is missing or the image API fails, the route returns a local SVG poster so the UI never breaks.

### Saved Trips

Generated trips can be saved from the result card. Saved trips are stored in browser localStorage under `tour-plan:saved-trips` and shown in the saved trips panel.

### Playwright E2E

```bash
cd /app/apps/web
npm run e2e
```

The web Dockerfile now includes Alpine Chromium for Playwright. Rebuild the web image after this change:

```bash
docker compose build web
docker compose up -d web
```

### Vercel Deployment

Config files are included:

```text
apps/web/vercel.json
apps/api/vercel.json
```

Deploy as two Vercel projects if keeping Angular and Next separated:

1. API project root: `apps/api`
2. Web project root: `apps/web`

A real live Vercel URL still requires logging in to a Vercel account or setting a Vercel token. This repository includes the deploy config but does not contain credentials.