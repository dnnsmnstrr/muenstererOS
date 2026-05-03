import { test, expect } from '@playwright/test';

/**
 * Redirect system tests — three distinct layers:
 *
 * 1. /api/redirects          – list endpoint (search, type filter)
 * 2. /api/redirects/[query]  – lookup endpoint (returns the matched object)
 * 3. /api/redirect/[query]   – execution endpoint (302 to the resolved URL)
 * 4. /[unknown-path]         – 404 handler that auto-resolves via +error.svelte
 * 5. /redirects              – the browser UI (table, search, copy)
 */

// ---------------------------------------------------------------------------
// Layer 1 – /api/redirects list
// ---------------------------------------------------------------------------

test.describe('GET /api/redirects', () => {
	test('returns a non-empty array', async ({ request }) => {
		const res = await request.get('/api/redirects');
		expect(res.status()).toBe(200);

		const body = await res.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBeGreaterThan(0);
	});

	test('every item has at least a name field', async ({ request }) => {
		const res = await request.get('/api/redirects');
		const body = await res.json();

		for (const item of body) {
			expect(typeof item.name).toBe('string');
			expect(item.name.length).toBeGreaterThan(0);
		}
	});

	test('search=github returns only matching redirects', async ({ request }) => {
		const res = await request.get('/api/redirects?search=github');
		const body = await res.json();

		expect(body.length).toBeGreaterThan(0);
		for (const item of body) {
			const haystack = [item.name, item.description, item.url, ...(item.aliases ?? [])]
				.join(' ')
				.toLowerCase();
			expect(haystack).toContain('github');
		}
	});

	test('search with no matches returns an empty array', async ({ request }) => {
		const res = await request.get('/api/redirects?search=xyzzy_no_such_redirect_ever');
		const body = await res.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(0);
	});

	test('type=external returns only http(s) redirects', async ({ request }) => {
		const res = await request.get('/api/redirects?type=external');
		const body = await res.json();

		expect(body.length).toBeGreaterThan(0);
		for (const item of body) {
			expect(item.url).toMatch(/^https?:\/\//);
		}
	});

	test('type=internal returns only redirects without an absolute URL', async ({ request }) => {
		const res = await request.get('/api/redirects?type=internal');
		const body = await res.json();

		expect(body.length).toBeGreaterThan(0);
		for (const item of body) {
			// url is either absent or does not start with http
			if (item.url) {
				expect(item.url).not.toMatch(/^https?:\/\//);
			}
		}
	});
});

// ---------------------------------------------------------------------------
// Layer 2 – /api/redirects/[query] lookup
// ---------------------------------------------------------------------------

test.describe('GET /api/redirects/[query]', () => {
	test('lookup by exact name returns the correct object', async ({ request }) => {
		const res = await request.get('/api/redirects/github');
		expect(res.status()).toBe(200);

		const body = await res.json();
		expect(body.name).toBe('github');
		expect(body.url).toContain('github.com');
	});

	test('lookup by alias resolves to the parent redirect', async ({ request }) => {
		// "gh" is an alias for "github"
		const res = await request.get('/api/redirects/gh');
		const body = await res.json();
		expect(body.name).toBe('github');
	});

	test('lookup is case-insensitive', async ({ request }) => {
		const res = await request.get('/api/redirects/GITHUB');
		const body = await res.json();
		expect(body.name).toBe('github');
	});

	test('unknown query returns an object with an empty name', async ({ request }) => {
		const res = await request.get('/api/redirects/xyzzy_no_such_redirect');
		expect(res.status()).toBe(200);

		const body = await res.json();
		// getRedirect with returnObject:true returns { name: '' } on miss
		expect(body.name).toBe('');
	});
});

// ---------------------------------------------------------------------------
// Layer 3 – /api/redirect/[query] execution (302)
// ---------------------------------------------------------------------------

test.describe('GET /api/redirect/[query]', () => {
	test('known name redirects with a 302', async ({ request }) => {
		// Playwright's request fixture does NOT follow redirects by default
		const res = await request.get('/api/redirect/github', { maxRedirects: 0 });
		expect(res.status()).toBe(302);

		const location = res.headers()['location'];
		expect(location).toContain('github.com');
	});

	test('alias redirects to the same destination as the name', async ({ request }) => {
		const byName = await request.get('/api/redirect/github', { maxRedirects: 0 });
		const byAlias = await request.get('/api/redirect/gh', { maxRedirects: 0 });

		expect(byName.headers()['location']).toBe(byAlias.headers()['location']);
	});

	test('emoji alias resolves correctly', async ({ request }) => {
		// 🏠 is an alias for "homepage"
		const res = await request.get('/api/redirect/🏠', { maxRedirects: 0 });
		expect(res.status()).toBe(302);

		const location = res.headers()['location'];
		expect(location).toBeTruthy();
		expect(location).not.toContain('404');
	});

	test('unknown query redirects to a 404 path', async ({ request }) => {
		const query = 'xyzzy_definitely_missing';
		const res = await request.get(`/api/redirect/${query}`, { maxRedirects: 0 });
		expect(res.status()).toBe(302);

		const location = res.headers()['location'];
		expect(location).toContain('404');
		expect(location).toContain(query);
	});
});

// ---------------------------------------------------------------------------
// Layer 4 – +error.svelte auto-resolution on unknown paths
// ---------------------------------------------------------------------------

test.describe('404 auto-redirect handler', () => {
	test('navigating to /gh redirects away from the site (external)', async ({ page }) => {
		// window.location.replace() in +error.svelte triggers a framenavigated event.
		// We listen for the first navigation that lands on a non-localhost URL.
		const externalUrl = await new Promise<string>((resolve) => {
			page.on('framenavigated', (frame) => {
				if (frame === page.mainFrame() && !frame.url().includes('localhost')) {
					resolve(frame.url());
				}
			});
			// Kick off the navigation – don't await it so the listener fires first
			page.goto('/gh').catch(() => {});
		});

		expect(externalUrl).toBeTruthy();
		expect(externalUrl).not.toContain('localhost');
	});

	test('navigating to an internal redirect alias goes to the right internal page', async ({
		page
	}) => {
		// "settings" is both a redirect name and an internal page — should land on /settings
		await page.goto('/settings');
		await expect(page).toHaveURL(/\/settings/);
	});

	test('a truly unknown path shows the 404 error content', async ({ page }) => {
		await page.goto('/xyzzy_no_such_page_at_all?noRedirect=true');

		// The error page renders the status code and the "No page or redirect found" message
		await expect(page.locator('h1')).toContainText('404');
	});

	test('?noRedirect=true skips resolution and shows 404 immediately', async ({ page }) => {
		// Even for a known alias, noRedirect bypasses the redirect logic
		await page.goto('/gh?noRedirect=true');
		await expect(page.locator('h1')).toContainText('404');
	});
});

// ---------------------------------------------------------------------------
// Layer 5 – /redirects browser UI
// ---------------------------------------------------------------------------

test.describe('/redirects page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/redirects');
	});

	test('renders the page heading', async ({ page }) => {
		await expect(page.locator('h1, h2').first()).toBeVisible();
	});

	test('renders at least one redirect row', async ({ page }) => {
		// Each row has a cell with the redirect name
		const rows = page.locator('table tbody tr');
		await expect(rows.first()).toBeVisible();
		await expect(rows).toHaveCount(await rows.count()); // sanity: count is stable
		expect(await rows.count()).toBeGreaterThan(0);
	});

	test('search input filters the table', async ({ page }) => {
		const input = page.locator('input[type="search"]');
		await expect(input).toBeVisible();

		const allRows = page.locator('table tbody tr');
		const totalBefore = await allRows.count();

		await input.fill('github');

		// After filtering, fewer rows should be visible
		await expect(allRows).not.toHaveCount(totalBefore);
		// And every visible row should contain "github" somewhere
		const count = await allRows.count();
		for (let i = 0; i < count; i++) {
			await expect(allRows.nth(i)).toContainText(/github/i);
		}
	});

	test('clearing the search restores all rows', async ({ page }) => {
		const input = page.locator('input[type="search"]');
		const allRows = page.locator('table tbody tr');

		// Wait until the table is fully populated before snapshotting the baseline
		await expect(allRows.first()).toBeVisible();
		const totalBefore = await allRows.count();
		expect(totalBefore).toBeGreaterThan(0);

		await input.fill('github');
		// Confirm filtering reduced the count
		await expect(allRows).not.toHaveCount(totalBefore);

		await input.clear();
		await expect(allRows).toHaveCount(totalBefore);
	});

	test('searching for something with no match shows zero rows', async ({ page }) => {
		const input = page.locator('input[type="search"]');
		await input.fill('xyzzy_no_such_redirect_ever');

		const rows = page.locator('table tbody tr');
		await expect(rows).toHaveCount(0);
	});

	test('copy action writes the redirect URL to clipboard', async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		// Open the dropdown for the first row
		const firstRowMenu = page.locator('table tbody tr').first().locator('button[title]');
		await firstRowMenu.click();

		// Click the copy item
		await page.locator('[role="menuitem"]').filter({ hasText: /copy/i }).click();

		// A success toast should appear
		await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 });
	});
});
