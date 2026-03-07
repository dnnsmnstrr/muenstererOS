import { describe, it, expect } from 'vitest';
import { redirects, getRedirectByName } from './redirects';

describe('redirects definition', () => {
	it('should find homepage redirect', () => {
		const result = getRedirectByName('homepage');
		expect(result).toBeDefined();
		expect(result?.name).toBe('homepage');
	});

	it('should find github redirect by alias', () => {
		const result = getRedirectByName('gh');
		expect(result).toBeDefined();
		expect(result?.name).toBe('github');
	});

	it('should ensure all redirects have a name', () => {
		redirects.forEach((redirect) => {
			expect(redirect.name).toBeDefined();
			expect(redirect.name.length).toBeGreaterThan(0);
		});
	});

	it('should ensure there are no duplicate names', () => {
		const names = redirects.map((r) => r.name.toLowerCase());
		const uniqueNames = new Set(names);
		expect(names.length).toBe(uniqueNames.size);
	});

	it('should ensure there are no duplicate aliases', () => {
		const aliases = redirects.flatMap((r) => r.aliases || []).map((a) => a.toLowerCase());
		const uniqueAliases = new Set(aliases);

		if (aliases.length !== uniqueAliases.size) {
			const duplicates = aliases.filter((alias, index) => aliases.indexOf(alias) !== index);
			console.log('Duplicate aliases found:', [...new Set(duplicates)]);
		}

		expect(aliases.length).toBe(uniqueAliases.size);
	});

	it('should ensure no alias is also a name', () => {
		const names = new Set(redirects.map((r) => r.name.toLowerCase()));
		const aliasesWithSource = redirects.flatMap((r) =>
			(r.aliases || []).map((a) => ({ alias: a.toLowerCase(), source: r.name }))
		);

		const duplicates = aliasesWithSource.filter(({ alias, source }) => names.has(alias));
		if (duplicates.length > 0) {
			console.log('Aliases that are also names:', duplicates);
		}
		expect(duplicates.length).toBe(0);
	});
});
