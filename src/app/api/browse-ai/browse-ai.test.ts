/**
 * Tests for the Browse AI Page Controller.
 *
 * These tests verify that the /api/browse-ai route produces the correct
 * BrowseAIDelta for a wide range of user inputs. They are integration tests
 * that call the route handler directly (not the live OpenAI API), using a
 * mocked fetch so they run offline and fast.
 *
 * Run with:
 *   npx jest src/app/api/browse-ai/browse-ai.test.ts
 *
 * To test against the real OpenAI API (slower, costs tokens), set:
 *   USE_REAL_OPENAI=true npx jest src/app/api/browse-ai/browse-ai.test.ts
 */

import { POST } from './route';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  message: string,
  context: Partial<BrowseContext> = {},
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
) {
  const fullContext: BrowseContext = {
    city: 'Folsom',
    state: 'CA',
    beds: null,
    baths: null,
    priceMin: null,
    priceMax: null,
    propertyType: null,
    activeSubCategories: [],
    resultCount: 24,
    topProperties: [
      { address: '123 Oak St, Folsom, CA 95630', price: 650000, beds: 3, baths: 2 },
      { address: '456 Maple Ave, Folsom, CA 95630', price: 720000, beds: 4, baths: 3 },
      { address: '789 Pine Rd, Folsom, CA 95630', price: 490000, beds: 2, baths: 1 },
    ],
    ...context,
  };
  const body = JSON.stringify({ message, context: fullContext, history });
  return new NextRequest('http://localhost/api/browse-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

interface BrowseContext {
  city: string | null;
  state: string | null;
  beds: number | null;
  baths: number | null;
  priceMin: number | null;
  priceMax: number | null;
  propertyType: string | null;
  activeSubCategories: string[];
  mapOverlay?: string;
  currentView?: string;
  isCompareMode?: boolean;
  resultCount: number;
  topProperties: Array<{ address: string; price: number; beds: number; baths: number }>;
}

interface BrowseAIDelta {
  city: string | null;
  state: string | null;
  beds: number | null;
  baths: number | null;
  priceMin: number | null;
  priceMax: number | null;
  propertyType: string | null;
  subcategories_add: string[];
  subcategories_remove: string[];
  clear_filters: boolean;
  map_overlay: string | null;
  view_mode: string | null;
  compare_mode: boolean | null;
  clear_draw: boolean;
  reply: string;
}

async function callRoute(req: NextRequest): Promise<BrowseAIDelta> {
  const res = await POST(req);
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock setup (skipped when USE_REAL_OPENAI=true)
// ---------------------------------------------------------------------------

const USE_REAL_OPENAI = process.env.USE_REAL_OPENAI === 'true';

function mockOpenAI(responseContent: object) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(responseContent) } }],
    }),
  } as any);
}

beforeEach(() => {
  if (!USE_REAL_OPENAI) {
    process.env.OPENAI_API_KEY = 'test-key';
  }
});

afterEach(() => {
  if (!USE_REAL_OPENAI) {
    jest.restoreAllMocks();
  }
});

// ---------------------------------------------------------------------------
// Suite 1 — Filter mutations
// ---------------------------------------------------------------------------

