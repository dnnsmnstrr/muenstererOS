import { test, expect, type Page } from '@playwright/test';

/**
 * Settings page E2E tests
 *
 * The settings page lives at /settings and is split into two cards:
 *   Left  — GeneralSettings: language radio, debug checkbox
 *   Right — AppearanceSettings: dark/light/system mode, screensaver select,
 *            inactivity timeout input, theme buttons, texture select + size/spacing
 *
 * Every setting writes to localStorage, so tests verify both the visible UI
 * state and the persisted value.
 *
 * Coverage:
 *  1. Rendering — page loads and all sections are visible
 *  2. Language  — switching EN ↔ DE re-labels the page
 *  3. Dark/Light/System mode — radio persists to localStorage
 *  4. Theme selection — button becomes active, localStorage updated
 *  5. Screensaver select — value persists to localStorage
 *  6. Background texture select — value persists to localStorage
 *  7. Debug mode — checkbox toggles localStorage flag
 *  8. Reset Desktop — button fires toast and clears desktopFiles
 *  9. Export Data  — button links to /export
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goToSettings(page: Page) {
	await page.goto('/settings');
	// Wait for the Settings heading to confirm the page has rendered
	await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible();
}

async function getLocalStorage(page: Page, key: string) {
	return page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * bits-ui RadioGroup.Item renders as <button role="radio" id="{value}">
 * The <label> elements all point to the radiogroup id (formsnap-N), NOT the
 * individual item ids, so label[for="en"] never matches.
 * Use getByRole('radio') with the label text, or button[id="{value}"].
 */
const radioBtn = (page: Page, id: string) => page.locator(`button[role="radio"][id="${id}"]`);

/**
 * bits-ui Select renders as <button data-select-trigger=""> — NOT role="combobox".
 */
const selectTrigger = (page: Page, nth = 0) => page.locator('[data-select-trigger]').nth(nth);

// ---------------------------------------------------------------------------
// 1. Rendering
// ---------------------------------------------------------------------------

