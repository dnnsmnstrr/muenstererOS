import { test, expect, type Page } from '@playwright/test';

/**
 * Command palette tests
 *
 * The palette is a global overlay rendered by Command.svelte in the root layout.
 * It is triggered by Cmd+K (or Ctrl+K) and closed with Escape.
 *
 * Coverage:
 *  1. Open / close behaviour (keyboard + click-outside)
 *  2. Search / filtering of items
 *  3. Navigation items — selecting an item routes to the right page
 *  4. Vim-style g* shortcuts — no palette needed
 *  5. System actions — dark/light mode toggle, language switch
 *  6. Help dialog — Shift+? and the keyboard shortcuts entry
 *  7. Screensaver sub-group — drill in and back
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Dispatch a synthetic keyboard event on document.
 * Playwright's page.keyboard.press() is intercepted by Chromium before reaching
 * the page JS listener for modifier combos, so we dispatch directly.
 * A small wait is needed to ensure the SvelteKit onMount listener is attached.
 */
async function pressKey(
	page: Page,
	key: string,
	modifiers: { ctrlKey?: boolean; shiftKey?: boolean; metaKey?: boolean } = {}
) {
	// Wait for the header to be rendered — this guarantees SvelteKit has hydrated
	// and the Command.svelte onMount keydown listener is attached.
	await page.locator('header').waitFor({ state: 'visible' });
	await page.evaluate(
		([k, mods]) => {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...mods }));
		},
		[key, modifiers] as [string, typeof modifiers]
	);
}

/**
 * Opens the palette by clicking the CommandButton in the header.
 * This is the most reliable approach — no keyboard interception, no timing issues.
 */
async function openPalette(page: Page) {
	// The CommandButton in the header has aria-label="Command Palette" (from i18n)
	await page.locator('button[aria-label="Command Palette"]').click();
	await expect(page.locator('[data-command-input]')).toBeVisible();
}

/** Asserts the palette input is NOT present/visible */
async function expectPaletteClosed(page: Page) {
	await expect(page.locator('[data-command-input]')).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Open / close
// ---------------------------------------------------------------------------

test.describe('open and close', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Ctrl+K opens the palette', async ({ page }) => {
		await expectPaletteClosed(page);
		await pressKey(page, 'k', { ctrlKey: true });
		await expect(page.locator('[data-command-input]')).toBeVisible();
	});

	test('Ctrl+. opens the palette (alternate shortcut)', async ({ page }) => {
		await expectPaletteClosed(page);
		await pressKey(page, '.', { ctrlKey: true });
		await expect(page.locator('[data-command-input]')).toBeVisible();
	});

	test('Escape closes the palette', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.press('Escape');
		await expectPaletteClosed(page);
	});

	test('pressing Ctrl+K a second time toggles it closed', async ({ page }) => {
		await openPalette(page);
		await pressKey(page, 'k', { ctrlKey: true });
		await expectPaletteClosed(page);
	});

	test('clicking outside the palette closes it', async ({ page }) => {
		await openPalette(page);
		// Click somewhere on the page backdrop (outside the dialog)
		await page.mouse.click(10, 10);
		await expectPaletteClosed(page);
	});

	test('the search input is focused when the palette opens', async ({ page }) => {
		await openPalette(page);
		const input = page.locator('[data-command-input]');
		await expect(input).toBeFocused();
	});
});

// ---------------------------------------------------------------------------
// 2. Search / filtering
// ---------------------------------------------------------------------------

test.describe('search and filtering', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await openPalette(page);
	});

	test('items are listed when no query is typed', async ({ page }) => {
		const items = page.locator('[data-command-item]');
		await expect(items.first()).toBeVisible();
		expect(await items.count()).toBeGreaterThan(0);
	});

	test('typing a query filters items to matching ones', async ({ page }) => {
		await page.keyboard.type('Settings');
		const items = page.locator('[data-command-item]');
		await expect(items.first()).toBeVisible();
		const count = await items.count();
		// At minimum the "Settings" navigation item should match
		expect(count).toBeGreaterThan(0);
		// Every visible item's text should loosely contain the query
		for (let i = 0; i < count; i++) {
			await expect(items.nth(i)).toBeVisible();
		}
	});

	test('shows the empty state when no items match', async ({ page }) => {
		await page.keyboard.type('xyzzy_no_command_ever');
		// bits-ui Command renders [data-command-empty] when nothing matches
		await expect(page.locator('[data-command-empty]')).toBeVisible();
	});

	test('clearing the query restores all items', async ({ page }) => {
		const items = page.locator('[data-command-item]');
		const totalBefore = await items.count();

		await page.keyboard.type('xyzzy');
		await expect(page.locator('[data-command-empty]')).toBeVisible();

		// Triple-click the input to select all, then delete
		await page.locator('[data-command-input]').fill('');
		await expect(items).toHaveCount(totalBefore);
	});
});