describe('Filter mutations', () => {
  test('sets beds filter', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing 3+ bedroom homes.' });
    const delta = await callRoute(makeRequest('show me 3 bedroom homes'));
    expect(delta.beds).toBe(3);
    expect(delta.city).toBeNull();
    expect(delta.baths).toBeNull();
    expect(delta.priceMin).toBeNull();
    expect(delta.priceMax).toBeNull();
  });

  test('sets baths filter', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: 2, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing homes with 2+ baths.' });
    const delta = await callRoute(makeRequest('I want at least 2 bathrooms'));
    expect(delta.baths).toBe(2);
    expect(delta.beds).toBeNull();
  });

  test('sets price max', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: 800000, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Filtering to homes under $800k.' });
    const delta = await callRoute(makeRequest('under 800k'));
    expect(delta.priceMax).toBe(800000);
    expect(delta.priceMin).toBeNull();
  });

  test('sets price range', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: 500000, priceMax: 900000, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing homes between $500k and $900k.' });
    const delta = await callRoute(makeRequest('between 500k and 900k'));
    expect(delta.priceMin).toBe(500000);
    expect(delta.priceMax).toBe(900000);
  });

  test('clears beds filter with 0', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 0, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Removed the bedroom filter.' });
    const delta = await callRoute(makeRequest('remove bedroom filter', { beds: 3 }));
    expect(delta.beds).toBe(0);
  });

  test('sets residential property type', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: 'RESIDENTIAL', subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing residential homes only.' });
    const delta = await callRoute(makeRequest('show me houses only'));
    expect(delta.propertyType).toBe('RESIDENTIAL');
  });

  test('sets income/multi-family property type', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: 'RESIDENTIAL_INCOME', subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing income/multi-family properties.' });
    const delta = await callRoute(makeRequest('show me multi-family or income properties'));
    expect(delta.propertyType).toBe('RESIDENTIAL_INCOME');
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Location changes
// ---------------------------------------------------------------------------

describe('Location changes', () => {
  test('changes city and state', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Searching in Austin, TX.' });
    const delta = await callRoute(makeRequest('show me homes in Austin TX'));
    expect(delta.city).toBe('Austin');
    expect(delta.state).toBe('TX');
    expect(delta.beds).toBeNull();
    expect(delta.priceMax).toBeNull();
  });

  test('does not change city for filter-only query', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 4, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing 4+ bedroom homes.' });
    const delta = await callRoute(makeRequest('4 bedrooms'));
    expect(delta.city).toBeNull();
    expect(delta.state).toBeNull();
  });

  test('changes city without mentioning state', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Denver', state: 'CO', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Searching in Denver, CO.' });
    const delta = await callRoute(makeRequest('look in Denver Colorado'));
    expect(delta.city).toBe('Denver');
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Compound queries
// ---------------------------------------------------------------------------

describe('Compound queries (multiple intent in one message)', () => {
  test('city + beds + price max', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: 3, baths: null, priceMin: null, priceMax: 600000, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Searching 3-bed homes in Austin, TX under $600k.' });
    const delta = await callRoute(makeRequest('3 bed homes in Austin TX under 600k'));
    expect(delta.city).toBe('Austin');
    expect(delta.state).toBe('TX');
    expect(delta.beds).toBe(3);
    expect(delta.priceMax).toBe(600000);
  });

  test('beds + baths + subcategory', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: 2, priceMin: null, priceMax: null, propertyType: null, subcategories_add: ['has_pool'], subcategories_remove: [], clear_filters: false, reply: 'Showing 3-bed 2-bath homes with a pool.' });
    const delta = await callRoute(makeRequest('3 beds 2 baths with a pool'));
    expect(delta.beds).toBe(3);
    expect(delta.baths).toBe(2);
    expect(delta.subcategories_add).toContain('has_pool');
    expect(delta.city).toBeNull();
  });

  test('city + price range + pool', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'San Diego', state: 'CA', beds: null, baths: null, priceMin: 700000, priceMax: 1200000, propertyType: null, subcategories_add: ['has_pool'], subcategories_remove: [], clear_filters: false, reply: 'Searching pool homes in San Diego, CA between $700k–$1.2M.' });
    const delta = await callRoute(makeRequest('homes with pool in San Diego CA between 700k and 1.2M'));
    expect(delta.city).toBe('San Diego');
    expect(delta.priceMin).toBe(700000);
    expect(delta.priceMax).toBe(1200000);
    expect(delta.subcategories_add).toContain('has_pool');
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Clear filters
// ---------------------------------------------------------------------------

