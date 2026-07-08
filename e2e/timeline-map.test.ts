import { test, expect } from '@playwright/test';

test('timeline has map view', async ({ page }) => {
  await page.goto('/timeline');

  // Wait for loading to finish
  await expect(page.locator('text=Loading...')).not.toBeVisible();

  // Find the tab trigger
  const mapTab = page.getByRole('tab').filter({ hasText: /Map|Karte/ });
  await expect(mapTab).toBeVisible();

  await mapTab.click();

  // Wait for the map container to be in the DOM and visible
  const mapContainer = page.locator('#timeline-map');
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Verify slider exists
  const slider = page.locator('span[data-slider-root]');
  await expect(slider).toBeVisible();
});
