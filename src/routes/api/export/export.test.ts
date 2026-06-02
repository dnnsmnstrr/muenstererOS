import { describe, it, expect, vi } from 'vitest';
import { GET } from './+server';
import { USERNAME_SHORT } from '$lib/config';

describe('/api/export', () => {
	it('returns static data without authentication if gists=false', async () => {
		const url = new URL('http://localhost/api/export?gists=false');
		const request = new Request(url);

		const response = await GET({ url, request, fetch: vi.fn() } as any);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.staticData).toBeDefined();
		expect(data.gists).toBeUndefined();
	});

	it('returns 401 if gists=true and no Authorization header', async () => {
		const url = new URL('http://localhost/api/export?gists=true');
		const request = new Request(url);

		const response = await GET({ url, request, fetch: vi.fn() } as any);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.error).toContain('Unauthorized');
	});

	it('returns 403 if token belongs to wrong user', async () => {
		const url = new URL('http://localhost/api/export?gists=true');
		const request = new Request(url, {
			headers: { Authorization: 'Bearer wrong_token' }
		});

		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ login: 'attacker' })
		});

		const response = await GET({ url, request, fetch: mockFetch } as any);
		const data = await response.json();

		expect(response.status).toBe(403);
		expect(data.error).toContain('Forbidden');
	});

	it('returns 200 if token belongs to owner', async () => {
		const url = new URL('http://localhost/api/export?gists=true');
		const request = new Request(url, {
			headers: { Authorization: 'Bearer valid_token' }
		});

		const mockFetch = vi.fn().mockImplementation((url) => {
			if (url === 'https://api.github.com/user') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ login: USERNAME_SHORT })
				});
			}
			if (url.startsWith('https://api.github.com/gists/')) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							files: { 'test.json': { content: '{}' } },
							updated_at: new Date().toISOString(),
							html_url: 'http://gist.com',
							history: []
						})
				});
			}
			return Promise.reject(new Error('Unknown URL'));
		});

		const response = await GET({ url, request, fetch: mockFetch } as any);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.gists).toBeDefined();
	});

	it('ignores token in query parameter', async () => {
		const url = new URL('http://localhost/api/export?gists=true&token=leaked_token');
		const request = new Request(url);

		const response = await GET({ url, request, fetch: vi.fn() } as any);
		const data = await response.json();

		expect(response.status).toBe(401); // Should still be unauthorized because query token is ignored
	});
});
