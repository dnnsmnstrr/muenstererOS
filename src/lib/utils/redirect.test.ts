import { describe, it, expect, vi } from 'vitest';
import { getRedirect, getRedirectURL, type Redirect } from './redirect';

const mockRedirects: Redirect[] = [
	{
		name: 'Home',
		url: 'https://example.com',
		aliases: ['main', '🏠']
	},
	{
		name: 'GitHub',
		url: 'https://github.com/user',
		aliases: ['gh', 'git']
	},
	{
		name: 'Internal',
		aliases: ['int']
	}
];

describe('redirect utils', () => {
	describe('getRedirect', () => {
		it('should find redirect by name (case-insensitive)', () => {
			const result = getRedirect('home', mockRedirects);
			expect(result).toBe('https://example.com');
		});

		it('should find redirect by alias (case-insensitive)', () => {
			const result = getRedirect('GH', mockRedirects);
			expect(result).toBe('https://github.com/user');
		});

		it('should find redirect by emoji alias', () => {
			const result = getRedirect('🏠', mockRedirects);
			expect(result).toBe('https://example.com');
		});

		it('should return a 404 path for non-existent redirects', () => {
			const query = 'nonexistent';
			const result = getRedirect(query, mockRedirects);
			expect(result).toBe(`/404/${query}`);
		});

		it('should return a random redirect when query is "random"', () => {
			const result = getRedirect('random', mockRedirects, { returnObject: true }) as Redirect;
			expect(mockRedirects).toContain(result);
		});

		it('should return the redirect object when returnObject option is true', () => {
			const result = getRedirect('home', mockRedirects, { returnObject: true });
			expect(result).toEqual(mockRedirects[0]);
		});

		it('should call log function if provided in options', () => {
			const log = vi.fn();
			getRedirect('home', mockRedirects, { log });
			expect(log).toHaveBeenCalledWith('query', 'home');
		});

		it('should handle missing names in redirects gracefully', () => {
			const redirectsWithMissingName = [
				{ url: 'https://no-name.com' } as Redirect,
				...mockRedirects
			];
			const result = getRedirect('home', redirectsWithMissingName);
			expect(result).toBe('https://example.com');
		});
	});

	describe('getRedirectURL', () => {
		it('should return url if present', () => {
			const redirect: Redirect = { name: 'test', url: 'https://test.com' };
			expect(getRedirectURL(redirect)).toBe('https://test.com');
		});

		it('should return /name if url is missing but name is present', () => {
			const redirect: Redirect = { name: 'test' };
			expect(getRedirectURL(redirect)).toBe('/test');
		});

		it('should return /404/query if both url and name are missing', () => {
			const redirect: Redirect = { name: '' };
			expect(getRedirectURL(redirect, { query: 'something' })).toBe('/404/something');
		});

		it('should return /404/ if noReturn is true and both url and name are missing', () => {
			const redirect: Redirect = { name: '' };
			expect(getRedirectURL(redirect, { query: 'something', noReturn: true })).toBe('/404/');
		});
	});
});
