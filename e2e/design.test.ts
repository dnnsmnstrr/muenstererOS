import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		if (!localStorage.getItem('language')) localStorage.setItem('language', 'en');
	});
	await page.goto('/design');
	await expect(page.locator('[data-design-library]')).toHaveAttribute('data-ready', 'true');
	await expect(page.getByRole('heading', { name: 'Design library', exact: true })).toBeVisible();
});

test('snippets match the rendered source and clipboard failures offer manual copying', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const example = page.locator('#example-inputs');
	await example.getByRole('textbox', { name: 'Name', exact: true }).fill('New page');
	await example.getByRole('button', { name: 'Copy snippet' }).click();
	await expect(example.getByRole('button', { name: 'Copy snippet' })).toHaveText('Copied');
	const source = readFileSync('src/lib/components/design/examples/Inputs.svelte', 'utf8').trim();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
	await page.evaluate(() =>
		Object.defineProperty(navigator.clipboard, 'writeText', {
			configurable: true,
			value: () => Promise.reject(new Error('Denied'))
		})
	);
	await example.getByRole('button', { name: 'Copy snippet' }).click();
	await expect(example.getByRole('status')).toContainText('Clipboard unavailable');
	await example.getByText('View Svelte source', { exact: true }).click();
	await expect(example.locator('code')).toHaveText(source);
});

