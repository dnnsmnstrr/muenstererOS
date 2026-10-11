import { test, expect } from '@playwright/test';

test.describe('Ping page', () => {
	test('renders textarea with translated placeholder text', async ({ page }) => {
		await page.goto('/ping');

		const textarea = page.locator('textarea');
		await expect(textarea).toBeVisible();

		const placeholder = await textarea.getAttribute('placeholder');
		expect(placeholder).not.toBe('ping.placeholder');
		expect(placeholder).toBe('Your message...');
	});

	test('hides recent pings when no admin token and no session pings are present', async ({ page }) => {
		await page.goto('/ping');

		// Recent messages accordion trigger should not be visible for non-admin users without sent pings
		const latestMessageAccordion = page.getByText('Latest Message');
		await expect(latestMessageAccordion).not.toBeVisible();
	});

	test('displays session ping after user sends a message', async ({ page }) => {
		// Mock ntfy POST response to avoid sending actual push notifications during test
		await page.route('**/ntfy.sh/**', async (route) => {
			if (route.request().method() === 'POST') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						id: 'mock-session-ping-123',
						time: Math.floor(Date.now() / 1000),
						event: 'message',
						message: 'Hello from Playwright test'
					})
				});
			} else if (route.request().method() === 'GET') {
				// Return JSON endpoint with the mocked message
				await route.fulfill({
					status: 200,
					contentType: 'text/plain',
					body: JSON.stringify({
						id: 'mock-session-ping-123',
						time: Math.floor(Date.now() / 1000),
						event: 'message',
						message: 'Hello from Playwright test'
					}) + '\n'
				});
			} else {
				await route.continue();
			}
		});

		await page.goto('/ping');
		await page.waitForLoadState('networkidle');

		const textarea = page.locator('textarea');
		await textarea.fill('Hello from Playwright test');

		const sendButton = page.locator('button[type="submit"]');
		await expect(sendButton).toBeEnabled();
		await sendButton.click();

		// After sending, the accordion trigger with "Latest Message" should appear containing the sent ping
		const latestMessageAccordion = page.getByText('Latest Message');
		await expect(latestMessageAccordion).toBeVisible();
		await expect(page.getByText('— Hello from Playwright test')).toBeVisible();
	});
});
