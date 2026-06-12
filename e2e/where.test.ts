import { test, expect } from '@playwright/test';

test.describe('Where page', () => {
	test('should load the map and airplane overlay', async ({ page }) => {
		await page.goto('/where');

		// Check if map container exists
		const map = page.locator('#map');
		await expect(map).toBeVisible();

		// Check if leaflet is loaded (tile layer should be present)
		const tiles = page.locator('.leaflet-tile-pane');
		await expect(tiles).toBeAttached();

		// Check if marker is present (leaflet-marker-icon)
		const marker = page.locator('.leaflet-marker-icon');
		await expect(marker).toBeVisible();

        // Verify it's not a broken image (check naturalWidth if possible, or just absence of 'broken' state)
        const markerSrc = await marker.getAttribute('src');
        expect(markerSrc).toBeTruthy();
        expect(markerSrc).not.toContain('undefined');

		// Check if airplane overlay exists
		const airplaneOverlay = page.locator('.pointer-events-none.absolute.inset-0.z-\\[9999\\]');
		await expect(airplaneOverlay).toBeVisible();
	});
});
