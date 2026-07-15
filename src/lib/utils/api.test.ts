import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/i18n/i18n.svelte', () => ({
	i18n: { lang: 'en' }
}));

import { searchData, sortData } from './api';

describe('API data utilities', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('sortData', () => {
		it('sorts strings without mutating the source array', () => {
			const items = [{ title: 'Zulu' }, { title: 'Alpha' }];

			expect(sortData(items, 'title')).toEqual([{ title: 'Alpha' }, { title: 'Zulu' }]);
			expect(items).toEqual([{ title: 'Zulu' }, { title: 'Alpha' }]);
		});

		it('sorts valid dates chronologically rather than lexicographically', () => {
			const items = [{ date: '2025-12-01' }, { date: '2026-01-02' }, { date: '2025-03-10' }];

			expect(sortData(items, 'date', 'desc').map(({ date }) => date)).toEqual([
				'2026-01-02',
				'2025-12-01',
				'2025-03-10'
			]);
		});

		it('places missing values last in both directions', () => {
			const items = [{ title: undefined }, { title: 'Beta' }, { title: 'Alpha' }];

			expect(sortData(items, 'title', 'asc').at(-1)?.title).toBeUndefined();
			expect(sortData(items, 'title', 'desc').at(-1)?.title).toBeUndefined();
		});

		it('sorts numeric values in either direction', () => {
			const items = [{ rank: 2 }, { rank: 10 }, { rank: 1 }];

			expect(sortData(items as any[], 'rank' as any, 'asc').map((item: any) => item.rank)).toEqual([
				1, 2, 10
			]);
			expect(sortData(items as any[], 'rank' as any, 'desc').map((item: any) => item.rank)).toEqual(
				[10, 2, 1]
			);
		});
	});

	describe('searchData', () => {
		const items = [
			{ title: 'Release Notes', tags: ['Svelte', 'API'], year: 2026, published: true },
			{ title: 'Archive', tags: ['history'], year: 2024, published: false }
		];

		it('matches strings case-insensitively', () => {
			expect(searchData(items, 'RELEASE', ['title'])).toEqual([items[0]]);
		});

		it('matches values nested in arrays', () => {
			expect(searchData(items, 'api', ['tags'])).toEqual([items[0]]);
		});

		it('matches numeric values after string conversion', () => {
			expect(searchData(items, '2024', ['year'])).toEqual([items[1]]);
		});

		it('ignores missing and falsy fields without throwing', () => {
			expect(
				searchData(items, 'true', ['published', 'missing' as keyof (typeof items)[number]])
			).toEqual([items[0]]);
		});
	});
});
