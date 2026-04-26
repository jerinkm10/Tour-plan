import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import type { CurrencyCode, CurrencyOption, PlaceResult, RouteStop, TripPlan, WeatherDay } from './app.types';

declare global {
  interface Window {
    L?: any;
  }
}

type HotelIdea = {
  name: string;
  description: string;
  estimate: number;
};

type ThemeMode = 'system' | 'light' | 'dark';
type TripResponse = { plan: TripPlan; meta: { provider?: string; warnings: string[] } };
type ImageResponse = { url: string; provider: string; warning?: string | null };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private map: any = null;
  private routeLayer: any = null;
  private markerLayer: any = null;
  private mapRenderTimer = 0;
  private formRevealTimer = 0;
  private mapReadyAttempts = 0;
  private themeMediaQuery: MediaQueryList | null = null;
  private themeMediaListener: ((event: MediaQueryListEvent) => void) | null = null;

  readonly loading = signal(false);
  readonly formReady = signal(false);
  readonly locating = signal(false);
  readonly error = signal('');
  readonly warnings = signal<string[]>([]);
  readonly plan = signal<TripPlan | null>(null);
  readonly statusMessages = signal<string[]>([]);
  readonly savedTrips = signal<TripPlan[]>([]);
  readonly savedTripsOpen = signal(false);
  readonly compareTripIds = signal<string[]>([]);
  readonly comparingSavedTrips = signal(false);
  readonly comparedTrips = computed(() => {
    const selected = new Set(this.compareTripIds());
    return this.savedTrips().filter((trip) => selected.has(trip.id)).slice(0, 2);
  });
  readonly posterImages = signal<Record<string, string>>({});
  readonly imageLoading = signal(false);
  readonly originSuggestions = signal<PlaceResult[]>([]);
  readonly destinationSuggestions = signal<PlaceResult[]>([]);
  readonly newStopName = signal('');
  readonly newStopCost = signal(0);
  readonly selectedCurrency = signal<CurrencyCode>('USD');
  readonly themeMode = signal<ThemeMode>('dark');
  readonly systemPrefersDark = signal(false);
  readonly resolvedTheme = computed(() => this.themeMode() === 'system' ? (this.systemPrefersDark() ? 'dark' : 'light') : this.themeMode());
  readonly currencies: CurrencyOption[] = [
    { code: 'USD', label: 'US Dollar', rate: 1, locale: 'en-US' },
    { code: 'INR', label: 'Indian Rupee', rate: 83, locale: 'en-IN' },
    { code: 'EUR', label: 'Euro', rate: 0.92, locale: 'de-DE' },
    { code: 'GBP', label: 'British Pound', rate: 0.79, locale: 'en-GB' },
    { code: 'AED', label: 'UAE Dirham', rate: 3.67, locale: 'en-AE' },
    { code: 'SGD', label: 'Singapore Dollar', rate: 1.34, locale: 'en-SG' },
    { code: 'JPY', label: 'Japanese Yen', rate: 151, locale: 'ja-JP' },
    { code: 'AUD', label: 'Australian Dollar', rate: 1.52, locale: 'en-AU' },
    { code: 'CAD', label: 'Canadian Dollar', rate: 1.36, locale: 'en-CA' }
  ];

  readonly form = this.fb.nonNullable.group({
    vibe: ['peaceful nature, local food, scenic train rides, and light adventure', [Validators.required, Validators.minLength(8)]],
    origin: ['', [Validators.required, Validators.minLength(2)]],
    destination: ['Munnar, India', [Validators.required, Validators.minLength(2)]],
    travelMode: ['car', Validators.required],
    travelStyle: ['slow living', Validators.required],
    season: ['winter', Validators.required],
    budgetTier: ['comfort', Validators.required],
    days: [3, [Validators.required, Validators.min(2), Validators.max(10)]]
  });

  readonly themeStyle = computed(() => this.resolvedTheme() === 'light'
    ? {
        '--primary': '#0284c7',
        '--secondary': '#e0f2fe',
        '--accent': '#0ea5e9',
        '--background': '#f5fbff',
        '--surface': '#ffffff',
        '--text': '#082f49'
      }
    : {
        '--primary': '#38bdf8',
        '--secondary': '#0f172a',
        '--accent': '#0ea5e9',
        '--background': '#020617',
        '--surface': '#0b1220',
        '--text': '#e0f2fe'
      });

  constructor() {
    this.setupThemePreference();
    this.savedTrips.set(this.readSavedTrips());
    this.formRevealTimer = window.setTimeout(() => this.formReady.set(true), 5600);

    this.form.controls.origin.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        filter((query) => query.trim().length > 2),
        switchMap((query) => this.searchPlaces(query)),
        catchError(() => of([]))
      )
      .subscribe((results) => this.originSuggestions.set(results));

    this.form.controls.destination.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        filter((query) => query.trim().length > 2),
        switchMap((query) => this.searchPlaces(query)),
        catchError(() => of([]))
      )
      .subscribe((results) => this.destinationSuggestions.set(results));
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.mapRenderTimer);
    window.clearTimeout(this.formRevealTimer);
    if (this.themeMediaQuery && this.themeMediaListener) {
      this.themeMediaQuery.removeEventListener('change', this.themeMediaListener);
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  generateTrip(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');
    this.warnings.set([]);
    this.statusMessages.set(['Starting Trip AI stream...']);

    const payload = this.form.getRawValue();
    if (typeof EventSource !== 'undefined') {
      this.generateTripStream(payload);
      return;
    }

    this.generateTripPost(payload);
  }

  private generateTripPost(payload = this.form.getRawValue()): void {
    this.addStatus('Using standard API request.');
    this.http.post<TripResponse>('/api/generate-trip', payload)
      .subscribe({
        next: (response) => this.handleTripResult(response),
        error: (error) => {
          this.error.set(this.apiErrorMessage(error));
          this.loading.set(false);
        }
      });
  }

  private generateTripStream(payload = this.form.getRawValue()): void {
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => params.set(key, String(value)));
    const source = new EventSource(`/api/generate-trip/stream?${params.toString()}`);
    let completed = false;

    source.addEventListener('status', (event) => {
      const data = this.parseEventData<{ message?: string }>(event);
      if (data?.message) this.addStatus(data.message);
    });

    source.addEventListener('final', (event) => {
      completed = true;
      source.close();
      const data = this.parseEventData<TripResponse>(event);
      if (data?.plan) this.handleTripResult(data);
      else this.generateTripPost(payload);
    });

    source.addEventListener('error', (event) => {
      const data = this.parseEventData<{ message?: string }>(event);
      if (data?.message) {
        completed = true;
        source.close();
        this.addStatus(data.message);
        this.error.set(data.message);
        this.loading.set(false);
      }
    });

    source.onerror = () => {
      source.close();
      if (!completed) this.generateTripPost(payload);
    };
  }

  private apiErrorMessage(error: any): string {
    const message = error?.error?.error ?? error?.error?.message ?? error?.message;
    return typeof message === 'string' && message.trim()
      ? message
      : 'OpenAI trip generation failed. Check API key, quota, billing, and model access.';
  }
  private handleTripResult(response: TripResponse): void {
    this.plan.set(response.plan);
    this.warnings.set(response.meta.warnings ?? []);
    this.loading.set(false);
    this.addStatus(`Plan ready from ${response.meta.provider ?? 'api'}.`);
    this.renderMapSoon(response.plan);
    this.generatePosterImage(response.plan);
  }

  private parseEventData<T>(event: Event): T | null {
    const message = event as MessageEvent<string>;
    try {
      return JSON.parse(message.data) as T;
    } catch {
      return null;
    }
  }

  private addStatus(message: string): void {
    this.statusMessages.update((items) => [...items.slice(-5), message]);
  }
  focusTravelVibe(): void {
    const input = document.getElementById('travel-vibe-input') as HTMLTextAreaElement | null;
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus();
  }

  appendVibeAndGenerate(addition: string): void {
    const current = this.form.controls.vibe.value.trim();
    const next = current.toLowerCase().includes(addition.toLowerCase()) ? current : `${current}${current ? ', ' : ''}${addition}`;
    this.form.controls.vibe.setValue(next);
    this.generateTrip();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error.set('Browser location is not available.');
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new HttpParams().set('lat', position.coords.latitude).set('lon', position.coords.longitude);
        this.http.get<{ place: PlaceResult | null }>('/api/places/reverse', { params }).subscribe({
          next: (response) => {
            if (response.place) this.form.controls.origin.setValue(response.place.label);
            this.locating.set(false);
          },
          error: () => this.locating.set(false)
        });
      },
      () => {
        this.error.set('Location permission was blocked. Type your city manually.');
        this.locating.set(false);
      }
    );
  }

  selectOrigin(place: PlaceResult): void {
    this.form.controls.origin.setValue(place.label);
    this.originSuggestions.set([]);
  }

  selectDestination(place: PlaceResult): void {
    this.form.controls.destination.setValue(place.label);
    this.destinationSuggestions.set([]);
  }

  searchPlaces(query: string) {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ results: PlaceResult[] }>('/api/places/search', { params }).pipe(
      switchMap((response) => of(response.results))
    );
  }

  changeCurrency(event: Event): void {
    this.selectedCurrency.set(this.currencyValue(event));
    this.renderMapSoon();
  }

  currencyValue(event: Event): CurrencyCode {
    const value = (event.target as HTMLSelectElement).value as CurrencyCode;
    return this.currencies.some((currency) => currency.code === value) ? value : 'USD';
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  themeClass(): string {
    return `theme-${this.resolvedTheme()}`;
  }

  themeLabel(mode: ThemeMode): string {
    return mode[0].toUpperCase() + mode.slice(1);
  }

  private setupThemePreference(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark.set(this.themeMediaQuery.matches);
    this.themeMediaListener = (event) => this.systemPrefersDark.set(event.matches);
    this.themeMediaQuery.addEventListener('change', this.themeMediaListener);
  }

  private currencyOption(code = this.selectedCurrency()): CurrencyOption {
    return this.currencies.find((currency) => currency.code === code) ?? this.currencies[0];
  }

  money(amount: number, _baseCurrency = 'USD'): string {
    const option = this.currencyOption();
    const converted = amount * option.rate;
    return new Intl.NumberFormat(option.locale, {
      style: 'currency',
      currency: option.code,
      maximumFractionDigits: 0
    }).format(converted);
  }

  totalBudget(trip: TripPlan): number {
    return Math.max(trip.budget.totalEstimate, trip.budget.accommodation + trip.budget.food + trip.budget.transport + trip.budget.activities + trip.budget.buffer);
  }

  routeCost(trip: TripPlan): number {
    return trip.routeMap.stops.reduce((sum, stop) => sum + stop.estimatedCost, 0) + trip.routeMap.transit.reduce((sum, leg) => sum + leg.estimatedCost, 0);
  }
  destinationTitle(trip: TripPlan): string {
    return this.cleanPlaceName(trip.destination.name || trip.request.destination);
  }

  destinationThemeClass(trip: TripPlan): string {
    const value = `${trip.destination.name} ${trip.destination.region} ${trip.destination.country} ${trip.request.destination}`.toLowerCase();
    if (value.includes('paris')) return 'destination-paris';
    if (value.includes('munnar')) return 'destination-munnar';
    if (value.includes('thailand')) return 'destination-thailand';
    return 'destination-default';
  }

  posterImageUrl(trip: TripPlan): string {
    return this.posterImages()[trip.id] ?? trip.posterImageUrl ?? this.placeImageUrl(trip);
  }

  summaryBackgroundStyle(trip: TripPlan): Record<string, string> {
    return {
      'background-image': `radial-gradient(ellipse at 30% 45%, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.72) 44%, rgba(2, 6, 23, 0.34) 78%), radial-gradient(circle at 84% 20%, rgba(14, 165, 233, 0.24), transparent 34%), ${this.cssImageUrl(this.posterImageUrl(trip))}`
    };
  }

  totalEstimateBackgroundStyle(trip: TripPlan): Record<string, string> {
    return {
      'background-image': `radial-gradient(circle at 35% 30%, rgba(14, 165, 233, 0.72), transparent 58%), radial-gradient(ellipse at 70% 72%, rgba(37, 99, 235, 0.84), rgba(2, 6, 23, 0.58) 74%), ${this.cssImageUrl(this.posterImageUrl(trip))}`
    };
  }

  regeneratePoster(trip: TripPlan): void {
    this.generatePosterImage(trip, true);
  }

  private generatePosterImage(trip: TripPlan, force = false): void {
    const fallback = this.imageFallbackUrl(trip);
    const currentImage = this.posterImages()[trip.id];

    if (!currentImage) {
      this.posterImages.update((images) => ({
        ...images,
        [trip.id]: trip.posterImageUrl || fallback
      }));
    }

    if (!force && currentImage && currentImage !== fallback) return;

    this.imageLoading.set(true);

    const prompt =
      trip.imagePrompt?.trim() ||
      `Premium cinematic travel poster background of ${this.destinationTitle(trip)}, destination landscape, scenic route, blue and white luxury editorial style, no text, no words, no typography`;

    this.http.post<ImageResponse>('/api/generate-image', {
      prompt,
      title: this.destinationTitle(trip),
    }).subscribe({
      next: (response) => {
        this.posterImages.update((images) => ({
          ...images,
          [trip.id]: response.url,
        }));

        if (response.warning) {
          this.warnings.update((items) => [...items, response.warning as string]);
        }

        this.imageLoading.set(false);
      },
      error: () => this.imageLoading.set(false),
    });
  }
  placeImageUrl(trip: TripPlan): string {
    return this.imageFallbackUrl(trip);
  }

  useFallbackImage(event: Event, trip: TripPlan): void {
    const image = event.target as HTMLImageElement;
    const fallback = this.imageFallbackUrl(trip);
    if (image.src !== fallback) image.src = fallback;
  }

  private cssImageUrl(value: string): string {
    return `url("${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;
  }
  private imageFallbackUrl(trip: TripPlan): string {
    const title = this.escapeHtml(this.destinationTitle(trip)).slice(0, 44) || 'Trip plan';
    const subtitle = this.escapeHtml(`${trip.request.days} days - ${this.travelModeLabel(trip.request.travelMode)} route`);
    const scene = this.destinationPosterScene(trip);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img"><defs><linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#082f49"/><stop offset="0.45" stop-color="#0ea5e9"/><stop offset="1" stop-color="#020617"/></linearGradient><linearGradient id="warm" x1="0" x2="1"><stop stop-color="#f8fafc"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1200" height="800" fill="url(#sky)"/>${scene}<rect x="0" y="0" width="1200" height="800" fill="none" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="3"/><rect x="52" y="48" width="530" height="156" rx="24" fill="#020617" fill-opacity="0.52"/><text x="76" y="104" fill="#7dd3fc" font-family="Arial" font-size="25" font-weight="800" letter-spacing="8">DESTINATION POSTER</text><text x="76" y="165" fill="#f8fafc" font-family="Georgia" font-size="66" font-weight="700">${title}</text><text x="78" y="215" fill="#dbeafe" font-family="Arial" font-size="28">${subtitle}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private destinationPosterScene(trip: TripPlan): string {
    const value = `${trip.destination.name} ${trip.destination.region} ${trip.destination.country} ${trip.request.destination}`.toLowerCase();
    if (value.includes('paris')) {
      return `<circle cx="930" cy="135" r="82" fill="#f8fafc" opacity="0.18"/><path d="M708 670 L822 238 L936 670" fill="none" stroke="#e0f2fe" stroke-width="24" stroke-linejoin="round" filter="url(#glow)"/><path d="M765 430 H879 M738 540 H906 M792 325 H852" stroke="#7dd3fc" stroke-width="18" stroke-linecap="round"/><path d="M746 670 C782 592 858 592 900 670" fill="none" stroke="#e0f2fe" stroke-width="22"/><path d="M0 655 C260 530 470 548 735 492 C920 452 1040 375 1200 278 L1200 800 L0 800 Z" fill="#06172a" opacity="0.72"/><path d="M0 690 C270 548 498 548 790 486 C970 448 1086 376 1200 310" fill="none" stroke="#f8fafc" stroke-width="22" opacity="0.28"/><path d="M155 645 h180 l-28 -64 h-124 z" fill="#0f172a" opacity="0.88"/><path d="M180 581 h132" stroke="#7dd3fc" stroke-width="16" stroke-linecap="round" opacity="0.66"/>`;
    }
    if (value.includes('munnar')) {
      return `<circle cx="905" cy="130" r="78" fill="#bbf7d0" opacity="0.22"/><path d="M0 650 C190 560 330 520 520 545 C710 572 845 468 1200 395 L1200 800 L0 800 Z" fill="#064e3b" opacity="0.9"/><path d="M0 700 C220 615 388 602 578 625 C774 650 900 548 1200 485" fill="none" stroke="#86efac" stroke-width="24" opacity="0.35"/><path d="M90 590 L288 318 L482 590 Z" fill="#0f766e" opacity="0.88"/><path d="M430 610 L672 260 L930 610 Z" fill="#075985" opacity="0.78"/><path d="M84 684 C220 638 392 638 536 684 M68 738 C260 690 482 690 660 738 M560 688 C760 636 942 636 1130 688" fill="none" stroke="#bbf7d0" stroke-width="13" stroke-linecap="round" opacity="0.42"/>`;
    }
    if (value.includes('thailand')) {
      return `<circle cx="898" cy="126" r="82" fill="#fef3c7" opacity="0.24"/><path d="M0 610 C250 540 470 574 710 520 C900 478 1045 390 1200 295 L1200 800 L0 800 Z" fill="#0369a1" opacity="0.72"/><path d="M0 705 C240 640 450 645 690 590 C920 538 1055 455 1200 370" fill="none" stroke="#bae6fd" stroke-width="28" opacity="0.42"/><path d="M180 608 L272 412 L364 608 Z" fill="#f59e0b" opacity="0.82"/><path d="M226 414 L272 328 L318 414 Z" fill="#fde68a" opacity="0.9"/><path d="M760 620 C806 518 878 518 922 620" fill="none" stroke="#f8fafc" stroke-width="20"/><path d="M860 518 C848 420 894 350 942 300" fill="none" stroke="#bbf7d0" stroke-width="16" stroke-linecap="round"/><path d="M944 302 C890 294 866 318 844 352 M944 302 C952 358 936 392 902 420" stroke="#bbf7d0" stroke-width="14" stroke-linecap="round"/>`;
    }
    return `<circle cx="885" cy="170" r="98" fill="#7dd3fc" opacity="0.34"/><path d="M0 640 C220 480 420 460 690 400 C890 354 1020 274 1200 180 L1200 800 L0 800 Z" fill="#0369a1" opacity="0.88"/><path d="M0 690 C260 520 510 510 810 430 C990 382 1100 310 1200 250" fill="none" stroke="#bae6fd" stroke-width="28" opacity="0.55"/><path d="M120 610 L310 300 L500 610 Z" fill="#1d4ed8" opacity="0.64"/><path d="M690 610 L895 275 L1120 610 Z" fill="#075985" opacity="0.72"/>`;
  }

  placeImageQuery(trip: TripPlan): string {
    const value = `${trip.destination.name} ${trip.destination.region} ${trip.destination.country} ${trip.request.destination}`.toLowerCase();
    if (value.includes('munnar')) return 'munnar tea gardens kerala hills';
    if (value.includes('paris') && value.includes('texas')) return 'paris texas downtown travel';
    if (value.includes('paris')) return 'paris france landmark travel';
    if (value.includes('thailand')) return 'thailand beach temples travel';
    if (value.includes('thrissur')) return 'thrissur kerala temple travel';
    return `${this.destinationTitle(trip)} travel destination`;
  }

  cleanPlaceName(value: string): string {
    const segments = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const rawParts = segments.length ? segments : value.split(/\s+/).filter(Boolean);
    const words = rawParts.join(' ').split(/\s+/).filter(Boolean);
    const half = Math.floor(words.length / 2);
    if (half > 0 && words.length % 2 === 0) {
      const first = words.slice(0, half).join(' ').toLowerCase();
      const second = words.slice(half).join(' ').toLowerCase();
      if (first === second) return words.slice(0, half).join(' ');
    }
    const unique = rawParts.filter((part, index, list) => part.toLowerCase() !== list[index - 1]?.toLowerCase());
    return unique.slice(0, 2).join(', ') || value;
  }
  travelModeLabel(mode = 'car'): string {
    const labels: Record<string, string> = {
      car: 'Car',
      bus: 'Bus',
      tram: 'Tram',
      train: 'Train',
      flight: 'Flight'
    };
    return labels[mode] ?? 'Car';
  }

  mainTravelLeg(trip: TripPlan) {
    return trip.routeMap.transit.find((leg) => leg.from === 'trip-origin') ?? trip.routeMap.transit[0];
  }

  transportExpenseDetail(trip: TripPlan): string {
    const mode = trip.request.travelMode ?? 'car';
    const amount = this.money(trip.budget.transport, trip.budget.currency);
    const date = trip.weather[0]?.date ?? 'selected date';
    if (mode === 'flight') return `Flight and airport transfer estimate for ${date}: ${amount}. Long-distance routes are auto-switched to flight when car travel is not realistic.`;
    if (mode === 'car') return `Petrol, toll, parking estimate: ${amount} for the main drive.`;
    if (mode === 'train') return `Train fare estimate for ${date}: ${amount} including station transfer buffer.`;
    if (mode === 'bus') return `Bus fare estimate for ${date}: ${amount} including local transfer buffer.`;
    return `Tram/local transit estimate for ${date}: ${amount}.`;
  }
  hotelSummary(trip: TripPlan): string {
    const nights = Math.max(1, trip.request.days - 1);
    const daily = this.money(Math.round(trip.budget.accommodation / nights), trip.budget.currency);
    if (this.isMunnarTrip(trip)) {
      return `Plan ${nights} night${nights > 1 ? 's' : ''} around Munnar town or Mattupetty Road so tea museums, gardens, dam views, and Top Station stay easy by bus or short taxi hop. Keep around ${daily} per night for this budget tier.`;
    }
    return `Plan ${nights} night${nights > 1 ? 's' : ''} near the main transit area, then move closer to the final viewpoint only if the route feels rushed. Keep around ${daily} per night for this budget tier.`;
  }

  hotelIdeas(trip: TripPlan): HotelIdea[] {
    const stayBudget = Math.max(1, trip.budget.accommodation);
    if (this.isMunnarTrip(trip)) {
      return [
        {
          name: 'Tea garden homestay',
          description: 'Best for slow mornings, local breakfast, and easy access to Munnar town plus the Tea Museum.',
          estimate: Math.round(stayBudget * 0.34)
        },
        {
          name: 'Mattupetty road resort',
          description: 'A practical mid-route stay for dam, lake, and Echo Point days with less backtracking.',
          estimate: Math.round(stayBudget * 0.38)
        },
        {
          name: 'Viewpoint cabin stay',
          description: 'Use this for the final night if you want a quieter mountain finish near Top Station style scenery.',
          estimate: Math.round(stayBudget * 0.28)
        }
      ];
    }

    return [
      {
        name: 'Central boutique stay',
        description: 'Choose this for first-night arrival ease, food access, and a short transfer to the starting stop.',
        estimate: Math.round(stayBudget * 0.4)
      },
      {
        name: 'Transit-friendly hotel',
        description: 'Best value when the plan uses bus, train, or metro legs and you want predictable morning starts.',
        estimate: Math.round(stayBudget * 0.34)
      },
      {
        name: 'Viewpoint guesthouse',
        description: 'A quieter final stay idea for sunset plans, late checkout, and a softer last travel day.',
        estimate: Math.round(stayBudget * 0.26)
      }
    ];
  }

  routePolyline(stops: RouteStop[]): string {
    return stops.map((stop) => `${stop.x},${stop.y}`).join(' ');
  }

  weatherMood(weather: WeatherDay[]): string {
    const condition = weather[0]?.condition.toLowerCase() ?? '';
    if (condition.includes('rain') || condition.includes('storm')) return 'rain';
    if (condition.includes('sun') || condition.includes('clear')) return 'sun';
    return 'soft';
  }

  weatherIconClass(condition: string): string {
    const value = condition.toLowerCase();
    if (value.includes('thunder') || value.includes('storm')) return 'icon-storm';
    if (value.includes('sun') || value.includes('clear')) return 'icon-sun';
    if (value.includes('partly')) return 'icon-partly';
    if (value.includes('cloud') || value.includes('fog')) return 'icon-cloud';
    if (value.includes('rain') || value.includes('shower')) return 'icon-rain';
    return 'icon-soft';
  }

  weatherCardClass(day: WeatherDay): string {
    const value = day.condition.toLowerCase();
    if (value.includes('thunder') || value.includes('storm')) return 'weather-card weather-card-storm';
    if (value.includes('sun') || value.includes('clear')) return 'weather-card weather-card-sun';
    if (value.includes('partly')) return 'weather-card weather-card-partly';
    if (value.includes('cloud') || value.includes('fog')) return 'weather-card weather-card-cloud';
    if (value.includes('rain') || value.includes('shower')) return 'weather-card weather-card-rain';
    return 'weather-card weather-card-soft';
  }

  stopName(id: string, trip: TripPlan): string {
    if (id === 'trip-origin') return trip.routeMap.origin?.name ?? trip.request.origin;
    return trip.routeMap.stops.find((stop) => stop.id === id)?.name ?? id;
  }

  moveStop(index: number, direction: -1 | 1): void {
    this.plan.update((trip) => {
      if (!trip) return trip;
      const stops = [...trip.routeMap.stops];
      const target = index + direction;
      if (target < 0 || target >= stops.length) return trip;
      [stops[index], stops[target]] = [stops[target], stops[index]];
      return { ...trip, routeMap: { ...trip.routeMap, stops } };
    });
    this.renderMapSoon();
  }

  removeStop(index: number): void {
    this.plan.update((trip) => {
      if (!trip || trip.routeMap.stops.length <= 3) return trip;
      const removed = trip.routeMap.stops[index];
      return {
        ...trip,
        routeMap: {
          ...trip.routeMap,
          stops: trip.routeMap.stops.filter((_, stopIndex) => stopIndex !== index),
          transit: trip.routeMap.transit.filter((leg) => leg.from !== removed.id && leg.to !== removed.id)
        }
      };
    });
    this.renderMapSoon();
  }

  addStop(): void {
    const name = this.newStopName().trim();
    if (!name) return;
    this.plan.update((trip) => {
      if (!trip) return trip;
      const count = trip.routeMap.stops.length;
      const previous = trip.routeMap.stops[count - 1];
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `custom-${count + 1}`;
      const stop: RouteStop = {
        id,
        day: trip.request.days,
        name,
        type: 'culture',
        x: Math.min(92, 12 + ((count * 17) % 72)),
        y: Math.min(88, 18 + ((count * 23) % 62)),
        note: 'Custom place added by you.',
        estimatedCost: this.newStopCost()
      };
      return {
        ...trip,
        routeMap: {
          ...trip.routeMap,
          stops: [...trip.routeMap.stops, stop],
          transit: previous ? [...trip.routeMap.transit, { from: previous.id, to: stop.id, mode: 'bus', duration: '20 min', estimatedCost: 3, tip: 'Custom connection.' }] : trip.routeMap.transit
        }
      };
    });
    this.newStopName.set('');
    this.newStopCost.set(0);
    this.renderMapSoon();
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  numberValue(event: Event): number {
    return Number((event.target as HTMLInputElement).value) || 0;
  }

  saveTrip(trip: TripPlan): void {
    const saved = [trip, ...this.savedTrips().filter((item) => item.id !== trip.id)].slice(0, 6);
    this.savedTrips.set(saved);
    this.persistSavedTrips(saved);
    this.savedTripsOpen.set(true);
  }

  openSavedTrip(trip: TripPlan): void {
    this.plan.set(trip);
    this.warnings.set([]);
    this.statusMessages.set(['Loaded saved trip from this browser.']);
    this.savedTripsOpen.set(false);
    this.renderMapSoon(trip);
  }

  openSavedTrips(): void {
    this.savedTripsOpen.set(true);
  }

  closeSavedTrips(): void {
    this.savedTripsOpen.set(false);
    this.comparingSavedTrips.set(false);
  }

  toggleCompareTrip(id: string): void {
    this.compareTripIds.update((ids) => {
      if (ids.includes(id)) return ids.filter((item) => item !== id);
      return [...ids, id].slice(-2);
    });
    this.comparingSavedTrips.set(false);
  }

  isTripSelectedForCompare(id: string): boolean {
    return this.compareTripIds().includes(id);
  }

  startCompareTrips(): void {
    if (this.comparedTrips().length === 2) this.comparingSavedTrips.set(true);
  }

  clearCompareTrips(): void {
    this.compareTripIds.set([]);
    this.comparingSavedTrips.set(false);
  }

  removeSavedTrip(id: string): void {
    const saved = this.savedTrips().filter((trip) => trip.id !== id);
    this.savedTrips.set(saved);
    this.compareTripIds.update((ids) => ids.filter((item) => item !== id));
    if (this.comparedTrips().length < 2) this.comparingSavedTrips.set(false);
    this.persistSavedTrips(saved);
  }

  private readSavedTrips(): TripPlan[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem('tour-plan:saved-trips');
      return raw ? JSON.parse(raw) as TripPlan[] : [];
    } catch {
      return [];
    }
  }

  private persistSavedTrips(trips: TripPlan[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('tour-plan:saved-trips', JSON.stringify(trips));
  }
  private renderMapSoon(trip = this.plan()): void {
    if (!trip) return;
    window.clearTimeout(this.mapRenderTimer);
    this.mapRenderTimer = window.setTimeout(() => this.renderRouteMap(trip), 120);
  }

  private renderRouteMap(trip: TripPlan): void {
    const element = document.getElementById('real-route-map');
    const L = window.L;
    if (!element) return;

    if (!L) {
      if (this.mapReadyAttempts < 30) {
        this.mapReadyAttempts += 1;
        this.mapRenderTimer = window.setTimeout(() => this.renderRouteMap(trip), 200);
      }
      return;
    }

    this.mapReadyAttempts = 0;
    const center = this.destinationCenter(trip);
    const mapStops = this.mapStops(trip);
    const coordinates = this.routeCoordinates(trip);

    if (!this.map) {
      this.map = L.map(element, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true
      }).setView([center.lat, center.lon], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap, CARTO'
      }).addTo(this.map);
    }

    this.map.invalidateSize();
    if (this.routeLayer) this.routeLayer.remove();
    if (this.markerLayer) this.markerLayer.remove();

    this.routeLayer = L.layerGroup().addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);

    if (coordinates.length > 1) {
      L.polyline(coordinates, {
        color: '#0ea5e9',
        weight: 9,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.routeLayer);
      L.polyline(coordinates, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.96,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.routeLayer);
    }

    coordinates.forEach((coordinate, index) => {
      const stop = mapStops[index];
      if (!stop) return;
      L.marker(coordinate, { icon: this.pinIcon(index + 1) })
        .addTo(this.markerLayer)
        .bindPopup(this.popupHtml(stop, index, trip), { className: 'trip-popup', maxWidth: 280 });
    });

    if (coordinates.length > 1) {
      this.map.fitBounds(coordinates, { padding: [42, 42], maxZoom: 13 });
    } else {
      this.map.setView([center.lat, center.lon], 12);
    }

    window.setTimeout(() => this.map?.invalidateSize(), 60);
  }

  private destinationCenter(trip: TripPlan): { lat: number; lon: number } {
    const coordinates = trip.destination.coordinates;
    if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)) {
      return coordinates;
    }
    return this.knownCenterFromText(`${trip.destination.name} ${trip.destination.region} ${trip.destination.country} ${trip.request.destination}`) ?? { lat: 20, lon: 0 };
  }

  private originCoordinates(trip: TripPlan): [number, number] | null {
    const coordinates = trip.routeMap.origin?.coordinates;
    if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)) {
      return [coordinates.lat, coordinates.lon];
    }
    const known = this.knownCenterFromText(`${trip.routeMap.origin?.name ?? ''} ${trip.request.origin}`);
    return known ? [known.lat, known.lon] : null;
  }

  private knownCenterFromText(text: string): { lat: number; lon: number } | null {
    const value = text.toLowerCase();
    if (value.includes('thrissur')) return { lat: 10.5276, lon: 76.2144 };
    if (value.includes('munnar')) return { lat: 10.0889, lon: 77.0595 };
    if (value.includes('paris') && value.includes('texas')) return { lat: 33.6609, lon: -95.5555 };
    if (value.includes('paris')) return { lat: 48.8566, lon: 2.3522 };
    if (value.includes('london')) return { lat: 51.5072, lon: -0.1276 };
    if (value.includes('tokyo')) return { lat: 35.6762, lon: 139.6503 };
    if (value.includes('dubai')) return { lat: 25.2048, lon: 55.2708 };
    if (value.includes('singapore')) return { lat: 1.3521, lon: 103.8198 };
    if (value.includes('new york')) return { lat: 40.7128, lon: -74.006 };
    return null;
  }

  private routeCoordinates(trip: TripPlan): Array<[number, number]> {
    const localCoordinates = this.destinationStopCoordinates(trip);
    const origin = this.originCoordinates(trip);
    return origin ? [origin, ...localCoordinates] : localCoordinates;
  }

  private destinationStopCoordinates(trip: TripPlan): Array<[number, number]> {
    const munnarRoute = this.munnarRouteCoordinates(trip);
    if (munnarRoute.length) return munnarRoute;

    const center = this.destinationCenter(trip);
    return trip.routeMap.stops.map((stop) => [
      center.lat + (50 - stop.y) * 0.003,
      center.lon + (stop.x - 50) * 0.004
    ]);
  }

  private mapStops(trip: TripPlan): RouteStop[] {
    const origin = this.originCoordinates(trip);
    if (!origin) return trip.routeMap.stops;
    const mainLeg = this.mainTravelLeg(trip);
    const originStop: RouteStop = {
      id: 'trip-origin',
      day: 1,
      name: `Start: ${trip.routeMap.origin?.name ?? trip.request.origin}`,
      type: 'origin',
      x: 0,
      y: 0,
      note: `Start point for the ${this.travelModeLabel(trip.request.travelMode).toLowerCase()} route to ${this.destinationTitle(trip)}.`,
      estimatedCost: mainLeg?.estimatedCost ?? 0
    };
    return [originStop, ...trip.routeMap.stops];
  }

  private isMunnarTrip(trip: TripPlan): boolean {
    return `${trip.destination.name} ${trip.destination.region} ${trip.request.destination}`.toLowerCase().includes('munnar');
  }

  private munnarRouteCoordinates(trip: TripPlan): Array<[number, number]> {
    if (!this.isMunnarTrip(trip)) return [];

    const pointsById: Record<string, [number, number]> = {
      arrival: [10.0889, 77.0595],
      'tea-museum': [10.0956, 77.0636],
      'rose-garden': [10.0827, 77.0755],
      mattupetty: [10.112, 77.124],
      'echo-point': [10.1205, 77.159],
      'top-station': [10.1216, 77.246]
    };

    const fallbackPoints: Array<[number, number]> = [
      [10.0889, 77.0595],
      [10.0956, 77.0636],
      [10.0827, 77.0755],
      [10.112, 77.124],
      [10.1205, 77.159],
      [10.1216, 77.246]
    ];

    return trip.routeMap.stops.map((stop, index) => {
      if (pointsById[stop.id]) return pointsById[stop.id];
      if (index < fallbackPoints.length) return fallbackPoints[index];
      const last = fallbackPoints[fallbackPoints.length - 1];
      return [last[0] + (index - fallbackPoints.length + 1) * 0.004, last[1] + (index - fallbackPoints.length + 1) * 0.008];
    });
  }

  private pinIcon(index: number): any {
    const L = window.L;
    return L.divIcon({
      className: 'route-pin-marker',
      html: `<span>${index}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -20]
    });
  }

  private popupHtml(stop: RouteStop, index: number, trip: TripPlan): string {
    const connectedLeg = trip.routeMap.transit.find((leg) => leg.from === stop.id || leg.to === stop.id);
    const transitText = connectedLeg
      ? `${connectedLeg.mode.toUpperCase()} - ${connectedLeg.duration}: ${connectedLeg.tip}`
      : 'Custom route stop';

    return `
      <section class="route-popup-card">
        <p>Stop ${index + 1} / Day ${stop.day}</p>
        <h3>${this.escapeHtml(stop.name)}</h3>
        <span>${this.escapeHtml(stop.type)}</span>
        <div>${this.escapeHtml(stop.note)}</div>
        <strong>${this.money(stop.estimatedCost, trip.budget.currency)}</strong>
        <small>${this.escapeHtml(transitText)}</small>
      </section>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}