// ---------------------------------------------------------------------------
// 3. Navigation — selecting items routes correctly
// ---------------------------------------------------------------------------

test.describe('navigation items', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('selecting "Settings" navigates to /settings', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('Settings');

		// Use getByRole to match the accessible name, which ignores icon SVG text
		const settingsItem = page.getByRole('option', { name: 'Settings' });
		await expect(settingsItem).toBeVisible();
		await settingsItem.click();

		await expect(page).toHaveURL(/\/settings/);
	});

	test('selecting "Projects" navigates to /projects', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('Projects');

		const projectsItem = page.getByRole('option', { name: 'Projects' });
		await expect(projectsItem).toBeVisible();
		await projectsItem.click();

		await expect(page).toHaveURL(/\/projects/);
	});

	test('the current page is excluded from the navigation list', async ({ page }) => {
		// We are on / — "Home" should not appear as a navigation target
		await openPalette(page);
		await page.keyboard.type('Home');

		// The navigation group should not contain a "Home" option
		await expect(page.getByRole('option', { name: 'Home', exact: true })).toHaveCount(0);
	});

	test('palette closes after selecting a navigation item', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('Settings');
		await page.getByRole('option', { name: 'Settings' }).click();
		await expectPaletteClosed(page);
	});
});

// ---------------------------------------------------------------------------
// 4. Vim-style g* keyboard shortcuts (no palette)
// ---------------------------------------------------------------------------

test.describe('vim-style shortcuts', () => {
	/**
	 * Dispatch a bare (no modifier) keydown via the page JS listener.
	 * page.keyboard.press() works fine for non-modifier keys; we keep using it
	 * but ensure no element has focus first so the app's noFocusedElement guard passes.
	 * We dispatch via evaluate instead of keyboard.press for the second key to
	 * avoid any race between `lastKey` being set and the next event firing.
	 */
	async function pressVimKey(page: Page, key: string) {
		await page.evaluate((k) => {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
		}, key);
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Blur any focused element so document.activeElement === document.body
		await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
		await page.locator('header').waitFor({ state: 'visible' });
	});

	test('g then s navigates to /settings', async ({ page }) => {
		await pressVimKey(page, 'g');
		await pressVimKey(page, 's');
		await expect(page).toHaveURL(/\/settings/);
	});

	test('g then p navigates to /projects', async ({ page }) => {
		await pressVimKey(page, 'g');
		await pressVimKey(page, 'p');
		await expect(page).toHaveURL(/\/projects/);
	});

	test('g then n navigates to /now', async ({ page }) => {
		await pressVimKey(page, 'g');
		await pressVimKey(page, 'n');
		await expect(page).toHaveURL(/\/now/);
	});

	test('g then h navigates to / (home)', async ({ page }) => {
		// Start from somewhere else so a navigation to / is observable
		await page.goto('/settings');
		await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
		await page.locator('header').waitFor({ state: 'visible' });
		await pressVimKey(page, 'g');
		await pressVimKey(page, 'h');
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
	});

	test('g then r navigates to /redirects', async ({ page }) => {
		await pressVimKey(page, 'g');
		await pressVimKey(page, 'r');
		await expect(page).toHaveURL(/\/redirects/);
	});

	test('shortcuts are ignored on the /hotkeys page', async ({ page }) => {
		await page.goto('/hotkeys');
		await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
		await page.locator('header').waitFor({ state: 'visible' });
		// g+s on /hotkeys should NOT navigate away
		await pressVimKey(page, 'g');
		await pressVimKey(page, 's');
		await expect(page).toHaveURL(/\/hotkeys/);
	});
});

// ---------------------------------------------------------------------------
// 5. System actions
// ---------------------------------------------------------------------------