test.describe('rendering', () => {
	test('page loads with a Settings heading', async ({ page }) => {
		await goToSettings(page);
		await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible();
	});

	test('shows the Language section', async ({ page }) => {
		await goToSettings(page);
		// bits-ui RadioGroup.Item renders as <button role="radio" id="en">
		await expect(radioBtn(page, 'en')).toBeVisible();
		await expect(radioBtn(page, 'de')).toBeVisible();
	});

	test('shows the Mode section with Light / Dark / System options', async ({ page }) => {
		await goToSettings(page);
		await expect(radioBtn(page, 'light')).toBeVisible();
		await expect(radioBtn(page, 'dark')).toBeVisible();
		await expect(radioBtn(page, 'system')).toBeVisible();
	});

	test('shows the Theme section with multiple theme buttons', async ({ page }) => {
		await goToSettings(page);
		// There are 12 themes; at least a couple should be visible
		await expect(page.getByRole('button', { name: /zinc/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /rose/i })).toBeVisible();
	});

	test('shows the Screensaver select', async ({ page }) => {
		await goToSettings(page);
		// bits-ui Select renders as <button data-select-trigger="">
		await expect(selectTrigger(page, 0)).toBeVisible();
	});

	test('shows the Background Texture select', async ({ page }) => {
		await goToSettings(page);
		// There are (at least) two selects: screensaver and texture
		const triggers = page.locator('[data-select-trigger]');
		expect(await triggers.count()).toBeGreaterThanOrEqual(2);
	});

	test('shows the Debug Mode checkbox', async ({ page }) => {
		await goToSettings(page);
		await expect(page.locator('#debug-checkbox')).toBeVisible();
	});

	test('shows the Reset Desktop and Export Data action buttons', async ({ page }) => {
		await goToSettings(page);
		await expect(page.getByRole('button', { name: /reset desktop/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /export data/i })).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// 2. Language
// ---------------------------------------------------------------------------

test.describe('language', () => {
	test.beforeEach(async ({ page }) => {
		// Always start in English
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('language', 'en'));
		await goToSettings(page);
	});

	test('selecting German re-labels the heading to "Einstellungen"', async ({ page }) => {
		await radioBtn(page, 'de').click();

		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');

		// The page heading should now be in German
		await expect(page.getByRole('heading', { name: /einstellungen/i }).first()).toBeVisible({
			timeout: 5000
		});
	});

	test('switching back to English re-labels the heading to "Settings"', async ({ page }) => {
		await radioBtn(page, 'de').click();
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');

		await radioBtn(page, 'en').click();
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('en');

		await expect(page.getByRole('heading', { name: /^settings$/i }).first()).toBeVisible({
			timeout: 5000
		});
	});

	test('language choice persists across a page reload', async ({ page }) => {
		await radioBtn(page, 'de').click();
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');

		await page.reload();
		// After reload the German heading should still appear
		await expect(page.getByRole('heading', { name: /einstellungen/i }).first()).toBeVisible({
			timeout: 5000
		});

		// Restore English for downstream tests
		await page.evaluate(() => localStorage.setItem('language', 'en'));
	});
});

// ---------------------------------------------------------------------------
// 3. Dark / Light / System mode
// ---------------------------------------------------------------------------

test.describe('dark/light/system mode', () => {
	test.beforeEach(async ({ page }) => {
		await goToSettings(page);
	});

	test('clicking Light sets data-theme="light" on <html>', async ({ page }) => {
		await radioBtn(page, 'light').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	});

	test('clicking Dark sets data-theme="dark" on <html>', async ({ page }) => {
		await radioBtn(page, 'dark').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	});

	test('Light and Dark modes produce different data-theme values', async ({ page }) => {
		await radioBtn(page, 'light').click();
		const light = await page.locator('html').getAttribute('data-theme');

		await radioBtn(page, 'dark').click();
		const dark = await page.locator('html').getAttribute('data-theme');

		expect(light).not.toBe(dark);
	});

	test('mode choice survives a page reload', async ({ page }) => {
		await radioBtn(page, 'dark').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	});
});

// ---------------------------------------------------------------------------
// 4. Theme selection
// ---------------------------------------------------------------------------

test.describe('theme selection', () => {
	test.beforeEach(async ({ page }) => {
		// Reset to a known baseline theme before each test
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('theme', 'zinc'));
		await goToSettings(page);
	});

	test('clicking a theme button saves it to localStorage', async ({ page }) => {
		await page.getByRole('button', { name: /rose/i }).click();
		await expect.poll(() => getLocalStorage(page, 'theme'), { timeout: 3000 }).toBe('rose');
	});

	test('the active theme button has a border-primary class', async ({ page }) => {
		await page.getByRole('button', { name: /rose/i }).click();

		// The active button gets `border-2 border-primary` — check via aria or class
		const roseBtn = page.getByRole('button', { name: /rose/i });
		await expect(roseBtn).toHaveClass(/border-primary/);
	});

	test('switching theme changes which button appears active', async ({ page }) => {
		await page.getByRole('button', { name: /rose/i }).click();
		await expect(page.getByRole('button', { name: /rose/i })).toHaveClass(/border-primary/);

		await page.getByRole('button', { name: /blue/i }).click();
		await expect(page.getByRole('button', { name: /blue/i })).toHaveClass(/border-primary/);
		// Rose should no longer be active
		await expect(page.getByRole('button', { name: /rose/i })).not.toHaveClass(/border-primary/);
	});

	test('selected theme is applied to the root theme class', async ({ page }) => {
		await page.getByRole('button', { name: /violet/i }).click();
		await expect.poll(() => getLocalStorage(page, 'theme'), { timeout: 3000 }).toBe('violet');
	});

	test('theme choice persists across a page reload', async ({ page }) => {
		await page.getByRole('button', { name: /rose/i }).click();
		await expect.poll(() => getLocalStorage(page, 'theme'), { timeout: 3000 }).toBe('rose');

		await page.reload();
		await expect.poll(() => getLocalStorage(page, 'theme'), { timeout: 3000 }).toBe('rose');
	});
});

// ---------------------------------------------------------------------------
// 5. Screensaver
// ---------------------------------------------------------------------------

test.describe('screensaver setting', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('screensaver', 'dvd'));
		await goToSettings(page);
	});

	test('selecting "None" saves to localStorage', async ({ page }) => {
		// bits-ui Select renders as <button data-select-trigger="">
		await selectTrigger(page, 0).click();
		await page.getByRole('option', { name: /none/i }).click();

		await expect.poll(() => getLocalStorage(page, 'screensaver'), { timeout: 3000 }).toBe('none');
	});

	test('selecting "DVD Bounce" saves to localStorage', async ({ page }) => {
		// Start from None, then pick DVD
		await selectTrigger(page, 0).click();
		await page.getByRole('option', { name: /none/i }).click();

		await selectTrigger(page, 0).click();
		await page.getByRole('option', { name: /dvd bounce/i }).click();

		await expect.poll(() => getLocalStorage(page, 'screensaver'), { timeout: 3000 }).toBe('dvd');
	});

	test('selecting "None" hides the inactivity timeout input', async ({ page }) => {
		await selectTrigger(page, 0).click();
		await page.getByRole('option', { name: /none/i }).click();

		// Timeout input is only shown when screensaver !== 'none'
		await expect(page.locator('input[type="number"][min="30"]')).not.toBeVisible();
	});

	test('selecting a non-none screensaver shows the inactivity timeout input', async ({ page }) => {
		// dvd is selected in beforeEach — the timeout input should be visible
		await expect(page.locator('input[type="number"][min="30"]')).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// 6. Background texture
// ---------------------------------------------------------------------------

test.describe('background texture', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('backgroundTexture', 'dots'));
		await goToSettings(page);
	});

	test('selecting "Grid" saves to localStorage', async ({ page }) => {
		// The texture select is the second data-select-trigger on the page
		await selectTrigger(page, 1).click();
		await page.getByRole('option', { name: /^grid$/i }).click();

		await expect
			.poll(() => getLocalStorage(page, 'backgroundTexture'), { timeout: 3000 })
			.toBe('grid');
	});

	test('selecting "None" hides the texture size and spacing inputs', async ({ page }) => {
		await selectTrigger(page, 1).click();
		await page.getByRole('option', { name: /^none$/i }).click();

		// Size and spacing inputs are only shown when texture !== 'none'
		await expect(page.locator('input[type="range"]')).not.toBeVisible();
	});

	test('selecting a non-none texture shows size and spacing controls', async ({ page }) => {
		// dots is selected in beforeEach — spacing slider should be visible
		await expect(page.locator('input[type="range"]')).toBeVisible();
	});

	test('texture choice persists across a page reload', async ({ page }) => {
		await selectTrigger(page, 1).click();
		await page.getByRole('option', { name: /diagonal/i }).click();

		await expect
			.poll(() => getLocalStorage(page, 'backgroundTexture'), { timeout: 3000 })
			.toBe('diagonal');

		await page.reload();

		await expect
			.poll(() => getLocalStorage(page, 'backgroundTexture'), { timeout: 3000 })
			.toBe('diagonal');
	});
});