test('themes use real CSS tokens, preserve site theme, and copy both modes', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const original = await page.evaluate(() => ({
		body: document.body.className,
		saved: localStorage.getItem('theme')
	}));
	await page.getByRole('button', { name: 'blue', exact: true }).click();
	await expect(page.getByRole('button', { name: 'blue', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	const light = page.locator('[data-theme-preview="light"]');
	const dark = page.locator('[data-theme-preview="dark"]');
	expect(
		await light.evaluate((el) => getComputedStyle(el).getPropertyValue('--primary').trim())
	).toBe('221.2 83.2% 53.3%');
	expect(
		await dark.evaluate((el) => getComputedStyle(el).getPropertyValue('--background').trim())
	).toBe('222.2 84% 4.9%');
	expect(
		await page.evaluate(() => ({
			body: document.body.className,
			saved: localStorage.getItem('theme')
		}))
	).toEqual(original);
	await page.getByRole('button', { name: 'Dark', exact: true }).click();
	await page.getByRole('button', { name: 'Inspect --background', exact: true }).click();
	await page.getByRole('button', { name: 'Copy token', exact: true }).click();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		'--background: 222.2 84% 4.9%;'
	);
	await page.getByRole('button', { name: 'Copy theme CSS' }).click();
	const css = await page.evaluate(() => navigator.clipboard.readText());
	expect(css).toContain('.theme-blue {');
	expect(css).toContain('.dark .theme-blue {');
	expect(css).toContain('--radius: 0.5rem;');
});

test('theme selector scrolls sideways and arrow controls wrap around', async ({ page }) => {
	const selector = page.locator('[data-theme-selector]');
	const list = selector.getByRole('group', { name: 'Theme explorer' });

	await expect(list).toHaveCSS('overflow-x', 'auto');
	await expect(page.getByRole('button', { name: 'zinc', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await selector.getByRole('button', { name: 'Previous theme' }).click();
	await expect(page.getByRole('button', { name: 'violet', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await selector.getByRole('button', { name: 'Next theme' }).click();
	await expect(page.getByRole('button', { name: 'zinc', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await selector.getByRole('button', { name: 'Next theme' }).click();
	await expect(page.getByRole('button', { name: 'slate', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('component interactions, reset, search, and dialog focus work', async ({ page }) => {
	await page
		.locator('#example-buttons')
		.getByRole('button', { name: 'default', exact: true })
		.click();
	await expect(page.locator('#example-buttons')).toContainText('Clicks: 1');
	await page.locator('#example-toggles').getByRole('checkbox').check();
	await expect(page.locator('#example-toggles').getByRole('checkbox')).toBeChecked();
	const slider = page.locator('#example-slider').getByRole('slider');
	await slider.focus();
	await page.keyboard.press('ArrowRight');
	await expect(slider).toHaveAttribute('aria-valuenow', '45');
	await page.locator('#example-tabs').getByRole('tab', { name: 'Details' }).click();
	await expect(page.locator('#example-tabs').getByRole('tabpanel')).toContainText('Use Tab');
	const trigger = page.getByRole('button', { name: 'Open dialog' });
	await trigger.click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(trigger).toBeFocused();
	await page.getByRole('button', { name: 'Reset examples' }).click();
	await expect(page.locator('#example-buttons')).toContainText('Clicks: 0');
	await expect(page.locator('#example-toggles').getByRole('checkbox')).not.toBeChecked();
	await page.getByRole('searchbox', { name: 'Find a component…' }).fill('window');
	await expect(page.locator('#components article')).toHaveCount(1);
	await page.getByRole('button', { name: 'Close window' }).click();
	await page.getByRole('button', { name: 'Restore window' }).click();
	await expect(page.getByRole('button', { name: 'Close window' })).toBeVisible();
});

test('command bar discovers the page and spec remains accessible', async ({ page }) => {
	await page.goto('/about', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Command Palette', exact: true }).click();
	await page.getByRole('dialog').locator('[data-command-input]').fill('styleguide');
	await page.getByRole('option', { name: /Design library/ }).click();
	await expect(page).toHaveURL(/\/design$/);
	const response = await page.request.get('/design.md');
	expect(response.ok()).toBe(true);
	expect(await response.text()).toContain('interactive library');
});

test('mobile and German library stay readable', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.evaluate(() => localStorage.setItem('language', 'de'));
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Designbibliothek', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Theme-CSS kopieren' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
	await page.getByRole('searchbox').fill('Eingabefelder');
	await expect(page.locator('#components article')).toHaveCount(1);
	await page.getByText('Svelte-Quelltext anzeigen', { exact: true }).click();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
});

test('header and footer wheel gestures scroll content without moving the viewport', async ({
	page
}) => {
	const main = page.locator('main');
	const header = page.locator('header').first();
	const footer = page.locator('footer');

	await header.hover();
	await page.mouse.wheel(0, 500);
	await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	expect(await page.evaluate(() => window.scrollY)).toBe(0);

	await main.evaluate((element) => (element.scrollTop = element.scrollHeight));
	await footer.hover();
	await page.mouse.wheel(0, -500);
	await expect
		.poll(() =>
			main.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop)
		)
		.toBeGreaterThan(0);

	await main.evaluate((element) => (element.scrollTop = element.scrollHeight));
	await footer.hover();
	await page.mouse.wheel(0, 500);
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
	await expect(header).toBeVisible();
	await expect(footer).toBeVisible();
});

test('typography and Markdown examples are live and copyable', async ({ page }) => {
	await expect(page.locator('#example-typography')).toContainText('Calm, precise, and readable.');

	const markdown = page.locator('#example-markdown');
	await markdown
		.getByRole('textbox', { name: 'Markdown source' })
		.fill('# Updated preview\n\nThis is **live**.');
	await expect(markdown.getByRole('heading', { name: 'Updated preview' })).toBeVisible();
	await expect(markdown.locator('strong')).toHaveText('live');
	await markdown
		.getByRole('textbox', { name: 'Markdown source' })
		.fill('<img src="missing" onerror="window.markdownExecuted = true">');
	await expect(markdown.locator('[data-example-preview="markdown"] img')).toHaveCount(0);
	expect(await page.evaluate(() => 'markdownExecuted' in window)).toBe(false);
	await expect(markdown.getByRole('button', { name: 'Copy snippet' })).toBeVisible();
});

test('wide layouts show a sticky table of contents', async ({ page }) => {
	await page.setViewportSize({ width: 1200, height: 900 });
	await expect(page.getByRole('navigation', { name: 'On this page' })).toBeHidden();

	await page.setViewportSize({ width: 1280, height: 900 });
	const contents = page.getByRole('navigation', { name: 'On this page' });
	await expect(contents).toBeVisible();
	const components = contents.locator('li').filter({
		has: contents.getByRole('link', { name: 'Components', exact: true })
	});
	await expect(components.getByRole('link', { name: 'Buttons', exact: true })).toBeVisible();
	await components.getByRole('link', { name: 'Buttons', exact: true }).click();
	await expect(components.getByRole('link', { name: 'Buttons', exact: true })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await contents.getByRole('link', { name: 'Guidelines' }).click();
	await expect(contents.getByRole('link', { name: 'Guidelines' })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await expect
		.poll(() => page.locator('main').evaluate((element) => element.scrollTop))
		.toBeGreaterThan(0);
});

test('/styleguide permanently redirects to /design', async ({ page }) => {
	const response = await page.request.get('/styleguide', { maxRedirects: 0 });
	expect(response.status()).toBe(308);
	expect(response.headers().location).toBe('/design');
});

test('select and dropdown menu update their values', async ({ page }) => {
	const select = page.locator('#example-select');
	await select.getByRole('button', { name: 'Status', exact: true }).click();
	await page.getByRole('option', { name: 'Saved', exact: true }).click();
	await expect(select).toContainText('Status: Saved');
	await page.locator('#example-menu').getByRole('button', { name: 'Details' }).click();
	await page.getByRole('menuitem', { name: 'Save', exact: true }).click();
	await expect(page.locator('[data-example-preview="menu"] p')).toHaveText('Saved');
});

test('tooltip supports pointer and keyboard focus', async ({ page }) => {
	const trigger = page.locator('[data-example-preview="tooltip"]').getByRole('button');
	await trigger.hover();
	await expect(page.getByRole('tooltip')).toContainText('Use Tab');
	await page.mouse.move(0, 0);
	await trigger.focus();
	await expect(trigger).toBeFocused();
	await expect(page.getByRole('tooltip')).toContainText('Use Tab');
});

test('isolated command example filters and selects an action', async ({ page }) => {
	const command = page.locator('#example-command');
	await command.getByRole('combobox').fill('buttons');
	await command.getByRole('option', { name: 'Buttons', exact: true }).click();
	await expect(command.locator('[data-example-preview="command"] p')).toHaveText('Buttons');
});