describe('Clear / reset filters', () => {
  test('clear_filters true on explicit reset', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: true, reply: 'All filters cleared.' });
    const delta = await callRoute(makeRequest('clear all filters', { beds: 3, priceMax: 800000 }));
    expect(delta.clear_filters).toBe(true);
    expect(delta.city).toBeNull();
  });

  test('clear_filters true on reset', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: true, reply: 'All filters reset.' });
    const delta = await callRoute(makeRequest('reset everything'));
    expect(delta.clear_filters).toBe(true);
  });

  test('clear_filters false on unrelated query', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Showing 3+ bedroom homes.' });
    const delta = await callRoute(makeRequest('3 bedrooms'));
    expect(delta.clear_filters).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Subcategory filters
// ---------------------------------------------------------------------------

describe('Subcategory filters', () => {
  test('adds has_pool', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: ['has_pool'], subcategories_remove: [], clear_filters: false, reply: 'Filtering to homes with a pool.' });
    const delta = await callRoute(makeRequest('only homes with a pool'));
    expect(delta.subcategories_add).toContain('has_pool');
    expect(delta.subcategories_remove).toHaveLength(0);
  });

  test('adds is_water_front', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: ['is_water_front'], subcategories_remove: [], clear_filters: false, reply: 'Showing waterfront properties.' });
    const delta = await callRoute(makeRequest('show me waterfront properties'));
    expect(delta.subcategories_add).toContain('is_water_front');
  });

  test('removes has_pool when already active', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: ['has_pool'], clear_filters: false, reply: 'Removed pool filter.' });
    const delta = await callRoute(makeRequest('remove the pool filter', { activeSubCategories: ['has_pool'] }));
    expect(delta.subcategories_remove).toContain('has_pool');
    expect(delta.subcategories_add).toHaveLength(0);
  });

  test('adds mountain view', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: ['is_mountain_view'], subcategories_remove: [], clear_filters: false, reply: 'Filtering for mountain view homes.' });
    const delta = await callRoute(makeRequest('homes with mountain views'));
    expect(delta.subcategories_add).toContain('is_mountain_view');
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Q&A (no filter changes, just reply)
// ---------------------------------------------------------------------------

describe('Q&A about visible listings', () => {
  test('cheapest listing question — no filter changes', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'The cheapest listing is 789 Pine Rd at $490,000 with 2 beds and 1 bath.' });
    const delta = await callRoute(makeRequest("what's the cheapest listing?"));
    expect(delta.city).toBeNull();
    expect(delta.beds).toBeNull();
    expect(delta.priceMax).toBeNull();
    expect(delta.clear_filters).toBe(false);
    expect(delta.reply.length).toBeGreaterThan(5);
  });

  test('result count question — no filter changes', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'There are 24 listings currently visible.' });
    const delta = await callRoute(makeRequest('how many results are there?'));
    expect(delta.city).toBeNull();
    expect(delta.clear_filters).toBe(false);
    expect(delta.reply).toMatch(/24/);
  });

  test('price range question — no filter changes', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Visible homes range from $490,000 to $720,000.' });
    const delta = await callRoute(makeRequest('what price range are these homes?'));
    expect(delta.beds).toBeNull();
    expect(delta.priceMin).toBeNull();
    expect(delta.priceMax).toBeNull();
    expect(delta.reply.length).toBeGreaterThan(5);
  });
});

// ---------------------------------------------------------------------------
// Suite 7 — Conversational follow-ups
// ---------------------------------------------------------------------------

describe('Conversational follow-ups', () => {
  test('changes beds on follow-up ("make it 4 instead")', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 4, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Changed to 4+ bedrooms.' });
    const history = [
      { role: 'user' as const, content: 'show me 3 bedroom homes' },
      { role: 'assistant' as const, content: 'Showing 3+ bedroom homes.' },
    ];
    const delta = await callRoute(makeRequest('make it 4 instead', { beds: 3 }, history));
    expect(delta.beds).toBe(4);
    expect(delta.city).toBeNull();
  });

  test('adds constraint without resetting existing ones', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: 600000, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Added a $600k price cap.' });
    const history = [
      { role: 'user' as const, content: '3 bedroom homes' },
      { role: 'assistant' as const, content: 'Showing 3+ bedroom homes.' },
    ];
    // User already has beds=3 set, now only asks for price max
    const delta = await callRoute(makeRequest('also under 600k', { beds: 3 }, history));
    // Should set priceMax but NOT touch beds
    expect(delta.priceMax).toBe(600000);
    expect(delta.beds).toBeNull(); // null = don't change existing beds=3
  });
});

