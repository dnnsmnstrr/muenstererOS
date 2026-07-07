import { test, expect } from '@playwright/test';

test('timeline has map view', async ({ page }) => {
  await page.goto('/timeline');

  // Wait for loading to finish
  await expect(page.locator('text=Loading...')).not.toBeVisible();

  // Check if we have events
  const noEvents = await page.locator('text=No events found').isVisible();
  if (noEvents) {
    console.log('Skipping map check because no events are available');
    return;
  }

  // Find the tab trigger
  const mapTab = page.getByRole('tab').filter({ hasText: /Map|Karte/ });
  await expect(mapTab).toBeVisible();

  await mapTab.click();

  // Wait for the map container to be in the DOM and visible
  const mapContainer = page.locator('#timeline-map');
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  // Verify slider exists
  const slider = page.locator('.relative.flex.w-full.touch-none.select-none.items-center');
  await expect(slider).toBeVisible();
});
