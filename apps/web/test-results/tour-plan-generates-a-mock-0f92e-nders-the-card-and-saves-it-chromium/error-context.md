# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour-plan.spec.ts >> generates a mocked trip, renders the card, and saves it
- Location: e2e/tour-plan.spec.ts:172:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Transport expense')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Transport expense')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - navigation "Theme mode" [ref=e4]:
    - button "System" [ref=e5] [cursor=pointer]: System
    - button "Light" [ref=e7] [cursor=pointer]: Light
    - button "Dark" [pressed] [ref=e9] [cursor=pointer]: Dark
  - button "Open saved trips" [ref=e11] [cursor=pointer]: Saved
  - generic [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e18]:
        - paragraph [ref=e19]: Trip AI interaction
        - strong [ref=e20]: Tell the AI your travel mood. It will build the route, weather plan, hotels, and cost cards.
      - generic [ref=e21]: Ready
    - generic "AI travel planning conversation preview" [ref=e23]:
      - article [ref=e24]:
        - generic [ref=e25]: AI
        - paragraph [ref=e26]: I build routes, weather, hotels, maps, and budget cards from your travel vibe.
      - article [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: You
          - button "Edit travel vibe" [ref=e30] [cursor=pointer]
        - paragraph [ref=e32]: peaceful nature, local food, scenic train rides, and light adventure
    - region "Trip plan controls" [ref=e33]:
      - generic "Quick AI prompt ideas" [ref=e34]:
        - button "Nature route" [ref=e35] [cursor=pointer]
        - button "Food + culture" [ref=e36] [cursor=pointer]
        - button "Premium slow" [ref=e37] [cursor=pointer]
      - generic [ref=e38]:
        - generic [ref=e39]: Travel vibe
        - textbox "Travel vibe" [ref=e40]:
          - /placeholder: Peaceful nature, local food, scenic train rides, light adventure...
          - text: peaceful nature, local food, scenic train rides, and light adventure
      - generic [ref=e42]:
        - generic [ref=e43]: From
        - generic [ref=e44]:
          - textbox "From Use my location" [ref=e45]:
            - /placeholder: Auto detect or type city
            - text: Thrissur, Kerala, India
          - button "Use my location" [ref=e46] [cursor=pointer]
      - generic [ref=e48]:
        - generic [ref=e49]:
          - generic [ref=e50]: To
          - textbox "To" [ref=e51]:
            - /placeholder: Type destination
            - text: San Francisco, United States
        - button "San Francisco, California, United States" [ref=e53] [cursor=pointer]
      - group [ref=e54]:
        - generic "More optional" [ref=e55] [cursor=pointer]
        - option "Slow living" [selected]
        - option "Adventure"
        - option "Culture"
        - option "Food"
        - option "Family"
        - option "Luxury"
        - option "Spring"
        - option "Summer"
        - option "Monsoon"
        - option "Autumn"
        - option "Winter" [selected]
        - option "Lean"
        - option "Comfort" [selected]
        - option "Premium"
      - generic [ref=e56]:
        - generic [ref=e57]: Currency
        - combobox "Currency" [ref=e58]:
          - option "USD - US Dollar" [selected]
          - option "INR - Indian Rupee"
          - option "EUR - Euro"
          - option "GBP - British Pound"
          - option "AED - UAE Dirham"
          - option "SGD - Singapore Dollar"
          - option "JPY - Japanese Yen"
          - option "AUD - Australian Dollar"
          - option "CAD - Canadian Dollar"
      - generic [ref=e59]:
        - generic [ref=e60]: Days
        - spinbutton "Days" [ref=e61]: "3"
      - button "Generate trip plan" [ref=e62] [cursor=pointer]
  - generic [ref=e63]:
    - generic [ref=e64]:
      - generic [ref=e65]: Trip AI active
      - strong [ref=e66]: San Francisco, United States
    - textbox "Active travel vibe" [ref=e67]: peaceful nature, local food, scenic train rides, and light adventure
    - button "Update result" [ref=e68] [cursor=pointer]
  - article [ref=e69]:
    - generic [ref=e70]:
      - generic [ref=e71]:
        - button "Regenerate image" [ref=e72] [cursor=pointer]
        - img "San Francisco" [ref=e74]
        - generic [ref=e76]:
          - generic [ref=e77]: AI poster image
          - strong [ref=e78]: San Francisco
      - generic [ref=e79]:
        - paragraph [ref=e80]: Trip mode
        - heading "San Francisco" [level=2] [ref=e81]
        - paragraph [ref=e82]: San Francisco slow travel with scenic routing
        - generic [ref=e83]:
          - generic [ref=e84]:
            - strong [ref=e85]: "3"
            - text: Days
          - generic [ref=e86]:
            - strong [ref=e87]: "6"
            - text: Stops
          - generic [ref=e88]:
            - strong [ref=e89]: $1,150
            - text: Budget
    - generic [ref=e90]:
      - generic [ref=e91]:
        - paragraph [ref=e92]: United States
        - heading "San Francisco" [level=2] [ref=e93]
        - heading "San Francisco slow travel with scenic routing" [level=3] [ref=e94]
        - paragraph [ref=e95]: A 3-day English travel plan for San Francisco with route stops, weather, hotels, and budget clarity.
        - generic [ref=e96]:
          - generic [ref=e97]: Slow travel
          - generic [ref=e98]: Local food
          - generic [ref=e99]: Weather-aware route
      - generic [ref=e100]:
        - generic [ref=e101]: Total estimate
        - generic [ref=e102]:
          - strong [ref=e103]: $1,150
          - button "Save trip" [ref=e104] [cursor=pointer]
    - generic [ref=e105]:
      - article [ref=e106]:
        - generic [ref=e108]: Day 1
        - heading "Sunny" [level=3] [ref=e111]
        - paragraph [ref=e112]: Comfortable weather for walking, transit hops, and viewpoints.
        - generic [ref=e113]:
          - strong [ref=e114]: 24C
          - text: / 15C
        - text: 10% rain - Wear breathable layers and walking shoes.
      - article [ref=e115]:
        - generic [ref=e117]: Day 2
        - heading "Partly Cloudy" [level=3] [ref=e120]
        - paragraph [ref=e121]: Comfortable weather for walking, transit hops, and viewpoints.
        - generic [ref=e122]:
          - strong [ref=e123]: 25C
          - text: / 16C
        - text: 14% rain - Wear breathable layers and walking shoes.
      - article [ref=e124]:
        - generic [ref=e126]: Day 3
        - heading "Sunny" [level=3] [ref=e129]
        - paragraph [ref=e130]: Comfortable weather for walking, transit hops, and viewpoints.
        - generic [ref=e131]:
          - strong [ref=e132]: 26C
          - text: / 17C
        - text: 18% rain - Wear breathable layers and walking shoes.
    - generic [ref=e133]:
      - generic [ref=e135]:
        - paragraph [ref=e136]: Drive details
        - paragraph [ref=e137]: 3 days through San Francisco with smart transit and editable route stops.
      - generic [ref=e138]:
        - strong [ref=e141]: San Francisco
        - generic [ref=e142]: 3 days
        - generic [ref=e143]: United States
        - generic [ref=e144]: Car
        - generic [ref=e145]: 6 stops
        - generic [ref=e146]: $572 route
        - generic "Trip group" [ref=e147]:
          - generic [ref=e148]: A
          - generic [ref=e149]: I
          - generic [ref=e150]: T
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic "Interactive trip route map" [ref=e153]:
            - generic:
              - generic:
                - img
              - generic:
                - button "1" [ref=e156] [cursor=pointer]:
                  - generic [ref=e157]: "1"
                - button "2" [ref=e158] [cursor=pointer]:
                  - generic [ref=e159]: "2"
                - button "3" [ref=e160] [cursor=pointer]:
                  - generic [ref=e161]: "3"
                - button "4" [ref=e162] [cursor=pointer]:
                  - generic [ref=e163]: "4"
                - button "5" [ref=e164] [cursor=pointer]:
                  - generic [ref=e165]: "5"
                - button "6" [ref=e166] [cursor=pointer]:
                  - generic [ref=e167]: "6"
                - button "7" [ref=e168] [cursor=pointer]:
                  - generic [ref=e169]: "7"
            - generic [ref=e170]:
              - button "Zoom in" [ref=e171] [cursor=pointer]: +
              - button "Zoom out" [ref=e172] [cursor=pointer]: −
          - generic [ref=e173]: Click a numbered pin to view the place idea, day, transit note, and expense.
        - complementary [ref=e174]:
          - heading "Customize route" [level=3] [ref=e175]
          - generic [ref=e176]:
            - generic [ref=e177]: 1. Destination Arrival
            - generic [ref=e178]: $24
            - button "Up" [ref=e179] [cursor=pointer]
            - button "Down" [ref=e180] [cursor=pointer]
            - button "Remove" [ref=e181] [cursor=pointer]
          - generic [ref=e182]:
            - generic [ref=e183]: 2. Local Market
            - generic [ref=e184]: $32
            - button "Up" [ref=e185] [cursor=pointer]
            - button "Down" [ref=e186] [cursor=pointer]
            - button "Remove" [ref=e187] [cursor=pointer]
          - generic [ref=e188]:
            - generic [ref=e189]: 3. Culture Museum
            - generic [ref=e190]: $18
            - button "Up" [ref=e191] [cursor=pointer]
            - button "Down" [ref=e192] [cursor=pointer]
            - button "Remove" [ref=e193] [cursor=pointer]
          - generic [ref=e194]:
            - generic [ref=e195]: 4. Garden Quarter
            - generic [ref=e196]: $16
            - button "Up" [ref=e197] [cursor=pointer]
            - button "Down" [ref=e198] [cursor=pointer]
            - button "Remove" [ref=e199] [cursor=pointer]
          - generic [ref=e200]:
            - generic [ref=e201]: 5. Main Transit Link
            - generic [ref=e202]: $12
            - button "Up" [ref=e203] [cursor=pointer]
            - button "Down" [ref=e204] [cursor=pointer]
            - button "Remove" [ref=e205] [cursor=pointer]
          - generic [ref=e206]:
            - generic [ref=e207]: 6. Sunset Viewpoint
            - generic [ref=e208]: $20
            - button "Up" [ref=e209] [cursor=pointer]
            - button "Down" [ref=e210] [cursor=pointer]
            - button "Remove" [ref=e211] [cursor=pointer]
          - generic [ref=e212]:
            - textbox "Add place" [ref=e213]
            - spinbutton [ref=e214]: "0"
            - button "Add" [ref=e215] [cursor=pointer]
      - generic [ref=e216]:
        - article [ref=e217]:
          - strong [ref=e218]: CAR
          - generic [ref=e219]: Thrissur, Kerala, India to Destination Arrival
          - generic [ref=e220]: Same day - $420
        - article [ref=e221]:
          - strong [ref=e222]: BUS
          - generic [ref=e223]: Destination Arrival to Local Market
          - generic [ref=e224]: 15 min - $4
        - article [ref=e225]:
          - strong [ref=e226]: TRAIN
          - generic [ref=e227]: Local Market to Culture Museum
          - generic [ref=e228]: 19 min - $5
        - article [ref=e229]:
          - strong [ref=e230]: BUS
          - generic [ref=e231]: Culture Museum to Garden Quarter
          - generic [ref=e232]: 23 min - $6
        - article [ref=e233]:
          - strong [ref=e234]: TRAIN
          - generic [ref=e235]: Garden Quarter to Main Transit Link
          - generic [ref=e236]: 27 min - $7
        - article [ref=e237]:
          - strong [ref=e238]: BUS
          - generic [ref=e239]: Main Transit Link to Sunset Viewpoint
          - generic [ref=e240]: 31 min - $8
    - generic [ref=e241]:
      - article [ref=e242]:
        - generic [ref=e244]:
          - text: Accommodation
          - strong [ref=e245]: $520
      - article [ref=e246]:
        - generic [ref=e248]:
          - text: Food
          - strong [ref=e249]: $210
      - article [ref=e250]:
        - generic [ref=e252]:
          - text: Activities
          - strong [ref=e253]: $70
      - article [ref=e254]:
        - generic [ref=e256]:
          - text: Buffer
          - strong [ref=e257]: $30
    - generic [ref=e258]:
      - generic [ref=e259]:
        - paragraph [ref=e260]: Accommodation brief
        - heading "Hotel stay idea" [level=2] [ref=e261]
        - paragraph [ref=e262]: Plan 2 nights near the main transit area, then move closer to the final viewpoint only if the route feels rushed. Keep around $260 per night for this budget tier.
      - generic [ref=e263]:
        - article [ref=e264]:
          - generic [ref=e265]: "01"
          - heading "Central boutique stay" [level=3] [ref=e266]
          - paragraph [ref=e267]: Choose this for first-night arrival ease, food access, and a short transfer to the starting stop.
          - strong [ref=e268]: $208
        - article [ref=e269]:
          - generic [ref=e270]: "02"
          - heading "Transit-friendly hotel" [level=3] [ref=e271]
          - paragraph [ref=e272]: Best value when the plan uses bus, train, or metro legs and you want predictable morning starts.
          - strong [ref=e273]: $177
        - article [ref=e274]:
          - generic [ref=e275]: "03"
          - heading "Viewpoint guesthouse" [level=3] [ref=e276]
          - paragraph [ref=e277]: A quieter final stay idea for sunset plans, late checkout, and a softer last travel day.
          - strong [ref=e278]: $135
    - generic [ref=e279]:
      - article [ref=e280]:
        - paragraph [ref=e281]: Day 1
        - heading "Day 1 in San Francisco" [level=3] [ref=e282]
        - paragraph [ref=e283]: Easy pacing and local discoveries
        - generic [ref=e284]:
          - strong [ref=e285]: Morning - Neighborhood walk
          - generic [ref=e286]: Destination Arrival
          - paragraph [ref=e287]: Start with a gentle route stop and local breakfast nearby.
        - generic [ref=e288]:
          - strong [ref=e289]: Afternoon - Scenic transfer
          - generic [ref=e290]: Local Market
          - paragraph [ref=e291]: Use the planned transit route and keep time for photos.
      - article [ref=e292]:
        - paragraph [ref=e293]: Day 2
        - heading "Day 2 in San Francisco" [level=3] [ref=e294]
        - paragraph [ref=e295]: Easy pacing and local discoveries
        - generic [ref=e296]:
          - strong [ref=e297]: Morning - Neighborhood walk
          - generic [ref=e298]: Local Market
          - paragraph [ref=e299]: Start with a gentle route stop and local breakfast nearby.
        - generic [ref=e300]:
          - strong [ref=e301]: Afternoon - Scenic transfer
          - generic [ref=e302]: Culture Museum
          - paragraph [ref=e303]: Use the planned transit route and keep time for photos.
      - article [ref=e304]:
        - paragraph [ref=e305]: Day 3
        - heading "Day 3 in San Francisco" [level=3] [ref=e306]
        - paragraph [ref=e307]: Easy pacing and local discoveries
        - generic [ref=e308]:
          - strong [ref=e309]: Morning - Neighborhood walk
          - generic [ref=e310]: Culture Museum
          - paragraph [ref=e311]: Start with a gentle route stop and local breakfast nearby.
        - generic [ref=e312]:
          - strong [ref=e313]: Afternoon - Scenic transfer
          - generic [ref=e314]: Garden Quarter
          - paragraph [ref=e315]: Use the planned transit route and keep time for photos.
    - generic [ref=e316]:
      - generic [ref=e317]:
        - paragraph [ref=e318]: Interact with Trip AI
        - heading "Refine this result" [level=2] [ref=e319]
        - paragraph [ref=e320]: Ask Trip AI to adjust the same result with a clearer vibe. The sticky bar stays active while you scroll.
      - generic [ref=e321]:
        - generic [ref=e322]: San Francisco
        - strong [ref=e323]: 6 stops - $1,150
        - generic [ref=e324]: 3 days through San Francisco with smart transit and editable route stops.
      - generic [ref=e325]:
        - button "More food" [ref=e326] [cursor=pointer]
        - button "Lower budget" [ref=e327] [cursor=pointer]
        - button "Softer stay" [ref=e328] [cursor=pointer]
    - generic [ref=e329]:
      - paragraph [ref=e330]: Local insider tips
      - heading "Dress in layers." [level=2] [ref=e331]
      - paragraph [ref=e332]: Weather can change during the day, so flexible clothing keeps the route comfortable.
      - paragraph [ref=e333]: A quiet viewpoint just outside the main route is best before sunset.
      - generic [ref=e334]:
        - generic [ref=e335]: Local market lunch
        - generic [ref=e336]: Craft coffee
        - generic [ref=e337]: Seasonal dessert
```

# Test source

```ts
  82  |           place: stops[index % stops.length].name,
  83  |           description: 'Start with a gentle route stop and local breakfast nearby.',
  84  |           estimatedCost: 18
  85  |         },
  86  |         {
  87  |           time: 'Afternoon',
  88  |           title: 'Scenic transfer',
  89  |           place: stops[(index + 1) % stops.length].name,
  90  |           description: 'Use the planned transit route and keep time for photos.',
  91  |           estimatedCost: 24
  92  |         }
  93  |       ]
  94  |     })),
  95  |     routeMap: {
  96  |       origin: { name: request.origin, coordinates: { lat: 10.5276, lon: 76.2144 } },
  97  |       overview: `${request.days} days through ${destinationName} with smart transit and editable route stops.`,
  98  |       stops,
  99  |       transit: [
  100 |         { from: 'trip-origin', to: stops[0].id, mode: request.travelMode, duration: 'Same day', estimatedCost: 420, tip: 'Main route connection.' },
  101 |         ...stops.slice(0, -1).map((stop, index) => ({
  102 |           from: stop.id,
  103 |           to: stops[index + 1].id,
  104 |           mode: index % 2 ? 'train' : 'bus',
  105 |           duration: `${15 + index * 4} min`,
  106 |           estimatedCost: 4 + index,
  107 |           tip: 'Short local transfer.'
  108 |         }))
  109 |       ]
  110 |     },
  111 |     budget: {
  112 |       currency: 'USD',
  113 |       totalEstimate: 1150,
  114 |       accommodation: 520,
  115 |       food: 210,
  116 |       transport: 320,
  117 |       activities: 70,
  118 |       buffer: 30,
  119 |       notes: 'Mocked E2E estimate.'
  120 |     },
  121 |     insiderTips: {
  122 |       localPhrase: 'Dress in layers.',
  123 |       localPhraseMeaning: 'Weather can change during the day, so flexible clothing keeps the route comfortable.',
  124 |       mustTryDishes: ['Local market lunch', 'Craft coffee', 'Seasonal dessert'],
  125 |       hiddenGem: 'A quiet viewpoint just outside the main route is best before sunset.',
  126 |       etiquette: ['Keep reusable water handy', 'Confirm transit times before late returns']
  127 |     },
  128 |     theme: {
  129 |       primary: '#38bdf8',
  130 |       secondary: '#0f172a',
  131 |       accent: '#0ea5e9',
  132 |       background: '#020617',
  133 |       surface: '#0b1220',
  134 |       text: '#e0f2fe'
  135 |     }
  136 |   };
  137 | }
  138 | 
  139 | async function mockGeneration(page: Page) {
  140 |   await page.addInitScript(() => {
  141 |     Object.defineProperty(window, 'EventSource', { value: undefined, configurable: true });
  142 |   });
  143 | 
  144 |   await page.route('**/api/generate-trip', async (route) => {
  145 |     const body = JSON.parse(route.request().postData() || '{}') as Partial<TripRequest>;
  146 |     await route.fulfill({
  147 |       status: 200,
  148 |       contentType: 'application/json',
  149 |       body: JSON.stringify({
  150 |         plan: buildTrip(body),
  151 |         meta: { provider: 'playwright-mock', warnings: [] }
  152 |       })
  153 |     });
  154 |   });
  155 | 
  156 |   await page.route('**/api/generate-image', async (route) => {
  157 |     await route.fulfill({
  158 |       status: 200,
  159 |       contentType: 'application/json',
  160 |       body: JSON.stringify({ url: posterSvg, provider: 'playwright-mock-image', warning: null })
  161 |     });
  162 |   });
  163 | }
  164 | 
  165 | test('reveals the trip form after the Trip AI intro', async ({ page }) => {
  166 |   await page.goto('/');
  167 |   await expect(page.getByText('Trip AI interaction')).toBeVisible();
  168 |   await expect(page.getByLabel('Trip plan controls')).toBeVisible({ timeout: 8_000 });
  169 |   await expect(page.getByRole('button', { name: 'Generate trip plan' })).toBeVisible();
  170 | });
  171 | 
  172 | test('generates a mocked trip, renders the card, and saves it', async ({ page }) => {
  173 |   await mockGeneration(page);
  174 |   await page.goto('/');
  175 |   await expect(page.getByLabel('Trip plan controls')).toBeVisible({ timeout: 8_000 });
  176 | 
  177 |   await page.getByLabel('From').fill('Thrissur, Kerala, India');
  178 |   await page.getByLabel('To').fill('San Francisco, United States');
  179 |   await page.getByRole('button', { name: 'Generate trip plan' }).click();
  180 | 
  181 |   await expect(page.getByRole('heading', { name: 'San Francisco' }).first()).toBeVisible({ timeout: 12_000 });
> 182 |   await expect(page.getByText('Transport expense')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  183 |   await expect(page.getByText('Hotel stay idea')).toBeVisible();
  184 | 
  185 |   await page.getByRole('button', { name: 'Save trip' }).click();
  186 |   await expect(page.getByRole('dialog', { name: 'Saved trips' })).toBeVisible();
  187 |   await expect(page.getByText('Your trip cards')).toBeVisible();
  188 |   await expect(page.getByText('San Francisco').first()).toBeVisible();
  189 | });
  190 | 
  191 | test('compares two saved trips in split screen mode', async ({ page }) => {
  192 |   const first = buildTrip({ destination: 'San Francisco, United States', days: 3 });
  193 |   const second = buildTrip({ destination: 'San Cristobal de las Casas, Mexico', days: 4 });
  194 | 
  195 |   await page.addInitScript((trips) => {
  196 |     window.localStorage.setItem('tour-plan:saved-trips', JSON.stringify(trips));
  197 |   }, [first, second]);
  198 | 
  199 |   await page.goto('/');
  200 |   await page.getByRole('button', { name: 'Open saved trips' }).click();
  201 |   await expect(page.getByRole('dialog', { name: 'Saved trips' })).toBeVisible();
  202 | 
  203 |   await page.getByRole('button', { name: 'Compare' }).nth(0).click();
  204 |   await page.getByRole('button', { name: 'Compare' }).nth(0).click();
  205 |   await page.getByRole('button', { name: 'Split compare' }).click();
  206 | 
  207 |   await expect(page.getByText('Trip comparison')).toBeVisible();
  208 |   await expect(page.getByText('San Francisco').first()).toBeVisible();
  209 |   await expect(page.getByText('San Cristobal de las Casas').first()).toBeVisible();
  210 |   await expect(page.getByText('Accommodation').first()).toBeVisible();
  211 |   await expect(page.getByText('Transport').first()).toBeVisible();
  212 | });
  213 | 
```