// ---------------------------------------------------------------------------
// Suite 8 — Response shape validation
// ---------------------------------------------------------------------------

describe('Response shape', () => {
  test('all required fields present including new map/view fields', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('3 beds'));
    expect(delta).toHaveProperty('city');
    expect(delta).toHaveProperty('state');
    expect(delta).toHaveProperty('beds');
    expect(delta).toHaveProperty('baths');
    expect(delta).toHaveProperty('priceMin');
    expect(delta).toHaveProperty('priceMax');
    expect(delta).toHaveProperty('propertyType');
    expect(delta).toHaveProperty('subcategories_add');
    expect(delta).toHaveProperty('subcategories_remove');
    expect(delta).toHaveProperty('clear_filters');
    expect(delta).toHaveProperty('map_overlay');
    expect(delta).toHaveProperty('view_mode');
    expect(delta).toHaveProperty('compare_mode');
    expect(delta).toHaveProperty('clear_draw');
    expect(delta).toHaveProperty('reply');
  });

  test('subcategories_add and subcategories_remove are always arrays', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('Austin TX'));
    expect(Array.isArray(delta.subcategories_add)).toBe(true);
    expect(Array.isArray(delta.subcategories_remove)).toBe(true);
  });

  test('clear_filters is always boolean', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('3 beds'));
    expect(typeof delta.clear_filters).toBe('boolean');
  });

  test('reply is always a non-empty string', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, reply: 'Searching in Austin, TX.' });
    const delta = await callRoute(makeRequest('Austin TX'));
    expect(typeof delta.reply).toBe('string');
    expect(delta.reply.trim().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Suite 9 — Error handling
// ---------------------------------------------------------------------------

describe('Error handling', () => {
  test('empty message returns 400', async () => {
    const req = new NextRequest('http://localhost/api/browse-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '  ', context: {}, history: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('malformed LLM response returns safe fallback delta', async () => {
    if (USE_REAL_OPENAI) return;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'this is not json at all' } }],
      }),
    } as any);
    const delta = await callRoute(makeRequest('something'));
    // Should return safe defaults, not throw
    expect(delta.clear_filters).toBe(false);
    expect(Array.isArray(delta.subcategories_add)).toBe(true);
    expect(typeof delta.reply).toBe('string');
  });

  test('OpenAI error returns 502', async () => {
    if (USE_REAL_OPENAI) return;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    } as any);
    const req = makeRequest('show me homes');
    const res = await POST(req);
    expect(res.status).toBe(502);
  });
});

// ---------------------------------------------------------------------------
// Suite 10 — Map overlay (schools)
// ---------------------------------------------------------------------------

describe('Map overlay — schools', () => {
  test('enables schools overlay', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: 'schools', view_mode: null, compare_mode: null, clear_draw: false, reply: 'School districts are now visible on the map.' });
    const delta = await callRoute(makeRequest('show me school districts'));
    expect(delta.map_overlay).toBe('schools');
    expect(delta.beds).toBeNull();
    expect(delta.city).toBeNull();
  });

  test('disables schools overlay', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: 'none', view_mode: null, compare_mode: null, clear_draw: false, reply: 'School districts hidden.' });
    const delta = await callRoute(makeRequest('hide school districts', { mapOverlay: 'schools' }));
    expect(delta.map_overlay).toBe('none');
  });

  test('schools overlay does not change when user asks for filters', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: false, reply: 'Showing 3+ bedroom homes.' });
    const delta = await callRoute(makeRequest('3 bedrooms', { mapOverlay: 'schools' }));
    expect(delta.map_overlay).toBeNull(); // null = don't change the overlay
    expect(delta.beds).toBe(3);
  });

  test('compound: schools + location change', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: 'schools', view_mode: null, compare_mode: null, clear_draw: false, reply: 'Searching Austin, TX with school districts visible.' });
    const delta = await callRoute(makeRequest('show schools in Austin TX'));
    expect(delta.city).toBe('Austin');
    expect(delta.map_overlay).toBe('schools');
  });
});

