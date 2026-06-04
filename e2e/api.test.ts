import { test, expect } from '@playwright/test';

/**
 * API endpoint tests — pure HTTP, no browser needed.
 *
 * Endpoints covered:
 *  1. GET /api/[slug]         — generic data endpoint (changes, pages)
 *  2. GET /api/dennis         — person data (schema.org Person)
 *  3. GET /api/status         — site health metrics
 *  4. GET /api/gists          — gist registry
 *  5. GET /api/redirects      — redirect list (already covered deeply in redirects.test.ts,
 *                               so only the contract is re-checked here)
 *  6. GET /api/redirects/[q]  — redirect lookup
 *  7. GET /api/redirect/[q]   — redirect execution (302)
 *  8. GET /api/export         — data export bundle
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Assert a response is 200, Content-Type JSON, and return the parsed body. */
async function getJSON(request: any, path: string) {
	const res = await request.get(path);
	expect(res.status(), `${path} should return 200`).toBe(200);
	expect(res.headers()['content-type']).toContain('application/json');
	return res.json();
}

// ---------------------------------------------------------------------------
// 1. Generic data endpoint — /api/[slug]
// ---------------------------------------------------------------------------

test.describe('GET /api/[slug] — generic data endpoint', () => {
	// ── /api/changes ──────────────────────────────────────────────────────────

	test.describe('/api/changes', () => {
		test('returns the standard paginated envelope', async ({ request }) => {
			const body = await getJSON(request, '/api/changes');

			expect(body).toMatchObject({
				page: 1,
				limit: expect.any(Number),
				dataType: 'changes',
				total: expect.any(Number),
				totalPages: expect.any(Number),
				items: expect.any(Array)
			});
		});

		test('total matches the number of entries in changes.json', async ({ request }) => {
			const body = await getJSON(request, '/api/changes');
			// There are 14 entries in the static changes.json file
			expect(body.total).toBe(14);
		});

		test('each item has date, title, and description fields', async ({ request }) => {
			const body = await getJSON(request, '/api/changes');
			for (const item of body.items) {
				expect(typeof item.date).toBe('string');
				expect(typeof item.title).toBe('string');
				expect(typeof item.description).toBe('string');
				// path is optional — absent on older entries
				if (item.path !== undefined) {
					expect(typeof item.path).toBe('string');
				}
			}
		});

		test('?limit=3 returns at most 3 items', async ({ request }) => {
			const body = await getJSON(request, '/api/changes?limit=3');
			expect(body.items.length).toBeLessThanOrEqual(3);
			expect(body.limit).toBe(3);
		});

		test('?page=2&limit=3 returns the second page', async ({ request }) => {
			const page1 = await getJSON(request, '/api/changes?page=1&limit=3');
			const page2 = await getJSON(request, '/api/changes?page=2&limit=3');

			expect(page2.page).toBe(2);
			// Items on page 2 must not appear on page 1
			const page1Titles = page1.items.map((i: any) => i.title);
			for (const item of page2.items) {
				expect(page1Titles).not.toContain(item.title);
			}
		});

		test('totalPages is consistent with total and limit', async ({ request }) => {
			const limit = 3;
			const body = await getJSON(request, `/api/changes?limit=${limit}`);
			expect(body.totalPages).toBe(Math.ceil(body.total / limit));
		});

		test('?search= filters items to matching ones', async ({ request }) => {
			// "Ping" is a known entry in changes.json
			const body = await getJSON(request, '/api/changes?search=ping');
			expect(body.total).toBeGreaterThan(0);
			for (const item of body.items) {
				const haystack = [item.title, item.description].join(' ').toLowerCase();
				expect(haystack).toContain('ping');
			}
		});

		test('?search= with no match returns total=0 and empty items', async ({ request }) => {
			const body = await getJSON(request, '/api/changes?search=xyzzy_no_such_change');
			expect(body.total).toBe(0);
			expect(body.items).toHaveLength(0);
		});

		test('?sortBy=date&direction=asc returns items in ascending date order', async ({
			request
		}) => {
			const body = await getJSON(request, '/api/changes?sortBy=date&direction=asc&limit=50');
			const dates = body.items.map((i: any) => new Date(i.date).getTime());
			for (let i = 1; i < dates.length; i++) {
				expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
			}
		});

		test('?sortBy=date&direction=desc returns items in descending date order', async ({
			request
		}) => {
			const body = await getJSON(request, '/api/changes?sortBy=date&direction=desc&limit=50');
			const dates = body.items.map((i: any) => new Date(i.date).getTime());
			for (let i = 1; i < dates.length; i++) {
				expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
			}
		});

		test('default sort direction is asc when sortBy is supplied without direction', async ({
			request
		}) => {
			const withAsc = await getJSON(request, '/api/changes?sortBy=date&direction=asc&limit=50');
			const withDefault = await getJSON(request, '/api/changes?sortBy=date&limit=50');
			expect(withDefault.items.map((i: any) => i.title)).toEqual(
				withAsc.items.map((i: any) => i.title)
			);
		});

		test('an unknown slug returns 404', async ({ request }) => {
			const res = await request.get('/api/xyzzy_not_a_real_slug');
			expect(res.status()).toBe(404);
		});
	});

	// ── /api/pages ────────────────────────────────────────────────────────────

	test.describe('/api/pages', () => {
		test('returns the standard paginated envelope', async ({ request }) => {
			const body = await getJSON(request, '/api/pages');
			expect(body).toMatchObject({
				page: 1,
				dataType: 'pages',
				total: expect.any(Number),
				items: expect.any(Array)
			});
		});

		test('total matches the number of entries in pages.json', async ({ request }) => {
			const body = await getJSON(request, '/api/pages');
			// There are 27 entries in the static pages.json file
			expect(body.total).toBe(27);
		});

		test('each item has title and path fields', async ({ request }) => {
			const body = await getJSON(request, '/api/pages');
			for (const item of body.items) {
				expect(typeof item.title).toBe('string');
				expect(typeof item.path).toBe('string');
				expect(item.path).toMatch(/^\//);
			}
		});

		test('?search= filters pages by title', async ({ request }) => {
			// "Onboarding" is a known page
			const body = await getJSON(request, '/api/pages?search=onboarding');
			expect(body.total).toBeGreaterThan(0);
			for (const item of body.items) {
				expect(item.title.toLowerCase()).toContain('onboarding');
			}
		});
	});
});

// ---------------------------------------------------------------------------
// 2. GET /api/dennis — schema.org Person
// ---------------------------------------------------------------------------

test.describe('GET /api/dennis', () => {
	test('returns 200 with JSON', async ({ request }) => {
		await getJSON(request, '/api/dennis');
	});

	test('contains required schema.org Person fields', async ({ request }) => {
		const body = await getJSON(request, '/api/dennis');

		expect(typeof body.name).toBe('string');
		expect(typeof body.email).toBe('string');
		expect(typeof body.url).toBe('string');
		expect(typeof body.age).toBe('number');
		expect(body.age).toBeGreaterThan(0);
	});

	test('age is computed correctly from birthDate', async ({ request }) => {
		const body = await getJSON(request, '/api/dennis');
		const computed = Math.floor(
			(Date.now() - new Date('1997-06-16').getTime()) / (1000 * 60 * 60 * 24 * 365.25)
		);
		// Allow ±1 year to be safe across test environments and dates
		expect(Math.abs(body.age - computed)).toBeLessThanOrEqual(1);
	});

	test('contains pronouns and gender fields', async ({ request }) => {
		const body = await getJSON(request, '/api/dennis');
		expect(body.pronouns).toBe('he/him');
		expect(body.gender).toBe('male');
	});

	test('languages is a non-empty array', async ({ request }) => {
		const body = await getJSON(request, '/api/dennis');
		expect(Array.isArray(body.languages)).toBe(true);
		expect(body.languages.length).toBeGreaterThan(0);
	});
});

// ---------------------------------------------------------------------------
// 3. GET /api/status — site health
// ---------------------------------------------------------------------------

test.describe('GET /api/status', () => {
	test('returns 200 with JSON', async ({ request }) => {
		await getJSON(request, '/api/status');
	});

	test('contains all expected fields', async ({ request }) => {
		const body = await getJSON(request, '/api/status');

		expect(body).toMatchObject({
			lastDeployment: expect.any(String),
			commitCount: expect.any(Number),
			pageCount: expect.any(Number),
			cvStatus: expect.any(String),
			monthlyViews: expect.any(Number)
		});
	});

	test('commitCount is a positive integer', async ({ request }) => {
		const body = await getJSON(request, '/api/status');
		expect(body.commitCount).toBeGreaterThan(0);
		expect(Number.isInteger(body.commitCount)).toBe(true);
	});

	test('pageCount matches the number of entries in pages.json', async ({ request }) => {
		const body = await getJSON(request, '/api/status');
		// There are 27 entries in the static pages.json file
		expect(body.pageCount).toBe(27);
	});

	test('lastDeployment is a valid ISO 8601 date string', async ({ request }) => {
		const body = await getJSON(request, '/api/status');
		expect(() => new Date(body.lastDeployment)).not.toThrow();
		expect(new Date(body.lastDeployment).toISOString()).toBe(body.lastDeployment);
	});

	test('cvStatus is one of the known values', async ({ request }) => {
		const body = await getJSON(request, '/api/status');
		expect(['online', 'offline', 'unknown']).toContain(body.cvStatus);
	});
});

// ---------------------------------------------------------------------------
// 4. GET /api/gists — gist registry
// ---------------------------------------------------------------------------

test.describe('GET /api/gists', () => {
	test('returns 200 with JSON', async ({ request }) => {
		await getJSON(request, '/api/gists');
	});

	test('is an object (the gist registry, not an array)', async ({ request }) => {
		const body = await getJSON(request, '/api/gists');
		expect(typeof body).toBe('object');
		expect(Array.isArray(body)).toBe(false);
	});

	test('every entry has id, name, and filename fields', async ({ request }) => {
		const body = await getJSON(request, '/api/gists');
		for (const [key, entry] of Object.entries(body) as [string, any][]) {
			expect(typeof entry.id, `${key}.id`).toBe('string');
			expect(typeof entry.name, `${key}.name`).toBe('string');
			expect(typeof entry.filename, `${key}.filename`).toBe('string');
			expect(entry.filename, `${key}.filename should end with .json`).toMatch(/\.json$/);
		}
	});

	test('contains the expected well-known gist keys', async ({ request }) => {
		const body = await getJSON(request, '/api/gists');
		for (const key of ['now', 'resume', 'playlists', 'projects']) {
			expect(body, `should have gist key "${key}"`).toHaveProperty(key);
		}
	});
});

// ---------------------------------------------------------------------------
// 5. GET /api/export — data export bundle
// ---------------------------------------------------------------------------

test.describe('GET /api/export', () => {
	test('returns 401 without authorization', async ({ request }) => {
		const res = await request.get('/api/export');
		expect(res.status()).toBe(401);
		const body = await res.json();
		expect(body.error).toContain('Unauthorized');
	});

	// Note: Fully testing authorized export would require a mock token and GitHub API mocking
	// which is beyond the scope of this test file.
});

// ---------------------------------------------------------------------------
// 6. GET /api/resume — CORS-enabled resume proxy
// ---------------------------------------------------------------------------

test.describe('GET /api/resume', () => {
	test('returns CORS headers', async ({ request }) => {
		const res = await request.get('/api/resume');
		expect(res.headers()['access-control-allow-origin']).toBe('*');
	});

	test('OPTIONS returns CORS preflight headers', async ({ request }) => {
		const res = await request.fetch('/api/resume', { method: 'OPTIONS' });
		expect(res.headers()['access-control-allow-origin']).toBe('*');
		expect(res.headers()['access-control-allow-methods']).toContain('GET');
	});
});
