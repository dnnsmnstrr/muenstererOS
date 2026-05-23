import { test, expect } from '@playwright/test';

/**
 * Onboarding flow E2E tests
 *
 * The onboarding is a 4-step wizard at /onboarding:
 *   Step 1 – Welcome
 *   Step 2 – Language selection
 *   Step 3 – Theme selection
 *   Step 4 – Background texture selection
 *
 * Completing it sets `localStorage.onboardingComplete = "true"` and
 * redirects to the home page (/). The home page shows a toast after
 * 10 s if onboarding has NOT been completed yet.
 */

test.describe('Onboarding page', () => {
	test.beforeEach(async ({ page }) => {
		// Always start with a clean slate (no previous onboarding state)
		await page.goto('/');
		await page.evaluate(() => localStorage.removeItem('onboardingComplete'));
	});

	// ---------------------------------------------------------------------------
	// Rendering
	// ---------------------------------------------------------------------------

	test('renders all four steps in the stepper nav', async ({ page }) => {
		await page.goto('/onboarding');

		// The stepper nav contains one trigger per step
		const triggers = page.locator('[data-slot="stepper-trigger"]');
		await expect(triggers).toHaveCount(4);
	});

	test('starts on step 1 and shows the welcome content', async ({ page }) => {
		await page.goto('/onboarding');

		// Step 1 welcome icon is visible
		await expect(page.locator('h1')).toBeVisible();

		// Next button is present and enabled
		const nextBtn = page.locator('[data-slot="stepper-next"]');
		await expect(nextBtn).toBeVisible();
		await expect(nextBtn).toBeEnabled();

		// Previous button should be disabled on step 1
		const prevBtn = page.locator('[data-slot="stepper-previous"]');
		await expect(prevBtn).toBeDisabled();
	});

	// ---------------------------------------------------------------------------
	// Step navigation (Next / Previous)
	// ---------------------------------------------------------------------------

	test('advances to step 2 (Language) when Next is clicked', async ({ page }) => {
		await page.goto('/onboarding');

		await page.locator('[data-slot="stepper-next"]').click();

		// Step 2 shows a RadioGroup with language options
		await expect(page.locator('label[for="en"]')).toBeVisible();
		await expect(page.locator('label[for="de"]')).toBeVisible();
	});

	test('goes back to step 1 from step 2 via Previous', async ({ page }) => {
		await page.goto('/onboarding');

		await page.locator('[data-slot="stepper-next"]').click();
		await expect(page.locator('label[for="en"]')).toBeVisible();

		await page.locator('[data-slot="stepper-previous"]').click();

		// Back to step 1 — previous button is disabled again
		await expect(page.locator('[data-slot="stepper-previous"]')).toBeDisabled();
	});

	test('advances through all four steps sequentially', async ({ page }) => {
		await page.goto('/onboarding');

		// Step 1 → 2
		await page.locator('[data-slot="stepper-next"]').click();
		await expect(page.locator('label[for="en"]')).toBeVisible();

		// Step 2 → 3
		await page.locator('[data-slot="stepper-next"]').click();
		// Step 3 shows theme buttons (at least one)
		await expect(page.locator('button:has-text("Zinc")')).toBeVisible();

		// Step 3 → 4
		await page.locator('[data-slot="stepper-next"]').click();
		// Step 4 shows texture options; the finish button appears instead of Next
		await expect(page.locator('button:has-text("Finish")')).toBeVisible();
	});

	// ---------------------------------------------------------------------------
	// Step 2 – Language selection
	// ---------------------------------------------------------------------------

	test('selecting German language persists to localStorage', async ({ page }) => {
		await page.goto('/onboarding');
		await page.locator('[data-slot="stepper-next"]').click();

		// Click the German option
		await page.locator('label[for="de"]').click();

		// setLanguage is async (dynamic import), poll until the value is written
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');
	});

	test('selecting English language persists to localStorage', async ({ page }) => {
		await page.goto('/onboarding');
		await page.locator('[data-slot="stepper-next"]').click();

		// Ensure we start from German to make the click meaningful
		await page.locator('label[for="de"]').click();
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('de');

		await page.locator('label[for="en"]').click();

		// setLanguage is async (dynamic import), poll until the value is written
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('language')), { timeout: 5000 })
			.toBe('en');
	});

	// ---------------------------------------------------------------------------
	// Step 3 – Theme selection
	// ---------------------------------------------------------------------------

	test('clicking a theme button stores the selection in localStorage', async ({ page }) => {
		await page.goto('/onboarding');

		// Navigate to step 3
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();

		// Click a theme (e.g. "Rose")
		await page.locator('button:has-text("Rose")').click();

		const theme = await page.evaluate(() => localStorage.getItem('theme'));
		expect(theme).toBe('rose');
	});

	// ---------------------------------------------------------------------------
	// Step 4 – Texture selection
	// ---------------------------------------------------------------------------

	test('clicking a texture option stores the selection in localStorage', async ({ page }) => {
		await page.goto('/onboarding');

		// Navigate to step 4
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();

		// Click the "Grid" texture button
		await page.locator('button:has-text("Grid")').click();

		const texture = await page.evaluate(() => localStorage.getItem('backgroundTexture'));
		expect(texture).toBe('grid');
	});

	// ---------------------------------------------------------------------------
	// Finish – completing the flow
	// ---------------------------------------------------------------------------

	test('completing the flow sets onboardingComplete in localStorage', async ({ page }) => {
		await page.goto('/onboarding');

		// Walk through all steps
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();

		// Click finish
		await page.locator('button:has-text("Finish")').click();

		// The flag should be set
		const flag = await page.evaluate(() => localStorage.getItem('onboardingComplete'));
		expect(flag).toBe('true');
	});

	test('completing the flow redirects to the home page', async ({ page }) => {
		await page.goto('/onboarding');

		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();
		await page.locator('[data-slot="stepper-next"]').click();

		await page.locator('button:has-text("Finish")').click();

		await expect(page).toHaveURL('/');
	});
});

// ---------------------------------------------------------------------------
// Home page onboarding prompt
// ---------------------------------------------------------------------------

test.describe('Home page onboarding prompt', () => {
	test('shows a toast after 10 s when onboarding is not complete', async ({ page }) => {
		// Ensure onboarding flag is absent
		await page.goto('/');
		await page.evaluate(() => localStorage.removeItem('onboardingComplete'));
		await page.reload();

		// The toast fires after 10 s — wait up to 15 s for it
		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible({ timeout: 15_000 });
	});

	test('does NOT show the onboarding toast when already completed', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('onboardingComplete', 'true'));
		await page.reload();

		// Wait 12 s and confirm no toast appeared
		await page.waitForTimeout(12_000);
		await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	});

	test('clicking the toast action navigates to /onboarding', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.removeItem('onboardingComplete'));
		await page.reload();

		// Wait for toast to appear
		const toast = page.locator('[data-sonner-toast]');
		await expect(toast).toBeVisible({ timeout: 15_000 });

		// Click the action button inside the toast
		await toast.locator('button').click();

		await expect(page).toHaveURL('/onboarding');
	});
});