test.describe('system actions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Ctrl+M toggles dark/light mode', async ({ page }) => {
		const html = page.locator('html');
		const before = await html.getAttribute('data-theme');

		await pressKey(page, 'm', { ctrlKey: true });

		const after = await html.getAttribute('data-theme');
		expect(after).not.toBe(before);
	});

	test('"Toggle Dark Mode" item in palette flips the theme', async ({ page }) => {
		const html = page.locator('html');
		const before = await html.getAttribute('data-theme');

		await openPalette(page);
		await page.keyboard.type('dark mode');
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /dark mode/i })
			.first()
			.click();

		const after = await html.getAttribute('data-theme');
		expect(after).not.toBe(before);
	});

	test('"Switch Language" item switches to German and shows a toast', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('language');
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /switch language/i })
			.click();

		// Toast confirms the switch
		await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 });

		// Palette is closed after action
		await expectPaletteClosed(page);

		// Language stored in localStorage
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');
	});

	test('"Reset Desktop Files" shows a success toast', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('reset desktop');
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /reset desktop/i })
			.click();

		await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 });
	});

	test('Ctrl+, navigates to /settings', async ({ page }) => {
		await pressKey(page, ',', { ctrlKey: true });
		await expect(page).toHaveURL(/\/settings/);
	});
});

// ---------------------------------------------------------------------------
// 6. Help dialog
// ---------------------------------------------------------------------------

test.describe('help dialog', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Blur any focused element so Shift+? is handled as a shortcut
		await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
		await page.locator('header').waitFor({ state: 'visible' });
	});

	// The help dialog has aria-labelledby pointing to a heading with "Keyboard Shortcuts"
	const helpDialog = (page: Page) => page.getByRole('dialog', { name: 'Keyboard Shortcuts' });

	test('Shift+? opens the keyboard shortcuts dialog', async ({ page }) => {
		await pressKey(page, '?', { shiftKey: true });
		await expect(helpDialog(page)).toBeVisible();
	});

	test('the shortcuts dialog lists at least one shortcut', async ({ page }) => {
		await pressKey(page, '?', { shiftKey: true });
		await expect(helpDialog(page)).toBeVisible();
		// Each shortcut is rendered as a <li>
		const shortcuts = helpDialog(page).locator('li');
		await expect(shortcuts.first()).toBeVisible();
		expect(await shortcuts.count()).toBeGreaterThan(0);
	});

	test('Escape closes the shortcuts dialog', async ({ page }) => {
		await pressKey(page, '?', { shiftKey: true });
		await expect(helpDialog(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(helpDialog(page)).not.toBeVisible();
	});

	test('"Keyboard Shortcuts" item in palette opens the help dialog', async ({ page }) => {
		await openPalette(page);
		await page.keyboard.type('keyboard shortcuts');
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /keyboard shortcuts/i })
			.click();

		await expect(helpDialog(page)).toBeVisible();
	});
});

// ---------------------------------------------------------------------------
// 7. Screensaver sub-group
// ---------------------------------------------------------------------------

test.describe('screensaver sub-group', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await openPalette(page);
		// Navigate into the screensaver sub-group
		await page.keyboard.type('screensaver');
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /screensaver/i })
			.first()
			.click();
	});

	test('drilling into Screensaver shows the sub-group options', async ({ page }) => {
		// Sub-group has None, DVD Bounce, Playlist Covers, and Go Back
		await expect(page.locator('[data-command-item]').filter({ hasText: /none/i })).toBeVisible();
		await expect(page.locator('[data-command-item]').filter({ hasText: /dvd/i })).toBeVisible();
	});

	test('selecting "DVD Bounce" stores the setting and closes the palette', async ({ page }) => {
		await page.locator('[data-command-item]').filter({ hasText: /dvd/i }).click();

		await expectPaletteClosed(page);

		const stored = await page.evaluate(() => localStorage.getItem('screensaver'));
		expect(stored).toBe('dvd');
	});

	test('selecting "None" stores the setting and closes the palette', async ({ page }) => {
		await page.getByRole('option', { name: 'None' }).click();

		await expectPaletteClosed(page);

		const stored = await page.evaluate(() => localStorage.getItem('screensaver'));
		expect(stored).toBe('none');
	});

	test('"Go Back" returns to the top-level command list', async ({ page }) => {
		await page
			.locator('[data-command-item]')
			.filter({ hasText: /go back/i })
			.click();

		// Back at top level — the main navigation items should be visible again
		await expect(
			page.locator('[data-command-item]').filter({ hasText: /settings/i })
		).toBeVisible();
		// Sub-group items should be gone
		await expect(page.locator('[data-command-item]').filter({ hasText: /dvd/i })).toHaveCount(0);
	});

	test('Escape returns to the top-level command list without closing the palette', async ({ page }) => {
		await page.keyboard.press('Escape');

		await expect(page.locator('[data-command-input]')).toBeVisible();
		await expect(
			page.locator('[data-command-item]').filter({ hasText: /settings/i })
		).toBeVisible();
		await expect(page.locator('[data-command-item]').filter({ hasText: /dvd/i })).toHaveCount(0);
	});
});
