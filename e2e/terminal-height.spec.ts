import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test('terminal height increases when maximized on mobile', async ({ page }) => {
	await page.goto('/terminal');

	// Wait for terminal loading to complete and input to be focused
	const terminalInput = page.locator('input#terminal-input');
	await expect(terminalInput).toBeVisible({ timeout: 15000 });

	// Use a more specific locator for the terminal window root
	// It's a div that contains the WindowButtons and the terminal content
	const terminalRoot = page.locator('div.rounded-lg.border.bg-background').filter({ has: page.locator('[data-window-action="maximize"]') }).first();

	// Get initial height
	const initialBox = await terminalRoot.boundingBox();
	expect(initialBox).not.toBeNull();
	const initialHeight = initialBox!.height;

	// Click maximize button
	await page.click('[data-window-action="maximize"]');

	// Wait for the height to change and exceed the initial height
	await expect(async () => {
		const maximizedBox = await terminalRoot.boundingBox();
		expect(maximizedBox).not.toBeNull();
		expect(maximizedBox!.height).toBeGreaterThan(initialHeight);
	}).toPass({ timeout: 5000 });

	const finalBox = await terminalRoot.boundingBox();
	console.log(`Initial height: ${initialHeight}, Maximized height: ${finalBox!.height}`);
});
