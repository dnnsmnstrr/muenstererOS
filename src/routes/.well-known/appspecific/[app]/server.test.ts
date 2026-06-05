import { describe, it, expect, vi } from 'vitest';
import { GET } from './+server';

vi.mock('$app/environment', () => ({
	dev: false
}));

describe('.well-known devtools endpoint', () => {
	it('should return 404 in production mode', async () => {
		const params = { app: 'com.chrome.devtools.json' };
		// @ts-ignore
		const response = await GET({ params });
		expect(response.status).toBe(404);
	});

	it('should return 404 for wrong app name', async () => {
		const params = { app: 'wrong.json' };
		// @ts-ignore
		const response = await GET({ params });
		expect(response.status).toBe(404);
	});
});