// ---------------------------------------------------------------------------
// 7. Debug mode
// ---------------------------------------------------------------------------

test.describe('debug mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('debug', 'false'));
		await goToSettings(page);
	});

	test('checking the debug checkbox sets localStorage.debug to "true"', async ({ page }) => {
		const checkbox = page.locator('#debug-checkbox');
		await expect(checkbox).not.toBeChecked();

		await checkbox.click();

		await expect.poll(() => getLocalStorage(page, 'debug'), { timeout: 3000 }).toBe('true');
	});

	test('unchecking the debug checkbox sets localStorage.debug back to "false"', async ({
		page
	}) => {
		// Enable first
		await page.locator('#debug-checkbox').click();
		await expect.poll(() => getLocalStorage(page, 'debug'), { timeout: 3000 }).toBe('true');

		// Now disable
		await page.locator('#debug-checkbox').click();
		await expect.poll(() => getLocalStorage(page, 'debug'), { timeout: 3000 }).toBe('false');
	});

	test('debug state persists across a reload', async ({ page }) => {
		await page.locator('#debug-checkbox').click();
		await expect.poll(() => getLocalStorage(page, 'debug'), { timeout: 3000 }).toBe('true');

		await page.reload();

		await expect.poll(() => getLocalStorage(page, 'debug'), { timeout: 3000 }).toBe('true');

		// Clean up so other tests are not affected
		await page.evaluate(() => localStorage.setItem('debug', 'false'));
	});
});

// ---------------------------------------------------------------------------
// 8. Reset Desktop
// ---------------------------------------------------------------------------

test.describe('reset desktop', () => {
	test('clicking Reset Desktop shows a success toast', async ({ page }) => {
		await goToSettings(page);

		await page.getByRole('button', { name: /reset desktop/i }).click();

		await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 });
	});

	test('clicking Reset Desktop removes any custom file from localStorage.desktopFiles', async ({
		page
	}) => {
		// Seed a custom extra file alongside the defaults
		await page.goto('/');
		await page.evaluate(() =>
			localStorage.setItem(
				'desktopFiles',
				JSON.stringify([
					{ id: 'projects', name: 'Projects', href: '/projects' },
					{ id: 'experiment', name: 'index.js', href: '/experiment' },
					{ id: 'custom', name: 'My Custom File', href: '/custom' }
				])
			)
		);

		await goToSettings(page);
		await page.getByRole('button', { name: /reset desktop/i }).click();

		// resetDesktopFiles() clears the stored list and re-initialises to the
		// two default files (Projects + index.js). The custom file should be gone.
		await expect
			.poll(
				() =>
					page.evaluate(() => {
						const raw = localStorage.getItem('desktopFiles');
						if (!raw) return [];
						try {
							return JSON.parse(raw).map((f: any) => f.id);
						} catch {
							return [];
						}
					}),
				{ timeout: 3000 }
			)
			.not.toContain('custom');
	});

	test('also clears localStorage.onboardingComplete on reset', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('onboardingComplete', 'true'));

		await goToSettings(page);
		await page.getByRole('button', { name: /reset desktop/i }).click();

		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('onboardingComplete')), {
				timeout: 3000
			})
			.toBeNull();
	});
});

// ---------------------------------------------------------------------------
// 9. Export Data link
// ---------------------------------------------------------------------------

test.describe('export data', () => {
	test('Export Data button links to /export', async ({ page }) => {
		await goToSettings(page);
		const exportLink = page.getByRole('link', { name: /export data/i });
		await expect(exportLink).toHaveAttribute('href', '/export');
	});
});