// ---------------------------------------------------------------------------
// Suite 11 — View mode
// ---------------------------------------------------------------------------

describe('View mode', () => {
  test('switches to map view', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: 'map', compare_mode: null, clear_draw: false, reply: 'Switched to map view.' });
    const delta = await callRoute(makeRequest('show me the map view', { currentView: 'grid' }));
    expect(delta.view_mode).toBe('map');
    expect(delta.beds).toBeNull();
  });

  test('switches to grid view', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: 'grid', compare_mode: null, clear_draw: false, reply: 'Switched to grid view.' });
    const delta = await callRoute(makeRequest('switch to grid', { currentView: 'map' }));
    expect(delta.view_mode).toBe('grid');
  });

  test('view_mode is null for non-view queries', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('3 bedrooms'));
    expect(delta.view_mode).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 12 — Compare mode
// ---------------------------------------------------------------------------

describe('Compare mode', () => {
  test('enables compare mode', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: true, clear_draw: false, reply: 'Compare mode enabled — select up to 4 listings.' });
    const delta = await callRoute(makeRequest('compare these homes'));
    expect(delta.compare_mode).toBe(true);
  });

  test('disables compare mode', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: false, clear_draw: false, reply: 'Compare mode off.' });
    const delta = await callRoute(makeRequest('exit compare mode', { isCompareMode: true }));
    expect(delta.compare_mode).toBe(false);
  });

  test('compare_mode null for unrelated queries', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('show me 3 beds'));
    expect(delta.compare_mode).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 13 — Clear draw
// ---------------------------------------------------------------------------

describe('Clear draw', () => {
  test('clear_draw true when user asks to remove drawn area', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: true, reply: 'Drawn area cleared.' });
    const delta = await callRoute(makeRequest('clear the drawn area'));
    expect(delta.clear_draw).toBe(true);
  });

  test('clear_draw false for unrelated queries', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: null, clear_draw: false, reply: 'Done.' });
    const delta = await callRoute(makeRequest('3 bedrooms'));
    expect(delta.clear_draw).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suite 14 — Compound: map controls + filters together
// ---------------------------------------------------------------------------

describe('Compound: map controls + filters', () => {
  test('schools + 3 beds in one query', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: 3, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: 'schools', view_mode: null, compare_mode: null, clear_draw: false, reply: 'Showing 3-bed homes with school districts.' });
    const delta = await callRoute(makeRequest('show school zones and 3 bedroom homes'));
    expect(delta.map_overlay).toBe('schools');
    expect(delta.beds).toBe(3);
  });

  test('grid view + price max together', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: null, state: null, beds: null, baths: null, priceMin: null, priceMax: 700000, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: 'grid', compare_mode: null, clear_draw: false, reply: 'Switched to grid view, showing homes under $700k.' });
    const delta = await callRoute(makeRequest('show grid view of homes under 700k'));
    expect(delta.view_mode).toBe('grid');
    expect(delta.priceMax).toBe(700000);
  });

  test('compare mode + location', async () => {
    if (!USE_REAL_OPENAI) mockOpenAI({ city: 'Austin', state: 'TX', beds: null, baths: null, priceMin: null, priceMax: null, propertyType: null, subcategories_add: [], subcategories_remove: [], clear_filters: false, map_overlay: null, view_mode: null, compare_mode: true, clear_draw: false, reply: 'Searching Austin, TX in compare mode.' });
    const delta = await callRoute(makeRequest('compare homes in Austin TX'));
    expect(delta.city).toBe('Austin');
    expect(delta.compare_mode).toBe(true);
  });
});
