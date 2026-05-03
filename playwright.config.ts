import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	// Directory where all E2E tests live
	testDir: './e2e',

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if any test.only was accidentally left in source
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Reporter
	reporter: [['list'], ['html', { open: 'never' }]],

	use: {
		// Base URL — matches the SvelteKit dev server
		baseURL: 'http://localhost:5173',

		// Collect trace on first retry to aid debugging
		trace: 'on-first-retry',

		// Reset localStorage between tests so onboarding state is clean
		storageState: undefined
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	// Start the SvelteKit dev server before running tests
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 30_000
	}
});
