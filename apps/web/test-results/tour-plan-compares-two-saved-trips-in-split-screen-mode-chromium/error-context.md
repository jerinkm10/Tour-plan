# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tour-plan.spec.ts >> compares two saved trips in split screen mode
- Location: e2e/tour-plan.spec.ts:191:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Compare' }).first()
    - locator resolved to <button disabled type="button" _ngcontent-ng-c3058790300="">Split compare</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - navigation "Theme mode" [ref=e4]:
    - button "System" [ref=e5] [cursor=pointer]: System
    - button "Light" [ref=e7] [cursor=pointer]: Light
    - button "Dark" [pressed] [ref=e9] [cursor=pointer]: Dark
  - button "Open saved trips" [active] [ref=e11] [cursor=pointer]:
    - generic [ref=e13]: "2"
    - text: Saved
  - dialog "Saved trips" [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - paragraph [ref=e18]: Saved trips
        - heading "Your trip cards" [level=2] [ref=e19]
        - text: 2 saved in this browser
      - button "Close saved trips" [ref=e20] [cursor=pointer]: ×
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]: Compare trips
        - strong [ref=e24]: 0/2 selected
      - button "Split compare" [disabled] [ref=e25]
    - generic [ref=e26]:
      - article [ref=e27]:
        - generic [ref=e28]:
          - text: 3 days
          - heading "San Francisco" [level=3] [ref=e29]
          - paragraph [ref=e30]: San Francisco slow travel with scenic routing
        - strong [ref=e31]: $1,150
        - generic [ref=e32]:
          - button "Open" [ref=e33] [cursor=pointer]
          - button "Compare" [ref=e34] [cursor=pointer]
          - button "Remove" [ref=e35] [cursor=pointer]
      - article [ref=e36]:
        - generic [ref=e37]:
          - text: 4 days
          - heading "San Cristobal de las Casas" [level=3] [ref=e38]
          - paragraph [ref=e39]: San Cristobal de las Casas slow travel with scenic routing
        - strong [ref=e40]: $1,150
        - generic [ref=e41]:
          - button "Open" [ref=e42] [cursor=pointer]
          - button "Compare" [ref=e43] [cursor=pointer]
          - button "Remove" [ref=e44] [cursor=pointer]
  - generic [ref=e46]:
    - generic [ref=e47]:
      - generic [ref=e50]:
        - paragraph [ref=e51]: Trip AI interaction
        - strong [ref=e52]: Tell the AI your travel mood. It will build the route, weather plan, hotels, and cost cards.
      - generic [ref=e53]: Ready
    - generic "AI travel planning conversation preview" [ref=e55]:
      - article [ref=e56]:
        - generic [ref=e57]: AI
        - paragraph [ref=e58]: I build routes, weather, hotels, maps, and budget cards from your travel vibe.
      - article [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]: You
          - button "Edit travel vibe" [ref=e62] [cursor=pointer]
        - paragraph [ref=e64]: peaceful nature, local food, scenic train rides, and light adventure
    - region "Trip plan controls" [ref=e65]:
      - generic "Quick AI prompt ideas" [ref=e66]:
        - button "Nature route" [ref=e67] [cursor=pointer]
        - button "Food + culture" [ref=e68] [cursor=pointer]
        - button "Premium slow" [ref=e69] [cursor=pointer]
      - generic [ref=e70]:
        - generic [ref=e71]: Travel vibe
        - textbox "Travel vibe" [ref=e72]:
          - /placeholder: Peaceful nature, local food, scenic train rides, light adventure...
          - text: peaceful nature, local food, scenic train rides, and light adventure
      - generic [ref=e74]:
        - generic [ref=e75]: From
        - generic [ref=e76]:
          - textbox "From Use my location" [ref=e77]:
            - /placeholder: Auto detect or type city
          - button "Use my location" [ref=e78] [cursor=pointer]
      - generic [ref=e81]:
        - generic [ref=e82]: To
        - textbox "To" [ref=e83]:
          - /placeholder: Type destination
          - text: Munnar, India
      - group [ref=e84]:
        - generic "More optional" [ref=e85] [cursor=pointer]
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
      - generic [ref=e86]:
        - generic [ref=e87]: Currency
        - combobox "Currency" [ref=e88]:
          - option "USD - US Dollar" [selected]
          - option "INR - Indian Rupee"
          - option "EUR - Euro"
          - option "GBP - British Pound"
          - option "AED - UAE Dirham"
          - option "SGD - Singapore Dollar"
          - option "JPY - Japanese Yen"
          - option "AUD - Australian Dollar"
          - option "CAD - Canadian Dollar"
      - generic [ref=e89]:
        - generic [ref=e90]: Days
        - spinbutton "Days" [ref=e91]: "3"
      - button "Generate trip plan" [disabled] [ref=e92] [cursor=pointer]
```

# Test source

```ts
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
  182 |   await expect(page.getByText('Transport expense')).toBeVisible();
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
> 203 |   await page.getByRole('button', { name: 'Compare' }).nth(0).click();
      |                                                              ^ Error: locator.click: Test timeout of 45000ms exceeded.
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